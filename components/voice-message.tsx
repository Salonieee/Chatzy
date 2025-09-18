"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Download, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface VoiceMessageProps {
  duration: number
  isOwn: boolean
  audioUrl?: string
  waveformData?: number[]
}

export function VoiceMessage({ duration, isOwn, audioUrl, waveformData }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const generateWaveform = (duration: number): number[] => {
    const points = Math.floor(duration * 10) // 10 points per second
    return Array.from({ length: points }, () => Math.random() * 100)
  }

  // Generate realistic waveform data if not provided
  const waveform = waveformData || generateWaveform(duration)

  useEffect(() => {
    // Create audio element for simulation
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl)
      audioRef.current.addEventListener("ended", handleAudioEnd)
      audioRef.current.addEventListener("loadedmetadata", () => {
        if (audioRef.current) {
          audioRef.current.playbackRate = playbackRate
        }
      })
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleAudioEnd)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [audioUrl, playbackRate])

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseAudio()
    } else {
      playAudio()
    }
  }

  const playAudio = () => {
    setIsPlaying(true)

    if (audioRef.current) {
      audioRef.current.currentTime = currentTime
      audioRef.current.play()
    } else {
      // Simulate audio playback
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 0.1 * playbackRate
          if (newTime >= duration) {
            handleAudioEnd()
            return duration
          }
          return newTime
        })
      }, 100)
    }
  }

  const pauseAudio = () => {
    setIsPlaying(false)

    if (audioRef.current) {
      audioRef.current.pause()
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }

  const handleAudioEnd = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handleSeek = (value: number[]) => {
    const newTime = value[0]
    setCurrentTime(newTime)

    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const togglePlaybackRate = () => {
    const rates = [1, 1.5, 2]
    const currentIndex = rates.indexOf(playbackRate)
    const nextRate = rates[(currentIndex + 1) % rates.length]
    setPlaybackRate(nextRate)

    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const downloadAudio = () => {
    if (audioUrl) {
      const link = document.createElement("a")
      link.href = audioUrl
      link.download = `voice-message-${Date.now()}.mp3`
      link.click()
    }
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg max-w-xs ${
        isOwn ? "bg-blue-600 text-white" : "bg-white text-gray-800 border border-blue-100"
      }`}
    >
      {/* Play/Pause Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={handlePlayPause}
        className={`p-2 rounded-full ${isOwn ? "hover:bg-blue-700 text-white" : "hover:bg-blue-50 text-blue-600"}`}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>

      {/* Waveform and Progress */}
      <div className="flex-1 space-y-2">
        {/* Waveform Visualization */}
        <div className="flex items-center gap-0.5 h-8">
          {waveform.map((height, index) => {
            const progress = currentTime / duration
            const isActive = index / waveform.length <= progress
            return (
              <div
                key={index}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isActive ? (isOwn ? "bg-white" : "bg-blue-600") : isOwn ? "bg-blue-400" : "bg-blue-200"
                }`}
                style={{
                  height: `${Math.max(height * 0.3, 4)}px`,
                  opacity: isActive ? 1 : 0.6,
                }}
              />
            )
          })}
        </div>

        {/* Progress Slider */}
        <Slider value={[currentTime]} max={duration} step={0.1} onValueChange={handleSeek} className="w-full" />

        {/* Time and Controls */}
        <div className="flex items-center justify-between text-xs">
          <span className={isOwn ? "text-blue-200" : "text-gray-500"}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex items-center gap-1">
            {/* Playback Speed */}
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlaybackRate}
              className={`text-xs px-2 py-1 h-auto ${
                isOwn ? "hover:bg-blue-700 text-blue-200" : "hover:bg-blue-50 text-blue-600"
              }`}
            >
              {playbackRate}x
            </Button>

            {/* Download Button */}
            {audioUrl && (
              <Button
                size="sm"
                variant="ghost"
                onClick={downloadAudio}
                className={`p-1 ${isOwn ? "hover:bg-blue-700 text-blue-200" : "hover:bg-blue-50 text-blue-600"}`}
              >
                <Download className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Volume Indicator */}
      <div className={`${isOwn ? "text-blue-200" : "text-blue-600"}`}>
        <Volume2 className="h-4 w-4" />
      </div>
    </div>
  )
}
