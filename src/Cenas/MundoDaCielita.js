import CenaMapa from '../Classes/CenaMapa.js';
import Jogador from '../Classes/Jogador.js';

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
    }

    update() {
        if (super.update()) return;

        this.personagem.atualizar();

        // ✅ Lógica do balão indicativo
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
        }
}