# Sistema Operacional Pessoal Lucas Simeão

Aplicação web local para organizar as tarefas da CM Arte & Presentes, os estudos na UniFECAF e a rotina de treino e lazer usando a Matriz de Eisenhower. A Groq API interpreta uma frase livre e retorna uma tarefa categorizada automaticamente.

Este projeto foi desenvolvido como a parte prática do trabalho **Meu Sistema Operacional Pessoal: Utilizando IA para Gerenciar Tempo, Comunicação e Produtividade**. A análise teórica está em [1_Analise_Teorica.md](1_Analise_Teorica.md).

## Tecnologias

- Node.js 18+
- Express
- Groq API com modelo `qwen/qwen3.8-27b`
- HTML, JavaScript e Tailwind CSS via CDN
- Persistência local em `tarefas.json` com o módulo nativo `fs`

## Estrutura

```text
.
├── public/index.html
├── src/ai.js
├── src/database.js
├── .env.example
├── .gitignore
├── 1_Analise_Teorica.md
├── package.json
├── README.md
├── server.js
└── tarefas.json          # criado automaticamente e ignorado pelo Git
```

## Instalação

1. Tenha o Node.js 18 ou superior instalado.
2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie um arquivo `.env` na raiz, copiando `.env.example`, e preencha sua chave:

   ```env
   GROQ_API_KEY=sua_chave_groq
   PORT=3100
   ```

   A chave pode ser criada no console da Groq. Nunca publique o `.env` ou a chave no Git.

4. Inicie a aplicação:

   ```bash
   npm start
   ```

5. Acesse `http://localhost:3100` no navegador.

## Fluxo de uso

1. Escreva uma intenção no campo superior, em linguagem natural.
2. O frontend envia a frase para `POST /api/tarefas`.
3. O backend usa a Groq API para gerar título, descrição, contexto e prioridade.
4. A tarefa é salva localmente em `tarefas.json` e aparece na coluna correspondente.
5. Se a frase tiver uma data ou horário, a IA preenche o agendamento e a mesma tarefa também aparece no calendário semanal.
6. Use o botão de remoção do card ou do calendário para remover a tarefa dos dois lugares.

## Relação com os requisitos

| Requisito | Como aparece no projeto |
| --- | --- |
| Organização de tarefas e prioridades | Cada tarefa é classificada em um dos quatro quadrantes da Matriz de Eisenhower. |
| Técnica de produtividade | Matriz de Eisenhower, com apoio conceitual de Timeblocking na análise teórica. |
| Ferramenta digital | Aplicação web própria com Node.js, Express e armazenamento local. |
| Uso de IA | A Groq API transforma uma frase livre em título, descrição, contexto, prioridade e agendamento quando houver data ou horário. |
| Dashboard/painel | Quadro visual com quatro colunas e contador total de tarefas. |
| Planejamento semanal ou mensal | Calendário semanal com os sete dias da semana e tarefas agendadas distribuídas por data. |
| Gestão de compromissos | A IA identifica data e horário na frase e agenda automaticamente a mesma tarefa no calendário. `tarefas.json` é a fonte única dos dados. |
| Acompanhamento de produtividade | Painel com total de tarefas, prioridades imediatas e compromissos da semana. |

### Situação da entrega

O projeto atende de forma demonstrável aos requisitos de organização, priorização, técnica de produtividade, ferramenta digital, uso de IA, planejamento semanal, gestão de compromissos e painel de acompanhamento. A análise teórica apresenta o uso de Timeblocking como estratégia complementar à Matriz de Eisenhower.

## Prints da aplicação

Adicione nesta seção os prints reais usados na apresentação final, por exemplo:

```md
![Tela principal](docs/tela-principal.png)
![Tarefa classificada pela IA](docs/tarefa-classificada.png)
```

Os arquivos devem ser colocados em `docs/` antes da entrega para que as imagens sejam exibidas no GitHub.

## API

- `GET /api/tarefas`: lista as tarefas salvas.
- `POST /api/tarefas`: recebe `{ "frase": "..." }` e cria uma tarefa com IA, incluindo `agendamento` quando identificado.
- `DELETE /api/tarefas/:id`: remove uma tarefa pelo identificador.
- `GET /api/compromissos`: retorna os agendamentos derivados das tarefas, sem criar registros duplicados.

## Segurança e privacidade

As credenciais ficam somente em variáveis de ambiente. O arquivo de tarefas e dependências são ignorados pelo Git. O frontend usa `textContent` e criação de nós DOM para tratar os dados retornados antes da exibição, evitando interpretar conteúdo das tarefas como HTML.