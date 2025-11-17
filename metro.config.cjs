const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const projectRoot = __dirname;
let config = getDefaultConfig(projectRoot);

// Add path aliases
config.resolver.alias = {
	'@': path.resolve(projectRoot, 'src'),
};

// Configure SVG support - must be before withNativeWind
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

// Performance optimizations
config.transformer.inlineRequires = true;

// Apply NativeWind transformer
config = withNativeWind(config, { input: path.resolve(projectRoot, 'src/global.css') });

// Configure SVG transformer after NativeWind
config.transformer = {
	...config.transformer,
	babelTransformerPath: require.resolve('react-native-svg-transformer'),
	getTransformOptions: async () => ({
		transform: {
			experimentalImportSupport: false,
			inlineRequires: true,
		},
	}),
};

module.exports = config;
