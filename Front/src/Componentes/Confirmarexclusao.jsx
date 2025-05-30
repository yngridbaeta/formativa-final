import React from 'react';
import estilos from './ConfirmarExclusao.module.css'; // Arquivo de estilos em português

const ConfirmarExclusao = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null; // Não renderiza se o modal não estiver aberto

  return (
    <div className={estilos.overlay}>
      <div className={estilos.modal}>
        <h3>Tem certeza que deseja excluir {itemName}?</h3>
        <div className={estilos.buttons}>
          <button className={estilos.cancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button className={estilos.confirmButton} onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmarExclusao;
