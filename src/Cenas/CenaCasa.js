import Jogador from "./classes.js";

export default class CenaCasa extends Phaser.Scene {

    constructor() {
        super('CenaCasa');
    }

    preload() {
        this.load.image('DentroCasa', '../assets/CenarioCasa/ROOM1-HOUSE/Scene1_House1.png');

        this.load.spritesheet('cielitaparada', 'assets/NPC/cielita/spr_cielita_front_idl.png', { frameWidth: 64, frameHeight: 64 })
    }

    create() {
        // Background
        var background = this.add.image(750, 400, 'DentroCasa').setScale(2.3);

        // World bounds
        let larguraMapa = background.displayWidth;
        let alturaMapa  = background.displayHeight;
        let limiteX     = background.x - larguraMapa / 2;
        let limiteY     = background.y - alturaMapa  / 2;
        this.physics.world.setBounds(limiteX, limiteY, larguraMapa, alturaMapa);

        // NPC
        this.cielita = this.physics.add.sprite(750, 400, 'cielitaparada').setScale(2.3);
        this.cielita.setImmovable(true);
        this.cielita.play('cielitaparada', true);

        // Player — sprite creation, animations and input all in one place
        this.jogador = new Jogador(this, 750, 480);
        this.teclas  = this.jogador.configurarTeclas();

        // Collisions
        this.jogador.adicionarColisao(this.cielita);

        // Door trigger
        this.gatilhoPorta = this.add.zone(limiteX + larguraMapa / 2, limiteY + alturaMapa - 20, 40, 40);
        this.physics.add.existing(this.gatilhoPorta);
        this.gatilhoPorta.body.setAllowGravity(false);
        this.gatilhoPorta.body.setImmovable(true);

        this.naPorta = false;
        this.jogador.adicionarOverlap(this.gatilhoPorta, () => {
            this.naPorta = true;
        });
    }

    update() {
        this.jogador.atualizar();

        if (!this.jogador.temOverlap(this.gatilhoPorta)) {
            this.naPorta = false;
        }

        if (this.naPorta && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('MundoCasa');
            });
        }
    }
}