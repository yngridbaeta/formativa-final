import React, { useState, useEffect } from "react";
import axios from "axios";
import estilos from './EditarSala.module.css'; 
import { validarFuncionario } from "../Validacoes/ValidarFuncionario";
import Aviso from "./Aviso";

const EditarGestores = ({ isOpen, onClose, onConfirm, item }) => {
    const [nome, setNome] = useState('');
    const [username, setUsername] = useState('');
    const [registro, setRegistro] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [dataContratacao, setDataContratacao] = useState('');
    const [password, setPassword] = useState('');

    const [erroModalAberto, setErroModalAberto] = useState(false);
    const [mensagemErro, setMensagemErro] = useState('');

    useEffect(() => {
        if (isOpen && item) {
            setNome(item.nome ?? '');
            setUsername(item.username ?? '');
            setRegistro(item.ni ?? '');
            setEmail(item.email ?? '');
            setTelefone(item.telefone ?? '');

            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                return date.toISOString().split('T')[0];
            };

            setDataNascimento(formatDate(item.dataNascimento));
            setDataContratacao(formatDate(item.dataContratacao));
            setPassword('');
        }
    }, [isOpen, item]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("access");

        const mensagemErro = await validarFuncionario({
            nome, 
            username,
            registro,
            email, 
            telefone,
            dataNascimento,
            dataContratacao,
            password,
            item,
            token
        });

        if(mensagemErro){
            setMensagemErro(mensagemErro);
            setErroModalAberto(true);
            return;
        }

        const payload = {
            nome,
            username,
            ni: parseInt(registro, 10),
            email,
            telefone,
            dataNascimento,
            dataContratacao,
            categoria: 'G',
        };

        if (password.trim() !== '') {
            payload.password = password;
        }

        try {
            const response = await axios.patch(
                `http://localhost:8000/api/funcionario/${item.id}`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            onConfirm(response.data);
            onClose();
        } catch (error) {
            console.error('Erro ao editar gestor', error.response?.data || error);
            let mensagem = 'Erro ao editar professor. Verifique os dados.'

            if (error.response && error.response.data){
                const data = error.response.data;
                if (data.ni) mensagem = data.ni.join(' ');
                else if (data.username) mensagem = data.username.join(' ');
                else if (data.password) mensagem = data.password.join(' ');
                else if (typeof data.detail === 'string') mensagem = data.detail;
                else mensagem = JSON.stringify(data);
            }
            setMensagemErro(mensagem)
            setErroModalAberto(true)
        }
    };

    if (!isOpen || !item) return null;

    return (
        <div className={estilos.overlay}>
            <div className={estilos.modal}>
                <h3>Editar Gestor</h3>
                <form onSubmit={handleSubmit}>
                    <div className={estilos.formGroup}>
                        <label htmlFor="nome">Nome:</label>
                        <input
                            id="nome"
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                        />

                        <label htmlFor="username">Username (Login):</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />

                        <label htmlFor="registro">Registro:</label>
                        <input
                            id="registro"
                            type="text"
                            value={registro}
                            onChange={(e) => setRegistro(e.target.value)}
                            required
                        />

                        <label htmlFor="email">Email:</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <label htmlFor="telefone">Telefone:</label>
                        <input
                            id="telefone"
                            type="tel"
                            value={telefone}
                            onChange={(e) => setTelefone(e.target.value)}
                            required
                        />

                        <label htmlFor="dataNascimento">Data de Nascimento:</label>
                        <input
                            id="dataNascimento"
                            type="date"
                            value={dataNascimento}
                            onChange={(e) => setDataNascimento(e.target.value)}
                            required
                        />

                        <label htmlFor="dataContratacao">Data de Contratação:</label>
                        <input
                            id="dataContratacao"
                            type="date"
                            value={dataContratacao}
                            onChange={(e) => setDataContratacao(e.target.value)}
                            required
                        />

                        <label htmlFor="password">Nova Senha (Deixe em branco se não quiser alterar):</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className={estilos.buttons}>
                        
                        <button type="button" onClick={onClose} className={estilos.cancelButton}>
                            Cancelar
                        </button>

                        <button type="submit" className={estilos.confirmButton}>
                            Salvar
                        </button>
                    </div>
                </form>

                <Aviso
                    isOpen={erroModalAberto}
                    onClose={() => setErroModalAberto(false)}
                    titulo="Erro"
                    mensagem={mensagemErro}    
                />
            </div>
        </div>
    );
};

export default EditarGestores;
