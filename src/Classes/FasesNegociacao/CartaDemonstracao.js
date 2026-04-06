// ─────────────────────────────────────────────────────────────────────────────
// CartaDemonstracao.js — Carta da fase de demonstração
//
// COMO CRIAR UMA NOVA CARTA DE DEMONSTRAÇÃO na subclasse (ex: NegociacaoPedro):
//
//   Dentro de _getCartasDemonstracao(), adicione:
//
//   new CartaDemonstracao({
//       key:      'NomeDaCartaNoAsset',  // arquivo em assets/Cartas/Produtos/
//       pessoas:  'baixo',              // 'baixo' ou 'alto'
//       lucro:    'alto',               // 'baixo', 'medio' ou 'alto'
//       estoque:  'baixo',              // 'baixo' ou 'alto'
//   }),
//
// REGRAS:
//   - 3 atributos corretos → avança a fase
//   - 2 atributos corretos → perde 10 de satisfação, carta removida
//   - 1 ou 0 atributos corretos → perde 20 de satisfação, carta removida
//   - A fase termina quando o jogador encontra a carta com os 3 atributos certos
//   - Se a satisfação zerar, o jogador perde a negociação
// ─────────────────────────────────────────────────────────────────────────────

import Carta from '../Carta.js';

export default class CartaDemonstracao extends Carta {
    /**
     * @param {object} dados
     * @param {string}                    dados.key     - Chave do asset da carta
     * @param {'baixo'|'alto'}            dados.pessoas - Perfil de volume de pessoas
     * @param {'baixo'|'medio'|'alto'}    dados.lucro   - Perfil de lucro
     * @param {'baixo'|'alto'}            dados.estoque - Perfil de rotatividade de estoque
     */
    constructor({ key, pessoas, lucro, estoque }) {
        super(key);
        this.pessoas = pessoas;
        this.lucro   = lucro;
        this.estoque = estoque;
    }

    /**
     * Compara os atributos da carta com os aspectos do cliente.
     * Retorna quantos atributos estão corretos (0, 1, 2 ou 3).
     *
     * @param {{ pessoas: string, lucro: string, estoque: string }} aspectosCliente
     * @returns {number}
     */
    contarAcertos(aspectosCliente) {
        let acertos = 0;
        if (this.pessoas === aspectosCliente.pessoas) acertos++;
        if (this.lucro   === aspectosCliente.lucro)   acertos++;
        if (this.estoque === aspectosCliente.estoque) acertos++;
        return acertos;
    }
}