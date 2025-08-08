// src/pages/StoreMap.tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { ShoppingListItem, NavigationStep, MapCell as MapCellType, VoiceCommand, ProductSuggestion } from '../types'
import { 
  generateStoreMap, 
  findOptimalRoute, 
  calculateTotalDistance,
  generateVoiceCommands,
  generateProductSuggestions,
  updateMapWithNavigation
} from '../utils/navigation'
import { products } from '../data/products'
import AdvancedMartMap from '../components/AdvancedMartMap'
import AdvancedVoiceAssistant from '../components/AdvancedVoiceAssistant'
import NavigationOverlay from '../components/NavigationOverlay'
import TrafficMonitor from '../components/TrafficMonitor'
import WishlistSidebar from '../components/WishlistSidebar'
import SuggestionModal from '../components/SuggestionModal'
import { ArrowLeft, Navigation, ShoppingCart, Play, Pause, MapPin, Settings, X } from 'lucide-react'

const StoreMap = () => {
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([])
  const [storeMap, setStoreMap] = useState<MapCellType[][]>([])
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [voiceCommands, setVoiceCommands] = useState<VoiceCommand[]>([])
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([])
  const [visitedCells, setVisitedCells] = useState<{ x: number; y: number }[]>([])
  const [visitedProductIds, setVisitedProductIds] = useState<string[]>([])
  const [declinedSuggestions, setDeclinedSuggestions] = useState<string[]>([])

  const [mapTheme, setMapTheme] = useState<'default' | 'dark' | 'satellite' | 'minimal'>('default')
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [suggestionModal, setSuggestionModal] = useState<{ isOpen: boolean; suggestion: any }>({
    isOpen: false,
    suggestion: null
  })
  const [showToast, setShowToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null)


  const [animatedPosition, setAnimatedPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Load shopping list from localStorage with error handling
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smartMartShoppingList');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Replace each product with the canonical one from products array and update its location from the map
          setStoreMap((currentMap) => {
            const canonicalList = parsed.map(item => {
              const canonicalProduct = products.find(p => p.id === item.product.id);
              if (canonicalProduct) {
                // Find the product cell on the map
                let foundCell = null;
                for (let row of currentMap) {
                  for (let cell of row) {
                    if (cell.type === 'product' && cell.product && cell.product.id === canonicalProduct.id) {
                      foundCell = cell;
                      break;
                    }
                  }
                  if (foundCell) break;
                }
                if (foundCell) {
                  return { ...item, product: { ...canonicalProduct, location: { x: foundCell.x, y: foundCell.y } } };
                } else {
                  return { ...item, product: canonicalProduct };
                }
              }
              return item; // fallback to original if not found
            });
            setShoppingList(canonicalList);
            return currentMap;
          });
        }
      }
    } catch (error) {
      console.error('Error loading shopping list:', error);
      localStorage.removeItem('smartMartShoppingList');
    }
  }, []);

  // Generate store map whenever the shopping list changes
  useEffect(() => {
    setStoreMap(generateStoreMap(shoppingList.map(item => item.product)))
  }, [shoppingList])

  // Helper to calculate route with correct forbidden cell logic
  const calculateRoute = (startPosition: { x: number; y: number }, productsToFind: any[], useForbidden = false) => {
    // Only use forbidden cells if rerouting during navigation
    const forbidden = useForbidden ? visitedCells : [];
    console.log('DEBUG: Calculating route with:', { startPosition, productsToFind, forbidden });
    const steps = findOptimalRoute(startPosition, productsToFind, forbidden);
    console.log('DEBUG: Route calculation result:', steps);
    if (steps.length === 0) {
      setShowToast({
        message: 'No route found. Please check your shopping list and try again.',
        type: 'error',
      });
    }
    return steps;
  };

  // Calculate optimal route when shopping list changes
  useEffect(() => {
    if (shoppingList.length > 0) {
      const productsToFind = shoppingList.map(item => item.product);
      
      // Find the entrance position from the current map
      let startPosition = { x: 0, y: 0 }; // Default fallback
      if (storeMap.length > 0 && storeMap[0].length > 0) {
        // Look for entrance in the first row
        for (let x = 0; x < storeMap[0].length; x++) {
          if (storeMap[0][x].type === 'entrance') {
            startPosition = { x: storeMap[0][x].x, y: storeMap[0][x].y };
            break;
          }
        }
      }
      
      // Debug logs
      console.log('DEBUG: Store map:', storeMap);
      console.log('DEBUG: Shopping list:', shoppingList);
      console.log('DEBUG: Products to find:', productsToFind);
      console.log('DEBUG: Start position:', startPosition);
      console.log('DEBUG: Is navigating:', isNavigating);
      console.log('DEBUG: Forbidden cells:', isNavigating ? visitedCells : []);
      
      const steps = calculateRoute(startPosition, productsToFind, isNavigating);
      console.log('DEBUG: Generated steps:', steps);
      setNavigationSteps(steps);
      setCurrentStep(0);
    } else {
      setNavigationSteps([]);
      setCurrentStep(0);
    }
  }, [shoppingList, storeMap]);

  // SIMPLE AND RELIABLE NAVIGATION - GUARANTEED TO REACH ALL ITEMS
  useEffect(() => {
    if (!isNavigating || shoppingList.length === 0) return;
    
    // If all products are visited, stop navigation
    if (visitedProductIds.length >= shoppingList.length) {
      setIsNavigating(false);
      setShowToast({
        message: 'All items collected! Proceed to checkout.',
        type: 'success'
      });
      return;
    }
    
    // Only auto-advance if we have navigation steps and we're not at the end
    if (navigationSteps.length > 0 && currentStep < navigationSteps.length - 1) {
      // Auto-advance to next step after a delay
      const timer = setTimeout(() => {
        handleNextStep();
      }, 1500); // 1.5 seconds per step
      
      return () => clearTimeout(timer);
    }
  }, [isNavigating, currentStep, navigationSteps.length, visitedProductIds.length, shoppingList.length]);

  // Update map with navigation and current position
  useEffect(() => {
    if (shoppingList.length === 0) return

    const newMap = updateMapWithNavigation(storeMap, navigationSteps, currentStep, shoppingList)
    
    // Mark reached items when navigation is active and we're at a product location
    if (isNavigating && currentStep < navigationSteps.length) {
      const currentStepData = navigationSteps[currentStep]
      const reachedItem = shoppingList.find(item => 
        item.product.location.x === currentStepData.x && 
        item.product.location.y === currentStepData.y
      )
      
      if (reachedItem && !visitedProductIds.includes(reachedItem.product.id)) {
        // Add to visitedProductIds
        setVisitedProductIds(prev => [...prev, reachedItem.product.id])
        // Mark the item as reached in the map
        const { x, y } = reachedItem.product.location
        if (y < newMap.length && x < newMap[0].length) {
          newMap[y][x].isReached = true
        }
        // Show toast for reached item
        setShowToast({
          message: `Found ${reachedItem.product.name}!`,
          type: 'success'
        })
        setTimeout(() => setShowToast(null), 3000)
      }
    }
    
    setStoreMap(newMap)
  }, [currentStep, navigationSteps, shoppingList, isNavigating, visitedProductIds])

  // Generate voice commands
  useEffect(() => {
    if (isVoiceActive && navigationSteps.length > 0) {
      const commands = generateVoiceCommands(navigationSteps, currentStep)
      setVoiceCommands(commands)
    }
  }, [currentStep, navigationSteps, isVoiceActive])

  // Generate smart suggestions when reaching a product
  useEffect(() => {
    if (isNavigating && currentStep < navigationSteps.length && shoppingList.length > 0) {
      const currentStepData = navigationSteps[currentStep]
      const currentProduct = shoppingList.find(item => 
        item.product.location.x === currentStepData.x && 
        item.product.location.y === currentStepData.y
      )
      
      if (currentProduct) {
        const productSuggestions = generateProductSuggestions(currentProduct.product, products, shoppingList)
        // Filter out declined suggestions
        const filteredSuggestions = productSuggestions.filter(suggestion => 
          !declinedSuggestions.includes(suggestion.product.id)
        )
        setSuggestions(filteredSuggestions)
        
        // Show suggestion modal if there are suggestions
        if (filteredSuggestions.length > 0) {
          setTimeout(() => {
            setSuggestionModal({
              isOpen: true,
              suggestion: filteredSuggestions[0]
            })
          }, 1500)
        } else {
          // Show a message that no suggestions are available
          setTimeout(() => {
            setShowToast({
              message: 'Great! All related items are already in your shopping list.',
              type: 'info'
            })
            // Auto-hide toast after 3 seconds
            setTimeout(() => setShowToast(null), 3000)
          }, 1500)
        }
      }
    }
  }, [currentStep, navigationSteps, shoppingList, isNavigating, declinedSuggestions])

  // Initialize animated position when route starts or resets
  useEffect(() => {
    if (navigationSteps.length > 0) {
      const start = navigationSteps[0]
      setAnimatedPosition({ x: start.x, y: start.y })
    }
  }, [navigationSteps])

  // Real-world position tracking with GPS-like movement
  const [userPosition, setUserPosition] = useState<{ x: number; y: number; heading: number }>({ 
    x: 0, y: 0, heading: 0 
  })
  const [isMoving, setIsMoving] = useState(false)
  const [movementSpeed, setMovementSpeed] = useState(0) // cells per second
  const maxSpeed = 2 // maximum speed in cells per second
  const acceleration = 0.5 // acceleration rate
  const deceleration = 0.3 // deceleration rate
  
  // Movement tracking effect - GPS-like real-world movement
  useEffect(() => {
    if (!isNavigating || navigationSteps.length === 0) {
      setIsMoving(false)
      setMovementSpeed(0)
      return
    }

    const currentStepData = navigationSteps[currentStep]
    const nextStep = navigationSteps[Math.min(currentStep + 1, navigationSteps.length - 1)]
    
    if (!currentStepData || !nextStep) return

    // Calculate direction to next step
    const dx = nextStep.x - userPosition.x
    const dy = nextStep.y - userPosition.y
    const distance = Math.hypot(dx, dy)
    
    if (distance < 0.1) {
      // Reached the target, stop moving
      setIsMoving(false)
      setMovementSpeed(0)
      return
    }

    // Calculate target heading
    const targetHeading = Math.atan2(dy, dx)
    const headingDiff = targetHeading - userPosition.heading
    
    // Normalize heading difference
    const normalizedHeadingDiff = Math.atan2(Math.sin(headingDiff), Math.cos(headingDiff))
    
    // Update heading smoothly
    const newHeading = userPosition.heading + normalizedHeadingDiff * 0.1
    
    // Start moving if we're facing the right direction
    if (Math.abs(normalizedHeadingDiff) < 0.3) {
      setIsMoving(true)
      setMovementSpeed(prev => Math.min(prev + acceleration * 0.016, maxSpeed)) // 60fps
    } else {
      setIsMoving(false)
      setMovementSpeed(prev => Math.max(prev - deceleration * 0.016, 0))
    }

    // Update position based on movement
    if (isMoving && movementSpeed > 0) {
      const moveDistance = movementSpeed * 0.016 // 60fps
      const moveX = Math.cos(newHeading) * moveDistance
      const moveY = Math.sin(newHeading) * moveDistance
      
      setUserPosition(prev => ({
        x: prev.x + moveX,
        y: prev.y + moveY,
        heading: newHeading
      }))
    } else {
      setUserPosition(prev => ({
        ...prev,
        heading: newHeading
      }))
    }
  }, [isNavigating, navigationSteps, currentStep, userPosition, isMoving, movementSpeed])

  // Initialize user position when navigation starts
  useEffect(() => {
    if (navigationSteps.length > 0 && currentStep === 0) {
      const startStep = navigationSteps[0]
      setUserPosition({
        x: startStep.x,
        y: startStep.y,
        heading: 0
      })
    }
  }, [navigationSteps, currentStep])

  // Update animated position to use real-world tracking
  useEffect(() => {
    setAnimatedPosition({ x: userPosition.x, y: userPosition.y })
  }, [userPosition])


  const startNavigation = () => {
    if (shoppingList.length === 0) {
      setShowToast({
        message: 'Please add items to your shopping list before starting navigation.',
        type: 'error'
      });
      setTimeout(() => setShowToast(null), 3000);
      return;
    }
    
    // Check for missing product locations
    const productsToFind = shoppingList.map(item => item.product);
    const missingLocation = productsToFind.find(p => !p.location || typeof p.location.x !== 'number' || typeof p.location.y !== 'number');
    if (missingLocation) {
      setShowToast({
        message: `Product "${missingLocation.name}" is missing a valid location. Please check your product data!`,
        type: 'error'
      });
      setTimeout(() => setShowToast(null), 4000);
      return;
    }
    
    // Reset navigation state
    setIsNavigating(true);
    setVisitedCells([]);
    setVisitedProductIds([]);
    setCurrentStep(0);
    
    // Calculate route from entrance
    const startPosition = { x: 0, y: 0 }; // Entrance position
    const steps = calculateRoute(startPosition, productsToFind, false);
    
    if (steps.length === 0) {
      setShowToast({
        message: 'No route found. Please check your shopping list and try again.',
        type: 'error',
      });
      setTimeout(() => setShowToast(null), 3000);
      setIsNavigating(false);
      return;
    }
    
    // Set the navigation steps
    setNavigationSteps(steps);
    
    // Initialize animated position to start
    setAnimatedPosition({ x: startPosition.x, y: startPosition.y });
    
    // Show start message
    setShowToast({
      message: `Starting navigation to ${shoppingList.length} items...`,
      type: 'info'
    });
    setTimeout(() => setShowToast(null), 2000);
    
    console.log('🚀 Navigation started:', {
      shoppingListLength: shoppingList.length,
      navigationStepsLength: steps.length,
      startPosition,
      productsToFind: productsToFind.map(p => ({ name: p.name, location: p.location }))
    });
  }

  const pauseNavigation = () => {
    setIsNavigating(false)
  }

  const resetNavigation = () => {
    setIsNavigating(false)
    setCurrentStep(0)
    setSuggestions([])
    setVisitedCells([])
    setVisitedProductIds([])
    setDeclinedSuggestions([])
    setShowToast(null)
    
    // Reset animated position to entrance
    setAnimatedPosition({ x: 0, y: 0 })
    
    // Recalculate route if we have shopping list items
    if (shoppingList.length > 0) {
      const productsToFind = shoppingList.map(item => item.product);
      const startPosition = { x: 0, y: 0 }; // Entrance position
      const steps = calculateRoute(startPosition, productsToFind, false);
      setNavigationSteps(steps);
      
      console.log('🔄 Navigation reset:', {
        shoppingListLength: shoppingList.length,
        newStepsLength: steps.length
      });
    } else {
      setNavigationSteps([]);
    }
  }

  const toggleVoice = () => {
    setIsVoiceActive(!isVoiceActive)
  }

  // Helper function to get current position from navigation steps
  const getCurrentPositionFromSteps = (): { x: number; y: number } => {
    if (navigationSteps.length > 0 && currentStep < navigationSteps.length) {
      // Return the current step's position
      return { 
        x: navigationSteps[currentStep].x, 
        y: navigationSteps[currentStep].y 
      }
    } else if (navigationSteps.length > 0) {
      // If we're at the end, return the last step's position
      const lastStep = navigationSteps[navigationSteps.length - 1]
      return { x: lastStep.x, y: lastStep.y }
    } else {
      // Default to entrance if no navigation steps
      return { x: 0, y: 0 }
    }
  }

  const handleSuggestionClick = (product: any) => {
    // Always use canonical product object
    const canonicalProduct = products.find(p => p.id === product.id);
    if (!canonicalProduct) return;
    // Add suggested product to shopping list
    const existingItem = shoppingList.find(item => item.product.id === canonicalProduct.id)
    if (existingItem) {
      setShoppingList(prev => prev.map(item => 
        item.product.id === canonicalProduct.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setShoppingList(prev => [...prev, { product: canonicalProduct, quantity: 1 }])
    }
    // Save to localStorage
    const updatedList = existingItem 
      ? shoppingList.map(item => 
          item.product.id === canonicalProduct.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [...shoppingList, { product: canonicalProduct, quantity: 1 }]
    localStorage.setItem('smartMartShoppingList', JSON.stringify(updatedList))
    // Only trigger route optimization if navigation is active
    if (isNavigating) {
      setTimeout(() => {
        const currentPos = getCurrentPositionFromSteps()
        const productsToFind = [...shoppingList, { product: canonicalProduct, quantity: 1 }].map(item => item.product)
        const optimizedSteps = findOptimalRoute(currentPos, productsToFind, visitedCells)
        setNavigationSteps(optimizedSteps)
        // Keep the current step at 0 since we're starting a new route from current position
        setCurrentStep(0)
      }, 500)
    }
  }

  const handleSuggestionModalAdd = (product: any) => {
    handleSuggestionClick(product)
    setSuggestionModal({ isOpen: false, suggestion: null })
  }

  const handleSuggestionModalDecline = () => {
    if (suggestionModal.suggestion) {
      setDeclinedSuggestions(prev => [...prev, suggestionModal.suggestion.product.id])
    }
    setSuggestionModal({ isOpen: false, suggestion: null })
  }

  const handleSuggestionModalSkip = () => {
    // Just close the modal without declining the suggestion
    setSuggestionModal({ isOpen: false, suggestion: null })
  }

  const handleWishlistItemClick = (item: any) => {
    // Mark item as collected or handle wishlist interaction
    console.log('Wishlist item clicked:', item)
  }

  const handleCellClick = (cell: MapCellType) => {
    // Handle cell clicks for manual navigation
    if (cell.type === 'product' && cell.product) {
      console.log('Clicked on product:', cell.product.name)
    }
  }

  const handleReroute = (newPath: NavigationStep[]) => {
    setNavigationSteps(newPath)
    setCurrentStep(0)
    // Keep current position for rerouting
  }



  const handleTrafficCondition = (condition: any) => {
    console.log('Traffic condition:', condition)
    // Handle traffic conditions and potentially trigger rerouting
    if (condition.severity === 'high') {
      // Could trigger automatic rerouting
      console.log('High traffic detected, considering rerouting...')
    }
  }

  const handleNextStep = () => {
    if (currentStep < navigationSteps.length - 1) {
      setCurrentStep(prev => {
        const nextStep = prev + 1
        const step = navigationSteps[nextStep]
        
        // Add current position to visited cells
        setVisitedCells(cells => [...cells, { x: step.x, y: step.y }])
        
        // Check if this step is at a product location
        const product = shoppingList.find(item => 
          item.product.location.x === step.x && 
          item.product.location.y === step.y
        )
        
        if (product && !visitedProductIds.includes(product.product.id)) {
          setVisitedProductIds(ids => [...ids, product.product.id])
          
          // Show success message for found product
          setShowToast({
            message: `Found ${product.product.name}!`,
            type: 'success'
          })
          setTimeout(() => setShowToast(null), 3000)
          
          console.log(`✅ Found product: ${product.product.name} at step ${nextStep + 1}`)
        }
        
        // Log navigation progress
        console.log(`📍 Step ${nextStep + 1}/${navigationSteps.length}: ${step.instruction}`)
        console.log(`🎯 Position: (${step.x}, ${step.y})`)
        
        return nextStep
      })
    } else {
      // Reached the end of navigation
      setShowToast({
        message: 'Navigation complete! All items collected.',
        type: 'success'
      })
      setTimeout(() => setShowToast(null), 3000)
      setIsNavigating(false)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => {
        // Optionally remove the last visited cell
        setVisitedCells(cells => cells.slice(0, -1))
        return prev - 1
      })
    }
  }

  const totalDistance = calculateTotalDistance({ x: 0, y: 19 }, shoppingList.map(item => item.product))
  const totalItems = shoppingList.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = shoppingList.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      {/* Floating Settings Panel */}
      {showSettings && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-2xl shadow-xl p-6 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Settings & Controls</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Map Theme */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Map Theme</label>
              <select
                value={mapTheme}
                onChange={(e) => setMapTheme(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="default">Default</option>
                <option value="dark">Dark Mode</option>
                <option value="satellite">Satellite</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
            
            {/* Navigation Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Navigation Progress:</span>
                <span className="font-semibold text-sm">
                  {navigationSteps.length > 0 ? `${currentStep + 1}/${navigationSteps.length}` : '0/0'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: navigationSteps.length > 0 ? `${((currentStep + 1) / navigationSteps.length) * 100}%` : '0%' 
                  }}
                ></div>
              </div>
            </div>
            
            {/* Movement Status */}
            {isNavigating && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Movement Status</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isMoving ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="font-medium">
                      {isMoving ? 'Moving' : 'Stopped'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Speed:</span> {movementSpeed.toFixed(1)} cells/s
                  </div>
                  <div>
                    <span className="font-medium">Heading:</span> {Math.round(userPosition.heading * 180 / Math.PI)}°
                  </div>
                  <div>
                    <span className="font-medium">Position:</span> ({userPosition.x.toFixed(1)}, {userPosition.y.toFixed(1)})
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Controls */}
            <div className="space-y-2">
              {!isNavigating ? (
                <button 
                  onClick={startNavigation} 
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Play size={16} />
                  <span>Start Navigation</span>
                </button>
              ) : (
                <button 
                  onClick={pauseNavigation} 
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Pause size={16} />
                  <span>Pause Navigation</span>
                </button>
              )}
              <button 
                onClick={resetNavigation} 
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset Route
              </button>
              {/* Manual navigation controls for debugging */}
              {isNavigating && navigationSteps.length > 0 && (
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      const nextProduct = shoppingList.find(item => 
                        !visitedProductIds.includes(item.product.id)
                      );
                      if (nextProduct) {
                        // SIMPLE MANUAL NAVIGATION
                        const targetX = nextProduct.product.location.x;
                        const targetY = nextProduct.product.location.y;
                        
                        // Create step for this product
                        const newStep = {
                          x: targetX,
                          y: targetY,
                          direction: 'right' as const,
                          instruction: `Go to ${nextProduct.product.name}`,
                          distance: 2
                        };
                        
                        // Update navigation
                        const updatedSteps = [...navigationSteps];
                        const productIndex = visitedProductIds.length;
                        if (productIndex < updatedSteps.length) {
                          updatedSteps[productIndex] = newStep;
                        } else {
                          updatedSteps.push(newStep);
                        }
                        
                        setNavigationSteps(updatedSteps);
                        setCurrentStep(productIndex);
                        setVisitedProductIds(prev => [...prev, nextProduct.product.id]);
                        
                        // Update map
                        const newMap = [...storeMap];
                        if (targetY < newMap.length && targetX < newMap[0].length) {
                          newMap[targetY][targetX].isReached = true;
                          setStoreMap(newMap);
                        }
                        
                        setShowToast({
                          message: `Found ${nextProduct.product.name}!`,
                          type: 'success'
                        });
                        setTimeout(() => setShowToast(null), 2000);
                        
                        console.log(`✅ MANUAL: Found ${nextProduct.product.name} at (${targetX}, ${targetY})`);
                      }
                    }}
                    disabled={visitedProductIds.length >= shoppingList.length}
                    className="w-full px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors"
                  >
                    Next Item (Manual) - {visitedProductIds.length}/{shoppingList.length}
                  </button>
                  <button 
                    onClick={handleNextStep}
                    disabled={currentStep >= navigationSteps.length - 1}
                    className="w-full px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
                  >
                    Next Step (Manual)
                  </button>
                  <button 
                    onClick={handlePreviousStep}
                    disabled={currentStep <= 0}
                    className="w-full px-4 py-2 bg-orange-100 text-orange-700 font-semibold rounded-lg hover:bg-orange-200 disabled:opacity-50 transition-colors"
                  >
                    Previous Step (Manual)
                  </button>
                </div>
              )}
            </div>
            
            {/* Advanced Features Toggle */}
            <button
              onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
              className="w-full px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition-colors"
            >
              {showAdvancedFeatures ? 'Hide Advanced Features' : 'Show Advanced Features'}
            </button>
            
            {/* Traffic Monitor */}
            {showAdvancedFeatures && (
              <TrafficMonitor
                isActive={isNavigating}
                onTrafficAlert={handleTrafficCondition}
              />
            )}
            
            {/* Debug Information */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-2">Debug Info</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-medium">Navigation Steps:</span> {navigationSteps.length}
                </div>
                <div>
                  <span className="font-medium">Current Step:</span> {currentStep + 1}/{navigationSteps.length}
                </div>
                <div>
                  <span className="font-medium">Is Navigating:</span> {isNavigating ? 'Yes' : 'No'}
                </div>
                <div>
                  <span className="font-medium">Shopping List:</span> {shoppingList.length} items
                </div>
                <div>
                  <span className="font-medium">Visited Products:</span> {visitedProductIds.length} items
                </div>
                <div>
                  <span className="font-medium">Visited Cells:</span> {visitedCells.length} cells
                </div>
                {navigationSteps.length > 0 && currentStep < navigationSteps.length && (
                  <div>
                    <span className="font-medium">Current Position:</span> ({navigationSteps[currentStep].x}, {navigationSteps[currentStep].y})
                  </div>
                )}
                {/* Product Status */}
                <div className="mt-2">
                  <span className="font-medium">Product Status:</span>
                  {shoppingList.map((item, index) => (
                    <div key={item.product.id} className="ml-2 text-xs">
                      {index + 1}. {item.product.name} - {visitedProductIds.includes(item.product.id) ? '✅ Found' : '⏳ Pending'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header with Settings Button */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Smart Mart Navigation</h1>
              <p className="text-gray-600">Google Maps-style navigation with voice assistance</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 font-medium rounded-lg hover:bg-purple-200 transition-colors"
              >
                <Settings size={20} className="mr-2" />
                Settings
              </button>
              <Link to="/" className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                <ArrowLeft size={20} className="mr-2" />
                Back to Shopping List
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Grid - Larger Map */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {/* Left Column - Wishlist Sidebar */}
          <div className="xl:col-span-1">
            <WishlistSidebar
              shoppingList={shoppingList}
              navigationSteps={navigationSteps}
              currentStep={currentStep}
              visitedProductIds={visitedProductIds}
              onItemClick={handleWishlistItemClick}
            />
          </div>

          {/* Center Column - Large Map */}
          <div className="xl:col-span-4">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Advanced GPS Navigation</h3>
                    <p className="text-gray-600">Professional navigation with live rerouting and custom themes</p>
                  </div>
                </div>
                
                {/* Map Legend */}
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600">Shopping List</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Other Products</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Found</span>
                  </div>
                </div>
              </div>
              
              {shoppingList.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🛒</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Items in Shopping List</h3>
                  <p className="text-gray-500 mb-4">Add items to your shopping list to see the navigation map</p>
                  <Link to="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    <ShoppingCart size={16} className="mr-2" />
                    Go to Shopping List
                  </Link>
                </div>
              ) : (
                <AdvancedMartMap
                  storeMap={storeMap}
                  path={navigationSteps}
                  currentStep={currentStep}
                  onCellClick={handleCellClick}
                  onReroute={handleReroute}
                  theme={mapTheme}
                  currentPosition={animatedPosition}
                  userHeading={userPosition.heading}
                  isMoving={isMoving}
                />
              )}
            </div>
          </div>
        </div>

        {/* Expanded Trip Summary Under Map */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Trip Summary</h3>
                <p className="text-gray-600">Your complete shopping journey overview</p>
              </div>
            </div>
            
            {/* Navigation Button in Trip Summary */}
            <div className="flex items-center space-x-3">
              {!isNavigating ? (
                <button 
                  onClick={startNavigation} 
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                >
                  <Play size={20} className="mr-2" />
                  Start Navigation
                </button>
              ) : (
                <button 
                  onClick={pauseNavigation} 
                  className="inline-flex items-center px-6 py-3 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-colors shadow-lg"
                >
                  <Pause size={20} className="mr-2" />
                  Pause Navigation
                </button>
              )}
              <button 
                onClick={resetNavigation} 
                className="inline-flex items-center px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset Route
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Summary Stats */}
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600">{totalItems}</div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600">${totalPrice.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Cost</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-600">{totalDistance}m</div>
                <div className="text-sm text-gray-600">Total Distance</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-3xl font-bold text-orange-600">
                  {navigationSteps.length > 0 ? Math.ceil(navigationSteps.length * 0.5) : 0}
                </div>
                <div className="text-sm text-gray-600">Est. Time (min)</div>
              </div>
            </div>
            
            {/* Shopping List Items */}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-gray-900 mb-4">Shopping List Items</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {shoppingList.map((item) => {
                  const isReached = visitedProductIds.includes(item.product.id);
                  // Check if item is in the upcoming path
                  const isInPath = navigationSteps.some(step => 
                    step.x === item.product.location.x && step.y === item.product.location.y
                  );
                  
                  return (
                    <div
                      key={item.product.id}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                        isReached 
                          ? 'border-green-500 bg-green-50 shadow-md' 
                          : isInPath
                          ? 'border-purple-400 bg-purple-50 shadow-sm'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="text-xl">{item.product.image}</div>
                        <div className="flex-1">
                          <h5 className={`font-semibold text-sm ${
                            isReached ? 'line-through text-green-700' : 
                            isInPath ? 'text-purple-700' : 'text-gray-900'
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
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          )}
                          {isInPath && !isReached && (
                            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                          )}
                          {!isInPath && !isReached && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      {/* Status indicator */}
                      {isReached && (
                        <div className="mt-1 p-1 bg-green-100 rounded text-center">
                          <p className="text-xs text-green-700 font-medium">
                            ✓ Found!
                          </p>
                        </div>
                      )}
                      {isInPath && !isReached && (
                        <div className="mt-1 p-1 bg-purple-100 rounded text-center">
                          <p className="text-xs text-purple-700 font-medium">
                            🎯 In Route
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Voice Assistant */}
        {showAdvancedFeatures && (
          <AdvancedVoiceAssistant
            commands={voiceCommands}
            suggestions={suggestions}
            navigationSteps={navigationSteps}
            currentStep={currentStep}
            isActive={isVoiceActive}
            onToggleVoice={toggleVoice}
            onSuggestionClick={handleSuggestionClick}
            shoppingList={shoppingList}
            onAddToShoppingList={handleSuggestionClick}
            onReroute={handleReroute}
          />
        )}

        {/* Navigation Instructions */}
        {currentStep < navigationSteps.length && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Navigation size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">
                  Step {currentStep + 1} of {navigationSteps.length}
                </h3>
                <p className="text-blue-100 text-lg">{navigationSteps[currentStep]?.instruction}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Overlay */}
        <NavigationOverlay
          navigationSteps={navigationSteps}
          currentStep={currentStep}
          isNavigating={isNavigating}
          onNextStep={handleNextStep}
          onPreviousStep={handlePreviousStep}
        />

        {/* Suggestion Modal */}
        <SuggestionModal
          suggestion={suggestionModal.suggestion}
          isOpen={suggestionModal.isOpen}
          onClose={() => setSuggestionModal({ isOpen: false, suggestion: null })}
          onAdd={handleSuggestionModalAdd}
          onDecline={handleSuggestionModalDecline}
          onSkip={handleSuggestionModalSkip}
        />

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className={`px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
              showToast.type === 'info' ? 'bg-blue-500' :
              showToast.type === 'success' ? 'bg-green-500' :
              showToast.type === 'warning' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}>
              {showToast.message}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StoreMap