import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg'

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
					id="purpleGradientRight"
					cx="0.5"
					cy="-0.8"
					r="3"
					fx="-1"
					fy="0.5"
					gradientUnits="objectBoundingBox"
				>
					<Stop offset="15%" stopColor="#BA9BF7" stopOpacity="0.9" />
					<Stop offset="30%" stopColor="#8E7BC1" stopOpacity="0.7" />
					<Stop offset="45%" stopColor="#5E5280" stopOpacity="0.5" />
					<Stop offset="60%" stopColor="#2F2940" stopOpacity="0.3" />
					<Stop offset="80%" stopColor="#000000" stopOpacity="0.1" />
					<Stop offset="100%" stopColor="#000000" stopOpacity="1" />
				</RadialGradient>
			</Defs>
			<Rect x="0" y="0" width="100" height="100" fill="#000000" />
			<Rect x="0" y="0" width="100" height="100" fill="url(#purpleGradientRight)" />
		</Svg>
	)
}