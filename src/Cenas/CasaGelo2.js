import Jogador from '../Classes/Jogador.js';

export default class CasaGelo2 extends Phaser.Scene {

    constructor() {
        super('CasaGelo2');
    }

    init(data) {
        this.origem = data?.vindoDe;
    }

    preload() {
        // Imagens
        this.load.image('Casa2',      'assets/MapaGelo/Scene2_House2.png');
        this.load.image('PortaSaida', 'assets/CenarioCasa/ROOM1-HOUSE/porta_cielita.png');
        this.load.image('IndicadorE', 'assets/objetos/botao_e.png');

        // Sprite da Sofia — substitua pelo caminho correto quando tiver o asset
        this.load.image('sofia_idl',  'assets/NPC/Sofia/spr_sofia_front_idl_stop.png');

        // Arquivo JSON do Tiled
        this.load.tilemapTiledJSON('mapaCasaGelo2', 'assets/MapaGelo/CasaGelo2.tmj');
    }

    create() {
        this.fazendoTransicao = false;

        const centerX    = 750;
        const centerY    = 400;
        const larguraMapa = 1500;
        const alturaMapa  = 800;

        this.cameras.main.setBounds(0, 0, larguraMapa, alturaMapa);

        // ── Fundo ─────────────────────────────────────────────────────────────
        const fundo  = this.add.image(centerX, centerY, 'Casa2');
        const offsetX = fundo.x - (fundo.width  / 2);
        const offsetY = fundo.y - (fundo.height / 2);

        this.add.image(750, 530, 'PortaSaida').setDepth(1);

        // ── Hitboxes do Tiled ─────────────────────────────────────────────────
        const mapa          = this.make.tilemap({ key: 'mapaCasaGelo2' });
        const paredes       = this.physics.add.staticGroup();
        const camadaObjetos = mapa.getObjectLayer('Object Layer 1');

        if (camadaObjetos) {
            camadaObjetos.objects.forEach(obj => {
                if (obj.polygon) {
                    const poly = this.add.polygon(obj.x + offsetX, obj.y + offsetY, obj.polygon, 0x0000ff, 0);
                    this.physics.add.existing(poly, true);
                    paredes.add(poly);
                } else {
                    const zona = this.add.zone(
                        (obj.x + offsetX) + (obj.width  / 2),
                        (obj.y + offsetY) + (obj.height / 2),
                        obj.width,
                        obj.height
                    );
                    this.physics.add.existing(zona, true);
                    paredes.add(zona);
                }
            });
        }

        // ── Sprite da Sofia ───────────────────────────────────────────────────
        this.spriteSofia = this.physics.add.staticImage(750, 460, 'Sofia')
            .setScale(1.5)
            .setDepth(5);
        this.spriteSofia.setSize(this.spriteSofia.width, this.spriteSofia.height);
        this.spriteSofia.refreshBody();

        // ── Zona de interação da Sofia ────────────────────────────────────────
        this.zonaSofia = this.add.zone(750, 460, 80, 80);
        this.physics.add.existing(this.zonaSofia, true);

        // ── Indicador E ───────────────────────────────────────────────────────
        this.indicadorE = this.add.image(
            this.spriteSofia.x,
            this.spriteSofia.y - 60,
            'IndicadorE'
        )
            .setScale(1.5)
            .setDepth(20)
            .setVisible(false);

        // ── Jogador ───────────────────────────────────────────────────────────
        this.personagem = new Jogador(this, centerX, centerY + 100, 1.0);
        this.personagem.sprite.setScale(1.3);
        this.personagem.sprite.setCollideWorldBounds(true);
        this.personagem.sprite.setDepth(2);
        this.teclas = this.personagem.configurarTeclas();

        this.physics.add.collider(this.personagem.sprite, paredes);
        this.physics.add.collider(this.personagem.sprite, this.spriteSofia);

        // ── Porta de saída ────────────────────────────────────────────────────
        this.portaSaida = this.add.zone(750, 525, 40, 15);
        this.physics.add.existing(this.portaSaida);
        this.portaSaida.body.setAllowGravity(false);
        this.portaSaida.body.moves = false;

        // ── Câmera ────────────────────────────────────────────────────────────
        this.cameras.main.startFollow(this.personagem.sprite);
        this.cameras.main.setZoom(2.4);
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    update() {
        if (this.fazendoTransicao) return;

        this.personagem.atualizar();

        const pertoSofia = this.personagem.temOverlap(this.zonaSofia);

        // Mantém o indicador sempre acima da Sofia
        this.indicadorE.setPosition(
            this.spriteSofia.x,
            this.spriteSofia.y - 60
        );
        this.indicadorE.setVisible(pertoSofia);

        // Aperta E perto da Sofia → vai para NegociacaoSofia
        if (pertoSofia && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('NegociacaoSofia');
            return;
        }

        // Aperta E na porta de saída → volta para o MapaGelo
        const naPorta = this.physics.overlap(this.personagem.sprite, this.portaSaida);
        if (naPorta && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('MapaGelo', { vindoDe: 'CasaGelo2' });
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