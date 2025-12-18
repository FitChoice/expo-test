import { View } from 'react-native'
import type * as posedetection from '@tensorflow-models/pose-detection'
import type * as ScreenOrientation from 'expo-screen-orientation'

import { BodyPositionScreen } from './exercise/BodyPositionScreen'
import { RestScreen } from './exercise/RestScreen'
import { RotateScreen } from './exercise/RotateScreen'
import { ExerciseExecutionScreen } from './exercise/ExerciseExecutionScreen'
import { ExerciseTheoryScreen } from './exercise/ExerciseTheoryScreen'
import type { ExerciseInfoResponse } from '@/entities/training'

type ExerciseStep =
	| 'theory'
	| 'position'
	| 'execution'
	| 'side_switch'
	| 'rest'
	| 'rotate'

type ExerciseFlowViewProps = {
	model: posedetection.PoseDetector
	orientation: ScreenOrientation.Orientation

	currentStep: ExerciseStep
	exercise: ExerciseInfoResponse
	currentSet: number
	executionKey: string
	restPhase: 'main' | 'practice'
	mainRestDuration: number
	practiceVideoUrl: string | null

	onRotateComplete: () => void
	onCountdownComplete: () => void
	onPositionComplete: () => void
	onExecutionComplete: () => void
	onSideSwitchComplete: () => void
	onRestPhaseComplete: () => void
	onRestComplete: () => void
}

export function ExerciseFlowView({
	model,
	orientation,
	currentStep,
	exercise,
	currentSet,
	executionKey,
	restPhase,
	mainRestDuration,
	practiceVideoUrl,
	onRotateComplete,
	onCountdownComplete,
	onPositionComplete,
	onExecutionComplete,
	onSideSwitchComplete,
	onRestPhaseComplete,
	onRestComplete,
}: ExerciseFlowViewProps) {
	return (
		<View className="flex-1">
			{currentStep === 'rotate' && (
				<RotateScreen
					isVertical={!exercise.is_horizontal}
					onComplete={onRotateComplete}
				/>
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
				/>
			)}

			{currentStep === 'side_switch' && (
				<BodyPositionScreen
					key="side-switch"
					onComplete={onSideSwitchComplete}
					model={model}
					type="side_switch"
					orientation={orientation}
					title="Смена рабочей стороны"
					titleClassName="mb-2 text-left text-h1 text-brand-green-500"
					subtitle=""
					isVertical={!exercise.is_horizontal}
				/>
			)}
			{currentStep === 'rest' && (
				<>
					{restPhase === 'main' && (
						<RestScreen
							onComplete={onRestPhaseComplete}
							duration={mainRestDuration}
							exercise={exercise}
							currentSet={currentSet}
						/>
					)}
					{restPhase === 'practice' && (
						<ExerciseTheoryScreen
							exercise={exercise}
							currentSet={currentSet}
							onComplete={onRestComplete}
							isVertical
							videoUrlOverride={practiceVideoUrl ?? exercise.video_practice}
							durationOverrideSeconds={10}
						/>
					)}
				</>
			)}
		</View>
	)
}
