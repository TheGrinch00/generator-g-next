import { nextApiEndpointHandler } from "@/lib/response-handler";

export async function POST(req: Request, ctx: any) {
  return nextApiEndpointHandler("otel-traces")(req, ctx);
}
