import estilos from './Aviso.module.css';

// modal para avisos de erro ao usuário
export default function Aviso({ isOpen, onClose, titulo = "Aviso", mensagem }) {
    if (!isOpen) return null;

    return (
        <div className={estilos.overlay}>
            <div className={estilos.modal}>
                <h3>{titulo}</h3>
                <p>{mensagem}</p>
                <button onClick={onClose} className={estilos.button}>Fechar</button>
            </div>
        </div>
    );
}
