// =============================================================================
// cenaMapa.js
// Classe base para todas as cenas de mapa do jogo.
//
// FORNECE:
//   - fazendoTransicao — flag para bloquear input durante transições
//   - trocarCena()     — fade out + stop HUD + scene.start com vindoDe automático
//   - create()         — lança o HUD e faz fadeIn
//   - update()         — guard contra transição em andamento
//
// USO:
//   import CenaMapa from '../Classes/cenaMapa.js';
//
//   export default class QuebraGelo extends CenaMapa {
//
//       create() {
//           super.create(); // lança HUD + fadeIn
//           // ... seu código aqui
//       }
//
//       update() {
//           if (super.update()) return; // guard de transição
//           // ... seu código aqui
//       }
//   }
//
// TROCAR DE CENA:
//   // vindoDe é injetado automaticamente — não precisa passar
//   this.trocarCena('VilaDoVarejo');
//
//   // dados extras ainda funcionam normalmente
//   this.trocarCena('CenaCasaGelo', { chave: 'valor' });
//
// HUD:
//   O HUD é lançado no create() e parado no trocarCena().
//   Não é necessário chamar scene.launch ou scene.stop manualmente.
// =============================================================================

export default class CenaMapa extends Phaser.Scene {

    create() {
        this.fazendoTransicao = false;

        this.scene.launch('HUDCenas');
        this.scene.bringToTop('HUDCenas');

        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    // Retorna true se estiver em transição — use como guard no update()
    update() {
        return this.fazendoTransicao;
    }

    trocarCena(nomeCena, dados = {}) { //método para fazer
        this.fazendoTransicao = true;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.stop('HUDCenas');
            this.scene.start(nomeCena, { vindoDe: this.scene.key, ...dados });
        });
    }
}