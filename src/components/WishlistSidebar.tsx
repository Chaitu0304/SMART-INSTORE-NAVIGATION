import React from 'react';
import { ShoppingCart, CheckCircle, MapPin } from 'lucide-react';
import type { ShoppingListItem, NavigationStep } from '../types';

interface WishlistSidebarProps {
  shoppingList: ShoppingListItem[];
  navigationSteps: NavigationStep[];
  currentStep: number;
  visitedProductIds: string[];
  onItemClick: (item: ShoppingListItem) => void;
}

const WishlistSidebar: React.FC<WishlistSidebarProps> = ({
  shoppingList,
  navigationSteps,
  currentStep,
  visitedProductIds,
  onItemClick
}) => {
  const currentPosition = navigationSteps[currentStep] || { x: 0, y: 0 };

  const isItemReached = (item: ShoppingListItem) => {
    return visitedProductIds.includes(item.product.id);
  };

  const isItemInPath = (item: ShoppingListItem) => {
    return navigationSteps.some(step => 
      step.x === item.product.location.x && step.y === item.product.location.y
    );
  };



  const reachedItems = shoppingList.filter(item => isItemReached(item));
  const upcomingItems = shoppingList.filter(item => !isItemReached(item));
  const inPathItems = shoppingList.filter(item => isItemInPath(item));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <ShoppingCart className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Shopping Wishlist</h3>
          <p className="text-gray-600">Track your items</p>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">{reachedItems.length}</div>
            <div className="text-xs text-gray-600">Reached</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">{upcomingItems.length}</div>
            <div className="text-xs text-gray-600">Upcoming</div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-green-600">{reachedItems.length}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">{inPathItems.length}</div>
            <div className="text-xs text-gray-600">In Route</div>
          </div>
        </div>
      </div>

      {/* Current Location */}
      <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-green-600" />
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">Current Location</h4>
            <p className="text-xs text-gray-600">
              Aisle {Math.floor(currentPosition.x / 5) + 1}, Section {currentPosition.y + 1}
            </p>
          </div>
        </div>
      </div>

      {/* Shopping List Items */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Items to Find</h4>
        
        {shoppingList.map((item) => {
          const isReached = isItemReached(item);

          
          return (
            <div
              key={item.product.id}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                isReached 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-orange-300 bg-orange-50'
              }`}
              onClick={() => onItemClick(item)}
            >
              <div className="flex items-center space-x-2">
                <div className="text-xl">{item.product.image}</div>
                <div className="flex-1">
                  <h5 className={`font-semibold text-sm ${
                    isReached ? 'line-through text-green-700' : 'text-gray-900'
                  }`}>
                    {item.product.name}
                  </h5>
                  <p className="text-xs text-gray-600">
                    Qty: {item.quantity} • ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Aisle {Math.floor(item.product.location.x / 5) + 1}, Sec {item.product.location.y + 1}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {isReached && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                  <div className={`w-2 h-2 rounded-full ${
                    isReached ? 'bg-green-500' : 'bg-orange-500'
                  }`}></div>
                </div>
              </div>
              
              {isReached && (
                <div className="mt-1 p-1 bg-green-100 rounded text-center">
                  <p className="text-xs text-green-700 font-medium">
                    ✓ Found!
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded-xl">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Total Items:</span>
          <span className="font-semibold text-gray-900 text-sm">{shoppingList.length}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-600">Total Cost:</span>
          <span className="font-semibold text-green-600 text-sm">
            ${shoppingList.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WishlistSidebar; 