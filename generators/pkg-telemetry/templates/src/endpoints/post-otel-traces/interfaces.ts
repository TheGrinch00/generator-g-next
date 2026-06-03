import { ErrorResponse, RequestI } from "@/lib/response-handler";
import { z } from "zod";
import {
  queryStringParametersSchema,
  pathParametersSchema,
  payloadSchema,
} from "./validations";

export namespace PostOtelTracesApi {
  export type QueryStringParameters = z.infer<
    typeof queryStringParametersSchema
  >;
  export type PathParameters = z.infer<typeof pathParametersSchema>;
  export type Payload = z.infer<typeof payloadSchema>;

  export type SuccessResponse = {
    traceparent: string;
    traceId: string;
  };

  export type EndpointResponse = SuccessResponse | ErrorResponse;

  export interface Request
    extends RequestI<QueryStringParameters, PathParameters, Payload> {}
}
