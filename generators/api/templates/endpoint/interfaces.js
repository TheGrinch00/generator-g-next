export default (apiNameCapital, urlParams, hasPayload) => {
  const hasPathParams = urlParams && urlParams.length > 0;

  return `import { ErrorResponse, RequestI } from "@/lib/response-handler";
import { z } from "zod";
import { queryStringParametersSchema${hasPathParams ? ", pathParametersSchema" : ""}${hasPayload ? ", payloadSchema" : ""} } from "./validations";

export namespace ${apiNameCapital}Api {
  export type QueryStringParameters = z.infer<typeof queryStringParametersSchema>;
  export type PathParameters = ${hasPathParams ? "z.infer<typeof pathParametersSchema>" : "never"};
  export type Payload = ${hasPayload ? `z.infer<typeof payloadSchema>` : "never"};

  export type SuccessResponse = {
    message?: string;
  };

  export type EndpointResponse = SuccessResponse | ErrorResponse;

  export interface Request extends RequestI<QueryStringParameters, PathParameters, Payload> {}
}
`;
};
