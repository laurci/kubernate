import {writeFileSync} from "fs";
import {join as pathJoin} from "path";
const packageJson = require("../../package.json");
const rimraf = require("rimraf");
import {cp} from "shelljs";

const preparePackage = (input: any) => {
    const VERSION = process.env["KUBERNATE_VERSION"] ?? process.argv.pop();
    return {
        ...input,
        version: VERSION,
        main: "index.js",
        types: "index.d.ts",
        devDependencies: undefined,
        scripts: undefined,
        files: ["*.js", "*.d.ts", "**/*.js", "**/*.json", "**/*.d.ts"],
        bin: {
            kubernate: "./cli/bin.js",
        },
    };
};

writeFileSync(pathJoin(__dirname, "../../dist/package.json"), JSON.stringify(preparePackage(packageJson), null, 4));
cp("README.md", "dist/README.md");
rimraf("dist/scripts", () => {});
rimraf("dist/generator", () => {});
rimraf("dist/**.d.ts.map", () => {});
rimraf("dist/tsconfig.tsbuildinfo", () => {});
