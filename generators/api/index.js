import Generator from "yeoman-generator";
import chalk from "chalk";
import yosay from "yosay";
import fs from "fs";
import path from "path";
import { camelCase } from "camel-case";
import { pascalCase } from "pascal-case";
import { getGenygConfigFile, requirePackages } from "../../common/index.js";

// Templates (CJS/ESM interop)
import handlerTpl from "./templates/endpoint/handler.js";
import interfacesTpl from "./templates/endpoint/interfaces.js";
import validationsTpl from "./templates/endpoint/validations.js";
import testsTpl from "./templates/endpoint/index.test.js";
import pageTpl from "./templates/page/index.js";
const getEndpointHandlersTemplate = handlerTpl?.default || handlerTpl;
const getEndpointInterfacesTemplate = interfacesTpl?.default || interfacesTpl;
const getEndpointValidationsTemplate =
  validationsTpl?.default || validationsTpl;
const getEndpointTestsTemplate = testsTpl?.default || testsTpl;
const getEndpointPageTemplate = pageTpl?.default || pageTpl;

const HttpMethods = {
  GET: "get",
  POST: "post",
  DELETE: "delete",
  PUT: "put",
  PATCH: "patch",
};

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
        .map((p2) => capitalize(p2))
        .join(""),
    );
  const variables = params
    .filter((p) => p[0] === "{")
    .map((p) =>
      p
        .replace("{", "")
        .replace("}", "")
        .split("-")
        .map((p2) => capitalize(p2))
        .join(""),
    );
  return `${method}${models.join("")}${variables.length ? "By" : ""}${variables.join("And")}`;
};

const getEndpointRoutePath = (params) => {
  const models = params.filter((p) => p[0] !== "{");
  const variables = params
    .filter((p) => p[0] === "{")
    .map((p) => p.replace("{", "").replace("}", ""));
  return `${models.join("-")}${variables.length ? "-by-" : ""}${variables.join("-and-")}`;
};

const getPagesApiFolders = (params) => {
  return params.map((p) =>
    p[0] === "{"
      ? "[" +
        p
          .replace("{", "")
          .replace("}", "")
          .split("-")
          .map((p2, index) => (index ? capitalize(p2) : p2))
          .join("") +
        "]"
      : p,
  );
};

const getEndpointFolder = (method, endpointRoutePath) => {
  return `${method}-${endpointRoutePath}`;
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

export default class ApiGenerator extends Generator {
  async prompting() {
    // Config checks
    requirePackages(this, ["core"]);

    // Greeting
    this.log(
      yosay(
        `Welcome to ${chalk.red(
          "Getapper NextJS Yeoman Generator (GeNYG)",
        )} API generator, follow the quick and easy configuration to create a new API!`,
      ),
    );

    const answers = await this.prompt([
      {
        type: "input",
        name: "route",
        message: "What is your API route path?",
      },
      {
        type: "list",
        name: "method",
        message: "What is your API http method?",
        choices: Object.values(HttpMethods),
        default: "get",
      },
    ]);

    if (!answers.route || !answers.route.trim()) {
      this.log(yosay(chalk.red("Please give your page a name next time!")));
      this.abort = true;
      return;
    }

    // Cookie auth
    const config = getGenygConfigFile(this);
    if (config.packages.cookieAuth && config.cookieRoles.length !== 0) {
      Object.assign(
        answers,
        await this.prompt([
          {
            type: "confirm",
            name: "useCookieAuth",
            message: "Do you want to use cookie authentication?",
            default: false,
          },
        ]),
      );
      if (answers.useCookieAuth) {
        Object.assign(
          answers,
          await this.prompt({
            type: "list",
            name: "cookieRole",
            message: "Select a role from the list",
            choices: config.cookieRoles,
          }),
        );
      }
    }

    this.answers = answers;
  }

  writing() {
    if (this.abort) return;

    const { method, route, useCookieAuth, cookieRole } = this.answers;
    const params = parseFromText(route);
    const endpointRoutePath = getEndpointRoutePath(params);
    const endpointFolderName = getEndpointFolder(method, endpointRoutePath);
    const apiName = getFunctionName(method, params);
    const [routePath, urlParams] = getAjaxPath(params);
    const pagesApiFolders = getPagesApiFolders(params);
    const hasPayload = [
      HttpMethods.PATCH,
      HttpMethods.POST,
      HttpMethods.PUT,
    ].includes(method);

    // Create Next.js app router API folders and route.ts
    let currentRoute = "";
    for (let i = 0; i < pagesApiFolders.length; i++) {
      const folder = pagesApiFolders[i];
      currentRoute = path.posix.join(currentRoute, folder);
      const relativeToPagesFolder =
        path.posix.join("./src/app/api", currentRoute) + "/";
      if (
        !(
          fs.existsSync(relativeToPagesFolder) &&
          fs.lstatSync(relativeToPagesFolder).isDirectory()
        )
      ) {
        fs.mkdirSync(relativeToPagesFolder, { recursive: true });
      }
      if (!fs.existsSync(path.posix.join(relativeToPagesFolder, "route.ts"))) {
        this.fs.write(
          this.destinationPath(
            path.posix.join(relativeToPagesFolder, "route.ts"),
          ),
          getEndpointPageTemplate(getEndpointRoutePath(params.slice(0, i + 1))),
        );
      }
    }

    // Endpoints folder
    this.fs.write(
      this.destinationPath(
        path.posix.join("./src/endpoints", endpointFolderName, "interfaces.ts"),
      ),
      getEndpointInterfacesTemplate(capitalize(apiName), urlParams, hasPayload),
    );
    this.fs.write(
      this.destinationPath(
        path.posix.join(
          "./src/endpoints",
          endpointFolderName,
          "validations.ts",
        ),
      ),
      getEndpointValidationsTemplate(
        capitalize(apiName),
        urlParams,
        hasPayload,
      ),
    );
    this.fs.write(
      this.destinationPath(
        path.posix.join("./src/endpoints", endpointFolderName, "handler.ts"),
      ),
      getEndpointHandlersTemplate(
        capitalize(apiName),
        hasPayload,
        useCookieAuth,
        useCookieAuth ? camelCase(cookieRole) : "",
        urlParams,
      ),
    );
    this.fs.write(
      this.destinationPath(
        path.posix.join("./src/endpoints", endpointFolderName, "index.test.ts"),
      ),
      getEndpointTestsTemplate(
        endpointFolderName,
        apiName,
        capitalize(apiName),
      ),
    );
  }
}
