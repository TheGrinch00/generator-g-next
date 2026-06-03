/**
 * No-op tracing stub.
 *
 * Replaced by the real OpenTelemetry implementation when the `pkg-telemetry`
 * generator is installed. Until then, every call here is a no-op so the rest
 * of the codebase (response-handler, generated endpoint handlers) can depend
 * on `TraceContext` without pulling in `@opentelemetry/*` packages.
 */

type Attribute = string | number | boolean;

const noopFn = () => {};
const noopSetAttribute = (_key: string, _value: Attribute) => {};
const noopFail = (_message: string) => {};

export interface ManualStep {
  setAttribute: (key: string, value: Attribute) => void;
  fail: (message: string) => void;
  step: StepFn;
  startStep: (name: string) => ManualStep;
  end: () => void;
}

export interface StepContext {
  setAttribute: (key: string, value: Attribute) => void;
  fail: (message: string) => void;
  step: StepFn;
  startStep: (name: string) => ManualStep;
}

export type StepFn = <T>(
  name: string,
  fn: (stepCtx: StepContext) => Promise<T>,
) => Promise<T>;

export interface TraceContext {
  setAttribute: (key: string, value: Attribute) => void;
  step: StepFn;
  startStep: (name: string) => ManualStep;
}

function createNoopManualStep(): ManualStep {
  return {
    setAttribute: noopSetAttribute,
    fail: noopFail,
    step: noopStepFn,
    startStep: createNoopManualStep,
    end: noopFn,
  };
}

const noopStepFn: StepFn = async (_name, fn) =>
  fn({
    setAttribute: noopSetAttribute,
    fail: noopFail,
    step: noopStepFn,
    startStep: createNoopManualStep,
  });

export function createTraceContext(
  _headers: Record<string, string>,
  _spanName: string,
): TraceContext {
  return {
    setAttribute: noopSetAttribute,
    step: noopStepFn,
    startStep: createNoopManualStep,
  };
}

export function endTraceContext(
  _traceCtx: TraceContext,
  _error?: unknown,
  _errorMessage?: string,
) {
  // no-op
}
