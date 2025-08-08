import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, MapPin, TrendingUp, TrendingDown } from 'lucide-react';

interface TrafficCondition {
  aisle: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  estimatedDelay: number;
  timestamp: Date;
}

interface TrafficMonitorProps {
  isActive: boolean;
  onTrafficAlert: (condition: TrafficCondition) => void;
}

const TrafficMonitor: React.FC<TrafficMonitorProps> = ({ isActive, onTrafficAlert }) => {
  const [trafficConditions, setTrafficConditions] = useState<TrafficCondition[]>([]);
  const [currentTraffic, setCurrentTraffic] = useState<'clear' | 'moderate' | 'heavy'>('clear');
  const [congestionLevel, setCongestionLevel] = useState<number>(0);

  // Simulate traffic conditions
  useEffect(() => {
    if (!isActive) return;

    const trafficInterval = setInterval(() => {
      const conditions = ['clear', 'moderate', 'heavy'] as const;
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      setCurrentTraffic(randomCondition);
      
      // Generate random traffic alerts
      if (Math.random() < 0.3) { // 30% chance of traffic alert
        const newCondition: TrafficCondition = {
          aisle: Math.floor(Math.random() * 10) + 1,
          severity: randomCondition === 'heavy' ? 'high' : randomCondition === 'moderate' ? 'medium' : 'low',
          description: generateTrafficDescription(randomCondition),
          estimatedDelay: Math.floor(Math.random() * 5) + 1,
          timestamp: new Date()
        };
        
        setTrafficConditions(prev => [...prev, newCondition]);
        onTrafficAlert(newCondition);
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(trafficInterval);
  }, [isActive, onTrafficAlert]);

  // Update congestion level based on current traffic
  useEffect(() => {
    switch (currentTraffic) {
      case 'clear':
        setCongestionLevel(0);
        break;
      case 'moderate':
        setCongestionLevel(50);
        break;
      case 'heavy':
        setCongestionLevel(100);
        break;
    }
  }, [currentTraffic]);

  const generateTrafficDescription = (condition: 'clear' | 'moderate' | 'heavy'): string => {
    const descriptions = {
      clear: [
        'Smooth shopping experience',
        'No congestion detected',
        'Clear aisles ahead'
      ],
      moderate: [
        'Moderate foot traffic',
        'Some congestion in aisles',
        'Slight delays possible'
      ],
      heavy: [
        'Heavy congestion detected',
        'Significant delays expected',
        'Consider alternative routes'
      ]
    };
    
    const options = descriptions[condition];
    return options[Math.floor(Math.random() * options.length)];
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Clock className="w-4 h-4" />;
      case 'low':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Traffic Monitor</h3>
            <p className="text-gray-600">Real-time congestion tracking</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            currentTraffic === 'clear' ? 'bg-green-500' :
            currentTraffic === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm font-medium text-gray-700">
            {currentTraffic.charAt(0).toUpperCase() + currentTraffic.slice(1)}
          </span>
        </div>
      </div>

      {/* Congestion Level Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Congestion Level</span>
          <span className="text-sm text-gray-500">{congestionLevel}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              congestionLevel < 30 ? 'bg-green-500' :
              congestionLevel < 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${congestionLevel}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Clear</span>
          <span>Moderate</span>
          <span>Heavy</span>
        </div>
      </div>

      {/* Current Traffic Status */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            {currentTraffic === 'clear' ? <TrendingDown className="w-4 h-4 text-blue-600" /> :
             currentTraffic === 'moderate' ? <Clock className="w-4 h-4 text-blue-600" /> :
             <TrendingUp className="w-4 h-4 text-blue-600" />}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Current Status</h4>
            <p className="text-sm text-gray-600">{generateTrafficDescription(currentTraffic)}</p>
          </div>
        </div>
      </div>

      {/* Recent Traffic Alerts */}
      {trafficConditions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Recent Alerts</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {trafficConditions.slice(-5).map((condition, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border-l-4 ${getSeverityColor(condition.severity)}`}
              >
                <div className="flex items-center space-x-2">
                  {getSeverityIcon(condition.severity)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">Aisle {condition.aisle}</p>
                    <p className="text-xs text-gray-600">{condition.description}</p>
                    <p className="text-xs text-gray-500">
                      {condition.estimatedDelay} min delay • {condition.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Traffic Statistics */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{trafficConditions.length}</p>
          <p className="text-xs text-gray-600">Total Alerts</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">
            {trafficConditions.filter(c => c.severity === 'high').length}
          </p>
          <p className="text-xs text-gray-600">High Priority</p>
        </div>
      </div>
    </div>
  );
};

export default TrafficMonitor; 