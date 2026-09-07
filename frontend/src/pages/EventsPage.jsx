import { useState, useEffect } from 'react';
import { Calendar, MoreHorizontal, MapPin, TrendingUp, Cloud, CloudRain, Sun, Wind, Settings, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import EngagementBar from '../components/common/EngagementBar';

const mockItems = [
  {
    id: 1,
    type: 'A', // Hero
    title: 'Nobel Laureate to Deliver Keynote on Future of AI',
    date: 'August 28, 2026',
    publisher: 'Genome Official',
    publisherLogo: 'GO',
    timeAgo: '3h',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    verifyCount: 142,
    commentCount: 56,
  },
  {
    id: 2,
    type: 'B', // Top Engaging List
    list: [
      { id: 21, title: 'Annual Tech Fest 2026 Dates Announced', timeAgo: '2h', comments: 45 },
      { id: 22, title: 'Library Extends Hours for Finals Week', timeAgo: '5h', comments: 12 },
      { id: 23, title: 'Campus Wi-Fi Upgrade Completed in North Wing', timeAgo: '8h', comments: 89 }
    ]
  },
  {
    id: 3,
    type: 'C', // Standard News
    title: 'New Robotics Lab Opening Next Month',
    date: 'September 15, 2026',
    category: 'News',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    verifyCount: 89,
    commentCount: 22,
  },
  {
    id: 4,
    type: 'C', // Standard News
    title: 'Campus Sustainability Summit 2026',
    date: 'October 5, 2026',
    category: 'Event',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    verifyCount: 201,
    commentCount: 45,
  },
  {
    id: 5,
    type: 'D', // Weather Widget
  },
  {
    id: 6,
    type: 'C', // Standard News
    title: 'Student Council Elections: Meet the Candidates',
    date: 'October 12, 2026',
    category: 'News',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    verifyCount: 412,
    commentCount: 89,
  }
];

// Sub-components for archetypes
const TypeA = ({ item }) => (
  <Link 
    to={`/events/${item.id}`}
    className="md:col-span-2 md:row-span-2 min-h-[400px] bg-white/10 dark:bg-black/20 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-3xl overflow-hidden relative group cursor-pointer block"
  >
    <div 
      className="absolute inset-0 bg-cover bg-center transform scale-105 group-hover:scale-100 transition-transform duration-700 ease-out"
      style={{ backgroundImage: `url(${item.image})` }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 opacity-90 transition-opacity duration-700" />
    
    <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between z-10 overflow-hidden">
      {/* Edge Micro-UI: Publisher */}
      <div className="flex items-center gap-2 drop-shadow-md">
        <div className="w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center text-[10px] font-bold text-black">
          {item.publisherLogo}
        </div>
        <span className="text-white text-sm font-medium">{item.publisher}</span>
        <span className="text-white/60 text-xs text-center pb-1">·</span>
        <span className="text-white/80 text-xs font-medium">{item.timeAgo}</span>
      </div>

      <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700 ease-out flex flex-col mb-4">
        <h3 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight drop-shadow-md">
          {item.title}
        </h3>
        
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out flex justify-between items-end">
           <div className="[&_span]:text-white/90 [&_svg]:text-white/80 [&_button:hover]:bg-white/20">
             <EngagementBar 
               nodeId={item.id}
               itemTitle={item.title}
               category="Events"
               verifyCount={item.verifyCount} 
               commentCount={item.commentCount} 
               variant="like" 
               hideRepost={false} 
               className="pt-2 border-white/20" 
             />
           </div>
        </div>
      </div>
      
      {/* Carousel dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-60">
        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
      </div>
    </div>
  </Link>
);

const TypeB = ({ item }) => (
  <div className="md:col-span-1 md:row-span-1 min-h-[250px] bg-white/60 dark:bg-[#111827]/80 backdrop-blur-xl border border-gray-300 dark:border-white/10 rounded-3xl overflow-hidden relative flex flex-col p-5">
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2 text-charcoal-900 dark:text-gray-100">
        <TrendingUp size={16} className="text-[#D4AF37]" />
        <h3 className="font-bold text-sm tracking-wide">Top Engaging News</h3>
      </div>
      <MoreHorizontal size={16} className="text-gray-500 cursor-pointer" />
    </div>
    
    <div className="flex-1 flex flex-col justify-between">
      {item.list.map((news, i) => (
        <div key={news.id} className={`py-3 ${i !== item.list.length - 1 ? 'border-b border-gray-200 dark:border-white/10' : ''}`}>
          <Link to={`/events/${news.id}`} className="group block">
            <h4 className="font-serif text-[15px] leading-snug text-charcoal-800 dark:text-gray-200 group-hover:text-[#D4AF37] transition-colors line-clamp-2 mb-1">
              {news.title}
            </h4>
            <div className="flex items-center gap-3 text-xs text-charcoal-500 dark:text-gray-500">
              <span>{news.timeAgo}</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px]">💬</span> {news.comments}
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  </div>
);

const TypeC = ({ item }) => (
  <Link 
    to={`/events/${item.id}`}
    className="md:col-span-1 md:row-span-1 min-h-[250px] bg-white/10 dark:bg-black/20 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-3xl overflow-hidden relative group cursor-pointer block"
  >
    <div 
      className="absolute inset-0 bg-cover bg-center transform scale-105 group-hover:scale-100 transition-transform duration-700 ease-out"
      style={{ backgroundImage: `url(${item.image})` }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 opacity-80 group-hover:opacity-90 transition-opacity duration-700" />
    
    <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
      <div className="flex justify-between items-start">
        <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90 text-[10px] font-bold uppercase tracking-widest border border-white/10">
          {item.category}
        </span>
      </div>
      
      <div className="flex flex-col mt-auto">
        <h3 className="font-serif text-xl font-bold text-white mb-3 leading-tight drop-shadow-md">
          {item.title}
        </h3>
        {/* Tightly packed engagement bottom-left */}
        <div className="[&_span]:text-white/70 [&_span]:text-xs [&_svg]:w-4 [&_svg]:h-4 [&_svg]:text-white/60 [&_button]:p-1 -ml-1">
          <EngagementBar 
            nodeId={item.id}
            itemTitle={item.title}
            category="Events"
            verifyCount={item.verifyCount} 
            commentCount={item.commentCount} 
            variant="like" 
            hideRepost={false} 
          />
        </div>
      </div>
    </div>
  </Link>
);

const TypeD = () => (
  <div className="md:col-span-1 md:row-span-1 min-h-[250px] bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-3xl overflow-hidden relative p-5 flex flex-col text-white border border-white/10 group shadow-lg">
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-center gap-1.5 text-white/80 cursor-pointer hover:text-white transition-colors">
        <MapPin size={14} />
        <span className="text-sm font-medium">Pune, Maharashtra</span>
        <ChevronDown size={14} />
      </div>
      <MoreHorizontal size={16} className="text-white/60 cursor-pointer" />
    </div>
    
    <div className="flex items-center gap-4 mt-2">
      <Cloud size={48} className="text-blue-300 drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
      <div>
        <div className="text-5xl font-light tracking-tighter">24°<span className="text-2xl text-white/60">C</span></div>
        <div className="text-sm font-medium text-blue-200 mt-1">Cloudy</div>
      </div>
    </div>
    
    <div className="mt-auto grid grid-cols-4 gap-2 border-t border-white/10 pt-4">
      {[
        { time: '8 PM', icon: CloudRain, temp: '23°' },
        { time: '9 PM', icon: Cloud, temp: '23°' },
        { time: '10 PM', icon: Cloud, temp: '24°' },
        { time: '11 PM', icon: Cloud, temp: '23°' },
      ].map((forecast, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] text-white/70 font-medium">{forecast.time}</span>
          <forecast.icon size={16} className={i === 0 ? "text-blue-400" : "text-white/80"} />
          <span className="text-xs font-bold">{forecast.temp}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState('Discover');
  const [items, setItems] = useState(mockItems);
  const tabs = ['Discover', 'Campus News', 'Tech Fests', 'Sports', 'Deadlines', 'Shopping/Thrift'];

  useEffect(() => {
    fetch('http://localhost:5000/api/events')
      .then((res) => (res.ok ? res.json() : null))
      .then((res) => {
        if (res && res.data && res.data.length > 0) {
          // Keep the top engaging list and weather widget for layout variety
          const topList = res.topEngaging || [];
          const backendItems = [
            { ...res.data[0], type: 'A' },
            { id: 'top-b', type: 'B', list: topList.length > 0 ? topList : mockItems[1].list },
            ...res.data.slice(1).map((item, idx) => ({
              ...item,
              type: 'C',
              image: item.image || mockItems[2].image,
            })),
            { id: 'weather-d', type: 'D' },
          ];
          setItems(backendItems);
        }
      })
      .catch((err) => console.warn('Events fallback:', err));
  }, []);

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        <div className="w-full max-w-[1400px] mx-auto mt-6 mb-12 animate-fade-in-up flex flex-col gap-6 px-4 md:px-8">
          
          {/* Header */}
          <div className="mb-2">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-charcoal-900 dark:text-gray-100 tracking-tight">Events & News</h1>
          </div>

          {/* Edge-style Top Navigation Bar */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-3">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1 -mb-1">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeTab === tab 
                      ? 'bg-gray-200 dark:bg-white/10 text-charcoal-900 dark:text-white shadow-sm border-b-2 border-[#D4AF37] rounded-b-none' 
                      : 'text-charcoal-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 border-b-2 border-transparent rounded-b-none'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <button className="flex items-center gap-2 px-3 py-1.5 ml-4 rounded-full border border-gray-300 dark:border-white/20 text-xs font-medium text-charcoal-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors whitespace-nowrap">
              <Settings size={14} />
              Personalize
            </button>
          </div>

          {/* Edge Dense Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 grid-flow-dense pb-8">
            {items.map((item) => {
              switch (item.type) {
                case 'A': return <TypeA key={item.id} item={item} />;
                case 'B': return <TypeB key={item.id} item={item} />;
                case 'C': return <TypeC key={item.id} item={item} />;
                case 'D': return <TypeD key={item.id} />;
                default: return null;
              }
            })}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
