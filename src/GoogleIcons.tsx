import React from 'react';

export const GoogleDriveIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 192 192" fill="none">
    <mask id="drive-mask" width="168" height="154" x="12" y="18" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }}>
      <path fill="#b43333" d="M63.09 37c14.626-25.333 51.193-25.334 65.819 0l45.033 78c14.626 25.334-3.657 57.001-32.91 57.001H50.967c-29.253 0-47.536-31.667-32.91-57.001z"/>
    </mask>
    <g mask="url(#drive-mask)">
      <path fill="url(#drive-b)" d="M206.905 172.02h-91.888l-19.015-32.934 45.944-79.578z"/>
      <path fill="url(#drive-c)" d="M-14.919 172.006 50.04 59.494v.002L31.032 92.422h38.02L115 172.004l-129.918.001z"/>
      <path fill="url(#drive-d)" d="M96.007-20.085 141.954 59.5l-19.011 32.928H31.048z"/>
    </g>
    <defs>
      <linearGradient id="drive-b" x1="193.6" x2="103.09" y1="165.6" y2="111.21" gradientUnits="userSpaceOnUse">
        <stop offset=".09" stopColor="#ffe921"/>
        <stop offset="1" stopColor="#fec700"/>
      </linearGradient>
      <linearGradient id="drive-c" x1="114.4" x2="15.53" y1="181.61" y2="121.8" gradientUnits="userSpaceOnUse">
        <stop offset=".15" stopColor="#a9a8ff"/>
        <stop offset=".33" stopColor="#6d97ff"/>
        <stop offset=".48" stopColor="#3186ff"/>
      </linearGradient>
      <linearGradient id="drive-d" x1="128.88" x2="28.7" y1="37.88" y2="84.64" gradientUnits="userSpaceOnUse">
        <stop offset=".55" stopColor="#0ebc5f"/>
        <stop offset=".85" stopColor="#78c9ff"/>
      </linearGradient>
    </defs>
  </svg>
);

export const GoogleSheetsIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 192 192" fill="none">
    <path fill="#009954" d="M8 74.6c0-8.943 0-13.415 1.404-16.962a20 20 0 0 1 11.234-11.233C24.185 45 28.656 45 37.6 45h60.8c8.943 0 13.415 0 16.962 1.404a20 20 0 0 1 11.234 11.234C128 61.185 128 65.656 128 74.6v42.8c0 8.943 0 13.415-1.404 16.962a20 20 0 0 1-11.234 11.234C111.815 147 107.343 147 98.4 147H37.6c-8.943 0-13.415 0-16.963-1.404a20 20 0 0 1-11.233-11.234C8 130.815 8 126.343 8 117.4z"/>
    <mask id="sheets-a" width="160" height="128" x="24" y="32" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }}>
      <rect width="160" height="128" x="24" y="32" fill="#0ebc5f" rx="20"/>
    </mask>
    <g mask="url(#sheets-a)">
      <path fill="#0ebc5f" d="M24 32h160v128H24z"/>
      <g filter="url(#sheets-b)">
        <rect width="144" height="102" fill="url(#sheets-c)" rx="25.6" transform="matrix(1 0 0 -1 8 147)"/>
      </g>
    </g>
    <path stroke="#fff" strokeLinecap="round" strokeWidth="12" d="M80 121h84m-20 19V76"/>
    <defs>
      <linearGradient id="sheets-c" x1="122.24" x2="20.76" y1="43.31" y2="43.31" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0ebc5f"/>
        <stop offset=".95" stopColor="#78c9ff"/>
      </linearGradient>
      <filter id="sheets-b" width="168" height="126" x="-4" y="33" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
        <feGaussianBlur result="effect1_foregroundBlur_37435_8174" stdDeviation="6"/>
      </filter>
    </defs>
  </svg>
);
