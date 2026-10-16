import { useSearchParams } from 'react-router-dom';
import { Compass, MousePointer2, ArrowUpRight } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import MapView from '../components/modules/MapView';
import InfoSidePanel from '../components/layout/InfoSidePanel';
import { useData } from '../context/DataContext';

export default function MapPage() {
  const [params, setParams] = useSearchParams();
  const { buildings } = useData();
  const selectedBuilding = params.get('building');
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
          <p>Good Wi-Fi. Quiet corners. Things you learn by hanging around.</p>
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
            <span>01—04</span>
          </div>
          <MapView selectedBuilding={selectedBuilding} onBuildingClick={select} />
          <div className="map-hint">
            <MousePointer2 size={13} />
            <span>Pick a building. Collect a little local knowledge.</span>
            <span className="map-north">N ↑</span>
          </div>
          <div className="place-directory" aria-label="Campus places">
            {buildings.map((building, index) => (
              <button
                key={building.id}
                aria-pressed={selectedBuilding === building.id}
                onClick={() => select(building.id)}
              >
                <span>0{index + 1}</span>
                <strong>{building.name}</strong>
                <ArrowUpRight size={14} />
              </button>
            ))}
          </div>
        </section>
        {selectedBuilding ? (
          <InfoSidePanel
            key={selectedBuilding}
            buildingId={selectedBuilding}
            onClose={() => select(null)}
          />
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
              Tap a building to find the useful stuff: where the Wi-Fi works, where the world goes
              quiet, and what students have noticed lately.
            </p>
            <div className="welcome-note">
              Local knowledge beats
              <br />
              <em>a campus brochure.</em>
            </div>
            <button onClick={() => select('b2')}>
              Start at the library <ArrowUpRight size={15} />
            </button>
          </section>
        )}
      </div>
      <p className="field-guide-disclaimer">
        <span>✦</span> A lovingly schematic map. Follow campus signs for actual directions.
      </p>
    </DashboardLayout>
  );
}
