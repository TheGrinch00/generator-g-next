import Generator from "yeoman-generator";
import yosay from "yosay";
import chalk from "chalk";
import pkgJSON from "../../package.json" assert { type: "json" };

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
