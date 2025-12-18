import * as ImagePicker from 'expo-image-picker'

export type AvatarPickSource = 'camera' | 'library'

export type AvatarPickResult = {
	uri: string
	width?: number
	height?: number
	fileName: string
	mimeType: string
}

export type AvatarPickResponse =
	| { status: 'picked'; asset: AvatarPickResult }
	| { status: 'denied' }
	| { status: 'cancelled' }

const extractFileName = (uri: string, fallback: string) => {
	const parts = uri.split('/')
	return parts[parts.length - 1] || fallback
}

export const pickAvatarImage = async (
	source: AvatarPickSource
): Promise<AvatarPickResponse> => {
	const permission =
		source === 'camera'
			? await ImagePicker.requestCameraPermissionsAsync()
			: await ImagePicker.requestMediaLibraryPermissionsAsync()

	if (permission.status !== 'granted') {
		return { status: 'denied' }
	}

	const result =
		source === 'camera'
			? await ImagePicker.launchCameraAsync({
					mediaTypes: ImagePicker.MediaTypeOptions.Images,
					allowsEditing: true,
					quality: 0.9,
				})
			: await ImagePicker.launchImageLibraryAsync({
					mediaTypes: ImagePicker.MediaTypeOptions.Images,
					allowsEditing: true,
					quality: 0.9,
				})

	if (result.canceled || !result.assets?.length) {
		return { status: 'cancelled' }
	}

	const asset = result.assets[0]
	const fileName =
		asset.fileName || extractFileName(asset.uri, `avatar_${Date.now()}.jpg`)
	const mimeType = asset.mimeType || 'image/jpeg'

	return {
		status: 'picked',
		asset: {
			uri: asset.uri,
			width: asset.width,
			height: asset.height,
			fileName,
			mimeType,
		},
	}
}
