import React from 'react';
import { User, Trash2 } from 'lucide-react';
import { Traveler } from '../types';

interface TravelerCardProps {
  traveler: Traveler;
  onDelete: (id: string) => void;
}

export default function TravelerCard({ traveler, onDelete }: TravelerCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
          {traveler.profilePicture ? (
            <img
              src={traveler.profilePicture}
              alt={traveler.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={24} />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">{traveler.name}</h3>
          <p className="text-sm text-gray-500">
            عضو تیم از {new Date(traveler.createdAt).toLocaleDateString('fa-IR')}
          </p>
        </div>
        
        <button
          onClick={() => onDelete(traveler.id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}