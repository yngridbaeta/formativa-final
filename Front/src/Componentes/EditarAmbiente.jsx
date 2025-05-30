import React, { useState, useEffect } from "react";
import axios from "axios";
import estilos from './EditarSala.module.css';
import Aviso from "../Componentes/Aviso"; 
import { useForm } from "react-hook-form";


const EditarAmbiente = ({ isOpen, onClose, onConfirm, item }) => {
    const [dataInicio, setDataInicio] = useState('');
    const [dataTermino, setDataTermino] = useState('');
    const [periodo, setPeriodo] = useState('');
    const [salaReservada, setSala] = useState('');
    const [professor, setProfessor] = useState('');
    const [disciplina, setDisciplina] = useState('');

    const [salas, setSalas] = useState([]);
    const [professores, setProfessores] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);

    const [erroModalAberto, setErroModalAberto] = useState(false);
    const [mensagemErro, setMensagemErro] = useState('');
    const [isSalaReservada, setIsSalaReservada] = useState(false);
    const {
            register,
        } = useForm();

    const disciplinasFiltradas = disciplinas.filter(d => d.professor === Number(professor));

    const periodosDisponiveis = [
        { id: 'Manhã', nome: 'Manhã' },
        { id: 'Tarde', nome: 'Tarde' },
        { id: 'Noite', nome: 'Noite' },
    ];

    useEffect(() => {
        if (isOpen && item) {
            setDataInicio(item.dataInicio ?? '');
            setDataTermino(item.dataTermino ?? '');
            setPeriodo(item.periodo ?? '');

            if (item.professor) {
                const profId = typeof item.professor === 'object' ? item.professor.id : item.professor;
                setProfessor(profId?.toString() ?? '');
            }

            if (item.disciplina) {
                const discId = typeof item.disciplina === 'object' ? item.disciplina.id : item.disciplina;
                setDisciplina(discId?.toString() ?? '');
            }

            if (item.salaReservada) {
                const salaId = typeof item.salaReservada === 'object' ? item.salaReservada.id : item.salaReservada;
                setSala(salaId?.toString() ?? '');
            }
        }
    }, [isOpen, item, professores, disciplinas, salas]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("access");

                const [profResponse, salaResponse, discResponse] = await Promise.all([
                    axios.get('http://127.0.0.1:8000/api/funcionario/', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://127.0.0.1:8000/api/sala/', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://127.0.0.1:8000/api/disciplina/', { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                setProfessores(profResponse.data.filter(p => p.categoria === 'P'));
                setSalas(salaResponse.data);
                setDisciplinas(discResponse.data);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            }
        };
        fetchData();
    }, []);

    const verificarReserva = async () => {
        if (salaReservada && dataInicio && dataTermino && periodo) {
            try {
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0); // zera horas para comparar só a data
    
                const inicio = new Date(dataInicio);
                const termino = new Date(dataTermino);

                inicio.setHours(0, 0, 0, 0); 
                termino.setHours(0, 0, 0, 0); 

    
                if (inicio < hoje || termino < hoje) {
                    setMensagemErro("As datas não podem ser anteriores ao dia atual.");
                    setErroModalAberto(true);
                    setIsSalaReservada(true);
                    return;
                }
    
                if (inicio >= termino) {
                    setMensagemErro("A data de início deve ser anterior à data de término.");
                    setErroModalAberto(true);
                    setIsSalaReservada(true);
                    return;
                }
    
                const token = localStorage.getItem("access");
                const response = await axios.get('http://127.0.0.1:8000/api/ambiente/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
    
                const salaReservadaNoPeriodo = response.data.some(reserva =>
                    reserva.id !== item.id &&
                    reserva.salaReservada === parseInt(salaReservada) &&
                    new Date(reserva.dataInicio).toDateString() === inicio.toDateString() &&
                    reserva.periodo === periodo
                );
    
                if (salaReservadaNoPeriodo) {
                    setMensagemErro("A sala já está reservada para este período.");
                    setErroModalAberto(true);
                    setIsSalaReservada(true);
                } else {
                    setIsSalaReservada(false);
                }
            } catch (error) {
                console.error('Erro ao verificar reserva:', error);
            }
        }
    };

    useEffect(() => {
        verificarReserva();
    }, [salaReservada, dataInicio, dataTermino, periodo]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("access");
    
        if (isSalaReservada) return;
    
        const payload = {
            dataInicio,
            dataTermino,
            periodo,
            salaReservada: parseInt(salaReservada),
            professor: parseInt(professor),
            disciplina: parseInt(disciplina)
        };
    
    
        try {
            const response = await axios.put(
                `http://localhost:8000/api/ambiente/${item.id}`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            onConfirm(response.data);
            onClose();
        } catch (error) {
            console.error("Erro na requisição:", error);
            console.error("Resposta do erro:", error.response?.data);
        
            const erroData = error.response?.data;
            let msg = "Erro ao editar reserva.";
        
            if (erroData) {
                if (erroData.non_field_errors) {
                    msg = erroData.non_field_errors.join(', ');
                } else if (erroData.detail) {
                    msg = erroData.detail;
                } else if (erroData.erro) {
                    msg = erroData.erro;
                } else if (erroData.professor) {
                    msg = erroData.professor;
                } else if (erroData.salaReservada) {
                    msg = erroData.salaReservada;
                } else if (erroData.disciplina) {
                    msg = erroData.disciplina;
                }
            }
        
            setMensagemErro(msg);
            setErroModalAberto(true);
        }
    }        
    

    if (!isOpen) return null;

    return (
        <div className={estilos.overlay}>
            <div className={estilos.modal}>
                <h3>Editar Reserva</h3>
                <form onSubmit={handleSubmit}>
                    <div className={estilos.formGroup}>
                        <label htmlFor="dataInicio">Data de Início:</label>
                        <input
                            id="dataInicio"
                            type="date"
                            value={dataInicio}
                            onChange={(e) => setDataInicio(e.target.value)}
                            required
                        />

                        <label htmlFor="dataTermino">Data de Término:</label>
                        <input
                            id="dataTermino"
                            type="date"
                            value={dataTermino}
                            onChange={(e) => setDataTermino(e.target.value)}
                            required
                        />

                        <label htmlFor="periodo">Período:</label>
                        <select
                            id="periodo"
                            value={periodo}
                            onChange={(e) => setPeriodo(e.target.value)}
                            className={estilos.input}
                            required
                        >
                            <option value="">Selecione um período</option>
                            {periodosDisponiveis.map((p) => (
                                <option key={p.id} value={p.nome}>{p.nome}</option>
                            ))}
                        </select>

                        <label htmlFor="sala">Sala:</label>
                        <select
                            id="sala"
                            value={salaReservada}
                            onChange={(e) => setSala(e.target.value)}
                            className={estilos.input}
                            required
                        >
                            <option value="">Selecione uma sala</option>
                            {salas.map((s) => (
                                <option key={s.id} value={s.id}>{s.nome}</option>
                            ))}
                        </select>

                        <label htmlFor="professor">Professor:</label>
                        <select
                            id="professor"
                            value={professor}
                            onChange={(e) => setProfessor(e.target.value)}
                            className={estilos.input}
                            required
                        >
                            <option value="">Selecione um professor</option>
                            {professores.map((p) => (
                                <option key={p.id} value={p.id}>{p.username}</option>
                            ))}
                        </select>

                        <label htmlFor="disciplina">Disciplina:</label>
                        <select
                        id="disciplina"
                        value={disciplina}
                        onChange={(e) => setDisciplina(e.target.value)}
                        className={estilos.input}
                        required
                        >
                        <option value="">Selecione uma disciplina</option>
                        {disciplinasFiltradas.map((d) => (
                            <option key={d.id} value={d.id}>{d.nome}</option>
                        ))}
                        </select>
                    </div>

                    <div className={estilos.buttons}>

                        <button type="button" onClick={onClose} className={estilos.cancelButton}>
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className={`${estilos.confirmButton} ${isSalaReservada ? estilos.botaoIndisponivel : ''}`}
                            disabled={isSalaReservada}>
                            Salvar
                        </button>
                       
                    </div>
                </form>

                <Aviso
                    isOpen={erroModalAberto}
                    onClose={() => setErroModalAberto(false)}
                    titulo="Erro ao editar ambiente"
                    mensagem={mensagemErro}
                />
            </div>
        </div>
    );
};

export default EditarAmbiente;
