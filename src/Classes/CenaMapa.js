// =============================================================================
// CenaMapa.js
// Classe base para todas as cenas de mapa do jogo.
//
// FORNECE:
//   - fazendoTransicao — flag para bloquear input durante transições
//   - trocarCena()     — fade out + stop HUD + scene.start com vindoDe automático
//   - create()         — lança o HUD, faz fadeIn e registra P para o PauseMenu
//   - update()         — guard contra transição em andamento
//
// USO:
//   import CenaMapa from '../Classes/CenaMapa.js';
//
//   export default class QuebraGelo extends CenaMapa {
//
//       create() {
//           super.create(); // lança HUD + fadeIn + registra P
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
//   this.trocarCena('VilaDoVarejo');
//   this.trocarCena('CenaCasaGelo', { chave: 'valor' }); // dados extras
//
// PAUSE (P):
//   Automático — pressionar P abre o PauseMenu como overlay,
//   pausando a cena atual. P novamente (ou "CONTINUAR") fecha o menu.
//   Certifique-se de que 'PauseMenu' está registrado na lista de cenas do jogo.
//
// HUD:
//   O HUD é lançado no create() e parado no trocarCena().
// =============================================================================

export default class CenaMapa extends Phaser.Scene {

    create() {
        this.fazendoTransicao = false;

        this.scene.launch('HUDCenas');
        this.scene.bringToTop('HUDCenas');

        this.cameras.main.fadeIn(500, 0, 0, 0);

        // ── P → PauseMenu ───────────────────────────────────────────────────
        this.input.keyboard.on('keydown-P', () => {
            // Não abre o pause se já estiver em transição ou se o pause já estiver ativo
            if (this.fazendoTransicao) return;
            if (this.scene.isActive('PauseMenu')) return;

            this.scene.launch('PauseMenu', { cenaOrigem: this.scene.key });
            this.scene.bringToTop('PauseMenu');
        });
    }

    // Retorna true se estiver em transição — use como guard no update()
    update() {
        return this.fazendoTransicao;
    }

    trocarCena(nomeCena, dados = {}) {
        this.fazendoTransicao = true;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.stop('HUDCenas');
            this.scene.start(nomeCena, { vindoDe: this.scene.key, ...dados });
        });
    }
}