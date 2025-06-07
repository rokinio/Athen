import React, { useState } from 'react';
import { Plus, CreditCard } from 'lucide-react';
import { ManualPayment, Traveler, Currency, CURRENCIES } from '../types';

interface ManualPaymentFormProps {
  travelers: Traveler[];
  onAdd: (payment: Omit<ManualPayment, 'id' | 'createdAt'>) => void;
}

export default function ManualPaymentForm({ travelers, onAdd }: ManualPaymentFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [payerId, setPayerId] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('TOMAN');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payerId && receiverId && amount && payerId !== receiverId) {
      onAdd({
        payerId,
        receiverId,
        amount: parseFloat(amount),
        currency,
        date: new Date(date)
      });
      
      // Reset form
      setPayerId('');
      setReceiverId('');
      setAmount('');
      setCurrency('TOMAN');
      setDate(new Date().toISOString().split('T')[0]);
      setIsExpanded(false);
    }
  };

  if (travelers.length < 2) {
    return null;
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-4 flex items-center justify-center gap-2 transition-colors duration-200 shadow-md"
      >
        <CreditCard size={20} />
        ثبت پرداخت دستی
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">ثبت پرداخت دستی</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            پرداخت کننده
          </label>
          <select
            value={payerId}
            onChange={(e) => setPayerId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
            دریافت کننده
          </label>
          <select
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            required
          >
            <option value="">انتخاب کنید</option>
            {travelers.filter(t => t.id !== payerId).map(traveler => (
              <option key={traveler.id} value={traveler.id}>
                {traveler.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="مبلغ پرداخت شده"
            step="0.01"
            min="0"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            required
          />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
          >
            {CURRENCIES.map(curr => (
              <option key={curr.value} value={curr.value}>
                {curr.label}
              </option>
            ))}
          </select>
        </div>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
          required
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
        >
          ثبت پرداخت
        </button>
        <button
          type="button"
          onClick={() => {
            setIsExpanded(false);
            setPayerId('');
            setReceiverId('');
            setAmount('');
          }}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}