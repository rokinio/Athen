import React, { useState } from 'react';
import { Traveler, Expense, ManualPayment } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Layout from './components/Layout';
import TravelersPage from './pages/TravelersPage';
import ExpensesPage from './pages/ExpensesPage';
import SummaryPage from './pages/SummaryPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'travelers' | 'expenses' | 'summary'>('travelers');
  const [travelers, setTravelers] = useLocalStorage<Traveler[]>('travelers', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [manualPayments, setManualPayments] = useLocalStorage<ManualPayment[]>('manualPayments', []);

  const handleAddTraveler = (traveler: Traveler) => {
    setTravelers(prev => [...prev, traveler]);
  };

  const handleDeleteTraveler = (id: string) => {
    setTravelers(prev => prev.filter(t => t.id !== id));
    // Also remove from expenses
    setExpenses(prev => prev.filter(e => 
      e.payerId !== id && !e.participantIds.includes(id)
    ));
    // Remove from manual payments
    setManualPayments(prev => prev.filter(p => 
      p.payerId !== id && p.receiverId !== id
    ));
  };

  const handleAddExpense = (expense: Expense) => {
    setExpenses(prev => [...prev, expense]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleAddManualPayment = (payment: ManualPayment) => {
    setManualPayments(prev => [...prev, payment]);
  };

  const handleResetData = () => {
    setTravelers([]);
    setExpenses([]);
    setManualPayments([]);
    setActiveTab('travelers');
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'travelers' && (
        <TravelersPage
          travelers={travelers}
          onAddTraveler={handleAddTraveler}
          onDeleteTraveler={handleDeleteTraveler}
        />
      )}
      {activeTab === 'expenses' && (
        <ExpensesPage
          expenses={expenses}
          travelers={travelers}
          onAddExpense={handleAddExpense}
          onDeleteExpense={handleDeleteExpense}
        />
      )}
      {activeTab === 'summary' && (
        <SummaryPage
          expenses={expenses}
          travelers={travelers}
          manualPayments={manualPayments}
          onAddManualPayment={handleAddManualPayment}
          onResetData={handleResetData}
        />
      )}
    </Layout>
  );
}