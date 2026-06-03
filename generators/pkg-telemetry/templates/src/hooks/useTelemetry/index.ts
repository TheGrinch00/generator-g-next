import { useRef, useCallback } from "react";
import {
  type FrontendEvent,
  type FlushResult,
  flushEvents,
} from "@/lib/otel/client";

export interface UseTelemetryResult {
  /** Record a named event with optional attributes. */
  recordEvent: (
    name: string,
    attrs?: Record<string, string | number | boolean>,
    options?: {
      duration?: number;
      status?: "ok" | "error";
      statusMessage?: string;
    },
  ) => void;
  /** Set an attribute on the root flow span. */
  setAttribute: (key: string, value: string | number | boolean) => void;
  /**
   * Flush all collected events to the backend.
   * Returns traceparent + traceId for use in subsequent API calls.
   */
  flush: () => Promise<FlushResult>;
  /** Get trace headers if a flush has already happened. Returns {} if not flushed yet. */
  getTraceHeaders: () => Record<string, string>;
  /** The traceId returned by the last flush, or null. */
  getTraceId: () => string | null;
}

export function useTelemetry(flowName: string): UseTelemetryResult {
  const eventsRef = useRef<FrontendEvent[]>([]);
  const attributesRef = useRef<Record<string, string | number | boolean>>({});
  const traceparentRef = useRef<string | null>(null);
  const traceIdRef = useRef<string | null>(null);

  const recordEvent = useCallback(
    (
      name: string,
      attrs?: Record<string, string | number | boolean>,
      options?: {
        duration?: number;
        status?: "ok" | "error";
        statusMessage?: string;
      },
    ) => {
      eventsRef.current.push({
        name,
        attributes: attrs,
        timestamp: Date.now(),
        duration: options?.duration,
        status: options?.status,
        statusMessage: options?.statusMessage,
      });
    },
    [],
  );

  const setAttribute = useCallback(
    (key: string, value: string | number | boolean) => {
      attributesRef.current[key] = value;
    },
    [],
  );

  const flush = useCallback(async (): Promise<FlushResult> => {
    const events = [...eventsRef.current];
    const attributes = { ...attributesRef.current };
    eventsRef.current = [];

    const result = await flushEvents(flowName, events, attributes);
    traceparentRef.current = result.traceparent;
    traceIdRef.current = result.traceId;
    return result;
  }, [flowName]);

  const getTraceHeaders = useCallback((): Record<string, string> => {
    if (!traceparentRef.current) return {};
    return { traceparent: traceparentRef.current };
  }, []);

  const getTraceId = useCallback(() => traceIdRef.current, []);

  return {
    recordEvent,
    setAttribute,
    flush,
    getTraceHeaders,
    getTraceId,
  };
}
