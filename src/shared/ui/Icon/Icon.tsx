import React from 'react'
import { View, StyleSheet } from 'react-native'
import { IconName } from './types'

// Импорт SVG иконок
import Eye from './assets/eye.svg'
import EyeSlash from './assets/eye-slashed.svg'
import ChevronDown from './assets/chevron-down.svg'
import ChevronLeft from './assets/chevron-left.svg'
import ChevronRight from './assets/chevron-right.svg'
import ChevronsRight from './assets/chevrons-right.svg'
import ChevronUp from './assets/chevron-up.svg'
import ArrowForward from './assets/arrow-forward.svg'
import ArrowBack from './assets/arrow-back.svg'
import Close from './assets/close.svg'
import Check from './assets/check.svg'
import CheckCircle from './assets/check-circle.svg'
import Plus from './assets/plus.svg'
import Share from './assets/share.svg'
import Reload from './assets/reload.svg'
import SignOut from './assets/sign-out.svg'
import TrashSimple from './assets/trash-simple.svg'
import PencilSimple from './assets/pencil-simple.svg'
import Info from './assets/info.svg'
import Warning from './assets/warning.svg'
import User from './assets/user.svg'
import UserCircle from './assets/user-circle.svg'
import GearFine from './assets/gear-fine.svg'
import DotsThreeVertical from './assets/dots-three-vertical.svg'
import GenderFemale from './assets/gender-female.svg'
import GenderMale from './assets/gender-male.svg'
import House from './assets/house.svg'
import Camera from './assets/camera.svg'
import File from './assets/file.svg'
import Image from './assets/image.svg'
import Timer from './assets/timer.svg'
import Fire from './assets/fire.svg'
import Lightning from './assets/lightning.svg'
import CalendarDots from './assets/calendar-dots.svg'
import Ruler from './assets/ruler.svg'
import Barbell from './assets/barbell.svg'
import HealthKnees from './assets/health-knees.svg'
import HealthNeckShoulders from './assets/health-neck-shoulders.svg'
import HealthBackPain from './assets/health-back-pain.svg'
import HealthPregnancy from './assets/health-pregnancy.svg'
import HealthChildbirth from './assets/health-childbirth.svg'
import HealthVaricose from './assets/health-varicose.svg'
import HealthHernia from './assets/health-hernia.svg'
import HealthScoliosis from './assets/health-scoliosis.svg'
import HealthHip from './assets/health-hip.svg'
import HealthPressure from './assets/health-pressure.svg'
import HealthWellbeing from './assets/health-wellbeing.svg'
import GoalLoseWeight from './assets/goal-lose-weight.svg'
import GoalPainRelief from './assets/goal-pain-relief.svg'
import GoalReduceStress from './assets/goal-reduce-stress.svg'
import GoalFlexibility from './assets/goal-flexibility.svg'
import GoalPosture from './assets/goal-posture.svg'
import GoalStrengthen from './assets/goal-strengthen.svg'
import GoalEnergy from './assets/goal-energy.svg'
import WorkoutTherapeutic from './assets/workout-therapeutic.svg'
import WorkoutRehabilitation from './assets/workout-rehabilitation.svg'
import WorkoutMeditation from './assets/workout-meditation.svg'
import WorkoutStretching from './assets/workout-stretching.svg'
import WorkoutCardio from './assets/workout-cardio.svg'
import WorkoutStrength from './assets/workout-strength.svg'
import WorkoutHealthyBack from './assets/workout-healthy-back.svg'
import Main from './assets/main.svg'
import Additional from './assets/additional.svg'
import Diary from './assets/diary.svg'
import Back from './assets/back.svg'
import Dumbbell from './assets/dumbbell.svg'
import GoalDumbbell from './assets/goal-dumbbel.svg'
import GoalHabit from './assets/goal-habit.svg'
import GoalPleasure from './assets/goal-pleasure.svg'
import GoalTechnique from './assets/goal-technique.svg'
import GoalStamina from './assets/goal-stamina.svg'

interface IconProps {
	name: IconName
	size?: number
	color?: string
	style?: object
}

// Маппинг имен иконок на SVG компоненты
const iconMap: Record<
	IconName,
	React.FC<{ width?: number; height?: number; fill?: string; style?: object }>
> = {
	'chevron-down': ChevronDown,
	'chevron-left': ChevronLeft,
	'chevron-right': ChevronRight,
	'chevrons-right': ChevronsRight,
	'chevron-up': ChevronUp,
	'arrow-forward': ArrowForward,
	'arrow-back': ArrowBack,
	close: Close,
	check: Check,
	'check-circle': CheckCircle,
	plus: Plus,
	share: Share,
	reload: Reload,
	'sign-out': SignOut,
	'trash-simple': TrashSimple,
	'pencil-simple': PencilSimple,
	info: Info,
	warning: Warning,
	eye: Eye,
	'eye-slash': EyeSlash,
	user: User,
	'user-circle': UserCircle,
	'gear-fine': GearFine,
	'dots-three-vertical': DotsThreeVertical,
	'gender-female': GenderFemale,
	'gender-male': GenderMale,
	house: House,
	camera: Camera,
	file: File,
	image: Image,
	timer: Timer,
	fire: Fire,
	lightning: Lightning,
	'calendar-dots': CalendarDots,
	ruler: Ruler,
	barbell: Barbell,
	clock: Timer, // Using timer as clock placeholder
	'clock-time-eight': Timer, // Using timer as clock-time-eight placeholder
	star: Lightning, // Using lightning as star placeholder temporarily
	pause: Timer, // Using timer as pause placeholder temporarily
	activity: Lightning, // Using lightning as activity placeholder
	repeat: Timer, // Using timer as repeat placeholder
	target: Lightning, // Using lightning as target placeholder
	'bow-arrow': Lightning, // Using lightning as bow-arrow placeholder
	'health-knees': HealthKnees,
	'health-neck-shoulders': HealthNeckShoulders,
	'health-back-pain': HealthBackPain,
	'health-pregnancy': HealthPregnancy,
	'health-childbirth': HealthChildbirth,
	'health-varicose': HealthVaricose,
	'health-hernia': HealthHernia,
	'health-scoliosis': HealthScoliosis,
	'health-hip': HealthHip,
	'health-pressure': HealthPressure,
	'health-wellbeing': HealthWellbeing,
	'goal-lose-weight': GoalLoseWeight,
	'goal-pain-relief': GoalPainRelief,
	'goal-reduce-stress': GoalReduceStress,
	'goal-flexibility': GoalFlexibility,
	'goal-posture': GoalPosture,
	'goal-strengthen': GoalStrengthen,
	'goal-energy': GoalEnergy,
	'workout-therapeutic': WorkoutTherapeutic,
	'workout-rehabilitation': WorkoutRehabilitation,
	'workout-meditation': WorkoutMeditation,
	'workout-stretching': WorkoutStretching,
	'workout-cardio': WorkoutCardio,
	'workout-strength': WorkoutStrength,
	'workout-healthy-back': WorkoutHealthyBack,
	main: Main,
	additional: Additional,
	diary: Diary,
	back: Back,
	dumbbell:Dumbbell,
	'goal-dumbbell': GoalDumbbell,
	'goal-habit' : GoalHabit,
	'goal-pleasure' : GoalPleasure,
	 'goal-technique': GoalTechnique,
	'goal-stamina' : GoalStamina,
}

// Компонент иконок
export const Icon: React.FC<IconProps> = ({
	name,
	size = 24,
	color = '#000000',
	style,
}) => {
	const IconComponent = iconMap[name]

	if (!IconComponent) {
		console.warn(`Icon "${name}" not found`)
		return null
	}

	return (
		<View style={[styles.container, { width: size, height: size }, style]}>
			<IconComponent
				width={size}
				height={size}
				fill={color}
				// Переопределяем currentColor для React Native
				style={{ color: color }}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		justifyContent: 'center',
		alignItems: 'center',
	},
})
