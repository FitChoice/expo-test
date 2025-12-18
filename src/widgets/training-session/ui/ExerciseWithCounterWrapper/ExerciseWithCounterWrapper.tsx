import { GreenGradient } from '@/shared/ui/GradientBG'
import { ControlButton } from '@/shared/ui'
import AntDesign from '@expo/vector-icons/AntDesign'
import Entypo from '@expo/vector-icons/Entypo'
import React, { type ReactNode, useCallback, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'
import type { VideoPlayer } from 'expo-video'
import {
	VideoPlayerContext,
	type VideoPlayerContextValue,
	type PauseResumeHandler,
} from '@/shared/hooks/useVideoPlayerContext'

import { PauseModal, StopModal } from '../modals'

/**
 * Training-session specific wrapper.
 * NOTE: This is NOT shared UI because it depends on training-session modals.
 */
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
	const pausableHandlersRef = useRef<Set<PauseResumeHandler>>(new Set())

	const pauseAll = useCallback(() => {
		videoPlayersRef.current.forEach((player) => {
			try {
				player.pause()
			} catch (e) {
				console.error('Error pausing video:', e)
			}
		})

		pausableHandlersRef.current.forEach((handler) => {
			try {
				handler.pause()
			} catch (e) {
				console.error('Error pausing handler:', e)
			}
		})
	}, [])

	const resumeAll = useCallback(() => {
		videoPlayersRef.current.forEach((player) => {
			try {
				player.play()
			} catch (e) {
				// ignore errors if player is already destroyed
			}
		})

		pausableHandlersRef.current.forEach((handler) => {
			try {
				handler.resume()
			} catch (e) {
				console.error('Error resuming handler:', e)
			}
		})
	}, [])

	const onStop = useCallback(() => {
		setShowStopModal(true)
		if (timerRef.current !== null) {
			clearInterval(timerRef.current)
			timerRef.current = null
			setIsPaused(true)
		}
		pauseAll()
	}, [pauseAll])

	const pauseTimer = useCallback(() => {
		setShowPauseModal(true)
		pauseAll()
	}, [pauseAll])

	const resumeTimer = useCallback(() => {
		setShowPauseModal(false)
		resumeAll()
	}, [resumeAll])

	const handleStopResume = useCallback(() => {
		setShowStopModal(false)
		resumeAll()
	}, [resumeAll, setShowStopModal])

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

	const registerPausable = useCallback((handler: PauseResumeHandler) => {
		pausableHandlersRef.current.add(handler)

		return () => {
			pausableHandlersRef.current.delete(handler)
		}
	}, [])

	const videoPlayerContextValue = useMemo<VideoPlayerContextValue>(
		() => ({
			registerPlayer,
			registerPausable,
		}),
		[registerPlayer, registerPausable]
	)

	return (
		<VideoPlayerContext.Provider value={videoPlayerContextValue}>
			<View className="flex-1">
				<StopModal
					visible={showStopModal}
					onResume={handleStopResume}
					onStop={handleStopTraining}
				/>
				<PauseModal visible={showPauseModal} onResume={resumeTimer} />

				{/* Gradient Background */}
				<GreenGradient />

				{/* Control Buttons */}
				{isShowActionButtons && (
					<View className={'absolute right-4 top-10 z-10 flex-row justify-end gap-2'}>
						<ControlButton
							icon={<AntDesign name="pause" size={24} color="#FFFFFF" />}
							onPress={pauseTimer}
						/>
						<ControlButton
							icon={<Entypo name="cross" size={24} color="#FFFFFF" />}
							onPress={onStop}
						/>
					</View>
				)}

				{children}
			</View>
		</VideoPlayerContext.Provider>
	)
}
