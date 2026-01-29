#!/usr/bin/env node

/**
 * Thin CLI that runs the Yeoman generator with short commands.
 * Usage: g-next <subcommand> [options]
 * Example: g-next version  →  yo @thegrinch00/generator-g-next:version
 *
 * No changes to generator code; this just delegates to yo.
 */

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// yo prepends "generator-" when resolving, so use g-next so it finds @thegrinch00/generator-g-next
const GENERATOR = "@thegrinch00/g-next";

const subcommand = process.argv[2];

const help = `
  g-next – short CLI for ${GENERATOR}

  Usage:
    g-next <subcommand> [options]

  Examples:
    g-next version
    g-next app
    g-next pkg-core
    g-next page
    g-next api

  Subcommands (same as generator names):
    app, version, pkg-core, pkg-mui, pkg-spa, pkg-translations,
    pkg-mongodb, pkg-postgresql, pkg-cookie-auth, page, comp, form,
    api, model, model-mongodb, task, spa, scene, slice, ajax,
    cookie-auth-role, aws-scheduler-role, aws-scheduler,
    aws-update-scheduler, aws-delete-scheduler

  Requires: yo and this package installed (e.g. npm i -g yo @thegrinch00/generator-g-next).
`;

if (!subcommand || subcommand === "-h" || subcommand === "--help") {
  console.log(help.trim());
  process.exit(subcommand === "--help" ? 0 : 1);
}

if (subcommand === "-v" || subcommand === "--version") {
  try {
    const pkgPath = join(
      dirname(fileURLToPath(import.meta.url)),
      "..",
      "package.json",
    );
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    console.log(pkg.version ?? "?");
  } catch {
    console.log("?");
  }
  process.exit(0);
}

const yoArgs = [`${GENERATOR}:${subcommand}`, ...process.argv.slice(3)];
const child = spawn("yo", yoArgs, {
  stdio: "inherit",
  shell: true,
});

child.on("error", (err) => {
  console.error("g-next: failed to run yo. Is yo installed? (npm i -g yo)");
  console.error(err.message);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
