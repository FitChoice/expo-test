import { PauseModal, StopModal } from '@/widgets/training-session'
import { GreenGradient } from '@/shared/ui/GradientBG'
import { View } from 'react-native'
import { ControlButton } from '@/shared/ui'
import AntDesign from '@expo/vector-icons/AntDesign'
import Entypo from '@expo/vector-icons/Entypo'
import React, {
    type ReactNode,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react'
import { router } from 'expo-router'
import type { VideoPlayer } from 'expo-video'
import { VideoPlayerContext, VideoPlayerContextValue } from '@/shared/hooks/useVideoPlayerContext'

export const ExerciseWithCounterWrapper = ({
    children,
    isShowActionButtons = true,
}: {
	children: ReactNode

	countdownInitial?: number
	isShowActionButtons?: boolean
}) => {

    const [showPauseModal, setShowPauseModal] = useState(false)
    const [showStopModal, setShowStopModal] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const timerRef = useRef<number | null>(null)
    const videoPlayersRef = useRef<Set<VideoPlayer>>(new Set())

    const onStop = useCallback(() => {
        setShowStopModal(true)
        if (timerRef.current !== null) {
            clearInterval(timerRef.current)
            timerRef.current = null
            setIsPaused(true)
        }
        // Пауза видео
        videoPlayersRef.current.forEach((player) => {
            try {
                player.pause()
            } catch (e) {
                console.error('Error pausing video:', e)
            }
        })
    }, [])

    const pauseTimer = useCallback(() => {
		
        setShowPauseModal(true)

        // Пауза видео
        videoPlayersRef.current.forEach((player) => {
	
            try {
                player.pause()
            } catch (e) {
                console.error('Error pausing video:', e)
            }
        })
    }, [])

    const resumeTimer = useCallback(() => {

        setShowPauseModal(false)
        // Возобновление видео
        videoPlayersRef.current.forEach((player) => {
            try {
                player.play()
            } catch (e) {
                // Игнорируем ошибки если плеер уже уничтожен
            }
        })
    }, [ ])

    const handleStopResume =  useCallback(() => {

        setShowStopModal(false)
        // Возобновление видео
        videoPlayersRef.current.forEach((player) => {
            try {
                player.play()
            } catch (e) {
                // Игнорируем ошибки если плеер уже уничтожен
            }
        })
    }, [setShowStopModal ])

    const handleStopTraining = () => {
        setShowStopModal(false)
        router.push('/home')

    }

    const registerPlayer = useCallback((player: VideoPlayer) => {

        videoPlayersRef.current.add(player)
	
        return () => {
            videoPlayersRef.current.delete(player)
			
        }
    }, [])

    const videoPlayerContextValue = useMemo<VideoPlayerContextValue>(() => ({
        registerPlayer,
    }), [registerPlayer])

    return (
        <VideoPlayerContext.Provider value={videoPlayerContextValue}>
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
                {isShowActionButtons &&
				
				<View className="absolute left-4 right-4 top-5 z-10 flex-row justify-end gap-2 ">
				    <ControlButton
				        icon={<AntDesign name="pause" size={24} color="#FFFFFF" />}
				        onPress={pauseTimer}
				    />
				    <ControlButton
				        icon={<Entypo name="cross" size={24} color="#FFFFFF" />}
				        onPress={onStop}
				    />
				</View>
                }

                {children}
            </View>
        </VideoPlayerContext.Provider>
    )
}
