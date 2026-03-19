import Jogador from '../Classes/Jogador.js';

export default class CenaPonteV extends Phaser.Scene {
    constructor() {
        super('CenaPonteV');
    }

    init(data) {
        console.log('CenaPonteV iniciada, origem:', data.vindoDe);
        this.origem = data.vindoDe;
    }

    preload() {
        this.load.image('fundo_ponte_v', 'assets/CenarioCasa/ponte_transicao_vertical.png');
    }

    create() {
        const centerX = 750;
        const centerY = 400;

        // Prolongamento vertical da ponte
        this.add.image(centerX, centerY,       'fundo_ponte_v').setOrigin(0.5, 0.5);
        this.add.image(centerX, centerY - 75,  'fundo_ponte_v').setOrigin(0.5, 0.5);
        this.add.image(centerX, centerY + 75,  'fundo_ponte_v').setOrigin(0.5, 0.5);
        this.add.image(centerX, centerY - 150, 'fundo_ponte_v').setOrigin(0.5, 0.5);
        this.add.image(centerX, centerY + 150, 'fundo_ponte_v').setOrigin(0.5, 0.5);
        this.add.image(centerX, centerY - 225, 'fundo_ponte_v').setOrigin(0.5, 0.5);
        this.add.image(centerX, centerY + 225, 'fundo_ponte_v').setOrigin(0.5, 0.5);

        // Vindo do MapaGelo (topo) → spawn em cima, anda para baixo
        // Vindo do VilaDoVarejo (baixo) → spawn embaixo, anda para cima
        const vemDeCima = this.origem === 'MapaGelo' || !this.origem;
        const spawnX = centerX;
        const spawnY = vemDeCima ? centerY - 60 : centerY + 60;

        this.personagem = new Jogador(this, spawnX, spawnY, 1.0);
        this.personagem.sprite.setScale(1.0);
        this.personagem.sprite.setDepth(2);
        this.teclas = this.personagem.configurarTeclas();

        // 1 = para baixo (vindo do MapaGelo), -1 = para cima (vindo do VilaDoVarejo)
        this.direcaoAuto = vemDeCima ? 1 : -1;
        this.modoAuto = true;
        this.fazendoTransicao = false;
        this.portaisAtivos = false;

        // Ativa os portais após 1 segundo (evita transição imediata)
        this.time.delayedCall(1000, () => {
            this.portaisAtivos = true;
        });

        // ── Portal cima → MapaGelo ────────────────────────────────────────────
        this.portalCima = this.add.zone(centerX, centerY - 55, 800, 20);
        this.physics.add.existing(this.portalCima);
        this.portalCima.body.setAllowGravity(false);
        this.portalCima.body.moves = false;

        // ── Portal baixo → VilaDoVarejo ───────────────────────────────────────
        this.portalBaixo = this.add.zone(centerX, centerY + 55, 800, 20);
        this.physics.add.existing(this.portalBaixo);
        this.portalBaixo.body.setAllowGravity(false);
        this.portalBaixo.body.moves = false;

        // ── Câmera ────────────────────────────────────────────────────────────
        this.cameras.main.startFollow(this.personagem.sprite);
        this.cameras.main.setZoom(5.6);
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    update() {
        if (this.modoAuto) {
            const skin = this.personagem.skin;
            // Move verticalmente e toca animação de frente/costas conforme direção
            this.personagem.sprite.setVelocityX(0);
            this.personagem.sprite.setVelocityY(80 * this.direcaoAuto);

            // Descendo → animação de frente | Subindo → animação de costas
            const animDir = this.direcaoAuto === 1
                ? `${skin}_andar`   // descendo → animação de frente
                : `${skin}_costa`;  // subindo  → animação de costas

            this.personagem.sprite.play(animDir, true);
        } else {
            this.personagem.atualizar();
        }

        if (this.fazendoTransicao || !this.portaisAtivos) return;

        // ── Portal cima → MapaGelo ────────────────────────────────────────────
        const naCima = this.physics.overlap(this.personagem.sprite, this.portalCima);
        if (naCima) {
            this.fazendoTransicao = true;
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MapaGelo', { vindoDe: 'CenaPonteV' });
            });
        }

        // ── Portal baixo → VilaDoVarejo ───────────────────────────────────────
        const naBaixo = this.physics.overlap(this.personagem.sprite, this.portalBaixo);
        if (naBaixo) {
            this.fazendoTransicao = true;
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('VilaDoVarejo', { vindoDe: 'CenaPonteV' });
            });
        }
    }
}