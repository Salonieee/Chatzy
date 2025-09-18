"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square, Send, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VoiceRecorderProps {
  onSendVoiceMessage: (duration: number, audioBlob?: Blob) => void
  onCancel: () => void
}

export function VoiceRecorder({ onSendVoiceMessage, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [waveformData, setWaveformData] = useState<number[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    startRecording()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" })
        setAudioBlob(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 0.1)
      }, 100)

      // Simulate waveform animation
      animateWaveform()
    } catch (error) {
      console.error("Error accessing microphone:", error)
      // Fallback to simulation
      simulateRecording()
    }
  }

  const simulateRecording = () => {
    setIsRecording(true)
    intervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 0.1)
    }, 100)
    animateWaveform()
  }

  const animateWaveform = () => {
    const animate = () => {
      setWaveformData((prev) => {
        const newData = [...prev]
        if (newData.length > 50) {
          newData.shift()
        }
        newData.push(Math.random() * 100)
        return newData
      })

      if (isRecording) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }
    animate()
  }

  const stopRecording = () => {
    setIsRecording(false)

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    } else {
      // Simulate audio blob creation
      setAudioBlob(new Blob(["simulated audio"], { type: "audio/wav" }))
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }

  const playRecording = () => {
    if (audioBlob && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const deleteRecording = () => {
    setAudioBlob(null)
    setRecordingTime(0)
    setWaveformData([])
    startRecording()
  }

  const sendRecording = () => {
    onSendVoiceMessage(recordingTime, audioBlob || undefined)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="bg-white border-t border-blue-200 p-4">
      <div className="flex items-center gap-3">
        {/* Cancel Button */}
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-red-600 hover:bg-red-50">
          <X className="h-5 w-5" />
        </Button>

        {/* Recording Visualization */}
        <div className="flex-1 bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-3">
            {/* Recording Indicator */}
            <div className="flex items-center gap-2">
              {isRecording ? (
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              ) : (
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
              )}
              <span className="text-sm font-medium text-blue-700">{formatTime(recordingTime)}</span>
            </div>

            {/* Waveform */}
            <div className="flex-1 flex items-center gap-0.5 h-8 overflow-hidden">
              {waveformData.map((height, index) => (
                <div
                  key={index}
                  className="w-1 bg-blue-400 rounded-full transition-all duration-150"
                  style={{ height: `${Math.max(height * 0.3, 4)}px` }}
                />
              ))}
            </div>

            {/* Playback Controls (when stopped) */}
            {!isRecording && audioBlob && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={playRecording} className="text-blue-600 hover:bg-blue-100">
                  {isPlaying ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={deleteRecording} className="text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isRecording ? (
            <Button onClick={stopRecording} className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3">
              <Square className="h-5 w-5" />
            </Button>
          ) : audioBlob ? (
            <Button onClick={sendRecording} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3">
              <Send className="h-5 w-5" />
            </Button>
          ) : null}
        </div>
      </div>

      {/* Hidden audio element for playback */}
      {audioBlob && (
        <audio
          ref={audioRef}
          src={URL.createObjectURL(audioBlob)}
          onEnded={() => setIsPlaying(false)}
          style={{ display: "none" }}
        />
      )}

      {/* Instructions */}
      <div className="mt-2 text-center">
        <p className="text-xs text-blue-600">
          {isRecording
            ? "Recording... Tap stop when finished"
            : audioBlob
              ? "Tap play to review, send to share"
              : "Hold to record voice message"}
        </p>
      </div>
    </div>
  )
}
