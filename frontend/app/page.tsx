import React from 'react';

// Dados fictícios para simular o sistema em funcionamento
const guiasRecentes = [
  { id: '1', cliente: 'Lima Contabilidade', tipo: 'DAS', valor: 'R$ 1.250,00', vencimento: '20/06/2026', status: 'PAGO' },
  { id: '2', cliente: 'Clínica Sorriso Clean', tipo: 'DARF', valor: 'R$ 3.420,50', vencimento: '22/06/2026', status: 'PENDENTE' },
  { id: '3', cliente: 'TechVanguard SP', tipo: 'GPS', valor: 'R$ 890,00', vencimento: '25/06/2026', status: 'REVISÃO' },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#212529] font-sans antialiased">
      
      {/* Barra de Navegação Superior */}
      <nav className="bg-white border-b border-[#E9ECEF] px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-semibold tracking-tight text-[#1A2530]">
            AutoReminder <span className="text-[#D4AF37] font-medium">Contábil</span>
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-[#6C757D]">
          <span>Painel do Contador</span>
          <div className="w-8 h-8 rounded-full bg-[#E9ECEF] flex items-center justify-center font-semibold text-[#495057]">
            B
          </div>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto p-8 space-y-8">
        
        {/* Cabeçalho da Página */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-[#1A2530] tracking-tight">Visão Geral Operacional</h1>
            <p className="text-sm text-[#6C757D] mt-1">Acompanhe a extração de guias e o status dos lembretes em tempo real.</p>
          </div>
          <button className="bg-[#1A2530] text-white hover:bg-[#2C3E50] transition-colors px-5 py-2.5 rounded-lg text-sm font-medium tracking-wide shadow-sm">
            + Upload Novo Lote
          </button>
        </div>

        {/* Cards de Métricas - Lado a Lado */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#E9ECEF] shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-[#6C757D]">Guias Processadas</p>
            <p className="text-2xl font-semibold text-[#1A2530] mt-2">148</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#E9ECEF] shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-[#6C757D]">Aguardando Pagamento</p>
            <p className="text-2xl font-semibold text-[#1A2530] mt-2">32</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#E9ECEF] shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-[#6C757D]">Auditorias Concluídas</p>
            <p className="text-2xl font-semibold text-[#28A745] mt-2">112</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#E9ECEF] shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-[#6C757D]">Necessita Revisão</p>
            <p className="text-2xl font-semibold text-[#DC3545] mt-2">4</p>
          </div>
        </div>

        {/* Seção da Tabela Minimalista */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#E9ECEF]">
            <h3 className="font-semibold text-[#1A2530]">Últimas Guias Identificadas</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA] text-xs font-medium text-[#6C757D] uppercase tracking-wider border-b border-[#E9ECEF]">
                  <th className="px-6 py-3.5">Cliente</th>
                  <th className="px-6 py-3.5">Imposto</th>
                  <th className="px-6 py-3.5">Valor</th>
                  <th className="px-6 py-3.5">Vencimento</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9ECEF] text-sm text-[#495057]">
                {guiasRecentes.map((guia) => (
                  <tr key={guia.id} className="hover:bg-[#FBFBFB] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#1A2530]">{guia.cliente}</td>
                    <td className="px-6 py-4">{guia.tipo}</td>
                    <td className="px-6 py-4 font-mono">{guia.valor}</td>
                    <td className="px-6 py-4">{guia.vencimento}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium tracking-wide
                        ${guia.status === 'PAGO' ? 'bg-[#E8F5E9] text-[#2E7D32]' : ''}
                        ${guia.status === 'PENDENTE' ? 'bg-[#FFF3E0] text-[#E65100]' : ''}
                        ${guia.status === 'REVISÃO' ? 'bg-[#FFEBEE] text-[#C62828]' : ''}
                      `}>
                        {guia.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}