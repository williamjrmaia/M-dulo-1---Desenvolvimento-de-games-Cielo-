import Jogador        from '../Classes/Jogador.js';
import Insignia       from '../Classes/Insignias.js';
import NPC            from '../Classes/NPC.js';
import DialogoManager from '../Classes/DialogoManager.js';

// ── Falas da Cielita no início do Mapa Gelo ──────────────────────────────────
const FALAS_CIELITA_GELO = [
    { personagem: 'Cielita', texto: 'Bem-vindo ao Mapa Gelo! Aqui o frio é intenso, mas as oportunidades são ainda maiores.' },
    { personagem: 'Cielita', texto: 'Explore com cuidado — há lojas, igluus e portais escondidos por toda parte.' },
    { personagem: 'Cielita', texto: 'Se quiser visitar o Seu Pedro, procure a porta marcada pela placa ao norte.' },
    { personagem: 'Jogador',  texto: 'Obrigado, Cielita! Vou explorar tudo por aqui.' },
    { personagem: 'Cielita', texto: 'Boa sorte, aventureiro! Estarei aqui se precisar de mim.' },
];

export default class MapaGelo extends Phaser.Scene {
    constructor() {
        super('MapaGelo');
    }

    init(data) {
        this.origem = data?.vindoDe;
    }

    preload() {
        this.load.image('Ponte',    './assets/CenarioCasa/ponte.png');
        this.load.image('MapaGelo', './assets/MapaGelo/MapaGelo.png');
        this.load.image('Placa',    './assets/MapaGelo/PlacaCasaPedro.png');
        this.load.tilemapTiledJSON('mapa_dados', './assets/MapaGelo/MapaGeloHitbox.tmj');
        this.load.spritesheet('cielitaparada', './assets/NPC/cielita/idlecielita.png', { frameWidth: 16, frameHeight: 25 });
        this.load.image('balao',      './assets/objetos/balao_dialogo.png');
        this.load.image('IndicadorE', './assets/objetos/botao_e.png');

        // Carrega os assets de todas as insígnias
        Insignia.preload(this);
    }

    create() {
        this.fazendoTransicao  = false;
        this._mensagemBloqueio = null;

        const larguraMapa = 1500;
        const alturaMapa  = 1200;

        this.physics.world.setBounds(0, 0, larguraMapa, alturaMapa);
        this.cameras.main.setBounds(0, 0, larguraMapa, alturaMapa);

        const mapa = this.make.tilemap({ key: 'mapa_dados' });
        this.add.image(0, 0, 'MapaGelo').setOrigin(0, 0);
        this.add.image(655, 155, 'Placa').setScale(0.4);

        // ── Animação da Cielita ───────────────────────────────────────────────
        if (!this.anims.exists('cielitaparada')) {
            this.anims.create({
                key:       'cielitaparada',
                frames:    this.anims.generateFrameNumbers('cielitaparada', { start: 0, end: -1 }),
                frameRate: 3,
                repeat:    -1,
            });
        }

        // ── Grupo de NPCs ─────────────────────────────────────────────────────
        this.grupoNPCs = this.physics.add.group();

        // ── NPC: Cielita ──────────────────────────────────────────────────────
        this.cielita = new NPC(this, 300, 190, 'cielitaparada', {
            velocidade:         0,
            distanciaInteracao: 60,
            grupoNPCs:          this.grupoNPCs,
            animacoes: { idle: 'cielitaparada' },
            scaleIndicador:     1.3,
        });
        this.cielita.setScale(1.1);
        this.cielita.setDepth(5);
        this.cielita.setFalas(FALAS_CIELITA_GELO);

        this.physics.add.collider(this.grupoNPCs, this.grupoNPCs);

        // ── Jogador ───────────────────────────────────────────────────────────
        this.personagem = new Jogador(this, 25, 212, 1.0);
        this.personagem.sprite.setCollideWorldBounds(true);
        this.personagem.sprite.setDepth(10);

        this.personagem.adicionarColisao(this.cielita);

        // ── Hitboxes do Tiled ─────────────────────────────────────────────────
        const camadaObjetos = mapa.getObjectLayer('Object Layer 1');
        if (camadaObjetos) {
            camadaObjetos.objects.forEach(obj => {
                if (obj.polygon) {
                    const poly = this.add.polygon(obj.x, obj.y, obj.polygon, 0x0000ff, 0);
                    this.physics.add.existing(poly, true);
                    this.personagem.adicionarColisao(poly);
                } else {
                    const zonaTiled = this.add.zone(
                        obj.x + obj.width  / 2,
                        obj.y + obj.height / 2,
                        obj.width, obj.height
                    );
                    this.physics.add.existing(zonaTiled, true);
                    this.personagem.adicionarColisao(zonaTiled);
                }
            });
        }

        // ── Portais e Portas ──────────────────────────────────────────────────
        this.PortalGelo     = this.add.zone(10,  215,  10, 15);
        this.GeloPorta      = this.add.zone(622, 190,  17, 20);
        this.GeloPortaCasa2 = this.add.zone(400, 675,  20, 20);
        this.GeloPorta2     = this.add.zone(685, 190,  17, 20);
        this.PortalVarejo   = this.add.zone(897, 1015, 25, 15);
        this.ParedePortal   = this.add.zone(897, 1025, 70,  5);

        [this.PortalGelo, this.GeloPorta, this.GeloPortaCasa2,
         this.GeloPorta2, this.PortalVarejo, this.ParedePortal
        ].forEach(z => this.physics.add.existing(z, true));

        // ── Teclas e câmera ───────────────────────────────────────────────────
        this.teclas = this.personagem.configurarTeclas();
        this.cameras.main.startFollow(this.personagem.sprite);
        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.cameras.main.setBounds(0, 0, 1024, 1024);

        if (this.origem === 'CenaCasaGelo') this.personagem.sprite.setPosition(655, 210);
        if (this.origem === 'CasaGelo2')    this.personagem.sprite.setPosition(400, 675);
        if (this.origem === 'CenaPonteV')   this.personagem.sprite.setPosition(897, 990);

        // ── Câmera UI para diálogos ───────────────────────────────────────────
        DialogoManager.configurarCameraUI(this, 2.6, [this.cielita]);

        // ── Verifica e concede insígnia ao retornar da negociação ─────────────
        this._verificarEConcederInsignia();
    }

    update() {
        if (this.fazendoTransicao) return;

        this.personagem.atualizar();
        this.cielita.atualizar(this.personagem.sprite, this.teclas.interagir);

        // Portal de volta — livre
        if (this.personagem.temOverlap(this.PortalGelo)) {
            this.trocarCena('CenaPonteh', { vindoDe: 'MapaGelo' });
            return;
        }

        // Portal VilaDoVarejo — exige negociação completa
        if (this.personagem.temOverlap(this.PortalVarejo)) {
            if (!this._negociacaoCompleta()) {
                this._mostrarMensagemBloqueio();
                return;
            }
            this.trocarCena('CenaPonteV', { vindoDe: 'MapaGelo' });
            return;
        }

        // Porta Casa do Pedro
        const naPorta1 = this.personagem.temOverlap(this.GeloPorta);
        const naPorta2 = this.personagem.temOverlap(this.GeloPorta2);
        if ((naPorta1 || naPorta2) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CenaCasaGelo');
            return;
        }

        // Porta CasaGelo2
        if (this.personagem.temOverlap(this.GeloPortaCasa2) &&
            Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CasaGelo2');
        }
    }

    // ── Insígnia ──────────────────────────────────────────────────────────────

    _negociacaoCompleta() {
        const vitorias = this.registry.get('negociacoesVencidas') ?? {};
        return !!vitorias['pedro_vencido'];
    }

    _verificarEConcederInsignia() {
        const insignia = new Insignia(this, 'mapa_gelo');
        insignia.conceder();
    }

    // ── Mensagem de bloqueio ──────────────────────────────────────────────────

    _mostrarMensagemBloqueio() {
        if (this._mensagemBloqueio) return;

        const W = this.scale.width;
        const H = this.scale.height;

        const bg = this.add
            .rectangle(W / 2, H * 0.2, 520, 60, 0x000000, 0.8)
            .setStrokeStyle(2, 0xcc4444)
            .setDepth(200)
            .setScrollFactor(0);

        const texto = this.add
            .text(W / 2, H * 0.2, '⛔ Você precisa vencer a negociação com Pedro primeiro!', {
                fontFamily: '"Courier New", monospace',
                fontSize:   '13px',
                color:      '#ff6666',
                align:      'center',
                wordWrap:   { width: 500 },
            })
            .setOrigin(0.5)
            .setDepth(201)
            .setScrollFactor(0);

        this._mensagemBloqueio = { bg, texto };

        this.time.delayedCall(2500, () => {
            bg.destroy();
            texto.destroy();
            this._mensagemBloqueio = null;
        });
    }

    // ── Transição ─────────────────────────────────────────────────────────────

    trocarCena(nomeCena, dados = {}) {
        this.fazendoTransicao = true;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(nomeCena, dados);
        });
    }
}