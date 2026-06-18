import React, { useState, useEffect } from "react";
import { Transaction, TransactionScope, TransactionType } from "./types";
import { INITIAL_TRANSACTIONS } from "./mockData";
import { 
  Plus, 
  HelpCircle, 
  Sparkles, 
  LayoutDashboard, 
  Briefcase, 
  FileSpreadsheet, 
  FileCheck2, 
  Scale, 
  CloudSun,
  Github,
  AlertTriangle,
  RotateCcw,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Save,
  Building
} from "lucide-react";

import DashboardStats from "./components/DashboardStats";
import CashFlowChart from "./components/CashFlowChart";
import CategoryPieChart from "./components/CategoryPieChart";
import AISeparator from "./components/AISeparator";
import TransactionList from "./components/TransactionList";
import MonthlyReport from "./components/MonthlyReport";
import NewTransactionModal from "./components/NewTransactionModal";
import ExpensePrioritizer from "./components/ExpensePrioritizer";
import { INITIAL_PRIORITY_BILLS } from "./mockData";
import { PriorityBill } from "./types";



const InlineLogin: React.FC<{onLogin: () => void}> = ({ onLogin }) => {
  const [pw, setPw] = React.useState("");
  const [err, setErr] = React.useState("");
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#1e293b", borderRadius: "16px", padding: "40px", width: "360px", border: "1px solid #334155" }}>
        <h1 style={{ color: "white", textAlign: "center", marginBottom: "8px" }}>Dantas & Associados</h1>
        <p style={{ color: "#64748b", textAlign: "center", marginBottom: "32px", fontSize: "14px" }}>Controle Financeiro</p>
        <form onSubmit={(e) => { e.preventDefault(); if (pw === "GD2026") { sessionStorage.setItem("gd_auth","true"); onLogin(); } else { setErr("Senha incorreta."); setPw(""); } }}>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Digite a senha" autoFocus
            style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", padding: "12px 16px", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box" as const }} />
          {err && <p style={{ color: "#f87171", fontSize: "13px", marginTop: "8px" }}>{err}</p>}
          <button type="submit" style={{ marginTop: "16px", width: "100%", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", padding: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    () => sessionStorage.getItem("gd_auth") === "true"
  );

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    sessionStorage.removeItem("gd_auth");
    setIsAuthenticated(false);
  };

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("oab_finance_ledger_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Erro ao carregar dados salvos:", e);
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [priorityBills, setPriorityBills] = useState<PriorityBill[]>(() => {
    const saved = localStorage.getItem("oab_priority_bills_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Erro ao carregar contas de priorização:", e);
      }
    }
    return INITIAL_PRIORITY_BILLS;
  });

  const [selectedMonth, setSelectedMonth] = useState<string>("2026-06"); // Defaults to June 2026
  const [activeTab, setActiveTab] = useState<"dashboard" | "ai" | "ledger" | "priorities" | "report">("priorities");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Profile customization states
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem("oab_user_name") || "Dr. Gustavo Dantas";
  });
  const [userOab, setUserOab] = useState<string>(() => {
    return localStorage.getItem("oab_user_oab") || "OAB/SP 123.456";
  });
  const [officeName, setOfficeName] = useState<string>(() => {
    return localStorage.getItem("oab_office_name") || "JURISFINANCE AI";
  });
  const [officeSub, setOfficeSub] = useState<string>(() => {
    return localStorage.getItem("oab_office_sub") || "DANTAS & ASSOCIADOS";
  });
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Sync with local storage
  useEffect(() => {
    localStorage.setItem("oab_finance_ledger_v1", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("oab_priority_bills_v1", JSON.stringify(priorityBills));
  }, [priorityBills]);

  const handleResetPriorityBills = () => {
    setConfirmModal({
      isOpen: true,
      title: "Redefinir Prioridades",
      message: "Deseja redefinir a lista de prioridades de despesas para as contas padrão (R$ 8.519,00 PAGAR / R$ 6.507,00 ESPERAR)?",
      onConfirm: () => {
        setPriorityBills(INITIAL_PRIORITY_BILLS);
      }
    });
  };

  const handleAddTransactions = (newItems: Omit<Transaction, "id">[]) => {
    const withIds = newItems.map((item) => ({
      ...item,
      id: "tx-" + Math.random().toString(36).substring(2, 11),
    }));
    setTransactions((prev) => [...withIds, ...prev]);
  };

  const handleSaveSingleTransaction = (item: Omit<Transaction, "id">) => {
    const withId = {
      ...item,
      id: "tx-" + Math.random().toString(36).substring(2, 11),
    };
    setTransactions((prev) => [withId, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Remover Lançamento",
      message: "Deseja realmente remover este lançamento de forma definitiva do seu livro caixa?",
      onConfirm: () => {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      }
    });
  };

  const handleResetData = () => {
    setConfirmModal({
      isOpen: true,
      title: "Restaurar Banco de Dados",
      message: "⚠️ Deseja restaurar a base de dados para o modelo demonstrativo inicial do escritório? Isso limpará de forma permanente todas as transações manuais criadas por você.",
      onConfirm: () => {
        setTransactions(INITIAL_TRANSACTIONS);
        setSelectedMonth("2026-06");
      }
    });
  };

  // Profile Save action
  const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newName = formData.get("p_name") as string;
    const newOab = formData.get("p_oab") as string;
    const newOffice = formData.get("p_office") as string;
    const newSub = formData.get("p_sub") as string;

    if (newName && newName.trim()) {
      setUserName(newName.trim());
      localStorage.setItem("oab_user_name", newName.trim());
    }
    if (newOab && newOab.trim()) {
      setUserOab(newOab.trim());
      localStorage.setItem("oab_user_oab", newOab.trim());
    }
    if (newOffice && newOffice.trim()) {
      setOfficeName(newOffice.trim().toUpperCase());
      localStorage.setItem("oab_office_name", newOffice.trim().toUpperCase());
    }
    if (newSub && newSub.trim()) {
      setOfficeSub(newSub.trim().toUpperCase());
      localStorage.setItem("oab_office_sub", newSub.trim().toUpperCase());
    }
    setIsEditProfileOpen(false);
  };

  // Navigation functions for previous and next fiscal months
  const handlePrevMonth = () => {
    if (selectedMonth === "ALL") {
      setSelectedMonth("2026-06");
      return;
    }
    const [year, month] = selectedMonth.split("-").map(Number);
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth === 0) {
      newMonth = 12;
      newYear = year - 1;
    }
    const newMonthStr = newMonth < 10 ? `0${newMonth}` : `${newMonth}`;
    setSelectedMonth(`${newYear}-${newMonthStr}`);
  };

  const handleNextMonth = () => {
    if (selectedMonth === "ALL") {
      setSelectedMonth("2026-06");
      return;
    }
    const [year, month] = selectedMonth.split("-").map(Number);
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth === 13) {
      newMonth = 1;
      newYear = year + 1;
    }
    const newMonthStr = newMonth < 10 ? `0${newMonth}` : `${newMonth}`;
    setSelectedMonth(`${newYear}-${newMonthStr}`);
  };

  // Generate expanded list of selectable months in order to satisfy viewing past & next months/years
  const generatedMonthsList = (() => {
    const monthsSet = new Set<string>();
    // Seed with all months of 2024, 2025, 2026, 2027
    const years = [2027, 2026, 2025, 2024];
    years.forEach((y) => {
      for (let m = 12; m >= 1; m--) {
        const mStr = m < 10 ? `0${m}` : `${m}`;
        monthsSet.add(`${y}-${mStr}`);
      }
    });
    // Add any manual dates outer range from transactions
    transactions.forEach((t) => {
      if (t.date && t.date.length >= 7) {
        monthsSet.add(t.date.substring(0, 7));
      }
    });
    return Array.from(monthsSet).sort().reverse();
  })();


  // Login gate
  if (!isAuthenticated) {
    return (
      <InlineLogin onLogin={handleLogin} />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col md:flex-row font-sans">
      {/* MOBILE ACTIONS HEADER BAR */}
      <div className="md:hidden bg-[#0f172a] text-white p-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-[#8b5cf6]" />
          <span className="font-bold text-xs uppercase tracking-wider font-display">{officeSub}</span>
        </div>
        <button 
          id="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 px-2 text-slate-300 hover:text-white transition-colors border border-slate-800 rounded bg-slate-900/60"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* PERSISTENT LEFT SIDEBAR FOR HIGH DENSITY THEME */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-[#0f172a] text-white flex flex-col p-4 border-r border-[#e2e8f0] transition-transform duration-300
        md:translate-x-0 md:static md:flex shrink-0 h-screen sticky top-0
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Sidebar Brand Header */}
        <div className="flex items-center gap-2.5 mb-6 border-b border-slate-800 pb-4">
          <div className="bg-[#8b5cf6]/20 p-2 rounded-lg text-[#8b5cf6] border border-[#8b5cf6]/30">
            <Scale className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-xs font-extrabold tracking-wider uppercase text-white font-display">{officeName}</h1>
            <p className="text-[9px] text-[#8b5cf6] font-bold tracking-widest font-mono">{officeSub}</p>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="space-y-1 flex-grow">
          {/* Dashboard Tab */}
          <button
            id="nav-tab-dashboard"
            onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-md text-xs font-semibold tracking-wide transition-all ${
              activeTab === "dashboard"
                ? "bg-white/10 text-white font-bold shadow-xs border-l-2 border-[#8b5cf6]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#2563eb]" />
            Dashboard Geral
          </button>

          {/* AI Reconciliation Tab */}
          <button
            id="nav-tab-ai"
            onClick={() => { setActiveTab("ai"); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-md text-xs font-semibold tracking-wide transition-all ${
              activeTab === "ai"
                ? "bg-white/10 text-white font-bold shadow-xs border-l-2 border-[#8b5cf6]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
            Conciliação com IA
          </button>

          {/* Ledger Tab */}
          <button
            id="nav-tab-ledger"
            onClick={() => { setActiveTab("ledger"); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-md text-xs font-semibold tracking-wide transition-all ${
              activeTab === "ledger"
                ? "bg-white/10 text-white font-bold shadow-xs border-l-2 border-[#8b5cf6]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-[#10b981]" />
            Livro Caixa (Ledger)
          </button>

          {/* Priorities Tab */}
          <button
            id="nav-tab-priorities"
            onClick={() => { setActiveTab("priorities"); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-md text-xs font-semibold tracking-wide transition-all ${
              activeTab === "priorities"
                ? "bg-white/10 text-white font-bold shadow-xs border-l-2 border-[#8b5cf6]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Briefcase className="w-4 h-4 text-orange-400" />
            Priorização de Contas
          </button>

          {/* Report Tab */}
          <button
            id="nav-tab-report"
            onClick={() => { setActiveTab("report"); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-md text-xs font-semibold tracking-wide transition-all ${
              activeTab === "report"
                ? "bg-white/10 text-white font-bold shadow-xs border-l-2 border-[#8b5cf6]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-[#ef4444]" />
            Relatório de Caixa
          </button>
        </nav>

        {/* Sidebar Footer Info */}
        <div className="mt-auto border-t border-slate-800 pt-3 text-[10px] text-slate-500 space-y-2.5">
          <button
            id="sidebar-edit-profile-action"
            onClick={() => { setIsEditProfileOpen(true); setMobileMenuOpen(false); }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 bg-violet-600/20 hover:bg-violet-600/35 text-violet-300 hover:text-white rounded text-[10px] font-bold border border-violet-700/30 font-sans cursor-pointer transition-all"
          >
            <Edit3 className="w-3 h-3" />
            Editar Nome / Escritório
          </button>
          
          <div className="space-y-0.5 leading-relaxed">
            <p className="font-bold text-slate-300">V1.4.2 - Licença Premium</p>
            <div className="flex items-center gap-1.5 text-violet-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>Sistema Operacional</span>
            </div>
          </div>
        </div>
      </aside>

      {/* BACKDROP FOR MOBILE DRAW MENU */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* RIGHT-HAND MAIN WORKING CONTAINER */}
      <div className="flex-grow flex flex-col min-w-0 min-h-screen">
        
        {/* NEW COHESIVE UPPER CONTROLLERS BAR inside content */}
        <header className="bg-white border-b border-[#e2e8f0] py-3 px-6 sticky top-0 z-30 shadow-xs">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Context Titles */}
            <div>
              <span className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-widest font-mono">Controladoria de Caixa</span>
              <h2 className="text-base font-bold text-[#1e293b] font-display flex items-center gap-1.5">
                {activeTab === "dashboard" && "Dashboard Geral • Visão Consolidada"}
                {activeTab === "ai" && "Conciliação & Alocação Inteligente com IA"}
                {activeTab === "ledger" && "Livro de Movimentações (Ledger)"}
                {activeTab === "priorities" && "Priorização de Contas (Pagar vs Esperar)"}
                {activeTab === "report" && "Relatório Mensal Legislativo & Fiscal"}
              </h2>
            </div>

            {/* Quick action controls for high density layout */}
            <div className="flex flex-wrap items-center gap-2.5 justify-end">
              
              {/* Competence dropdown with navigation arrows */}
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-md border border-[#e2e8f0]">
                <button
                  id="header-prev-month-btn"
                  onClick={handlePrevMonth}
                  disabled={selectedMonth === "ALL"}
                  className="p-1 hover:bg-slate-200 rounded text-slate-600 disabled:opacity-30 cursor-pointer transition-colors"
                  title="Mês Anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1.5 px-1.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">Período:</span>
                  <select
                    id="competence-select-header"
                    className="bg-transparent text-xs text-slate-800 font-bold focus:outline-hidden cursor-pointer"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    <option value="ALL">Todos os Períodos</option>
                    {generatedMonthsList.map((m) => {
                      const parts = m.split("-");
                      const ptMonths = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
                      const mLabel = `${ptMonths[parseInt(parts[1]) - 1]} de ${parts[0]}`;
                      return (
                        <option key={m} value={m}>
                          {mLabel}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button
                  id="header-next-month-btn"
                  onClick={handleNextMonth}
                  disabled={selectedMonth === "ALL"}
                  className="p-1 hover:bg-slate-200 rounded text-slate-600 disabled:opacity-30 cursor-pointer transition-colors"
                  title="Próximo Mês"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reset Seed Database with tooltip */}
              <button
                id="header-reset-btn"
                type="button"
                onClick={handleResetData}
                className="p-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-[#e2e8f0] rounded-md transition-all shadow-2xs cursor-pointer"
                title="Restaurar base simulada"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Add transaction trigger */}
              <button
                id="header-new-record-btn"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-bold rounded-md transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Lançar Movimentação
              </button>

              {/* User Profile Badge click-to-edit */}
              <button
                id="header-profile-btn"
                onClick={() => setIsEditProfileOpen(true)}
                className="hidden sm:flex items-center gap-2.5 border-l border-slate-200 pl-3.5 py-0.5 ml-1 text-left hover:opacity-85 transition-all cursor-pointer group"
                title="Clique para mudar o nome ou dados do escritório"
              >
                <div className="text-right">
                  <div className="text-[11px] font-bold text-slate-900 leading-tight group-hover:text-violet-700 transition-colors">{userName}</div>
                  <div className="text-[9px] text-[#64748b] font-medium leading-none flex items-center justify-end gap-0.5">
                    {userOab} 
                    <Edit3 className="w-2.5 h-2.5 text-slate-400 group-hover:text-violet-500" />
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6] font-bold text-xs flex items-center justify-center border border-[#8b5cf6]/20 shadow-2xs group-hover:bg-[#8b5cf6]/20 transition-all">
                  {userName ? userName.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase() : "GD"}
                </div>
              </button>

            </div>
          </div>
  
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-red-400 hover:bg-red-50 transition-all duration-200"
            title="Sair do sistema"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sair
          </button>
      </header>

        {/* DETAILED WORKSPACE VIEW AREA */}
        <main className="flex-grow p-4 lg:p-6 space-y-6">
        
        {/* VIEW 1: PANEL / CONTROLLER VIEW */}
        {activeTab === "dashboard" && (
          <div id="view-dashboard-container" className="space-y-6">
            
            {/* Indicators Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-l-4 border-indigo-600 pl-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Demonstrativo de Integração PJ/PF</h2>
                <p className="text-xs text-slate-500">Separador inteligente e monitor de mistura patrimonial para advogados titulares</p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono italic">Atualizado hoje às {new Date().toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'})}</span>
            </div>

            {/* Cards Stats Indicators */}
            <DashboardStats transactions={transactions} selectedMonth={selectedMonth} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <CashFlowChart transactions={transactions} />
              </div>
              <div className="xl:col-span-1">
                {/* Embedded quick guidelines card */}
                <div id="dashboard-guidelines-box" className="bg-slate-900 text-white rounded-xl border border-slate-800 p-5 shadow-xs space-y-4 flex flex-col justify-between h-full min-h-[340px]">
                  <div>
                    <h3 className="text-xs font-semibold text-indigo-400 tracking-wider uppercase flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Práticas de Blindagem Patrimonial
                    </h3>
                    <p className="text-xl font-bold mt-1 text-slate-100">Guarde seu caixa corporativo!</p>
                  </div>
                  
                  <div className="space-y-3.5 text-xs text-slate-300">
                    <p className="leading-relaxed">
                      Sua conta física deve ser o destino das retiradas de lucros. Evite pagar o colégio dos filhos ou compras de mercado diretamente pelo CNPJ do escritório.
                    </p>
                    <div className="bg-indigo-950/50 p-3 rounded-lg border border-indigo-900 text-[11px] text-indigo-300 leading-normal">
                      💡 <b>Dica de IA:</b> Cole seu extrato bancário semanal ou mensal na guia <b>Conciliação com IA</b> para separar os gastos irregulares de uma vez só.
                    </div>
                  </div>

                  <button
                    id="goto-ai-tab-btn"
                    onClick={() => setActiveTab("ai")}
                    className="w-full text-center py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    Ir para Separador com IA
                  </button>
                </div>
              </div>
            </div>

            {/* Bento Categories Distribuction */}
            <CategoryPieChart transactions={transactions} selectedMonth={selectedMonth} />
          </div>
        )}

        {/* VIEW 2: AI CONCILIATOR SCREEN */}
        {activeTab === "ai" && (
          <div id="view-ai-container" className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-l-4 border-indigo-600 pl-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Alocação por Inteligência Artificial</h2>
                <p className="text-xs text-slate-500">Mecanismo para processar extratos bancários e classificar dados sem digitação manual</p>
              </div>
            </div>

            <AISeparator onAddTransactions={handleAddTransactions} />
          </div>
        )}

        {/* VIEW 3: LEDGER INTEGRATED SYSTEM JOURNAL */}
        {activeTab === "ledger" && (
          <div id="view-ledger-container" className="space-y-6">
            <div className="flex justify-between items-center border-l-4 border-indigo-600 pl-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Livro de Movimentações (Ledger)</h2>
                <p className="text-xs text-slate-500">Demonstrativo geral das receitas e despesas registradas</p>
              </div>
            </div>

            <TransactionList
              transactions={transactions}
              selectedMonth={selectedMonth}
              onSetSelectedMonth={setSelectedMonth}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>
        )}

        {/* VIEW 4: MONTH CONSOLIDATED REPORT */}
        {activeTab === "report" && (
          <div id="view-report-container" className="space-y-6">
            <div className="flex justify-between items-center border-l-4 border-indigo-600 pl-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Relatório Consolidado para Contabilidade</h2>
                <p className="text-xs text-slate-500">Gere resumos analíticos prontos para exportar ou imprimir</p>
              </div>
            </div>

            <MonthlyReport transactions={transactions} selectedMonth={selectedMonth} />
          </div>
        )}

        {/* VIEW 5: ACCOUNT PRIORITIES MANAGEMENT PANEL */}
        {activeTab === "priorities" && (
          <div id="view-priorities-container" className="space-y-6">
            <div className="flex justify-between items-center border-l-4 border-indigo-600 pl-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Priorização de Despesas de Caixa</h2>
                <p className="text-xs text-slate-500">Despesas e obrigações de junho e meses anteriores: Pagar vs Esperar</p>
              </div>
            </div>

            <ExpensePrioritizer
              bills={priorityBills}
              onUpdateBills={setPriorityBills}
              onResetBills={handleResetPriorityBills}
              onAddTransactionToLedger={(item) => {
                const newTx: Transaction = {
                  id: "tx-pb-" + Math.random().toString(36).substring(2, 9),
                  date: item.date,
                  description: item.description,
                  type: TransactionType.EXPENSE,
                  scope: item.scope,
                  category: item.category,
                  amount: item.amount,
                  paymentMethod: "Outros",
                  notes: "Registrado via painel de priorização de despesas a pagar.",
                };
                setTransactions((prev) => [newTx, ...prev]);
              }}
            />
          </div>
        )}

      </main>

      {/* PERSISTENT MANUALLY MODAL FORM ENTRY */}
      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSingleTransaction}
      />

      {/* EDIT PROFILE MODAL */}
      {isEditProfileOpen && (
        <div id="edit-profile-modal" className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-150 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center bg-slate-950 text-white p-4">
              <div className="flex items-center gap-1.5 font-sans">
                <Building className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold tracking-tight">Personalização da Plataforma</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
                id="close-profile-modal-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">Nome do Advogado Titular / Proprietário</label>
                <input
                  type="text"
                  name="p_name"
                  defaultValue={userName}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-violet-500 font-sans text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">Documento Executivo (OAB ou CPF/CNPJ)</label>
                <input
                  type="text"
                  name="p_oab"
                  defaultValue={userOab}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-violet-500 font-sans text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">Razão Social / Nome Fantasia do Escritório PJ</label>
                <input
                  type="text"
                  name="p_office"
                  defaultValue={officeName}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-violet-500 font-mono text-slate-800 uppercase"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500">Assinatura Visual / Subnome Institucional</label>
                <input
                  type="text"
                  name="p_sub"
                  defaultValue={officeSub}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-violet-500 font-mono text-slate-800 uppercase"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SYSTEM SYSTEM FOOTER */}
      <footer className="bg-white border-t border-[#e2e8f0] py-4 px-6 text-xs text-[#64748b] mt-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-[#8b5cf6]" />
            <span>&copy; {new Date().getFullYear()} {officeSub} • Advocacia e Controladoria de Caixa. Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">Controle Patrimonial Integrado</span>
            <span className="text-[#8b5cf6] font-semibold flex items-center gap-1 font-mono">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              AI Powered
            </span>
          </div>
        </div>
      </footer>

      {/* Elegante Modal de Confirmação Customizado (substituto seguro do confirm do navegador) */}
      {confirmModal.isOpen && (
        <div id="custom-confirm-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-250 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-full bg-rose-50 text-rose-600 flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900">{confirmModal.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">{confirmModal.message}</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-1.5 hover:bg-slate-150 text-slate-500 hover:text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer bg-slate-100 border border-slate-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    confirmModal.onConfirm();
                  } catch (err) {
                    console.error("Erro ao executar confirmação:", err);
                  }
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-750 text-white font-bold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
