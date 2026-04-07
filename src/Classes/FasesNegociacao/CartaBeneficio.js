// ─────────────────────────────────────────────────────────────────────────────
// CartaBeneficio.js — Carta da fase de benefícios
//
// COMO CRIAR UMA NOVA CARTA DE BENEFÍCIO na subclasse (ex: NegociacaoJulia):
//
//   Dentro de _getCartasBeneficio(), adicione:
//
//   new CartaBeneficio({
//       key:           'NomeDaCartaNoAsset',  // arquivo em assets/cartas/
//       beneficio:     'taxa',                // 'taxa', 'prazo' ou 'suporte'
//       correta:       true,                  // false = carta errada (perde satisfação)
//       dialogoAcerto: 'Fala do cliente ao receber o benefício',
//       dialogoErro:   'Fala do cliente ao errar',
//   }),
//
// REGRAS:
//   - Cada carta pertence a exatamente um benefício: 'taxa', 'prazo' ou 'suporte'
//   - Pode ter várias cartas do mesmo benefício (corretas e erradas)
//   - Cartas com correta: false perdem satisfação e não revelam o ícone
//   - Um benefício só é revelado quando o jogador usa uma carta correta dele
//   - Os três benefícios precisam ser revelados para avançar de fase
//
// ASSETS DOS ÍCONES (carregar no Preloader ou no preload() da cena):
//   beneficio_taxa_off    / beneficio_taxa_on
//   beneficio_prazo_off   / beneficio_prazo_on
//   beneficio_suporte_off / beneficio_suporte_on
// ─────────────────────────────────────────────────────────────────────────────

import Carta from '../Carta.js';

export default class CartaBeneficio extends Carta {
    /**
     * @param {object} dados
     * @param {string}                          dados.key           - Chave do asset da carta
     * @param {'taxa'|'prazo'|'suporte'}        dados.beneficio     - Benefício que esta carta apresenta
     * @param {boolean}                         dados.correta       - Revela o benefício corretamente?
     * @param {string}                          dados.dialogoAcerto - Fala do cliente ao revelar o benefício
     * @param {string}                          dados.dialogoErro   - Fala do cliente ao errar
     */
    constructor({ key, beneficio, correta, dialogoAcerto, dialogoErro }) {
        super(key);
        this.beneficio     = beneficio;
        this.correta       = correta;
        this.dialogoAcerto = dialogoAcerto;
        this.dialogoErro   = dialogoErro;
    }
}