import Generator from "yeoman-generator";
import chalk from "chalk";
import yosay from "yosay";
import path from "path";
import { fileSelector, ItemType } from "inquirer-file-selector";
import { pascalCase } from "pascal-case";
import { camelCase } from "camel-case";
import { requirePackages } from "../../common/index.js";

// Template modules (each default-exports a function returning a string)
import layoutTplMod from "./templates/layout.js";
import pageTplMod from "./templates/page.js";
import pageDynTplMod from "./templates/page.dynamic.js";
import loadingTplMod from "./templates/loading.js";
import errorTplMod from "./templates/error.js";
import notFoundTplMod from "./templates/not-found.js";

const layoutTpl = layoutTplMod?.default || layoutTplMod;
const pageTpl = pageTplMod?.default || pageTplMod;
const pageDynamicTpl = pageDynTplMod?.default || pageDynTplMod;
const loadingTpl = loadingTplMod?.default || loadingTplMod;
const errorTpl = errorTplMod?.default || errorTplMod;
const notFoundTpl = notFoundTplMod?.default || notFoundTplMod;

const BASE_APP_DIR = "src/app";

function analyzeSegment(segment) {
  // Supports: plain, [slug], [...slug], [[...slug]]
  const isDynamic = segment.startsWith("[");
  if (!isDynamic) {
    return { isDynamic: false };
  }
  const spread = segment.startsWith("[...");
  const optional = segment.startsWith("[[...");
  const name = segment
    .replace("[...", "")
    .replace("[[...", "")
    .replace("]]", "")
    .replace("]", "");
  const id = camelCase(name);
  const paramType = spread
    ? optional
      ? `{ ${id}?: string[] }`
      : `{ ${id}: string[] }`
    : `{ ${id}: string }`;
  return { isDynamic: true, id, paramType };
}

export default class PageGenerator extends Generator {
  async prompting() {
    requirePackages(this, ["core"]);

    this.log(
      yosay(
        `Welcome to ${chalk.red(
          "Getapper NextJS Yeoman Generator (GeNYG)",
        )} App Router page generator!`,
      ),
    );

    // Choose base folder inside src/app
    const rootAbs = this.destinationPath(BASE_APP_DIR);
    const fsSel = await fileSelector({
      message: "Select the parent folder under src/app:",
      type: ItemType.Directory,
      basePath: rootAbs,
    });
    const selectedAbs =
      typeof fsSel === "string" ? fsSel : fsSel?.path || fsSel?.absolutePath || rootAbs;
    const parentRel = path
      .relative(rootAbs, selectedAbs)
      .split(path.sep)
      .join(path.posix.sep);

    const answers = await this.prompt([
      {
        type: "input",
        name: "segment",
        message:
          "New route segment name (e.g. admin, users, [slug], [...parts], [[...parts]]):",
      },
      {
        type: "input",
        name: "pageTitle",
        message: "Page title (metadata / heading):",
      },
      {
        type: "confirm",
        name: "includeLayout",
        message: "Generate layout.tsx?",
        default: true,
      },
      {
        type: "confirm",
        name: "includeLoading",
        message: "Generate loading.tsx?",
        default: true,
      },
      {
        type: "confirm",
        name: "includeError",
        message: "Generate error.tsx?",
        default: true,
      },
      {
        type: "confirm",
        name: "includeNotFound",
        message: "Generate not-found.tsx?",
        default: true,
      },
      {
        type: "confirm",
        name: "useClient",
        message: "Use \"use client\" in page component?",
        default: false,
      },
    ]);

    if (!answers.segment?.trim()) {
      this.log(yosay(chalk.red("Please provide a segment name.")));
      this.abort = true;
      return;
    }

    const seg = answers.segment.trim();
    const segFolder = seg; // keep as provided to support brackets
    const pageNameBase = seg.replace(/^[\[\.]+|[\]\.]+$/g, "");
    const PageName = pascalCase(pageNameBase || "Index");
    const analysis = analyzeSegment(seg);

    this.answers = {
      parentRel,
      segFolder,
      PageName,
      pageTitle: answers.pageTitle?.trim() || PageName,
      useClient: !!answers.useClient,
      includeLayout: !!answers.includeLayout,
      includeLoading: !!answers.includeLoading,
      includeError: !!answers.includeError,
      includeNotFound: !!answers.includeNotFound,
      isDynamic: analysis.isDynamic,
      paramType: analysis.paramType,
    };
  }

  writing() {
    if (this.abort) return;

    const {
      parentRel,
      segFolder,
      PageName,
      pageTitle,
      useClient,
      includeLayout,
      includeLoading,
      includeError,
      includeNotFound,
      isDynamic,
      paramType,
    } = this.answers;

    const routeDir = path.posix.join(
      BASE_APP_DIR,
      parentRel ? parentRel : "",
      segFolder,
    );

    // page.tsx
    this.fs.write(
      this.destinationPath(path.posix.join(routeDir, "page.tsx")),
      isDynamic
        ? pageDynamicTpl({ PageName, pageTitle, paramType, useClient })
        : pageTpl({ PageName, pageTitle, useClient }),
    );

    if (includeLayout) {
      this.fs.write(
        this.destinationPath(path.posix.join(routeDir, "layout.tsx")),
        layoutTpl({ PageName, pageTitle }),
      );
    }

    if (includeLoading) {
      this.fs.write(
        this.destinationPath(path.posix.join(routeDir, "loading.tsx")),
        loadingTpl({ pageTitle }),
      );
    }

    if (includeError) {
      this.fs.write(
        this.destinationPath(path.posix.join(routeDir, "error.tsx")),
        errorTpl({ pageTitle, useClient: true }), // error boundary must be client component
      );
    }

    if (includeNotFound) {
      this.fs.write(
        this.destinationPath(path.posix.join(routeDir, "not-found.tsx")),
        notFoundTpl({ pageTitle }),
      );
    }
  }
}
