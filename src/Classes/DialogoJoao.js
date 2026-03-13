// =============================================================================
// DialogoJoao.js
// Diálogo dedicado ao NPC Seu João — estende DialogoManager com a cor
// e as falas específicas do personagem.
//
// USO:
//   import DialogoJoao from '../Classes/DialogoJoao.js';
//
//   // No create() da cena:
//   this.dialogoJoao = new DialogoJoao(this);
//
//   // Para abrir:
//   this.dialogoJoao.abrir();
//
//   // No update(), para avançar com a tecla E:
//   if (Phaser.Input.Keyboard.JustDown(teclas.interagir)) {
//       this.dialogoJoao.avancar();
//   }
//
//   // Para checar se está aberto (ex: bloquear movimento):
//   if (this.dialogoJoao.aberto) { ... }
// =============================================================================

import DialogoManager from './DialogoManager.js';

export default class DialogoJoao extends DialogoManager {

    // Cor do nome do Seu João na caixa de diálogo
    static COR_JOAO = '#ff9900';

    // Falas do Seu João com o Jogador
    static FALAS = [
        { personagem: 'Seu João', texto: 'Bem-vindo à minha loja de carnes congeladas! Aqui você encontra o melhor do frio.' },
        { personagem: 'Seu João', texto: 'Temos costela, frango, peixe... tudo fresquinho e bem geladinho!' },
        { personagem: 'Jogador',   texto: 'Uau, que variedade! Quanto custa a costela?' },
        { personagem: 'Seu João', texto: 'Pra você, faço um preço especial. Mas precisa ser hoje, tá? O estoque tá acabando!' },
        { personagem: 'Jogador',   texto: 'Vou pensar e já volto!' },
        { personagem: 'Seu João', texto: 'Tô aqui esperando. Pode contar comigo!' },
    ];

    // -------------------------------------------------------------------------
    // Constructor
    // Registra a cor do Seu João no mapa estático do DialogoManager
    // para que o nome apareça com a cor correta.
    // -------------------------------------------------------------------------
    constructor(cena, opcoes = {}) {
        super(cena, opcoes);

        // Injeta a cor do Seu João nas cores do manager pai
        DialogoManager.CORES_PERSONAGEM['Seu João'] = DialogoJoao.COR_JOAO;
    }

    // -------------------------------------------------------------------------
    // Abre o diálogo com as falas padrão do Seu João.
    // Aceita um callback opcional chamado ao fim do diálogo.
    // -------------------------------------------------------------------------
    abrir(onFim = null) {
        super.abrir(DialogoJoao.FALAS, onFim);
    }
}