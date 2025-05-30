import { NavLink } from 'react-router-dom';
import estilos from './BarraNavegacao.module.css';

export function BarraNavegacao() {
    return (
        <nav className={estilos.conteiner}>
            <ul>
                <li><NavLink to="/conteudo" className={({ isActive }) => isActive ? estilos.active : undefined}>Home</NavLink></li>
                <li><NavLink to="/" className={({ isActive }) => isActive ? estilos.active : undefined}>Login</NavLink></li>
            </ul>
        </nav>
    );
}
