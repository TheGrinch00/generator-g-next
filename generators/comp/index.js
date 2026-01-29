"use strict";
import Generator from "yeoman-generator";
import chalk from "chalk";
import yosay from "yosay";
import path from "path";
import { fileSelector, ItemType } from "inquirer-file-selector";
import { pascalCase } from "pascal-case";
import { requirePackages } from "../../common/index.js";

const BASE_COMPONENTS_DIR = "src/components";

export default class CompGenerator extends Generator {
  initializing() {}

  async prompting() {
    // Ensure required workspace deps
    requirePackages(this, ["core"]);

    this.log(
      yosay(
        `Welcome to ${chalk.red(
          "Getapper NextJS Yeoman Generator (GeNYG)",
        )} component generator!`,
      ),
    );

    // Browse to choose the destination directory under BASE_COMPONENTS_DIR (Yeoman 5 compatible)
    const rootAbs = this.destinationPath(BASE_COMPONENTS_DIR);
    const selection = await fileSelector({
      message: "Select where to create the component:",
      type: ItemType.Directory,
      path: rootAbs,
      basePath: rootAbs,
      allowCancel: true
    });

    const selectedPathAbs =
      typeof selection === "string"
        ? selection
        : selection?.path || selection?.absolutePath || rootAbs;
    const componentPath = path
      .relative(rootAbs, selectedPathAbs)
      .split(path.sep)
      .join(path.posix.sep);

    const { componentName: rawName } = await this.prompt([
      {
        type: "input",
        name: "componentName",
        message: "What is your component name?",
        validate: (val) =>
          (val && val.trim().length > 0) || "Please enter a component name",
        filter: (val) => (val || "").trim(),
        transformer: (val) => pascalCase((val || "").trim()),
      },
    ]);

    const name = pascalCase(rawName || "").trim();
    if (!name) {
      throw new Error("Component name is required");
    }

    this.answers = {
      componentPath,
      componentName: name,
    };
  }

  writing() {
    const { componentPath, componentName } = this.answers;

    // Build destination directory under src/components
    const destDir = path.posix.join(
      BASE_COMPONENTS_DIR,
      componentPath ? componentPath : "",
      componentName,
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
