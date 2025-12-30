
import React from 'react';
import { Theme, ThemeId } from './types';

export const THEMES: Record<ThemeId, Theme> = {
  pink: {
    id: 'pink',
    primary: '#ec4899', // pink-500
    secondary: '#fdf2f8', // pink-50
    accent: '#fbcfe8', // pink-200
    bg: '#fff5f7'
  },
  blue: {
    id: 'blue',
    primary: '#3b82f6', // blue-500
    secondary: '#eff6ff', // blue-50
    accent: '#bfdbfe', // blue-200
    bg: '#f0f7ff'
  },
  green: {
    id: 'green',
    primary: '#22c55e', // green-500
    secondary: '#f0fdf4', // green-50
    accent: '#bbf7d0', // green-200
    bg: '#f2fff5'
  },
  purple: {
    id: 'purple',
    primary: '#a855f7', // purple-500
    secondary: '#faf5ff', // purple-50
    accent: '#e9d5ff', // purple-200
    bg: '#f8f5ff'
  },
  orange: {
    id: 'orange',
    primary: '#f97316', // orange-500
    secondary: '#fff7ed', // orange-50
    accent: '#fed7aa', // orange-200
    bg: '#fffaf5'
  }
};

export const StampIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full opacity-70 animate-[bounce_0.3s_ease-out]">
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="10,5" />
    <path
      d="M30 50 L45 65 L70 35"
      fill="none"
      stroke="currentColor"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <text
      x="50"
      y="85"
      textAnchor="middle"
      className="text-[14px] font-bold fill-current tracking-widest"
      style={{ fontFamily: 'sans-serif' }}
    >
      CLEAR!
    </text>
  </svg>
);
