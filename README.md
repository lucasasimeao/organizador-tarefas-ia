# Organizador de Tarefas com IA (Matriz de Eisenhower)

> Escreva uma tarefa em linguagem natural e um LLM a transforma em um card classificado por contexto, prioridade e data, direto no quadro e no calendário.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Groq](https://img.shields.io/badge/LLM-Groq%20API-F55036)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-CDN-06B6D4?logo=tailwindcss&logoColor=white)

## Sobre o projeto

Quem divide o dia entre trabalho, estudos e vida pessoal perde tempo decidindo **o que fazer primeiro** e registrando tarefas em vários lugares. Este projeto resolve isso com uma única caixa de texto: a pessoa escreve algo como *"estudar Express amanhã às 19h"* e a IA devolve uma tarefa estruturada (título, descrição, contexto, quadrante da Matriz de Eisenhower e agendamento).

Foi desenvolvido como parte prática do trabalho acadêmico **"Meu Sistema Operacional Pessoal: utilizando IA para gerenciar tempo, comunicação e produtividade"** (graduação em IA e Automação Digital, UniFECAF). A fundamentação teórica (Matriz de Eisenhower + Timeblocking) está em [`1_Analise_Teorica.md`](1_Analise_Teorica.md).

## Funcionalidades

- **Entrada em linguagem natural**: uma frase livre vira uma tarefa completa.
- **Classificação por LLM** (Groq API): título, descrição, contexto (três áreas da rotina) e quadrante da Matriz de Eisenhower (1 Fazer agora, 2 Agendar, 3 Delegar/Rápido, 4 Arquivo).
- **Extração de datas e horários**: resolve expressões como "hoje", "amanhã", "segunda" e "19h" usando a data atual no fuso `America/Sao_Paulo`.
- **Saída estruturada e validada**: o modelo responde em JSON (`response_format: json_object`) e o servidor valida campos, contextos, prioridade e formato da data antes de salvar.
- **Quadro em quatro colunas** e **calendário semanal** com as tarefas agendadas.
- **Painel de acompanhamento**: total de tarefas, prioridades imediatas e compromissos da semana.
- **Persistência local** em `tarefas.json` (criado automaticamente), sem banco de dados externo.
- **Cuidados básicos de segurança**: chave só em variável de ambiente, limite de 500 caracteres por frase e renderização com `textContent` (sem interpretar conteúdo como HTML).

## Tecnologias

- **Back-end:** Node.js 18+, Express, dotenv, `fetch` nativo
- **IA:** Groq API (endpoint compatível com OpenAI Chat Completions), modelo configurado em `src/ai.js`, `temperature: 0.2`
- **Front-end:** HTML, JavaScript puro e Tailwind CSS via CDN
- **Persistência:** arquivo JSON com o módulo nativo `fs/promises`

## Como executar

Pré-requisitos: Node.js 18 ou superior e uma chave da [Groq](https://console.groq.com/).

```bash
git clone https://github.com/lucasasimeao/trabalho_08.git
cd trabalho_08
npm install
cp .env.example .env   # no Windows: copy .env.example .env
```

Preencha o `.env`:

```env
GROQ_API_KEY=sua_chave_groq
PORT=3000
```

```bash
npm start        # ou: npm run dev (reinicia ao salvar)
```

Acesse `http://localhost:3000` (ou a porta definida em `PORT`).

### API

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/tarefas` | Lista as tarefas salvas |
| POST | `/api/tarefas` | Recebe `{ "frase": "..." }`, classifica com IA e salva |
| DELETE | `/api/tarefas/:id` | Remove uma tarefa |
| GET | `/api/compromissos` | Retorna as tarefas que têm agendamento (para o calendário) |

## Estrutura do projeto

```text
.
├── public/index.html      # Interface (quadro, calendário e painel)
├── src/ai.js              # Prompt de sistema, chamada à Groq e validação do JSON
├── src/database.js        # Leitura e escrita em tarefas.json
├── server.js              # Servidor Express e rotas da API
├── 1_Analise_Teorica.md   # Fundamentação teórica do trabalho
└── .env.example
```

## Competências demonstradas

- **Integração de LLM em aplicação real**: engenharia de prompt de sistema com regras explícitas e saída em JSON.
- **Extração de informação estruturada** a partir de texto livre (classificação + reconhecimento de datas relativas).
- **Validação de saída de IA** antes de persistir: o sistema não confia cegamente no modelo.
- **APIs REST** com Node.js/Express e tratamento de erros (400, 404, 502, 503).
- **Automação de processo pessoal**: reduz o atrito de registrar e priorizar tarefas.

## Próximos passos

- Adicionar prints da interface em `docs/`.
- Permitir editar a classificação sugerida pela IA.
- Trocar o arquivo JSON por SQLite e gerar métricas de produtividade por semana.
- Tornar os contextos configuráveis (hoje estão fixos no prompt).
