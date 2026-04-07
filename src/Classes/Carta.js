// ─────────────────────────────────────────────────────────────────────────────
// Carta.js — Classe base para todas as cartas jogáveis
//
// Não instancie esta classe diretamente. Use as subclasses:
//   CartaAbordagem  → fase de abordagem (lógica PIFE+CPC)
//   CartaSondagem   → fase de sondagem  (a definir)
//   (outras fases conforme necessário)
// ─────────────────────────────────────────────────────────────────────────────

export default class Carta {
    /**
     * @param {string} key - Chave do asset Phaser da imagem da carta
     */
    constructor(key) {
        this.key      = key;
        this._objetos = null; // preenchido pela cena ao criar os objetos visuais
    }
}