import Generator from "yeoman-generator";
import yosay from "yosay";
import chalk from "chalk";
import {
  requirePackages,
  getGenygConfigFile,
  extendConfigFile,
} from "../../common/index.js";

export default class CookieAuthGenerator extends Generator {
  async prompting() {
    // Config checks
    requirePackages(this, ["core"]);

    this.log(
      yosay(
        `Hi! Welcome to the official ${chalk.blue(
          "Getapper NextJS Yeoman Generator (GeNYG)",
        )}. ${chalk.red(
          "This command must be executed only once, and it will install all cookie-auth dependencies.",
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

    if (!accept) this.abort = true;
  }

  writing() {
    if (this.abort) return;

    // Guard: do not install twice
    const configFile = getGenygConfigFile(this) || {};
    if (configFile.packages && configFile.packages.cookieAuth) {
      this.log(
        yosay(
          chalk.red(
            "It looks like the GeNYG cookie-auth deps were already installed!",
          ),
        ),
      );
      this.abort = true;
      return;
    }

    // Dependencies
    this.packageJson.merge({
      dependencies: {
        "iron-session": "8.0.4",
      },
    });

    // Templates
    this.fs.copy(this.templatePath("."), this.destinationRoot());

    // Mark as installed
    extendConfigFile(this, {
      packages: { cookieAuth: true },
      cookieRoles: [],
    });
  }
}
