import React, { useState, useEffect } from "react";
import { 
  Transaction, 
  TransactionScope, 
  TransactionType, 
  ALL_CATEGORIES_MAP 
} from "../types";
import { X, Check } from "lucide-react";

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, "id">) => void;
}

export default function NewTransactionModal({ isOpen, onClose, onSave }: NewTransactionModalProps) {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState<TransactionScope>(TransactionScope.PROFESSIONAL);
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [notes, setNotes] = useState("");
  const [isMixedIncident, setIsMixedIncident] = useState(false);

  // Dynamic lists of categories based on scope and type
  const matchedCategoriesList = ALL_CATEGORIES_MAP[`${scope}_${type}`] || [];

  // Reset category whenever scope or type changes to avoid orphan selections
  useEffect(() => {
    if (matchedCategoriesList.length > 0) {
      setCategory(matchedCategoriesList[0]);
    } else {
      setCategory("");
    }
  }, [scope, type]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || parseFloat(amount) <= 0) return;

    onSave({
      date,
      description,
      type,
      scope,
      category,
      amount: parseFloat(amount),
      paymentMethod,
      notes: isMixedIncident 
        ? `Aviso: Lançado como despesa pessoal paga incorretamente com o caixa PJ do escritório. ${notes}`.trim()
        : notes,
      isAiCategorized: isMixedIncident // Handled as manual mixed transaction
    });

    // Reset Form
    setDescription("");
    setAmount("");
    setNotes("");
    setIsMixedIncident(false);
    setDate(new Date().toISOString().split("T")[0]);
    onClose();
  };

  return (
    <div id="new-transaction-modal" className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-150 overflow-hidden transform transition-all animate-scale-up">
        {/* Header */}
        <div className="flex justify-between items-center bg-slate-950 text-white p-4">
          <div className="flex items-center gap-1.5">
            <h3 id="modal-title" className="text-sm font-bold tracking-tight">Lançar Nova Movimentação</h3>
          </div>
          <button
            id="close-modal-btn"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Dual Scope & Type Toggles */}
          <div className="grid grid-cols-2 gap-3">
            {/* Scope Selector */}
            <div className="space-y-1">
              <label htmlFor="scope-select" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Escopo da Alçada</label>
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
                <button
                  id="scope-btn-professional"
                  type="button"
                  onClick={() => setScope(TransactionScope.PROFESSIONAL)}
                  className={`w-full text-center py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    scope === TransactionScope.PROFESSIONAL
                      ? "bg-white text-indigo-950 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Escritório (PJ)
                </button>
                <button
                  id="scope-btn-personal"
                  type="button"
                  onClick={() => setScope(TransactionScope.PERSONAL)}
                  className={`w-full text-center py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    scope === TransactionScope.PERSONAL
                      ? "bg-white text-sky-950 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Pessoal (PF)
                </button>
              </div>
            </div>

            {/* Type Selector */}
            <div className="space-y-1">
              <label htmlFor="type-select" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fluxo de Caixa</label>
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
                <button
                  id="type-btn-expense"
                  type="button"
                  onClick={() => setType(TransactionType.EXPENSE)}
                  className={`w-full text-center py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    type === TransactionType.EXPENSE
                      ? "bg-white text-rose-700 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Despesa (Saída)
                </button>
                <button
                  id="type-btn-revenue"
                  type="button"
                  onClick={() => setType(TransactionType.REVENUE)}
                  className={`w-full text-center py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    type === TransactionType.REVENUE
                      ? "bg-white text-emerald-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Receita (Entrada)
                </button>
              </div>
            </div>
          </div>

          {/* Date & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="tx-date" className="block text-xs font-semibold text-slate-500">Data da Operação</label>
              <input
                id="tx-date"
                type="date"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-slate-700"
                value={date}
                required
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="tx-amount" className="block text-xs font-semibold text-slate-500">Valor (R$)</label>
              <input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0.01"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-transparent font-mono text-slate-700"
                placeholder="0,00"
                value={amount}
                required
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="tx-description" className="block text-xs font-semibold text-slate-500">Descrição Comercial</label>
            <input
              id="tx-description"
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-slate-700"
              placeholder="Ex: Honorários de Sucumbência - Proc. 104"
              value={description}
              required
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-1">
              <label htmlFor="tx-category" className="block text-xs font-semibold text-slate-500">Categoria Contábil</label>
              <select
                id="tx-category"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 text-slate-700"
                value={category}
                required
                onChange={(e) => setCategory(e.target.value)}
              >
                {matchedCategoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 col-span-1">
              <label htmlFor="tx-method" className="block text-xs font-semibold text-slate-500">Meio de Transação</label>
              <select
                id="tx-method"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 text-slate-700"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="PIX">PIX</option>
                <option value="Boleto Bancário">Boleto Bancário</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Transferência Bancária">Transferência (TED/DOC)</option>
                <option value="Dinheiro">Dinheiro Espécie</option>
              </select>
            </div>
          </div>

          {/* ADVOCACY SPECIFIC: Mixed Billing Flag */}
          {scope === TransactionScope.PERSONAL && type === TransactionType.EXPENSE && (
            <div id="mixed-bill-checkbox" className="flex items-start gap-2.5 bg-amber-50 p-3 rounded-lg border border-amber-250">
              <input
                id="mixed-flag-checkbox"
                type="checkbox"
                className="mt-0.5 rounded-sm accent-amber-600"
                checked={isMixedIncident}
                onChange={(e) => setIsMixedIncident(e.target.checked)}
              />
              <div className="space-y-0.5 pointer-events-none select-none">
                <p className="text-xs font-bold text-amber-800">Paguei com o Caixa do Escritório (PJ)</p>
                <p className="text-[10px] text-amber-700 leading-tight">Marque esta opção se pagou essa despesa pessoal usando o cartão ou saldo PJ do escritório. Isso alertará a governança patrimonial.</p>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <label htmlFor="tx-notes" className="block text-xs font-semibold text-slate-500">Observações adicionais (Opcional)</label>
            <textarea
              id="tx-notes"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 min-h-[60px] text-slate-700"
              placeholder="Número de processo, detalhes do cliente, parcelamento, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Form Actions Footer */}
          <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button
              id="cancel-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-250 text-slate-600 font-semibold text-xs rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              id="submit-modal-btn"
              type="submit"
              className="px-5 py-2 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              Salvar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
