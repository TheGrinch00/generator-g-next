import Generator from "yeoman-generator";
import chalk from "chalk";
import yosay from "yosay";
import {
  getGenygConfigFile,
  extendConfigFile,
  requirePackages,
} from "../../common/index.js";

export default class MuiGenerator extends Generator {
  async prompting() {
    requirePackages(this, ["core"]);

    this.log(
      yosay(
        `Hi! Welcome to the official ${chalk.blue(
          "Getapper NextJS Yeoman Generator (GeNYG)",
        )}. ${chalk.red(
          "This command must be executed only once, and it will install all MUI dependencies.",
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

    const configFile = getGenygConfigFile(this);
    if (configFile && configFile.packages && configFile.packages.mui) {
      this.log(
        yosay(
          chalk.red(
            "It looks like the GeNYG MUI files were already installed!",
          ),
        ),
      );
      this.abort = true;
      return;
    }

    this.packageJson.merge({
      dependencies: {
        "@emotion/react": "11.14.0",
        "@emotion/styled": "11.14.0",
        "@mui/icons-material": "7.1.0",
        "@mui/material": "7.1.0",
        "@mui/x-data-grid": "7.28.0",
        "@mui/x-date-pickers": "7.28.0",
        "@tanstack/react-form": "1.11.1",
        "@tanstack/react-pacer": "^0.7.0",
        "@tiptap/extension-color": "^2.3.0",
        "@tiptap/extension-highlight": "^2.3.0",
        "@tiptap/extension-image": "^2.3.2",
        "@tiptap/extension-link": "^2.3.0",
        "@tiptap/extension-text": "^2.3.0",
        "@tiptap/extension-text-align": "^2.3.0",
        "@tiptap/extension-text-style": "^2.3.0",
        "@tiptap/extension-underline": "^2.3.0",
        "@tiptap/pm": "^2.3.0",
        "@tiptap/react": "^2.3.0",
        "@tiptap/starter-kit": "^2.3.0",
        dayjs: "1.11.13",
        "react-color": "^2.19.3",
        "react-dropzone": "12.0.5",
        "react-number-format": "5.4.3",
        zod: "3.25.67",
      },
      devDependencies: {
        "@types/react-color": "^3.0.13",
      },
    });

    // Copy templates
    this.fs.copy(this.templatePath("."), this.destinationRoot());

    extendConfigFile(this, {
      packages: { mui: true },
    });
  }
}
