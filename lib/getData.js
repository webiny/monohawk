const path = require("path");
const fs = require("fs-extra");
const resolvePackagePath = require("resolve-package-path");
const { green } = require("chalk");
const allWorkspaces = require("./getWorkspaces");
const { fetchSizes } = require("./fetchSizes");
const { getPackageVersion } = require("./getPackageVersion");

module.exports = async (root, { cacheDir, shouldFetchSize, filterWorkspaces, filterDeps }) => {
    const packages = getPackages(root, filterWorkspaces);

    const deps = new Map();

    for (const package of packages) {
        extractDependencies(deps, package, filterDeps);
    }

    const statsCachePath = path.join(cacheDir, "deps.json");
    const npmCachePath = path.join(cacheDir, "npmVersions.json");
    const statsCache = fs.existsSync(statsCachePath) ? require(statsCachePath) : [];
    const npmCache = fs.existsSync(npmCachePath) ? require(npmCachePath) : {};

    const depNames = Array.from(deps.keys());

    const fetchDeps = depNames
        .filter((name) => {
            return shouldFetchSize ? shouldFetchSize(name) : true;
        })
        .reduce((acc, name) => {
            const pkg = deps.get(name);
            pkg.versions.forEach((version) => {
                const inCache = statsCache.find(
                    (item) => item.name === name && item.version === version
                );

                if (!inCache) {
                    acc.push([name, version]);
                }
            });

            return acc;
        }, []);

    console.log(`Using cached stats for ${green(deps.size - fetchDeps.length)} packages.`);

    if (fetchDeps.length) {
        console.log(`Fetching stats for ${green(fetchDeps.length)} packages...`);
        console.log(`Please wait, stats are being loaded from bundlephobia.com...`);
        const stats = await fetchSizes(fetchDeps);
        const loadedStats = Object.keys(stats).length;
        console.log(`Loaded stats for ${loadedStats} packages.`);
        if (loadedStats !== fetchDeps.length) {
            console.log(
                `${green(
                    fetchDeps.length - loadedStats
                )} packages could not be loaded. To retry, please rerun the script at a later time.`
            );
        }
        stats.forEach((data) => {
            statsCache.push(data);
        });
        await fs.writeFile(statsCachePath, JSON.stringify(statsCache, null, 2));
    }

    console.log(`Fetching latest package versions...`);
    await Promise.allSettled(
        depNames
            .filter((name) => !(name in npmCache))
            .map(async (name) => {
                npmCache[name] = await getPackageVersion(name);
            })
    );

    await fs.writeFile(npmCachePath, JSON.stringify(npmCache, null, 2));

    // Construct report
    for (const name of depNames) {
        const pkg = deps.get(name);
        pkg.sizes = {};
        pkg.latestVersion = npmCache[name];
        statsCache
            .filter((item) => item.name === name && pkg.versions.includes(item.version))
            .forEach((item) => {
                pkg.sizes[item.version] = item.stats === "UNSUPPORTED" ? null : item.stats;
            });
        deps.set(name, pkg);
    }

    return Array.from(deps.values());
};

const ignoreDeps = ["path", "os", "fs", "util", "events", "crypto", "url"];

const extractDependencies = (target, package, filter) => {
    const keys = ["dependencies", "devDependencies"];
    for (const depsKey of keys) {
        for (const key in package.json[depsKey]) {
            if (ignoreDeps.includes(key)) {
                continue;
            }

            if (!filter || filter(key)) {
                const pkgJsonPath = resolvePackagePath(key, package.path);

                const { version } = require(pkgJsonPath);

                const data = target.get(key) || { name: key, versions: [], usedBy: [] };

                if (!data.versions.includes(version)) {
                    data.versions.push(version);
                }

                data.usedBy.push({
                    name: package.name,
                    version,
                    location: package.path,
                    type: depsKey
                });
                target.set(key, data);
            }
        }
    }
};

const getPackages = (root, filter = null) => {
    return allWorkspaces(root)
        .map((folder) => {
            const json = require(path.join(folder, "package.json"));
            return {
                json,
                name: json.name,
                path: folder
            };
        })
        .filter((pkg) => {
            if (!filter) {
                return true;
            }

            return filter(pkg);
        });
};
