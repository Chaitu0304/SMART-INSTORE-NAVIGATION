import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingListItem, Product } from '../types'
import { products, categories } from '../data/products'
import ProductCard from '../components/ProductCard'
import { ShoppingCart, Map, ArrowRight } from 'lucide-react'

const ShoppingList = () => {
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchTerm, setSearchTerm] = useState('')

  // Load shopping list from localStorage with error handling
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smartMartShoppingList')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setShoppingList(parsed)
        }
      }
    } catch (error) {
      console.error('Error loading shopping list:', error)
      localStorage.removeItem('smartMartShoppingList')
    }
  }, [])

  // Save shopping list to localStorage with error handling
  useEffect(() => {
    try {
      localStorage.setItem('smartMartShoppingList', JSON.stringify(shoppingList))
    } catch (error) {
      console.error('Error saving shopping list:', error)
    }
  }, [shoppingList])

  const addToCart = (product: Product) => {
    setShoppingList(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prev, { product, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (product: Product) => {
    setShoppingList(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      } else {
        return prev.filter(item => item.product.id !== product.id)
      }
    })
  }

  const deleteFromCart = (product: Product) => {
    setShoppingList(prev => prev.filter(item => item.product.id !== product.id))
  }

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const totalItems = shoppingList.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = shoppingList.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping List</h1>
          <p className="text-gray-600">Browse products and add them to your shopping list</p>
        </div>
        
        {shoppingList.length > 0 && (
          <Link
            to="/map"
            className="btn-primary flex items-center space-x-2"
          >
            <Map size={20} />
            <span>View Map</span>
            <ArrowRight size={20} />
          </Link>
        )}
      </div>

      {/* Shopping Cart Summary */}
      {shoppingList.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ShoppingCart size={24} className="text-primary-600" />
              <div>
                <h3 className="font-semibold text-lg">Shopping Cart</h3>
                <p className="text-gray-600">{totalItems} items • ${totalPrice.toFixed(2)}</p>
              </div>
            </div>
            <button
              onClick={() => setShoppingList([])}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          </div>
          
          <div className="mt-4 space-y-2">
            {shoppingList.map(item => (
              <ProductCard
                key={item.product.id}
                product={item.product}
                quantity={item.quantity}
                onAdd={addToCart}
                onRemove={removeFromCart}
                onDelete={deleteFromCart}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex-shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="All">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{product.image}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-gray-600">{product.category}</p>
                <p className="text-primary-600 font-medium">${product.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Aisle: {product.aisle}</p>
              </div>
              <button
                onClick={() => addToCart(product)}
                className="btn-primary"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

export default ShoppingList 