import { useState, useEffect, useRef } from 'react';
import { Volume2, Mic, MicOff, Play, Pause, MapPin, AlertTriangle } from 'lucide-react';
import type { VoiceCommand, ProductSuggestion, NavigationStep } from '../types';

interface AdvancedVoiceAssistantProps {
  commands: VoiceCommand[];
  suggestions: ProductSuggestion[];
  navigationSteps: NavigationStep[];
  currentStep: number;
  isActive: boolean;
  onToggleVoice: () => void;
  onSuggestionClick: (product: any) => void;
  shoppingList: any[];
  onAddToShoppingList: (product: any) => void;
  onReroute: (newPath: NavigationStep[]) => void;
}

interface VoiceAlert {
  type: 'traffic' | 'congestion' | 'detour' | 'arrival' | 'suggestion';
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
}

const AdvancedVoiceAssistant: React.FC<AdvancedVoiceAssistantProps> = ({
  commands,
  suggestions,
  navigationSteps,
  currentStep,
  isActive,
  onToggleVoice,
  onSuggestionClick,
  shoppingList,
  onAddToShoppingList,
  onReroute
}) => {
  const [currentCommand, setCurrentCommand] = useState<VoiceCommand | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [alerts, setAlerts] = useState<VoiceAlert[]>([]);
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 0.9,
    pitch: 1.1,
    volume: 0.8,
    voice: 'en-US'
  });
  const [isListening, setIsListening] = useState(false);
  const [trafficConditions, setTrafficConditions] = useState<'clear' | 'moderate' | 'heavy'>('clear');
  const [pendingSuggestion, setPendingSuggestion] = useState<ProductSuggestion | null>(null);
  const [conversationMode, setConversationMode] = useState(false);
  const [lastSpokenItem, setLastSpokenItem] = useState<string | null>(null);
  
  const speechRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    speechRef.current = window.speechSynthesis;
    
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        handleVoiceCommand(transcript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    if (isActive && commands.length > 0) {
      const latestCommand = commands[commands.length - 1];
      setCurrentCommand(latestCommand);
      
      // Only speak if it's not a progress update (to avoid repetition)
      if (!latestCommand.message.includes('Navigation progress') && 
          !latestCommand.message.includes('progress')) {
        speakCommand(latestCommand.message);
      }
    }
  }, [commands, isActive]);

  // Check if user reached a shopping list item or needs direction change
  useEffect(() => {
    if (isActive && navigationSteps.length > 0 && currentStep < navigationSteps.length) {
      const currentStepData = navigationSteps[currentStep];
      const nextStep = navigationSteps[currentStep + 1];
      
      // Check if current position matches any shopping list item
      const reachedItem = shoppingList.find(item => 
        item.product.location.x === currentStepData.x && 
        item.product.location.y === currentStepData.y
      );
      
      // Check if this is a direction change (turn left/right)
      const isDirectionChange = nextStep && (
        (nextStep.x !== currentStepData.x) || 
        (nextStep.y !== currentStepData.y)
      );
      
      // Only speak for important events
      if (reachedItem && reachedItem.product.name !== lastSpokenItem) {
        setLastSpokenItem(reachedItem.product.name);
        const message = `You have reached ${reachedItem.product.name}. You can find it in this aisle.`;
        speakCommand(message);
        
        // Show suggestion modal instead of voice suggestion
        if (suggestions.length > 0) {
          const bestSuggestion = suggestions[0];
          setPendingSuggestion(bestSuggestion);
          // Trigger modal instead of voice
          setTimeout(() => {
            // This will be handled by the parent component
          }, 1000);
        }
      } else if (isDirectionChange && nextStep) {
        const dx = nextStep.x - currentStepData.x;
        const dy = nextStep.y - currentStepData.y;
        
        let direction = '';
        if (dx === 1) direction = 'Turn right';
        else if (dx === -1) direction = 'Turn left';
        else if (dy === 1) direction = 'Continue straight';
        else if (dy === -1) direction = 'Turn around';
        
        const distance = Math.abs(dx) + Math.abs(dy) * 40;
        const message = `${direction} in ${distance} meters.`;
        speakCommand(message);
      }
    }
  }, [currentStep, navigationSteps, isActive, shoppingList, suggestions, lastSpokenItem]);

  // Simulate traffic conditions
  useEffect(() => {
    const trafficInterval = setInterval(() => {
      const conditions = ['clear', 'moderate', 'heavy'] as const;
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      setTrafficConditions(randomCondition);
      
      if (randomCondition === 'heavy' && isActive) {
        const alert: VoiceAlert = {
          type: 'traffic',
          message: 'Heavy traffic detected in aisle 3. Consider taking an alternative route.',
          priority: 'high',
          timestamp: new Date()
        };
        setAlerts(prev => [...prev, alert]);
        speakCommand('Heavy traffic ahead. Rerouting to avoid congestion.');
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(trafficInterval);
  }, [isActive]);

  const speakCommand = (message: string) => {
    if (speechRef.current) {
      setIsSpeaking(true);
      speechRef.current.cancel(); // Stop any current speech
      
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      utterance.lang = voiceSettings.voice;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      speechRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (speechRef.current) {
      speechRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const handleVoiceCommand = (transcript: string) => {
    const command = transcript.toLowerCase();
    
    // Handle conversation mode for suggestions
    if (conversationMode && pendingSuggestion) {
      if (command.includes('yes') || command.includes('add') || command.includes('okay')) {
        onAddToShoppingList(pendingSuggestion.product);
        speakCommand(`Added ${pendingSuggestion.product.name} to your shopping list. I will update your route to include this item.`);
        setPendingSuggestion(null);
        setConversationMode(false);
        
        // Trigger rerouting with the new item
        setTimeout(() => {
          const newPath = generateOptimizedRoute(pendingSuggestion.product);
          if (newPath) {
            onReroute(newPath);
            speakCommand("Route updated. I'll guide you to the new item first.");
          }
        }, 1000);
        return;
      } else if (command.includes('no') || command.includes('skip') || command.includes('not now')) {
        speakCommand('Okay, skipping that suggestion. Continuing with your current route.');
        setPendingSuggestion(null);
        setConversationMode(false);
        return;
      }
    }
    
    // Handle general voice commands
    if (command.includes('stop') || command.includes('pause')) {
      stopSpeaking();
    } else if (command.includes('repeat')) {
      if (currentCommand) {
        speakCommand(currentCommand.message);
      }
    } else if (command.includes('traffic')) {
      speakCommand(`Current traffic conditions are ${trafficConditions}.`);
    } else if (command.includes('distance')) {
      const remainingSteps = navigationSteps.length - currentStep - 1;
      const distance = remainingSteps * 40;
      speakCommand(`You are ${distance} meters from your destination.`);
    } else if (command.includes('eta')) {
      const remainingSteps = navigationSteps.length - currentStep - 1;
      const etaMinutes = Math.ceil(remainingSteps * 0.5); // 30 seconds per step
      speakCommand(`Estimated time of arrival is ${etaMinutes} minutes.`);
    } else if (command.includes('suggest') || command.includes('recommend')) {
      if (suggestions.length > 0) {
        const bestSuggestion = suggestions[0];
        setPendingSuggestion(bestSuggestion);
        const suggestionMessage = `I recommend ${bestSuggestion.product.name}. ${bestSuggestion.reason}. Would you like to add it?`;
        speakCommand(suggestionMessage);
        setConversationMode(true);
      } else {
        speakCommand('No suggestions available right now.');
      }
    } else if (command.includes('help') || command.includes('commands')) {
      speakCommand('You can say: stop, repeat, traffic, distance, eta, suggest, or help. For suggestions, say yes or no.');
    }
  };

  const generateOptimizedRoute = (newProduct: any): NavigationStep[] => {
    // Simple route optimization - add the new product to the current path
    if (navigationSteps.length === 0) return [];
    
    const currentPos = navigationSteps[currentStep];
    const newProductPos = newProduct.location;
    
    // Create a simple path to the new product
    const steps: NavigationStep[] = [];
    let current = { ...currentPos };
    
    // Move horizontally first, then vertically
    while (current.x !== newProductPos.x) {
      const direction = current.x < newProductPos.x ? 'right' : 'left';
      current.x += current.x < newProductPos.x ? 1 : -1;
      steps.push({
        x: current.x,
        y: current.y,
        direction,
        instruction: `Move ${direction} to reach ${newProduct.name}`,
        distance: 2
      });
    }
    
    while (current.y !== newProductPos.y) {
      const direction = current.y < newProductPos.y ? 'down' : 'up';
      current.y += current.y < newProductPos.y ? 1 : -1;
      steps.push({
        x: current.x,
        y: current.y,
        direction,
        instruction: `Move ${direction} to reach ${newProduct.name}`,
        distance: 2
      });
    }
    
    return steps;
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakSuggestion = (suggestion: ProductSuggestion) => {
    const message = `Smart suggestion: I found ${suggestion.product.name} nearby. ${suggestion.reason}. Would you like to add it to your list?`;
    speakCommand(message);
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Volume2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Advanced Voice Assistant</h3>
            <p className="text-gray-600">GPS-style navigation with smart features</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
              isListening 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          <button
            onClick={onToggleVoice}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              isActive 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            {isActive ? 'Voice On' : 'Voice Off'}
          </button>
        </div>
      </div>

      {/* Traffic Status */}
      <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <div>
              <h4 className="font-semibold text-gray-900">Traffic Conditions</h4>
              <p className="text-sm text-gray-600">
                Current: {trafficConditions.charAt(0).toUpperCase() + trafficConditions.slice(1)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              trafficConditions === 'clear' ? 'bg-green-500' :
              trafficConditions === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium text-gray-700">
              {trafficConditions === 'clear' ? 'Clear' :
               trafficConditions === 'moderate' ? 'Moderate' : 'Heavy'}
            </span>
          </div>
        </div>
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

      {/* Voice Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Voice Alerts</h4>
            <button
              onClick={clearAlerts}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {alerts.slice(-3).map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                alert.priority === 'high' ? 'border-red-500 bg-red-50' :
                alert.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-gray-600" />
                  <p className="text-sm text-gray-700">{alert.message}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {alert.timestamp.toLocaleTimeString()}
                </p>
              </div>
            ))}
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
                      e.stopPropagation();
                      onSuggestionClick(suggestion.product);
                    }}
                  >
                    Add
                  </button>
                  <button 
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakSuggestion(suggestion);
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

      {/* Voice Settings */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3">Voice Settings</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Speed</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceSettings.rate}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Pitch</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceSettings.pitch}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Voice Status */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Voice Assistant:</span>
          <span className={`font-semibold ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        {isListening && (
          <div className="mt-2 flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xs text-gray-500">Listening for voice commands...</span>
          </div>
        )}
        {conversationMode && pendingSuggestion && (
          <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-700">Waiting for your response...</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Say "yes" to add {pendingSuggestion.product.name} or "no" to skip
            </p>
          </div>
        )}
      </div>

      {/* Voice Commands Help */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Voice Commands</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
          <div>• "Stop" - Stop speaking</div>
          <div>• "Repeat" - Repeat last instruction</div>
          <div>• "Traffic" - Check traffic conditions</div>
          <div>• "Distance" - Get distance to destination</div>
          <div>• "ETA" - Get estimated arrival time</div>
          <div>• "Suggest" - Get product recommendations</div>
          <div>• "Help" - Show this help</div>
          <div>• "Yes/No" - Respond to suggestions</div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedVoiceAssistant; 