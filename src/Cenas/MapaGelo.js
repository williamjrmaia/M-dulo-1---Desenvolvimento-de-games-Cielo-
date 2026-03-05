import Jogador from './classes.js';

export default class MapaGelo extends Phaser.Scene {
    constructor() { 
        super('MapaGelo'); 
    }

    preload() {
        // Carregamento de imagens
        this.load.image('Ponte', '../assets/CenarioCasa/ponte.png');
        this.load.image('MapaGelo', '../assets/MapaGelo/MapaGelo.png');
            
        // Carregamento do personagem
        this.load.spritesheet('Andando',    '../assets/animacoes/andarfrente.png',  { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('IdleFrente', '../assets/animacoes/idlefrente.png',   { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('Lado',       '../assets/animacoes/andarlado.png',    { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('Costa',      '../assets/animacoes/andarcosta.png',   { frameWidth: 64, frameHeight: 64 });
    }

    create() {

        this.fazendoTransicao = false;

        this.add.image(750, 400, 'MapaGelo');
        this.add.image(165, 108, 'Ponte');
        this.personagem = new Jogador(this, 120, 90, 1.0);
        
        //Hitbox das Pontes
        this.pontebraco1 = this.add.zone(220, 80, 260, 15);
        this.physics.add.existing(this.pontebraco1);
        this.pontebraco1.body.setImmovable(true);
        this.pontebraco1.body.setAllowGravity(false);
        this.personagem.adicionarColisao(this.pontebraco1);

        this.pontebraco2 = this.add.zone(220, 120, 260, 15);
        this.physics.add.existing(this.pontebraco2);
        this.pontebraco2.body.setImmovable(true);
        this.pontebraco2.body.setAllowGravity(false);
        this.personagem.adicionarColisao(this.pontebraco2);

        this.portalGelo = this.add.zone(100, 100, 10, 15);
        this.physics.add.existing(this.portalGelo);
        this.portalGelo.body.setImmovable(true);
        this.portalGelo.body.setAllowGravity(false);
     
        this.pontebraco3 = this.add.zone(90, 100, 10, 15);
        this.physics.add.existing(this.pontebraco3);
        this.pontebraco3.body.setImmovable(true);
        this.pontebraco3.body.setAllowGravity(false);
        this.personagem.adicionarColisao(this.pontebraco3);



        // 4. Configure as teclas e a câmera
        this.teclas = this.personagem.configurarTeclas();
        this.cameras.main.startFollow(this.personagem.sprite);
        this.cameras.main.setZoom(2.6);

        // Efeito de entrada suave
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }
        
       update() {
    this.personagem.atualizar();

    // Verifica se está no portal E se não está ocorrendo uma transição agora
    if (this.personagem.temOverlap(this.portalGelo)) {
        if (!this.fazendoTransicao) {
            this.fazendoTransicao = true;

            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                // Certifique-se de que a cena 'MundoCasa' também reseta as variáveis dela!
                this.scene.start('MundoCasa', { vindoDe: 'MapaGelo' });
            });
        }
    } else {
        // Opcional: Se o jogador sair do portal, garante que pode transitar de novo
        // Mas o reset no create() costuma ser o suficiente para o seu caso.
        this.fazendoTransicao = false;
         }
}       
}

    
