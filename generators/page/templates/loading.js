export default ({ pageTitle }) => `
const Loading = () => (
  <div aria-busy="true" aria-live="polite">
    <p>Loading ${pageTitle}…</p>
  </div>
);

export default Loading;
`;