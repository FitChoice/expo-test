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
		

				{/* Зеркальный градиент справа */}
				<RadialGradient
					id="greenGradientRight"
					cx="1"
					cy="0.2"
					r="0.9"
					fx="0.8"
					fy="0.66"
					gradientUnits="objectBoundingBox"
				>
					<Stop offset="0%" stopColor="rgb(100, 120, 60)" stopOpacity="0.8" />
					<Stop offset="20%" stopColor="rgb(80, 100, 50)" stopOpacity="0.6" />
					<Stop offset="40%" stopColor="rgb(60, 80, 40)" stopOpacity="0.4" />
					<Stop offset="60%" stopColor="rgb(40, 50, 25)" stopOpacity="0.3" />
					<Stop offset="80%" stopColor="rgb(20, 25, 15)" stopOpacity="0.2" />
					<Stop offset="100%" stopColor="rgb(0, 0, 0)" stopOpacity="1" />
				</RadialGradient>

			
			</Defs>
			<Rect x="0" y="0" width="100" height="100" fill="#000000" />
			<Rect x="0" y="0" width="100" height="100" fill="url(#greenGradientLeft)" />
			<Rect x="0" y="0" width="100" height="100" fill="url(#greenGradientRight)" />
		</Svg>
	)
}

