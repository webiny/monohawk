const path = require("path");
const getYarnWorkspaces = require("get-yarn-workspaces");

module.exports = (root) => {
  return getYarnWorkspaces(root).map((pkg) => pkg.replace(/\//g, path.sep));
};
