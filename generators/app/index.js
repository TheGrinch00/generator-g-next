import Generator from "yeoman-generator";

const NEXT_VERSION = "16.1.6";
const TS_VERSION = "5.9.2";

export default class AppGenerator extends Generator {
  async install() {
    const run = (cmd, args) =>
      new Promise((resolve, reject) => {
        const child = this.spawnCommand(cmd, args, { stdio: "inherit" });
        child.on("exit", (code) => {
          if (code === 0) return resolve();
          reject(new Error(`${cmd} exited with code ${code}`));
        });
        child.on("error", reject);
      });

    try {
      await run("npx", [
        `create-next-app@${NEXT_VERSION}`,
        ".",
        "--ts",
        "--app",
        "--use-npm",
        "--eslint",
        "--src-dir",
        "--import-alias",
        "@/*",
        "--no-tailwind",
        "--no-turbopack",
      ]);

      await run("npm", ["i", `next@${NEXT_VERSION}`, "-S", "-E"]);
      await run("npm", ["i", `eslint-config-next@${NEXT_VERSION}`, "-D", "-E"]);
      await run("npm", ["i", `typescript@${TS_VERSION}`, "-D", "-E"]);
    } catch (err) {
      this.log("\n❌ Installazione fallita:", err?.message || err);
      throw err;
    }
  }
}
