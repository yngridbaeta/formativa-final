import { useEffect, useState } from 'react';
import estilos from './Cadastros.module.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Aviso from '../Componentes/Aviso';

export function CadastroSala() {
    const [salas, setSalas] = useState([]);
    const [erroModalAberto, setErroModalAberto] = useState(false);
    const [mensagemErro, setMensagemErro] = useState('');
    const navigate = useNavigate();

    const { register, handleSubmit, reset } = useForm();

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

    const abrirModalErro = (msg) => {
        setMensagemErro(msg);
        setErroModalAberto(true);
    };

    const fecharModalErro = () => {
        setErroModalAberto(false);
        setMensagemErro('');
    };

    const onSubmit = async (data) => {
        const nomeInput = data.nome.trim().toLowerCase();

        // Verifica se já existe alguma sala com esse nome (ignorando case)
        const nomeExiste = salas.some(sala => sala.nome.toLowerCase() === nomeInput);

        if (nomeExiste) {
            abrirModalErro('Já existe uma sala cadastrada com esse nome.');
            return;
        }

        const token = localStorage.getItem("access");

        try {
            await axios.post(
                'http://localhost:8000/api/sala/',
                { nome: data.nome },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            reset();
            navigate('/salas');
        } catch (error) {
            console.error('Erro ao cadastrar Sala:', error);
            abrirModalErro('Erro ao cadastrar Sala. Por favor, tente novamente.');
        }
    };

    return (
        <div className={estilos.container}>
            <form className={estilos.formulario} onSubmit={handleSubmit(onSubmit)}>
                <h2 className={estilos.titulo}>Cadastro Sala</h2>

                <input
                    type="text"
                    placeholder="Nome da Sala"
                    {...register('nome', { required: true })}
                    className={estilos.input}
                />

                <div className={estilos.divBotao}>
                    <button type="submit" className={estilos.botao}>Cadastrar Sala</button>
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
