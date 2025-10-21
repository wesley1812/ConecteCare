import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { HeaderProps, LayoutProps } from "../types/interfaces";

// Componente Header
export function Header({ isMenuOpen, toggleMenu }: HeaderProps) {
  const location = useLocation();

  const navigation = [
    { name: "Início", href: "/" },
    { name: "Guia do Usuário", href: "/guia-usuario" },
    { name: "Quem Somos", href: "/quem-somos" },
    { name: "FAQ", href: "/faq" },
    { name: "Contato", href: "/contato" },
    { name: "Login", href: "/login" },
    { name: "Menu de Cadastro", href: "/cadastro" },
    // { name: "Menu do Cuidador", href: "/menu-cuidador" },
    { name: "Teleconsulta", href: "/teleconsulta" },
  ];

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              ConecteCare
            </Link>
          </div>

          {/* Responsividade para Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Esse botão é o de Hamburguer que vai no mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Menu da responsividade: Mobile */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={toggleMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    location.pathname === item.href
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

// Componente Footer
export function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p>&copy; 2025 ConecteCare. Todos os direitos reservados.</p>
          <p className="mt-2">Feito com 💙 pela nossa equipe.</p>
        </div>
      </div>
    </footer>
  );
};

export function Layout({ children }: LayoutProps) {
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



