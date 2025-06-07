import { Expense, Traveler, Settlement, ManualPayment, Currency } from '../types';

interface Balance {
  [travelerId: string]: {
    [currency in Currency]?: number;
  };
}

export function calculateSettlement(
  expenses: Expense[],
  travelers: Traveler[],
  manualPayments: ManualPayment[]
): Settlement[] {
  const balances: Balance = {};
  
  // Initialize balances
  travelers.forEach(traveler => {
    balances[traveler.id] = {};
  });

  // Calculate balances from expenses
  expenses.forEach(expense => {
    const shareAmount = expense.amount / expense.participantIds.length;
    
    // Payer gets credit
    if (!balances[expense.payerId][expense.currency]) {
      balances[expense.payerId][expense.currency] = 0;
    }
    balances[expense.payerId][expense.currency]! += expense.amount;
    
    // Participants get debited
    expense.participantIds.forEach(participantId => {
      if (!balances[participantId][expense.currency]) {
        balances[participantId][expense.currency] = 0;
      }
      balances[participantId][expense.currency]! -= shareAmount;
    });
  });

  // Apply manual payments
  manualPayments.forEach(payment => {
    if (!balances[payment.payerId][payment.currency]) {
      balances[payment.payerId][payment.currency] = 0;
    }
    if (!balances[payment.receiverId][payment.currency]) {
      balances[payment.receiverId][payment.currency] = 0;
    }
    
    balances[payment.payerId][payment.currency]! -= payment.amount;
    balances[payment.receiverId][payment.currency]! += payment.amount;
  });

  // Generate settlements for each currency
  const settlements: Settlement[] = [];
  
  ['TOMAN', 'USD', 'EUR', 'GBP'].forEach(currency => {
    const currencyBalances = Object.entries(balances)
      .map(([travelerId, balance]) => ({
        travelerId,
        amount: balance[currency as Currency] || 0
      }))
      .filter(({ amount }) => Math.abs(amount) > 0.01);

    const debtors = currencyBalances.filter(({ amount }) => amount < 0);
    const creditors = currencyBalances.filter(({ amount }) => amount > 0);

    // Optimize settlements using greedy algorithm
    debtors.forEach(debtor => {
      let remainingDebt = Math.abs(debtor.amount);
      
      creditors.forEach(creditor => {
        if (remainingDebt > 0.01 && creditor.amount > 0.01) {
          const settlementAmount = Math.min(remainingDebt, creditor.amount);
          
          settlements.push({
            from: debtor.travelerId,
            to: creditor.travelerId,
            amount: Math.round(settlementAmount * 100) / 100,
            currency: currency as Currency
          });
          
          remainingDebt -= settlementAmount;
          creditor.amount -= settlementAmount;
        }
      });
    });
  });

  return settlements.filter(settlement => settlement.amount > 0.01);
}

export function getTotalExpensesByCurrency(expenses: Expense[]): { [key in Currency]?: number } {
  const totals: { [key in Currency]?: number } = {};
  
  expenses.forEach(expense => {
    if (!totals[expense.currency]) {
      totals[expense.currency] = 0;
    }
    totals[expense.currency]! += expense.amount;
  });
  
  return totals;
}

export function getTotalPaidByTraveler(expenses: Expense[], travelerId: string): { [key in Currency]?: number } {
  const totals: { [key in Currency]?: number } = {};
  
  expenses
    .filter(expense => expense.payerId === travelerId)
    .forEach(expense => {
      if (!totals[expense.currency]) {
        totals[expense.currency] = 0;
      }
      totals[expense.currency]! += expense.amount;
    });
  
  return totals;
}