import { PauseModal, StopModal } from '@/widgets/training-session'
import { GreenGradient } from '@/shared/ui/GradientBG'
import { View } from 'react-native'
import { ControlButton } from '@/shared/ui'
import AntDesign from '@expo/vector-icons/AntDesign'
import Entypo from '@expo/vector-icons/Entypo'
import React, {
	ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
	createContext,
	useContext,
} from 'react'
import { router } from 'expo-router'

const CountdownContext = createContext<number>(0)

export const useCountdown = () => useContext(CountdownContext)

export const ExerciseWithCounterWrapper = ({
	children, 
	onComplete, 
	countdownInitial,
}: {
	children: ReactNode
	onComplete: () => void
	countdownInitial?: number
}) => {


	const [showPauseModal, setShowPauseModal] = useState(false)
	const [showStopModal, setShowStopModal] = useState(false)
	const [isPaused, setIsPaused] = useState(false)
	const [countdown, setCountdown] = useState(countdownInitial ?? 0);
	const timerRef = useRef<number | null>(null);



	const tick = useCallback(() => {
		setCountdown((prev) => {
			if (prev <= 1) {
				clearInterval(timerRef.current!);
				timerRef.current = null;
				setTimeout(() => onComplete(), 0);
				return 0;
			}
			return prev - 1;
		});
	}, [onComplete]);

	const onStop = useCallback(() => {
		setShowStopModal(true)
		if (timerRef.current !== null) {
			clearInterval(timerRef.current);
			timerRef.current = null;
			setIsPaused(true);
		}
	}, []);

	const startTimer = useCallback(() => {
		if (timerRef.current !== null) return;
		timerRef.current = setInterval(tick, 1000) as unknown as number;
		setIsPaused(false);
	}, [tick]);

	useEffect(() => {
		// Запускаем таймер при монтировании только если countdownInitial передан
		if (countdownInitial !== undefined) {
			startTimer();
		}
		
		return () => {
			if (timerRef.current !== null) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [startTimer, countdownInitial]);


	const pauseTimer = useCallback(() => {
		setShowPauseModal(true)
		if (timerRef.current !== null) {
			clearInterval(timerRef.current);
			timerRef.current = null;
			setIsPaused(true);
		}
	}, []);

	const resumeTimer = useCallback(() => {
		if (timerRef.current === null && countdown > 0) {
			startTimer();
		}
		setShowPauseModal(false)
	}, [countdown, startTimer]);


	const handleStopResume =  useCallback(() => {
		if (timerRef.current === null && countdown > 0) {
			startTimer();
		}
		setShowStopModal(false)
	}, [countdown, startTimer]);


	const handleStopTraining =() => {
		setShowStopModal(false)
		router.push('/')

	}



	return (
		<CountdownContext.Provider value={countdown}>
			<View className="flex-1">
				<StopModal
					visible={showStopModal}
					onResume={handleStopResume}
					onStop={handleStopTraining}

				/>
				<PauseModal
					visible={showPauseModal}
					onResume={resumeTimer}

				/>


				{/* Gradient Background */}
				<GreenGradient />

				{/* Control Buttons */}
				<View className="absolute left-4 right-4 top-16 z-10 flex-row justify-end gap-2">
					<ControlButton
						icon={<AntDesign name="pause" size={24} color="#FFFFFF" />}
						onPress={pauseTimer}
					/>
					<ControlButton
						icon={<Entypo name="cross" size={24} color="#FFFFFF" />}
						onPress={onStop}
					/>
				</View>

				{children}
			</View>
		</CountdownContext.Provider>
	)
}
