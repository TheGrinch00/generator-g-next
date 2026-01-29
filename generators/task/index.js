import Generator from "yeoman-generator";
import chalk from "chalk";
import yosay from "yosay";
import * as kebabCaseMod from "kebab-case";
import { pascalCase } from "pascal-case";
import {
  requirePackages,
  copyEjsTemplateFolder,
  checkPackageInstalled,
} from "../../common/index.js";

const kebab = kebabCaseMod.kebabCase ?? kebabCaseMod.default ?? kebabCaseMod;

export default class TaskGenerator extends Generator {
  async prompting() {
    // Config checks
    requirePackages(this, ["core"]);

    // Greeting
    this.log(
      yosay(
        `Welcome to ${chalk.red(
          "Getapper NextJS Yeoman Generator (GeNYG)",
        )} task generator, follow the quick and easy configuration to create a new task!`,
      ),
    );

    const answers = await this.prompt([
      {
        type: "input",
        name: "taskName",
        message: "What is your task name?",
        filter: (v) => (v || "").trim(),
        validate: (v) => !!v || "Please enter a task name",
      },
    ]);

    if (!answers.taskName) {
      this.log(yosay(chalk.red("Please give your task a name next time!")));
      this.abort = true;
      return;
    }

    this.answers = { taskName: pascalCase(answers.taskName).trim() };
  }

  writing() {
    if (this.abort) return;

    const { taskName } = this.answers;
    const taskFolder = kebab(taskName).slice(1); // kebab-case returns leading '-'
    const taskFunctionName = taskName.slice(0, 1).toLowerCase() + taskName.slice(1);

    const relativeToRootPath = `./src/tasks/${taskFolder}`;

    copyEjsTemplateFolder(this, this.templatePath("./"), relativeToRootPath, {
      taskFunctionName,
      taskFolder,
      isMongoInstalled: checkPackageInstalled(this, "mongodb"),
    });

    this.packageJson.merge({
      scripts: {
        [`TASK:${taskName}`]: `npx tsx -r tsconfig-paths/register src/tasks/${taskFolder}/exec.ts`,
      },
    });
  }
}
