export async function validarFuncionario({
    nome,
    username,
    registro,
    email,
    telefone,
    dataNascimento,
    dataContratacao,
    password,
    item = null,
    token
}) {
    // Campos obrigatórios
    if (!username || !nome || !registro || !email || !telefone || !dataNascimento || !dataContratacao) {
        return 'Preencha todos os campos obrigatórios.';
    }

    // Senha (apenas se fornecida)
    if (password && password.length < 6) {
        return 'A senha deve ter no mínimo 6 caracteres.';
    }

    // Telefone
    const telefoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
    if (!telefoneRegex.test(telefone)) {
        return 'Telefone inválido. Ex: (11)91234-5678';
    }

    // Datas
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    const contratacao = new Date(dataContratacao);
    const idade = hoje.getFullYear() - nascimento.getFullYear();

    if (idade < 18) return 'O funcionario deve ter pelo menos 18 anos.';
    if (nascimento >= hoje) return 'Data de nascimento deve ser uma data passada.';
    if (contratacao > hoje) return 'Data de contratação não pode ser uma data futura.';
    if (contratacao < nascimento) return 'Data de contratação não pode ser anterior à data de nascimento.';

    // Verificação de duplicidade
    try {
        // Se for edição, ignora o próprio item
        const idAtual = item?.id ?? null;

        // Verifica username
        if (!item || username !== item.username) {
            const resUser = await fetch(`http://localhost:8000/api/usuarios/?username=${username}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const dadosUser = await resUser.json();
            if (dadosUser.existe && (!idAtual || dadosUser.id !== idAtual)) {
                return 'Nome de usuário já está em uso.';
            }
        }

        // Verifica NI
        if (!item || parseInt(registro, 10) !== item.ni) {
            const resNi = await fetch(`http://localhost:8000/api/funcionario/?ni=${registro}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const dadosNi = await resNi.json();
            if (dadosNi.existe && (!idAtual || dadosNi.id !== idAtual)) {
                return 'Número de Identificação (NI) já está cadastrado.';
            }
        }
    } catch (err) {
        console.error('Erro na validação de duplicidade:', err);
        return 'Erro ao verificar dados no servidor.';
    }

    // Tudo certo
    return null;
}
