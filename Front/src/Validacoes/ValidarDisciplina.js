export function validarNomeDisciplina(data, disciplinas = [], idAtual = null) {
    const { nome, curso, cargaHoraria, descricao, professor } = data;
  
    if (!nome || nome.trim() === '') {
      return { valido: false, mensagem: 'O campo Nome da Disciplina é obrigatório.' };
    }
    if (!curso || curso.trim() === '') {
      return { valido: false, mensagem: 'O campo Curso é obrigatório.' };
    }
    if (!cargaHoraria || isNaN(cargaHoraria) || cargaHoraria <= 0) {
      return { valido: false, mensagem: 'O campo Carga Horária deve ser um número maior que zero.' };
    }
    if (!descricao || descricao.trim() === '') {
      return { valido: false, mensagem: 'O campo Descrição é obrigatório.' };
    }
    if (!professor || professor === '') {
      return { valido: false, mensagem: 'Selecione um professor.' };
    }
  
    // Validação de nome duplicado ignorando o item atual
    const nomeInput = nome.trim().toLowerCase();
    const existe = disciplinas.some(
      (disciplina) =>
        disciplina.nome.toLowerCase() === nomeInput &&
        disciplina.id !== idAtual // ignora a própria disciplina que está sendo editada
    );
    if (existe) {
      return { valido: false, mensagem: 'Já existe uma disciplina cadastrada com esse nome.' };
    }
  
    return { valido: true };
  }
  