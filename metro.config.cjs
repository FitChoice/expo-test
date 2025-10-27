const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add path aliases
config.resolver.alias = {
	'@': './src',
};

// Configure SVG support
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

// Performance optimizations
config.transformer.inlineRequires = true; // Auto-optimize imports for faster startup

// Exclude providers from Expo Router (only for routing, not for imports)
// config.resolver.blockList = [
// 	/.*\/src\/app\/_providers\/.*/,
// ];

module.exports = withNativeWind(config, { 
	input: "./src/global.css",
	configPath: "./tailwind.config.cjs",
});
