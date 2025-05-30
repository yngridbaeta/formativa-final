import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";  
import ConfirmarExclusao from "../Componentes/Confirmarexclusao";
import Lixeira from '../assets/delete.png';
import Lapis from '../assets/pencil.png';
import estilos from './Salas.module.css';
import EditarDisciplina from "../Componentes/EditarDisciplina";
import Aviso from "../Componentes/Aviso";  // Importando o modal de erro

export function Disciplinas() {
  const [Disciplinas, setDisciplinas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); 
  const [itemToEdit, setItemToEdit] = useState(null); 
  const [erroModalAberto, setErroModalAberto] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [categoriaUsuario, setCategoriaUsuario] = useState(null);

  function parseJwt(token) {
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload); 
      return JSON.parse(decoded); 
    } catch (e) {
      console.error("Erro ao decodificar token:", e);
      return null;
    }
  }
  
  useEffect(() => {
    const token = localStorage.getItem("access");
  
    if (token) {
      const decoded = parseJwt(token);
      const userId = decoded?.user_id;
  
      axios.get("http://localhost:8000/api/disciplina/", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => setDisciplinas(response.data))
      .catch((error) => console.error("Erro ao carregar salas", error.response || error));
  
      if (userId) {
        axios.get("http://localhost:8000/api/funcionario/", {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          if (res.data && res.data.length > 0) {
            setCategoriaUsuario(res.data[0].categoria);
          } else {
            setCategoriaUsuario(null);
          }
        })
        .catch((err) => console.error("Erro ao buscar categoria do usuário", err.response || err));
      }
    } 
  }, []);

  const openModal = (id, nome) => {
    setItemToDelete({ id, nome });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false); 
    setItemToDelete(null); 
  };

  const openEditModal = (disciplina) => {
    setItemToEdit(disciplina);
    setIsEditModalOpen(true);
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setItemToDelete(null);
    setItemToEdit(null);
  };

  const confirmDelete = () => {
    const token = localStorage.getItem("access");
    axios
      .delete(`http://localhost:8000/api/disciplina/${itemToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setDisciplinas(Disciplinas.filter(d => d.id !== itemToDelete.id));
        closeModal();
      })
      .catch((error) => {
        setMensagemErro("Erro ao excluir disciplina.");
        setErroModalAberto(true);
        console.error("Erro ao excluir disciplina", error.response || error);
      });
  };

  const handleEditConfirm = (updateddisciplina) => {
    setDisciplinas(Disciplinas.map(d => d.id === updateddisciplina.id ? updateddisciplina : d));
    closeModals();
  };

  return (
    <div className={estilos.container}>
      <h2>Disciplinas</h2>

      {categoriaUsuario === 'G' &&
        <div className={estilos.botaoContainer}>
          <Link to="/cadastroDisciplina">
            <button className={estilos.botaoCadastro}>+ Nova Disciplina</button>
          </Link>
        </div>
      }

      <div className={estilos.tableContainer}>
        <table className={estilos.tabela}>
          <thead>
            <tr>
              <th>Disciplina</th>
              <th>Curso</th>
              <th>Carga Horaria</th>
              <th>Descrição</th>
              <th>Professor</th>
              {categoriaUsuario === 'G' && <th>Editar</th>}
              {categoriaUsuario === 'G' && <th>Excluir</th>}
            </tr>
          </thead>
          <tbody>
            {Disciplinas.length > 0 ? (
              Disciplinas.map((disciplina) => (
                <tr key={disciplina.id}>
                  <td>{disciplina.nome}</td>
                  <td>{disciplina.curso}</td>
                  <td>{disciplina.cargaHoraria} horas</td>
                  <td>{disciplina.descricao}</td>
                  <td>{disciplina.professor_nome}</td> 

                  {categoriaUsuario === 'G' && (
                    <td className={estilos.icone}>
                      <img
                        src={Lapis}
                        alt="Editar"
                        onClick={() => openEditModal(disciplina)}
                        className={estilos.editar}
                      />
                    </td>
                  )}
                  
                  {categoriaUsuario === 'G' && (
                    <td className={estilos.icone}>
                      <img
                        src={Lixeira}
                        alt="Excluir"
                        onClick={() => openModal(disciplina.id, disciplina.nome)}
                        className={estilos.lixeira}
                      />
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={categoriaUsuario === 'G' ? "7" : "5"} className={estilos.avisoNenhuma} style={{ textAlign: "center" }}>
                  Nenhuma disciplina cadastrada!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmarExclusao
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        itemName={itemToDelete ? itemToDelete.nome : ''}
      /> 

      <EditarDisciplina
        isOpen={isEditModalOpen}
        onClose={closeModals}
        onConfirm={handleEditConfirm}
        item={itemToEdit}
      />

      <Aviso
        isOpen={erroModalAberto}
        onClose={() => setErroModalAberto(false)}
        titulo="Erro"
        mensagem={mensagemErro}
      />
    </div>
  );
}
