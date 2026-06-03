export default (
  apiNamePC,
  apiActionRoute,
  routePath,
  methodUC,
  urlParams,
  withTelemetry = false,
) => `${
  withTelemetry
    ? `/**
 * Tracing enabled.
 *
 * To link this call to a frontend flow, pass trace headers from useTelemetry:
 *
 *   const telemetry = useTelemetry("my-flow");
 *   telemetry.recordEvent("user-clicked-submit");
 *   await telemetry.flush();
 *   dispatch(actions.${apiNamePC[0].toLowerCase() + apiNamePC.slice(1)}.request(
 *     params,
 *     { requestDelay: 0, traceHeaders: telemetry.getTraceHeaders() },
 *   ));
 */
`
    : ""
}import {
  apiActionBuilder,
  apiRequestPayloadBuilder,
  ApiRequestPayloadBuilderOptions,
  ApiSuccessAction,
  ApiFailAction,
  HttpMethod
} from '../api-builder'

export interface ${apiNamePC}Params {${urlParams ? urlParams.map(p => `\n  ${p}: string,`).join('\n') + '\n' : ''}}
export interface ${apiNamePC}ResponseData {}
export default apiActionBuilder<
  ${apiNamePC}Params,
  ApiSuccessAction<${apiNamePC}ResponseData, ${apiNamePC}Params>,
  ApiFailAction<${apiNamePC}Params>
>(
  "${apiActionRoute}",
  (
    params: ${apiNamePC}Params,
    options?: ApiRequestPayloadBuilderOptions
  ) => ({
    payload: apiRequestPayloadBuilder<${apiNamePC}Params>(
      {
        path: ${routePath},
        method: HttpMethod.${methodUC},
      },
      options,
      params,
    ),
  })
);
`
