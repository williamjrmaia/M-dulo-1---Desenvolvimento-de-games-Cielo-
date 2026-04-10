import CenaMapa       from '../Classes/CenaMapa.js';
import Jogador        from '../Classes/Jogador.js';
import NPC            from '../Classes/NPC.js';
import DialogoManager from '../Classes/DialogoManager.js';

export default class CenaCasaGelo extends CenaMapa {
    constructor() {
        super('CenaCasaGelo');
    }

    init(data) {
        this.origem = data?.vindoDe;
    }

    preload() {
        this.load.image('CasaPedro',    'assets/MapaGelo/CasaPedro.png');
        this.load.tilemapTiledJSON('mapa_casa', 'assets/MapaGelo/CasaPedroHitbox.tmj');
        this.load.spritesheet('seupedro_idl', 'assets/NPC/Pedro/spr_seupedro_front_idl.png', {frameWidth: 32, frameHeight: 32});
    }

    create() {
        super.create();

        NPC.criarAnimacoes(this, [
            { key: 'seupedro_idl',   frameRate: 3 },
        ]);
        const W = this.scale.width;
        const H = this.scale.height;

        const bg          = this.add.image(W / 2, H / 2, 'CasaPedro');
        const larguraMapa = bg.displayWidth;
        const alturaMapa  = bg.displayHeight;
        const limiteX     = bg.x - larguraMapa / 2;
        const limiteY     = bg.y - alturaMapa  / 2;
        this.physics.world.setBounds(limiteX, limiteY, larguraMapa, alturaMapa);

        this.add.image(W / 2, H / 2 + 130, 'portaSaida').setDepth(1);

        // ── Mapa / Hitboxes ───────────────────────────────────────────────────
        const map     = this.make.tilemap({ key: 'mapa_casa' });
        const paredes = this.physics.add.staticGroup();

        // The tilemap image layer has an offset (where CasaPedro.png sits inside
        // the Tiled canvas). Hitbox object coords are relative to the canvas origin,
        // so we must subtract that offset when converting to world coordinates.
        const tilemapCache  = this.cache.tilemap.get('mapa_casa');
        const imgLayerRaw   = tilemapCache?.data?.layers?.find(l => l.type === 'imagelayer');
        const tileImgOffsetX = imgLayerRaw?.offsetx ?? 0;
        const tileImgOffsetY = imgLayerRaw?.offsety ?? 0;

        const objetoCamada = map.getObjectLayer('Object Layer 1');
        if (objetoCamada) {
            objetoCamada.objects.forEach(obj => {
                const x    = (limiteX - tileImgOffsetX) + obj.x + obj.width  / 2;
                const y    = (limiteY - tileImgOffsetY) + obj.y + obj.height / 2;
                const zona = this.add.zone(x, y, obj.width, obj.height);
                this.physics.add.existing(zona, true);
                paredes.add(zona);
            });
        }

        // ── NPC: Pedro ────────────────────────────────────────────────────────
        this.grupoNPCs = this.physics.add.group();

        this.pedro = new NPC(this, W / 2, H / 2 + 60, 'seupedro_idl', {
            velocidade:         0,
            distanciaInteracao: 50,
            grupoNPCs:          this.grupoNPCs,
            animacoes:          { idle: 'seupedro_idl' }, // sprite estático, sem animação
            onFimDialogo: () => {
                const registry = this.registry.get('negociacoesVencidas') ?? {};
                if (!registry['pedro_vencido']) {
                    this.trocarCena('NegociacaoPedro');
                }
            },
        });
        this.pedro.setScale(1.5).setDepth(5);
        this.pedro.body.setSize(16, 16);

        this.pedro.setFalas([
            { personagem: 'Seu Pedro', texto: 'Bem-vindo!' },
            { personagem: 'Jogador',   texto: 'Olá!'      },
        ]);

        this._pedroVencidoAnterior = null; // força atualização inicial das falas

        // ── Jogador ───────────────────────────────────────────────────────────
        this.personagem = new Jogador(this, W / 2, H / 2 + 100, 1.0);
        this.personagem.sprite.setScale(1.3);
        this.personagem.sprite.setCollideWorldBounds(true);
        this.personagem.sprite.setDepth(10);
        this.teclas = this.personagem.configurarTeclas();
        this.physics.add.collider(this.personagem.sprite, paredes);
        this.personagem.adicionarColisao(this.pedro);

        // ── Porta de saída ────────────────────────────────────────────────────
        this.portaSaida = this.add.zone(W / 2, H / 2 + 130, 45, 15);
        this.physics.add.existing(this.portaSaida);
        this.portaSaida.body.setAllowGravity(false);
        this.portaSaida.body.moves = false;

        // ── Câmera ────────────────────────────────────────────────────────────
        this.cameras.main.centerOn(W / 2, H / 2);
        this.cameras.main.setZoom(2.4);
        // ── Câmera UI para diálogos ───────────────────────────────────────────
        DialogoManager.configurarCameraUI(this, 2.4, [this.pedro]);        
    }

    update() {
        if (super.update()) return;
        this.personagem.atualizar();

        // Atualiza o indicador E do Pedro (mostra quando perto, esconde quando longe)
        this.pedro.atualizar(this.personagem.sprite, [this.teclas.interagir, this.teclas.interagir2]);

        // ── HUD do Balão ──────────────────────────────────────────────────────
        const registry    = this.registry.get('negociacoesVencidas') ?? {};
        const pedroVencido = !!registry['pedro_vencido'];

        if (pedroVencido !== this._pedroVencidoAnterior) {
            this._pedroVencidoAnterior = pedroVencido;
            if (pedroVencido) {
                this.pedro.setFalas([
                    { personagem: 'Seu Pedro', texto: 'Obrigado pela maquininha!' },
                ]);
            } else {
                this.pedro.setFalas([
                    { personagem: 'Seu Pedro', texto: 'Bem-vindo!' },
                    { personagem: 'Jogador',   texto: 'Olá!'      },
                ]);
            }
        }

        if (!pedroVencido) {
            this.game.events.emit('atualizarBalao', { texto: 'Negocie com Pedro', visivel: true });
        } else {
            this.game.events.emit('atualizarBalao', { texto: '', visivel: false });
        }

        // ── Porta de saída ────────────────────────────────────────────────────
        const naPorta = this.physics.overlap(this.personagem.sprite, this.portaSaida);
        if (naPorta && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('QuebraGelo');
        }
    }
}
