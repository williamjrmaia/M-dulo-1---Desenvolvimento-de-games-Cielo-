import Jogador        from '../Classes/Jogador.js';
import NPC            from '../Classes/NPC.js';
import DialogoManager from '../Classes/DialogoManager.js';

export default class CasaPraia1 extends Phaser.Scene {

    constructor() {
        super('CasaPraia1');
    }

    init(data) {
        this.origem = data?.vindoDe || null;
    }

    preload() {
        this.load.image('CasaPraia1', 'assets/PraiaDosProveitos/PraiaCasa1/CasaPraia1.png');
        this.load.image('portaSaida', 'assets/CenarioCasa/ROOM1-HOUSE/porta_cielita.png');

        this.load.tilemapTiledJSON('mapaCasaPraia1', 'assets/PraiaDosProveitos/PraiaCasa1/CasaPraia1.tmj');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        const escalaCenario = 1.5;

        const cenario       = this.add.image(0, 0, 'CasaPraia1').setOrigin(0, 0).setScale(escalaCenario);
        const larguraImagem = cenario.displayWidth;
        const alturaImagem  = cenario.displayHeight;

        this.add.image(265, 380, 'portaSaida').setScale(2);

        this.physics.world.setBounds(0, 0, larguraImagem, alturaImagem);

        // ── Jogador ───────────────────────────────────────────────────────────
        this.jogador = new Jogador(this, larguraImagem / 2, 330);
        this.jogador.sprite.setCollideWorldBounds(true);
        this.jogador.sprite.setScale(1.5);

        // ── Teclas ────────────────────────────────────────────────────────────
        this.teclas = this.jogador.configurarTeclas();

        // ── NPC Chefa ─────────────────────────────────────────────────────────
        const npcX = 400;
        const npcY = 300;

        this.npcChefa = new NPC(this, npcX, npcY, 'Chefa', {
            interativo:         true,
            distanciaInteracao: 80,
            velocidade:         0,
            waypoints:          [],
            animacoes:          {},
            onFimDialogo: () => {
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    this.scene.start('NegociacaoJulia');
                });
            },
        });

        this.npcChefa.setFalas([
            { personagem: 'Chefa', texto: 'Olá, posso te ajudar?' },
            { personagem: 'Chefa', texto: 'Vamos negociar?' },
        ]);

        this.npcChefa.setScale(1.8);

        // ── Colisão do jogador com o NPC (igual ao CenaCasaGelo) ─────────────
        this.jogador.adicionarColisao(this.npcChefa);

        // ── Hitboxes do Tiled ─────────────────────────────────────────────────
        const mapa          = this.make.tilemap({ key: 'mapaCasaPraia1' });
        const camadaObjetos = mapa.getObjectLayer('Object Layer 1');

        if (camadaObjetos) {
            camadaObjetos.objects.forEach(obj => {
                if (obj.polygon) {
                    const pontosEscalados = obj.polygon.map(p => ({
                        x: p.x * escalaCenario,
                        y: p.y * escalaCenario,
                    }));

                    const poly = this.add.polygon(
                        obj.x * escalaCenario,
                        obj.y * escalaCenario,
                        pontosEscalados,
                        0x0000ff,
                        0.5
                    ).setOrigin(0, 0);

                    this.physics.add.existing(poly, true);
                    this.jogador.adicionarColisao(poly);
                } else {
                    const larguraTiled = obj.width  * escalaCenario;
                    const alturaTiled  = obj.height * escalaCenario;

                    const zonaTiled = this.add.zone(
                        (obj.x * escalaCenario) + (larguraTiled / 2),
                        (obj.y * escalaCenario) + (alturaTiled  / 2),
                        larguraTiled,
                        alturaTiled
                    );

                    this.physics.add.existing(zonaTiled, true);
                    this.jogador.adicionarColisao(zonaTiled);
                }
            });
        }

        // ── Câmera ────────────────────────────────────────────────────────────
        this.cameras.main.centerOn(larguraImagem / 2, alturaImagem / 2);
        this.cameras.main.setZoom(2);

        // ── Porta de saída ────────────────────────────────────────────────────
        this.PortaCasaPraia1 = this.add.zone(265, 380, 60, 20);
        this.physics.add.existing(this.PortaCasaPraia1, true);

        // ── Câmera UI para diálogos (igual ao CenaCasaGelo) ──────────────────
        // Deve ser chamado no final do create(), após todos os objetos criados.
        // Corrige o problema de elementos scrollFactor(0) sumindo com zoom alto.
        DialogoManager.configurarCameraUI(this, 2, [this.npcChefa]);
    }

    update() {
        this.jogador.atualizar();

        // ── Interação com o NPC ───────────────────────────────────────────────
        this.npcChefa.atualizar(this.jogador.sprite, this.teclas.interagir);

        // ── Porta de saída ────────────────────────────────────────────────────
        if (!this.npcChefa.dialogoAberto &&
            this.jogador.temOverlap(this.PortaCasaPraia1) &&
            Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {

            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('PraiaDosProveitos', { vindoDe: 'CasaPraia1' });
            });
        }
    }
}