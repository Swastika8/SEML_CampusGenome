import { useState } from 'react';

export default function MapView({ onBuildingClick, selectedBuilding }) {
  const [hoveredBuilding, setHoveredBuilding] = useState(null);

  const buildings = [
    {
      id: 'b1',
      name: 'Main Administration',
      d: 'M 200 100 L 250 100 L 260 120 L 260 180 L 200 180 L 190 140 Z',
      cx: 225,
      cy: 140,
    },
    {
      id: 'b2',
      name: 'Central Library',
      d: 'M 80 200 L 120 180 L 160 200 L 160 280 L 80 280 Z',
      cx: 120,
      cy: 230,
    },
    {
      id: 'b3',
      name: 'Computer Science Lab',
      d: 'M 320 220 L 400 220 L 420 260 L 400 300 L 320 300 L 300 260 Z',
      cx: 360,
      cy: 260,
    },
    {
      id: 'b4',
      name: 'Student Center',
      d: 'M 200 250 L 280 250 L 280 320 L 200 320 Z',
      cx: 240,
      cy: 285,
    },
  ];

  return (
    <div className="illustrated-map tour-map">
      <svg viewBox="0 0 500 400" className="w-full h-full drop-shadow-lg">
        <defs>
          <pattern id="campus-dot-grid" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r=".6" className="map-grid-dot" />
          </pattern>
        </defs>
        <rect width="500" height="400" fill="url(#campus-dot-grid)" />
        <ellipse
          cx="255"
          cy="250"
          rx="222"
          ry="126"
          className="map-green"
          transform="rotate(-9 255 250)"
        />
        <text x="42" y="51" className="map-map-title">
          a campus full of little discoveries.
        </text>
        <path d="M34 61Q122 70 205 61" className="map-hand-line" />
        <text x="365" y="366" textAnchor="middle" className="map-lawn-label">
          the scenic route ↝
        </text>
        {/* Decorative Paths for Roads/Grass */}
        <path
          d="M 0 150 Q 250 120 500 150 L 500 400 L 0 400 Z"
          fill="currentColor"
          className="text-green-500/5 dark:text-green-900/10"
        />

        {/* Main Pathways */}
        <path
          d="M 120 230 L 225 140 L 360 260 L 240 285 Z"
          fill="none"
          className="stroke-gray-300/40 dark:stroke-charcoal-600/40"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 225 140 L 240 285"
          fill="none"
          className="stroke-gray-300/40 dark:stroke-charcoal-600/40"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {buildings.map((b) => (
          <g
            key={b.id}
            role="button"
            tabIndex={0}
            aria-label={b.name}
            aria-pressed={selectedBuilding === b.id}
            onFocus={() => setHoveredBuilding(b.id)}
            onBlur={() => setHoveredBuilding(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onBuildingClick(b.id);
              }
            }}
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
                hoveredBuilding === b.id || selectedBuilding === b.id
                  ? 'fill-gold-400 stroke-gold-600 dark:fill-gold-500 dark:stroke-beige-100'
                  : 'fill-white dark:fill-midnight-800 stroke-gray-300 dark:stroke-charcoal-600'
              }`}
            />
            <text x={b.cx} y={b.cy + 5} textAnchor="middle" className="map-building-number">
              {'0' + (buildings.indexOf(b) + 1)}
            </text>
            <text
              x={b.cx}
              y={b.id === 'b1' ? 91 : b.id === 'b4' ? 342 : 168}
              textAnchor="middle"
              className="map-building-label"
            >
              {b.name}
            </text>
            {/* Tooltip text when hovered */}
            <g className="hidden">
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
      <div className="map-label-sticker">
        <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse"></span>
        Explore Campus DNA
      </div>
    </div>
  );
}
