import { useSearchParams } from 'react-router-dom';
import { Compass, MousePointer2, ArrowUpRight, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import MapView from '../components/modules/MapView';
import InfoSidePanel from '../components/layout/InfoSidePanel';
import { useData } from '../context/DataContext';

export default function MapPage() {
  const [params, setParams] = useSearchParams();
  const { buildings } = useData();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const mapped = buildings.filter((building) => building.map_data);
  const visible = mapped.filter(
    (building) =>
      (filter === 'All' || building.category === filter) &&
      building.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const groups = [
    ['All', 'All places'],
    ['Academic', 'Academics'],
    ['Hostel', 'Hostels'],
    ['Recreation', 'Outdoors'],
    ['Entrance', 'Gates'],
  ];
  const selectedBuilding = params.get('building');
  const panelRef = useRef(null);
  useEffect(() => {
    if (!selectedBuilding || !buildings.length) return;
    const width = window.innerWidth;
    if (width < 880 || (width >= 1024 && width <= 1150)) {
      const frame = requestAnimationFrame(() =>
        panelRef.current?.scrollIntoView({ block: 'start' }),
      );
      return () => cancelAnimationFrame(frame);
    }
  }, [selectedBuilding, buildings.length]);
  function select(id) {
    const next = new URLSearchParams(params);
    if (id) next.set('building', id);
    else next.delete('building');
    setParams(next, { replace: true });
  }
  return (
    <DashboardLayout>
      <div className="field-guide-heading">
        <div>
          <span className="eyebrow">g/campus · THE UNOFFICIAL FIELD GUIDE</span>
          <h1>The campus, annotated.</h1>
          <p>Your campus plan, with room for the things only students know.</p>
        </div>
        <div className="map-scribble">
          take the scenic route <span>↝</span>
        </div>
      </div>
      <div className="field-guide-layout">
        <section className="field-guide-map" aria-label="Illustrated campus map">
          <div className="map-card-heading">
            <span>
              <Compass size={15} />A LITTLE WANDERING IS ENCOURAGED
            </span>
            <span>{mapped.length} PLACES</span>
          </div>
          <MapView selectedBuilding={selectedBuilding} onBuildingClick={select} />
          <div className="map-hint">
            <MousePointer2 size={13} />
            <span>Pick a building. Collect a little local knowledge.</span>
            <span className="map-source-tag">COMMUNITY PLAN</span>
          </div>
          <div className="map-plan-legend">
            <span className="legend-academic">Academic</span>
            <span className="legend-hostel">Hostel</span>
            <span className="legend-recreation">Outdoors</span>
            <span className="legend-entrance">Gate</span>
          </div>
          <label className="place-directory-search">
            <Search size={14} />
            <input
              aria-label="Find a campus place"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a building, ground or gate..."
            />
          </label>
          <div className="place-directory-filters" aria-label="Filter campus places">
            {groups.map(([value, label]) => (
              <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>
                {label}
              </button>
            ))}
          </div>
          <div className="place-directory" aria-label="Campus places">
            {visible.map((building) => (
              <button
                key={building.id}
                aria-pressed={selectedBuilding === building.id}
                onClick={() => select(building.id)}
              >
                <span>{String(building.map_data.order + 1).padStart(2, '0')}</span>
                <strong>{building.name}</strong>
                <ArrowUpRight size={14} />
              </button>
            ))}
          </div>
          {!visible.length && (
            <p className="place-directory-empty">No corners by that name. Try another search.</p>
          )}
        </section>
        {selectedBuilding ? (
          <div ref={panelRef} className="place-panel-slot">
            <InfoSidePanel
              key={selectedBuilding}
              buildingId={selectedBuilding}
              onClose={() => select(null)}
            />
          </div>
        ) : (
          <section className="map-welcome">
            <span className="map-welcome-mark">✳</span>
            <small>YOU ARE HERE. NOW WHAT?</small>
            <h2>
              Every corner
              <br />
              has a story.
            </h2>
            <p>
              Pick a building, a ground, or a gate from the campus plan. Leave useful field notes so
              the next person knows a little more.
            </p>
            <div className="welcome-note">
              Local knowledge beats
              <br />
              <em>a campus brochure.</em>
            </div>
            <button onClick={() => select('admin-it')}>
              Start at Admin / IT <ArrowUpRight size={15} />
            </button>
          </section>
        )}
      </div>
      <p className="field-guide-disclaimer">
        <span>✦</span> Traced from your supplied campus plan. Positions are schematic; follow campus
        signs for directions.
      </p>
    </DashboardLayout>
  );
}
