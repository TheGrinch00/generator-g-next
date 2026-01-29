export default ({ PageName, pageTitle, paramType, useClient = false }) => `
${useClient ? `"use client";\n\n` : ""}type Params = ${paramType};

const ${PageName}Page = async ({ params }: { params: Params }) => {
  return (
    <>
      <h1>${pageTitle}</h1>
    </>
  );
};

export default ${PageName}Page;
`;