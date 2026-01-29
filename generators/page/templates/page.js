export default ({ PageName, pageTitle, useClient = false }) => `
${useClient ? `"use client";\n\n` : ""}const ${PageName}Page = async () => {
  return (
    <>
      <h1>${pageTitle}</h1>
    </>
  );
};

export default ${PageName}Page;
`;