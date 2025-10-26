import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { QuemSomos } from './pages/QuemSomos';
import { FAQ } from './pages/FAQ';
import { Contato } from './pages/Contato';
import { Teleconsulta } from './pages/Teleconsulta'; 
import { MenuCuidador } from './pages/MenuCuidador';
import { GuiaDoUsuario } from './pages/GuiaUsuario';
import { Login } from './pages/Login';
import { MenuCadastro } from './pages/Cadastro';
import { CadastroProvider } from './context/cadastro-context';
import { AuthProvider } from './context/auth-context'; 
import { ProtectedRoute } from './routes/ProtectedRoute'; 
import { PerfilCuidador } from './pages/PerfilCuidador';
import { AtualizarPerfilCuidador } from './pages/AtualizarPerfilCuidador';

function App() {
  return (
    <AuthProvider> 
      <CadastroProvider>
        <Router>
          <Routes>
              <Route path="/" element={<Home/>} />
              <Route path="/guia-usuario" element={<GuiaDoUsuario/>} />
              <Route path="/quem-somos" element={<QuemSomos/>} />
              <Route path="/faq" element={<FAQ/>} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/cadastro" element={<MenuCadastro navigate={function (): void {
              } } />} />
              <Route path="/login" element={<Login/>} />
              <Route path="/teleconsulta" element={<Teleconsulta/>} /> 
              
              <Route path="/perfil-cuidador" element={
                <ProtectedRoute>
                  <PerfilCuidador/>
                </ProtectedRoute>
              } />

              {/* Rota para a página de ATUALIZAÇÃO de perfil */}
            <Route path="/perfil/cuidador/atualizar" element={
              <ProtectedRoute>
                <AtualizarPerfilCuidador />
              </ProtectedRoute>
            } />
            
            {/* Rota para o Menu do Cuidador (ver paciente) */}
            <Route path="/menu-cuidador/:id" element={
              <ProtectedRoute>
                <MenuCuidador />
              </ProtectedRoute>
            } />

            {/* Rota da Teleconsulta (precisa do ID) */}
            <Route path="/teleconsulta/:consultaId" element={
              <ProtectedRoute>
                <Teleconsulta/>
              </ProtectedRoute>
            } /> 



            </Routes>
        </Router>
      </CadastroProvider>
    </AuthProvider>
  );
}

export default App;


