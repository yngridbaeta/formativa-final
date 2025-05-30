import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ConfirmarExclusao from "../Componentes/Confirmarexclusao";
import Lixeira from '../assets/delete.png';
import Lapis from '../assets/pencil.png';
import estilos from './Salas.module.css';
import EditarAmbiente from "../Componentes/EditarAmbiente";

export function Ambiente() {
    const [Ambientes, setAmbientes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);
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
      
          axios.get("http://localhost:8000/api/ambiente/", {
            headers: { Authorization: `Bearer ${token}` }
          })
          .then((response) => setAmbientes(response.data))
          .catch((error) => console.error("Erro ao carregar reservas de ambiente", error.response || error));
      
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
        setItemToDelete({id, nome});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setItemToDelete(null);
    };

    const openEditModal = (ambiente) => {
        setItemToEdit(ambiente)
        setIsEditModalOpen(true);
    };

    const closeModals = () => {
        setIsModalOpen(false);
        setIsEditModalOpen(false);
        setItemToDelete(null);
        setItemToEdit(null);
    }

    const formatarData = (dataISO) => {
        if (!dataISO) return '';
        const data = new Date(dataISO);
        return data.toLocaleDateString('pt-BR');
      };
      
    const confirmDelete = () => {
        const token = localStorage.getItem("access");
        axios
        .delete(`http://localhost:8000/api/ambiente/${itemToDelete.id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
        })
        .then(() => {
            setAmbientes(Ambientes.filter(ambiente => ambiente.id !== itemToDelete.id));
            closeModal();
        })
        .catch((error) => console.error("Erro ao excluir ambiente", error.response || error));
    };

    const handleEditConfirm = (updatedambiente) => {
        setAmbientes(Ambientes.map(ambiente => ambiente.id === updatedambiente.id ? updatedambiente : ambiente));
        closeModals();
    }


    return(
        <div className={estilos.container}>
            <h2>Reservas de Ambientes</h2>
       
            {categoriaUsuario === 'G' &&
                <div className={estilos.botaoContainer}>
                    <Link to="/cadastroAmbiente">
                        <button className={estilos.botaoCadastro}>+ Nova Reserva</button>
                    </Link>
                </div>
            }

            <div className={estilos.tableContainer}>
                <table className={estilos.tabela}>
                    <thead>
                        <tr>
                            <th>Início</th>
                            <th>Término</th>
                            <th>Período</th>
                            <th>Sala</th>
                            <th>Professor</th>
                            <th>Disciplina</th>
                            {categoriaUsuario === 'G' && <th>Editar</th>}
                            {categoriaUsuario === 'G' && <th>Excluir</th>}
                        </tr>
                    </thead>

                    <tbody>
                        {(Ambientes.length === 0) ? (
                            <tr>
                                <td
                                    colSpan={categoriaUsuario === 'G' ? 8 : 6}
                                    style={{ textAlign: 'center', padding: '20px', color: '#888' }}
                                >
                                    {categoriaUsuario === 'G' 
                                        ? "Não há reservas de ambiente cadastradas." 
                                        : "Você ainda não possui reservas de ambiente."
                                    }
                                </td>
                            </tr>
                        ) : (
                            Ambientes.map((ambiente) => (
                                <tr key={ambiente.id}>
                                    <td>{formatarData(ambiente.dataInicio)}</td>
                                    <td>{formatarData(ambiente.dataTermino)}</td>
                                    <td>{ambiente.periodo}</td>
                                    <td>{ambiente.salaReservada_nome}</td>
                                    <td>{ambiente.professor_nome}</td>
                                    <td>{ambiente.disciplina_nome}</td>

                                    {categoriaUsuario === 'G' && (
                                        <td className={estilos.icone}>
                                            <img 
                                                src={Lapis}
                                                alt="Editar"
                                                onClick={() => openEditModal(ambiente)}
                                                className={estilos.editar} 
                                            />
                                        </td>
                                    )}

                                    {categoriaUsuario === 'G' && (
                                        <td className={estilos.icone}>
                                            <img 
                                                src={Lixeira} 
                                                alt="Excluir"
                                                onClick={() => openModal(ambiente.id, ambiente.nome)}
                                                className={estilos.lixeira} 
                                            />
                                        </td>
                                    )}
                                </tr>
                            ))
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

            <EditarAmbiente
                isOpen={isEditModalOpen}
                onClose={closeModals}
                onConfirm={handleEditConfirm}
                item={itemToEdit}
            />
        </div>
    );
}
