import Generator from "yeoman-generator";
import chalk from "chalk";
import yosay from "yosay";
import * as kebabCaseMod from "kebab-case";
import { pascalCase } from "pascal-case";
import {
  getGenygConfigFile,
  requirePackages,
  extendConfigFile,
  extendEnv,
} from "../../common/index.js";
import { camelCase } from "camel-case";
import { snakeCase } from "snake-case";

const kebabCase = kebabCaseMod.kebabCase ?? kebabCaseMod.default ?? kebabCaseMod;

const generateLibSessionFile = ({ cookieRoles, projectName }) => `// this file is a wrapper with defaults to be used in both API routes and \`getServerSideProps\` functions
import type { SessionOptions } from "iron-session";

${cookieRoles
  .map(
    (cookieRole) =>
      `import { ${pascalCase(cookieRole)}Session } from "@/models/server/${pascalCase(cookieRole)}Session";`,
  )
  .join("\n")}

${cookieRoles
  .map(
    (cookieRole) => `
export const ${camelCase(cookieRole)}SessionOptions: SessionOptions = {
  password: process.env.${snakeCase(cookieRole).toUpperCase()}_SECRET_COOKIE_PASSWORD as string,
  cookieName: "${projectName.toLowerCase()}-${kebabCase(cookieRole)}-cookie-auth",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};`,
  )
  .join("\n")}

// This is where we specify the typings of req.session.*
declare module "iron-session" {
  type IronSessionData = ${cookieRoles
    .map((cookieRole) => `${pascalCase(cookieRole)}Session`)
    .join(" | ")};
}
`;

export default class CookieAuthRoleGenerator extends Generator {
  async prompting() {
    // Ensure cookie-auth package installed
    requirePackages(this, ["cookieAuth"]);

    this.log(
      yosay(
        `Welcome to ${chalk.red(
          "generator-g-next",
        )} cookie-role generator. Follow the quick configuration to create new authentication roles!`,
      ),
    );

    const { roleNames } = await this.prompt([
      {
        type: "input",
        name: "roleNames",
        message:
          'What role(s) do you want to add? (you can add several roles at once separated by "," e.g.: admin,user)\n',
        validate: (val) => !!(val && val.trim()) || "Please enter at least one role",
        filter: (val) => (val || "").trim(),
      },
    ]);

    if (!roleNames) {
      this.abort = true;
      return;
    }

    const normalized = roleNames
      .split(",")
      .map((r) => kebabCase(r.trim().split(" ").join("-").toLowerCase()))
      .filter(Boolean);

    if (!normalized.length) {
      this.log(yosay(chalk.red("No valid roles provided.")));
      this.abort = true;
      return;
    }

    this.answers = { roleNames: normalized };
  }

  writing() {
    if (this.abort) return;

    const { roleNames } = this.answers;
    const config = getGenygConfigFile(this) || {};
    const cookieRoles = Array.isArray(config.cookieRoles)
      ? [...config.cookieRoles]
      : [];

    // Generate model + extend env for each new role
    for (const cookieRole of roleNames) {
      if (!cookieRoles.includes(cookieRole)) {
        cookieRoles.push(cookieRole);
        this.fs.copyTpl(
          this.templatePath("index.ejs"),
          this.destinationPath(
            `./src/models/server/${pascalCase(cookieRole)}Session/index.ts`,
          ),
          { cookieRole: pascalCase(cookieRole) },
        );


        // also extend env.local and env.test for this role
        const ROLE_SECRET = `${snakeCase(cookieRole).toUpperCase()}_SECRET_COOKIE_PASSWORD`;
        extendEnv(this, "template", `${ROLE_SECRET}=12345678901234567890123456789012`);
        extendEnv(this, "local", `${ROLE_SECRET}=12345678901234567890123456789012`);
        extendEnv(this, "test", `${ROLE_SECRET}=12345678901234567890123456789012`);

        // Append env key to next.config.options.json (unique)
        const nextOptionsPath = this.destinationPath("next.config.options.json");
        const nextOptions = this.fs.readJSON(nextOptionsPath, {});
        const existing = Array.isArray(nextOptions?.env) ? nextOptions.env : [];
        const mergedEnv = Array.from(new Set([...existing, ROLE_SECRET]));
        this.fs.extendJSON(nextOptionsPath, { env: mergedEnv });
      }

      
    }

    // Persist updated cookieRoles
    extendConfigFile(this, { cookieRoles });

    // Generate src/lib/session/index.ts
    const pkg = this.fs.readJSON(this.destinationPath("./package.json"), {});
    const projectName = (pkg.name || "app").toString();

    this.fs.write(
      this.destinationPath("./src/lib/session/index.ts"),
      generateLibSessionFile({ cookieRoles, projectName }),
    );
  }
};
