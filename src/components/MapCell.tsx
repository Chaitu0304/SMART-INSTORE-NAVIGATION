import type { MapCell as MapCellType } from '../types'

interface MapCellProps {
  cell: MapCellType
  onClick?: () => void
}

const MapCell = ({ cell, onClick }: MapCellProps) => {
  const getCellContent = () => {
    switch (cell.type) {
      case 'entrance':
        return { 
          icon: '🚪', 
          bgColor: 'bg-emerald-500', 
          borderColor: 'border-emerald-600',
          text: 'Entrance',
          textColor: 'text-emerald-800',
          className: 'entrance-cell'
        }
      case 'checkout':
        return { 
          icon: '💳', 
          bgColor: 'bg-red-500', 
          borderColor: 'border-red-600',
          text: 'Checkout',
          textColor: 'text-red-800',
          className: 'checkout-cell'
        }
      case 'product':
        // Check if this product is in the shopping list
        if (cell.isInShoppingList) {
          return { 
            icon: cell.product?.image || '📦', 
            bgColor: 'bg-purple-500', 
            borderColor: 'border-purple-600',
            text: cell.product?.name || 'Product',
            textColor: 'text-purple-800',
            className: 'shopping-list-product-cell'
          }
        } else {
          return { 
            icon: cell.product?.image || '📦', 
            bgColor: 'bg-blue-500', 
            borderColor: 'border-blue-600',
            text: cell.product?.name || 'Product',
            textColor: 'text-blue-800',
            className: 'product-cell'
          }
        }
      case 'aisle':
        return { 
          icon: '🛒', 
          bgColor: 'bg-slate-200', 
          borderColor: 'border-slate-300',
          text: 'Aisle',
          textColor: 'text-slate-700',
          className: 'aisle-cell'
        }
      case 'wall':
        return { 
          icon: '🧱', 
          bgColor: 'bg-gray-800', 
          borderColor: 'border-gray-900',
          text: 'Wall',
          textColor: 'text-gray-300',
          className: 'wall-cell'
        }
      case 'empty':
        return { 
          icon: '', 
          bgColor: 'bg-white', 
          borderColor: 'border-gray-100',
          text: '',
          textColor: 'text-gray-600',
          className: 'empty-cell'
        }
      default:
        return { 
          icon: '', 
          bgColor: 'bg-white', 
          borderColor: 'border-gray-200',
          text: '',
          textColor: 'text-gray-600',
          className: 'default-cell'
        }
    }
  }

  const { icon, bgColor, borderColor, text, className } = getCellContent()
  const isPath = cell.isPath
  const isCurrent = cell.isCurrent
  const isDirection = cell.isDirection
  const pathDirection = cell.pathDirection
  const isInShoppingList = cell.isInShoppingList
  const isReached = cell.isReached

  return (
    <button
      className={`
        w-6 h-6 border ${borderColor} flex items-center justify-center text-xs font-medium
        ${bgColor} 
        ${isPath ? 'ring-1 ring-blue-500 bg-blue-100 shadow-sm' : ''} 
        ${isCurrent ? 'ring-2 ring-blue-600 bg-blue-200 scale-110 shadow-md' : ''}
        ${isDirection ? 'ring-1 ring-green-500 bg-green-100' : ''}
        ${isInShoppingList ? 'ring-2 ring-purple-500 shadow-lg' : ''}
        ${isReached ? 'ring-2 ring-green-500 bg-green-200' : ''}
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
        transition-all duration-200 ease-in-out
        relative overflow-hidden
        ${className}
      `}
      onClick={onClick}
      title={text}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick?.() }}
    >
      {/* Google Maps-style narrow lane path */}
      {isPath && (
        <div className="absolute inset-0">
          {/* Horizontal lane */}
          {pathDirection === 'horizontal' && (
            <div className="absolute inset-y-1 left-0 right-0 bg-blue-500 rounded-full"></div>
          )}
          {/* Vertical lane */}
          {pathDirection === 'vertical' && (
            <div className="absolute inset-x-1 top-0 bottom-0 bg-blue-500 rounded-full"></div>
          )}
          {/* Corner turn */}
          {pathDirection === 'corner' && (
            <>
              <div className="absolute inset-y-1 left-0 right-0 bg-blue-500 rounded-full"></div>
              <div className="absolute inset-x-1 top-0 bottom-0 bg-blue-500 rounded-full"></div>
            </>
          )}
        </div>
      )}
      
      {/* Direction arrows for current position */}
      {isDirection && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-blue-600 text-xs font-bold">→</div>
        </div>
      )}
      
      {/* Current position indicator with Google Maps style */}
      {isCurrent && (
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-600 rounded-full animate-ping shadow-lg"></div>
      )}
      
      {/* Shopping list indicator */}
      {isInShoppingList && !isReached && (
        <div className="absolute -top-0.5 -left-0.5 w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-lg"></div>
      )}
      
      {/* Reached item indicator */}
      {isReached && (
        <div className="absolute -top-0.5 -left-0.5 w-2 h-2 bg-green-500 rounded-full shadow-lg"></div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {icon && <div className="text-xs">{icon}</div>}
      </div>
    </button>
  )
}

export default MapCell 