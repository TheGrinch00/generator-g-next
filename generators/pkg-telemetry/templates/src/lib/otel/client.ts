/**
 * Browser-side event collector.
 * No OTEL SDK in the browser — events are plain objects
 * sent to /api/otel/traces where the backend creates real OTEL spans.
 */

export interface FrontendEvent {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  timestamp: number;
  duration?: number;
  status?: "ok" | "error";
  statusMessage?: string;
}

export interface FlushResult {
  traceparent: string;
  traceId: string;
}

/**
 * Send collected events to the backend which creates OTEL spans
 * and returns a traceparent for linking subsequent API calls.
 */
export async function flushEvents(
  flowName: string,
  events: FrontendEvent[],
  attributes?: Record<string, string | number | boolean>,
): Promise<FlushResult> {
  const res = await fetch("/api/otel/traces", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ flowName, events, attributes }),
  });

  if (!res.ok) {
    throw new Error(`Failed to flush telemetry events: ${res.status}`);
  }

  return res.json();
}
