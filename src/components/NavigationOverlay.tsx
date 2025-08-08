import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Target, ArrowRight, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import type { NavigationStep } from '../types';

interface NavigationOverlayProps {
  navigationSteps: NavigationStep[];
  currentStep: number;
  isNavigating: boolean;
  onNextStep: () => void;
  onPreviousStep: () => void;
}

const NavigationOverlay: React.FC<NavigationOverlayProps> = ({
  navigationSteps,
  currentStep,
  isNavigating,
  onNextStep,
  onPreviousStep
}) => {
  const [eta, setEta] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [nextTurn, setNextTurn] = useState<string>('');
  const [turnIcon, setTurnIcon] = useState<React.ReactNode>(null);

  useEffect(() => {
    if (currentStep < navigationSteps.length - 1) {
      const remainingSteps = navigationSteps.length - currentStep - 1;
      setEta(Math.ceil(remainingSteps * 0.5)); // 30 seconds per step
      setDistance(remainingSteps * 40); // 40 meters per step
      
      const current = navigationSteps[currentStep];
      const next = navigationSteps[currentStep + 1];
      
      if (next) {
        const dx = next.x - current.x;
        const dy = next.y - current.y;
        
        if (dx === 1) {
          setNextTurn('Turn right');
          setTurnIcon(<ArrowRight className="w-6 h-6 text-blue-600" />);
        } else if (dx === -1) {
          setNextTurn('Turn left');
          setTurnIcon(<ArrowLeft className="w-6 h-6 text-blue-600" />);
        } else if (dy === 1) {
          setNextTurn('Continue straight');
          setTurnIcon(<ArrowUp className="w-6 h-6 text-blue-600" />);
        } else if (dy === -1) {
          setNextTurn('Turn around');
          setTurnIcon(<ArrowDown className="w-6 h-6 text-blue-600" />);
        }
      }
    } else {
      setNextTurn('You have arrived!');
      setEta(0);
      setDistance(0);
      setTurnIcon(<Target className="w-6 h-6 text-green-600" />);
    }
  }, [currentStep, navigationSteps]);

  if (!isNavigating || navigationSteps.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {/* Turn Direction */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              {turnIcon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{nextTurn}</h3>
              <p className="text-gray-600">
                Step {currentStep + 1} of {navigationSteps.length}
              </p>
            </div>
          </div>

          {/* Navigation Info */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">ETA</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {eta > 0 ? `${eta} min` : 'Arrived'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">Distance</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {distance > 0 ? `${distance}m` : '0m'}
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onPreviousStep}
              disabled={currentStep === 0}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={onNextStep}
              disabled={currentStep >= navigationSteps.length - 1}
              className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${((currentStep + 1) / navigationSteps.length) * 100}%` 
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Start</span>
            <span>{Math.round(((currentStep + 1) / navigationSteps.length) * 100)}%</span>
            <span>Destination</span>
          </div>
        </div>

        {/* Current Instruction */}
        {navigationSteps[currentStep] && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              {navigationSteps[currentStep].instruction}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationOverlay; 