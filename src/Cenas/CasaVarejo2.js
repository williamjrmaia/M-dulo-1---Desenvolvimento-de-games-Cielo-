import Jogador from '../Classes/Jogador.js';

export default class CasaVarejo2 extends Phaser.Scene {

    constructor() {
        super('CasaVarejo2');
    }

    init(data) {
        this.origem = data.vindoDe; 
    }

    preload() {
         this.load.image('CasaVarejo1', 'assets/VilaDoVarejo/CasaVarejo1/CasaVarejo1.png');
        
    }

    create() {


        //Porta pra sair da cena
        const fundo = this.add.image(750, 400, 'CasaVarejo1');
        this.add.image(750, 510, 'portaSaida').setScale(0.7);

        this.fazendoTransicao = false;

        this.personagem = new Jogador(this, 750, 480, 1);
        this.personagem.configurarTeclas();
        this.personagem.sprite.setCollideWorldBounds(true);

        this.cameras.main.setBackgroundColor('#000000');
       
        this.teclas = this.personagem.configurarTeclas();

         //Porta para sair
        this.PortaCasaVarejo2 = this.add.zone(750, 510, 20, 10)
        this.physics.add.existing(this.PortaCasaVarejo2, true)
        
    }

    update() {
        if (this.fazendoTransicao) return;
        this.personagem.atualizar();    

       if (this.personagem.temOverlap(this.PortaCasaVarejo2) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('VilaDoVarejo', { vindoDe: 'CasaVarejo2' });
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