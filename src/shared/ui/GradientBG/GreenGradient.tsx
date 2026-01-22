import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg'

export const GreenGradient = () => {
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
					id="greenGradientRight"
					cx="0"
					cy="0.2"
					r="1.6"
					fx="-0.5	"
					fy="0.3"
					gradientUnits="objectBoundingBox"
				>
					<Stop offset="0%" stopColor="rgb(150, 200, 100)" stopOpacity="1" />
					<Stop offset="15%" stopColor="rgb(120, 160, 80)" stopOpacity="0.95" />
					<Stop offset="30%" stopColor="rgb(90, 120, 60)" stopOpacity="0.85" />
					<Stop offset="45%" stopColor="rgb(60, 80, 40)" stopOpacity="0.7" />
					<Stop offset="60%" stopColor="rgb(40, 50, 25)" stopOpacity="0.5" />
					<Stop offset="80%" stopColor="rgb(20, 25, 15)" stopOpacity="0.3" />
					<Stop offset="100%" stopColor="rgb(0, 0, 0)" stopOpacity="1" />
				</RadialGradient>
			</Defs>
			<Rect x="0" y="0" width="100" height="100" fill="#000000" />
			<Rect x="0" y="0" width="100" height="100" fill="url(#greenGradientRight)" />
		</Svg>
	)
}
