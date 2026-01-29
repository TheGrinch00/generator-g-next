import Generator from "yeoman-generator";
import chalk from "chalk";
import yosay from "yosay";
import {
  getGenygConfigFile,
  extendConfigFile,
  requirePackages,
  extendEnv,
} from "../../common/index.js";

export default class PostgresqlGenerator extends Generator {
  async prompting() {
    // Ensure core package exists in workspace
    requirePackages(this, ["core"]);

    this.log(
      yosay(
        `Hi! Welcome to the official ${chalk.blue(
          "Getapper NextJS Yeoman Generator (GeNYG)",
        )}. ${chalk.red(
          "This command must be executed only once, and it will install all PostgreSQL (Neon) dependencies and scaffolding.",
        )}`,
      ),
    );

    const { accept } = await this.prompt([
      {
        type: "confirm",
        name: "accept",
        message: "Are you sure to proceed?",
        default: true,
      },
    ]);

    if (!accept) {
      this.abort = true;
    }
  }

  writing() {
    if (this.abort) return;

    // Guard: do not install twice
    const configFile = getGenygConfigFile(this) || {};
    if (configFile.packages && configFile.packages.postgresql) {
      this.log(
        yosay(
          chalk.red(
            "It looks like the GeNYG PostgreSQL deps were already installed!",
          ),
        ),
      );
      this.abort = true;
      return;
    }

    // Dependencies (Neon serverless Postgres driver)
    this.packageJson.merge({
      dependencies: {
        "@neondatabase/serverless": "1.0.0",
        "drizzle-orm": "0.44.2",
        pg: "8.14.1",
        ws: "8.18.1",
      },
      devDependencies: {
        "@types/pg": "8.11.11",
        "@types/qs": "6.14.0",
        "@types/ws": "8.18.1",
        "drizzle-kit": "0.31.1",
      },
    });

    extendEnv(
      this,
      "local",
      `DATABASE_URL=postgres://[user]:[password]@[]:[port]/[db]`,
    );
    extendEnv(
      this,
      "test",
      `DATABASE_URL=postgres://[user]:[password]@[]:[port]/[db]`,
    );
    extendEnv(
      this,
      "template",
      `DATABASE_URL=postgres://[user]:[password]@[]:[port]/[db]`,
    );

    // Copy PostgreSQL lib files
    this.fs.copy(this.templatePath(), this.destinationRoot());

    // Append env keys to next.config.options.json (merge unique)
    const nextOptionsPath = this.destinationPath("next.config.options.json");
    const nextConfigOptionsJson = this.fs.readJSON(nextOptionsPath, {});
    const existing = Array.isArray(nextConfigOptionsJson?.env)
      ? nextConfigOptionsJson.env
      : [];
    const env = Array.from(new Set([...(existing || []), "DATABASE_URL"]));
    this.fs.extendJSON(nextOptionsPath, { env });

    extendConfigFile(this, {
      packages: {
        postgresql: true,
      },
    });
  }
}
