import { useState } from 'react';

export default function MapView({ onBuildingClick }) {
  const [hoveredBuilding, setHoveredBuilding] = useState(null);

  const buildings = [
    { 
      id: 'b1', 
      name: 'Main Administration', 
      d: "M 200 100 L 250 100 L 260 120 L 260 180 L 200 180 L 190 140 Z",
      cx: 225, cy: 140
    },
    { 
      id: 'b2', 
      name: 'Central Library', 
      d: "M 80 200 L 120 180 L 160 200 L 160 280 L 80 280 Z",
      cx: 120, cy: 230
    },
    { 
      id: 'b3', 
      name: 'Computer Science Lab', 
      d: "M 320 220 L 400 220 L 420 260 L 400 300 L 320 300 L 300 260 Z",
      cx: 360, cy: 260
    },
    {
      id: 'b4',
      name: 'Student Center',
      d: "M 200 250 L 280 250 L 280 320 L 200 320 Z",
      cx: 240, cy: 285
    }
  ];

  return (
    <div className="relative w-full aspect-[4/3] max-h-[600px] bg-white/20 dark:bg-midnight-900/40 backdrop-blur-md rounded-2xl border border-white/30 dark:border-charcoal-700/60 overflow-hidden shadow-2xl tour-map flex items-center justify-center">
      <svg viewBox="0 0 500 400" className="w-full h-full drop-shadow-lg">
        {/* Decorative Paths for Roads/Grass */}
        <path d="M 0 150 Q 250 120 500 150 L 500 400 L 0 400 Z" fill="currentColor" className="text-green-500/5 dark:text-green-900/10" />
        
        {/* Main Pathways */}
        <path d="M 120 230 L 225 140 L 360 260 L 240 285 Z" fill="none" className="stroke-gray-300/40 dark:stroke-charcoal-600/40" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 225 140 L 240 285" fill="none" className="stroke-gray-300/40 dark:stroke-charcoal-600/40" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        
        {buildings.map((b) => (
          <g key={b.id} 
             onClick={() => onBuildingClick(b.id)} 
             onMouseEnter={() => setHoveredBuilding(b.id)}
             onMouseLeave={() => setHoveredBuilding(null)}
             className="cursor-pointer transition-transform transform origin-center hover:scale-[1.03]"
             style={{ transformOrigin: `${b.cx}px ${b.cy}px` }}
          >
            {/* Building Shadow */}
            <path 
              d={b.d} 
              transform="translate(2, 4)"
              className="fill-black/10 dark:fill-black/30"
            />
            {/* Building Shape */}
            <path 
              d={b.d} 
              className={`transition-colors duration-300 stroke-2 ${
                hoveredBuilding === b.id 
                  ? 'fill-gold-400 stroke-gold-600 dark:fill-gold-500 dark:stroke-beige-100' 
                  : 'fill-white dark:fill-midnight-800 stroke-gray-300 dark:stroke-charcoal-600'
              }`} 
            />
            {/* Tooltip text when hovered */}
            <g className={`transition-opacity duration-300 ${hoveredBuilding === b.id ? 'opacity-100' : 'opacity-0'}`}>
              <rect 
                x={b.cx - 60} 
                y={b.cy - 45} 
                width="120" 
                height="24" 
                rx="4" 
                className="fill-white/90 dark:fill-midnight-900/90 stroke-gray-200 dark:stroke-charcoal-700" 
              />
              <text 
                x={b.cx} 
                y={b.cy - 28} 
                textAnchor="middle"
                className="text-[10px] font-sans font-bold fill-charcoal-900 dark:fill-gray-100 pointer-events-none"
              >
                {b.name}
              </text>
            </g>
          </g>
        ))}
      </svg>
      <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-midnight-800/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal-700 dark:text-gray-300 border border-gray-200 dark:border-charcoal-700 shadow-sm pointer-events-none flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse"></span>
        Live Campus Map
      </div>
    </div>
  );
}
