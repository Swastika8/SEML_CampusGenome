import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Button({ children, className, variant = 'primary', ...props }) {
  const baseStyle = "px-4 py-2 rounded-md font-medium transition-all duration-200";
  const variants = {
    primary: "bg-charcoal-900 text-white hover:bg-charcoal-800 dark:bg-gold-500 dark:text-charcoal-900 dark:hover:bg-gold-400",
    secondary: "bg-white/50 backdrop-blur-md text-charcoal-900 hover:bg-white/70 dark:bg-charcoal-800/50 dark:text-gray-200 dark:hover:bg-charcoal-800/70 border border-gray-200 dark:border-gray-700",
    ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-charcoal-800 text-charcoal-900 dark:text-gray-200"
  };

  return (
    <button className={cn(baseStyle, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
