import React from 'react';

const EmptyFolderIcon = ({ width = 80, height = 80, className = '' }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', margin: '0 auto' }}
    >
      {/* Background circle */}
      <circle cx="100" cy="100" r="95" fill="#f8f9fa"/>
      
      {/* Folder back */}
      <path 
        d="M 40 75 L 40 155 C 40 160 43 163 48 163 L 152 163 C 157 163 160 160 160 155 L 160 75 Z" 
        fill="#FFC107"
        stroke="#FFA000"
        strokeWidth="2"
      />
      
      {/* Folder tab */}
      <path 
        d="M 40 75 L 40 60 C 40 55 43 52 48 52 L 85 52 L 95 65 L 130 65 C 135 65 138 68 138 73 L 138 75 Z" 
        fill="#FFD54F"
        stroke="#FFA000"
        strokeWidth="2"
      />
      
      {/* Folder front edge */}
      <path 
        d="M 40 75 L 160 75" 
        stroke="#FFA000"
        strokeWidth="2"
      />
      
      {/* Empty state lines (optional, showing folder is empty) */}
      <line x1="70" y1="100" x2="130" y2="100" stroke="#FFE082" strokeWidth="1.5" opacity="0.5"/>
      <line x1="70" y1="115" x2="130" y2="115" stroke="#FFE082" strokeWidth="1.5" opacity="0.5"/>
      <line x1="70" y1="130" x2="110" y2="130" stroke="#FFE082" strokeWidth="1.5" opacity="0.5"/>
    </svg>
  );
};

export default EmptyFolderIcon;
