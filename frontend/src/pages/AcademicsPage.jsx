import { useState, useEffect } from 'react';
import { BookOpen, ArrowLeft, ChevronRight } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import EngagementBar from '../components/common/EngagementBar';
import { CAMPUS_DEPARTMENTS } from '../data/departments';

const DEPARTMENTS = CAMPUS_DEPARTMENTS.map(d => d.value);

const YEARS = ['FY', 'SY', 'TY', 'Final Year'];

// Mock data generator for contextual posts
const generatePosts = (dept, year) => {
  const isMCA = dept === 'MCA';
  const prefix = isMCA ? `MCA Insights` : `${dept} - ${year} Insights`;
  
  return [
    {
      id: 1,
      author: 'Senior Student',
      title: `${prefix}: Exam Strategy`,
      content: isMCA 
        ? `Focus on Data Structures and Web Technologies for the upcoming placement drives. The pattern has changed slightly this year.`
        : `For ${dept} ${year}, make sure you solve the last 5 years' papers. Prof. X usually repeats 40% of the questions.`,
      verifiedBy: Math.floor(Math.random() * 200) + 50,
      comments: Math.floor(Math.random() * 20),
      reposts: Math.floor(Math.random() * 10),
    },
    {
      id: 2,
      author: 'Alumni Network',
      title: 'Internship Opportunities & Placements',
      content: `Top companies are looking for ${dept} students with strong fundamentals. Prepare your portfolios focusing on core subjects and practical projects.`,
      verifiedBy: Math.floor(Math.random() * 500) + 100,
      comments: Math.floor(Math.random() * 50),
      reposts: Math.floor(Math.random() * 30),
    },
    {
      id: 3,
      author: 'Department Faculty',
      title: 'Practical Viva Guidelines',
      content: `During vivas, focus on explaining the 'why' behind your implementation, not just the 'how'. Especially critical for core lab sessions in this semester.`,
      verifiedBy: Math.floor(Math.random() * 150) + 20,
      comments: Math.floor(Math.random() * 10),
      reposts: Math.floor(Math.random() * 5),
    }
  ];
};

export default function AcademicsPage() {
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [academicPosts, setAcademicPosts] = useState([]);

  useEffect(() => {
    if (selectedDept && selectedYear) {
      const fallback = generatePosts(selectedDept, selectedYear);
      const url = `http://localhost:5000/api/academics?dept=${encodeURIComponent(selectedDept)}&year=${encodeURIComponent(selectedYear)}`;
      fetch(url)
        .then((res) => (res.ok ? res.json() : null))
        .then((res) => {
          if (res && res.data && res.data.length > 0) {
            setAcademicPosts(
              res.data.map((item) => ({
                id: item.id,
                title: item.title,
                author: item.author || 'Senior Contributor',
                content: item.insight || item.description || item.content,
                verifiedBy: item.verifiedBy || item.verifyCount || 45,
                comments: item.comments || item.commentCount || 10,
                reposts: 5,
              }))
            );
          } else {
            setAcademicPosts(fallback);
          }
        })
        .catch(() => setAcademicPosts(fallback));
    }
  }, [selectedDept, selectedYear]);

  const handleDeptClick = (dept) => {
    setSelectedDept(dept);
    if (dept === 'MCA') {
      setSelectedYear('All Years'); // Skip year selection for MCA
    } else {
      setSelectedYear(null);
    }
  };

  const handleBack = () => {
    if (selectedYear && selectedDept !== 'MCA') {
      setSelectedYear(null);
    } else {
      setSelectedDept(null);
      setSelectedYear(null);
    }
  };

  const renderLevel1 = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 animate-fade-in-up">
      {DEPARTMENTS.map((dept) => (
        <div
          key={dept}
          onClick={() => handleDeptClick(dept)}
          className="aspect-square bg-white/40 dark:bg-[#111827]/60 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-center text-center p-4 group"
        >
          <span className="font-['Times_New_Roman'] font-bold text-xl md:text-2xl text-charcoal-900 dark:text-gray-100 group-hover:text-gold-500 transition-colors">
            {dept}
          </span>
        </div>
      ))}
    </div>
  );

  const renderLevel2 = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 animate-fade-in-up">
      {YEARS.map((year) => (
        <div
          key={year}
          onClick={() => setSelectedYear(year)}
          className="aspect-square bg-white/40 dark:bg-[#111827]/60 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-center text-center p-4 group"
        >
          <span className="font-['Times_New_Roman'] font-bold text-2xl md:text-3xl text-charcoal-900 dark:text-gray-100 group-hover:text-gold-500 transition-colors">
            {year}
          </span>
        </div>
      ))}
    </div>
  );

  const renderLevel3 = () => {
    const posts = academicPosts.length > 0 ? academicPosts : generatePosts(selectedDept, selectedYear);
    return (
      <div className="flex flex-col gap-6 animate-fade-in-up">
        {posts.map((post) => (
          <div key={post.id} className="p-6 bg-white/40 dark:bg-[#111827]/60 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-['Times_New_Roman'] font-bold text-2xl text-charcoal-900 dark:text-gray-100 mb-2">
              {post.title}
            </h3>
            <p className="font-sans text-sm font-medium text-gold-600 dark:text-gold-400 mb-4">By {post.author}</p>
            <p className="font-sans text-charcoal-800 dark:text-gray-200 leading-relaxed mb-6">
              {post.content}
            </p>
            <EngagementBar 
              verifyCount={post.verifiedBy} 
              commentCount={post.comments} 
              repostCount={post.reposts} 
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        <div className="w-full max-w-5xl mx-auto mt-8 mb-16 px-4 md:px-8">
          
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gold-400/20 dark:bg-gold-500/20 flex items-center justify-center text-gold-500 shrink-0">
                <BookOpen size={24} />
              </div>
              <div>
                <h1 className="font-['Times_New_Roman'] text-3xl md:text-4xl font-bold text-charcoal-900 dark:text-gray-100 tracking-tight">Academics Directory</h1>
                <p className="font-sans text-charcoal-600 dark:text-gray-400 mt-1">Navigate through departments and years to discover contextual insights.</p>
              </div>
            </div>
          </div>

          {selectedDept && (
            <div className="mb-8 flex items-center gap-2 font-sans text-sm font-medium text-charcoal-600 dark:text-gray-400 animate-fade-in bg-white/30 dark:bg-black/20 w-fit px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 dark:border-white/5 shadow-sm">
              <button 
                onClick={handleBack}
                className="flex items-center gap-1 hover:text-gold-500 transition-colors group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>
                  Back to {selectedYear && selectedDept !== 'MCA' ? 'Years' : 'Departments'}
                </span>
              </button>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <span className="text-charcoal-900 dark:text-gray-100">{selectedDept}</span>
              {selectedYear && selectedDept !== 'MCA' && (
                <>
                  <ChevronRight size={14} className="text-gray-400" />
                  <span className="text-charcoal-900 dark:text-gray-100">{selectedYear}</span>
                </>
              )}
            </div>
          )}

          {!selectedDept && renderLevel1()}
          {selectedDept && !selectedYear && renderLevel2()}
          {selectedDept && selectedYear && renderLevel3()}
          
        </div>
      </div>
    </DashboardLayout>
  );
}
