import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { useCadastro } from "../context/cadastro-context";
import { PhoneIcon, MailIcon } from "../styles/icons"; // Assume que este ficheiro existe

export function Header({ isMenuOpen, toggleMenu }: any) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Utilizador logado (email)
  const { cuidador: listaCuidadores, paciente: listaPacientes } = useCadastro(); // [cite: cadastro-context.tsx]

  const navigation = [
    { name: "Início", href: "/" },
    { name: "Guia do Utilizador", href: "/guia-usuario" },
    { name: "Quem Somos", href: "/quem-somos" },
    { name: "FAQ", href: "/faq" },
    { name: "Contato", href: "/contato" },
    { name: "Teleconsulta", href: "/teleconsulta" },
  ];

  const actionNavigation = [
    { name: "Login", href: "/login", primary: false },
    { name: "Menu de Cadastro", href: "/cadastro", primary: true },
  ];

  // Estados para URL do painel e tipo de utilizador
  const [painelUrl, setPainelUrl] = useState<string | null>(null);
  const [userType, setUserType] = useState<'cuidador' | 'paciente' | null>(null); // Novo estado
  const [isLoadingUrl, setIsLoadingUrl] = useState<boolean>(true);

  // Efeito para determinar a URL do painel E o tipo de utilizador
  useEffect(() => {
    if (user && listaCuidadores.length > 0 && listaPacientes.length > 0) {
      setIsLoadingUrl(true);
      let targetPatientId: string | null = null;
      let determinedUserType: 'cuidador' | 'paciente' | null = null;

      // 1. Verifica se é Cuidador
      const loggedInCuidador = listaCuidadores.find(c => c.email === user); // [cite: cadastro-context.tsx, auth-context.tsx]
      if (loggedInCuidador) {
        determinedUserType = 'cuidador'; // Define o tipo
        console.log("Utilizador é Cuidador.");
        const linkedPaciente = listaPacientes.find(p => p.cpfPaciente === loggedInCuidador.cpfPaciente); // [cite: cadastro-context.tsx, interfaces.ts]
        if (linkedPaciente) {
          targetPatientId = linkedPaciente.id;
          console.log("Paciente vinculado encontrado, ID:", targetPatientId);
        } else {
          console.warn(`Paciente vinculado não encontrado para o cuidador ${user}.`);
        }
      } else {
        // 2. Se não for cuidador, verifica se é Paciente
        const loggedInPaciente = listaPacientes.find(p => p.email === user); // [cite: cadastro-context.tsx, auth-context.tsx]
        if (loggedInPaciente) {
          determinedUserType = 'paciente'; // Define o tipo
          console.log("Utilizador é Paciente.");
          targetPatientId = loggedInPaciente.id; // ID do próprio paciente
          console.log("ID do Paciente:", targetPatientId);
        } else {
          determinedUserType = null; // Não encontrado
          console.warn("Utilizador logado não encontrado.");
        }
      }

      // 3. Define a URL do painel se um ID foi encontrado
      if (targetPatientId) {
        setPainelUrl(`/dashboard/${targetPatientId}`);
      } else {
        setPainelUrl(null); // Link desativado se não encontrar paciente
      }
      setUserType(determinedUserType); // Define o tipo de utilizador no estado
      setIsLoadingUrl(false);

    } else if (user) {
        setIsLoadingUrl(true); // Ainda a carregar listas
        setUserType(null); // Reseta o tipo enquanto carrega
    } else {
        // Utilizador não logado
        setPainelUrl(null);
        setUserType(null);
        setIsLoadingUrl(false);
    }
  }, [user, listaCuidadores, listaPacientes]);


  const handleLogout = () => {
    logout(); // [cite: auth-context.tsx]
    navigate('/login');
  };

  // Estilo base do botão de ação logado
  const loggedInButtonBaseStyle = "px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 shadow-lg focus:outline-none";

  return (
    <header className="bg-white sticky top-0 z-40 shadow-xl border-t-4 border-cyan-500">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-3xl font-black text-blue-700 tracking-tighter hover:text-cyan-500 transition-colors">
              ConecteCare
            </Link>
          </div>

          {/* Navegação Principal (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2">
            {navigation.map((item) => (
              <Link key={item.name} to={item.href} 
              className={`px-4 py-2 rounded-lg text-base font-semibold transition-all duration-200 ${location.pathname === item.href
                    ? "text-white bg-blue-600 shadow-md hover:bg-blue-700"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Botões de Ação (Desktop) */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              // Se estiver logado
              <>
                {/* Link "Meu Painel" (Comum a ambos) */}
                <Link
                  to={painelUrl ?? '#'}
                  className={`${loggedInButtonBaseStyle} bg-cyan-500 text-white hover:bg-cyan-600 focus:ring-4 focus:ring-cyan-300 ${isLoadingUrl || !painelUrl ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}
                  onClick={(e) => { if (isLoadingUrl || !painelUrl) e.preventDefault(); }}
                >
                  {isLoadingUrl ? 'A carregar...' : 'Meu Painel'}
                </Link>

                {/* *** BOTÃO ADICIONAL SÓ PARA PACIENTE *** */}
                {userType === 'paciente' && (
                  <Link
                    to="/meus-cuidadores" // Rota da nova página
                    className={`${loggedInButtonBaseStyle} bg-indigo-500 text-white hover:bg-indigo-600 focus:ring-4 focus:ring-indigo-300`}
                  >
                    Meus Cuidadores
                  </Link>
                )}

                {/* Botão Sair (Comum a ambos) */}
                <button
                  onClick={handleLogout}
                  className={`${loggedInButtonBaseStyle} hover:cursor-pointer bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-300`}
                >
                  Sair (Logout)
                </button>
              </>
            ) : (
              // Se NÃO estiver logado
              <>
                {actionNavigation.map(item => ( <Link key={item.name} to={item.href} /* ... (classes) ... */ > {item.name} </Link> ))}
              </>
            )}
          </div>

          {/* Botão Menu Mobile */}
          <div className="lg:hidden flex items-center">
             <button onClick={toggleMenu}className="p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {/* Ícone Hambúrguer/X */}
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
          <div className="lg:hidden absolute w-full left-0 bg-white shadow-xl pt-2 pb-4 border-t border-gray-100 z-50">
            <div className="px-2 space-y-2">
              {/* Links de Navegação Padrão */}
              {navigation.map((item) => ( <Link key={item.name} to={item.href} onClick={toggleMenu} /* ... (classes) ... */ > {item.name} </Link> ))}

              {/* Links de Ação Condicionais (Mobile) */}
              {user ? (
                // Se estiver logado
                <>
                  {/* Link "Meu Painel" (Mobile) */}
                  <Link
                    key="meu-painel-mobile"
                    to={painelUrl ?? '#'}
                    onClick={(e) => { if (isLoadingUrl || !painelUrl) e.preventDefault(); else toggleMenu(); }}
                    className={`block mx-4 px-3 py-2 rounded-lg text-base font-semibold transition-colors text-white bg-cyan-500 shadow-md hover:bg-cyan-600 ${isLoadingUrl || !painelUrl ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}
                  >
                    {isLoadingUrl ? 'A carregar...' : 'Meu Painel'}
                  </Link>

                  {/* *** BOTÃO ADICIONAL SÓ PARA PACIENTE (Mobile) *** */}
                  {userType === 'paciente' && (
                    <Link
                      key="meus-cuidadores-mobile"
                      to="/meus-cuidadores"
                      onClick={toggleMenu} // Fecha o menu
                      className={`block mx-4 px-3 py-2 rounded-lg text-base font-semibold transition-colors text-white bg-indigo-500 shadow-md hover:bg-indigo-600`}
                    >
                      Meus Cuidadores
                    </Link>
                  )}

                  {/* Botão Sair (Mobile) */}
                  <button
                    onClick={() => { handleLogout(); toggleMenu(); }}
                    className={`block w-[calc(100%-2rem)] text-left mx-4 px-3 py-2 rounded-lg text-base font-semibold text-white bg-red-600 hover:bg-red-700`}
                  >
                    Sair (Logout)
                  </button>
                </>
              ) : (
                // Se NÃO estiver logado
                <>
                  {actionNavigation.map(item => ( <Link key={item.name} to={item.href} onClick={toggleMenu} /* ... (classes) ... */ > {item.name} </Link> ))}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

// Footer (sem alterações)
export function Footer() {
    return (
    <footer className="bg-gray-900 text-white border-t-4 border-cyan-500">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
           {/* Conteúdo do Footer */}
           <div>
             <h3 className="text-2xl font-black text-cyan-400 mb-3 tracking-tighter">ConecteCare</h3>
             <p className="text-gray-400 text-sm max-w-sm mx-auto md:mx-0">
               A plataforma de telemedicina focada em simplificar o cuidado...
             </p>
           </div>
           <div>
             <h3 className="text-xl font-bold text-white mb-4">Fale Conosco</h3>
             <ul className="space-y-2 text-gray-400">
               <li className="flex items-center justify-center md:justify-start"> <PhoneIcon /> <span className="ml-3">Central: +55 11 3053-5131</span> </li>
               <li className="flex items-center justify-center md:justify-start"> <MailIcon /> <span className="ml-3">Suporte: ouvidoria@hcor.com.br</span> </li>
             </ul>
           </div>
           <div>
             <h3 className="text-xl font-bold text-white mb-4">Acesso Rápido</h3>
             <ul className="space-y-2">
               <li><Link to="/guia-usuario" className="text-gray-400 hover:text-cyan-400 transition-colors">Guia do Utilizador</Link></li>
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

// Layout (sem alterações na estrutura principal)
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

