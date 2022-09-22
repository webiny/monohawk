const path = require("path");
const fs = require("fs-extra");
const { blueBright } = require("chalk");
const execa = require("execa");
const { getData } = require("../src/getData");

(async () => {
    const repo = process.argv[2];
    if (!repo) {
        console.error(`You must specify a path to monorepo to inspect!`);
        return;
    }

    const repoPath = path.join(process.cwd(), repo);

    // Inspect monorepo
    console.log(`Inspecting ${blueBright(repoPath)}`);
    const destination = path.resolve(__dirname, "output.json");
    const data = await getData(repoPath, {
        cacheDir: path.join(__dirname, "cache"),
        // filterWorkspaces: (pkg) => pkg.name.startsWith("@webiny")
    });

    // Store generated data
    console.log(`Rendering output to ${blueBright(destination)}`);
    await fs.writeFile(destination, JSON.stringify(data, null, 2));

    // Run web app
    console.log(`Starting web app...`);
    const webDir = path.join(process.cwd(), "web");
    await fs.copy(destination, path.join(webDir, "src/output.json"));
    await execa("yarn", ["start"], { cwd: webDir, stdio: "inherit" });
})();
