import { PoseCamera } from '@/components/Pose'
import { Link } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function Page() {
	return (
		<View className="flex flex-1">
			<Header />
			<Content />
			<Footer />
		</View>
	)
}

function Content() {
	return (
		<View className="flex-1">
			<PoseCamera />
		</View>
	)
}

function Header() {
	const { top } = useSafeAreaInsets()
	return (
		<View style={{ paddingTop: top }}>
			<View className="flex h-14 flex-row items-center justify-between px-4 lg:px-6">
				<Link className="flex-1 items-center justify-center font-bold" href="/">
					ACME
				</Link>
				<View className="flex flex-row gap-4 sm:gap-6">
					<Link
						className="text-md font-medium hover:underline web:underline-offset-4"
						href="/"
					>
						About
					</Link>
					<Link
						className="text-md font-medium hover:underline web:underline-offset-4"
						href="/"
					>
						Product
					</Link>
					<Link
						className="text-md font-medium hover:underline web:underline-offset-4"
						href="/"
					>
						Pricing
					</Link>
				</View>
			</View>
		</View>
	)
}

function Footer() {
	const { bottom } = useSafeAreaInsets()
	return (
		<View
			className="native:hidden flex shrink-0 bg-gray-100"
			style={{ paddingBottom: bottom }}
		>
			<View className="flex-1 items-start px-4 py-6 md:px-6">
				<Text className={'text-center text-gray-700'}>
					© {new Date().getFullYear()} Me
				</Text>
			</View>
		</View>
	)
}
