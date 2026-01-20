import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg'
import React from 'react'

export const PurpleGradient = () => {
	return (
		<Svg
			width="100%"
			height="100%"
			style={{ position: 'absolute' }}
			viewBox="0 0 100 100"
			preserveAspectRatio="none"
		>
			<Defs>
				<RadialGradient
					id="purpleGradient"
					cx="0.5"
					cy="0.2"
					r="1.2"
					fx="0.5"
					fy="0.9"
					gradientUnits="objectBoundingBox"
				>
					<Stop offset="0%" stopColor="#675983" stopOpacity="1" />
					<Stop offset="100%" stopColor="#000000" stopOpacity="1" />
				</RadialGradient>
			</Defs>
			<Rect x="0" y="0" width="100" height="100" fill="#000000" />
			<Rect x="0" y="0" width="100" height="100" fill="url(#purpleGradient)" />
		</Svg>
	)
}
