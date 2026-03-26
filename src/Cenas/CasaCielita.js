import Jogador from '../Classes/Jogador.js';
import NPC     from '../Classes/NPC.js';
import CenaMapa from '../Classes/CenaMapa.js';

const FALAS_CIELITA = [
    { personagem: 'Cielita', texto: 'Eu sou Cielita, sua guia, e estarei ao seu lado para que cada passo desta jornada se transforme em maestria.' },
    { personagem: 'Cielita', texto: 'Sinta-se à vontade para explorar e conversar comigo.' },
    { personagem: 'Cielita', texto: 'Se precisar de algo, é só me chamar!' },
    { personagem: 'Jogador', texto: 'Obrigado! Vou desbravar por todo o cielo verso.' },
];

export default class CasaCielita extends CenaMapa {

    constructor() {
        super('CasaCielita');
    }

    init(data) {
        this.origem = data?.vindoDe || null;
    }

    preload() {
        this.load.image('DentroCasa',   './assets/CenarioCasa/ROOM1-HOUSE/Scene1_House1.png');
        this.load.spritesheet('cielitaparada', './assets/NPC/cielita/idlecielita.png', { frameWidth: 16, frameHeight: 25 });
        this.load.image('balao',        './assets/objetos/balao_dialogo.png');
        this.load.image('IndicadorE',   './assets/objetos/botao_e.png');
    }

    create() {
        super.create();

        const W = this.scale.width;
        const H = this.scale.height;

        // Fundo
        const background  = this.add.image(W / 2, H / 2, 'DentroCasa').setScale(2.3);
        const larguraMapa = background.displayWidth;
        const alturaMapa  = background.displayHeight;
        const limiteX     = background.x - larguraMapa / 2;
        const limiteY     = background.y - alturaMapa  / 2;
        this.physics.world.setBounds(limiteX, limiteY, larguraMapa, alturaMapa);

        // Animacao Cielita
        if (!this.anims.exists('cielitaparada')) {
            this.anims.create({
                key:       'cielitaparada',
                frames:    this.anims.generateFrameNumbers('cielitaparada', { start: 0, end: -1 }),
                frameRate: 3,
                repeat:    -1,
            });
        }

        // Grupo NPC
        this.grupoNPCs = this.physics.add.group();

        // NPC: Cielita
        this.cielita = new NPC(this, W / 2, H / 2, 'cielitaparada', {
            velocidade:         0,
            distanciaInteracao: 80,
            grupoNPCs:          this.grupoNPCs,
            animacoes: { idle: 'cielitaparada' },
            onFimDialogo: () => {
                this.dialogoConcluido = true;
            },
        });
        this.cielita.setScale(2.3);
        this.cielita.setFalas(FALAS_CIELITA);

        this.physics.add.collider(this.grupoNPCs, this.grupoNPCs);

        // Porta da Cielita
        this.add.image(750, 705, 'portaSaida').setScale(2);

        // Controla se o diálogo já foi concluído
        this.dialogoConcluido = false;

        // Spawn do jogador
        const spawnY = this.origem === 'MundoDaCielita'
            ? limiteY + alturaMapa - 80
            : H / 2 + 80;

        this.jogador = new Jogador(this, W / 2, spawnY);
        this.teclas  = this.jogador.configurarTeclas();

        // Colisao Jogador x Cielita
        this.jogador.adicionarColisao(this.cielita);

        // Porta (gatilho de saida)
        this.gatilhoPorta = this.add.zone(limiteX + larguraMapa / 2, limiteY + alturaMapa - 20, 40, 40);
        this.physics.add.existing(this.gatilhoPorta);
        this.gatilhoPorta.body.setAllowGravity(false);
        this.gatilhoPorta.body.setImmovable(true);
        this.naPorta = false;
        this.jogador.adicionarOverlap(this.gatilhoPorta, () => { this.naPorta = true; });

        if (this.origem === 'CenaIntroducao') {
            this.time.delayedCall(700, () => {
                this.scene.launch('TutorialOverlay', { cenaOrigem: 'CasaCielita' });
                this.scene.bringToTop('TutorialOverlay');
                this.input.keyboard.enabled = false;
            });
        }
    }

    update() {
        if (super.update()) return;

        this.jogador.atualizar();
        this.cielita.atualizar(this.jogador.sprite, this.teclas.interagir);

        // ✅ CORRIGIDO: usa this.game.events para comunicação entre cenas
        if (this.cielita.dialogoAberto) {
            this.game.events.emit('atualizarBalao', { texto: '', visivel: false });
        } else if (this.dialogoConcluido) {
            this.game.events.emit('atualizarBalao', { texto: 'Saia da casa', visivel: true });
        } else {
            this.game.events.emit('atualizarBalao', { texto: 'Fale com a Cielita', visivel: true });
        }

        // Porta
        if (!this.jogador.temOverlap(this.gatilhoPorta)) this.naPorta = false;

        if (this.naPorta && !this.cielita.dialogoAberto && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('MundoDaCielita');
        }
    }
}