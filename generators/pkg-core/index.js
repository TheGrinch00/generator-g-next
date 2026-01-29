import Generator from "yeoman-generator";
import chalk from "chalk";
import yosay from "yosay";

const NODE_ENGINE = ">=22.0.0 <23.0.0"; // Next 15+ safe range
const ESLINT_VERSION = "8.57.0"; // last 8.x (stable with Next configs)

export default class PkgCoreGenerator extends Generator {
  async prompting() {
    this.log(
      yosay(
        `Hi! Welcome to the official ${chalk.blue(
          "Getapper NextJS Yeoman Generator (GeNYG)",
        )}. ${chalk.red(
          "This command SHOULD only be executed right after create-next-app install, not sooner, not later!",
        )}\nIt will install Redux, Sagas, Persist, React-Router, MUI, and basic app templates.`,
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
      // Gracefully stop the run without killing the process
      this.log(chalk.yellow("Aborted by user."));
      this.abort = true;
    }
  }

  writing() {
    if (this.abort) return; // nothing to do

    // Update package.json fields
    this.packageJson.merge({
      engines: {
        node: NODE_ENGINE,
      },
      scripts: {
        lint: "next lint",
        tsc: "tsc",
        test: "jest --runInBand",
      },
      devDependencies: {
        "@types/jest": "29.4.0",
        "custom-env": "2.0.1",
        "env-cmd": "10.1.0",
        "eslint-config-prettier": "8.5.0",
        eslint: ESLINT_VERSION,
        husky: "4.2.5",
        jest: "29.4.1",
        "lint-staged": "10.2.11",
        "node-mocks-http": "1.11.0",
        prettier: "3.6.2",
        "ts-jest": "29.0.5",
        "ts-node": "10.9.1",
        "ts-transform-paths": "3.0.0",
      },
      dependencies: {
        zod: "4.1.8",
      },
      husky: {
        hooks: {
          "pre-commit": "lint-staged",
        },
      },
    });

    // Copy project files
    this.fs.copy(this.templatePath("."), this.destinationPath("."));
    this.fs.copy(this.templatePath(".*"), this.destinationRoot());

    // Append default env keys to next.config.options.json
    const nextOptionsPath = this.destinationPath("next.config.options.json");
    const nextOptions = this.fs.readJSON(nextOptionsPath, {});
    const existing = Array.isArray(nextOptions?.env) ? nextOptions.env : [];
    const mergedEnv = Array.from(
      new Set([...existing, "NEXT_PUBLIC_API_BASE_URL", "NEXT_PUBLIC_WEBSITE_BASE_URL"]),
    );
    this.fs.extendJSON(nextOptionsPath, { env: mergedEnv });
  }

  async install() {
    if (this.abort) return;

    const run = (cmd, args) =>
      new Promise((resolve, reject) => {
        const child = this.spawnCommand(cmd, args, { stdio: "inherit" });
        child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited with ${code}`))));
        child.on("error", reject);
      });

    try {
      await run("npm", ["i"]);

      // Conditionally run prepare only if present
      const pkg = this.fs.readJSON(this.destinationPath("package.json"), {});
      if (pkg.scripts && pkg.scripts.prepare) {
        await run("npm", ["run", "prepare"]).catch(() => {});
      }
    } catch (err) {
      this.log("\n❌ Dependencies installation failed:", err?.message || err);
      throw err;
    }
  }
}
