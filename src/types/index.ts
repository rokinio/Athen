export interface Traveler {
  id: string;
  name: string;
  profilePicture?: string;
  createdAt: Date;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: Currency;
  payerId: string;
  participantIds: string[];
  date: Date;
  receipts: string[];
  createdAt: Date;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
  currency: Currency;
}

export interface ManualPayment {
  id: string;
  payerId: string;
  receiverId: string;
  amount: number;
  currency: Currency;
  date: Date;
  createdAt: Date;
}

export type Currency = "TOMAN" | "USD" | "EUR" | "GBP";

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] =
  [
    { value: "TOMAN", label: "ریال", symbol: "﷼" },
    { value: "USD", label: "دلار آمریکا", symbol: "$" },
    { value: "EUR", label: "یورو", symbol: "€" },
    { value: "GBP", label: "پوند انگلیس", symbol: "£" },
  ];
