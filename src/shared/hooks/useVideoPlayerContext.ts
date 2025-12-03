import { createContext, useContext } from 'react'
import type { VideoPlayer } from 'expo-video'

export interface VideoPlayerContextValue {
	registerPlayer: (player: VideoPlayer) => () => void
}

export const VideoPlayerContext = createContext<VideoPlayerContextValue | null>(null)

export const useVideoPlayerContext = () => {
    const context = useContext(VideoPlayerContext)
    if (!context) {
        console.warn('useVideoPlayerContext: context is null!')
        return null
    }
    return context
}
