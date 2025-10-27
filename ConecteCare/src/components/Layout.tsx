import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
// Supondo que seus ícones estejam em types/icons.tsx
import { PhoneIcon, MailIcon } from "../types/icons"; 

export function Header({ isMenuOpen, toggleMenu }: any) { 
  const location = useLocation();
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Início", href: "/" },
    { name: "Guia do Usuário", href: "/guia-usuario" },
    { name: "Quem Somos", href: "/quem-somos" },
    { name: "FAQ", href: "/faq" },
    { name: "Contato", href: "/contato" },
  ];

  const actionNavigation = [
    { name: "Login", href: "/login", primary: false },
    { name: "Menu de Cadastro", href: "/cadastro", primary: true },
  ];

  const handleLogout = () => {
    logout(); 
    navigate('/login');
  };

  return (
    <header className="bg-white sticky top-0 z-40 shadow-xl border-t-4 border-cyan-500">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20"> 
          <div className="flex items-center">
            <Link to="/" className="text-3xl font-black text-blue-700 tracking-tighter hover:text-cyan-500 transition-colors">
              ConecteCare
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 py-2 rounded-lg text-base font-semibold transition-all duration-200 ${location.pathname === item.href
                    ? "text-white bg-blue-600 shadow-md hover:bg-blue-700"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* --- BOTÕES CONDICIONAIS (DESKTOP) --- */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              // --- SE ESTIVER LOGADO ---
              <>
                {/* --- BOTÃO ADICIONADO --- */}
                <Link
                  to="/perfil-cuidador"
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 shadow-lg 
                              bg-cyan-500 text-white hover:bg-cyan-600
                              focus:outline-none focus:ring-4 focus:ring-cyan-300`}
                >
                  Meu Painel
                </Link>
                {/* --- FIM DA ADIÇÃO --- */}
                
                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 shadow-lg 
                              bg-red-600 text-white hover:bg-red-700
                              focus:outline-none focus:ring-4 focus:ring-red-300`}
                >
                  Sair (Logout)
                </button>
              </>
            ) : (
              // --- SE NÃO ESTIVER LOGADO ---
              <>
                {actionNavigation.map(item => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 shadow-lg ${item.primary
                        ? "bg-cyan-500 text-white hover:bg-cyan-600"
                        : "border border-blue-600 text-blue-600 hover:bg-blue-50"
                      }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </>
            )}
          </div>


          <div className="lg:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* --- MENU MOBILE CONDICIONAL --- */}
        {isMenuOpen && (
          <div className="lg:hidden absolute w-full left-0 bg-white shadow-xl pt-2 pb-4 border-t border-gray-100">
            <div className="px-2 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={toggleMenu}
                  className={`block mx-4 px-3 py-2 rounded-lg text-base font-semibold transition-colors ${location.pathname === item.href
                      ? "text-white bg-blue-600 shadow-md"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                // --- SE ESTIVER LOGADO (Mobile) ---
                <>
                  {/* --- BOTÃO ADICIONADO (Mobile) --- */}
                  <Link
                    key="meu-painel"
                    to="/perfil/cuidador"
                    onClick={toggleMenu}
                    className={`block mx-4 px-3 py-2 rounded-lg text-base font-semibold transition-colors 
                                text-white bg-cyan-500 shadow-md hover:bg-cyan-600`}
                  >
                    Meu Painel
                  </Link>
                  {/* --- FIM DA ADIÇÃO --- */}
                
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu(); 
                    }}
                    className={`block w-full text-left mx-4 px-3 py-2 rounded-lg text-base font-semibold 
                                text-white bg-red-600 hover:bg-red-700`}
                  >
                    Sair (Logout)
                  </button>
                </>
              ) : (
                // --- SE NÃO ESTIVER LOGADO (Mobile) ---
                <>
                  {actionNavigation.map(item => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={toggleMenu}
                      className={`block mx-4 px-3 py-2 rounded-lg text-base font-semibold transition-colors ${item.primary
                          ? "text-white bg-cyan-500 shadow-md"
                          : "text-blue-600 hover:bg-gray-100"
                        }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white border-t-4 border-cyan-500">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">

          <div>
            <h3 className="text-2xl font-black text-cyan-400 mb-3 tracking-tighter">ConecteCare</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto md:mx-0">
              A plataforma de telemedicina focada em simplificar o cuidado e a conexão entre pacientes, cuidadores e profissionais de saúde.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">Fale Conosco</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center justify-center md:justify-start">
                <PhoneIcon />
                <span className="ml-3">Central: +55 11 3053-5131</span>
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <MailIcon />
                <span className="ml-3">Suporte: ouvidoria@hcor.com.br</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">Acesso Rápido</h3>
            <ul className="space-y-2">
              <li><Link to="/guia-usuario" className="text-gray-400 hover:text-cyan-400 transition-colors">Guia do Usuário</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-cyan-400 transition-colors">Perguntas Frequentes</Link></li>
              <li><Link to="/login" className="text-gray-400 hover:text-cyan-400 transition-colors">Área do Cliente</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-10 pt-6 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-500">&copy; 2025 ConecteCare. Todos os direitos reservados.</p>
          <p className="mt-1 text-sm text-gray-500">Desenvolvido com 💙 pela Equipe TDSPX.</p>
        </div>

      </div>
    </footer>
  );
};

export function Layout({ children }: any) { 
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
