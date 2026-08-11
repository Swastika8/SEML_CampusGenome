import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import MapView from '../components/modules/MapView';
import InfoSidePanel from '../components/layout/InfoSidePanel';

export default function MapPage() {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleBuildingClick = (buildingId) => {
    setSelectedBuilding(buildingId);
    setIsSidebarOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-row relative h-full">
        {/* Dynamic Left Sidebar for Map */}
        <div 
          className={`transition-all duration-500 ease-in-out h-full overflow-hidden ${
            isSidebarOpen ? 'w-full md:w-[400px] opacity-100 pr-8' : 'w-0 opacity-0'
          } hidden md:block`}
        >
          <div className="h-full rounded-xl overflow-hidden shadow-xl">
            {selectedBuilding && (
              <InfoSidePanel 
                buildingId={selectedBuilding} 
                onClose={() => setIsSidebarOpen(false)} 
              />
            )}
          </div>
        </div>

        {/* Main Content Area (Shifts Right) */}
        <div className="flex-1 flex flex-col min-w-0 relative h-full bg-white/40 dark:bg-midnight-900/40 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-white/5 overflow-hidden">
          <div className="w-full h-full p-4 md:p-8 flex items-center justify-center">
            <MapView onBuildingClick={handleBuildingClick} />
          </div>
        </div>

        {/* Mobile Side Panel Overlay */}
        <div className={`md:hidden fixed inset-0 z-50 bg-black/50 flex justify-start transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
           <div className={`w-full max-w-sm transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
             <div className="h-full bg-white dark:bg-midnight-900">
              {selectedBuilding && (
                <InfoSidePanel 
                    buildingId={selectedBuilding} 
                    onClose={() => setIsSidebarOpen(false)} 
                />
              )}
             </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
