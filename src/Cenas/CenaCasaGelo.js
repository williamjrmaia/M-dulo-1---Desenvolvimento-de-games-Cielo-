import Jogador from '../Classes/Jogador.js';

export default class CenaCasaGelo extends Phaser.Scene {
    constructor() {
        super('CenaCasaGelo');
    }

    init(data) {
        this.origem = data?.vindoDe;
    }

    preload() {
        this.load.image('CasaPedro',    'assets/MapaGelo/CasaPedro.png');
        this.load.tilemapTiledJSON('mapa_casa', 'assets/MapaGelo/CasaPedroHitbox.tmj');
        this.load.image('seupedro_idl', 'assets/NPC/Pedro/spr_seupedro_front_idl_stop.png');
    }

    create() {
        this.fazendoTransicao = false;

        const centerX = 750;
        const centerY = 400;

        this.add.image(centerX, centerY, 'CasaPedro');
        this.add.image(751, 530, 'portaSaida').setDepth(1);

        // ── Mapa / Hitboxes ───────────────────────────────────────────────────
        const map     = this.make.tilemap({ key: 'mapa_casa' });
        const paredes = this.physics.add.staticGroup();

        const objetoCamada = map.getObjectLayer('Object Layer 1');
        if (objetoCamada) {
            objetoCamada.objects.forEach(obj => {
                const x    = 408 + obj.x + obj.width  / 2;
                const y    = 124 + obj.y + obj.height / 2;
                const zona = this.add.zone(x, y, obj.width, obj.height);
                this.physics.add.existing(zona, true);
                paredes.add(zona);
            });
        }

        // ── Sprite do Pedro com colisão ───────────────────────────────────────
        // Usamos physics.add.staticImage para ter colisão no sprite
        this.spritePedro = this.physics.add.staticImage(750, 460, 'seupedro_idl')
            .setScale(1.5)
            .setDepth(5);
        // Ajusta o tamanho da hitbox para bater com o sprite visível
        this.spritePedro.setSize(
            this.spritePedro.width,
            this.spritePedro.height
        );
        this.spritePedro.refreshBody();

        // ── Zona de interação do Pedro ────────────────────────────────────────
        // Área um pouco maior que o sprite para o jogador conseguir interagir
        this.zonaPedro = this.add.zone(750, 460, 80, 80);
        this.physics.add.existing(this.zonaPedro, true);

        // ── Indicador E ───────────────────────────────────────────────────────
        // setScale(1.5) deixa o ícone maior — ajuste conforme preferir
        this.indicadorE = this.add.image(
            this.spritePedro.x,
            this.spritePedro.y - 60,
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

        // Colisão do jogador com o sprite do Pedro
        this.physics.add.collider(this.personagem.sprite, this.spritePedro);

        // ── Porta de saída ────────────────────────────────────────────────────
        this.portaSaida = this.add.zone(751, 530, 45, 15);
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

        //Se estiver na hitbox do pedro, pertoDoPedro = true
        const pertoDoPedro = this.personagem.temOverlap(this.zonaPedro);

        // Mantém o indicador sempre acima do Pedro
        this.indicadorE.setPosition(
            this.spritePedro.x,
            this.spritePedro.y - 60
        );

        //Criando o E em cima do Pedro quando estiver perto
        this.indicadorE.setVisible(pertoDoPedro);

        // Aperta E perto do Pedro → vai para NegociacaoPedro
        if (pertoDoPedro && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this._trocarCena('NegociacaoPedro');
            return;
        }

        // Aperta E na porta de saída → volta para o MapaGelo
        const naPorta = this.physics.overlap(this.personagem.sprite, this.portaSaida);
        if (naPorta && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this._trocarCena('MapaGelo', { vindoDe: 'CenaCasaGelo' });
        }
    }
    //Função pra trocar de cena com animações
    _trocarCena(nomeCena, dados = {}) {
        this.fazendoTransicao = true;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(nomeCena, dados);
        });
    }
}