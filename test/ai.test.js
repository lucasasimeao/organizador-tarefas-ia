const test = require('node:test');
const assert = require('node:assert/strict');
const { validarClassificacao } = require('../src/ai');

const valida = {
  titulo: ' Entregar trabalho ',
  descricao: 'Entregar o trabalho de IA',
  contexto: 'UniFECAF',
  matriz: '1',
  agendamento: '2026-10-23T19:00'
};

test('aceita classificação válida e normaliza campos', () => {
  assert.deepEqual(validarClassificacao(valida), {
    titulo: 'Entregar trabalho',
    descricao: 'Entregar o trabalho de IA',
    contexto: 'UniFECAF',
    matriz: 1,
    agendamento: '2026-10-23T19:00'
  });
});

test('aceita tarefa sem agendamento', () => {
  assert.equal(validarClassificacao({ ...valida, agendamento: null }).agendamento, null);
});

test('rejeita contexto, quadrante ou data fora do formato', () => {
  for (const invalida of [
    { ...valida, contexto: 'Trabalho' },
    { ...valida, matriz: 5 },
    { ...valida, agendamento: '23/10/2026 19h' },
    { ...valida, titulo: '   ' },
    null
  ]) {
    assert.throws(() => validarClassificacao(invalida), /formato esperado/);
  }
});
