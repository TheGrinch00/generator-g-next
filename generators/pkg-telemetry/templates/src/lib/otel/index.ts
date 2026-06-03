import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import {
  BasicTracerProvider,
  BatchSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import type { Tracer } from "@opentelemetry/api";

let sdk: NodeSDK | null = null;
let frontendTracer: Tracer | null = null;

const serviceName = process.env.npm_package_name ?? "next-app";

function createExporter() {
  const axiomToken = process.env.AXIOM_API_TOKEN;
  const axiomDataset = process.env.AXIOM_DATASET;
  const axiomUrl =
    process.env.AXIOM_OTLP_URL ?? "https://api.axiom.co/v1/traces";

  return new OTLPTraceExporter({
    url: axiomUrl,
    headers: {
      Authorization: `Bearer ${axiomToken ?? ""}`,
      "X-Axiom-Dataset": axiomDataset ?? serviceName,
    },
  });
}

/**
 * Tracer for frontend spans created server-side.
 * Uses a separate TracerProvider so spans get a "-frontend" service name.
 */
export function getFrontendTracer(): Tracer {
  if (frontendTracer) return frontendTracer;

  const provider = new BasicTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: `${serviceName}-frontend`,
      [ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? "0.1.0",
    }),
    spanProcessors: [new BatchSpanProcessor(createExporter())],
  });

  frontendTracer = provider.getTracer(`${serviceName}-frontend`);
  return frontendTracer;
}

export function initOtel() {
  if (sdk) return;

  if (!process.env.AXIOM_API_TOKEN) {
    console.warn(
      "[otel] AXIOM_API_TOKEN not set — traces will not be exported",
    );
  }

  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: `${serviceName}-backend`,
      [ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? "0.1.0",
    }),
    traceExporter: createExporter(),
    instrumentations: [new HttpInstrumentation()],
  });

  sdk.start();
  console.log("[otel] SDK started");

  process.on("SIGTERM", () => {
    sdk
      ?.shutdown()
      .then(() => console.log("[otel] SDK shut down"))
      .catch((err) => console.error("[otel] Shutdown error", err))
      .finally(() => process.exit(0));
  });
}
