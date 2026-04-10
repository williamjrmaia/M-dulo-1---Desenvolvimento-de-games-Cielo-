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

import Insignia from './Insignias.js';

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

    trocarCena(nomeCena, dados = {}, insigniaRequerida = null) {
        if (insigniaRequerida) {
            const insignias = this.game.registry.get('insigniasJogador') ?? [];
            if (!insignias.includes(insigniaRequerida)) {
                this._mostrarMensagemBloqueio(insigniaRequerida);
                return;
            }
        }

        this.fazendoTransicao = true;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.stop('HUDCenas');
            this.scene.start(nomeCena, { vindoDe: this.scene.key, ...dados });
        });
    }

    _mostrarMensagemBloqueio(chave) {
        // Se a mensagem já está na tela, renova o timer em vez de criar outra
        if (this._timerBloqueio) {
            this.time.removeEvent(this._timerBloqueio);
            this._timerBloqueio = this.time.delayedCall(2500, () => this._destruirMensagemBloqueio());
            return;
        }

        const nome = Insignia.CATALOGO[chave]?.nome ?? chave;
        const W = this.scale.width;
        const H = this.scale.height;

        this._bgBloqueio = this.add
            .rectangle(W / 2, H * 0.2, 520, 60, 0x000000, 0.8)
            .setStrokeStyle(2, 0xcc4444)
            .setDepth(200)
            .setScrollFactor(0);

        this._textoBloqueio = this.add
            .text(W / 2, H * 0.2, `⛔ Você precisa da insígnia "${nome}" para continuar!`, {
                fontFamily: '"Courier New", monospace',
                fontSize:   '13px',
                color:      '#ff6666',
                align:      'center',
                wordWrap:   { width: 500 },
            })
            .setOrigin(0.5)
            .setDepth(201)
            .setScrollFactor(0);

        // Ignora na câmera principal (que tem zoom alto) — só renderiza na uiCam
        this.cameras.main.ignore(this._bgBloqueio);
        this.cameras.main.ignore(this._textoBloqueio);

        this._timerBloqueio = this.time.delayedCall(2500, () => this._destruirMensagemBloqueio());
    }

    _destruirMensagemBloqueio() {
        this._bgBloqueio?.destroy();
        this._textoBloqueio?.destroy();
        this._bgBloqueio    = null;
        this._textoBloqueio = null;
        this._timerBloqueio = null;
    }
}