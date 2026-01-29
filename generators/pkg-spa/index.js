import Generator from "yeoman-generator";
import chalk from "chalk";
import yosay from "yosay";
import {
  getGenygConfigFile,
  extendConfigFile,
  requirePackages,
} from "../../common/index.js";

export default class SpaGenerator extends Generator {
  async prompting() {
    // Config checks
    requirePackages(this, ["core"]);

    this.log(
      yosay(
        `Hi! Welcome to the official ${chalk.blue(
          "Getapper NextJS Yeoman Generator (GeNYG)",
        )}. ${chalk.red(
          "This command will install Redux, Sagas, Persist, React-Router, and everything needed to run SPAs in NextJS.",
        )}`,
      ),
    );

    // Ensure SPA not already installed
    const configFile = getGenygConfigFile(this);
    if (configFile && configFile.packages && configFile.packages.spa) {
      this.log(
        yosay(
          chalk.red(
            "It looks like the GeNYG SPA files were already installed!",
          ),
        ),
      );
      this.abort = true;
      return;
    }

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

    // Dependencies required by SPA setup
    this.packageJson.merge({
      dependencies: {
        "@reduxjs/toolkit": "2.9.0",
        "@tanstack/react-query": "5.85.5",
        axios: "1.12.2",
        qs: "6.14.0",
        "react-redux": "9.2.0",
        "react-router-dom": "7.4.0",
        "redux-persist": "6.0.0",
        "redux-saga": "1.3.0",
      },
    });

    // Copy SPA templates
    this.fs.copy(this.templatePath("."), this.destinationRoot());

    // Mark SPA as installed in GeNYG config
    extendConfigFile(this, {
      packages: {
        spa: true,
      },
    });
  }
}
