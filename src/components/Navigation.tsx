import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Map } from 'lucide-react'

const Navigation = () => {
  const location = useLocation()

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-600">Smart Mart</h1>
          </div>
          
          <div className="flex space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                location.pathname === '/'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <ShoppingCart size={20} />
              <span>Shopping List</span>
            </Link>
            
            <Link
              to="/map"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                location.pathname === '/map'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <Map size={20} />
              <span>Store Map</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation 