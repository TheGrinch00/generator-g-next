import Generator from "yeoman-generator";
import chalk from "chalk";
import yosay from "yosay";
import fs from "fs";
import path from "path";
import { pascalCase } from "pascal-case";
import { getGenygConfigFile, getSpas, requirePackages } from "../../common/index.js";
import getTemplateCjs from "./templates/api.js";

// Ensure CJS/ESM interop for template module
const getTemplate = getTemplateCjs?.default || getTemplateCjs;

const camelCaseToDash = (s) =>
  s.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();

const capitalize = (s) => `${s[0].toUpperCase()}${s.slice(1)}`;

const parseFromText = (text) => {
  const params = text
    .split("/")
    .filter((p) => p !== "")
    .map((p) => {
      if (p[0] === "{") {
        return "{" + camelCaseToDash(p.replace("{", "").replace("}", "")) + "}";
      }

      return p;
    });
  return params;
};

const getFunctionName = (method, params) => {
  const models = params
    .filter((p) => p[0] !== "{")
    .map((p) =>
      p
        .split("-")
        .map((p) => capitalize(p))
        .join(""),
    );
  const variables = params
    .filter((p) => p[0] === "{")
    .map((p) =>
      p
        .replace("{", "")
        .replace("}", "")
        .split("-")
        .map((p) => capitalize(p))
        .join(""),
    );
  return `${method}${models.join("")}${variables.length ? "By" : ""}${variables.join("And")}`;
};

const getAjaxFolder = (method, params) => {
  const models = params.filter((p) => p[0] !== "{");
  const variables = params
    .filter((p) => p[0] === "{")
    .map((p) => p.replace("{", "").replace("}", ""));
  return `${method}-${models.join("-")}${variables.length ? "-by-" : ""}${variables.join("-and-")}`;
};

const getAjaxActionRoute = (method, params) => {
  return (
    "apis/" +
    params
      .map((p) => {
        if (p[0] === "{") {
          return `{${p
            .replace("{", "")
            .replace("}", "")
            .split("-")
            .map((p2, index) => (index ? capitalize(p2) : p2))
            .join("")}}`;
        }

        return p;
      })
      .join("/") +
    "/" +
    method
  );
};

const getAjaxPath = (params) => {
  const urlParams = params
    .filter((p) => p[0] === "{")
    .map((p) =>
      p
        .replace("{", "")
        .replace("}", "")
        .split("-")
        .map((p2, index) => (index ? capitalize(p2) : p2))
        .join(""),
    );
  if (urlParams.length) {
    return [
      `\`/${params
        .map((p) => {
          if (p[0] === "{") {
            return `\${params.${p
              .replace("{", "")
              .replace("}", "")
              .split("-")
              .map((p2, index) => (index ? capitalize(p2) : p2))
              .join("")}}`;
          }

          return p;
        })
        .join("/")}\``,
      urlParams,
    ];
  }

  return [`"/${params.join("/")}"`];
};

export default class AjaxGenerator extends Generator {
  async prompting() {
    // Config checks
    requirePackages(this, ["spa"]);

    // Greet the user
    this.log(
      yosay(
        `Welcome to ${chalk.red(
          "generator-g-next",
        )} ajax generator, follow the quick and easy configuration to create a new ajax!`,
      ),
    );

    let answers = {};
    const spas = getSpas(this);
    if (spas.length > 1) {
      answers = await this.prompt([
        {
          type: "list",
          name: "spaFolderName",
          message: "In which SPA you want to create an ajax?",
          choices: spas,
        },
      ]);
    } else {
      answers.spaFolderName = spas[0];
    }

    answers = {
      ...answers,
      ...(await this.prompt([
        {
          type: "input",
          name: "route",
          message: "What is your API route?",
        },
        {
          type: "list",
          name: "method",
          message: "What is your API http method?",
          choices: ["get", "post", "patch", "put", "delete"],
          default: "get",
        },
      ])),
    };

    if (answers.route === "") {
      this.log(yosay(chalk.red("Please give your ajax a route next time!")));
      process.exit(1);
      return;
    }

    this.answers = answers;
  }

  writing() {
    const { method, route, spaFolderName } = this.answers;
    const params = parseFromText(route);
    const folderName = getAjaxFolder(method, params);
    const apiName = getFunctionName(method, params);
    const apiNamePC = pascalCase(apiName);
    const apiActionRoute = getAjaxActionRoute(method, params);
    const [routePath, urlParams] = getAjaxPath(params);
    const reduxStorePath = `./src/spas/${spaFolderName}/redux-store`;

    let content = getTemplate(
      apiNamePC,
      apiActionRoute,
      routePath,
      method.toUpperCase(),
      urlParams,
    );

    this.fs.write(
      this.destinationPath(
        `${reduxStorePath}/extra-actions/apis/${folderName}/index.tsx`,
      ),
      content,
    );

    content = `export {default as ${apiName}} from './${folderName}'\n`;

    fs.appendFileSync(
      path.join(
        this.destinationRoot(),
        reduxStorePath,
        "extra-actions",
        "apis",
        "index.tsx",
      ),
      content,
    );
  }
}
