import Jogador from '../Classes/Jogador.js';
import NPC     from '../Classes/NPC.js';

export default class CasaGelo2 extends Phaser.Scene {

    constructor() {
        super('CasaGelo2');
    }

    init(data) {
        this.origem = data.vindoDe; 
    }

    preload() {
         this.load.image('Casa2',    'assets/MapaGelo/Scene2_House2.png');
         this.load.image('PortaSaida', 'assets/CenarioCasa/ROOM1-HOUSE/porta_cielita.png');
    }

    create() {
        const centerX = 750;
        const centerY = 400;

        this.add.image(centerX, centerY, 'Casa2');

        //Personagem
        this.personagem = new Jogador(this, 600, 400, 1.3);
        this.personagem.configurarTeclas();
        this.personagem.sprite.setCollideWorldBounds(true);

        //Câmera
        this.cameras.main.startFollow(this.personagem.sprite);
        this.cameras.main.setZoom(2.4);
        this.cameras.main.fadeIn(500, 0, 0, 0);

        //Porta de sair
        this.add.image(750, 530, 'PortaSaida');
        this.PortaSaída = this.add.zone(750, 525, 40, 15);
        this.physics.add.existing(this.PortaSaída, true);

        this.teclas = this.personagem.configurarTeclas();

    }
    update() {
        this.personagem.atualizar();

        if (!this.personagem.temOverlap(this.PortaSaída)) {
            this.naPorta = false;
        } else {
        this.naPorta = true;
    }

        if (this.personagem.temOverlap(this.PortaSaída) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('MapaGelo', { vindoDe: 'CasaGelo2' });
            return;
        }
    }

    

    trocarCena(nomeCena, dados = {}) {
        this.fazendoTransicao = true;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(nomeCena, dados);
        });
    }

}