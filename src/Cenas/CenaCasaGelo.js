import Jogador from './classes.js';

export default class CenaCasaGelo extends Phaser.Scene {
    constructor() { 
        super('CenaCasaGelo'); 
    }

    preload() {
        this.load.image('CasaPedro', 'assets/MapaGelo/CasaPedro.png');

        this.load.spritesheet('Andando',    'assets/PLAYER/MAN/BLACK/spr_player_man_front_walk_bla.png',  { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('IdleFrente', 'assets/PLAYER/MAN/BLACK/spr_player_man_front_idl_bla.png',   { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('Lado',       'assets/PLAYER/MAN/BLACK/spr_player_man_side_walk_bla.png',    { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('Costa',      'assets/PLAYER/MAN/BLACK/spr_player_man_back_walk_bla.png',   { frameWidth: 64, frameHeight: 64 });
    }

    create() {
        const larguraMapa = 1500;
        const alturaMapa = 1200; 

        this.add.image(750, 400, 'CasaPedro');

        this.physics.world.setBounds(0, 0, larguraMapa, alturaMapa);
        this.cameras.main.setBounds(0, 0, larguraMapa, alturaMapa);

        this.personagem = new Jogador(this, 750, 500, 1.0);
        this.personagem.sprite.setCollideWorldBounds(true);
        this.personagem.sprite.setScale(1.3);

        this.teclas = this.personagem.configurarTeclas();   
        this.cameras.main.centerOn(0, 100);
        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.cameras.main.setZoom(2.4);
       
        const inicioX = 575;
        const inicioY = 375;
        const larguraTotal = 340;
        const alturaTotal = 540;
        this.physics.world.setBounds(inicioX, inicioY, larguraTotal, alturaTotal);

        // ✅ ZONA DE INTERAÇÃO COM PEDRO
        this.zonaInteracaoPedro = this.add.zone(750, 300, 200, 200);
        this.physics.world.enable(this.zonaInteracaoPedro);
        this.zonaInteracaoPedro.body.setImmovable(true);
        this.zonaInteracaoPedro.body.setAllowGravity(false);
        
        // Configurar overlap para disparar a negociação
        this.physics.add.overlap(
            this.personagem.sprite, 
            this.zonaInteracaoPedro, 
            this.irParaNegociacao, 
            null, 
            this
        );
    }
        
    update() {
        this.personagem.atualizar();
    }

    irParaNegociacao() {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('NegociacaoPedro');
        });
    }
}
