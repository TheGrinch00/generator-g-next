export default ({ pageTitle }) => `
"use client";

const Error = (
  { error, reset }: { error: Error & { digest?: string }; reset: () => void }
) => (
  <div role="alert">
    <h2>Something went wrong on ${pageTitle}.</h2>
    <pre style={{ whiteSpace: "pre-wrap" }}>{error.message}</pre>
    <button onClick={() => reset()}>Try again</button>
  </div>
);

export default Error;
`;
