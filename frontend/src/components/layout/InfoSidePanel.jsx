import { useState } from 'react';
import { X, ChevronDown, ChevronRight, Book, Wifi, VolumeX, MapPin } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useContribution } from '../../context/ContributionContext';
import Button from '../common/Button';
import EngagementBar from '../common/EngagementBar';

export default function InfoSidePanel({ buildingId, onClose }) {
  const { buildings } = useData();
  const { openWizard } = useContribution();
  const [activeTab, setActiveTab] = useState('Campus');
  const [expandedSection, setExpandedSection] = useState('wifi');

  const building = buildings.find(b => b.id === buildingId);

  if (!building) return null;

  const tabs = ['Academic', 'Campus', 'Community', 'Lifestyle'];

  return (
    <div className="h-full bg-white/60 dark:bg-[#111827]/70 backdrop-blur-2xl border-l border-white/40 dark:border-white/20 shadow-2xl flex flex-col animate-fade-in-up w-full md:w-[400px]">
      {/* Header */}
      <div className="p-6 flex items-start justify-between border-b border-gray-200 dark:border-charcoal-700">
        <div>
          <h2 className="font-serif text-2xl font-bold text-charcoal-900 dark:text-gray-100 mb-1">{building.name}</h2>
          <p className="text-sm text-charcoal-700 dark:text-gray-400">{building.description}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-charcoal-800 rounded-full transition-colors">
          <X className="text-charcoal-500 dark:text-gray-400" size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-lg w-full overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-fit px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === tab 
                  ? 'bg-white dark:bg-midnight-800 shadow-sm text-charcoal-900 dark:text-gold-400' 
                  : 'text-charcoal-600 dark:text-gray-400 hover:text-charcoal-900 dark:hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area - Structured Lists, no cards */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {activeTab === 'Campus' && (
          <>
            {/* Section: Wi-Fi */}
            <div className="border border-gray-200 dark:border-charcoal-700 rounded-lg overflow-hidden bg-white/50 dark:bg-charcoal-800/30">
              <button 
                onClick={() => setExpandedSection(expandedSection === 'wifi' ? null : 'wifi')}
                className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-charcoal-800/50 hover:bg-gray-100 dark:hover:bg-charcoal-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Wifi size={18} className="text-gold-500" />
                  <span className="font-semibold text-charcoal-900 dark:text-gray-200">Wi-Fi Coverage</span>
                </div>
                {expandedSection === 'wifi' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
              
              {expandedSection === 'wifi' && (
                <div className="p-4 border-t border-gray-200 dark:border-charcoal-700 text-sm text-charcoal-800 dark:text-gray-300 flex flex-col gap-2">
                  <p>{building.details.wifi}</p>
                  <EngagementBar 
                    nodeId={`b_${building.id}_wifi`}
                    itemTitle={`${building.name} - Wi-Fi Intel`}
                    category="Campus Map"
                    verifyCount={42} 
                    commentCount={5} 
                    repostCount={1} 
                  />
                </div>
              )}
            </div>

            {/* Section: Quiet Spots */}
            <div className="border border-gray-200 dark:border-charcoal-700 rounded-lg overflow-hidden bg-white/50 dark:bg-charcoal-800/30">
              <button 
                onClick={() => setExpandedSection(expandedSection === 'quiet' ? null : 'quiet')}
                className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-charcoal-800/50 hover:bg-gray-100 dark:hover:bg-charcoal-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <VolumeX size={18} className="text-gold-500" />
                  <span className="font-semibold text-charcoal-900 dark:text-gray-200">Quiet Study Spots</span>
                </div>
                {expandedSection === 'quiet' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
              
              {expandedSection === 'quiet' && (
                <div className="p-4 border-t border-gray-200 dark:border-charcoal-700 text-sm text-charcoal-800 dark:text-gray-300 flex flex-col gap-2">
                  <p>{building.details.quietSpots}</p>
                  <EngagementBar 
                    nodeId={`b_${building.id}_quiet`}
                    itemTitle={`${building.name} - Quiet Study Spots`}
                    category="Campus Map"
                    verifyCount={18} 
                    commentCount={2} 
                    repostCount={0} 
                  />
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'Lifestyle' && (
          <div className="flex flex-col gap-4">
            <h3 className="font-medium text-charcoal-900 dark:text-gray-200 flex items-center gap-2">
              <MapPin size={18} className="text-gold-500" /> Nearby Amenities
            </h3>
            {/* Stylized contextual map block */}
            <div 
              className="w-full h-32 rounded-xl flex flex-col items-center justify-center border border-dashed border-gray-400 dark:border-charcoal-600 bg-white/30 dark:bg-black/20"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(156, 163, 175, 0.2) 1px, transparent 0)',
                backgroundSize: '16px 16px'
              }}
            >
               <MapPin size={24} className="text-gray-400 dark:text-gray-500 mb-2" />
               <span className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">Interactive Floorplan Disabled</span>
            </div>
            <ul className="text-sm text-charcoal-700 dark:text-gray-300 space-y-4 mt-2">
              <li className="flex flex-col border-b border-gray-100 dark:border-charcoal-800 pb-2">
                <span className="font-medium">Campus Cafe</span>
                <EngagementBar 
                  nodeId="b_amenity_cafe"
                  itemTitle="Campus Cafe & Bistro"
                  category="Amenities"
                  verifyCount={89} 
                  commentCount={14} 
                  repostCount={3} 
                />
              </li>
              <li className="flex flex-col border-b border-gray-100 dark:border-charcoal-800 pb-2">
                <span className="font-medium">Vending Machines (2nd Floor)</span>
                <EngagementBar 
                  nodeId="b_amenity_vending"
                  itemTitle="Vending Machines (2nd Floor)"
                  category="Amenities"
                  verifyCount={12} 
                  commentCount={0} 
                  repostCount={1} 
                />
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
