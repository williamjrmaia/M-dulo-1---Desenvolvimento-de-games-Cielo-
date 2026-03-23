import Jogador from "../Classes/Jogador.js";

export default class VilaDoVarejo extends Phaser.Scene {
    constructor() {
        super('VilaDoVarejo');
    }

    init(data) {
        this.origem = data.vindoDe;
    }

    preload() {
        this.load.image('fundoVila', 'assets/VilaDoVarejo/vila_do_varejo.png');
        this.load.json('hitboxesVila', 'assets/VilaDoVarejo/VilaDoVarejo.tmj');
    }

    create() {
        this.fazendoTransicao = false;

        this.add.image(110, 0, 'fundoVila').setOrigin(0, 0).setScale(1);

        this.physics.world.setBounds(110, 0, 1264, 842);

        this.personagem = new Jogador(this, 400, 300, 1.5);
        this.teclas = this.personagem.configurarTeclas();
        this.personagem.sprite.setCollideWorldBounds(true);

        this.obstaculos = this.physics.add.staticGroup();

        const mapData = this.cache.json.get('hitboxesVila');
        const offsetX = 112;
        const offsetY = 4;

        if (mapData && mapData.layers) {
            mapData.layers.forEach(layer => {
                if (layer.type === 'objectgroup' && layer.objects) {
                    layer.objects.forEach(obj => {
                        let zona = this.add.zone(obj.x + offsetX, obj.y + offsetY, obj.width, obj.height).setOrigin(0, 0);
                        this.physics.add.existing(zona, true);
                        this.obstaculos.add(zona);
                    });
                }
            });
        }

        this.portaCasa1Varejo = this.add.zone(555, 225, 40, 30);
        this.physics.add.existing(this.portaCasa1Varejo, true);

        this.portaCasa2Varejo = this.add.zone(1126, 450, 40, 30);
        this.physics.add.existing(this.portaCasa2Varejo, true);

        this.portalGelo = this.add.zone(270, 20, 25, 15);
        this.physics.add.existing(this.portalGelo, true);

        this.portalparapraia = this.add.zone(1260, 40, 20, 20);
        this.physics.add.existing(this.portalparapraia, true);

        // ── ZONA DE TESTE TEMPORÁRIA ──────────────────────────────────────────
        // Remove este bloco inteiro quando o NPC da Thaina estiver no mapa.
        this.zonaTesteThaina = this.add.zone(400, 300, 60, 60);
        this.physics.add.existing(this.zonaTesteThaina, true);

        this._marcadorTeste = this.add.rectangle(400, 300, 60, 60, 0xffff00, 0.3)
            .setStrokeStyle(2, 0xffff00);
        this.add.text(400, 270, '[TESTE]\nE = Thaina', {
            fontFamily: 'Courier',
            fontSize:   '10px',
            color:      '#ffff00',
            align:      'center',
        }).setOrigin(0.5);
        // ── FIM ZONA DE TESTE ─────────────────────────────────────────────────

        this.physics.add.collider(this.personagem.sprite, this.obstaculos);

        this.cameras.main.startFollow(this.personagem.sprite);
        this.cameras.main.setZoom(1.7);
        this.cameras.main.setBounds(110, 0, 1264, 842);

        if (this.origem === 'MapaGelo') {
            this.personagem.sprite.setPosition(270, 50);
        }
        if (this.origem === 'PraiaDosProveitos') {
            this.personagem.sprite.setPosition(1260, 70);
        }
        if (this.origem === 'CasaVarejo1') {
            this.personagem.sprite.setPosition(555, 245);
        }
        if (this.origem === 'CasaVarejo2') {
            this.personagem.sprite.setPosition(1125, 465);
        }
        if (this.origem === 'CenaPonteV') {
            this.personagem.sprite.setPosition(270, 50);
        }
        if (this.origem === 'NegociacaoThaina') {
            this.personagem.sprite.setPosition(400, 320);
        }
    }

    update() {
        if (this.fazendoTransicao) return;

        this.personagem.atualizar();

        if (this.personagem.temOverlap(this.portalGelo)) {
            this.trocarCena('CenaPonteV', { vindoDe: 'VilaDoVarejo' });
            return;
        }

        if (this.personagem.temOverlap(this.portalparapraia)) {
            this.trocarCena('PraiaDosProveitos', { vindoDe: 'VilaDoVarejo' });
            return;
        }

        if (this.personagem.temOverlap(this.portaCasa1Varejo) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CasaVarejo1', { vindoDe: 'VilaDoVarejo' });
            return;
        }

        if (this.personagem.temOverlap(this.portaCasa2Varejo) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CasaVarejo2', { vindoDe: 'VilaDoVarejo' });
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
