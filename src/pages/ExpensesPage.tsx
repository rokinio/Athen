import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Expense, Traveler } from '../types';
import ExpenseCard from '../components/ExpenseCard';
import AddExpenseForm from '../components/AddExpenseForm';

interface ExpensesPageProps {
  expenses: Expense[];
  travelers: Traveler[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export default function ExpensesPage({ 
  expenses, 
  travelers, 
  onAddExpense, 
  onDeleteExpense 
}: ExpensesPageProps) {
  const handleAddExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: uuidv4(),
      createdAt: new Date()
    };
    onAddExpense(newExpense);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('آیا از حذف این هزینه اطمینان دارید؟')) {
      onDeleteExpense(id);
    }
  };

  return (
    <div className="space-y-6">
      <AddExpenseForm travelers={travelers} onAdd={handleAddExpense} />
      
      {expenses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-4xl">💰</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            هنوز هزینه‌ای ثبت نکرده‌اید
          </h3>
          <p className="text-gray-500">
            هزینه‌های سفر خود را اینجا ثبت کنید
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {expenses
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(expense => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                travelers={travelers}
                onDelete={handleDeleteExpense}
              />
            ))}
        </div>
      )}
    </div>
  );
}