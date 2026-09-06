import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, UploadCloud, Image as ImageIcon, Trash2, Link as LinkIcon, Check } from 'lucide-react';
import { useContribution } from '../../context/ContributionContext';
import { useData } from '../../context/DataContext';
import { CAMPUS_DEPARTMENTS, CAMPUS_YEARS } from '../../data/departments';

const CustomSelect = ({ value, onChange, options, placeholder = "Select...", className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-left text-charcoal-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all"
      >
        <span className={!selectedOption ? "text-gray-400 dark:text-gray-500 font-normal" : "font-medium"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={18} className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <ul className="absolute z-50 w-full mt-2 bg-white/95 dark:bg-[#111827]/95 border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl overflow-y-auto max-h-60 backdrop-blur-xl scrollbar-hide">
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-3 cursor-pointer transition-colors duration-200 
                  ${isSelected 
                    ? 'text-charcoal-900 dark:text-[#D4AF37] font-medium bg-gray-100/50 dark:bg-[#D4AF37]/5 border-l-[3px] border-charcoal-900 dark:border-[#D4AF37]' 
                    : 'text-charcoal-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#D4AF37]/15 hover:text-charcoal-900 dark:hover:text-[#D4AF37] border-l-[3px] border-transparent'
                  }`}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default function ContributionModal() {
  const { isWizardOpen, closeWizard, wizardTarget } = useContribution();
  const { refreshData } = useData();
  const fileInputRef = useRef(null);

  // Standardize the category names
  const [category, setCategory] = useState(wizardTarget?.type || 'Academics');
  
  // Image upload states
  const [imageUrl, setImageUrl] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [tempUrl, setTempUrl] = useState('');

  // States for all possible dynamic fields
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [subject, setSubject] = useState('');
  const [insight, setInsight] = useState('');
  
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDetails, setEventDetails] = useState('');
  
  const [spotName, setSpotName] = useState('');
  const [secret, setSecret] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  
  const [domain, setDomain] = useState('');
  const [companyRole, setCompanyRole] = useState('');
  const [opportunityType, setOpportunityType] = useState('');
  const [interviewExperience, setInterviewExperience] = useState('');

  const [clubName, setClubName] = useState('');
  const [updateType, setUpdateType] = useState('');
  const [communityDetails, setCommunityDetails] = useState('');

  // Reset form helper
  const resetForm = () => {
    setImageUrl('');
    setImageFileName('');
    setIsUrlMode(false);
    setTempUrl('');
    setDepartment('');
    setYear('');
    setSubject('');
    setInsight('');
    setEventTitle('');
    setEventDate('');
    setEventTime('');
    setEventLocation('');
    setEventDetails('');
    setSpotName('');
    setSecret('');
    setSelectedTags([]);
    setDomain('');
    setCompanyRole('');
    setOpportunityType('');
    setInterviewExperience('');
    setClubName('');
    setUpdateType('');
    setCommunityDetails('');
  };

  const handleClose = () => {
    resetForm();
    closeWizard();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('Please choose an image under 15MB.');
        return;
      }
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setImageUrl(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e) => {
    e?.stopPropagation();
    setImageUrl('');
    setImageFileName('');
    setTempUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const applyUrlImage = () => {
    if (tempUrl.trim()) {
      setImageUrl(tempUrl.trim());
      setImageFileName('Linked Web Image');
      setIsUrlMode(false);
    }
  };

  if (!isWizardOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      category: category === 'Events & News' ? 'Events' : category === 'Careers' ? 'Career' : category,
      department,
      year,
      subject,
      insight,
      title: eventTitle || spotName || (subject ? `${department || 'General'} - ${subject}` : null) || clubName || 'Campus Contribution',
      description: insight || eventDetails || secret || interviewExperience || communityDetails || 'Shared via CampusGenome',
      eventTitle,
      eventDate,
      eventTime,
      eventLocation,
      eventDetails,
      spotName,
      secret,
      tags: selectedTags,
      domain,
      companyRole,
      opportunityType,
      clubName,
      updateType,
      communityDetails,
      imageUrl: imageUrl || null,
    };

    try {
      const token = localStorage.getItem('campus_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('http://localhost:5000/api/nodes', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (refreshData) refreshData();
    } catch (err) {
      console.warn('Backend contribution sync failed, operating in offline mode:', err);
    }

    handleClose();
  };

  const lifestyleTags = ['Price: $', 'Price: $$', 'Price: $$$', 'Wi-Fi: Fast', 'Wi-Fi: None', 'Open Late', 'Quiet', 'Crowded'];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const inputClasses = "w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-charcoal-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500";
  const labelClasses = "text-sm font-medium text-charcoal-700 dark:text-gray-300 mb-1";

  const renderImageUpload = () => (
    <div className="flex flex-col gap-2 mt-2">
      <div className="flex items-center justify-between">
        <label className={labelClasses}>Attach Photo / Banner (Optional)</label>
        <button
          type="button"
          onClick={() => setIsUrlMode(!isUrlMode)}
          className="text-xs text-[#D4AF37] hover:underline font-medium flex items-center gap-1"
        >
          <LinkIcon size={12} />
          {isUrlMode ? 'Upload from device' : 'Paste web link'}
        </button>
      </div>

      {/* Hidden Native File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileChange} 
      />

      {isUrlMode ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={tempUrl}
            onChange={(e) => setTempUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className={inputClasses}
          />
          <button
            type="button"
            onClick={applyUrlImage}
            className="px-4 py-2 bg-[#D4AF37] text-black font-bold rounded-lg text-xs hover:bg-[#c29e2f] transition-colors shrink-0 flex items-center gap-1"
          >
            <Check size={14} /> Attach
          </button>
        </div>
      ) : imageUrl ? (
        <div className="relative w-full h-44 rounded-xl border border-gray-300 dark:border-gray-600 overflow-hidden group bg-charcoal-900">
          <img 
            src={imageUrl} 
            alt="Upload preview" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-black font-medium text-xs rounded-lg shadow hover:bg-gray-100 flex items-center gap-1"
            >
              <UploadCloud size={14} /> Change Photo
            </button>
            <button
              type="button"
              onClick={removeImage}
              className="px-3 py-1.5 bg-red-600 text-white font-medium text-xs rounded-lg shadow hover:bg-red-700 flex items-center gap-1"
            >
              <Trash2 size={14} /> Remove
            </button>
          </div>
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[11px] text-white font-mono truncate max-w-[80%]">
            {imageFileName || 'Image Ready'}
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-32 border-2 border-dashed border-gray-400 dark:border-gray-500/50 rounded-xl flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 cursor-pointer hover:border-[#D4AF37] dark:hover:border-[#D4AF37] hover:bg-charcoal-50 dark:hover:bg-white/5 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <UploadCloud size={22} className="text-gray-500 dark:text-gray-400 group-hover:text-[#D4AF37]" />
          </div>
          <span className="font-semibold text-sm text-charcoal-800 dark:text-gray-200">
            Click to upload an image from your device
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            PNG, JPG, WEBP, or GIF (up to 15MB)
          </span>
        </div>
      )}
    </div>
  );

  const renderDynamicFields = () => {
    switch (category) {
      case 'Academics':
        return (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-5">
              <div className="flex-1 flex flex-col">
                <label className={labelClasses}>Department</label>
                <CustomSelect 
                  value={department}
                  onChange={setDepartment}
                  placeholder="Select Department"
                  options={CAMPUS_DEPARTMENTS}
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className={labelClasses}>Year</label>
                <CustomSelect 
                  value={year}
                  onChange={setYear}
                  placeholder="Select Year"
                  options={CAMPUS_YEARS}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className={labelClasses}>Subject / Topic</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Data Structures & Algorithms, VLSI, CAD..." className={inputClasses} />
            </div>
            {renderImageUpload()}
            <div className="flex flex-col">
              <label className={labelClasses}>Insight / Verified Knowledge</label>
              <textarea value={insight} onChange={(e) => setInsight(e.target.value)} rows={4} placeholder="Share study tips, important PYQs, lab guidelines, professor advice..." className={`${inputClasses} resize-none`} />
            </div>
          </div>
        );
      
      case 'Events & News':
        return (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex flex-col">
              <label className={labelClasses}>Event Title / Headline</label>
              <input type="text" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="e.g. Annual Tech Fest" className={inputClasses} />
            </div>
            <div className="flex flex-col md:flex-row gap-5">
              <div className="flex-1 flex flex-col">
                <label className={labelClasses}>Date</label>
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={inputClasses} />
              </div>
              <div className="flex-1 flex flex-col">
                <label className={labelClasses}>Time</label>
                <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className={inputClasses} />
              </div>
            </div>
            <div className="flex flex-col">
              <label className={labelClasses}>Location / Venue</label>
              <input type="text" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="e.g. Main Auditorium" className={inputClasses} />
            </div>
            {renderImageUpload()}
            <div className="flex flex-col">
              <label className={labelClasses}>Full Details</label>
              <textarea value={eventDetails} onChange={(e) => setEventDetails(e.target.value)} rows={4} placeholder="What is the event about?" className={`${inputClasses} resize-none`} />
            </div>
          </div>
        );

      case 'Lifestyle':
        return (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex flex-col">
              <label className={labelClasses}>Spot Name</label>
              <input type="text" value={spotName} onChange={(e) => setSpotName(e.target.value)} placeholder="e.g. Campus Cafe" className={inputClasses} />
            </div>
            
            <div className="flex flex-col">
              <label className={labelClasses}>Vibe/Utility Tags</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {lifestyleTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      selectedTags.includes(tag)
                        ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                        : 'bg-transparent border-gray-400 dark:border-gray-500 text-charcoal-700 dark:text-gray-300 hover:border-[#D4AF37]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {renderImageUpload()}
            
            <div className="flex flex-col">
              <label className={labelClasses}>Share the Genome Secret / Hack</label>
              <textarea value={secret} onChange={(e) => setSecret(e.target.value)} rows={4} placeholder="e.g. Ask for the secret menu item..." className={`${inputClasses} resize-none`} />
            </div>
          </div>
        );
      
      case 'Careers':
        return (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-5">
              <div className="flex-1 flex flex-col">
                <label className={labelClasses}>Domain / Industry</label>
                <CustomSelect 
                  value={domain}
                  onChange={setDomain}
                  placeholder="Select Domain"
                  options={[
                    { value: 'IT/Tech', label: 'IT/Tech' },
                    { value: 'Finance', label: 'Finance' },
                    { value: 'Core Engineering', label: 'Core Engineering' },
                    { value: 'Consulting', label: 'Consulting' },
                    { value: 'Design', label: 'Design' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className={labelClasses}>Opportunity Type</label>
                <CustomSelect 
                  value={opportunityType}
                  onChange={setOpportunityType}
                  placeholder="Select Type"
                  options={[
                    { value: 'On-Campus Internship', label: 'On-Campus Internship' },
                    { value: 'Off-Campus Internship', label: 'Off-Campus Internship' },
                    { value: 'Full-Time Placement', label: 'Full-Time Placement' },
                  ]}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className={labelClasses}>Company Name & Role</label>
              <input type="text" value={companyRole} onChange={(e) => setCompanyRole(e.target.value)} placeholder="e.g. Google - SDE Intern" className={inputClasses} />
            </div>
            <div className="flex flex-col">
              <label className={labelClasses}>Interview Experience / Selection Process</label>
              <textarea value={interviewExperience} onChange={(e) => setInterviewExperience(e.target.value)} rows={4} placeholder="Share the interview rounds, questions asked, or resume tips..." className={`${inputClasses} resize-none`} />
            </div>
          </div>
        );

      case 'Communities':
        return (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-5">
              <div className="flex-1 flex flex-col">
                <label className={labelClasses}>Club / Society Name</label>
                <input type="text" value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder="e.g. Quantum Computing Club" className={inputClasses} />
              </div>
              <div className="flex-1 flex flex-col">
                <label className={labelClasses}>Update Type</label>
                <CustomSelect 
                  value={updateType}
                  onChange={setUpdateType}
                  placeholder="Select Type"
                  options={[
                    { value: 'Member Recruitment', label: 'Member Recruitment' },
                    { value: 'General Meeting', label: 'General Meeting' },
                    { value: 'Project Showcase', label: 'Project Showcase' },
                    { value: 'Secret Insight', label: 'Secret Insight' },
                  ]}
                />
              </div>
            </div>
            {renderImageUpload()}
            <div className="flex flex-col">
              <label className={labelClasses}>Details / Announcement</label>
              <textarea value={communityDetails} onChange={(e) => setCommunityDetails(e.target.value)} rows={4} placeholder="Share meeting details, how to join, or what the club actually does..." className={`${inputClasses} resize-none`} />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex flex-col gap-4 animate-fade-in text-charcoal-600 dark:text-gray-400 text-sm py-8 text-center italic">
            Form layout for this category is under construction.
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Deep blur overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-2xl animate-fade-in"
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-[#111827]/95 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/40 dark:border-white/10 animate-fade-in-up scrollbar-hide">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
          <h2 className="font-serif text-3xl font-bold text-charcoal-900 dark:text-gray-100">
            Contribute to the Genome
          </h2>
          <button 
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          
          <div className="flex flex-col">
            <label className={labelClasses}>Category</label>
            <CustomSelect 
              value={category}
              onChange={setCategory}
              options={[
                { value: 'Academics', label: 'Academics' },
                { value: 'Events & News', label: 'Events & News' },
                { value: 'Lifestyle', label: 'Lifestyle' },
                { value: 'Careers', label: 'Careers' },
                { value: 'Communities', label: 'Communities' },
              ]}
            />
          </div>

          <div className="transition-all duration-300">
            {renderDynamicFields()}
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-white/10 mt-2">
            <button 
              type="submit"
              className="bg-[#D4AF37] text-black font-bold px-8 py-3 rounded-lg shadow-lg hover:scale-105 transition-transform"
            >
              Publish to Genome
            </button>
          </div>
          
        </form>

      </div>
    </div>
  );
}
