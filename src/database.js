const fs = require('node:fs/promises');
const path = require('node:path');

const arquivoTarefas = path.join(__dirname, '..', 'tarefas.json');

async function garantirArquivo() {
  try {
    await fs.access(arquivoTarefas);
  } catch {
    await fs.writeFile(arquivoTarefas, '[]', 'utf8');
  }
}

async function listarTarefas() {
  await garantirArquivo();
  const conteudo = await fs.readFile(arquivoTarefas, 'utf8');

  try {
    const tarefas = JSON.parse(conteudo);
    return Array.isArray(tarefas) ? tarefas : [];
  } catch {
    throw new Error('O arquivo local de tarefas está inválido.');
  }
}

async function adicionarTarefa(tarefa) {
  const tarefas = await listarTarefas();
  tarefas.unshift(tarefa);
  await fs.writeFile(arquivoTarefas, JSON.stringify(tarefas, null, 2), 'utf8');
  return tarefa;
}

async function removerTarefa(id) {
  const tarefas = await listarTarefas();
  const tarefasAtualizadas = tarefas.filter((tarefa) => tarefa.id !== id);

  if (tarefasAtualizadas.length === tarefas.length) {
    return false;
  }

  await fs.writeFile(arquivoTarefas, JSON.stringify(tarefasAtualizadas, null, 2), 'utf8');
  return true;
}

module.exports = { listarTarefas, adicionarTarefa, removerTarefa };