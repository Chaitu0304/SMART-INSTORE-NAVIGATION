import React from 'react';
import { X, Plus, ShoppingCart, SkipForward } from 'lucide-react';
import type { ProductSuggestion } from '../types';

interface SuggestionModalProps {
  suggestion: ProductSuggestion | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: any) => void;
  onDecline: () => void;
  onSkip: () => void;
}

const SuggestionModal: React.FC<SuggestionModalProps> = ({
  suggestion,
  isOpen,
  onClose,
  onAdd,
  onDecline,
  onSkip
}) => {
  if (!isOpen || !suggestion) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Smart Suggestion</h3>
              <p className="text-sm text-gray-600">Found a great match nearby!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-4xl">{suggestion.product.image}</div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 mb-1">
                {suggestion.product.name}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {suggestion.product.category}
              </p>
              <p className="text-lg font-bold text-green-600">
                ${suggestion.product.price.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-semibold text-blue-900">Why this suggestion?</span>
            </div>
            <p className="text-sm text-blue-800">{suggestion.reason}</p>
            <p className="text-xs text-blue-600 mt-2">
              Only {suggestion.distance} steps away from your current location
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  onAdd(suggestion.product);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add to List</span>
              </button>
              <button
                onClick={() => {
                  onDecline();
                  onClose();
                }}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Decline
              </button>
            </div>
            
            {/* Skip Suggestion Button */}
            <button
              onClick={() => {
                onSkip();
                onClose();
              }}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
              <span>Skip Suggestion</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-500 text-center">
            Adding this item will automatically optimize your route for the shortest path
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuggestionModal; 