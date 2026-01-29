export default (endpointRoutePath) => `import { nextApiEndpointHandler } from "@/lib/response-handler";

export async function GET(req: Request, ctx: any) {
  return nextApiEndpointHandler("${endpointRoutePath}")(req, ctx);
}

export async function POST(req: Request, ctx: any) {
  return nextApiEndpointHandler("${endpointRoutePath}")(req, ctx);
}

export async function PATCH(req: Request, ctx: any) {
  return nextApiEndpointHandler("${endpointRoutePath}")(req, ctx);
}

export async function PUT(req: Request, ctx: any) {
  return nextApiEndpointHandler("${endpointRoutePath}")(req, ctx);
}

export async function DELETE(req: Request, ctx: any) {
  return nextApiEndpointHandler("${endpointRoutePath}")(req, ctx);
}
`;
