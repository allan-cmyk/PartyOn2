import React from 'react';

interface CategoryIconProps {
  category: string;
  className?: string;
}

export function CategoryIcon({ category, className = "w-5 h-5" }: CategoryIconProps) {
  switch (category) {
    case 'seltzers-champs':
      // Elegant champagne flute
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 12C5 9 7 3 7 3h10s2 6 2 9c0 2.5-2 4.5-4.5 5.5V21m-5 0v-3.5C7 16.5 5 14.5 5 12zm5.5 9h3m-3 0h-2m5 0h2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    
    case 'beer':
      // Refined beer glass
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 3h6v18H9V3zm6 5h2a2 2 0 012 2v5a2 2 0 01-2 2h-2m-6 2h6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 7v10" strokeLinecap="round" />
        </svg>
      );
    
    case 'cocktails':
      // Martini glass
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 3h16l-8 9m0 0v8m0 0h-4m4 0h4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="7" cy="5" r="1" />
        </svg>
      );
    
    case 'liquor':
      // Whiskey tumbler
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 12h14a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1v-7a1 1 0 011-1zm2-4h10l1 4H6l1-4zm2-4h6l1 4H8l1-4z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    
    case 'mixers-na':
      // Elegant bottle with citrus
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 2h4v5a2 2 0 01-2 2 2 2 0 01-2-2V2z" />
          <path d="M10 9h4l1 10a1 1 0 01-1 1h-4a1 1 0 01-1-1l1-10z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="16" r="2" strokeLinecap="round" />
          <path d="M17.5 14.5l1-1" strokeLinecap="round" />
        </svg>
      );
    
    case 'party-supplies':
      // Gift box
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 7v14m0-14l-4-3m4 3l4-3M3 12h18v9H3v-9zm0 0h18V8H3v4zm9-5h0" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.5 8V5.5a2.5 2.5 0 115 0V8m2 0V5.5a2.5 2.5 0 115 0V8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    
    default:
      // All products - grid icon
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

export default CategoryIcon;