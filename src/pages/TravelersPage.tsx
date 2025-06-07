import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Traveler } from '../types';
import TravelerCard from '../components/TravelerCard';
import AddTravelerForm from '../components/AddTravelerForm';

interface TravelersPageProps {
  travelers: Traveler[];
  onAddTraveler: (traveler: Traveler) => void;
  onDeleteTraveler: (id: string) => void;
}

export default function TravelersPage({ 
  travelers, 
  onAddTraveler, 
  onDeleteTraveler 
}: TravelersPageProps) {
  const handleAddTraveler = (travelerData: Omit<Traveler, 'id' | 'createdAt'>) => {
    const newTraveler: Traveler = {
      ...travelerData,
      id: uuidv4(),
      createdAt: new Date()
    };
    onAddTraveler(newTraveler);
  };

  const handleDeleteTraveler = (id: string) => {
    if (confirm('آیا از حذف این مسافر اطمینان دارید؟')) {
      onDeleteTraveler(id);
    }
  };

  return (
    <div className="space-y-6">
      <AddTravelerForm onAdd={handleAddTraveler} />
      
      {travelers.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-4xl">👥</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            هنوز مسافری اضافه نکرده‌اید
          </h3>
          <p className="text-gray-500">
            برای شروع، مسافران گروه خود را اضافه کنید
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {travelers.map(traveler => (
            <TravelerCard
              key={traveler.id}
              traveler={traveler}
              onDelete={handleDeleteTraveler}
            />
          ))}
        </div>
      )}
    </div>
  );
}