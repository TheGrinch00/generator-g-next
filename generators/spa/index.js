import Generator from "yeoman-generator";
import chalk from "chalk";
import yosay from "yosay";
import path from "path";
import { pascalCase } from "pascal-case";
import * as kebabCaseMod from "kebab-case";
import { copyEjsTemplateFolder, requirePackages } from "../../common/index.js";
import { fileSelector, ItemType } from "inquirer-file-selector";

const kebab = kebabCaseMod.kebabCase ?? kebabCaseMod.default ?? kebabCaseMod;
const BASE_APP_DIR = "src/app";

export default class SpaGenerator extends Generator {
  async prompting() {
    // Config checks
    requirePackages(this, ["spa"]);

    this.log(
      yosay(
        `Welcome to ${chalk.red(
          "Getapper NextJS Yeoman Generator (GeNYG)",
        )} SPA generator! Follow the quick configuration to create a new Single Page Application.`,
      ),
    );

    const { spaName, pageName } = await this.prompt([
      {
        type: "input",
        name: "spaName",
        message: "What is your SPA name?",
        validate: (v) => !!(v && v.trim()) || "Please enter a SPA name",
        filter: (v) => (v || "").trim(),
        transformer: (v) => pascalCase((v || "").trim()),
      },
      {
        type: "input",
        name: "pageName",
        message: "What is your page name?",
        validate: (v) => !!(v && v.trim()) || "Please enter a page name",
        filter: (v) => (v || "").trim(),
        transformer: (v) => pascalCase((v || "").trim()),
      },
    ]);

    const pageNamePC = pascalCase(pageName || "").trim();
    const spaNamePC = pascalCase(spaName || "").trim();
    if (!pageNamePC || !spaNamePC) {
      this.abort = true;
      return;
    }

    // Select parent folder under src/app
    const rootAbs = this.destinationPath(BASE_APP_DIR);
    const selection = await fileSelector({
      message: "Select where to create the page that will contain the SPA:",
      type: ItemType.Directory,
      basePath: rootAbs,
    });
    const selectedAbs =
      typeof selection === "string" ? selection : selection?.path || selection?.absolutePath || rootAbs;
    const parentRel = path
      .relative(rootAbs, selectedAbs)
      .split(path.sep)
      .join(path.posix.sep);

    this.answers = { pageName: pageNamePC, spaName: spaNamePC, parentRel };
  }

  writing() {
    if (this.abort) return;

    const { parentRel, pageName, spaName } = this.answers;

    // Folder names in kebab-case (for route and SPA folder)
    const folderName = kebab(pageName)
      .split("-")
      .filter(Boolean)
      .join("-");

    const spaFolderName = kebab(spaName)
      .split("-")
      .filter(Boolean)
      .join("-");

    // Route base path inside src/app
    const routeDir = path.posix.join(BASE_APP_DIR, parentRel ? parentRel : "", folderName);

    // page.tsx (App Router)
    this.fs.copyTpl(
      this.templatePath("page/index.ejs"),
      this.destinationPath(path.posix.join(routeDir, "page.tsx")),
      { spaName, spaFolderName, pageName },
    );

    // SPA files under src/spas/<spaFolderName>
    const spaDir = path.posix.join("src/spas", spaFolderName, "/");
    copyEjsTemplateFolder(
      this,
      this.templatePath("./spa"),
      spaDir,
      { spaName, spaFolderName, pageName, basename: `/${parentRel ? parentRel + "/" : ""}${folderName}` },
    );

    // Update next.config.options.json rewrites uniquely (for client-side routing inside the SPA)
    const basename = `/${parentRel ? parentRel + "/" : ""}${folderName}`;
    const nextOptionsPath = this.destinationPath("next.config.options.json");
    const nextOptions = this.fs.readJSON(nextOptionsPath, {});
    const rewrites = Array.isArray(nextOptions?.rewrites) ? nextOptions.rewrites : [];
    const newRule = { source: `${basename}/:path*`, destination: basename };
    const exists = rewrites.some(
      (r) => r && r.source === newRule.source && r.destination === newRule.destination,
    );
    const merged = exists ? rewrites : [...rewrites, newRule];
    this.fs.extendJSON(nextOptionsPath, { rewrites: merged });
  }
}
