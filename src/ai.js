const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODELO_GROQ = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';
const CONTEXTOS_VALIDOS = ['CM 3D', 'UniFECAF', 'Saúde/Lazer'];
const MATRIZES_VALIDAS = [1, 2, 3, 4];

function dataAtualSaoPaulo() {
  const partes = new Intl.DateTimeFormat('en', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const valores = Object.fromEntries(partes.map(({ type, value }) => [type, value]));
  return `${valores.year}-${valores.month}-${valores.day}`;
}

function criarPromptSistema() {
  return `Você é um assistente de produtividade do Sistema Operacional Pessoal de Lucas Simeão.
Analise a frase de tarefa em português do Brasil e retorne estritamente um objeto JSON válido, sem markdown, comentários ou texto adicional.
O JSON deve conter exatamente estas propriedades:
{
  "titulo": "título curto e claro em português do Brasil",
  "descricao": "descrição objetiva preservando o sentido da frase",
  "contexto": "CM 3D" | "UniFECAF" | "Saúde/Lazer",
  "matriz": 1 | 2 | 3 | 4,
  "agendamento": "AAAA-MM-DDTHH:mm" | null
}

Hoje é ${dataAtualSaoPaulo()} no fuso America/Sao_Paulo.
Regras de agendamento:
- Se a frase indicar uma data ou horário, converta para o formato ISO local AAAA-MM-DDTHH:mm.
- Resolva expressões como hoje, amanhã, segunda-feira e horários como 19h usando a data atual informada.
- Se houver uma data sem horário, use 09:00.
- Se não houver data nem horário explícito, retorne null.

Regras de contexto:
- CM 3D: tarefas da CM Arte & Presentes, impressão 3D, Bambu Lab, Ender 3, sublimação ou gravação a laser.
- UniFECAF: aulas, trabalhos, provas ou estudos acadêmicos.
- Saúde/Lazer: treino PPL, descanso, jogos Valorant/CS2 e lazer.

Regras da Matriz de Eisenhower:
- 1: Fazer Agora - urgente e importante.
- 2: Agendar - importante, mas não urgente.
- 3: Delegar/Rápido - urgente, mas pouco importante.
- 4: Arquivo - nem urgente nem importante.

Quando não houver prazo explícito, use a intenção e o contexto da frase para escolher a prioridade mais coerente.`;
}

async function classificarTarefa(frase, chaveApi) {
  const resposta = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${chaveApi}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODELO_GROQ,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: criarPromptSistema() },
        { role: 'user', content: frase }
      ]
    })
  });

  if (!resposta.ok) {
    const erro = await resposta.text();
    throw new Error(`A Groq API recusou a solicitação: ${erro}`);
  }

  const dados = await resposta.json();
  const conteudo = dados.choices?.[0]?.message?.content;

  if (!conteudo) {
    throw new Error('A Groq API não retornou uma classificação.');
  }

  let classificacao;
  try {
    classificacao = JSON.parse(conteudo);
  } catch {
    throw new Error('A resposta da IA não está em JSON válido.');
  }

  return validarClassificacao(classificacao);
}

// Não confia cegamente no modelo: só aceita o formato exato antes de salvar.
function validarClassificacao(classificacao) {
  if (!classificacao || typeof classificacao !== 'object') {
    throw new Error('A IA retornou dados fora do formato esperado.');
  }

  const agendamentoValido = classificacao.agendamento === null || (
    typeof classificacao.agendamento === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(classificacao.agendamento) &&
    !Number.isNaN(Date.parse(classificacao.agendamento))
  );

  if (
    typeof classificacao.titulo !== 'string' ||
    !classificacao.titulo.trim() ||
    typeof classificacao.descricao !== 'string' ||
    !CONTEXTOS_VALIDOS.includes(classificacao.contexto) ||
    !MATRIZES_VALIDAS.includes(Number(classificacao.matriz)) ||
    !agendamentoValido
  ) {
    throw new Error('A IA retornou dados fora do formato esperado.');
  }

  return {
    titulo: classificacao.titulo.trim(),
    descricao: classificacao.descricao.trim(),
    contexto: classificacao.contexto,
    matriz: Number(classificacao.matriz),
    agendamento: classificacao.agendamento
  };
}

module.exports = { classificarTarefa, validarClassificacao };
