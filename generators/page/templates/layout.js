export default ({ PageName, pageTitle }) => `
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "${pageTitle}",
  description: "",
};

const ${PageName}Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default ${PageName}Layout;
`;