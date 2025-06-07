import React, { useState } from 'react';
import { Plus, Upload, User } from 'lucide-react';
import { Traveler } from '../types';

interface AddTravelerFormProps {
  onAdd: (traveler: Omit<Traveler, 'id' | 'createdAt'>) => void;
}

export default function AddTravelerForm({ onAdd }: AddTravelerFormProps) {
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd({
        name: name.trim(),
        profilePicture: profilePicture || undefined
      });
      setName('');
      setProfilePicture('');
      setIsExpanded(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePicture(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl p-4 flex items-center justify-center gap-2 transition-colors duration-200 shadow-md"
      >
        <Plus size={20} />
        افزودن مسافر جدید
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">افزودن مسافر جدید</h3>
      
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center relative">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={32} className="text-gray-500" />
          )}
          <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-200">
            <Upload size={20} className="text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
        
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="نام کامل مسافر"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
          required
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
        >
          افزودن
        </button>
        <button
          type="button"
          onClick={() => {
            setIsExpanded(false);
            setName('');
            setProfilePicture('');
          }}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}