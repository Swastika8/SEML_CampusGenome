import { useState, useEffect } from 'react';
import { Sparkles, MapPin, Map as MapIcon, ChevronRight } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import EngagementBar from '../components/common/EngagementBar';
import { useData } from '../context/DataContext';

const mockLifestyle = {
  'canteens': [
    {
      id: 'f1',
      name: 'Midnight Maggi & Cutting Chai',
      location: 'Student Union, Ground Floor',
      pulse: { status: 'Packed', percentage: 90, color: 'bg-red-500' },
      secret: 'Ask Bhaiya for the "Exam Special" Maggi (not on the menu). It has extra cheese and secret spices.',
      tags: ['Price: ₹₹', 'Vibe: Loud', 'Crowd: High'],
      image: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      verifiedBy: 450,
      comments: 24,
      quote: "The only thing keeping me awake during finals."
    },
    {
      id: 'f2',
      name: 'The Midnight Canteen',
      location: 'Hostel Block C',
      pulse: { status: 'Moderately Crowded', percentage: 60, color: 'bg-yellow-500' },
      secret: 'If you order after 1 AM, the portions are magically 20% larger.',
      tags: ['Price: ₹', 'Vibe: Chill', 'Wi-Fi: None'],
      image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      verifiedBy: 320,
      comments: 15,
      quote: "Perfect place to unwind after a long day of classes."
    }
  ],
  'green-spots': [
    {
      id: 's1',
      name: 'Sunken Library Lawn',
      location: 'Outside Library',
      pulse: { status: 'Quiet', percentage: 20, color: 'bg-green-500' },
      secret: 'There\'s a hidden plug point under the third bench on the right.',
      tags: ['Price: Free', 'Vibe: Relaxed', 'Crowd: Low'],
      image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      verifiedBy: 180,
      comments: 8,
      quote: "Best place for a winter afternoon nap between lectures."
    },
    {
      id: 's2',
      name: 'The Botanical Quad',
      location: 'Academic Block B Courtyard',
      pulse: { status: 'Serene', percentage: 10, color: 'bg-teal-500' },
      secret: 'The wifi actually reaches the stone benches if you sit facing the physics lab.',
      tags: ['Price: Free', 'Vibe: Academic', 'Shade: High'],
      image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      verifiedBy: 85,
      comments: 3,
      quote: "A quiet green oasis when the library is full."
    }
  ],
  'housing': [
    {
      id: 'h1',
      name: 'Sunrise PGs & Stay',
      location: 'North Gate, 200m away',
      pulse: { status: 'Available', percentage: 10, color: 'bg-green-500' },
      secret: 'Negotiate the rent if you pay 6 months upfront; they usually drop it by 15%.',
      tags: ['Price: ₹₹₹', 'Curfew: 10 PM', 'Food: Included'],
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      verifiedBy: 112,
      comments: 12,
      quote: "A bit pricey, but the food actually tastes like home."
    }
  ]
};

const organicShapes = [
  'rounded-[40%_60%_70%_30%/40%_50%_60%_70%]',
  'rounded-[60%_40%_30%_70%/60%_30%_70%_40%]',
  'rounded-[50%_50%_20%_80%/25%_75%_25%_75%]',
  'rounded-[3rem]',
  'rounded-[20%_80%_80%_20%/40%_40%_60%_60%]'
];

const WaveDivider = () => (
  <div className="w-full flex justify-center items-center opacity-20 dark:opacity-40 my-8 md:my-16 pointer-events-none text-gold-500 dark:text-gold-400">
    <svg width="200" height="20" viewBox="0 0 200 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 10C33.3333 10 33.3333 1 66.6667 1C100 1 100 10 133.333 10C166.667 10 166.667 19 200 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  </div>
);

export default function LifestylePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const { lifestyle: contextLifestyle } = useData();
  const [lifestyleData, setLifestyleData] = useState(mockLifestyle);

  useEffect(() => {
    if (contextLifestyle) {
      setLifestyleData(contextLifestyle);
    } else {
      fetch('http://localhost:5000/api/lifestyle')
        .then((res) => (res.ok ? res.json() : null))
        .then((res) => {
          if (res && res.data) {
            setLifestyleData(res.data);
          }
        })
        .catch((err) => {
          console.warn('Backend unavailable, using fallback lifestyle data:', err);
        });
    }
  }, [contextLifestyle]);

  const categories = [
    { id: 'all', label: 'All Discoveries' },
    { id: 'canteens', label: 'Canteens & Late Night' },
    { id: 'green-spots', label: 'Secret Green Spots' },
    { id: 'fitness', label: 'Fitness & Sports' },
    { id: 'housing', label: 'PGs & Stay' }
  ];

  // Flatten if 'all', else use specific category
  const displayItems = activeCategory === 'all' 
    ? Object.values(lifestyleData).flat() 
    : lifestyleData[activeCategory] || [];

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-w-0 relative h-full bg-[#FAFAFA] dark:bg-[#0B1120] overflow-y-auto">
        
        {/* Floating Category Filter */}
        <div className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/60 dark:bg-[#0B1120]/60 border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-center sm:justify-start overflow-x-auto scrollbar-hide shadow-sm">
          <div className="flex gap-3 max-w-5xl mx-auto w-full">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-charcoal-900 text-white dark:bg-gold-500 dark:text-midnight-900 shadow-lg scale-105'
                    : 'bg-white/50 dark:bg-white/5 text-charcoal-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-transparent'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full max-w-5xl mx-auto px-6 py-12 md:py-20 animate-fade-in-up">
          
          <div className="text-center mb-20 md:mb-32 max-w-2xl mx-auto">
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-charcoal-900 dark:text-gray-100 tracking-tight mb-6">
              Lifestyle &<br/><span className="text-gold-600 dark:text-gold-400 italic">Recreation</span>
            </h1>
            <p className="text-lg text-charcoal-600 dark:text-gray-400">
              Curated student secrets, chill spots, and late-night cravings. The true campus editorial.
            </p>
          </div>

          <div className="flex flex-col space-y-24 md:space-y-40">
            {displayItems.length === 0 && (
              <div className="text-center text-charcoal-500 dark:text-gray-500 font-serif text-xl italic py-20">
                No discoveries in this category yet.
              </div>
            )}

            {displayItems.map((item, index) => {
              const isEven = index % 2 === 0;
              const shapeIndex = index % organicShapes.length;
              const blobShape = organicShapes[(index + 1) % organicShapes.length];
              const imageShape = organicShapes[shapeIndex];

              return (
                <div key={item.id} className="relative group">
                  <div className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-0`}>
                    
                    {/* Image Section */}
                    <div className="w-full md:w-1/2 relative flex justify-center p-4">
                      {/* Decorative Background Blob */}
                      <div className={`absolute inset-0 bg-amber-100/60 dark:bg-emerald-950/40 border border-amber-200/50 dark:border-amber-500/10 ${blobShape} scale-105 -rotate-3 transition-transform duration-700 group-hover:rotate-0`} />
                      
                      {/* Main Image */}
                      <div className={`relative z-10 w-[90%] aspect-[4/5] md:aspect-square overflow-hidden shadow-2xl ${imageShape} transition-transform duration-700 group-hover:scale-105 group-hover:-translate-y-2`}>
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Text Section */}
                    <div className={`w-full md:w-1/2 relative z-20 flex flex-col ${isEven ? 'md:-ml-12 md:pl-0' : 'md:-mr-12 md:pr-0'}`}>
                      <div className="bg-white/90 dark:bg-[#111827]/95 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-xl rounded-3xl p-8 md:p-10 hover:-translate-y-2 transition-transform duration-500">
                        
                        <div className="flex items-center gap-2 mb-4">
                          <span className={`w-2.5 h-2.5 rounded-full ${item.pulse.color} animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 dark:text-gray-400">
                            Live: {item.pulse.status}
                          </span>
                        </div>

                        <h2 className="font-serif text-4xl md:text-5xl font-bold text-charcoal-900 dark:text-gray-100 leading-tight mb-4">
                          {item.name}
                        </h2>

                        <p className="text-xl text-charcoal-600 dark:text-gray-300 italic mb-6 border-l-4 border-gold-400 pl-4">
                          "{item.quote}"
                        </p>

                        <div className="flex flex-wrap gap-2 mb-8">
                          {item.tags.map((tag, idx) => (
                            <span key={idx} className="bg-charcoal-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-charcoal-700 dark:text-gray-300 text-xs px-3 py-1.5 rounded-full font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Genome Secret Sticky Note */}
                        <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md border border-gold-300 dark:border-gold-500/30 rounded-2xl p-5 mb-8 shadow-sm transform -rotate-1 hover:rotate-0 transition-transform">
                          <div className="flex gap-3 items-start">
                            <Sparkles size={20} className="text-gold-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="block font-bold text-sm text-charcoal-900 dark:text-gold-400 mb-1">Genome Secret</span>
                              <span className="text-sm text-charcoal-700 dark:text-gray-300 leading-relaxed">{item.secret}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Bar */}
                        <div className="flex flex-col xl:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-white/10">
                          <EngagementBar 
                            verifyCount={item.verifiedBy} 
                            commentCount={item.comments} 
                            hideRepost 
                            className="border-none mt-0 pt-0 w-full xl:w-auto"
                          />
                          <button className="flex items-center gap-2 rounded-full px-6 py-2.5 bg-charcoal-900 text-white dark:bg-gold-500 dark:text-midnight-900 font-bold text-sm hover:scale-105 transition-transform shadow-md w-full xl:w-auto justify-center shrink-0">
                            <MapIcon size={16} />
                            View Menu / Map
                          </button>
                        </div>

                      </div>
                    </div>

                  </div>
                  
                  {/* Render Divider if not the last item */}
                  {index < displayItems.length - 1 && <WaveDivider />}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
