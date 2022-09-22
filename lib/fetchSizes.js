const fetch = require("node-fetch");
const { green } = require("chalk");
const ora = require("ora");

const fetchPackageStats = async (input) => {
    const [name, version] = input;

    const res = await fetch(`https://bundlephobia.com/api/size?package=${name}@${version}`, {
        headers: {
            "User-Agent": "bundle-phobia-cli",
            "X-Bundlephobia-User": "bundle-phobia-cli"
        }
    });

    const json = await res.json();

    if (!json.error) {
        return json;
    }

    throw new Error(json.error.message);
};

module.exports = {
    fetchSizes: async (names) => {
        const sizes = [];
        const spinner = ora().start();
        for (const [name, version] of names) {
            try {
                spinner.text = `Loading stats for ${green(name + "@" + version)}...`;
                const {
                    size,
                    repository,
                    gzip,
                    description,
                    dependencySizes
                } = await fetchPackageStats([name, version]);

                sizes.push({
                    name,
                    version,
                    stats: { size, repository, gzip, description, dependencySizes }
                });

                await new Promise((resolve) => {
                    setTimeout(resolve, 50);
                });
            } catch (err) {
                if (
                    err.message.includes("unsupported and cannot be built") ||
                    err.message.includes("doesn't exist") ||
                    err.message.includes("Failed to build")
                ) {
                    sizes.push({
                        name,
                        version,
                        stats: "UNSUPPORTED"
                    });
                }
            }
        }
        spinner.stop();
        return sizes;
    },
    fetchPackageStats
};
