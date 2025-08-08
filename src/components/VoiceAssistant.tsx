import { useState, useEffect } from 'react'
import { Volume2, Mic, MicOff, Play, Pause, MapPin } from 'lucide-react'
import type { VoiceCommand, ProductSuggestion } from '../types'

interface VoiceAssistantProps {
  commands: VoiceCommand[]
  suggestions: ProductSuggestion[]
  isActive: boolean
  onToggleVoice: () => void
  onSuggestionClick: (product: any) => void
}

const VoiceAssistant = ({ commands, suggestions, isActive, onToggleVoice, onSuggestionClick }: VoiceAssistantProps) => {
  const [currentCommand, setCurrentCommand] = useState<VoiceCommand | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceHistory, setVoiceHistory] = useState<string[]>([])

  useEffect(() => {
    if (isActive && commands.length > 0) {
      const latestCommand = commands[commands.length - 1]
      setCurrentCommand(latestCommand)
      speakCommand(latestCommand.message)
      
      // Add to voice history
      setVoiceHistory(prev => [...prev, latestCommand.message])
    }
  }, [commands, isActive])

  const speakCommand = (message: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true)
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 0.9
      utterance.pitch = 1.1
      utterance.volume = 0.8
      
      utterance.onend = () => {
        setIsSpeaking(false)
      }
      
      utterance.onerror = () => {
        setIsSpeaking(false)
      }
      
      speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const speakSuggestion = (suggestion: ProductSuggestion) => {
    const message = `I found ${suggestion.product.name} nearby. ${suggestion.reason}. Would you like to add it to your list?`
    speakCommand(message)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Volume2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Voice Assistant</h3>
            <p className="text-gray-600">Navigation & Smart Suggestions</p>
          </div>
        </div>
        <button
          onClick={onToggleVoice}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            isActive 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isActive ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
      </div>

      {/* Current Voice Command */}
      {currentCommand && isActive && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              {isSpeaking ? <Pause size={16} /> : <Play size={16} />}
            </div>
            <div className="flex-1">
              <p className="text-sm opacity-90">Voice Navigation</p>
              <p className="font-semibold">{currentCommand.message}</p>
            </div>
            <button
              onClick={() => isSpeaking ? stopSpeaking() : speakCommand(currentCommand.message)}
              className="px-3 py-1 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              {isSpeaking ? 'Stop' : 'Repeat'}
            </button>
          </div>
        </div>
      )}

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <MapPin className="w-3 h-3 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Smart Suggestions</h4>
          </div>
          
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.product.id}
                className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 cursor-pointer hover:shadow-md transition-all"
                onClick={() => onSuggestionClick(suggestion.product)}
              >
                <div className="text-2xl">{suggestion.product.image}</div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900">{suggestion.product.name}</h5>
                  <p className="text-sm text-green-700">{suggestion.reason}</p>
                  <p className="text-xs text-gray-500">{suggestion.distance} steps away</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSuggestionClick(suggestion.product)
                    }}
                  >
                    Add
                  </button>
                  <button 
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      speakSuggestion(suggestion)
                    }}
                  >
                    <Volume2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voice History */}
      {voiceHistory.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="font-semibold text-gray-900">Recent Commands</h4>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {voiceHistory.slice(-3).map((command, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                "{command}"
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voice Status */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Voice Assistant:</span>
          <span className={`font-semibold ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        {isActive && (
          <div className="mt-2 flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xs text-gray-500">Listening for commands...</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default VoiceAssistant 