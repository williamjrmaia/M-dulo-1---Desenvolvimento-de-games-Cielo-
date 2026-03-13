// =============================================================================
// DialogoPedro.js
// Diálogo dedicado ao NPC Seu Pedro — estende DialogoManager com a cor
// e as falas específicas do personagem.
//
// USO:
//   import DialogoPedro from '../Classes/DialogoPedro.js';
//
//   // No create() da cena:
//   this.dialogoPedro = new DialogoPedro(this);
//
//   // Para abrir:
//   this.dialogoPedro.abrir();
//
//   // No update(), para avançar com a tecla E:
//   if (Phaser.Input.Keyboard.JustDown(teclas.interagir)) {
//       this.dialogoPedro.avancar();
//   }
//
//   // Para checar se está aberto (ex: bloquear movimento):
//   if (this.dialogoPedro.aberto) { ... }
// =============================================================================

import DialogoManager from './DialogoManager.js';

export default class DialogoPedro extends DialogoManager {

    // Cor do nome do Seu Pedro na caixa de diálogo
    static COR_PEDRO = '#ff9900';

    // Falas do Seu Pedro com o Jogador
    static FALAS = [
        { personagem: 'Seu Pedro', texto: 'Bem-vindo à minha loja de carnes congeladas! Aqui você encontra o melhor do frio.' },
        { personagem: 'Seu Pedro', texto: 'Temos costela, frango, peixe... tudo fresquinho e bem geladinho!' },
        { personagem: 'Jogador',   texto: 'Uau, que variedade! Quanto custa a costela?' },
        { personagem: 'Seu Pedro', texto: 'Pra você, faço um preço especial. Mas precisa ser hoje, tá? O estoque tá acabando!' },
        { personagem: 'Jogador',   texto: 'Vou pensar e já volto!' },
        { personagem: 'Seu Pedro', texto: 'Tô aqui esperando. Pode contar comigo!' },
    ];

    // -------------------------------------------------------------------------
    // Constructor
    // Registra a cor do Seu Pedro no mapa estático do DialogoManager
    // para que o nome apareça com a cor correta.
    // -------------------------------------------------------------------------
    constructor(cena, opcoes = {}) {
        super(cena, opcoes);

        // Injeta a cor do Seu Pedro nas cores do manager pai
        DialogoManager.CORES_PERSONAGEM['Seu Pedro'] = DialogoPedro.COR_PEDRO;
    }

    // -------------------------------------------------------------------------
    // Abre o diálogo com as falas padrão do Seu Pedro.
    // Aceita um callback opcional chamado ao fim do diálogo.
    // -------------------------------------------------------------------------
    abrir(onFim = null) {
        super.abrir(DialogoPedro.FALAS, onFim);
    }
}