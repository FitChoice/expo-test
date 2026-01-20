import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg'

export const GradientHeader = () => {
	return (
		<Svg width="100%" height={180} viewBox="0 0 100 100" preserveAspectRatio="none">
			<Defs>
				{/* Зеленый градиент - правая сторона */}
				<RadialGradient
					id="greenGradient"
					cx="1.0"
					cy="0.5"
					r="0.8"
					fx="1.0"
					fy="0.5"
					gradientUnits="objectBoundingBox"
				>
					<Stop offset="0%" stopColor="#C5F680" stopOpacity="0.4" />
					<Stop offset="35%" stopColor="rgb(120, 160, 60)" stopOpacity="0.5" />
					<Stop offset="70%" stopColor="rgb(80, 120, 50)" stopOpacity="0.25" />
					<Stop offset="100%" stopColor="rgb(80, 120, 50)" stopOpacity="0" />
				</RadialGradient>

				{/* Фиолетовый градиент - левая сторона */}
				<RadialGradient
					id="purpleGradient"
					cx="0.0"
					cy="0.5"
					r="0.8"
					fx="0.0"
					fy="0.5"
					gradientUnits="objectBoundingBox"
				>
					<Stop offset="0%" stopColor="rgb(120, 80, 140)" stopOpacity="0.7" />
					<Stop offset="35%" stopColor="rgb(100, 60, 120)" stopOpacity="0.5" />
					<Stop offset="70%" stopColor="rgb(80, 50, 100)" stopOpacity="0.25" />
					<Stop offset="100%" stopColor="rgb(80, 50, 100)" stopOpacity="0" />
				</RadialGradient>
			</Defs>
			<Rect x="0" y="0" width="100" height="100" fill="#0a0a0a" />
			<Rect x="0" y="0" width="100" height="100" fill="url(#greenGradient)" />
			<Rect x="0" y="0" width="100" height="100" fill="url(#purpleGradient)" />
		</Svg>
	)
}
