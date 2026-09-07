import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import EngagementBar from '../components/common/EngagementBar';

const defaultArticle = {
  id: 1,
  title: 'Nobel Laureate to Deliver Keynote on Future of AI',
  date: 'August 28, 2026',
  category: 'Campus Event',
  image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  description: `
    The university is thrilled to announce that Dr. Elena Rostova, the recent Nobel Laureate in Computer Science, will be delivering the keynote address at our upcoming Annual Tech Symposium. 
    
    Her groundbreaking work in neural network interpretability has paved the way for more transparent AI systems globally. The keynote, titled "Beyond the Black Box," will explore the ethical implications of AI deployment in critical sectors such as healthcare and criminal justice.
    
    Students and faculty are encouraged to attend this once-in-a-lifetime event. "Dr. Rostova’s insights will undoubtedly inspire the next generation of engineers and ethicists," said Dean Henderson during the press release.
  `,
  verifyCount: 142,
  commentCount: 56,
  repostCount: 89
};

const relatedNews = [
  {
    id: 2,
    title: 'Annual Tech Fest 2026 Dates Announced',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    date: 'Sep 2, 2026'
  },
  {
    id: 3,
    title: 'New Robotics Lab Opening Next Month',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    date: 'Sep 15, 2026'
  },
  {
    id: 4,
    title: 'Campus Sustainability Summit 2026',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    date: 'Oct 5, 2026'
  }
];

export default function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(defaultArticle);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:5000/api/events/${id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((res) => {
          if (res && res.data) {
            setArticle({
              ...defaultArticle,
              ...res.data,
              description: res.data.description || defaultArticle.description,
              image: res.data.image || defaultArticle.image,
              title: res.data.title || defaultArticle.title,
              date: res.data.date || res.data.event_date || defaultArticle.date,
              category: res.data.category || 'Event',
              verifyCount: res.data.verifyCount ?? 142,
              commentCount: res.data.commentCount ?? 56,
            });
          }
        })
        .catch((err) => console.warn('Article fetch error:', err));
    }
  }, [id]);

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        
        {/* Back Button */}
        <div className="w-full max-w-7xl mx-auto mt-4 mb-4">
          <Link to="/events" className="inline-flex items-center gap-2 text-charcoal-600 dark:text-gray-400 hover:text-charcoal-900 dark:hover:text-gray-200 transition-colors">
            <ArrowLeft size={16} />
            <span className="font-medium text-sm">Back to News</span>
          </Link>
        </div>

        <div className="w-full max-w-7xl mx-auto mb-12 flex flex-col lg:grid lg:grid-cols-4 gap-8">
          
          {/* Main Article Area */}
          <main className="lg:col-span-3 flex flex-col gap-6 animate-fade-in-up">
            
            {/* Header Image */}
            <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-xl bg-charcoal-900 relative">
              <img 
                src={article.image} 
                alt={article.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider shadow-sm border border-white/20">
                  {article.category}
                </span>
              </div>
            </div>

            {/* Article Header */}
            <div className="flex flex-col gap-4 mt-2">
              <span className="text-charcoal-500 dark:text-gray-400 text-sm font-medium">
                Published on {article.date} {article.venue ? `• Venue: ${article.venue}` : ''}
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal-900 dark:text-gray-100 leading-tight">
                {article.title}
              </h1>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none font-sans text-charcoal-800 dark:text-gray-300 leading-relaxed space-y-6 mt-4 whitespace-pre-line">
              {article.description}
            </div>

            {/* Engagement Footer */}
            <div className="mt-8">
              <EngagementBar 
                nodeId={article.id}
                itemTitle={article.title}
                category="Events"
                verifyCount={article.verifyCount}
                commentCount={article.commentCount}
                repostCount={article.repostCount || 12}
                variant="like"
              />
            </div>

          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-1 flex flex-col gap-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="font-serif text-2xl font-bold text-charcoal-900 dark:text-gray-100 border-b border-gray-300 dark:border-white/10 pb-4">
              Related News
            </h2>
            
            <div className="flex flex-col gap-6">
              {relatedNews.map(news => (
                <Link key={news.id} to={`/events/${news.id}`} className="group flex gap-4 items-start">
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 shadow-md">
                    <img 
                      src={news.image} 
                      alt={news.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1 py-1">
                    <h3 className="font-bold text-sm text-charcoal-900 dark:text-gray-200 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors line-clamp-3 leading-snug">
                      {news.title}
                    </h3>
                    <span className="text-xs text-charcoal-500 dark:text-gray-500 mt-1">
                      {news.date}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </aside>

        </div>
      </div>
    </DashboardLayout>
  );
}
