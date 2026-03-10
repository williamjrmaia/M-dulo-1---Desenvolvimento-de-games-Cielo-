import Jogador from './classes.js';

export default class MundoCasa extends Phaser.Scene {
    constructor() { super('MundoCasa'); }



    init(data) {
        this.origem = data.vindoDe; 
    }

    preload() {
        this.load.image('MundoCasa', 'assets/CenarioCasa/Scene1.png');
        this.load.image('MenuFundo', 'assets/menu/menu_fundo.png');
    }

    create() {
        this.add.image(750, 400, 'MenuFundo');
        
        //usa a variavel background apenas na parte que o player deve andar
        var background = this.add.image(750, 400, 'MundoCasa');

        // limites da cena
        let larguraMapa = background.displayWidth ;
        let alturaMapa  = background.displayHeight ;
        let limiteX     = (background.x - larguraMapa / 2) -25;
        let limiteY     = (background.y - alturaMapa  / 2) - 40;
        this.physics.world.setBounds(limiteX, limiteY, larguraMapa, alturaMapa);

        

        // Player
        this.personagem = new Jogador(this, 750, 480, 1.0);
        this.teclas = this.personagem.configurarTeclas();
        console.log()
        // House hitbox (blocks the player)
        this.gatilhoCasa = this.add.zone(875, 337, 73, 55);
        this.physics.add.existing(this.gatilhoCasa);
        this.gatilhoCasa.body.setImmovable(true);
        this.gatilhoCasa.body.setAllowGravity(false);

        //Zonas de hitbox
        this.pontebraco1 = this.add.zone(930, 390, 40, 15);
        this.physics.add.existing(this.pontebraco1);
        this.pontebraco1.body.setImmovable(true);
        this.pontebraco1.body.setAllowGravity(false);
        this.personagem.adicionarColisao(this.pontebraco1);
        
        this.pontebraco2 = this.add.zone(930, 430, 40, 15);
        this.physics.add.existing(this.pontebraco2);
        this.pontebraco2.body.setImmovable(true);
        this.pontebraco2.body.setAllowGravity(false);
        this.personagem.adicionarColisao(this.pontebraco2);

        //Portal para transicionar entre MundoCasa e ZonaGelo 
        this.portalGelo = this.add.zone(925, 410, 10, 13);
        this.physics.add.existing(this.portalGelo);


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
        
        //Sistema de trava para o FadeOut do Portal (porque ele usa o Overlap no update, então fica sempre iniciando a animação quando o boneco está por cima)
        this.fazendoTransicao = false

        //Sistema para spawnar na ponte se estiver voltando do MapaGelo
   
        if (this.origem === 'MapaGelo') {
            this.personagem.sprite.setPosition(900, 400)
        }

        

        this.cameras.main.setZoom(2.6);
        this.cameras.main.setBounds(0, 0, 1500, 800);
        this.cameras.main.startFollow(this.personagem.sprite);
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

         if (!this.personagem.temOverlap(this.portalGelo)) {
            this.noPortal = false;
        }

         if (this.personagem.temOverlap(this.portalGelo) && !this.fazendoTransicao) {
            this.fazendoTransicao = true

            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('MapaGelo');
            });
        }

        this.cameras.main.setZoom(2.6);
        this.cameras.main.setBounds(0, 0, 1500, 800);
        this.cameras.main.startFollow(this.personagem.sprite);
    }
}