// =============================================================================
// CenaPonte.js
// Classe base para cenas de transição tipo "ponte".
// Gerencia o modo automático de travessia, portais nas duas extremidades
// e a câmera com zoom.
//
// USO — subclasse horizontal:
//   export default class CenaPonteh extends CenaPonte {
//       constructor() {
//           super('CenaPonteh', {
//               eixo:      'horizontal',
//               assetKey:  'fundo_ponte',
//               assetPath: 'assets/CenarioCasa/ponte.png',
//               zoom:      4.4,
//               cenaOrigem: 'MundoCasa',
//               portalA:   { cena: 'MundoCasa' },   // esquerda
//               portalB:   { cena: 'MapaGelo'  },   // direita
//           });
//       }
//   }
//
// USO — subclasse vertical:
//   export default class CenaPonteV extends CenaPonte {
//       constructor() {
//           super('CenaPonteV', {
//               eixo:      'vertical',
//               assetKey:  'fundo_ponte_v',
//               assetPath: 'assets/CenarioCasa/ponte_transicao_vertical.png',
//               zoom:      5.6,
//               cenaOrigem: 'MapaGelo',
//               portalA:   { cena: 'MapaGelo'     },   // cima
//               portalB:   { cena: 'VilaDoVarejo' },   // baixo
//           });
//       }
//   }
//
// PARÂMETROS do config:
//   eixo          — 'horizontal' ou 'vertical'
//   assetKey      — chave já carregada no Preloader
//   assetPath     — caminho do asset (carregado no preload() da base)
//   zoom          — zoom da câmera principal
//   cenaOrigem    — cena que, quando é a origem, faz o jogador spawnar
//                   no lado negativo (esquerda/cima) e andar para o positivo
//   portalNegativo — { cena, dados } — destino ao sair pelo lado negativo
//   portalPositivo — { cena, dados } — destino ao sair pelo lado positivo
//   registryOrigem — (opcional) chave a setar no registry ao sair pelo portal negativo
// =============================================================================

import Jogador from '../Classes/Jogador.js';

export default class CenaPonte extends Phaser.Scene {

    constructor(key, config = {}) {
        super(key);
        this._cfg = Object.assign({
            eixo:           'horizontal',
            assetKey:       'fundo_ponte',
            assetPath:      null,
            zoom:           4.4,
            cenaOrigem:     null,
            portalA:        { cena: 'MenuPrincipal', dados: {} }, // esquerda / cima
            portalB:        { cena: 'MenuPrincipal', dados: {} }, // direita  / baixo
            registryOrigem: null,
        }, config);
    }

    init(data) {
        this.origem = data?.vindoDe ?? null;
    }

    preload() {
        if (this._cfg.assetPath) {
            this.load.image(this._cfg.assetKey, this._cfg.assetPath);
        }
    }

    create() {
        const { eixo, assetKey, zoom, cenaOrigem } = this._cfg;
        const cx = 750;
        const cy = 400;
        const horizontal = eixo === 'horizontal';

        // ── Fundo — 7 tiles prolongando a ponte ──────────────────────────────
        for (let i = -3; i <= 3; i++) {
            const x = horizontal ? cx + i * 75 : cx;
            const y = horizontal ? cy          : cy + i * 75;
            this.add.image(x, y, assetKey).setOrigin(0.5);
        }

        // ── Spawn — lado negativo se vem da cenaOrigem, positivo caso contrário
        const vemDoLadoNegativo = this.origem === cenaOrigem || !this.origem;
        const offset = 60;

        const spawnX = horizontal
            ? cx + (vemDoLadoNegativo ? -offset : offset)
            : cx;
        const spawnY = horizontal
            ? cy - 10
            : cy + (vemDoLadoNegativo ? -offset : offset);

        this.personagem = new Jogador(this, spawnX, spawnY, 1.0);
        this.personagem.sprite.setDepth(2);
        this.teclas = this.personagem.configurarTeclas();

        // 1 = andar para o lado positivo (direita/baixo)
        // -1 = andar para o lado negativo (esquerda/cima)
        this.direcaoAuto     = vemDoLadoNegativo ? 1 : -1;
        this.modoAuto        = true;
        this.fazendoTransicao = false;
        this.portaisAtivos   = false;

        this.time.delayedCall(1000, () => { this.portaisAtivos = true; });

        // ── Portais nas duas extremidades ────────────────────────────────────
        const portalSize  = 800; // dimensão longa do portal (perpendicular ao eixo)
        const portalFino  = 20;  // dimensão curta do portal (paralela ao eixo)
        const portalDist  = 55;  // distância do centro

        if (horizontal) {
            this.portalA = this.add.zone(cx - portalDist, cy, portalFino, portalSize);
            this.portalB = this.add.zone(cx + portalDist, cy, portalFino, portalSize);
        } else {
            this.portalA = this.add.zone(cx, cy - portalDist, portalSize, portalFino);
            this.portalB = this.add.zone(cx, cy + portalDist, portalSize, portalFino);
        }

        [this.portalA, this.portalB].forEach(p => {
            this.physics.add.existing(p);
            p.body.setAllowGravity(false);
            p.body.moves = false;
        });

        // ── Câmera ────────────────────────────────────────────────────────────
        this.cameras.main.startFollow(this.personagem.sprite);
        this.cameras.main.setZoom(zoom);
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    update() {
        if (this.modoAuto) {
            const skin = this.personagem.skin;
            const vel  = 80 * this.direcaoAuto;
            const horizontal = this._cfg.eixo === 'horizontal';

            if (horizontal) {
                this.personagem.sprite.setVelocityX(vel);
                this.personagem.sprite.play(`${skin}_lado`, true);
                this.personagem.sprite.setFlipX(this.direcaoAuto === 1);
            } else {
                this.personagem.sprite.setVelocityX(0);
                this.personagem.sprite.setVelocityY(vel);
                const anim = this.direcaoAuto === 1 ? `${skin}_andar` : `${skin}_costa`;
                this.personagem.sprite.play(anim, true);
            }
        } else {
            this.personagem.atualizar();
        }

        if (this.fazendoTransicao || !this.portaisAtivos) return;

        if (this.physics.overlap(this.personagem.sprite, this.portalA)) {
            this._irPara('A');
        } else if (this.physics.overlap(this.personagem.sprite, this.portalB)) {
            this._irPara('B');
        }
    }

    // ── Interno ───────────────────────────────────────────────────────────────

    _irPara(lado) {
        this.fazendoTransicao = true;

        const { cena, dados } = lado === 'A'
            ? this._cfg.portalA
            : this._cfg.portalB;

        if (lado === 'A' && this._cfg.registryOrigem) {
            this.game.registry.set('origemCena', this._cfg.registryOrigem);
        }

        this.sound.play('transicao_ponte', { volume: 0.7 });

        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(cena, { vindoDe: this.scene.key, ...dados });
        });
    }
}