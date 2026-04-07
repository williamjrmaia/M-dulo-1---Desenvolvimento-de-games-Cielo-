// ─────────────────────────────────────────────────────────────────────────────
// CartaSondagem.js — Carta da fase de sondagem
//
// COMO CRIAR UMA NOVA CARTA DE SONDAGEM na subclasse (ex: NegociacaoPedro):
//
//   Dentro de _getCartasSondagem(), adicione:
//
//   new CartaSondagem({
//       key:           'NomeDaCartaNoAsset',  // arquivo em assets/cartas/
//       aspecto:       'lucro',               // 'pessoas', 'lucro' ou 'estoque'
//       correta:       true,                  // false = carta errada (perde satisfação)
//       dialogoAcerto: 'Fala do cliente revelando o aspecto',
//       dialogoErro:   'Fala do cliente ao errar',
//   }),
//
// REGRAS:
//   - Cada carta pertence a exatamente um aspecto
//   - Pode ter várias cartas do mesmo aspecto (corretas e erradas)
//   - Cartas com correta: false perdem satisfação e não revelam o aspecto
//   - Um aspecto só é revelado quando o jogador usa uma carta correta daquele aspecto
//   - Os três aspectos precisam ser revelados para avançar de fase
// ─────────────────────────────────────────────────────────────────────────────

import Carta from '../Carta.js';

export default class CartaSondagem extends Carta {
    /**
     * @param {object} dados
     * @param {string}                    dados.key           - Chave do asset da carta
     * @param {'pessoas'|'lucro'|'estoque'} dados.aspecto     - Aspecto que esta carta investiga
     * @param {boolean}                   dados.correta       - Revela o aspecto corretamente?
     * @param {string}                    dados.dialogoAcerto - Fala do cliente ao revelar o aspecto
     * @param {string}                    dados.dialogoErro   - Fala do cliente ao errar
     */
    constructor({ key, aspecto, correta, dialogoAcerto, dialogoErro }) {
        super(key);
        this.aspecto       = aspecto;
        this.correta       = correta;
        this.dialogoAcerto = dialogoAcerto;
        this.dialogoErro   = dialogoErro;
    }
}