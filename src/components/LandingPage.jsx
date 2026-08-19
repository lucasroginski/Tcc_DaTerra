// =========================================================================
//              LANDINGPAGE.JSX - MODO VISITANTE (VITRINE DE ATRAÇÃO)
// =========================================================================
// O que faz: Renderiza a página institucional e promocional da plataforma.
// Por que foi implementado assim: Serve como a porta de entrada para usuários
// não cadastrados (Modo Visitante). Apresenta a marca, estatísticas locais, 
// a proposta de valor do projeto ("direto do produtor") e o modelo de 
// monetização SaaS (Planos VIP vs Grátis) de forma amigável e Mobile-First.

import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Leaf,
  LogIn,
  UserPlus,
  Sparkles,
  ShoppingBag,
  Store,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  HeartHandshake
} from 'lucide-react';

const LandingPage = () => {
  const { openAuthModal } = useAuth();

  return (
    <div className="min-h-screen bg-sage-50 text-gray-800 selection:bg-sage-200">

      
      {/* 1. Header da Landing Page */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sage-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          
          {/* Logo & Marca */}
          <div className="flex items-center gap-2.5">
            <div className="bg-sage-500 text-white p-2.5 rounded-2xl shadow-sm">
              <Leaf size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-sage-700 tracking-tight leading-none">
                DaTerra
              </h1>
              <p className="text-[10px] text-sage-600 font-bold tracking-wider">FEIRA DIGITAL REGIONAL</p>
            </div>
          </div>

          {/* Botões Superiores Lado a Lado */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => openAuthModal('login')}
              className="bg-sage-500 hover:bg-sage-600 active:bg-sage-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <LogIn size={16} />
              <span>Entrar</span>
            </button>

            <button
              onClick={() => openAuthModal('register')}
              className="bg-honey-500 hover:bg-honey-600 active:bg-honey-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <UserPlus size={16} />
              <span>Cadastrar-se</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="bg-gradient-to-br from-sage-700 via-sage-600 to-sage-800 text-white py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden shadow-xl rounded-b-[3rem]">
        
        {/* Decorative Texture Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#D4A373_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          
          <div className="inline-flex items-center gap-2 bg-honey-500/20 text-honey-300 border border-honey-400/30 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold backdrop-blur-md">
            <Sparkles size={16} className="text-honey-400" />
            <span>Conectando o Campo à Sua Mesa</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            A Feira Digital que Conecta <span className="text-honey-300">Microprodutores</span> aos Clientes Regionais
          </h1>

          <p className="text-sage-100 text-sm sm:text-lg max-w-3xl mx-auto leading-relaxed font-medium">
            O <strong>DaTerra</strong> elimina intermediários e aproxima quem produz com carinho de quem valoriza alimentos frescos, orgânicos e artesanais na nossa região.
          </p>

          {/* CTA Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={() => openAuthModal('register')}
              className="w-full sm:w-auto bg-honey-500 hover:bg-honey-600 active:bg-honey-700 text-white px-8 py-4 rounded-2xl text-sm font-extrabold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Criar Conta Grátis</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => openAuthModal('login')}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <LogIn size={18} />
              <span>Já Tenho Conta</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto border-t border-white/10 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-honey-300">100%</p>
              <p className="text-xs text-sage-200">Produtores Regionais</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-honey-300">15 Dias</p>
              <p className="text-xs text-sage-200">Gratuitos de Teste</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-2xl sm:text-3xl font-black text-honey-300">0%</p>
              <p className="text-xs text-sage-200">Taxas Escondidas</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. SEÇÃO "O QUE OFERECEMOS" */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-10">
        
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-xs font-bold text-sage-600 uppercase tracking-widest mb-1">Diferenciais da Plataforma</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-sage-900">
            Tudo o que Você Precisa em uma Feira Digital
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Desenvolvido para fortalecer a economia local com tecnologia acessível e prática.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-sage-100 hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sage-50 text-sage-600 flex items-center justify-center">
              <Leaf size={26} />
            </div>
            <h4 className="text-lg font-bold text-sage-900">Produtos Frescos &amp; Orgânicos</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Hortifruti colhido no dia, mel silvestre puro, queijos artesanais e quitutes locais com sabor autêntico da roça.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-sage-100 hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-honey-50 text-honey-600 flex items-center justify-center">
              <HeartHandshake size={26} />
            </div>
            <h4 className="text-lg font-bold text-sage-900">Compra Direta Sem Intermediários</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Conecte-se diretamente com o pequeno agricultor. Preços mais justos para quem compra e maior lucro para quem produz.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-sage-100 hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sage-50 text-sage-600 flex items-center justify-center">
              <TrendingUp size={26} />
            </div>
            <h4 className="text-lg font-bold text-sage-900">Gestão Simplificada Agrotech</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Controle de estoque fácil, frente de caixa intuitiva e relatórios de atividades dos clientes para o produtor rural.
            </p>
          </div>

        </div>
      </section>

      {/* 4. SEÇÃO "PLANOS & VIP" (Monetização SaaS) */}
      <section className="bg-white py-16 px-4 sm:px-6 border-y border-sage-100">
        <div className="max-w-6xl mx-auto space-y-10">
          
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-honey-50 text-honey-800 border border-honey-200 px-3 py-1 rounded-full text-xs font-bold mb-2">
              <Zap size={14} className="text-honey-600" />
              <span>Modelo de Negócio SaaS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-sage-900">
              Planos &amp; Monetização para Produtores
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Comece gratuitamente e expanda seu catálogo à medida que suas vendas crescem.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {/* Card Plano Grátis */}
            <div className="bg-sage-50/60 rounded-3xl p-8 border border-sage-200 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-sage-600 uppercase">Degustação</span>
                  <span className="bg-sage-200 text-sage-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    15 Dias Grátis
                  </span>
                </div>

                <h3 className="text-xl font-bold text-sage-900">Plano Grátis (Novo Produtor)</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-sage-900">R$ 0,00</span>
                  <span className="text-xs text-gray-500">/ nos primeiros 15 dias</span>
                </div>

                <ul className="mt-6 space-y-2.5 text-xs text-gray-700 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-sage-600 shrink-0" />
                    <span>Cadastro de até 10 produtos no estoque</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-sage-600 shrink-0" />
                    <span>Acesso à Vitrine Digital da região</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-sage-600 shrink-0" />
                    <span>Frente de caixa e controle de estoque</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => openAuthModal('register')}
                className="w-full bg-sage-500 hover:bg-sage-600 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors shadow-sm"
              >
                Experimentar 15 Dias Grátis
              </button>
            </div>

            {/* Card Plano VIP */}
            <div className="bg-gradient-to-b from-white to-honey-50/50 rounded-3xl p-8 border-2 border-honey-400 flex flex-col justify-between space-y-6 shadow-md relative">
              
              <div className="absolute -top-3.5 right-6 bg-honey-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow">
                Recomendado
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="text-honey-500" size={18} />
                  <span className="text-xs font-bold text-honey-700 uppercase">Assinatura Mensal</span>
                </div>

                <h3 className="text-xl font-bold text-sage-900">Plano VIP (Produtor Pro)</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-honey-600">R$ 10,00</span>
                  <span className="text-xs text-gray-500">/ mês</span>
                </div>

                <ul className="mt-6 space-y-2.5 text-xs text-gray-700 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-honey-600 shrink-0" />
                    <span>Catálogo VIP expandido na feira</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-honey-600 shrink-0" />
                    <span>Opção de comprar +10 produtos por R$ 5,00</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-honey-600 shrink-0" />
                    <span>Selo exclusivo de Produtor Verificado</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => openAuthModal('register')}
                className="w-full bg-honey-500 hover:bg-honey-600 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors shadow-md"
              >
                Cadastrar-se como Produtor VIP
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 5. FOOTER CALL-TO-ACTION */}
      <footer className="bg-sage-900 text-white py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Leaf size={24} className="text-honey-400" />
            <span className="text-xl font-black">DaTerra</span>
          </div>
          <p className="text-xs text-sage-300 max-w-md mx-auto">
            Fortalecendo a agricultura familiar regional com tecnologia simples, justa e moderna.
          </p>
          <p className="text-[11px] text-sage-400 pt-4 border-t border-sage-800">
            Projeto de TCC - Apresentação de Feira Digital Agrotech
          </p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
