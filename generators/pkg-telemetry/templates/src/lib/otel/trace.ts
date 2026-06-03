import {
  trace,
  context,
  ROOT_CONTEXT,
  SpanStatusCode,
  type Span,
} from "@opentelemetry/api";
import { getFrontendTracer } from "./index";

const getTracer = () => trace.getTracer("asl-defibrillators-backend");

export interface ManualStep {
  span: Span;
  setAttribute: (key: string, value: string | number | boolean) => void;
  /** Mark as controlled error. */
  fail: (message: string) => void;
  /** Create a child of this step (callback-based). */
  step: StepFn;
  /** Create a child of this step (manual — call end() when done). */
  startStep: (name: string) => ManualStep;
  /** End the span. Call this when you're done. */
  end: () => void;
}

export interface StepContext {
  span: Span;
  setAttribute: (key: string, value: string | number | boolean) => void;
  /** Mark this step as a controlled error without throwing. */
  fail: (message: string) => void;
  /** Create a child span nested under this step (callback-based). */
  step: StepFn;
  /** Create a child span (manual — call end() when done). */
  startStep: (name: string) => ManualStep;
}

export type StepFn = <T>(
  name: string,
  fn: (stepCtx: StepContext) => Promise<T>,
) => Promise<T>;

export interface TraceContext {
  span: Span;
  setAttribute: (key: string, value: string | number | boolean) => void;
  /** Create a child span (callback-based, auto-ends). */
  step: StepFn;
  /**
   * Create a child span (manual, sequential).
   * Call end() when done.
   *
   *   const auth = trace.startStep("authenticate");
   *   const user = await verifyToken(token);
   *   auth.setAttribute("user.id", user.id);
   *   auth.end();
   *
   *   const payment = trace.startStep("process-payment");
   *   const card = payment.startStep("validate-card");
   *   await validateCard(cardNumber);
   *   card.end();
   *   payment.end();
   */
  startStep: (name: string) => ManualStep;
}

function createChildSpan(parentSpan: Span, name: string): Span {
  const childCtx = trace.setSpanContext(context.active(), {
    traceId: parentSpan.spanContext().traceId,
    spanId: parentSpan.spanContext().spanId,
    traceFlags: parentSpan.spanContext().traceFlags,
    isRemote: false,
  });
  return getTracer().startSpan(name, {}, childCtx);
}

function createManualStep(parentSpan: Span, name: string): ManualStep {
  const childSpan = createChildSpan(parentSpan, name);
  let failed = false;

  return {
    span: childSpan,
    setAttribute: (key, value) => childSpan.setAttribute(key, value),
    fail: (message) => {
      failed = true;
      childSpan.setStatus({ code: SpanStatusCode.ERROR, message });
    },
    step: createStepFn(childSpan),
    startStep: (childName) => createManualStep(childSpan, childName),
    end: () => {
      if (!failed) {
        childSpan.setStatus({ code: SpanStatusCode.OK });
      }
      childSpan.end();
    },
  };
}

function createStepFn(parentSpan: Span): StepFn {
  return async (name, fn) => {
    const childSpan = createChildSpan(parentSpan, name);

    let failed = false;

    try {
      const result = await fn({
        span: childSpan,
        setAttribute: (key, value) => childSpan.setAttribute(key, value),
        fail: (message: string) => {
          failed = true;
          childSpan.setStatus({
            code: SpanStatusCode.ERROR,
            message,
          });
        },
        step: createStepFn(childSpan),
        startStep: (childName) => createManualStep(childSpan, childName),
      });
      if (!failed) {
        childSpan.setStatus({ code: SpanStatusCode.OK });
      }
      childSpan.end();
      return result;
    } catch (err) {
      childSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message: err instanceof Error ? err.message : String(err),
      });
      if (err instanceof Error) {
        childSpan.recordException(err);
      }
      childSpan.end();
      throw err;
    }
  };
}

/**
 * Create a trace context for an API handler.
 *
 * If the request has a `traceparent` header (from the frontend OTEL SDK),
 * HttpInstrumentation will have already created a parent span.
 * Our HANDLER span becomes a child of that automatically via context.active().
 */
export function createTraceContext(
  _headers: Record<string, string>,
  spanName: string,
): TraceContext {
  const span = getTracer().startSpan(`HANDLER ${spanName}`);

  return {
    span,
    setAttribute: (key, value) => span.setAttribute(key, value),
    step: createStepFn(span),
    startStep: (name: string) => createManualStep(span, name),
  };
}

/**
 * End the trace context.
 *
 * @param error - For unhandled exceptions (thrown errors), pass the Error object.
 *                This records an exception event on the span.
 * @param errorMessage - For controlled errors (HTTP 4xx/5xx, business logic),
 *                       pass a message string. This marks the span as ERROR
 *                       without recording an exception.
 */
export function endTraceContext(
  traceCtx: TraceContext,
  error?: unknown,
  errorMessage?: string,
) {
  if (error) {
    traceCtx.span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof Error) {
      traceCtx.span.recordException(error);
    }
  } else if (errorMessage) {
    traceCtx.span.setStatus({
      code: SpanStatusCode.ERROR,
      message: errorMessage,
    });
  } else {
    traceCtx.span.setStatus({ code: SpanStatusCode.OK });
  }
  traceCtx.span.end();
}

// ─── Frontend trace creation ────────────────────────────────────

export interface FrontendEventInput {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  timestamp?: number;
  duration?: number;
  status?: "ok" | "error";
  statusMessage?: string;
}

export interface FrontendTraceResult {
  traceparent: string;
  traceId: string;
}

/**
 * Create OTEL spans from frontend events and return a traceparent string.
 *
 * Creates a root "FRONTEND {flowName}" span with child spans for each event.
 * The returned traceparent can be sent back to the browser so subsequent
 * API calls are linked to the same trace.
 */
export function createFrontendTraceSpans(
  flowName: string,
  events: FrontendEventInput[],
  rootAttributes?: Record<string, string | number | boolean>,
): FrontendTraceResult {
  const tracer = getFrontendTracer();

  // 1. Thin root span — the umbrella for the entire user journey.
  //    Both frontend events and subsequent backend calls are siblings under it.
  const rootSpan = tracer.startSpan(flowName, {}, ROOT_CONTEXT);

  if (rootAttributes) {
    for (const [key, value] of Object.entries(rootAttributes)) {
      rootSpan.setAttribute(key, value);
    }
  }

  const rootCtx = trace.setSpan(ROOT_CONTEXT, rootSpan);

  // 2. Frontend group span — wraps all browser events as a single phase.
  const frontendSpan = tracer.startSpan(`FRONTEND ${flowName}`, {}, rootCtx);
  frontendSpan.setAttribute("span.origin", "frontend");

  const frontendCtx = trace.setSpan(ROOT_CONTEXT, frontendSpan);

  // 3. One child span per frontend event, under the frontend group.
  for (const event of events) {
    const startTime = event.timestamp ? new Date(event.timestamp) : undefined;
    const childSpan = tracer.startSpan(event.name, { startTime }, frontendCtx);
    childSpan.setAttribute("span.origin", "frontend");

    if (event.attributes) {
      for (const [key, value] of Object.entries(event.attributes)) {
        childSpan.setAttribute(key, value);
      }
    }

    if (event.status === "error") {
      childSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message: event.statusMessage,
      });
    } else {
      childSpan.setStatus({ code: SpanStatusCode.OK });
    }

    if (event.duration && event.timestamp) {
      childSpan.end(new Date(event.timestamp + event.duration));
    } else {
      childSpan.end();
    }
  }

  frontendSpan.setStatus({ code: SpanStatusCode.OK });
  frontendSpan.end();

  // Don't end rootSpan yet conceptually, but OTEL requires it.
  // The traceparent points to rootSpan, so subsequent API calls
  // become siblings of frontendSpan under the same root.
  rootSpan.setStatus({ code: SpanStatusCode.OK });
  rootSpan.end();

  // 4. Build traceparent pointing to the ROOT (not the frontend span).
  const { traceId, spanId, traceFlags } = rootSpan.spanContext();
  const flags = (traceFlags & 0xff).toString(16).padStart(2, "0");
  const traceparent = `00-${traceId}-${spanId}-${flags}`;

  return { traceparent, traceId };
}
