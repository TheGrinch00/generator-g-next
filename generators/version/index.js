import Generator from "yeoman-generator";
import yosay from "yosay";
import chalk from "chalk";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgJSON = JSON.parse(
  readFileSync(join(__dirname, "../../package.json"), "utf8"),
);

export default class VersionGenerator extends Generator {
  install() {
    const version = pkgJSON?.version || "unknown";
    this.log(
      yosay(
        `Welcome to the ${chalk.red(
          "Getapper NextJS Yeoman Generator (GeNYG)",
        )}!\n\nCurrent version: ${chalk.cyan(version)}`,
      ),
    );
  }
}
