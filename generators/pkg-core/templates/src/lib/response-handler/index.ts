import { StatusCodes } from "./interfaces";
import { z } from "zod";

function getFirstZodIssueMessage(err: any): string {
  if (!err) return "Validation error";
  const queue: any[] = Array.isArray(err.issues) ? [...err.issues] : [];
  while (queue.length) {
    const issue = queue.shift();
    if (!issue) continue;
    if (issue.unionErrors && Array.isArray(issue.unionErrors)) {
      for (const ue of issue.unionErrors) {
        if (ue && Array.isArray(ue.issues)) queue.unshift(...ue.issues);
      }
    }
    if (issue.subErrors && Array.isArray(issue.subErrors)) {
      queue.unshift(...issue.subErrors);
    }
    if (typeof issue.message === "string" && issue.message.trim()) {
      return issue.message;
    }
  }
  return "Validation error";
}

export type WebAdapterInput = {
  res: Response;
  query: Record<string, any>;
  pathParams: Record<string, string>;
  body: any;
  headers: Record<string, string>;
  req: Request;
};

export type EndpointFn = (input: WebAdapterInput) =>
  | Promise<Response>
  | Response
  | Promise<{
      payload: any;
      statusCode: number;
      headers?: Record<string, string>;
      req: Request;
    }>
  | {
      payload: any;
      statusCode: number;
      headers?: Record<string, string>;
      req: Request;
    };

export interface ValidationObjects {
  queryStringParameters?: z.ZodTypeAny;
  pathParameters?: z.ZodTypeAny;
  payload?: z.ZodTypeAny;
}

class ResponseHandler {
  static json<T>(res: Response, payload: T, statusCode = StatusCodes.OK) {
    const headers = new Headers(res.headers);
    headers.set("content-type", "application/json");

    return new Response(JSON.stringify(payload), {
      status: statusCode,
      headers: headers,
    });
  }
}

class TestHandler {
  /**
   * Invoke an endpoint by legacy id, e.g. "post-admin-users".
   * It imports ../../endpoints/admin/login/index and calls the named export `post`.
   */
  static async invokeLambda<T>(
    handlerPath: string,
    params?: {
      headers?: Record<string, string>;
      queryString?: Record<string, any>;
      pathParameters?: Record<string, string>;
      payload?: any; // can be object or JSON string
    },
  ): Promise<{ payload: T; statusCode: StatusCodes }> {
    // Expect format: `${method}-${routeBaseDashed}` e.g. "post-admin-users"
    const [methodRaw, ...rest] = handlerPath.split("-");
    if (!methodRaw || rest.length === 0) {
      throw new Error(
        `Invalid handlerPath '${handlerPath}'. Expected '<method>-<route>' e.g. 'post-admin-users'.`,
      );
    }

    // Normalize inputs
    const headers: Record<string, string> = {
      "content-type": "application/json",
      ...(params?.headers ?? {}),
    };

    let body: any = params?.payload;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        /* keep as string */
      }
    }

    const query = params?.queryString ?? {};
    const pathParams = params?.pathParameters ?? {};

    // Import endpoint module by base route and invoke method
    const endpoint = await import(`../../endpoints/${handlerPath}/handler`);
    const handler = endpoint.default as
      | undefined
      | ((input: WebAdapterInput) =>
          | Promise<Response>
          | Response
          | Promise<{
              payload: any;
              statusCode: number;
              headers?: Record<string, string>;
            }>
          | {
              payload: any;
              statusCode: number;
              headers?: Record<string, string>;
            });

    if (typeof handler !== "function") {
      throw new Error(`Endpoint '${handlerPath}' does not exist`);
    }

    const fake = new Request("http://localhost/test", {
      method: methodRaw.toUpperCase(),
      headers: headers as any,
      body: typeof body === "string" ? body : JSON.stringify(body ?? {}),
    });

    const res = new Response();

    const result = await handler({
      res,
      query,
      pathParams,
      body,
      headers,
      req: fake,
    });
    if (result instanceof Response) {
      const statusCode = result.status as StatusCodes;
      const payload = (await result
        .clone()
        .json()
        .catch(() => ({}))) as T;
      return { payload, statusCode };
    }
    const { payload, statusCode } = result as {
      payload: T;
      statusCode: StatusCodes;
    };
    return { payload, statusCode };
  }
}

export function buildRunner<Q, PP, P, R>(
  schemas: {
    query?: z.ZodTypeAny;
    path?: z.ZodTypeAny;
    payload?: z.ZodTypeAny;
  },
  handler: (input: {
    res: Response;
    validationResult: {
      isValid: boolean;
      message?: string;
      queryStringParametersErrors?: unknown;
      pathParametersErrors?: unknown;
      payloadErrors?: unknown;
    };
    queryStringParameters: Q;
    pathParameters: PP;
    payload: P;
    headers: Record<string, string>;
    req: Request;
  }) => Promise<Response>,
) {
  return async (raw: WebAdapterInput) => {
    let q: any = raw.query ?? {};
    let pp: any = raw.pathParams ?? {};
    let p: any = raw.body ?? {};

    const validationResult = { isValid: true } as {
      isValid: boolean;
      message?: string;
      queryStringParametersErrors?: unknown;
      pathParametersErrors?: unknown;
      payloadErrors?: unknown;
    };

    if (schemas.query) {
      const r = schemas.query.safeParse(q);
      if (!r.success) {
        validationResult.isValid = false;
        validationResult.message = getFirstZodIssueMessage(r.error);
        validationResult.queryStringParametersErrors = r.error;
      } else q = r.data;
    }
    if (schemas.path) {
      const r = schemas.path.safeParse(pp);
      if (!r.success) {
        validationResult.isValid = false;
        validationResult.message = getFirstZodIssueMessage(r.error);
        validationResult.pathParametersErrors = r.error;
      } else pp = r.data;
    }
    if (schemas.payload) {
      const r = schemas.payload.safeParse(p);
      if (!r.success) {
        validationResult.isValid = false;
        validationResult.message = getFirstZodIssueMessage(r.error);
        validationResult.payloadErrors = r.error;
      } else p = r.data;
    }

    let res = new Response();

    return handler({
      res,
      validationResult,
      queryStringParameters: q as Q,
      pathParameters: pp as PP,
      payload: p as P,
      headers: raw.headers,
      req: raw.req,
    });
  };
}

async function parseBody(req: Request): Promise<any> {
  const contentType = req.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      return await req.clone().json();
    }
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await req.clone().formData();
      return Object.fromEntries(Array.from(form.entries()));
    }
    if (contentType.includes("text/plain")) {
      return await req.clone().text();
    }
    try {
      return await req.clone().json();
    } catch {
      const txt = await req.clone().text();
      return txt ? txt : {};
    }
  } catch {
    return {};
  }
}

function collectHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    headers[k.toLowerCase()] = v; // normalize keys
  });
  return headers;
}

export const nextApiEndpointHandler =
  (routeBase: string) =>
  async (
    req: Request,
    ctx?: { params?: Promise<Record<string, string>> | Record<string, string> },
  ): Promise<Response> => {
    try {
      const method = req.method?.toLowerCase();
      if (!method)
        return new Response(null, { status: StatusCodes.MethodNotAllowed });

      if (method === "options") {
        return new Response("{}", {
          status: StatusCodes.OK,
          headers: { "content-type": "application/json" },
        });
      }

      // Parse URL/query
      const url = new URL(req.url);
      const query: Record<string, string> = {};
      url.searchParams.forEach((v, k) => {
        query[k] = v;
      });

      // Parse path params (Next.js 15+ returns a Promise)
      const pathParams: Record<string, string> = ctx?.params
        ? typeof (ctx.params as any).then === "function"
          ? await ctx.params
          : (ctx.params as Record<string, string>)
        : {};

      // Parse body & headers
      const body = await parseBody(req);
      const headers = collectHeaders(req);

      // Import endpoint module by base route and dispatch by named export
      const m = method as "get" | "post" | "put" | "patch" | "delete";
      const endpoint = await import(
        `../../endpoints/${m}-${routeBase}/handler`
      );

      // This is the handler function
      const handler = (endpoint.default ?? endpoint[m]) as
        | EndpointFn
        | undefined;
      if (typeof handler !== "function") {
        return new Response("{}", {
          status: StatusCodes.MethodNotAllowed,
          headers: { "content-type": "application/json" },
        });
      }

      const res = new Response();

      const result = await handler({
        res,
        query,
        pathParams,
        body,
        headers,
        req,
      });
      if (result instanceof Response) {
        return result; // forward full Response (e.g., iron-session Set-Cookie)
      }
      const { payload, statusCode, headers: extra } = result ?? {};
      const resHeaders = new Headers({ "content-type": "application/json" });
      if (extra) {
        for (const [k, v] of Object.entries(extra)) resHeaders.set(k, v);
      }
      return new Response(JSON.stringify(payload ?? {}), {
        status: statusCode ?? StatusCodes.OK,
        headers: resHeaders,
      });
    } catch (e) {
      console.error(e);
      return new Response("{}", {
        status: StatusCodes.InternalServerError,
        headers: { "content-type": "application/json" },
      });
    }
  };

export * from "./interfaces";
export { ResponseHandler, TestHandler };
