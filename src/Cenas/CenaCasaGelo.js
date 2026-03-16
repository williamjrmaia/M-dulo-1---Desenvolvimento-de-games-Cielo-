import Jogador from '../Classes/Jogador.js';
import DialogoPedro from '../Classes/DialogoPedro.js';

export default class CenaCasaGelo extends Phaser.Scene {
    constructor() { 
        super('CenaCasaGelo'); 
    }

    init(data) {
        this.origem = data.vindoDe;
    }

    preload() {
        this.load.image('CasaPedro', 'assets/MapaGelo/CasaPedro.png');
        this.load.tilemapTiledJSON('mapa_casa', 'assets/MapaGelo/CasaPedroHitbox.tmj');
        this.load.image('IndicadorE', 'assets/objetos/botao_e.png');
        this.load.image('seupedro_idl', 'assets/NPC/Pedro/spr_seupedro_front_idl_stop.png');
        this.load.image('saida', 'assets/CenarioCasa/ROOM1-HOUSE/porta_cielita.png');
    }

    create() {
        const centerX = 750;
        const centerY = 400;

        this.add.image(centerX, centerY, 'CasaPedro');

        // Porta saída na parte de baixo
        this.add.image(751, 530, 'saida').setDepth(1);


        const map = this.make.tilemap({ key: 'mapa_casa' });

        this.personagem = new Jogador(this, centerX, centerY + 100, 1.0);
        this.personagem.sprite.setScale(1.3);
        this.personagem.sprite.setCollideWorldBounds(true);
        this.teclas = this.personagem.configurarTeclas(); // ← só UMA vez

        const paredes = this.physics.add.staticGroup();
        const objetoCamada = map.getObjectLayer('Object Layer 1');

        if (objetoCamada) {
            objetoCamada.objects.forEach(obj => {
                let x = 408 + obj.x + (obj.width / 2);
                let y = 124 + obj.y + (obj.height / 2);
                let zona = this.add.zone(x, y, obj.width, obj.height);
                this.physics.add.existing(zona, true);
                paredes.add(zona);
            });
        } else {
            console.error("Camada 'Object Layer 1' não encontrada!");
        }

        this.physics.add.collider(this.personagem.sprite, paredes);

        this.seupedro = this.physics.add.sprite(750, 450, 'seupedro_idl');
        this.seupedro.setImmovable(true);
        this.seupedro.body.setAllowGravity(false);
        this.seupedro.setScale(1.5);
        this.seupedro.setDepth(5);
        this.physics.add.collider(this.personagem.sprite, this.seupedro);

        this.indicadorE = this.add.image(0, 0, 'IndicadorE')
            .setDepth(15)
            .setVisible(false)
            .setScale(1.1);

        this.DISTANCIA_INTERACAO = 30;

        this.dialogoPedro = new DialogoPedro(this, {
            caixaX:       this.cameras.main.width / 2,
            caixaY:       this.cameras.main.height - 80,
            caixaLargura: this.cameras.main.width,
            caixaAltura:  160,
        });

        this.cameras.main.startFollow(this.personagem.sprite);
        this.cameras.main.setZoom(2.4);
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // Portal de saída
        this.portaPedro = this.add.zone(751, 530, 45, 15);
        this.physics.add.existing(this.portaPedro);
        this.portaPedro.body.setAllowGravity(false);
        this.portaPedro.body.moves = false;

        this.personagem.sprite.setDepth(2);
    }

    update() {
    this.personagem.atualizar();

    // Distância até o Pedro
    const dist = Phaser.Math.Distance.Between(
        this.personagem.sprite.x, this.personagem.sprite.y,
        this.seupedro.x,          this.seupedro.y
    );
    const perto = dist <= this.DISTANCIA_INTERACAO;

    // Mostra indicador E quando perto
    this.indicadorE.setVisible(perto);
    if (perto) {
        this.indicadorE.setPosition(
            this.seupedro.x,
            this.seupedro.y - (this.seupedro.displayHeight / 2) - 12
        );
    }

    const apertouE = Phaser.Input.Keyboard.JustDown(this.teclas.interagir);

    if (apertouE) {

        // Perto do Pedro → vai pra negociação
        if (perto) {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('NegociacaoPedro');
            });
            return;
        }

        // Portal de saída
        const estaNoPortal = this.physics.overlap(this.personagem.sprite, this.portaPedro);
        if (estaNoPortal) {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MapaGelo', { vindoDe: 'CenaCasaGelo' });
            });
            return;
        }
    }
}
}