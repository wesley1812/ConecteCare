import { useState, useEffect } from "react"; 
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { useCadastro } from "../context/cadastro-context";
import { PhoneIcon, MailIcon } from "../styles/icons";

export function Header({ isMenuOpen, toggleMenu }: any) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 
  const { cuidador: listaCuidadores, paciente: listaPacientes } = useCadastro(); 

  const navigation = [
    { name: "Início", href: "/" },
    { name: "Guia do Usuário", href: "/guia-usuario" },
    { name: "Quem Somos", href: "/quem-somos" },
    { name: "FAQ", href: "/faq" },
    { name: "Contatos", href: "/contato" }
  ];

  const actionNavigation = [
    { name: "Login", href: "/login", primary: false },
    { name: "Menu de Cadastro", href: "/cadastro", primary: true },
  ];

  const [painelUrl, setPainelUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState<boolean>(true); 

  useEffect(() => {
    if (user && listaCuidadores.length > 0 && listaPacientes.length > 0) {
      setIsLoadingUrl(true); 
      const isCuidador = listaCuidadores.some(c => c.email === user); 
      if (isCuidador) {
        setPainelUrl("/perfil-cuidador");
        console.log("Utilizador é Cuidador, URL:", "/perfil-cuidador");
      } else {
        const isPaciente = listaPacientes.some(p => p.email === user); 
        if (isPaciente) {
          setPainelUrl("/perfil-paciente"); 
          console.log("Utilizador é Paciente, URL:", "/perfil-paciente");
        } else {
          setPainelUrl(null); 
          console.warn("Utilizador logado não encontrado como Cuidador ou Paciente.");
        }
      }
      setIsLoadingUrl(false);
    } else if (user) {
      setIsLoadingUrl(true);
    } else {
      setPainelUrl(null);
      setIsLoadingUrl(false);
    }
  }, [user, listaCuidadores, listaPacientes]);


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

          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  to={painelUrl ?? '#'}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 shadow-lg
                              bg-cyan-500 text-white hover:bg-cyan-600
                              focus:outline-none focus:ring-4 focus:ring-cyan-300
                              ${isLoadingUrl || !painelUrl ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}
                            `}
                  onClick={(e) => { if (isLoadingUrl || !painelUrl) e.preventDefault(); }}
                >
                  {isLoadingUrl ? 'A carregar...' : 'Meu Painel'}
                </Link>

                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 shadow-lg
                              hover:cursor-pointer bg-red-600 text-white hover:bg-red-700
                              focus:outline-none focus:ring-4 focus:ring-red-300`}
                >
                  Sair (Logout)
                </button>
              </>
            ) : (
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

        {isMenuOpen && (
          <div className="lg:hidden absolute w-full left-0 bg-white shadow-xl pt-2 pb-4 border-t border-gray-100 z-50"> {/* Adicionado z-50 */}
            <div className="px-2 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={toggleMenu} 
                  className={`block mx-4 px-3 py-2 rounded-lg text-base font-semibold transition-colors ${location.pathname === item.href ? "text-white bg-blue-600 shadow-md" : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"}`}
                >
                  {item.name}
                </Link>
              ))}

              {user ? (
                <>
                  <Link
                    key="meu-painel-mobile"
                    to={painelUrl ?? '#'}
                    onClick={(e) => {
                      if (isLoadingUrl || !painelUrl) e.preventDefault();
                      else toggleMenu(); 
                    }}
                    className={`block mx-4 px-3 py-2 rounded-lg text-base font-semibold transition-colors
                                text-white bg-cyan-500 shadow-md hover:bg-cyan-600
                                ${isLoadingUrl || !painelUrl ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}
                              `}
                  >
                    {isLoadingUrl ? 'A carregar...' : 'Meu Painel'}
                  </Link>

                  <button
                    onClick={() => { handleLogout(); toggleMenu(); }}
                    className={`block w-[calc(100%-2rem)] text-left mx-4 px-3 py-2 rounded-lg text-base font-semibold text-white bg-red-600 hover:bg-red-700`} // Ajuste de largura
                  >
                    Sair (Logout)
                  </button>
                </>
              ) : (
                <>
                  {actionNavigation.map(item => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={toggleMenu} 
                      className={`block mx-4 px-3 py-2 rounded-lg text-base font-semibold transition-colors ${item.primary ? "text-white bg-cyan-500 shadow-md" : "text-blue-600 hover:bg-gray-100"}`}
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
              A plataforma de telemedicina focada em simplificar o cuidado...
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
  const toggleMenu = () => { setIsMenuOpen(!isMenuOpen); };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

