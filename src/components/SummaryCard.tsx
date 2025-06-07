import React from 'react';

interface SummaryCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function SummaryCard({ title, children, className = '' }: SummaryCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}