const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const mobileRoot = path.resolve(projectRoot, "mobile");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [mobileRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(mobileRoot, "node_modules"),
];

module.exports = config;