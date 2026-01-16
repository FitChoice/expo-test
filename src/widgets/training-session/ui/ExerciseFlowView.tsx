import { View } from 'react-native'
import type * as posedetection from '@tensorflow-models/pose-detection'
import type * as ScreenOrientation from 'expo-screen-orientation'

import { BodyPositionScreen } from './exercise/BodyPositionScreen'
import { RestScreen } from './exercise/RestScreen'
import { RotateScreen } from './exercise/RotateScreen'
import { ExerciseExecutionScreen } from './exercise/ExerciseExecutionScreen'
import { ExerciseTheoryScreen } from './exercise/ExerciseTheoryScreen'
import type { ExerciseInfoResponse } from '@/entities/training'
import type { ExerciseStep } from '@/features/training-session'
import { ExerciseWithCounterWrapper } from './ExerciseWithCounterWrapper/ExerciseWithCounterWrapper'

type ExerciseFlowViewProps = {
	model: posedetection.PoseDetector
	orientation: ScreenOrientation.Orientation

	currentStep: ExerciseStep
	exercise: ExerciseInfoResponse
	currentSet: number
	currentSide: 'left' | 'right'
	executionKey: string
	restDuration: number
	practiceVideoUrl: string | null

	currentExerciseIndex: number
	totalExercises: number
	exerciseProgressRatio: number

	onRotateComplete: () => void
	onCountdownComplete: () => void
	onPositionComplete: () => void
	onExecutionComplete: () => void
	onSideSwitchComplete: () => void
	onRestComplete: () => void
}

export function ExerciseFlowView({
	model,
	orientation,
	currentStep,
	exercise,
	currentSet,
	currentSide,
	executionKey,
	restDuration,
	practiceVideoUrl,
	currentExerciseIndex,
	totalExercises,
	exerciseProgressRatio,
	onRotateComplete,
	onCountdownComplete,
	onPositionComplete,
	onExecutionComplete,
	onSideSwitchComplete,
	onRestComplete,
}: ExerciseFlowViewProps) {
	// Action buttons should be hidden during rest to match existing design
	const isShowActionButtons = currentStep !== 'rest'

	return (
		<ExerciseWithCounterWrapper isShowActionButtons={isShowActionButtons}>
			<View className="flex-1">
				{currentStep === 'rotate' && (
					<RotateScreen isVertical={!exercise.is_horizontal} onComplete={onRotateComplete} />
				)}
				{currentStep === 'position' && (
					<BodyPositionScreen
						isVertical={!exercise.is_horizontal}
						key="position-check"
						onComplete={onPositionComplete}
						model={model}
						orientation={orientation}
					/>
				)}

				{currentStep === 'theory' && (
					<ExerciseTheoryScreen
						exercise={exercise}
						currentSet={currentSet}
						onComplete={onCountdownComplete}
						isVertical={!exercise.is_horizontal}
						currentExerciseIndex={currentExerciseIndex}
						totalExercises={totalExercises}
						exerciseProgressRatio={exerciseProgressRatio}
					/>
				)}

				{currentStep === 'execution' && (
					<ExerciseExecutionScreen
						key={executionKey}
						model={model}
						orientation={orientation}
						onComplete={onExecutionComplete}
						exercise={exercise}
						isVertical={!exercise.is_horizontal}
						practiceVideoUrl={practiceVideoUrl ?? exercise.video_practice}
						currentExerciseIndex={currentExerciseIndex}
						totalExercises={totalExercises}
						exerciseProgressRatio={exerciseProgressRatio}
					/>
				)}

				{currentStep === 'side_switch' && (
					<BodyPositionScreen
						key="side-switch"
						onComplete={onSideSwitchComplete}
						model={model}
						orientation={orientation}
						targetSide={currentSide}
						title="Смена рабочей стороны"
						titleClassName="mb-2 text-left text-h1 text-brand-green-500"
						subtitle="Повернитесь другой стороной к камере"
						isVertical={!exercise.is_horizontal}
					/>
				)}
				{currentStep === 'rest' && (
					<RestScreen
						onComplete={onRestComplete}
						duration={restDuration}
						exercise={exercise}
						currentSet={currentSet}
					/>
				)}
			</View>
		</ExerciseWithCounterWrapper>
	)
}
