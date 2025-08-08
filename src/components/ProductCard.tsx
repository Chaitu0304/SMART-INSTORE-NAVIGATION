// src/components/ProductCard.tsx
import { Product } from '../types'
import { Plus, Minus, Trash2 } from 'lucide-react'

interface ProductCardProps {
  product: Product
  quantity: number
  onAdd: (product: Product) => void
  onRemove: (product: Product) => void
  onDelete: (product: Product) => void
}

const ProductCard = ({ product, quantity, onAdd, onRemove, onDelete }: ProductCardProps) => {
  return (
    <div className="card flex items-center justify-between p-4">
      <div className="flex items-center space-x-4">
        <div className="text-4xl">{product.image}</div>
        <div>
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <p className="text-gray-600">{product.category}</p>
          <p className="text-primary-600 font-medium">${product.price.toFixed(2)}</p>
          <p className="text-sm text-gray-500">Aisle: {product.aisle}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onRemove(product)}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          disabled={quantity <= 0}
        >
          <Minus size={16} />
        </button>
        
        <span className="w-8 text-center font-medium">{quantity}</span>
        
        <button
          onClick={() => onAdd(product)}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Plus size={16} />
        </button>
        
        <button
          onClick={() => onDelete(product)}
          className="p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors ml-2"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}

export default ProductCard 