import Jogador        from '../Classes/Jogador.js';
import NPC            from '../Classes/NPC.js';
import DialogoManager from '../Classes/DialogoManager.js';

// Falas da Sofia
const FALAS_SOFIA = [
    { personagem: 'Sofia', texto: 'Olá, viajante! Bem-vindo à minha casa no mundo do gelo.' },
    { personagem: 'Sofia', texto: 'Estas terras congeladas guardam segredos que poucos ousam descobrir.' },
    { personagem: 'Jogador', texto: 'Sofia, o que você sabe sobre este lugar?' },
    { personagem: 'Sofia', texto: 'Sei que o frio aqui não é apenas clima — é um teste. Apenas os mais determinados conseguem avançar.' },
    { personagem: 'Sofia', texto: 'Se precisar de mim, estarei aqui. Boa sorte na sua jornada!' },
];

export default class CasaGelo2 extends Phaser.Scene {

    constructor() {
        super('CasaGelo2');
    }

    init(data) {
        // Recebe de qual cena o jogador veio
        this.origem = data?.vindoDe || null;
    }

    preload() {
        this.load.image('Casa2',           'assets/MapaGelo/Scene2_House2.png');
        this.load.image('sofia',           'assets/NPC/Sofia/sofia.png');
        this.load.image('balao',           'assets/objetos/balao_dialogo.png');
        this.load.image('IndicadorE',      'assets/objetos/botao_e.png');
        this.load.image('PortaSaida',      'assets/CenarioCasa/ROOM1-HOUSE/porta_cielita.png');

        // Arquivo JSON do Tiled
        this.load.tilemapTiledJSON('mapaCasaGelo2', 'assets/MapaGelo/CasaGelo2.tmj');
    }

    create() {
        const centerX    = 750;
        const centerY    = 400;
        const larguraMapa = 1500;
        const alturaMapa  = 800;

        this.cameras.main.setBounds(0, 0, larguraMapa, alturaMapa);

        // ── Fundo ──────────────────────────────────────────────────────────────
        const fundo   = this.add.image(centerX, centerY, 'Casa2');
        const offsetX = fundo.x - (fundo.width  / 2);
        const offsetY = fundo.y - (fundo.height / 2);

        this.add.image(750, 530, 'PortaSaida').setDepth(1);

        // ── Hitboxes do Tiled ──────────────────────────────────────────────────
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

        // ── Grupo NPC ──────────────────────────────────────────────────────────
        this.grupoNPCs = this.physics.add.group();

        // ── NPC: Sofia ─────────────────────────────────────────────────────────
        this.sofia = new NPC(this, 750, 460, 'sofia', {
            velocidade:         0,
            distanciaInteracao: 50,
            grupoNPCs:          this.grupoNPCs,
            animacoes:          { idle: null },
        });
        this.sofia.setScale(1.5);
        this.sofia.setDepth(5);
        this.sofia.setFalas(FALAS_SOFIA);

        this.physics.add.collider(this.grupoNPCs, this.grupoNPCs);

        // ── Jogador ────────────────────────────────────────────────────────────
        // Vindo do MapaGelo: aparece próximo à porta (parte de baixo)
        // Caso contrário: posição padrão no centro
        const spawnY = this.origem === 'MapaGelo'
            ? 520
            : centerY + 100;

        this.jogador = new Jogador(this, centerX, spawnY);
        this.jogador.sprite.setCollideWorldBounds(true);
        this.jogador.sprite.setScale(1.3);
        this.jogador.sprite.setDepth(2);
        this.teclas = this.jogador.configurarTeclas();

        // Colisões
        this.physics.add.collider(this.jogador.sprite, paredes);
        this.jogador.adicionarColisao(this.sofia);

        // ── Porta de saída (gatilho) ───────────────────────────────────────────
        this.gatilhoPorta = this.add.zone(750, 515, 60, 30);
        this.physics.add.existing(this.gatilhoPorta);
        this.gatilhoPorta.body.setAllowGravity(false);
        this.gatilhoPorta.body.moves = false;

        // ── Câmera ─────────────────────────────────────────────────────────────
        this.cameras.main.startFollow(this.jogador.sprite);
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // Câmera UI separada para diálogos ficarem visíveis com zoom alto
        DialogoManager.configurarCameraUI(this, 2.4, [this.sofia]);
    }

    update() {
        this.jogador.atualizar();

        this.sofia.atualizar(this.jogador.sprite, this.teclas.interagir);

        // DEBUG TEMPORÁRIO
        const naPorta = this.physics.overlap(this.jogador.sprite, this.gatilhoPorta);
        console.log('naPorta:', naPorta, '| jogador y:', this.jogador.sprite.y);
        if (naPorta && !this.sofia.dialogoAberto && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('MapaGelo', { vindoDe: 'CasaGelo2' });
            });
        }
    }
}