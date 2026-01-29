export default (apiNameCapital, urlParams, hasPayload) => {
  const hasPathParams = urlParams && urlParams.length > 0;

  return `import { z } from "zod";

export const queryStringParametersSchema = z.object({});
${
  hasPathParams
    ? `
export const pathParametersSchema = z.object({
${urlParams.map((p) => `  ${p}: z.string(),`).join("\n")}
});
`
    : ""
}${
    hasPayload
      ? `
export const payloadSchema = z.object({});
`
      : ""
  }`;
};
