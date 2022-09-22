const path = require("path");
const { inspect, render } = require("../lib");

const ignoreDeps = [
    "@babel/runtime",
    "@hot-loader/react-dom",
    "@pulumi/aws",
    "react-dev-utils",
    "postcss-loader",
    "postcss-normalize"
];

(async () => {
    const monorepo = path.resolve(__dirname, "../../webiny-v5-next");
    const destination = path.resolve(__dirname, "output.json");
    const data = await inspect(monorepo, {
        cacheDir: path.join(__dirname, "cache"),
        filterWorkspaces: (pkg) => pkg.name.startsWith("@webiny"),
        filterDeps: (name) => {
            return !ignoreDeps.includes(name) && !name.startsWith("@webiny");
        },
        shouldFetchSize: (name) => {
            return !name.startsWith("@babel") && !name.startsWith("@types");
        }
    });
    
    await render(data, destination);
})();
