import { atualizarMovimentoJogador, configurarTeclas, criarAnimacoesJogador } from "./funcoes.js";

export default class CenaCasa extends Phaser.Scene {

    constructor() {
        super('CenaCasa'); 
    }

    preload() {
        this.load.image('DentroCasa', '../assets/CenarioCasa/ROOM1-HOUSE/Scene1_House1.png');

        // Personagem e NPC
        this.load.spritesheet('Andando', '../assets/animacoes/andarfrente.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('IdleFrente', '../assets/animacoes/idlefrente.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('Lado', '../assets/animacoes/andarlado.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('Costa', '../assets/animacoes/andarcosta.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('cielitaparada', '../assets/NPC/cielita/idlecielita.png', { frameWidth: 16, frameHeight: 25 });
    }

    create() {
        // Cria uma variável chamada background para ser chamada nos limites do mundo
        var background = this.add.image(750, 400, 'DentroCasa').setScale(2.3);
        // NPC
        this.cielita = this.physics.add.sprite(750, 400, 'cielitaparada').setScale(2.3);
        this.cielita.setImmovable(true);

        // Personagem principal
        this.personagem = this.physics.add.sprite(750, 480, 'IdleFrente').setScale(2.3);
        this.personagem.setCollideWorldBounds(true);
        this.personagem.body.setSize(10, 15);
        this.personagem.setOffset(27, 30);

        // Limites máximos do mapa
        let larguraMapa = background.displayWidth;
        let alturaMapa = background.displayHeight;
        // Limites mínimos do mapa
        let limiteX = background.x - (larguraMapa / 2);
        let limiteY = background.y - (alturaMapa / 2);
        this.physics.world.setBounds(limiteX, limiteY, larguraMapa, alturaMapa);

        // Controles
        this.teclas = configurarTeclas(this);

        // CRIANDO AS ANIMAÇÕES
        criarAnimacoesJogador(this,this.teclas);

        this.cielita.play('cielitaparada', true);
        
        this.physics.add.collider(this.personagem, this.cielita);

        this.gatilhoPorta = this.add.zone(limiteX + larguraMapa/2,limiteY + alturaMapa - 20, 40, 40);
        this.physics.add.existing(this.gatilhoPorta);
        this.gatilhoPorta.body.setAllowGravity(false);
        this.gatilhoPorta.body.setImmovable(true);
     
        this.naPorta = false
        this.physics.add.overlap(this.personagem, this.gatilhoPorta, () => {
            this.naPorta = true;
        }, null, this )
    }
    


    update() {
        
        atualizarMovimentoJogador(this.personagem, this.teclas);

        if (!this.physics.overlap(this.personagem, this.gatilhoPorta)) {
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