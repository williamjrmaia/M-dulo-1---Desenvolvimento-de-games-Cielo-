import CenaMapa from '../Classes/CenaMapa.js';
import Jogador from '../Classes/Jogador.js';
import MiniMapa from '../Classes/MiniMapa.js';

export default class MundoDaCielita extends CenaMapa {
    constructor() { super('MundoDaCielita'); }

    init(data) {
        this.origem = data.vindoDe; 
    }

    preload() {
        this.load.image('MundoCasa', 'assets/CenarioCasa/Scene1.png');
        this.load.image('MenuFundo', 'assets/menu/menu_fundo.png');
    }

    create() {
        super.create();

        this.add.image(750, 400, 'MenuFundo');
        
        const background = this.add.image(750, 400, 'MundoCasa');

        const bx = background.x - background.displayWidth  / 2;
        const by = background.y - background.displayHeight / 2;
        const bw = background.displayWidth;
        const bh = background.displayHeight;

        const espessura = 20;

        const paredeEsq = this.add.rectangle(bx + espessura / 2, by + bh / 2, espessura, bh, 0xff0000, 0);
        this.physics.add.existing(paredeEsq, true);

        const paredeDir = this.add.rectangle(bx + bw - espessura / 2, by + bh / 2, espessura, bh, 0xff0000, 0);
        this.physics.add.existing(paredeDir, true);

        const paredeCima = this.add.rectangle(bx + bw / 2, by + espessura / 2, bw, espessura, 0xff0000, 0);
        this.physics.add.existing(paredeCima, true);

        const paredeBaixo = this.add.rectangle(bx + bw / 2, by + bh - espessura / 0.7, bw, espessura, 0xff0000, 0);
        this.physics.add.existing(paredeBaixo, true);

        let spawnX = 750;
        let spawnY = 480;

        if (this.origem === 'CasaCielita') {
            spawnX = 857;
            spawnY = 370;
        } else if (this.origem === 'PonteMC_QG') {
            spawnX = 900;
            spawnY = 400;
        }

        this.personagem = new Jogador(this, spawnX, spawnY, 1.0);
        this.miniMapa = new MiniMapa(this, this.personagem.sprite, { zoom: 0.6 });
        this.miniMapa.definirMissao(100, 200);              // triângulo da missão
        this.personagem.superficiePasso = 'passos_casacielita';
        this.teclas = this.personagem.configurarTeclas();

        this.physics.add.collider(this.personagem.sprite, paredeEsq);
        this.physics.add.collider(this.personagem.sprite, paredeDir);
        this.physics.add.collider(this.personagem.sprite, paredeCima);
        this.physics.add.collider(this.personagem.sprite, paredeBaixo);

        // House hitbox
        this.gatilhoCasa = this.add.zone(875, 337, 73, 55);
        this.physics.add.existing(this.gatilhoCasa);
        this.gatilhoCasa.body.setImmovable(true);
        this.gatilhoCasa.body.setAllowGravity(false);

        // Zonas de hitbox ponte
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

        // Portal MapaGelo
        this.portalGelo = this.add.zone(925, 410, 10, 13);
        this.physics.add.existing(this.portalGelo);

        this.personagem.adicionarColisao(this.gatilhoCasa);

        // Door trigger zone
        this.gatilhoPorta = this.add.zone(857, 370, 17, 20);
        this.physics.add.existing(this.gatilhoPorta);
        this.gatilhoPorta.body.setImmovable(true);
        this.gatilhoPorta.body.setAllowGravity(false);

        this.naPorta = false;
        this.personagem.adicionarOverlap(this.gatilhoPorta, () => {
            this.naPorta = true;
        });

        this.cameras.main.setZoom(2.6);
        this.cameras.main.setBounds(0, 0, 1500, 800);
        this.cameras.main.startFollow(this.personagem.sprite);

        // Árvores de ambientação
        this.add.sprite(620, 310, 'arvore4').setDepth(310 + 35 - 10);
        this.add.sprite(720, 420, 'arvore1').setDepth(400 + 45 - 10);
        this.add.sprite(650, 500, 'arvore2').setDepth(480 + 45 - 10);
        this.add.sprite(820, 280, 'arvore3').setDepth(270 + 45 - 10);
        this.add.sprite(900, 480, 'arvore4').setDepth(465 + 45 - 10);
        this.add.sprite(780, 490, 'arvore1').setDepth(470 + 45 - 10);
        this.add.sprite(920, 350, 'arvore2').setDepth(330 + 45 - 10);
        this.add.sprite(720, 320, 'arvore4').setDepth(310 + 45 - 10);

        // Hitbox das árvores
        const h1 = this.add.rectangle(618, 310 + 35, 24, 12, 0xff0000, 0);
        this.physics.add.existing(h1, true);
        this.personagem.adicionarColisao(h1); 

        const h2 = this.add.rectangle(720, 400 + 45, 19, 12, 0xff0000, 0);
        this.physics.add.existing(h2, true);
        this.personagem.adicionarColisao(h2); 

        const h3 = this.add.rectangle(650, 480 + 45, 20, 12, 0xff0000, 0);
        this.physics.add.existing(h3, true);
        this.personagem.adicionarColisao(h3); 

        const h4 = this.add.rectangle(820, 270 + 45, 20, 12, 0xff0000, 0);
        this.physics.add.existing(h4, true);
        this.personagem.adicionarColisao(h4); 

        const h5 = this.add.rectangle(900, 465 + 45, 20, 12, 0xff0000, 0);
        this.physics.add.existing(h5, true);
        this.personagem.adicionarColisao(h5); 

        const h6 = this.add.rectangle(780, 470 + 45, 19, 12, 0xff0000, 0);
        this.physics.add.existing(h6, true);
        this.personagem.adicionarColisao(h6); 

        const h7 = this.add.rectangle(920, 330 + 45, 20, 12, 0xff0000, 0);
        this.physics.add.existing(h7, true);
        this.personagem.adicionarColisao(h7); 

        const h8 = this.add.rectangle(718, 310 + 45, 22, 12, 0xff0000, 0);
        this.physics.add.existing(h8, true);
        this.personagem.adicionarColisao(h8); 

            }

    update() {
        if (super.update()) return;

        this.personagem.atualizar();
        this.miniMapa.atualizar();

        // Lógica do balão indicativo
        this.game.events.emit('atualizarBalao', { texto: 'Atravesse a ponte', visivel: true });

        if (!this.personagem.temOverlap(this.gatilhoPorta)) {
            this.naPorta = false;
        }

        if (this.naPorta && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CasaCielita');
        }

        if (this.personagem.temOverlap(this.portalGelo)) {
            this.trocarCena('PonteMC_QG');
        }

        //Senso de profundiade do personagem
        this.personagem.sprite.setDepth(this.personagem.sprite.y);
        }
}