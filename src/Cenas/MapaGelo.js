import Jogador from '../Classes/Jogador.js';
import NPC     from '../Classes/NPC.js';

// ── Falas da Cielita no início do Mapa Gelo ──────────────────────────────────
const FALAS_CIELITA_GELO = [
    { personagem: 'Cielita', texto: 'Bem-vindo ao Mapa Gelo! Aqui o frio é intenso, mas as oportunidades são ainda maiores.' },
    { personagem: 'Cielita', texto: 'Explore com cuidado — há lojas, igluus e portais escondidos por toda parte.' },
    { personagem: 'Cielita', texto: 'Se quiser visitar o Seu Pedro, procure a porta marcada pela placa ao norte.' },
    { personagem: 'Jogador', texto: 'Obrigado, Cielita! Vou explorar tudo por aqui.' },
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
        Jogador.preloadInsignias(this);
         // Assets da Cielita (mesmos do CenaCasa)
        this.load.spritesheet('cielitaparada', './assets/NPC/cielita/idlecielita.png', { frameWidth: 16, frameHeight: 25 });
        this.load.image('balao',      './assets/objetos/balao_dialogo.png');
        this.load.image('IndicadorE', './assets/objetos/botao_e.png');
    }

    create() {
        this.fazendoTransicao = false;
        const larguraMapa = 1500;
        const alturaMapa  = 1200; 

        this.physics.world.setBounds(0, 0, larguraMapa, alturaMapa);
        this.cameras.main.setBounds(0, 0, larguraMapa, alturaMapa);
        // Zoom definido antes de criar NPCs para que o DialogoManager leia o valor correto
        this.cameras.main.setZoom(2.6);

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

        // ── NPC: Cielita — posicionada perto do spawn do jogador (início do mapa) ──
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

        // Colisão NPC↔NPC
        this.physics.add.collider(this.grupoNPCs, this.grupoNPCs);

        // ── Jogador ───────────────────────────────────────────────────────────
        this.personagem = new Jogador(this, 25, 212, 1.0);
        this.personagem.sprite.setCollideWorldBounds(true);
        this.personagem.sprite.setDepth(10);

        // Colisão Jogador↔Cielita
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
                    let zonaTiled = this.add.zone(obj.x + (obj.width / 2), obj.y + (obj.height / 2), obj.width, obj.height);
                    this.physics.add.existing(zonaTiled, true);
                    this.personagem.adicionarColisao(zonaTiled);
                }
            });
        }

        // PORTAIS E PORTAS
        this.portalGelo     = this.add.zone(10,  215,  10, 15);
        this.geloPorta      = this.add.zone(622, 190,  17, 20);
        this.GeloPortaCasa2 = this.add.zone(400, 675,  20, 20);
        this.geloPorta2     = this.add.zone(685, 190,  17, 20);
        this.portalVarejo   = this.add.zone(897, 1015, 25, 15);
        this.ParedePortal   = this.add.zone(897, 1025, 70,  5);

        [this.portalGelo, this.geloPorta, this.GeloPortaCasa2,
         this.geloPorta2, this.portalVarejo, this.ParedePortal
        ].forEach(z => this.physics.add.existing(z, true));

        // Parede abaixo do portal (evita vazar do mapa)
        this.ParedePortal = this.add.zone(897, 1025, 70, 5);
        this.physics.add.existing(this.ParedePortal, true);

        // ── Teclas e câmera ───────────────────────────────────────────────────
        this.teclas = this.personagem.configurarTeclas();
        this.cameras.main.startFollow(this.personagem.sprite);
        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.cameras.main.setBounds(0, 0, 1024, 1024);

        if (this.origem === 'CenaCasaGelo') this.personagem.sprite.setPosition(655, 210);
        if (this.origem === 'VilaDoVarejo') this.personagem.sprite.setPosition(897, 980);
        if (this.origem === 'CasaGelo2')    this.personagem.sprite.setPosition(400, 675);

         //── Câmera UI para diálogos ───────────────────────────────────────────
        // A câmera principal tem zoom=2.6, o que faz o Phaser aplicar um clip
        // region de 577×308px, ocultando elementos scrollFactor(0) fora dessa
        // área (ex: diálogo em y=740). Uma câmera UI separada com zoom=1 resolve
        // isso: o diálogo é ignorado pela câmera principal e renderizado apenas
        // pela câmera UI nas coordenadas de tela corretas.
        const uiCam = this.cameras.add(0, 0, this.scale.width, this.scale.height);
        const _dlg  = this.cielita._dialogo;
        if (_dlg) {
            const elementosDialogo = [_dlg._fundo, _dlg._textoNome, _dlg._textoFala, _dlg._indicador].filter(Boolean);
            const objetosMundo     = this.children.list.filter(obj => !elementosDialogo.includes(obj));
            uiCam.ignore(objetosMundo);
            this.cameras.main.ignore(elementosDialogo);

        // Verifica e concede a insígnia se o jogador já venceu a negociação
        this.personagem.verificarInsigniaMapa('mapa_gelo');
    }
}

    update() {
        if (this.fazendoTransicao) return;

        this.personagem.atualizar();
         // ── Atualiza Cielita (lida com indicador E, diálogo e proximidade) ────
        this.cielita.atualizar(this.personagem.sprite, this.teclas.interagir);

        // Portais automáticos (sem tecla E)
        if (this.personagem.temOverlap(this.portalGelo)) {
            this.trocarCena('CenaPonteh', { vindoDe: 'MapaGelo' });
            return;
        }

        if (this.personagem.temOverlap(this.portalVarejo)) {
            this.trocarCena('VilaDoVarejo', { vindoDe: 'MapaGelo' });
            return;
        }

        // Porta Casa do Pedro — aperta E para entrar
        const naPorta1 = this.personagem.temOverlap(this.geloPorta);
        const naPorta2 = this.personagem.temOverlap(this.geloPorta2);
        if ((naPorta1 || naPorta2) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CenaCasaGelo');
            return;
        }
    
     
        if (naPorta2 && !this.cielita.dialogoAberto) {
            if (Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
                this.trocarCena('CasaGelo2');
            }
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