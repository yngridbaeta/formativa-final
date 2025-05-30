import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import estilos from './Cadastros.module.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Aviso from "../Componentes/Aviso";

export function CadastroAmbiente() {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
    } = useForm();

    const [erroModalAberto, setErroModalAberto] = useState(false);
    const [mensagemErro, setMensagemErro] = useState('');
    const [professores, setProfessores] = useState([]);
    const [salas, setSalas] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [isSalaReservada, setIsSalaReservada] = useState(false);

    const navigate = useNavigate();

    const dataInicio = watch("dataInicio");
    const dataTermino = watch("dataTermino");
    const periodo = watch("periodo");
    const salaReservada = watch("salaReservada");
    const professor = watch("professor");

    const disciplinasFiltradas = disciplinas.filter(d => d.professor === Number(professor));

    const verificarReserva = async () => {
        if (salaReservada && dataInicio && dataTermino && periodo) {
            try {
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0); // zera horas para comparar só a data
    
                const inicio = new Date(dataInicio);
                const termino = new Date(dataTermino);
    
                if (inicio < hoje || termino < hoje) {
                    setMensagemErro("As datas não podem ser anteriores ao dia atual.");
                    setErroModalAberto(true);
                    setIsSalaReservada(true);
                    return;
                }
    
                if (termino < inicio) {
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

    useEffect(() => {
        const fetchProfessores = async () => {
            try {
                const token = localStorage.getItem("access");
                const response = await axios.get('http://127.0.0.1:8000/api/funcionario/', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const professoresFiltrados = response.data.filter(prof => prof.categoria === 'P');
                setProfessores(professoresFiltrados);
            } catch (error) {
                console.error('Erro ao buscar professores:', error);
            }
        };
        fetchProfessores();
    }, []);

    useEffect(() => {
        const fetchSalas = async () => {
            try {
                const token = localStorage.getItem("access");
                const response = await axios.get('http://127.0.0.1:8000/api/sala/', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setSalas(response.data);
            } catch (error) {
                console.error('Erro ao buscar salas:', error);
            }
        };
        fetchSalas();
    }, []);

    useEffect(() => {
        const fetchDisciplinas = async () => {
            try {
                const token = localStorage.getItem("access");
                const response = await axios.get('http://127.0.0.1:8000/api/disciplina/', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setDisciplinas(response.data);
            } catch (error) {
                console.error('Erro ao buscar disciplinas:', error);
            }
        };
        fetchDisciplinas();
    }, []);

    const onSubmit = async (data) => {
        const { dataInicio, dataTermino, periodo, salaReservada, professor, disciplina } = data;
        const token = localStorage.getItem("access");

        try {
            await axios.post(
                'http://localhost:8000/api/ambiente/',
                {
                    dataInicio,
                    dataTermino,
                    periodo,
                    salaReservada,
                    professor,
                    disciplina
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            navigate('/ambientes');
        } catch (error) {
            const msg =
                error.response?.data?.erro ||
                error.response?.data?.detail ||
                "Erro ao cadastrar reserva.";
            setMensagemErro(msg);
            setErroModalAberto(true);
        }
    };

    return (
        <div className={estilos.container}>
            <form className={estilos.formulario} onSubmit={handleSubmit(onSubmit)}>
                <h2>Reserva de Ambiente</h2>

                <label className={estilos.periodoLabel}>Selecione o dia de início</label>
                <input
                    type="date"
                    {...register("dataInicio", { required: true })}
                    className={estilos.input}
                />

                <label className={estilos.periodoLabel}>Selecione o dia de fim</label>
                <input
                    type="date"
                    {...register("dataTermino", { required: true })}
                    className={estilos.input}
                />

                <select
                    {...register("salaReservada", { required: true })}
                    className={estilos.input}
                >
                    <option value="">Selecione uma sala</option>
                    {salas.map((s) => (
                        <option key={s.id} value={s.id}>{s.nome}</option>
                    ))}
                </select>

                <div className={estilos.periodoContainer}>
                    <label className={estilos.periodoLabel}>Selecione o período:</label>
                    <div className={estilos.botoesPeriodo}>
                        {["Manhã", "Tarde", "Noite"].map((opcao) => (
                            <button
                                type="button"
                                key={opcao}
                                className={`${estilos.botaoPeriodo} ${periodo === opcao ? estilos.ativo : ''}`}
                                onClick={() => setValue("periodo", opcao)}
                            >
                                {opcao}
                            </button>
                        ))}
                    </div>
                </div>

                <select
                    {...register("professor", { required: true })}
                    className={estilos.input}
                >
                    <option value="">Selecione um professor</option>
                    {professores.map((p) => (
                        <option key={p.id} value={p.id}>{p.username}</option>
                    ))}
                </select>

                <select
                    {...register("disciplina", { required: true })}
                    className={estilos.input}
                >
                    <option value="">Selecione uma disciplina</option>
                    {disciplinasFiltradas.map((d) => (
                        <option key={d.id} value={d.id}>{d.nome}</option>
                    ))}
                </select>

                <div className={estilos.divBotao}>
                    <button
                        type="submit"
                        className={`${estilos.botao} ${isSalaReservada ? estilos.botaoIndisponivel : ''}`}
                        disabled={isSalaReservada}
                    >
                        Reservar Ambiente
                    </button>
                </div>
            </form>

            <Aviso
                isOpen={erroModalAberto}
                onClose={() => setErroModalAberto(false)}
                titulo="Erro ao reservar ambiente"
                mensagem={mensagemErro}
            />
        </div>
    );
}
