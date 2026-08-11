import React from 'react';

export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-3xl card-shadow p-5 ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, color = 'bg-happy-blue' }) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shrink-0`}>
        <Icon size={26} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-extrabold text-gray-800">{value}</p>
      </div>
    </Card>
  );
}