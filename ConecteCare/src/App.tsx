import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {Home} from './pages/Home';
import {QuemSomos} from './pages/QuemSomos';
import {FAQ} from './pages/FAQ';
import {Contato} from './pages/Contato';
import {Teleconsulta} from './pages/Teleconsulta'; 
import {MenuCuidador} from './pages/MenuCuidador';
import {GuiaDoUsuario} from './pages/GuiaUsuario';
import {Login} from './pages/Login';
import { MenuCadastro } from './pages/Cadastro';
import { CadastroProvider } from './context/cadastro-context';

function App() {
  return (
    <Router>
      <CadastroProvider>
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
            <Route path="/menu-cuidador" element={<MenuCuidador/>} />
          </Routes>
      </CadastroProvider>
    </Router>
  );
}

export default App;