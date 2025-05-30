import estilos from './Rodape.module.css';

export function Rodape() {
    return (
        <footer className={estilos.rodape}>
            <div className={estilos.conteudo}>
                <p>© {new Date().getFullYear()} Todos os direitos reservados.</p>
            </div>
        </footer>
    );
}
