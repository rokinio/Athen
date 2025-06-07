// File: src/utils/settlement.ts

import {
  Expense,
  Traveler,
  Settlement,
  ManualPayment,
  Currency,
} from "../types";

interface Balance {
  [travelerId: string]: {
    [currency in Currency]?: number;
  };
}

/**
 * Calculates the final settlement plan.
 */
export function calculateSettlement(
  expenses: Expense[],
  travelers: Traveler[],
  manualPayments: ManualPayment[]
): Settlement[] {
  const balances: Balance = {};

  // 1. Initialize balances for all travelers
  travelers.forEach((traveler) => {
    balances[traveler.id] = {};
  });

  // 2. Calculate balances from expenses
  expenses.forEach((expense) => {
    const shareAmount = expense.amount / expense.participantIds.length;
    const currency = expense.currency;

    if (!balances[expense.payerId][currency]) {
      balances[expense.payerId][currency] = 0;
    }
    balances[expense.payerId][currency]! += expense.amount; // Payer gets credit

    expense.participantIds.forEach((participantId) => {
      if (!balances[participantId][currency]) {
        balances[participantId][currency] = 0;
      }
      balances[participantId][currency]! -= shareAmount; // Participants get debited
    });
  });

  // 3. Apply manual payments with the CORRECT logic
  manualPayments.forEach((payment) => {
    const { currency, payerId, receiverId, amount } = payment;
    if (!balances[payerId][currency]) {
      balances[payerId][currency] = 0;
    }
    if (!balances[receiverId][currency]) {
      balances[receiverId][currency] = 0;
    }

    // Payer's balance INCREASES (debt is reduced)
    balances[payerId][currency]! += amount;
    // Receiver's balance DECREASES (credit is reduced)
    balances[receiverId][currency]! -= amount;
  });

  // 4. Generate the final settlement plan
  const settlements: Settlement[] = [];
  const allCurrencies = new Set<Currency>();
  expenses.forEach((e) => allCurrencies.add(e.currency));
  manualPayments.forEach((p) => allCurrencies.add(p.currency));

  allCurrencies.forEach((currency) => {
    const currencyBalances = Object.entries(balances)
      .map(([travelerId, balance]) => ({
        travelerId,
        amount: balance[currency] || 0,
      }))
      .filter(({ amount }) => Math.abs(amount) > 0.01);

    const debtors = currencyBalances
      .filter(({ amount }) => amount < 0)
      .map((d) => ({ ...d, amount: -d.amount }));
    const creditors = currencyBalances.filter(({ amount }) => amount > 0);

    let i = 0,
      j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debt = debtors[i];
      const credit = creditors[j];
      const settlementAmount = Math.min(debt.amount, credit.amount);

      if (settlementAmount > 0.01) {
        settlements.push({
          from: debt.travelerId,
          to: credit.travelerId,
          amount: Math.round(settlementAmount * 100) / 100,
          currency: currency,
        });
      }

      debt.amount -= settlementAmount;
      credit.amount -= settlementAmount;

      if (debt.amount < 0.01) i++;
      if (credit.amount < 0.01) j++;
    }
  });

  return settlements;
}

/**
 * Calculates total expenses for each currency.
 */
export function getTotalExpensesByCurrency(expenses: Expense[]): {
  [key in Currency]?: number;
} {
  const totals: { [key in Currency]?: number } = {};
  expenses.forEach((expense) => {
    if (!totals[expense.currency]) {
      totals[expense.currency] = 0;
    }
    totals[expense.currency]! += expense.amount;
  });
  return totals;
}

/**
 * Calculates the net payment for each person, including expenses and manual payments.
 */
export function getNetPayments(
  expenses: Expense[],
  travelers: Traveler[],
  manualPayments: ManualPayment[]
): { [travelerId: string]: { [key in Currency]?: number } } {
  const netPaid: { [travelerId: string]: { [key in Currency]?: number } } = {};

  travelers.forEach((t) => {
    netPaid[t.id] = {};
  });

  expenses.forEach((expense) => {
    const { currency, payerId, amount } = expense;
    if (!netPaid[payerId][currency]) {
      netPaid[payerId][currency] = 0;
    }
    netPaid[payerId][currency]! += amount;
  });

  manualPayments.forEach((payment) => {
    const { currency, payerId, receiverId, amount } = payment;
    if (!netPaid[payerId][currency]) {
      netPaid[payerId][currency] = 0;
    }
    netPaid[payerId][currency]! += amount;
    if (!netPaid[receiverId][currency]) {
      netPaid[receiverId][currency] = 0;
    }
    netPaid[receiverId][currency]! -= amount;
  });

  return netPaid;
}
