import Jogador from './classes.js';

export default class MundoCasa extends Phaser.Scene {
    constructor() { super('MundoCasa'); }

    preload() {
        this.load.image('MundoCasa', '../assets/CenarioCasa/Scene1.png');
        this.load.image('MenuFundo', '../assets/menu/menu_fundo.png');

        this.load.spritesheet('Andando',    '../assets/animacoes/andarfrente.png',  { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('IdleFrente', '../assets/animacoes/idlefrente.png',   { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('Lado',       '../assets/animacoes/andarlado.png',    { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('Costa',      '../assets/animacoes/andarcosta.png',   { frameWidth: 64, frameHeight: 64 });
    }

    create() {
        this.add.image(750, 400, 'MenuFundo');
        //usa a variavel background apenas na parte que o player deve andar
        var background = this.add.image(750, 400, 'MundoCasa');

        // limites da cena
        let larguraMapa = background.displayWidth ;
        let alturaMapa  = background.displayHeight ;
        let limiteX     = (background.x - larguraMapa / 2) - 25;
        let limiteY     = (background.y - alturaMapa  / 2) - 40;
        this.physics.world.setBounds(limiteX, limiteY, larguraMapa, alturaMapa);

        this.cameras.main.setZoom(2.6);
        this.cameras.main.setBounds(0, 0, 1500, 800);
        this.cameras.main.startFollow(this.personagem.sprite);

        // Player
        this.personagem = new Jogador(this, 750, 480, 1.0);
        this.teclas = this.personagem.configurarTeclas();
        console.log()
        // House hitbox (blocks the player)
        this.gatilhoCasa = this.add.zone(875, 337, 73, 55);
        this.physics.add.existing(this.gatilhoCasa);
        this.gatilhoCasa.body.setImmovable(true);
        this.gatilhoCasa.body.setAllowGravity(false);

        this.personagem.adicionarColisao(this.gatilhoCasa);

        // Door trigger zone (separate from the house collider)
        this.gatilhoPorta = this.add.zone(857, 370, 17, 20);
        this.physics.add.existing(this.gatilhoPorta);
        this.gatilhoPorta.body.setImmovable(true);
        this.gatilhoPorta.body.setAllowGravity(false);

        this.naPorta = false;
        this.personagem.adicionarOverlap(this.gatilhoPorta, () => {
            this.naPorta = true;
        });
    }

    update() {
        this.personagem.atualizar();

        if (!this.personagem.temOverlap(this.gatilhoPorta)) {
            this.naPorta = false;
        }

        if (this.naPorta && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('CenaCasa');
            });
        }

        ;
    }
}