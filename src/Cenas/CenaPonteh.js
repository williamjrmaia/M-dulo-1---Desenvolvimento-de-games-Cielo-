import Jogador from '../Classes/Jogador.js';

export default class CenaPonte extends Phaser.Scene {
    constructor() {
        super('CenaPonteh');
    }

    init(data) {
        this.origem = data.vindoDe;
    }

    preload() {
        this.load.image('fundo_ponte', 'assets/CenarioCasa/ponte.png');
    }

    create() {
        const centerX = 750;
        const centerY = 400;

        this.add.image(centerX, centerY, 'fundo_ponte').setOrigin(0.5, 0.5);

        //Prolongamento da ponte de transição
        this.add.image(centerX - 75, centerY, 'fundo_ponte').setOrigin(0.5, 0.5);
        this.add.image(centerX + 75, centerY, 'fundo_ponte').setOrigin(0.5, 0.5);
        this.add.image(centerX - 150, centerY, 'fundo_ponte').setOrigin(0.5, 0.5);
        this.add.image(centerX + 150, centerY, 'fundo_ponte').setOrigin(0.5, 0.5);
        this.add.image(centerX - 225, centerY, 'fundo_ponte').setOrigin(0.5, 0.5);
        this.add.image(centerX + 225, centerY, 'fundo_ponte').setOrigin(0.5, 0.5);

        const spawnX = (this.origem === 'MundoCasa' || !this.origem) ? centerX - 60 : centerX + 60;
        const spawnY = centerY - 10;

        this.personagem = new Jogador(this, spawnX, spawnY, 1.0);
        this.personagem.sprite.setScale(1.0);
        this.personagem.sprite.setDepth(2);
        this.teclas = this.personagem.configurarTeclas();

        this.direcaoAuto = (this.origem === 'MundoCasa' || !this.origem) ? 1 : -1;
        this.modoAuto = true;
        this.fazendoTransicao = false;
        this.portaisAtivos = false;

        // Ativa os portais após 1 segundo
        this.time.delayedCall(1000, () => {
            this.portaisAtivos = true;
        });

        this.input.keyboard.once('keydown', () => {
            this.modoAuto = false;
        });

        // ── Portal esquerda → MundoCasa ───────────────────────────────────────
        this.portalEsquerda = this.add.zone(centerX - 55, centerY, 20, 800);
        this.physics.add.existing(this.portalEsquerda);
        this.portalEsquerda.body.setAllowGravity(false);
        this.portalEsquerda.body.moves = false;

        // ── Portal direita → MapaGelo ─────────────────────────────────────────
        this.portalDireita = this.add.zone(centerX + 55, centerY, 20, 800);
        this.physics.add.existing(this.portalDireita);
        this.portalDireita.body.setAllowGravity(false);
        this.portalDireita.body.moves = false;

        // ── Câmera ────────────────────────────────────────────────────────────
        this.cameras.main.startFollow(this.personagem.sprite);
        this.cameras.main.setZoom(4.4);
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    update() {
    if (this.modoAuto) {
        const skin = this.personagem.skin;
        this.personagem.sprite.setVelocityX(80 * this.direcaoAuto);
        this.personagem.sprite.play(`${skin}_lado`, true);
        this.personagem.sprite.setFlipX(this.direcaoAuto === 1);
    } else {
        this.personagem.atualizar();
    }

    if (this.fazendoTransicao || !this.portaisAtivos) return;

    // ── Portal esquerda → MundoCasa ───────────────────────────────────────
    const naEsquerda = this.physics.overlap(this.personagem.sprite, this.portalEsquerda);
    if (naEsquerda) {
        this.fazendoTransicao = true;
        this.game.registry.set('origemCena', 'CenaPonteh'); // ← spawn perto do portal
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MundoCasa', { vindoDe: 'CenaPonteh' });
        });
    }

    // ── Portal direita → MapaGelo ─────────────────────────────────────────
    const naDireita = this.physics.overlap(this.personagem.sprite, this.portalDireita);
    if (naDireita) {
        this.fazendoTransicao = true;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MapaGelo', { vindoDe: 'CenaPonteh' });
        });
    }
}
}