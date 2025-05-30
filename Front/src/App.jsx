import { BarraNavegacao } from "./Componentes/BarraNavegacao";
import { Cabecalho } from "./Componentes/Cabecalho";
import { Conteudo } from "./Componentes/Conteudo";
import { Rodape } from "./Componentes/Rodape";
import { Disciplinas } from "./Paginas/Disciplinas";  // Importe a página de disciplinas
import { Login } from "./Paginas/Login";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CadastroDisciplina } from "./Paginas/CadastroDisciplinas";
import { Menu } from "./Componentes/Menu";
import { Ambiente } from "./Paginas/Ambiente";
import { CadastroAmbiente } from "./Paginas/CadastroAmbiente";
import { Professores } from "./Paginas/Professores";
import { CadastroProfessor } from "./Paginas/CadastroProfessores";
import { Gestores } from "./Paginas/Gestores";
import { CadastroGestor } from "./Paginas/CadastroGestores";
import { Sala } from "./Paginas/Salas";
import { CadastroSala } from "./Paginas/CadastrarSala";

function App() {
  return (
    <Router>
      <BarraNavegacao />
      <Cabecalho />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/menu" element={<Menu />} /> 
        <Route path="/disciplinas" element={<Disciplinas />} /> 
        <Route path="/conteudo" element={<Conteudo />} /> 
        <Route path="/cadastroDisciplina" element={<CadastroDisciplina />} /> 
        <Route path="/ambientes" element={<Ambiente/>} />
        <Route path="/cadastroAmbiente" element={<CadastroAmbiente/>} />
        <Route path="/professores" element={<Professores/>} />
        <Route path="/cadastroProfessor" element={<CadastroProfessor/>} />
        <Route path="/gestores" element={<Gestores/>} />
        <Route path="/cadastroGestor" element={<CadastroGestor/>} />
        <Route path="/salas" element={<Sala/>} />
        <Route path="/cadastroSala" element={<CadastroSala/>} />
      </Routes>
      <Rodape />
    </Router>
  );
}

export default App;