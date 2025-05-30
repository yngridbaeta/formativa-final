import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ConfirmarExclusao from "../Componentes/Confirmarexclusao";
import Lixeira from '../assets/delete.png';
import Lapis from '../assets/pencil.png';
import estilos from './Salas.module.css';
import EditarProfessores from "../Componentes/EditarProfessores";

export function Professores() {
    const [Professores, setProfessores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
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
        
            axios.get("http://localhost:8000/api/funcionario/", {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then((response) => {
                setProfessores(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Erro ao carregar salas", error.response || error);
                setIsLoading(false);
            });
        
            if (userId) {
                axios.get(`http://localhost:8000/api/funcionario/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                .then((res) => setCategoriaUsuario(res.data.categoria))
                .catch((err) => console.error("Erro ao buscar categoria do usuário", err.response || err));
            }
        } else {
            setIsLoading(false);
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

    const openEditModal = (professor) => {
        setItemToEdit(professor);
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
            setProfessores(Professores.filter(p => p.id !== itemToDelete.id));
            closeModal();
        })
        .catch((error) => console.error("Erro ao excluir professor", error.response || error));
    };

    const handleEditConfirm = (updatedProfessor) => {
        setProfessores(Professores.map(p => p.id === updatedProfessor.id ? updatedProfessor : p));
        closeModals();
    };

    return (
        <div className={estilos.container}>
            <h2>Professores</h2>

            {categoriaUsuario === 'G' && (
                <div className={estilos.botaoContainer}>
                    <Link to="/cadastroProfessor">
                        <button className={estilos.botaoCadastro}>+ Novo Professor</button>
                    </Link>
                </div>
            )}

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
                            {categoriaUsuario === 'G' && <th>Editar</th>}
                            {categoriaUsuario === 'G' && <th>Excluir</th>}
                        </tr>
                    </thead>

                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="8" className={estilos.avisoNenhuma}  style={{ textAlign: "center" }} >
                                    Carregando dados...
                                </td>
                            </tr>
                        ) : Professores.filter((prof) => prof.categoria === "P").length > 0 ? (
                            Professores
                            .filter((prof) => prof.categoria === "P")
                            .map((professor, index) => (
                                <tr key={professor.id ?? `fallback-${index}`} className={estilos.professorCard}>
                                    <td>{professor.username}</td>
                                    <td>{professor.ni}</td>
                                    <td>{professor.email}</td>
                                    <td>{professor.telefone}</td>
                                    <td>{formatDate(professor.dataNascimento)}</td>
                                    <td>{formatDate(professor.dataContratacao)}</td>

                                    {categoriaUsuario === 'G' && (
                                        <td className={estilos.icone}>
                                            <img
                                                src={Lapis}
                                                alt="Editar"
                                                onClick={() => openEditModal(professor)}
                                                className={estilos.editar}
                                            />
                                        </td>
                                    )}

                                    {categoriaUsuario === 'G' && (
                                        <td className={estilos.icone}>
                                            <img
                                                src={Lixeira}
                                                alt="Excluir"
                                                onClick={() => openModal(professor.id, professor.username)}
                                                className={estilos.lixeira}
                                            />
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className={estilos.avisoNenhuma}  style={{ textAlign: "center" }}>
                                    Nenhum professor cadastrado.
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

            <EditarProfessores
                isOpen={isEditModalOpen}
                onClose={closeModals}
                onConfirm={handleEditConfirm}
                item={itemToEdit}
            />
        </div>
    );
}
