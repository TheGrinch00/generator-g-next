import Generator from "yeoman-generator";
import chalk from "chalk";
import yosay from "yosay";
import fs from "fs";
import { pascalCase } from "pascal-case";
import {
  getSpas,
  requirePackages,
} from "../../common/index.js";

export default class SceneGenerator extends Generator {
  async prompting() {
    // Config checks
    requirePackages(this, ["spa"]);

    // Greeting
    this.log(
      yosay(
        `Welcome to ${chalk.red(
          "generator-g-next",
        )} scene generator! Follow the quick and easy configuration to create a new scene in your SPA!`,
      ),
    );

    let answers = {};
    const spas = getSpas(this);

    if (!spas.length) {
      this.log(yosay(chalk.red("No SPA folders found in src/spas.")));
      this.abort = true;
      return;
    }

    if (spas.length > 1) {
      answers = await this.prompt([
        {
          type: "list",
          name: "spaFolderName",
          message: "In which SPA do you want to create a scene?",
          choices: spas,
        },
      ]);
    } else {
      answers.spaFolderName = spas[0];
    }

    const { sceneName } = await this.prompt([
      {
        type: "input",
        name: "sceneName",
        message: "What is your scene name?",
      },
    ]);

    if (!sceneName || !sceneName.trim()) {
      this.log(yosay(chalk.red("Please give your scene a name next time!")));
      this.abort = true;
      return;
    }

    this.answers = {
      spaFolderName: answers.spaFolderName,
      sceneName: pascalCase(sceneName.trim()),
    };
  }

  writing() {
    if (this.abort) return;

    const { sceneName, spaFolderName } = this.answers;

    // Scene index.tsx
    this.fs.copyTpl(
      this.templatePath("index.ejs"),
      this.destinationPath(`src/spas/${spaFolderName}/scenes/${sceneName}/index.tsx`),
      { sceneName },
    );

    // Scene index.hooks.tsx
    this.fs.copyTpl(
      this.templatePath("index.hooks.ejs"),
      this.destinationPath(`src/spas/${spaFolderName}/scenes/${sceneName}/index.hooks.tsx`),
      { ...this.answers },
    );

    // Update scenes/index.tsx export file
    const exportLine = `export * from './${sceneName}';\n`;
    const scenesIndex = this.destinationPath(`src/spas/${spaFolderName}/scenes/index.tsx`);

    try {
      fs.appendFileSync(scenesIndex, exportLine);
    } catch (err) {
      this.log(chalk.yellow(`Couldn't update scenes index automatically: ${err.message}`));
    }
  }
}
