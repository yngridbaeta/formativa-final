import { useState } from 'react';
import estilos from './Cadastros.module.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Aviso from '../Componentes/Aviso';
import { validarFuncionario } from '../Validacoes/ValidarFuncionario';

export function CadastroGestor() {
  const [nome, setNome] = useState('');
  const [ni, setNi] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [dataContratacao, setDataContratacao] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [erroModalAberto, setErroModalAberto] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  const navigate = useNavigate();

  const abrirModalErro = (msg) => {
    setMensagemErro(msg);
    setErroModalAberto(true);
  };

  const fecharModalErro = () => {
    setErroModalAberto(false);
    setMensagemErro('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('access');

    const mensagem = await validarFuncionario({
      nome,
      username,
      registro: ni,
      email,
      telefone, 
      dataNascimento, 
      dataContratacao, 
      password, 
      token
    })

    if (mensagem){
      abrirModalErro(mensagem);
      return;
    }

    try {
      await axios.post(
        'http://localhost:8000/api/funcionario/',
        {
          username,
          password,
          nome,
          ni: parseInt(ni, 10),
          categoria: 'G', //gestor
          email,
          telefone,
          dataNascimento,
          dataContratacao,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate('/gestores');
    } catch (error) {
      abrirModalErro('Erro ao cadastrar gestor. Verifique os dados.');
      console.error('Erro ao cadastrar gestor', error);
    }
  };

  return (
    <div className={estilos.container}>
      <form className={estilos.formulario} onSubmit={handleSubmit}>
        <h2 className={estilos.titulo}>Cadastro de Gestor</h2>

        <label>Nome de Usuário</label>
        <input
          type="text"
          placeholder="Nome de usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={estilos.input}
          required
        />

        <label>Senha</label>
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={estilos.input}
          required
        />

        <label>Nome do Gestor</label>
        <input
          type="text"
          placeholder="Nome do gestor"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className={estilos.input}
          required
        />

        <label>Número de Identificação</label>
        <input
          type="number"
          placeholder="Número de Identificação (NI)"
          value={ni}
          onChange={(e) => setNi(e.target.value)}
          className={estilos.input}
          required
        />

        <label>Endereço de E-mail</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={estilos.input}
          required
        />

        <label>Telefone</label>
        <input
          type="text"
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className={estilos.input}
          required
        />

        <label>Data de Nascimento</label>
        <input
          type="date"
          placeholder="Data de Nascimento"
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
          className={estilos.input}
          required
        />

        <label>Data de Contratação</label>
        <input
          type="date"
          placeholder="Data de Contratação"
          value={dataContratacao}
          onChange={(e) => setDataContratacao(e.target.value)}
          className={estilos.input}
          required
        />

        <div className={estilos.divBotao}>
          <button type="submit" className={estilos.botao}>Cadastrar Gestor</button>
        </div>
      </form>

      <Aviso
        isOpen={erroModalAberto}
        onClose={fecharModalErro}
        titulo="Erro"
        mensagem={mensagemErro}
      />
    </div>
  );
}
