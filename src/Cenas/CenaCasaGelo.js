import Jogador from '../Classes/Jogador.js';

export default class CenaCasaGelo extends Phaser.Scene {
    constructor() { 
        super('CenaCasaGelo'); 
    }

    preload() {
        this.load.image('CasaPedro', '../assets/MapaGelo/CasaPedro.png')
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

    }
        
    update() {

        this.personagem.atualizar();

    }

  
}