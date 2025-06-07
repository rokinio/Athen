import React, { useState } from 'react';
import { Plus, Upload, Calendar, Receipt as ReceiptIcon } from 'lucide-react';
import { Expense, Traveler, Currency, CURRENCIES } from '../types';

interface AddExpenseFormProps {
  travelers: Traveler[];
  onAdd: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
}

export default function AddExpenseForm({ travelers, onAdd }: AddExpenseFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('TOMAN');
  const [payerId, setPayerId] = useState('');
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [receipts, setReceipts] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && amount && payerId && participantIds.length > 0) {
      onAdd({
        title: title.trim(),
        amount: parseFloat(amount),
        currency,
        payerId,
        participantIds,
        date: new Date(date),
        receipts
      });
      
      // Reset form
      setTitle('');
      setAmount('');
      setCurrency('TOMAN');
      setPayerId('');
      setParticipantIds([]);
      setDate(new Date().toISOString().split('T')[0]);
      setReceipts([]);
      setIsExpanded(false);
    }
  };

  const handleParticipantToggle = (travelerId: string) => {
    setParticipantIds(prev => 
      prev.includes(travelerId)
        ? prev.filter(id => id !== travelerId)
        : [...prev, travelerId]
    );
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setReceipts(prev => [...prev, event.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  if (travelers.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
        <p className="text-yellow-800">
          برای افزودن هزینه ابتدا باید مسافران را اضافه کنید
        </p>
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl p-4 flex items-center justify-center gap-2 transition-colors duration-200 shadow-md"
      >
        <Plus size={20} />
        افزودن هزینه جدید
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">افزودن هزینه جدید</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان هزینه (مثل: شام در رستوران)"
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          required
        />
        
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="مبلغ"
            step="0.01"
            min="0"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            {CURRENCIES.map(curr => (
              <option key={curr.value} value={curr.value}>
                {curr.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            پرداخت کننده
          </label>
          <select
            value={payerId}
            onChange={(e) => setPayerId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          >
            <option value="">انتخاب کنید</option>
            {travelers.map(traveler => (
              <option key={traveler.id} value={traveler.id}>
                {traveler.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar size={16} className="inline ml-1" />
            تاریخ
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          شرکت کنندگان
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {travelers.map(traveler => (
            <label
              key={traveler.id}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${
                participantIds.includes(traveler.id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={participantIds.includes(traveler.id)}
                onChange={() => handleParticipantToggle(traveler.id)}
                className="w-4 h-4 text-green-600"
              />
              <span className="text-sm font-medium">{traveler.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <ReceiptIcon size={16} className="inline ml-1" />
          رسیدها (اختیاری)
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors duration-200">
            <Upload size={16} />
            <span>آپلود رسید</span>
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleReceiptUpload}
              className="hidden"
            />
          </label>
          {receipts.length > 0 && (
            <span className="text-sm text-gray-600">
              {receipts.length} فایل انتخاب شده
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
        >
          افزودن هزینه
        </button>
        <button
          type="button"
          onClick={() => {
            setIsExpanded(false);
            setTitle('');
            setAmount('');
            setPayerId('');
            setParticipantIds([]);
            setReceipts([]);
          }}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}