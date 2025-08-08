import type { Product, MapCell, NavigationStep, VoiceCommand, ProductSuggestion } from '../types'

// Minimal, robust map generator for shopping list navigation
export const generateStoreMap = (products: Product[]): MapCell[][] => {
  // Walmart-style: 6 vertical aisles, 4 cross-aisles, 2 shelves per aisle, 1 entrance, 1 checkout
  const ROWS = 24; // vertical size
  const COLS = 18; // horizontal size
  const AISLE_WIDTH = 2;
  const SHELF_WIDTH = 1;
  const NUM_AISLES = 6;
  const AISLE_SPACING = 2; // space between aisles
  const CROSS_AISLES = [6, 12, 18]; // y positions for cross-aisles

  // Calculate aisle x positions
  const aisleXs = Array.from({ length: NUM_AISLES }, (_, i) => 2 + i * (AISLE_WIDTH + AISLE_SPACING));

  // Build empty map
  const map: MapCell[][] = [];
  for (let y = 0; y < ROWS; y++) {
    const row: MapCell[] = [];
    for (let x = 0; x < COLS; x++) {
      // Walls around the store
      if (x === 0 || x === COLS - 1 || y === 0 || y === ROWS - 1) {
        row.push({ x, y, type: 'wall' });
        continue;
      }
      // Entrance (bottom center)
      if (y === ROWS - 1 && x === Math.floor(COLS / 2)) {
        row.push({ x, y, type: 'entrance' });
        continue;
      }
      // Checkout (top center)
      if (y === 0 && x === Math.floor(COLS / 2)) {
        row.push({ x, y, type: 'checkout' });
        continue;
      }
      // Cross-aisles (walkable paths)
      if (CROSS_AISLES.includes(y)) {
        row.push({ x, y, type: 'aisle' });
        continue;
      }
      // Vertical aisles (walkable paths)
      if (aisleXs.some(ax => x === ax || x === ax + 1)) {
        row.push({ x, y, type: 'aisle' });
        continue;
      }
      // Shelves (adjacent to aisles)
      if (aisleXs.some(ax => x === ax - SHELF_WIDTH || x === ax + AISLE_WIDTH)) {
        row.push({ x, y, type: 'product' });
        continue;
      }
      // Default: empty (walkable)
      row.push({ x, y, type: 'empty' });
    }
    map.push(row);
  }

  // Place products on shelves
  let productIdx = 0;
  for (let ax of aisleXs) {
    for (let y = 1; y < ROWS - 1; y++) {
      // Place on left shelf
      if (productIdx < products.length) {
        const cell = map[y][ax - SHELF_WIDTH];
        cell.type = 'product';
        cell.product = products[productIdx];
        cell.isInShoppingList = true;
        cell.isReached = false;
        cell.product.location = { x: ax - SHELF_WIDTH, y };
        productIdx++;
      }
      // Place on right shelf
      if (productIdx < products.length) {
        const cell = map[y][ax + AISLE_WIDTH];
        cell.type = 'product';
        cell.product = products[productIdx];
        cell.isInShoppingList = true;
        cell.isReached = false;
        cell.product.location = { x: ax + AISLE_WIDTH, y };
        productIdx++;
      }
      if (productIdx >= products.length) break;
    }
    if (productIdx >= products.length) break;
  }

  return map;
};

// SIMPLE AND RELIABLE ROUTE GENERATION - GUARANTEES ALL PRODUCTS
export const findOptimalRoute = (_start: { x: number; y: number }, products: Product[], _forbiddenCells: { x: number; y: number }[] = []): NavigationStep[] => {
  const steps: NavigationStep[] = []

  // Build waypoints in order: each product location, then a simple checkout at top-center (approx)
  const waypoints: { x: number; y: number }[] = products.map(p => ({ x: p.location.x, y: p.location.y }))
  // Fallback checkout position near top center of our generated layout
  waypoints.push({ x: 9, y: 1 })

  // Start from provided start (defaults used by caller)
  let current = { x: _start.x, y: _start.y }

  const pushStep = (next: { x: number; y: number }) => {
    let direction: 'up' | 'down' | 'left' | 'right' = 'right'
    if (next.x > current.x) direction = 'right'
    else if (next.x < current.x) direction = 'left'
    else if (next.y > current.y) direction = 'down'
    else if (next.y < current.y) direction = 'up'

    const distance = 2 // meters per cell
    const instruction =
      direction === 'right' ? `Continue right ${distance}m`
      : direction === 'left' ? `Continue left ${distance}m`
      : direction === 'down' ? `Go straight ${distance}m`
      : `Go straight ${distance}m`

    steps.push({ x: next.x, y: next.y, direction, instruction, distance })
    current = next
  }

  for (const target of waypoints) {
    // Move horizontally first, then vertically (simple aisle-friendly pattern)
    while (current.x !== target.x) {
      const nextX = current.x + (current.x < target.x ? 1 : -1)
      pushStep({ x: nextX, y: current.y })
    }
    while (current.y !== target.y) {
      const nextY = current.y + (current.y < target.y ? 1 : -1)
      pushStep({ x: current.x, y: nextY })
    }
  }

  return steps
}

const manhattanDistance = (pos1: { x: number; y: number }, pos2: { x: number; y: number }): number => {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y)
}





// A* pathfinding algorithm
const aStarPathfinding = (start: { x: number; y: number }, goal: { x: number; y: number }, forbidden?: Set<string>): { x: number; y: number }[] => {
  const openSet = [start]
  const cameFrom = new Map<string, { x: number; y: number }>()
  const gScore = new Map<string, number>()
  const fScore = new Map<string, number>()

  gScore.set(`${start.x},${start.y}`, 0)
  fScore.set(`${start.x},${start.y}`, manhattanDistance(start, goal))

  while (openSet.length > 0) {
    // Find node with lowest fScore
    let current = openSet[0]
    let currentIndex = 0
    
    for (let i = 1; i < openSet.length; i++) {
      const score = fScore.get(`${openSet[i].x},${openSet[i].y}`) || Infinity
      const currentScore = fScore.get(`${current.x},${current.y}`) || Infinity
      if (score < currentScore) {
        current = openSet[i]
        currentIndex = i
      }
    }

    if (current.x === goal.x && current.y === goal.y) {
      // Reconstruct path
      const path: { x: number; y: number }[] = []
      while (cameFrom.has(`${current.x},${current.y}`)) {
        path.unshift(current)
        current = cameFrom.get(`${current.x},${current.y}`)!
      }
      path.unshift(start)
      return path
    }

    openSet.splice(currentIndex, 1)

    // Check neighbors
    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 }
    ]

    for (const neighbor of neighbors) {
      // Avoid forbidden cells if possible
      if (forbidden && forbidden.has(`${neighbor.x},${neighbor.y}`)) continue

      const tentativeGScore = (gScore.get(`${current.x},${current.y}`) || Infinity) + 1

      if (tentativeGScore < (gScore.get(`${neighbor.x},${neighbor.y}`) || Infinity)) {
        cameFrom.set(`${neighbor.x},${neighbor.y}`, current)
        gScore.set(`${neighbor.x},${neighbor.y}`, tentativeGScore)
        fScore.set(`${neighbor.x},${neighbor.y}`, tentativeGScore + manhattanDistance(neighbor, goal))
        if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
          openSet.push(neighbor)
        }
      }
    }
  }

  // If no path found, allow forbidden cells (fallback)
  if (forbidden && forbidden.size > 0) {
    return aStarPathfinding(start, goal, undefined)
  }

  // No path found at all
  return [start]
}

export const calculateTotalDistance = (start: { x: number; y: number }, products: Product[]): number => {
  let total = 0
  let current = { ...start }

  for (const product of products) {
    total += manhattanDistance(current, product.location)
    current = { x: product.location.x, y: product.location.y }
  }

  // Add distance to checkout
  total += manhattanDistance(current, { x: 24, y: 19 })

  return total * 2 // Convert to meters
}

// Enhanced voice navigation system with realistic commands
export const generateVoiceCommands = (steps: NavigationStep[], currentStep: number): VoiceCommand[] => {
  const commands: VoiceCommand[] = []

  if (currentStep < steps.length) {
    const step = steps[currentStep]
    
    // Enhanced direction commands with distance
    const distance = step.distance || 2
    commands.push({
      type: 'direction',
      message: `${step.instruction}. ${getVoiceDirection(step.direction, distance)}`
    })

    // Arrival commands for products
    if (currentStep < steps.length - 1 && steps[currentStep + 1]?.instruction.includes('aisle')) {
      commands.push({
        type: 'arrival',
        message: `You have arrived at your destination. Look for the product on your ${step.direction} side.`
      })
    }

    // Progress updates
    if (currentStep > 0 && currentStep % 3 === 0) {
      const progress = Math.round((currentStep / steps.length) * 100)
      commands.push({
        type: 'direction',
        message: `Navigation progress: ${progress}% complete.`
      })
    }
  }

  return commands
}

const getVoiceDirection = (direction: string, distance: number): string => {
  switch (direction) {
    case 'right':
      return `Keep moving forward and turn right at the next intersection in ${distance}m.`
    case 'left':
      return `Keep moving forward and turn left at the next intersection in ${distance}m.`
    case 'down':
      return `Continue straight ahead through the aisle for ${distance}m.`
    case 'up':
      return `Turn around and head back the way you came for ${distance}m.`
    default:
      return `Continue following the path for ${distance}m.`
  }
}

// Enhanced smart product suggestions
export const generateProductSuggestions = (currentProduct: Product, allProducts: Product[], shoppingList: any[] = []): ProductSuggestion[] => {
  const suggestions: ProductSuggestion[] = []
  
  // Get IDs of items already in shopping list
  const shoppingListIds = shoppingList.map(item => item.product.id)
  
  // Enhanced product relationships
  const productRelationships = {
    'bread': ['jam', 'butter', 'cheese', 'milk'],
    'milk': ['cereal', 'bread', 'yogurt', 'cheese'],
    'pasta': ['sauce', 'cheese', 'olive oil', 'garlic'],
    'chicken': ['rice', 'vegetables', 'sauce', 'spices'],
    'eggs': ['bread', 'milk', 'cheese', 'bacon'],
    'tomatoes': ['pasta', 'cheese', 'basil', 'olive oil'],
    'potatoes': ['chicken', 'vegetables', 'butter', 'cheese'],
    'onions': ['pasta', 'chicken', 'vegetables', 'garlic'],
    'garlic': ['pasta', 'chicken', 'vegetables', 'olive oil'],
    'cheese': ['bread', 'pasta', 'milk', 'eggs']
  }

  // Find related products (excluding current product and items already in shopping list)
  const relatedProducts = allProducts.filter(p => {
    // Exclude current product
    if (p.id === currentProduct.id) return false
    
    // Exclude items already in shopping list
    if (shoppingListIds.includes(p.id)) return false
    
    // Check category match
    if (p.category === currentProduct.category) return true
    
    // Check product relationships
    const currentName = currentProduct.name.toLowerCase()
    for (const [key, related] of Object.entries(productRelationships)) {
      if (currentName.includes(key)) {
        return related.some(rel => p.name.toLowerCase().includes(rel))
      }
    }
    
    return false
  })

  // Calculate distances and create suggestions
  relatedProducts.forEach(product => {
    const distance = manhattanDistance(currentProduct.location, product.location) * 2
    
    let reason = ''
    if (product.category === currentProduct.category) {
      reason = `Related ${product.category} item`
    } else {
      const currentName = currentProduct.name.toLowerCase()
      for (const [key, related] of Object.entries(productRelationships)) {
        if (currentName.includes(key)) {
          const match = related.find(rel => product.name.toLowerCase().includes(rel))
          if (match) {
            reason = `Perfect with ${currentProduct.name}!`
            break
          }
        }
      }
    }

    if (reason) {
      suggestions.push({
        product,
        reason,
        distance
      })
    }
  })

  // Sort by distance and return top 3
  return suggestions
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
}

// Update map with Google Maps-style narrow lane paths and shopping list information
export const updateMapWithNavigation = (
  map: MapCell[][], 
  steps: NavigationStep[], 
  currentStep: number,
  shoppingList: any[] = []
): MapCell[][] => {
  const newMap = map.map(row => row.map(cell => ({ ...cell })))

  // Clear previous path and direction indicators
  for (let y = 0; y < newMap.length; y++) {
    for (let x = 0; x < newMap[y].length; x++) {
      newMap[y][x].isPath = false
      newMap[y][x].isCurrent = false
      newMap[y][x].isDirection = false
      newMap[y][x].pathDirection = undefined
    }
  }

  // Mark Google Maps-style narrow lane paths
  for (let i = 0; i < currentStep && i < steps.length; i++) {
    const step = steps[i]
    if (step.y < newMap.length && step.x < newMap[0].length) {
      newMap[step.y][step.x].isPath = true
      
      // Determine path direction for narrow lanes
      if (i > 0) {
        const prevStep = steps[i - 1]
        if (step.x !== prevStep.x && step.y !== prevStep.y) {
          newMap[step.y][step.x].pathDirection = 'corner'
        } else if (step.x !== prevStep.x) {
          newMap[step.y][step.x].pathDirection = 'horizontal'
        } else {
          newMap[step.y][step.x].pathDirection = 'vertical'
        }
      }
    }
  }

  // Mark current position and direction
  if (currentStep < steps.length) {
    const currentStepData = steps[currentStep]
    if (currentStepData.y < newMap.length && currentStepData.x < newMap[0].length) {
      newMap[currentStepData.y][currentStepData.x].isCurrent = true
      newMap[currentStepData.y][currentStepData.x].isDirection = true
    }
  }

  // Mark shopping list items with special indicators
  shoppingList.forEach(item => {
    const { x, y } = item.product.location
    if (y < newMap.length && x < newMap[0].length) {
      newMap[y][x].isInShoppingList = true
      newMap[y][x].shoppingListItem = item
    }
  })

  return newMap
} 