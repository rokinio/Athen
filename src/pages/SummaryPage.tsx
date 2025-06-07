import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Expense, Traveler, ManualPayment, CURRENCIES } from '../types';
import { 
  calculateSettlement, 
  getTotalExpensesByCurrency, 
  getTotalPaidByTraveler 
} from '../utils/settlement';
import SummaryCard from '../components/SummaryCard';
import ManualPaymentForm from '../components/ManualPaymentForm';

interface SummaryPageProps {
  expenses: Expense[];
  travelers: Traveler[];
  manualPayments: ManualPayment[];
  onAddManualPayment: (payment: ManualPayment) => void;
  onResetData: () => void;
}

export default function SummaryPage({ 
  expenses, 
  travelers, 
  manualPayments,
  onAddManualPayment,
  onResetData 
}: SummaryPageProps) {
  const settlements = calculateSettlement(expenses, travelers, manualPayments);
  const totalExpenses = getTotalExpensesByCurrency(expenses);
  
  const handleAddManualPayment = (paymentData: Omit<ManualPayment, 'id' | 'createdAt'>) => {
    const newPayment: ManualPayment = {
      ...paymentData,
      id: uuidv4(),
      createdAt: new Date()
    };
    onAddManualPayment(newPayment);
  };

  const handleResetData = () => {
    if (confirm('⚠️ هشدار: این عمل تمام داده‌ها را پاک می‌کند و قابل بازگشت نیست. آیا اطمینان دارید؟')) {
      if (confirm('آیا واقعاً می‌خواهید تمام مسافران، هزینه‌ها و پرداخت‌ها را حذف کنید؟')) {
        onResetData();
      }
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-4xl">📊</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          هنوز هزینه‌ای برای نمایش خلاصه وجود ندارد
        </h3>
        <p className="text-gray-500">
          ابتدا هزینه‌های خود را در بخش هزینه‌ها ثبت کنید
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Trip Costs */}
      <SummaryCard title="کل هزینه‌های سفر" className="bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(totalExpenses).map(([currency, amount]) => {
            const currencyInfo = CURRENCIES.find(c => c.value === currency);
            return (
              <div key={currency} className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">
                  {amount?.toLocaleString('fa-IR')}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {currencyInfo?.label} ({currencyInfo?.symbol})
                </div>
              </div>
            );
          })}
        </div>
      </SummaryCard>

      {/* Total Paid Per Person */}
      <SummaryCard title="مجموع پرداخت هر نفر" className="bg-gradient-to-r from-green-50 to-green-100">
        <div className="space-y-4">
          {travelers.map(traveler => {
            const paidAmounts = getTotalPaidByTraveler(expenses, traveler.id);
            const hasPaid = Object.keys(paidAmounts).length > 0;
            
            return (
              <div key={traveler.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white">
                    {traveler.profilePicture ? (
                      <img
                        src={traveler.profilePicture}
                        alt={traveler.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">{traveler.name.charAt(0)}</span>
                    )}
                  </div>
                  <span className="font-medium text-gray-800">{traveler.name}</span>
                </div>
                <div className="text-left">
                  {hasPaid ? (
                    Object.entries(paidAmounts).map(([currency, amount]) => {
                      const currencyInfo = CURRENCIES.find(c => c.value === currency);
                      return (
                        <div key={currency} className="text-sm">
                          <span className="font-semibold">{amount?.toLocaleString('fa-IR')}</span>
                          <span className="text-gray-500 mr-1">{currencyInfo?.symbol}</span>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-gray-500 text-sm">پرداخت نکرده</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </SummaryCard>

      {/* Settlement Plan */}
      <SummaryCard title="برنامه تسویه حساب" className="bg-gradient-to-r from-orange-50 to-orange-100">
        {settlements.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-green-600 mb-2">
              همه حساب‌ها تسویه شده!
            </h3>
            <p className="text-gray-600">
              هیچ بدهی باقی نمانده است
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {settlements.map((settlement, index) => {
              const payer = travelers.find(t => t.id === settlement.from);
              const receiver = travelers.find(t => t.id === settlement.to);
              const currency = CURRENCIES.find(c => c.value === settlement.currency);
              
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border-r-4 border-orange-400">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white">
                      {payer?.profilePicture ? (
                        <img
                          src={payer.profilePicture}
                          alt={payer?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm">{payer?.name.charAt(0)}</span>
                      )}
                    </div>
                    <span className="font-medium">{payer?.name}</span>
                    <span className="text-gray-500">باید بپردازد به</span>
                    <span className="font-medium">{receiver?.name}</span>
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-orange-600">
                      {settlement.amount.toLocaleString('fa-IR')} {currency?.symbol}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SummaryCard>

      {/* Manual Payments */}
      <div className="space-y-4">
        <ManualPaymentForm travelers={travelers} onAdd={handleAddManualPayment} />
        
        {manualPayments.length > 0 && (
          <SummaryCard title="پرداخت‌های ثبت شده\" className="bg-gradient-to-r from-purple-50 to-purple-100">
            <div className="space-y-3">
              {manualPayments.map(payment => {
                const payer = travelers.find(t => t.id === payment.payerId);
                const receiver = travelers.find(t => t.id === payment.receiverId);
                const currency = CURRENCIES.find(c => c.value === payment.currency);
                
                return (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{payer?.name}</span>
                      <span className="text-gray-500">→</span>
                      <span className="font-medium">{receiver?.name}</span>
                    </div>
                    <div className="text-sm font-semibold text-purple-600">
                      {payment.amount.toLocaleString('fa-IR')} {currency?.symbol}
                    </div>
                  </div>
                );
              })}
            </div>
          </SummaryCard>
        )}
      </div>

      {/* Reset Button */}
      <div className="flex justify-center pt-8">
        <button
          onClick={handleResetData}
          className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-md"
        >
          <AlertTriangle size={20} />
          <RefreshCw size={18} />
          ریست کامل داده‌ها
        </button>
      </div>
    </div>
  );
}