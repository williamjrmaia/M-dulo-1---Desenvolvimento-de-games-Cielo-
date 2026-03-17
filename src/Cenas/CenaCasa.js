import Jogador from '../Classes/Jogador.js';
import NPC     from '../Classes/NPC.js';

// Falas da Cielita — definidas aqui, próximo da cena que as usa
const FALAS_CIELITA = [
    { personagem: 'Cielita', texto: 'Eu sou Cielita, sua guia, e estarei ao seu lado para que cada passo desta jornada se transforme em maestria.' },
    { personagem: 'Cielita', texto: 'Sinta-se à vontade para explorar e conversar comigo.' },
    { personagem: 'Cielita', texto: 'Se precisar de algo, é só me chamar!' },
    { personagem: 'Jogador', texto: 'Obrigado! Vou desbravar por todo o cielo verso.' },
];

export default class CenaCasa extends Phaser.Scene {

    constructor() {
        super('CenaCasa');
    }

    preload() {
        this.load.image('DentroCasa',   './assets/CenarioCasa/ROOM1-HOUSE/Scene1_House1.png');
        this.load.spritesheet('cielitaparada', './assets/NPC/cielita/idlecielita.png', { frameWidth: 16, frameHeight: 25 });
        this.load.image('balao',        './assets/objetos/balao_dialogo.png');
        this.load.image('IndicadorE',   './assets/objetos/botao_e.png');
        this.load.image('PortaCielita', './assets/CenarioCasa/ROOM1-HOUSE/porta_cielita.png');
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        // ── Fundo ─────────────────────────────────────────────────────────────
        const background  = this.add.image(W / 2, H / 2, 'DentroCasa').setScale(2.3);
        const larguraMapa = background.displayWidth;
        const alturaMapa  = background.displayHeight;
        const limiteX     = background.x - larguraMapa / 2;
        const limiteY     = background.y - alturaMapa  / 2;
        this.physics.world.setBounds(limiteX, limiteY, larguraMapa, alturaMapa);

        // ── Animação Cielita ──────────────────────────────────────────────────
        if (!this.anims.exists('cielitaparada')) {
            this.anims.create({
                key:       'cielitaparada',
                frames:    this.anims.generateFrameNumbers('cielitaparada', { start: 0, end: -1 }),
                frameRate: 8,
                repeat:    -1,
            });
        }

        // ── Grupo NPC ─────────────────────────────────────────────────────────
        this.grupoNPCs = this.physics.add.group();

        // ── NPC: Cielita ──────────────────────────────────────────────────────
        this.cielita = new NPC(this, W / 2, H / 2, 'cielitaparada', {
            velocidade:         0,        // estática — sem patrulha
            distanciaInteracao: 80,
            grupoNPCs:          this.grupoNPCs,
            animacoes: {
                idle: 'cielitaparada',    // toca a animação idle quando parada
            },
            // sem onFimDialogo — Cielita não aciona nenhuma cena ao fim
        });
        this.cielita.setScale(2.3);
        this.cielita.setFalas(FALAS_CIELITA);

        // Colisão NPC↔NPC (apenas um NPC aqui, mas mantemos o padrão)
        this.physics.add.collider(this.grupoNPCs, this.grupoNPCs);

        //Porta da Cielita
        this.add.image(750, 705, 'PortaCielita').setScale(2)


        this.jogador = new Jogador(this, W / 2, H / 2 + 80);
        this.teclas  = this.jogador.configurarTeclas();


        // Colisão Jogador↔Cielita
        this.jogador.adicionarColisao(this.cielita);

        // ── Porta ─────────────────────────────────────────────────────────────
        this.gatilhoPorta = this.add.zone(limiteX + larguraMapa / 2, limiteY + alturaMapa - 20, 40, 40);
        this.physics.add.existing(this.gatilhoPorta);
        this.gatilhoPorta.body.setAllowGravity(false);
        this.gatilhoPorta.body.setImmovable(true);
        this.naPorta = false;
        this.jogador.adicionarOverlap(this.gatilhoPorta, () => { this.naPorta = true; });

        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    update() {
        this.jogador.atualizar();

        // Delega toda a lógica de interação da Cielita para a classe NPC
        this.cielita.atualizar(this.jogador.sprite, this.teclas.interagir);

        // ── Porta ─────────────────────────────────────────────────────────────
        if (!this.jogador.temOverlap(this.gatilhoPorta)) this.naPorta = false;

        if (this.naPorta && !this.cielita.dialogoAberto && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('MundoCasa');
            });
        }
    }
}
