import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { QuemSomos } from './pages/QuemSomos';
import { FAQ } from './pages/FAQ';
import { Contato } from './pages/Contato';
import { Teleconsulta } from './pages/Teleconsulta';
import { GuiaDoUsuario } from './pages/GuiaUsuario';
import { Login } from './pages/Login';
import { MenuCadastro } from './pages/Cadastro';
import { CadastroProvider } from './context/cadastro-context';
import { ConsultasProvider } from './context/consultas-context';
import { AuthProvider } from './context/auth-context';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PerfilCuidador } from './pages/PerfilCuidador';
import { AtualizarPerfilCuidador } from './pages/AtualizarPerfilCuidador';
import { Dashboard } from './pages/Dashboard';
import { PerfilPaciente } from './pages/PerfilPaciente';
import { PerfilCompletoPaciente } from './pages/AtualizarPerfilPaciente';
import { MinhasConsultas } from './pages/MinhasConsultas';


function App() {
  return (
    <AuthProvider>
      <CadastroProvider>
        <ConsultasProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/guia-usuario" element={<GuiaDoUsuario />} />
              <Route path="/quem-somos" element={<QuemSomos />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/cadastro" element={<MenuCadastro navigate={function (): void {
              }} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/teleconsulta" element={<Teleconsulta />} />

              <Route path="/perfil-cuidador" element={
                <ProtectedRoute>
                  <PerfilCuidador />
                </ProtectedRoute>
              } />

              <Route path="/perfil-cuidador/atualizar-perfil-cuidador" element={
                <ProtectedRoute>
                  <AtualizarPerfilCuidador />
                </ProtectedRoute>
              } />

              <Route path="/perfil-paciente" element={
                <ProtectedRoute>
                  <PerfilPaciente />
                </ProtectedRoute>
              } />

              <Route path="/perfil-paciente/atualizar-perfil-paciente" element={
                <ProtectedRoute>
                  <PerfilCompletoPaciente />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/:id" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/teleconsulta" element={
                <ProtectedRoute>
                  <Teleconsulta />
                </ProtectedRoute>
              } />

              <Route path="/minhas-consultas/:id" element={
                <ProtectedRoute>
                  <MinhasConsultas/>
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </ConsultasProvider>
      </CadastroProvider>
    </AuthProvider>
  );
}

export default App;


