const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Watch folders for monorepo packages
config.watchFolders = [
  path.resolve(__dirname, "../../packages"),
];

// Resolve node_modules from both app and root
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(__dirname, "../../node_modules"),
  path.resolve(__dirname, "../../packages/types/node_modules"),
];

module.exports = config;
