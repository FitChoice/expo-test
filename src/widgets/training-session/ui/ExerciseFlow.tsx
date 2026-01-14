/**
 * ExerciseFlow widget
 * - Owns step FSM + UI flow
 * - Delegates server-side effects via injected callbacks
 */

import type * as posedetection from '@tensorflow-models/pose-detection'
import type * as ScreenOrientation from 'expo-screen-orientation'
import { useKeepAwake } from 'expo-keep-awake'

import {
	useTrainingStore,
	type CompleteTrainingInput,
	type ExecuteExerciseInput,
} from '@/entities/training'
import { ExerciseFlowView } from './ExerciseFlowView'
import { useTrainingFlow } from '@/features/training-session'

type ExerciseFlowProps = {
	model: posedetection.PoseDetector
	orientation: ScreenOrientation.Orientation
	onExecuteExercise: (payload: ExecuteExerciseInput) => Promise<unknown>
	onCompleteTraining: (payload: CompleteTrainingInput) => Promise<unknown>
}

export function ExerciseFlow({
	model,
	orientation,
	onExecuteExercise,
	onCompleteTraining,
}: ExerciseFlowProps) {
	useKeepAwake()

	const exercises = useTrainingStore((state) => state.exerciseDetails)
	const training = useTrainingStore((state) => state.training)

	// FSM logic from feature hook
	const {
		currentStep,
		currentExercise,
		currentSideState,
		restPhase,
		displayCurrentSet,
		practiceVideoUrl,
		mainRestDuration,
		executionKey,
		handleRotateComplete,
		handleTheoryComplete,
		handlePositionComplete,
		handleExecutionComplete,
		handleRestComplete,
		handleRestPhaseComplete,
		handleSideSwitchComplete,
	} = useTrainingFlow({
		exercises,
		onExecuteExercise,
		onCompleteTraining,
	})

	if (!currentExercise || !training?.id) return null

	return (
		<ExerciseFlowView
			model={model}
			orientation={orientation}
			currentStep={currentStep}
			exercise={currentExercise}
			currentSet={displayCurrentSet}
			currentSide={currentSideState}
			executionKey={executionKey}
			restPhase={restPhase}
			mainRestDuration={mainRestDuration}
			practiceVideoUrl={practiceVideoUrl}
			onRotateComplete={handleRotateComplete}
			onCountdownComplete={handleTheoryComplete}
			onPositionComplete={handlePositionComplete}
			onExecutionComplete={handleExecutionComplete}
			onSideSwitchComplete={handleSideSwitchComplete}
			onRestPhaseComplete={handleRestPhaseComplete}
			onRestComplete={handleRestComplete}
		/>
	)
}
