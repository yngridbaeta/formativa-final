import { useState } from 'react';
import estilos from './Cadastros.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export function Login() {
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:8000/api/login/', {
                username: nome,
                password: senha,
            });
            
            const { access } = response.data;
            localStorage.setItem('access', access); 

            

            navigate('/conteudo');

        } catch (error) {
            console.error('Erro ao fazer login:', error);
            alert('Credenciais inválidas!');
        }
    };

    return (
        <div className={estilos.container}>
            <form className={estilos.formulario} onSubmit={handleSubmit}>
                <h2 className={estilos.titulo}>Login</h2>
                <input
                    type="text"
                    placeholder="Usuário"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className={estilos.input}
                    required
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className={estilos.input}
                    required
                />
                <div className={estilos.divBotao}>
                    <button type="submit" className={estilos.botao}>Entrar</button>
                </div>
            </form>
        </div>
    );
}
