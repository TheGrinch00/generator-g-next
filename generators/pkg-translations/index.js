"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const { getGenygConfigFile, requirePackages } = require("../../common");

module.exports = class extends Generator {
  async prompting() {
    // Config checks
    requirePackages(this, ["mui"]);

    this.log(
      yosay(
        `Hi! Welcome to the official ${chalk.blue(
          "Getapper NextJS Yeoman Generator (GeNYG)",
        )}. ${chalk.red(
          "This command must be executed only once. It will install i18next (with browser language detection) and scaffold JSON-based locale files plus an SSR translations helper for the App Router. Import \"@/i18n\" once in your client root (e.g. AppWrapper) and use getSSRTranslations() in server components.",
        )}`,
      ),
    );

    this.answers = await this.prompt([
      {
        type: "confirm",
        name: "accept",
        message: "Are you sure to proceed?",
      },
    ]);

    if (!this.answers.accept) {
      process.exit(0);
    }
  }

  writing() {
    // Config checks
    const configFile = getGenygConfigFile(this);
    if (configFile.packages.translations) {
      this.log(
        yosay(
          chalk.red(
            "It looks like the GeNYG translations package was already installed!",
          ),
        ),
      );
      process.exit(0);
    }

    // New dependencies
    this.packageJson.merge({
      dependencies: {
        i18next: "^25.8.14",
        "react-i18next": "^16.5.6",
        "i18next-browser-languagedetector": "^8.2.1",
      },
    });

    // Copy project files
    this.fs.copy(this.templatePath(), this.destinationRoot());
  }
};
