import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg'

export const GradientHeader = () => {
	return (
		<Svg width="100%" height={180} viewBox="0 0 100 100" preserveAspectRatio="none">
			<Defs>
				{/* Зеленый градиент - верхний правый */}
				<RadialGradient
					id="greenGradient"
					cx="0.85"
					cy="0.15"
					r="0.6"
					fx="0.95"
					fy="0.15"
					gradientUnits="objectBoundingBox"
				>
					<Stop offset="0%" stopColor="rgb(197, 246, 128)" stopOpacity="0.35" />
					<Stop offset="30%" stopColor="rgb(197, 246, 128)" stopOpacity="0.2" />
					<Stop offset="60%" stopColor="rgb(197, 246, 128)" stopOpacity="0.08" />
					<Stop offset="100%" stopColor="rgb(197, 246, 128)" stopOpacity="0" />
				</RadialGradient>

				{/* Фиолетовый градиент - нижний левый */}
				<RadialGradient
					id="purpleGradient"
					cx="0.15"
					cy="0.65"
					r="0.6"
					fx="0.05"
					fy="0.45"
					gradientUnits="objectBoundingBox"
				>
					<Stop offset="0%" stopColor="rgb(186, 155, 247)" stopOpacity="0.3" />
					<Stop offset="30%" stopColor="rgb(186, 155, 247)" stopOpacity="0.18" />
					<Stop offset="60%" stopColor="rgb(186, 155, 247)" stopOpacity="0.06" />
					<Stop offset="100%" stopColor="rgb(186, 155, 247)" stopOpacity="0" />
				</RadialGradient>
			</Defs>
			<Rect x="0" y="0" width="100" height="100" fill="#000000" />
			<Rect x="0" y="0" width="100" height="100" fill="url(#greenGradient)" />
			<Rect x="0" y="0" width="100" height="100" fill="url(#purpleGradient)" />
		</Svg>
	)
}
