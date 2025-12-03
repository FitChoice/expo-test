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

// Add node_modules resolution for TensorFlow
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, 'node_modules'),
];

// Ensure TensorFlow modules are resolved correctly
config.resolver.extraNodeModules = {
	'@tensorflow/tfjs': path.resolve(projectRoot, 'node_modules/@tensorflow/tfjs'),
	'@tensorflow/tfjs-react-native': path.resolve(projectRoot, 'node_modules/@tensorflow/tfjs-react-native'),
	'@tensorflow-models/pose-detection': path.resolve(projectRoot, 'node_modules/@tensorflow-models/pose-detection'),
	'@mediapipe/pose': path.resolve(projectRoot, 'node_modules/@mediapipe/pose'),
	'@tensorflow/tfjs-backend-webgpu': path.resolve(projectRoot, 'node_modules/@tensorflow/tfjs-backend-webgpu'),
	'@tensorflow/tfjs-backend-wasm': path.resolve(projectRoot, 'node_modules/@tensorflow/tfjs-backend-wasm'),
};

// Custom resolver to handle optional TensorFlow backends
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
	// For webgpu backend, return empty module stub in React Native
	if (moduleName === '@tensorflow/tfjs-backend-webgpu' && platform !== 'web') {
		return {
			type: 'empty',
		};
	}
	
	// Use default resolver for everything else
	if (originalResolveRequest) {
		return originalResolveRequest(context, moduleName, platform);
	}
	return context.resolveRequest(context, moduleName, platform);
};

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
