import Generator from "yeoman-generator";
import chalk from "chalk";
import yosay from "yosay";
import path from "path";
import { pascalCase } from "pascal-case";
import { getGenygConfigFile, requirePackages } from "../../common/index.js";

export default class ModelGenerator extends Generator {
  async prompting() {
    // Config checks
    requirePackages(this, ["core"]);

    // Greeting
    this.log(
      yosay(
        `Welcome to ${chalk.red(
          "Getapper NextJS Yeoman Generator (GeNYG)",
        )} model generator, follow the quick and easy configuration to create a new client or server model!`,
      ),
    );

    // Ensure core installed
    const configFile = getGenygConfigFile(this);
    if (!configFile.packages.core) {
      this.log(
        yosay(
          chalk.red(
            "It seems like the GeNYG core files are not installed yet. Run yo g-next:pkg-core to fix this.",
          ),
        ),
      );
      this.abort = true;
      return;
    }

    // Step 1: location + name
    const baseAnswers = await this.prompt([
      {
        type: "list",
        name: "location",
        message:
          "The model will be used in the client side with React, or in the backend with NodeJS?",
        choices: ["client", "server", "common"],
        default: "common",
      },
      {
        type: "input",
        name: "modelName",
        message: "What is your model name?",
      },
    ]);

    if (!baseAnswers.modelName || !baseAnswers.modelName.trim()) {
      this.log(yosay(chalk.red("Please give your model a name next time!")));
      this.abort = true;
      return;
    }

    const modelName = pascalCase(baseAnswers.modelName).trim();

    this.answers = {
      location: baseAnswers.location,
      modelName,
    };
  }

  writing() {
    if (this.abort) return;

    const { modelName, location } = this.answers;

    const destDir = path.posix.join("src/models", location, modelName);

    // index.ts model file
    this.fs.copyTpl(
      this.templatePath("index.ejs"),
      this.destinationPath(path.posix.join(destDir, "index.ts")),
      { modelName },
    );
  }
}
