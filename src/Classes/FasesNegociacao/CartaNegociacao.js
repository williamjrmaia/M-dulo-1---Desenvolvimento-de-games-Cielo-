// CartaNegociacao.js — Carta usada na fase de negociação
//
// Cada carta representa uma condição comercial (suporte, taxa, etc.).
// A propriedade `condicao` identifica qual ícone será aceso ao acertar.
//
// COMO USAR:
//
//   new CartaNegociacao({
//       key:           'Suporte',      // chave do asset no Preloader
//       condicao:      'suporte',      // identificador do ícone na barra
//       correta:       true,           // false = penaliza satisfação
//       dialogoAcerto: 'Fala ao acertar',
//       dialogoErro:   'Fala ao errar',
//   })

export default class CartaNegociacao {
    constructor({ key, condicao, correta, dialogoAcerto, dialogoErro }) {
        this.key          = key;
        this.condicao     = condicao;
        this.correta      = correta;
        this.dialogoAcerto = dialogoAcerto;
        this.dialogoErro   = dialogoErro;

        // Referência ao objeto visual criado em _distribuirCartasNegociacao
        this._objetos = null;
    }
}