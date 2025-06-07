import React from "react";
import { Calendar, Trash2, Receipt as ReceiptIcon, User } from "lucide-react";
import { Expense, Traveler, CURRENCIES } from "../types";

interface ExpenseCardProps {
  expense: Expense;
  travelers: Traveler[];
  onDelete: (id: string) => void;
}

export default function ExpenseCard({
  expense,
  travelers,
  onDelete,
}: ExpenseCardProps) {
  const payer = travelers.find((t) => t.id === expense.payerId);
  const participants = travelers.filter((t) =>
    expense.participantIds.includes(t.id)
  );
  const currency = CURRENCIES.find((c) => c.value === expense.currency);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {expense.title}
          </h3>
          <div className="flex items-center gap-2 text-2xl font-bold text-blue-600 mb-2">
            <span>{expense.amount.toLocaleString("fa-IR")}</span>
            <span className="text-sm">{currency?.symbol}</span>
          </div>
        </div>
        <button
          onClick={() => onDelete(expense.id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white flex-shrink-0">
            {payer?.profilePicture ? (
              <img
                src={payer.profilePicture}
                alt={payer.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={16} />
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600">پرداخت کننده:</p>
            <p className="font-medium text-gray-800">{payer?.name}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">شرکت کنندگان:</p>
          <div className="flex flex-wrap gap-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
                  {participant.profilePicture ? (
                    <img
                      src={participant.profilePicture}
                      alt={participant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={12} />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {participant.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar size={16} />
            <span className="text-sm">
              {new Date(expense.date).toLocaleDateString("fa-IR")}
            </span>
          </div>
          {expense.receipts.length > 0 && (
            <div className="flex items-center gap-1 text-gray-500">
              <ReceiptIcon size={16} />
              <span className="text-sm">{expense.receipts.length} رسید</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
