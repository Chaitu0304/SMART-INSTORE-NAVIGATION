import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MapPin, Navigation, Target, RotateCcw, ZoomIn, ZoomOut, Compass } from 'lucide-react';
import type { MapCell, NavigationStep } from '../types';

interface AdvancedMartMapProps {
  storeMap: MapCell[][];
  path: NavigationStep[];
  currentStep: number;
  onCellClick?: (cell: MapCell) => void;
  onReroute?: (newPath: NavigationStep[]) => void;
  theme?: 'default' | 'dark' | 'satellite' | 'minimal';
  currentPosition?: { x: number; y: number };
  userHeading?: number;
  isMoving?: boolean;
}

interface MapTheme {
  background: string;
  aisleColor: string;
  wallColor: string;
  productColor: string;
  entranceColor: string;
  checkoutColor: string;
  pathColor: string;
  textColor: string;
  overlayBg: string;
}

const THEMES: Record<string, MapTheme> = {
  default: {
    background: '#f8fafc',
    aisleColor: '#e2e8f0',
    wallColor: '#1e293b',
    productColor: '#3b82f6',
    entranceColor: '#10b981',
    checkoutColor: '#ef4444',
    pathColor: '#2563eb',
    textColor: '#1e293b',
    overlayBg: 'rgba(255, 255, 255, 0.95)'
  },
  dark: {
    background: '#0f172a',
    aisleColor: '#334155',
    wallColor: '#475569',
    productColor: '#3b82f6',
    entranceColor: '#10b981',
    checkoutColor: '#ef4444',
    pathColor: '#60a5fa',
    textColor: '#f1f5f9',
    overlayBg: 'rgba(15, 23, 42, 0.95)'
  },
  satellite: {
    background: '#1a1a1a',
    aisleColor: '#2d2d2d',
    wallColor: '#404040',
    productColor: '#3b82f6',
    entranceColor: '#10b981',
    checkoutColor: '#ef4444',
    pathColor: '#fbbf24',
    textColor: '#ffffff',
    overlayBg: 'rgba(26, 26, 26, 0.95)'
  },
  minimal: {
    background: '#ffffff',
    aisleColor: '#f3f4f6',
    wallColor: '#d1d5db',
    productColor: '#3b82f6',
    entranceColor: '#10b981',
    checkoutColor: '#ef4444',
    pathColor: '#2563eb',
    textColor: '#374151',
    overlayBg: 'rgba(255, 255, 255, 0.95)'
  }
};

const CELL_SIZE = 40;
const PATH_WIDTH = 6;

function getCellCoords(x: number, y: number) {
  return [x * CELL_SIZE, y * CELL_SIZE];
}

function getPathPolyline(path: NavigationStep[]) {
  return path.map(step => getCellCoords(step.x + 0.5, step.y + 0.5)).map(([x, y]) => `${x},${y}`).join(' ');
}


const AdvancedMartMap: React.FC<AdvancedMartMapProps> = ({
  storeMap,
  path,
  currentStep,
  onCellClick,
  onReroute,
  theme = 'default',
  currentPosition,
  userHeading,
  isMoving
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showOverlays, setShowOverlays] = useState(true);
  const [nextTurn, setNextTurn] = useState<string>('');
  const [distanceToDestination, setDistanceToDestination] = useState<number>(0);
  const [isRerouting, setIsRerouting] = useState(false);
  const [followMode, setFollowMode] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const currentTheme = THEMES[theme];

  // Auto-center on current position with improved logic
  useEffect(() => {
    if (path.length > 0 && currentStep < path.length && followMode) {
      const { x, y } = path[currentStep];
      const containerWidth = mapContainerRef.current?.clientWidth || window.innerWidth;
      const containerHeight = mapContainerRef.current?.clientHeight || window.innerHeight;
      
      // Calculate the center position for the user's current location
      const userCenterX = (x + 0.5) * CELL_SIZE * zoom;
      const userCenterY = (y + 0.5) * CELL_SIZE * zoom;
      
      // Center the user's position in the viewport
      const centerX = containerWidth / 2 - userCenterX;
      const centerY = containerHeight / 2 - userCenterY;
      
      // Apply smooth transition only when not dragging
      if (!isDragging) {
        setPan({ x: centerX, y: centerY });
      }
    }
  }, [currentStep, path, zoom, followMode, isDragging]);

  // Calculate next turn and distance
  useEffect(() => {
    if (currentStep < path.length - 1) {
      const current = path[currentStep];
      const next = path[currentStep + 1];
      const dx = next.x - current.x;
      const dy = next.y - current.y;
      
      let turn = '';
      if (dx === 1) turn = 'Turn right';
      else if (dx === -1) turn = 'Turn left';
      else if (dy === 1) turn = 'Go straight';
      else if (dy === -1) turn = 'Turn around';
      
      setNextTurn(turn);
      
      // Calculate distance to destination
      const remainingSteps = path.length - currentStep - 1;
      setDistanceToDestination(remainingSteps * CELL_SIZE);
    } else {
      setNextTurn('You have arrived!');
      setDistanceToDestination(0);
    }
  }, [currentStep, path]);

  // Handle mouse interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    // Disable follow mode when user starts dragging
    setFollowMode(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newPan = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };
      setPan(newPan);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
    setFollowMode(true);
  };

  const toggleFollowMode = () => {
    setFollowMode(!followMode);
    if (!followMode) {
      // When re-enabling follow mode, center on current position
      if (path.length > 0 && currentStep < path.length) {
        const { x, y } = path[currentStep];
        const containerWidth = mapContainerRef.current?.clientWidth || window.innerWidth;
        const containerHeight = mapContainerRef.current?.clientHeight || window.innerHeight;
        const userCenterX = (x + 0.5) * CELL_SIZE * zoom;
        const userCenterY = (y + 0.5) * CELL_SIZE * zoom;
        const centerX = containerWidth / 2 - userCenterX;
        const centerY = containerHeight / 2 - userCenterY;
        setPan({ x: centerX, y: centerY });
      }
    }
  };

  // Live rerouting simulation
  const handleReroute = useCallback(() => {
    if (!onReroute) return;
    
    setIsRerouting(true);
    setTimeout(() => {
      // Simulate finding a new route
      const newPath = [...path];
      // Simple rerouting: reverse the path
      newPath.reverse();
      onReroute(newPath);
      setIsRerouting(false);
    }, 2000);
  }, [path, onReroute]);

  // Map dimensions
  const width = storeMap[0]?.length * CELL_SIZE || 0;
  const height = storeMap.length * CELL_SIZE || 0;

  // Path and arrow data
  const polyline = getPathPolyline(path.slice(0, currentStep + 1));

  // User position marker with heading and movement
  const liveX = (currentPosition?.x ?? path[currentStep]?.x ?? 0) + 0.5
  const liveY = (currentPosition?.y ?? path[currentStep]?.y ?? 0) + 0.5
  const heading = userHeading ?? 0
  const moving = isMoving ?? false

  // Generate grid lines and labels
  const generateGridElements = () => {
    const elements = [];
    const cols = storeMap[0]?.length || 0;
    const rows = storeMap.length || 0;
    
    // Grid lines every 10 cells
    for (let i = 0; i <= cols; i += 10) {
      elements.push(
        <line
          key={`v-${i}`}
          x1={i * CELL_SIZE}
          y1={0}
          x2={i * CELL_SIZE}
          y2={height}
          stroke={currentTheme.textColor}
          strokeWidth={2}
          opacity={0.4}
          strokeDasharray="10 5"
        />
      );
    }
    
    for (let i = 0; i <= rows; i += 10) {
      elements.push(
        <line
          key={`h-${i}`}
          x1={0}
          y1={i * CELL_SIZE}
          x2={width}
          y2={i * CELL_SIZE}
          stroke={currentTheme.textColor}
          strokeWidth={2}
          opacity={0.4}
          strokeDasharray="10 5"
        />
      );
    }
    
    // Coordinate labels every 10 cells
    for (let i = 0; i <= cols; i += 10) {
      elements.push(
        <text
          key={`label-x-${i}`}
          x={i * CELL_SIZE + CELL_SIZE / 2}
          y={CELL_SIZE / 2}
          textAnchor="middle"
          fontSize={14}
          fill={currentTheme.textColor}
          opacity={0.8}
          fontWeight="bold"
        >
          {i}
        </text>
      );
    }
    
    for (let i = 0; i <= rows; i += 10) {
      elements.push(
        <text
          key={`label-y-${i}`}
          x={CELL_SIZE / 2}
          y={i * CELL_SIZE + CELL_SIZE / 2}
          textAnchor="middle"
          fontSize={14}
          fill={currentTheme.textColor}
          opacity={0.8}
          fontWeight="bold"
        >
          {i}
        </text>
      );
    }
    
    return elements;
  };

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl overflow-hidden shadow-xl">
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-full relative cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ background: currentTheme.background }}
      >
        {/* SVG Map */}
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
            background: currentTheme.background,
          }}
        >
          {/* Store Layout */}
          {storeMap.flat().map(cell => {
            const [x, y] = getCellCoords(cell.x, cell.y);
            let fill = 'white';
            let stroke = '#e5e7eb';
            let label = '';

            switch (cell.type) {
              case 'aisle':
                fill = currentTheme.aisleColor;
                stroke = '#a3a3a3';
                break;
              case 'wall':
                fill = currentTheme.wallColor;
                stroke = currentTheme.wallColor;
                break;
              case 'product':
                fill = cell.isInShoppingList ? (cell.isReached ? '#10b981' : '#f59e0b') : currentTheme.productColor;
                stroke = cell.isInShoppingList ? (cell.isReached ? '#059669' : '#d97706') : currentTheme.productColor;
                label = cell.product ? cell.product.name : '';
                break;
              case 'entrance':
                fill = currentTheme.entranceColor;
                stroke = '#059669';
                label = 'Entrance';
                break;
              case 'checkout':
                fill = currentTheme.checkoutColor;
                stroke = '#b91c1c';
                label = 'Checkout';
                break;
              default:
                fill = currentTheme.background;
                stroke = '#e5e7eb';
                break;
            }

            // Draw aisles as long vertical rectangles
            if (cell.type === 'aisle') {
              // Only draw the aisle block at the start of each aisle (to avoid overdraw)
              if (cell.x > 0 && storeMap[cell.y][cell.x - 1].type !== 'aisle') {
                // Find the height of this aisle
                let aisleHeight = 1;
                while (cell.y + aisleHeight < storeMap.length && storeMap[cell.y + aisleHeight][cell.x].type === 'aisle') {
                  aisleHeight++;
                }
                return (
                  <g key={`aisle-${cell.x}-${cell.y}`}>
                    <rect
                      x={x}
                      y={y}
                      width={CELL_SIZE}
                      height={CELL_SIZE * aisleHeight}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={2}
                      rx={8}
                      opacity={0.85}
                    />
                    {/* Aisle number label */}
                    <text
                      x={x + CELL_SIZE / 2}
                      y={y + (CELL_SIZE * aisleHeight) / 2}
                      textAnchor="middle"
                      fontSize={18}
                      fill={currentTheme.textColor}
                      fontWeight="bold"
                      opacity={0.7}
                    >
                      {Math.floor(cell.x / 4) + 1}
                    </text>
                  </g>
                );
              }
              return null;
            }

            // Draw shelves as blocks with product names/icons
            if (cell.type === 'product' && cell.product) {
              return (
                <g key={`product-${cell.x}-${cell.y}`}
                  onClick={() => onCellClick?.(cell)}
                  style={{ cursor: onCellClick ? 'pointer' : 'default' }}
                >
                  <rect
                    x={x + 4}
                    y={y + 4}
                    width={CELL_SIZE - 8}
                    height={CELL_SIZE - 8}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={2}
                    rx={4}
                  />
                  <text
                    x={x + CELL_SIZE / 2}
                    y={y + CELL_SIZE / 2 + 4}
                    textAnchor="middle"
                    fontSize={12}
                    fill={currentTheme.textColor}
                    fontWeight="bold"
                    opacity={0.9}
                  >
                    {cell.product.name.length > 8 ? cell.product.name.slice(0, 8) + '…' : cell.product.name}
                  </text>
                </g>
              );
            }

            // Draw entrance and checkout
            if (cell.type === 'entrance' || cell.type === 'checkout') {
              return (
                <g key={`${cell.type}-${cell.x}-${cell.y}`}
                  onClick={() => onCellClick?.(cell)}
                  style={{ cursor: onCellClick ? 'pointer' : 'default' }}
                >
                  <rect
                    x={x + 2}
                    y={y + 2}
                    width={CELL_SIZE - 4}
                    height={CELL_SIZE - 4}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={3}
                    rx={8}
                  />
                  <text
                    x={x + CELL_SIZE / 2}
                    y={y + CELL_SIZE / 2 + 5}
                    textAnchor="middle"
                    fontSize={14}
                    fill={currentTheme.textColor}
                    fontWeight="bold"
                    opacity={0.95}
                  >
                    {label}
                  </text>
                </g>
              );
            }

            // Draw walkable paths (empty)
            if (cell.type === 'empty') {
              return (
                <rect
                  key={`empty-${cell.x}-${cell.y}`}
                  x={x}
                  y={y}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={1}
                  opacity={0.15}
                />
              );
            }

            // Draw walls
            if (cell.type === 'wall') {
              return (
                <rect
                  key={`wall-${cell.x}-${cell.y}`}
                  x={x}
                  y={y}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={2}
                  opacity={0.7}
                />
              );
            }

            return null;
          })}

          {/* Navigation Path */}
          {polyline && (
            <polyline
              points={polyline}
              fill="none"
              stroke={currentTheme.pathColor}
              strokeWidth={PATH_WIDTH}
              strokeDasharray="20 10"
              strokeLinecap="round"
              opacity={0.9}
            />
          )}

          {/* Destination Pin */}
          {path.length > 0 && (
            <g>
              <circle
                cx={getCellCoords(path[path.length - 1].x + 0.5, path[path.length - 1].y + 0.5)[0]}
                cy={getCellCoords(path[path.length - 1].x + 0.5, path[path.length - 1].y + 0.5)[1]}
                r={20}
                fill="#ef4444"
                stroke="#fff"
                strokeWidth={4}
              />
              <text
                x={getCellCoords(path[path.length - 1].x + 0.5, path[path.length - 1].y + 0.5)[0]}
                y={getCellCoords(path[path.length - 1].x + 0.5, path[path.length - 1].y + 0.5)[1] + 8}
                textAnchor="middle"
                fontSize={20}
                fill="#fff"
                fontWeight="bold"
              >
                📍
              </text>
            </g>
          )}

          {/* User position marker with heading and movement */}
          <g transform={`translate(${liveX * CELL_SIZE}, ${liveY * CELL_SIZE})`}>
            {/* Main user circle */}
            <circle
              r="12"
              fill={moving ? "#ef4444" : "#3b82f6"}
              stroke="white"
              strokeWidth="2"
              className={moving ? "animate-pulse" : ""}
            />
            
            {/* Directional arrow */}
            <g transform={`rotate(${heading * 180 / Math.PI})`}>
              <polygon
                points="0,-8 4,0 0,-4"
                fill="white"
                stroke="none"
              />
            </g>
            
            {/* Movement indicator */}
            {moving && (
              <circle
                r="20"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                opacity="0.6"
                className="animate-ping"
              />
            )}
          </g>

          {/* Grid Lines and Labels */}
          {showGrid && generateGridElements()}
        </svg>

        {/* Map Legend */}
        <div className="absolute top-4 left-4 bg-white bg-opacity-95 rounded-lg shadow-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Map Legend</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Available Products</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Shopping List Items</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Reached Items</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span>Aisles</span>
            </div>
          </div>
        </div>

        {/* Coordinate Display */}
        {path[currentStep] && (
          <div className="absolute top-4 right-4 bg-white bg-opacity-95 rounded-lg shadow-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Current Position</h4>
            <div className="text-sm space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium">X:</span>
                <span className="text-blue-600 font-bold">{path[currentStep].x}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">Y:</span>
                <span className="text-blue-600 font-bold">{path[currentStep].y}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">Grid:</span>
                <span className="text-green-600 font-bold">
                  {Math.floor(path[currentStep].x / 10) * 10}, {Math.floor(path[currentStep].y / 10) * 10}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 bg-white bg-opacity-90 rounded-lg shadow-lg flex items-center justify-center hover:bg-opacity-100 transition-all"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 bg-white bg-opacity-90 rounded-lg shadow-lg flex items-center justify-center hover:bg-opacity-100 transition-all"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={handleResetView}
            className="w-10 h-10 bg-white bg-opacity-90 rounded-lg shadow-lg flex items-center justify-center hover:bg-opacity-100 transition-all"
            title="Reset View"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={toggleFollowMode}
            className={`w-10 h-10 rounded-lg shadow-lg flex items-center justify-center transition-all ${
              followMode 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-white bg-opacity-90 hover:bg-opacity-100'
            }`}
            title={followMode ? 'Disable auto-follow' : 'Enable auto-follow'}
          >
            <Target size={20} />
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`w-10 h-10 rounded-lg shadow-lg flex items-center justify-center transition-all ${
              showGrid 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-white bg-opacity-90 hover:bg-opacity-100'
            }`}
            title={showGrid ? 'Hide Grid' : 'Show Grid'}
          >
            <div className="w-4 h-4 border border-current" style={{ borderWidth: '1px' }}></div>
          </button>
        </div>

        {/* Navigation Overlays */}
        {showOverlays && (
          <>
            {/* Top Navigation Bar */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Navigation size={24} />
                  <div>
                    <h3 className="font-bold text-lg">Smart Mart Navigation</h3>
                    <p className="text-blue-100 text-sm">GPS-style shopping guidance</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-blue-100">Distance to destination</p>
                    <p className="font-bold text-xl">{Math.round(distanceToDestination)}m</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-100">Next turn</p>
                    <p className="font-bold text-lg">{nextTurn}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Target size={20} />
                    <span className="font-semibold">Step {currentStep + 1} of {path.length}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Compass size={20} />
                    <span className="font-semibold">{Math.round(rotation)}°</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleReroute}
                    disabled={isRerouting}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
                  >
                    {isRerouting ? 'Rerouting...' : 'Reroute'}
                  </button>
                  <button
                    onClick={() => setShowOverlays(!showOverlays)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    {showOverlays ? 'Hide UI' : 'Show UI'}
                  </button>
                </div>
              </div>
            </div>

            {/* Current Position Indicator */}
            {path[currentStep] && (
              <div className="absolute left-4 top-20 bg-white bg-opacity-95 rounded-lg shadow-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <MapPin size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Current Position</p>
                    <p className="text-sm text-gray-600">
                      Aisle {Math.floor(path[currentStep].x / 10) + 1}, Section {Math.floor(path[currentStep].y / 10) + 1}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {followMode ? '🔄 Auto-following' : '📍 Manual mode'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdvancedMartMap; 