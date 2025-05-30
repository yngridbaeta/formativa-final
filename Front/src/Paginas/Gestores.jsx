import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ConfirmarExclusao from "../Componentes/Confirmarexclusao";
import Lixeira from '../assets/delete.png';
import Lapis from '../assets/pencil.png';
import estilos from './Salas.module.css';
import EditarGestores from "../Componentes/EditarGestores";

export function Gestores() {
    const [gestores, setGestores] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);

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
      
          // Carrega as salas
          axios.get("http://localhost:8000/api/funcionario/", {
            headers: { Authorization: `Bearer ${token}` }
          })
          .then((response) => setGestores(response.data))
          .catch((error) => console.error("Erro ao carregar salas", error.response || error));
      
          if (userId) {
            axios.get(`http://localhost:8000/api/funcionario/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            .then((res) => setCategoriaUsuario(res.data.categoria))
            .catch((err) => console.error("Erro ao buscar categoria do usuário", err.response || err));
          }
        } 
      }, []);

    const formatDate = (date) => {
        const options = { year: "numeric", month: "numeric", day: "numeric" };
        return new Date(date).toLocaleDateString("pt-BR", options);
    };

    const openModal = (id, nome) => {
        setItemToDelete({ id, nome });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setItemToDelete(null);
    };

    const openEditModal = (gestor) => {
        setItemToEdit(gestor);
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
        axios.delete(`http://localhost:8000/api/funcionario/${itemToDelete.id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
            setGestores(gestores.filter(g => g.id !== itemToDelete.id));
            closeModal();
        })
        .catch((error) => console.error("Erro ao excluir gestor", error.response || error));
    };

    const handleEditConfirm = (updatedGestor) => {
        setGestores(gestores.map(g => g.id === updatedGestor.id ? updatedGestor : g));
        closeModals();
    };

    return (
        <div className={estilos.container}>
            <h2>Gestores</h2>

            
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '80%', maxWidth: '900px', marginBottom: '10px' }}>
                <Link to="/cadastrogestor">
                    <button className={estilos.botaoCadastro}>+ Novo Gestor</button>
                </Link>
            </div>

            <div className={estilos.tableContainer}>
                <table className={estilos.tabela}>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Registro</th>
                            <th>Email</th>
                            <th>Telefone</th>
                            <th>Nascimento</th>
                            <th>Contratação</th>
                            <th>Editar</th>
                            <th>Excluir</th>
                        </tr>
                    </thead>

                    <tbody>
                        {gestores.length > 0 ? (
                            gestores
                                .filter((gestor) => gestor.categoria === "G")
                                .map((gestor, index) => (
                                    <tr key={gestor.id ?? `fallback-${index}`}>
                                        <td>{gestor.username}</td>
                                        <td>{gestor.ni}</td>
                                        <td>{gestor.email}</td>
                                        <td>{gestor.telefone}</td>
                                        <td>{formatDate(gestor.dataNascimento)}</td>
                                        <td>{formatDate(gestor.dataContratacao)}</td>
                                        <td className={estilos.icone}>
                                            <img
                                                src={Lapis}
                                                alt="Editar"
                                                onClick={() => openEditModal(gestor)}
                                                className={estilos.editar}
                                            />
                                        </td>
                                        <td className={estilos.icone}>
                                            <img
                                                src={Lixeira}
                                                alt="Excluir"
                                                onClick={() => openModal(gestor.id, gestor.username)}
                                                className={estilos.lixeira}
                                            />
                                        </td>
                                    </tr>
                                ))
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: "center" }}>Carregando dados...</td>
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

            <EditarGestores
                isOpen={isEditModalOpen}
                onClose={closeModals}
                onConfirm={handleEditConfirm}
                item={itemToEdit}
            />
        </div>
    );
}
