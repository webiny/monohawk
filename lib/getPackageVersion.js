const fetch = require("node-fetch");
const pRetry = require("p-retry");

module.exports.getPackageVersion = (name) => {
  const getVersion = async () => {
    const res = await fetch(`https://registry.npmjs.org/${name}`);
    const json = await res.json();

    return json["dist-tags"]["latest"];
  };

  return pRetry(getVersion, { retries: 5 });
};
