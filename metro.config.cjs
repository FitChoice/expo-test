const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Add path aliases
config.resolver.alias = {
	'@': path.resolve(projectRoot, 'src'),
};

// Configure SVG support
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

// Performance optimizations
config.transformer.inlineRequires = true;

module.exports = config;
