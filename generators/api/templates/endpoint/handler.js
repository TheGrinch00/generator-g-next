export default (
  apiNameCapital,
  hasPayload,
  useCookieAuth,
  capitalizedCookieRole,
  urlParams,
) => {
  // Normalize capitalizedCookieRole to have first letter uppercase
  const roleName =
    capitalizedCookieRole.charAt(0).toUpperCase() +
    capitalizedCookieRole.slice(1);
  const roleType = `${roleName}Session`;
  const roleOptionsVar = `${capitalizedCookieRole}SessionOptions`;
  const hasPathParams = urlParams && urlParams.length > 0;

  const schemaImports = [
    "queryStringParametersSchema",
    hasPathParams && "pathParametersSchema",
    hasPayload && "payloadSchema",
  ]
    .filter(Boolean)
    .join(", ");

  const buildRunnerSchemas = [
    "query: queryStringParametersSchema",
    hasPathParams && "path: pathParametersSchema",
    hasPayload && "payload: payloadSchema",
  ]
    .filter(Boolean)
    .join(", ");

  const handlerParams = [
    "res",
    "req",
    "validationResult",
    hasPayload && "payload",
    "queryStringParameters",
    hasPathParams && "pathParameters",
  ]
    .filter(Boolean)
    .join(", ");

  return `import { ResponseHandler, StatusCodes, buildRunner } from "@/lib/response-handler";
import type { ErrorResponse } from "@/lib/response-handler";
import { ${apiNameCapital}Api } from "./interfaces";
import { ${schemaImports} } from "./validations";
${
  useCookieAuth
    ? `import { getIronSession } from "iron-session";
import { ${roleOptionsVar} } from "@/lib/session";
import { ${roleType} } from "@/models/server/${roleType}";`
    : ``
}

// Auto-generated endpoint handler
export default buildRunner<
  ${apiNameCapital}Api.QueryStringParameters,
  ${apiNameCapital}Api.PathParameters,
  ${apiNameCapital}Api.Payload,
  ${apiNameCapital}Api.EndpointResponse
>(
  { ${buildRunnerSchemas} },
  async ({ ${handlerParams} }) => {
    try {
${
  useCookieAuth
    ? `      // Cookie auth (${roleName})
      const session = await getIronSession<${roleType}>(req, res, ${roleOptionsVar});
      if (!session?.isLoggedIn) {
        return ResponseHandler.json<ErrorResponse>(
          res,
          { message: "Unauthorized" },
          StatusCodes.Unauthorized,
        );
      }
`
    : ``
}
      if (!validationResult.isValid) {
        return ResponseHandler.json<ErrorResponse>(
          res,
          {
            message: validationResult.message ?? "Bad Request",
          },
          StatusCodes.BadRequest,
        );
      }

      // TODO: implement business logic

      return ResponseHandler.json<${apiNameCapital}Api.SuccessResponse>(
        res,
        {},
        StatusCodes.OK,
      );
    } catch (err: any) {
      console.error("${apiNameCapital} endpoint failed:", err);

      return ResponseHandler.json<ErrorResponse>(
        res,
        {
          message: "Internal server error",
        },
        StatusCodes.InternalServerError,
      );
    }
  },
);
`;
};
