import {
  ResponseHandler,
  StatusCodes,
  buildRunner,
} from "@/lib/response-handler";
import type { ErrorResponse } from "@/lib/response-handler";
import { PostOtelTracesApi } from "./interfaces";
import {
  queryStringParametersSchema,
  pathParametersSchema,
  payloadSchema,
} from "./validations";
import { createFrontendTraceSpans } from "@/lib/otel/trace";

export default buildRunner<
  PostOtelTracesApi.QueryStringParameters,
  PostOtelTracesApi.PathParameters,
  PostOtelTracesApi.Payload,
  PostOtelTracesApi.EndpointResponse
>(
  {
    query: queryStringParametersSchema,
    path: pathParametersSchema,
    payload: payloadSchema,
  },
  async ({ res, validationResult, payload, trace }) => {
    if (!validationResult.isValid) {
      return ResponseHandler.json<ErrorResponse>(
        res,
        { message: validationResult.message ?? "Bad Request" },
        StatusCodes.BadRequest,
      );
    }

    const { flowName, events, attributes } = payload;

    trace.setAttribute("frontend.flow_name", flowName);
    trace.setAttribute("frontend.event_count", events.length);

    const result = createFrontendTraceSpans(flowName, events, attributes);

    trace.setAttribute("frontend.trace_id", result.traceId);

    return ResponseHandler.json<PostOtelTracesApi.SuccessResponse>(
      res,
      { traceparent: result.traceparent, traceId: result.traceId },
      StatusCodes.OK,
    );
  },
);
