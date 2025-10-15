/**
 * Shared configuration and constants for the application
 */

import Constants from 'expo-constants'

// Environment variables
export const env = {
	API_URL: Constants.expoConfig?.extra?.apiUrl || 'https://api.fitchoice.app',
	isDevelopment: __DEV__,
	isProduction: !__DEV__,
}

// Application constants
export const constants = {
	APP_NAME: 'Fitchoice',
	APP_SCHEME: 'acme',
	
	// Pose detection settings
	POSE_DETECTION: {
		MIN_CONFIDENCE: 0.5,
		MIN_VISIBILITY: 0.5,
	},
	
	// Storage keys
	STORAGE_KEYS: {
		USER_SETTINGS: '@fitchoice:user_settings',
		WORKOUT_HISTORY: '@fitchoice:workout_history',
	},
}

