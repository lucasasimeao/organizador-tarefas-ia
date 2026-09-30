require('dotenv').config();

const crypto = require('node:crypto');
const express = require('express');
const path = require('node:path');
const {
  adicionarTarefa,
  listarTarefas,
  removerTarefa
} = require('./src/database');
const { classificarTarefa } = require('./src/ai');

const app = express();
const PORTA = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/tarefas', async (req, res) => {
  try {
    res.json(await listarTarefas());
  } catch (erro) {
    console.error('[ERRO] Falha ao listar tarefas:', erro.message);
    res.status(500).json({ erro: 'Não foi possível carregar as tarefas.' });
  }
});

app.post('/api/tarefas', async (req, res) => {
  const frase = typeof req.body?.frase === 'string' ? req.body.frase.trim() : '';

  if (!frase) {
    return res.status(400).json({ erro: 'Digite uma tarefa antes de enviar.' });
  }

  if (frase.length > 500) {
    return res.status(400).json({ erro: 'A tarefa deve ter no máximo 500 caracteres.' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ erro: 'A chave GROQ_API_KEY não foi configurada no arquivo .env.' });
  }

  try {
    const classificacao = await classificarTarefa(frase, process.env.GROQ_API_KEY);
    const tarefa = {
      id: crypto.randomUUID(),
      frase,
      ...classificacao,
      criadaEm: new Date().toISOString()
    };

    await adicionarTarefa(tarefa);
    console.log(`[OK] Tarefa criada em ${new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'medium' }).format(new Date())}: ${tarefa.titulo}`);
    return res.status(201).json(tarefa);
  } catch (erro) {
    console.error('[ERRO] Falha ao criar tarefa:', erro.message);
    return res.status(502).json({ erro: 'Não foi possível classificar a tarefa com a IA. Tente novamente.' });
  }
});

app.delete('/api/tarefas/:id', async (req, res) => {
  try {
    const removida = await removerTarefa(req.params.id);
    if (!removida) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    }

    console.log(`[OK] Tarefa removida: ${req.params.id}`);
    return res.status(204).send();
  } catch (erro) {
    console.error('[ERRO] Falha ao remover tarefa:', erro.message);
    return res.status(500).json({ erro: 'Não foi possível remover a tarefa.' });
  }
});

app.listen(PORTA, () => {
  console.log(`[OK] Sistema Operacional Pessoal disponível em http://localhost:${PORTA}`);
  console.log('[INFO] Fuso configurado para America/Sao_Paulo.');
});

app.get('/api/compromissos', async (req, res) => {
  try {
    const tarefas = await listarTarefas();
    const compromissos = tarefas
      .filter((tarefa) => tarefa.agendamento)
      .map((tarefa) => ({
        id: tarefa.id,
        tarefaId: tarefa.id,
        titulo: tarefa.titulo,
        inicio: tarefa.agendamento,
        contexto: tarefa.contexto,
        matriz: tarefa.matriz
      }));
    res.json(compromissos);
  } catch (erro) {
    console.error('[ERRO] Falha ao listar compromissos:', erro.message);
    res.status(500).json({ erro: 'Não foi possível carregar os compromissos.' });
  }
});
