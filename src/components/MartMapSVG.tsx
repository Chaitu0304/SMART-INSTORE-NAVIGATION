import React, { useRef, useEffect, useState } from 'react';
import type { MapCell, NavigationStep } from '../types';

interface MartMapSVGProps {
  storeMap: MapCell[][];
  path: NavigationStep[];
  currentStep: number;
  zoom?: number;
  rotation?: number;
  onCellClick?: (cell: MapCell) => void;
}

const CELL_SIZE = 32; // px
const AISLE_COLOR = '#e2e8f0';
const WALL_COLOR = '#22223b';
const PRODUCT_COLOR = '#3b82f6';
const ENTRANCE_COLOR = '#10b981';
const CHECKOUT_COLOR = '#ef4444';
const PATH_COLOR = '#2563eb';
const PATH_WIDTH = 8;
const ARROW_SIZE = 24;

function getCellCoords(x: number, y: number) {
  return [x * CELL_SIZE, y * CELL_SIZE];
}

function getPathPolyline(path: NavigationStep[]) {
  return path.map(step => getCellCoords(step.x + 0.5, step.y + 0.5)).map(([x, y]) => `${x},${y}`).join(' ');
}

function getArrowRotation(path: NavigationStep[], currentStep: number) {
  if (currentStep === 0 || path.length === 0) return 0;
  const prev = path[Math.max(0, currentStep - 1)];
  const curr = path[currentStep];
  if (!curr || !prev) return 0;
  const dx = curr.x - prev.x;
  const dy = curr.y - prev.y;
  if (dx === 1) return 0; // right
  if (dx === -1) return 180; // left
  if (dy === 1) return 90; // down
  if (dy === -1) return 270; // up
  return 0;
}

const MartMapSVG: React.FC<MartMapSVGProps> = ({
  storeMap,
  path,
  currentStep,
  zoom = 1,
  rotation = 0,
  onCellClick,
}) => {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Center on current position
  useEffect(() => {
    if (path.length > 0 && currentStep < path.length) {
      const { x, y } = path[currentStep];
      setPan({
        x: window.innerWidth / 2 - (x + 0.5) * CELL_SIZE * zoom,
        y: window.innerHeight / 2 - (y + 0.5) * CELL_SIZE * zoom,
      });
    }
  }, [currentStep, path, zoom]);

  // Drag to pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };
  const handleMouseUp = () => setIsDragging(false);

  // SVG dimensions
  const width = storeMap[0].length * CELL_SIZE;
  const height = storeMap.length * CELL_SIZE;

  // Path polyline
  const polyline = getPathPolyline(path.slice(0, currentStep + 1));
  const arrowRotation = getArrowRotation(path, currentStep);
  const arrowStep = path[currentStep] || path[path.length - 1];
  const [arrowX, arrowY] = arrowStep ? getCellCoords(arrowStep.x + 0.5, arrowStep.y + 0.5) : [0, 0];

  return (
    <div
      style={{ width: '100%', height: 600, background: '#f8fafc', borderRadius: 16, overflow: 'hidden', position: 'relative' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          background: '#f8fafc',
        }}
      >
        {/* Draw aisles, walls, products, entrance, checkout */}
        {storeMap.flat().map(cell => {
          const [x, y] = getCellCoords(cell.x, cell.y);
          let fill = 'white';
          let stroke = '#e5e7eb';
          if (cell.type === 'aisle') fill = AISLE_COLOR;
          if (cell.type === 'wall') fill = WALL_COLOR;
          if (cell.type === 'product') fill = PRODUCT_COLOR;
          if (cell.type === 'entrance') fill = ENTRANCE_COLOR;
          if (cell.type === 'checkout') fill = CHECKOUT_COLOR;
          if (cell.type === 'product') {
            // Product cells have rounded corners
          }
          return (
            <g key={`${cell.x}-${cell.y}`}
              onClick={() => onCellClick?.(cell)}
              style={{ cursor: onCellClick ? 'pointer' : 'default' }}
            >
              <rect
                x={x}
                y={y}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill={fill}
                stroke={stroke}
                strokeWidth={1}
                rx={cell.type === 'aisle' ? 6 : 2}
              />
              {cell.type === 'product' && cell.product && (
                <text
                  x={x + CELL_SIZE / 2}
                  y={y + CELL_SIZE / 2 + 4}
                  textAnchor="middle"
                  fontSize={18}
                  fill="#fff"
                  fontWeight="bold"
                >
                  {cell.product.image}
                </text>
              )}
            </g>
          );
        })}
        {/* Draw navigation path as a polyline */}
        {polyline && (
          <polyline
            points={polyline}
            fill="none"
            stroke={PATH_COLOR}
            strokeWidth={PATH_WIDTH}
            strokeDasharray="16 8"
            strokeLinecap="round"
            opacity={0.9}
          />
        )}
        {/* Draw destination pin */}
        {path.length > 0 && (
          <g>
            <circle
              cx={getCellCoords(path[path.length - 1].x + 0.5, path[path.length - 1].y + 0.5)[0]}
              cy={getCellCoords(path[path.length - 1].x + 0.5, path[path.length - 1].y + 0.5)[1]}
              r={16}
              fill="#ef4444"
              stroke="#fff"
              strokeWidth={4}
            />
            <text
              x={getCellCoords(path[path.length - 1].x + 0.5, path[path.length - 1].y + 0.5)[0]}
              y={getCellCoords(path[path.length - 1].x + 0.5, path[path.length - 1].y + 0.5)[1] + 6}
              textAnchor="middle"
              fontSize={18}
              fill="#fff"
              fontWeight="bold"
            >
              📍
            </text>
          </g>
        )}
        {/* Draw animated arrow for current position */}
        {arrowStep && (
          <g
            style={{
              transform: `translate(${arrowX - ARROW_SIZE / 2}px, ${arrowY - ARROW_SIZE / 2}px) rotate(${arrowRotation}deg)`,
              transformOrigin: `${ARROW_SIZE / 2}px ${ARROW_SIZE / 2}px`,
              transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            <polygon
              points={`${ARROW_SIZE / 2},0 ${ARROW_SIZE},${ARROW_SIZE} 0,${ARROW_SIZE}`}
              fill="#2563eb"
              stroke="#fff"
              strokeWidth={2}
              opacity={0.95}
            />
          </g>
        )}
      </svg>
    </div>
  );
};

export default MartMapSVG; 