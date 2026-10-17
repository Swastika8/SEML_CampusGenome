import { useData } from '../../context/DataContext';

export default function MapView({ onBuildingClick, selectedBuilding }) {
  const { buildings } = useData();
  const mapped = buildings.filter((place) => place.map_data);
  return (
    <div className="illustrated-map supplied-campus-map tour-map">
      <svg viewBox="0 0 620 480" role="group" aria-label="Campus plan supplied by the community">
        <defs>
          <pattern id="campus-dot-grid" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r=".6" className="map-grid-dot" />
          </pattern>
        </defs>
        <rect width="620" height="480" fill="url(#campus-dot-grid)" />
        <path d="M337 354Q373 333 411 333" className="map-plan-callout" />
        {mapped.map((place) => {
          const geometry = place.map_data;
          const active = selectedBuilding === place.id;
          return (
            <g
              key={place.id}
              role="button"
              tabIndex={0}
              aria-label={place.name}
              aria-pressed={active}
              className={
                'campus-map-place map-group-' +
                place.category.toLowerCase() +
                (active ? ' is-active' : '')
              }
              onClick={() => onBuildingClick(place.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onBuildingClick(place.id);
                }
              }}
            >
              <title>{place.name}</title>
              {place.category === 'Entrance' && (
                <rect
                  x={geometry.cx - 20}
                  y={geometry.cy - 14}
                  width="40"
                  height="28"
                  fill="transparent"
                />
              )}
              <path d={geometry.shape} transform="translate(2 3)" className="map-place-shadow" />
              <path d={geometry.shape} className="map-place-shape" />
              <text
                x={geometry.labelX}
                y={geometry.labelY}
                textAnchor={geometry.anchor}
                className={
                  'map-place-label ' +
                  (geometry.anchor === 'middle' && place.category !== 'Entrance'
                    ? 'inside-label'
                    : '')
                }
              >
                {geometry.lines.map((line, index) => (
                  <tspan key={line} x={geometry.labelX} dy={index ? 12 : 0}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
        <text x="55" y="467" className="map-plan-signature">
          your campus. your little discoveries.
        </text>
      </svg>
    </div>
  );
}
