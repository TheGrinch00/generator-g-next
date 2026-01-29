import Generator from "yeoman-generator";
import chalk from "chalk";
import yosay from "yosay";
import path from "path";
import { fileSelector, ItemType } from "inquirer-file-selector";
import { pascalCase } from "pascal-case";
import { requirePackages } from "../../common/index.js";

const BASE_COMPONENTS_DIR = "src/components";

export default class FormGenerator extends Generator {
  async prompting() {
    // Config checks
    requirePackages(this, ["mui"]);

    // Greeting
    this.log(
      yosay(
        `Welcome to ${chalk.red(
          "Getapper NextJS Yeoman Generator (GeNYG)",
        )} form generator, follow the quick and easy configuration to create a new form!`,
      ),
    );

    // Folder selection: start inside src/components
    const rootAbs = this.destinationPath(BASE_COMPONENTS_DIR);
    const selection = await fileSelector({
      message: "Select where to create the form:",
      type: ItemType.Directory,
      basePath: rootAbs,
    });
    const selectedPathAbs =
      typeof selection === "string"
        ? selection
        : selection?.path || selection?.absolutePath || rootAbs;
    const formPath = path
      .relative(rootAbs, selectedPathAbs)
      .split(path.sep)
      .join(path.posix.sep);

    const { formName: rawName } = await this.prompt([
      {
        type: "input",
        name: "formName",
        message: "What is your form name?",
      },
    ]);

    if (!rawName || !rawName.trim()) {
      this.log(yosay(chalk.red("Please give your form a name next time!")));
      this.abort = true;
      return;
    }

    this.answers = {
      formPath,
      formName: pascalCase(rawName.trim()),
    };
  }

  writing() {
    if (this.abort) return;

    const { formPath, formName } = this.answers;

    // Build destination under src/components
    const destDir = path.posix.join(
      BASE_COMPONENTS_DIR,
      formPath ? formPath : "",
      formName,
    );

    // index.tsx
    this.fs.copyTpl(
      this.templatePath("index.ejs"),
      this.destinationPath(path.posix.join(destDir, "index.tsx")),
      { ...this.answers },
    );

    // index.hooks.tsx
    this.fs.copyTpl(
      this.templatePath("index.hooks.ejs"),
      this.destinationPath(path.posix.join(destDir, "index.hooks.tsx")),
      { ...this.answers },
    );
  }
}
