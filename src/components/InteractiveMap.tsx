import { useState, useEffect } from 'react'
import { ZoomIn, ZoomOut, RotateCcw, MapPin, Navigation } from 'lucide-react'
import type { MapCell as MapCellType } from '../types'
import MapCell from './MapCell'

interface InteractiveMapProps {
  storeMap: MapCellType[][]
  currentPosition: { x: number; y: number } | null
  onCellClick?: (cell: MapCellType) => void
}

const InteractiveMap = ({ storeMap, currentPosition, onCellClick }: InteractiveMapProps) => {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Auto-zoom to current position when navigation starts
  useEffect(() => {
    if (currentPosition) {
      const centerX = currentPosition.x * 24 // 24px per cell
      const centerY = currentPosition.y * 24
      
      // Calculate zoom to fit current position
      const newZoom = Math.min(2, Math.max(0.5, 1.5))
      setZoom(newZoom)
      
      // Center on current position
      setPan({
        x: -centerX * newZoom + window.innerWidth / 2,
        y: -centerY * newZoom + window.innerHeight / 2
      })
    }
  }, [currentPosition])

  const handleZoomIn = () => {
    setZoom(prev => Math.min(3, prev + 0.2))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.3, prev - 0.2))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const centerOnCurrentPosition = () => {
    if (currentPosition) {
      const centerX = currentPosition.x * 24
      const centerY = currentPosition.y * 24
      
      setPan({
        x: -centerX * zoom + window.innerWidth / 2,
        y: -centerY * zoom + window.innerHeight / 2
      })
    }
  }

  return (
    <div className="relative bg-gray-50 rounded-xl p-4 overflow-hidden">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={20} className="text-gray-600" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={20} className="text-gray-600" />
        </button>
        <button
          onClick={handleRotate}
          className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Rotate Map"
        >
          <RotateCcw size={20} className="text-gray-600" />
        </button>
        {currentPosition && (
          <button
            onClick={centerOnCurrentPosition}
            className="w-10 h-10 bg-blue-500 rounded-lg shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
            title="Center on Current Position"
          >
            <Navigation size={20} className="text-white" />
          </button>
        )}
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg px-3 py-2">
        <div className="flex items-center space-x-2">
          <MapPin size={16} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      {/* Interactive Map Container */}
      <div
        className="relative cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="inline-block origin-center transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'center'
          }}
        >
          <div className="grid grid-cols-25 gap-0.5">
            {storeMap.map((row, y) =>
              row.map((cell, x) => (
                <MapCell 
                  key={`${x}-${y}`} 
                  cell={cell} 
                  onClick={() => onCellClick?.(cell)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
            <span className="text-gray-700">Entrance</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-700">Checkout</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-700">Products</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-slate-200 rounded"></div>
            <span className="text-gray-700">Aisles</span>
          </div>
        </div>
      </div>

      {/* Current Position Indicator */}
      {currentPosition && (
        <div className="absolute top-1/2 left-1/2 z-20 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-ping shadow-lg"></div>
        </div>
      )}
    </div>
  )
}

export default InteractiveMap 