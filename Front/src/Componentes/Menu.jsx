import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import estilos from './Menu.module.css';
import professoresIcon from '../assets/professor.png';
import gestoresIcon from '../assets/gestor.png';
import disciplinaIcon from '../assets/disciplina.png';
import salaIcon from '../assets/ambiente.png';
import ambienteIcon from '../assets/school.png';
import axios from "axios";

export function Menu() {
  const [categoriaUsuario, setCategoriaUsuario] = useState('');

  function parseJwt(token) {
    if (!token) return null;
    try {
      const base64 = token.split('.')[1];
      const jsonPayload = atob(base64);
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Erro ao decodificar token:", e);
      return null;
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (!token) {
      return;
    }

    const decoded = parseJwt(token);
    if (!decoded || !decoded.user_id) {
      return;
    }

    const userId = decoded.user_id;

    axios.get(`http://localhost:8000/api/funcionario/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
  
      setCategoriaUsuario(res.data.categoria || '');
    
    })
    .catch((err) => {
      console.error("Erro ao buscar categoria do usuário", err.response || err);
    });
  }, []);

  
  return (
    <div className={estilos.conteiner}>
      <div className={estilos.cardContainer}>
        <h2 className={estilos.titulo}>Categorias</h2>

        <div className={estilos.grid}>
          <Link to="/professores">
            <div className={estilos.item}>
              <img src={professoresIcon} alt="Professores" />
              <span>Professores</span>
            </div>
          </Link>

          {categoriaUsuario === 'G' && (
            <Link to="/gestores">
              <div className={estilos.item}>
                <img src={gestoresIcon} alt="Gestores" />
                <span>Gestores</span>
              </div>
            </Link>
          )}

          <Link to="/disciplinas">
            <div className={estilos.item}>
              <img src={disciplinaIcon} alt="Disciplina" />
              <span>Disciplinas</span>
            </div>
          </Link>

          <Link to="/ambientes">
            <div className={estilos.item}>
              <img src={ambienteIcon} alt="Ambiente" />
              <span>Reserva de Ambientes</span>
            </div>
          </Link>

          {categoriaUsuario === 'G' && (
            <Link to="/salas">
              <div className={estilos.item}>
                <img src={salaIcon} alt="Sala" />
                <span>Salas</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
