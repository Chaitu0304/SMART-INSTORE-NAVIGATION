export interface Product {
  id: string
  name: string
  category: string
  price: number
  image: string
  location: {
    x: number
    y: number
  }
  aisle: string
}

export interface ShoppingListItem {
  product: Product
  quantity: number
}

export interface MapCell {
  x: number
  y: number
  type: 'empty' | 'product' | 'aisle' | 'entrance' | 'checkout' | 'wall'
  product?: Product
  isPath?: boolean
  isCurrent?: boolean
  isDirection?: boolean
  pathDirection?: 'horizontal' | 'vertical' | 'corner'
  isInShoppingList?: boolean
  shoppingListItem?: ShoppingListItem
  isReached?: boolean
}

export interface NavigationStep {
  x: number
  y: number
  direction: 'up' | 'down' | 'left' | 'right'
  instruction: string
  distance?: number
}

export interface VoiceCommand {
  type: 'direction' | 'suggestion' | 'arrival'
  message: string
  action?: () => void
}

export interface ProductSuggestion {
  product: Product
  reason: string
  distance: number
} 