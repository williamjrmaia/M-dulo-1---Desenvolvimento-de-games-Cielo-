
import DialogoManager from '../Classes/DialogoManager.js';
import Jogador from "./classes.js";

export default class CenaCasa extends Phaser.Scene {

    constructor() {
        super('CenaCasa');
    }

    preload() {
        this.load.image('DentroCasa',   './assets/CenarioCasa/ROOM1-HOUSE/Scene1_House1.png');
        this.load.spritesheet('cielitaparada', './assets/NPC/cielita/idlecielita.png', { frameWidth: 16, frameHeight: 25 });
        this.load.image('balao',        './assets/objetos/balao_dialogo.png');
        this.load.image('IndicadorE',   './assets/objetos/botao_e.png');
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        // Background
        const background = this.add.image(W / 2, H / 2, 'DentroCasa').setScale(2.3);

        // World bounds
        const larguraMapa = background.displayWidth;
        const alturaMapa  = background.displayHeight;
        const limiteX     = background.x - larguraMapa / 2;
        const limiteY     = background.y - alturaMapa  / 2;
        this.physics.world.setBounds(limiteX, limiteY, larguraMapa, alturaMapa);

        // NPC Cielita
        this.cielita = this.physics.add.sprite(W / 2, H / 2, 'cielitaparada').setScale(2.3);
        this.cielita.setImmovable(true);
        this.cielita.play('cielitaparada', true);

        // Jogador
        this.jogador = new Jogador(this, W / 2, H / 2 + 80);
        this.teclas  = this.jogador.configurarTeclas();
        this.jogador.adicionarColisao(this.cielita);

        // Porta
        this.gatilhoPorta = this.add.zone(limiteX + larguraMapa / 2, limiteY + alturaMapa - 20, 40, 40);
        this.physics.add.existing(this.gatilhoPorta);
        this.gatilhoPorta.body.setAllowGravity(false);
        this.gatilhoPorta.body.setImmovable(true);
        this.naPorta = false;
        this.jogador.adicionarOverlap(this.gatilhoPorta, () => { this.naPorta = true; });

        // ── DialogoManager ────────────────────────────────────────────────────
        this.dialogo = new DialogoManager(this);

        this.falas = [
            { personagem: 'Cielita', texto: 'Eu sou Celita, sua guia, e estarei ao seu lado para que cada passo desta jornada se transforme em maestria.' },
            { personagem: 'Cielita', texto: 'Sinta-se à vontade para explorar e conversar comigo.' },
            { personagem: 'Cielita', texto: 'Se precisar de algo, é só me chamar!' },
            { personagem: 'Jogador', texto: 'Obrigado! Vou desbravar por todo o cielo verso.' },
        ];
        // ─────────────────────────────────────────────────────────────────────

        // Indicador "Aperte E" acima da Cielita
        this.indicadorE = this.add.image(0, 0, 'IndicadorE')
            .setDepth(11).setVisible(false).setScale(2.5);

        this.DISTANCIA_INTERACAO = 80;

        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    update() {
        this.jogador.atualizar();

        // Porta
        if (!this.jogador.temOverlap(this.gatilhoPorta)) this.naPorta = false;

        if (this.naPorta && !this.dialogo.aberto && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('MundoCasa');
            });
        }

        // Proximidade com Cielita
        const dist  = Phaser.Math.Distance.Between(
            this.jogador.sprite.x, this.jogador.sprite.y,
            this.cielita.x,        this.cielita.y
        );
        const perto = dist <= this.DISTANCIA_INTERACAO;

        // Indicador E — só aparece com diálogo fechado e jogador perto
        this.indicadorE.setVisible(perto && !this.dialogo.aberto);
        if (perto) {
            this.indicadorE.setPosition(
                this.cielita.x - 10,
                this.cielita.y - this.cielita.displayHeight / 2 - 20
            );
        }

        // Fecha se o jogador se afastar durante o diálogo
        if (!perto && this.dialogo.aberto) {
            this.dialogo.fechar();
        }

        // Tecla E
        if (Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            if (perto && !this.dialogo.aberto) {
                // Abre o diálogo — callback opcional ao fim
                this.dialogo.abrir(this.falas, () => {
                    console.log('Diálogo com Cielita encerrado.');
                });
                return;
            }
            // Avança/completa typewriter/fecha — tudo dentro do manager
            this.dialogo.avancar();
        }
    }
}
