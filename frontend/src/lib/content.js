import { BookOpen, Briefcase, Users, CalendarDays, Coffee } from 'lucide-react';
export const channelMeta = {
  Academics: {
    slug: 'exam-survival',
    mark: 'A+',
    flair: 'Senior wisdom',
    feedLabel: 'Exam survival',
  },
  Lifestyle: {
    slug: 'after-class',
    mark: '☕',
    flair: 'Off the syllabus',
    feedLabel: 'After class',
  },
  Events: {
    slug: 'what-is-happening',
    mark: '✳',
    flair: 'Touch some grass',
    feedLabel: "What's happening",
  },
  Career: {
    slug: 'future-you',
    mark: '↗',
    flair: 'Future you says thanks',
    feedLabel: 'Future you',
  },
  Communities: {
    slug: 'find-your-people',
    mark: '☺',
    flair: 'Your kind of weird',
    feedLabel: 'Find your people',
  },
};
export const categoryMeta = {
  Academics: {
    icon: BookOpen,
    label: 'Academics',
    description:
      'The notes, study guides, and hard-earned advice that make the semester a little easier.',
    color: 'blue',
  },
  Career: {
    icon: Briefcase,
    label: 'Career & beyond',
    description:
      'Your next chapter starts here. Find opportunities, honest advice, and alumni insights.',
    color: 'purple',
  },
  Communities: {
    icon: Users,
    label: 'Find your people',
    description:
      'A shared curiosity can be the start of something great. Explore your campus communities.',
    color: 'orange',
  },
  Events: {
    icon: CalendarDays,
    label: 'Good things are happening',
    description:
      'Make room for something outside the timetable. Discover what’s next around campus.',
    color: 'green',
  },
  Lifestyle: {
    icon: Coffee,
    label: 'The other side of campus',
    description:
      'Quiet corners, favorite chai spots, and the little things that make campus feel like home.',
    color: 'rose',
  },
};
export function relativeTime(value) {
  const seconds = Math.max(0, (Date.now() - new Date(value)) / 1000);
  if (!Number.isFinite(seconds)) return 'Recently';
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
export function eventDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? { day: '—', month: 'TBA' }
    : { day: d.getDate(), month: d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase() };
}
export function nodeImage(node) {
  return (
    node.event_details?.image_url ||
    node.lifestyle_details?.image_url ||
    node.career_details?.image_url ||
    node.community_details?.image_url
  );
}
export const safeLink = (value) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol) ? value : null;
  } catch {
    return null;
  }
};
