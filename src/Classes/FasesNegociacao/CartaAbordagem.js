// ─────────────────────────────────────────────────────────────────────────────
// CartaAbordagem.js — Carta da fase de abordagem (lógica PIFE+CPC)
//
// COMO CRIAR UMA NOVA CARTA DE ABORDAGEM na subclasse (ex: NegociacaoPedro):
//
//   Dentro de _getCartasAbordagem(), adicione:
//
//   new CartaAbordagem({
//       key:           'NomeDaCartaNoAsset',  // arquivo em assets/cartas/
//       letra:         'P',                   // 'P', 'I', 'F', 'E' ou 'CPC'
//       correta:       true,                  // false = carta errada (perde satisfação)
//       dialogoAcerto: 'Fala do cliente ao acertar esta carta',
//       dialogoErro:   'Fala do cliente ao errar esta carta',
//   }),
//
// REGRAS:
//   - Pode ter várias cartas da mesma letra (P, I, F ou E)
//   - Só pode haver UMA carta com letra 'CPC', e ela deve ter correta: true
//   - A carta CPC só fica disponível após P, I, F e E estarem preenchidos
//   - Cartas com correta: false sempre tiram satisfação, independente da letra
//
// ASSETS NECESSÁRIOS:
//   - Imagem da carta:      assets/cartas/<key>.png
//   - Ícone da letra (_off e _on já carregados pelo Preloader):
//       pife_p_off / pife_p_on
//       pife_i_off / pife_i_on
//       pife_f_off / pife_f_on
//       pife_e_off / pife_e_on
//       pife_cpc_off / pife_cpc_on
// ─────────────────────────────────────────────────────────────────────────────

import Carta from '../Carta.js';

export default class CartaAbordagem extends Carta {
    /**
     * @param {object} dados
     * @param {string}           dados.key           - Chave do asset da carta
     * @param {'P'|'I'|'F'|'E'|'CPC'} dados.letra   - Letra do PIFE ou 'CPC'
     * @param {boolean}          dados.correta       - Acerta a letra?
     * @param {string}           dados.dialogoAcerto - Fala do cliente ao acertar
     * @param {string}           dados.dialogoErro   - Fala do cliente ao errar
     */
    constructor({ key, letra, correta, dialogoAcerto, dialogoErro }) {
        super(key);
        this.letra         = letra;
        this.correta       = correta;
        this.dialogoAcerto = dialogoAcerto;
        this.dialogoErro   = dialogoErro;
    }

    get isCPC() {
        return this.letra === 'CPC';
    }
}