"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const {
  getGenygConfigFile,
  requirePackages,
  extendConfigFile,
} = require("../../common");

module.exports = class extends Generator {
  async prompting() {
    // Config checks
    requirePackages(this, ["mui"]);

    this.log(
      yosay(
        `Hi! Welcome to the official ${chalk.blue(
          "Getapper NextJS Yeoman Generator (GeNYG)",
        )}. ${chalk.red(
          "This command must be executed only once. It installs OpenTelemetry tracing with Axiom export, the useTelemetry React hook, and the /api/otel/traces ingest endpoint. Set AXIOM_API_TOKEN, AXIOM_DATASET, AXIOM_OTLP_URL in your env files after install.",
        )}`,
      ),
    );

    this.answers = await this.prompt([
      {
        type: "confirm",
        name: "accept",
        message: "Are you sure to proceed?",
      },
    ]);

    if (!this.answers.accept) {
      process.exit(0);
    }
  }

  writing() {
    // Config checks
    const configFile = getGenygConfigFile(this);
    if (configFile.packages.telemetry) {
      this.log(
        yosay(
          chalk.red(
            "It looks like the GeNYG telemetry package was already installed!",
          ),
        ),
      );
      process.exit(0);
    }

    // New dependencies — OpenTelemetry stack
    this.packageJson.merge({
      dependencies: {
        "@opentelemetry/api": "1.9.0",
        "@opentelemetry/sdk-node": "0.213.0",
        "@opentelemetry/exporter-trace-otlp-proto": "0.213.0",
        "@opentelemetry/resources": "2.6.0",
        "@opentelemetry/semantic-conventions": "1.40.0",
        "@opentelemetry/instrumentation-http": "0.213.0",
        "@opentelemetry/sdk-trace-base": "2.6.0",
        "@opentelemetry/context-async-hooks": "2.6.0",
      },
    });

    // Copy templates — overwrites the no-op trace.ts stub from pkg-core
    this.fs.copy(this.templatePath(), this.destinationRoot());

    // Add Axiom env vars to next.config.options.json
    const nextOptionsPath = this.destinationPath("next.config.options.json");
    const nextOptions = this.fs.readJSON(nextOptionsPath, {});
    const existing = Array.isArray(nextOptions?.env) ? nextOptions.env : [];
    const mergedEnv = Array.from(
      new Set([
        ...existing,
        "AXIOM_API_TOKEN",
        "AXIOM_DATASET",
        "AXIOM_OTLP_URL",
      ]),
    );
    this.fs.extendJSON(nextOptionsPath, { env: mergedEnv });

    extendConfigFile(this, {
      packages: { telemetry: true },
    });
  }
};
