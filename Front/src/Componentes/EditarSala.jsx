import React, { useState, useEffect } from 'react';
import axios from 'axios';
import estilos from './EditarSala.module.css';
import Aviso from './Aviso';

const EditarSala = ({ isOpen, onClose, onConfirm, item, salas}) => {
  const [nome, setNome] = useState(item?.nome || '')
  const [erroModalAberto, setErroModalAberto] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');;

  useEffect(() => {
    if (item) {
      setNome(item.nome);
    }
  }, [item]);

 

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nomeInput = nome.trim().toLowerCase();

    const nomeExiste = salas.some(
      (sala) => sala.id !== item.id && sala.nome.toLowerCase() === nomeInput
    );

    if (nomeExiste) {
      abrirModalErro('Já existe uma sala cadastrada com esse nome.');
      return;
    }

    const token = localStorage.getItem("access");

    try {
      const response = await axios.put(
        `http://localhost:8000/api/sala/${item.id}`,
        { nome },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onConfirm(response.data);
    } catch (error) {
      console.error('Erro ao editar sala', error.response || error);
      abrirModalErro('Erro ao editar Sala. Por favor, tente novamente.');
    }
  };

  const abrirModalErro = (msg) => {
    setMensagemErro(msg);
    setErroModalAberto(true);
  };
  const fecharModalErro = () => {
    setErroModalAberto(false);
    setMensagemErro('');
  };
  if (!isOpen) return null;


  return (
    <>
      <div className={estilos.overlay}>
        <div className={estilos.modal}>
          <h3>Editar Sala</h3>
          <form onSubmit={handleSubmit}>
            <div className={estilos.formGroup}>
              <label htmlFor="nome">Nome da Sala</label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />

            </div>
            <div className={estilos.buttons}>
              <button type="button" className={estilos.cancelButton} onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className={estilos.confirmButton}>
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>

      
      <Aviso
        isOpen={erroModalAberto}
        onClose={fecharModalErro}
        titulo="Erro"
        mensagem={mensagemErro}

      />

    </>
  );
};

export default EditarSala;
