import Jogador from '../Classes/Jogador.js';
import NPC     from '../Classes/NPC.js';

// Falas do Seu Pedro — definidas aqui, sem DialogoPedro.js
const FALAS_PEDRO = [
    { personagem: 'Seu Pedro', texto: 'Bem-vindo à minha loja de carnes congeladas! Aqui você encontra o melhor do frio.' },
    { personagem: 'Seu Pedro', texto: 'Temos costela, frango, peixe... tudo fresquinho e bem geladinho!' },
    { personagem: 'Jogador',   texto: 'Uau, que variedade! Quanto custa a costela?' },
    { personagem: 'Seu Pedro', texto: 'Pra você, faço um preço especial. Mas precisa ser hoje, tá? O estoque tá acabando!' },
    { personagem: 'Jogador',   texto: 'Vou pensar e já volto!' },
    { personagem: 'Seu Pedro', texto: 'Tô aqui esperando. Pode contar comigo!' },
];

export default class CenaCasaGelo extends Phaser.Scene {
    constructor() {
        super('CenaCasaGelo');
    }

    init(data) {
        this.origem = data.vindoDe;
    }

    preload() {
        this.load.image('CasaPedro',    'assets/MapaGelo/CasaPedro.png');
        this.load.tilemapTiledJSON('mapa_casa', 'assets/MapaGelo/CasaPedroHitbox.tmj');
        this.load.image('IndicadorE',   'assets/objetos/botao_e.png');
        this.load.image('balao',        'assets/objetos/balao dialogo.png');
        this.load.image('seupedro_idl', 'assets/NPC/Pedro/spr_seupedro_front_idl_stop.png');
    }

    create() {
        const centerX = 750;
        const centerY = 400;

        // ── Fundo ─────────────────────────────────────────────────────────────
        const bg = this.add.image(centerX, centerY, 'CasaPedro');

        // ── Mapa / Hitboxes ───────────────────────────────────────────────────
        const map    = this.make.tilemap({ key: 'mapa_casa' });
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
        } else {
            console.error("Camada 'Object Layer 1' não encontrada no Tiled.");
        }

        // ── Jogador ───────────────────────────────────────────────────────────
        this.personagem = new Jogador(this, centerX, centerY + 100, 1.0);
        this.personagem.sprite.setScale(1.3);
        this.personagem.sprite.setCollideWorldBounds(true);
        this.personagem.sprite.setDepth(2);
        this.teclas = this.personagem.configurarTeclas();

        this.physics.add.collider(this.personagem.sprite, paredes);

        // ── Grupo NPC (colisão NPC↔NPC e NPC↔Jogador) ────────────────────────
        this.grupoNPCs = this.physics.add.group();

        // ── NPC: Seu Pedro ────────────────────────────────────────────────────
        this.pedro = new NPC(this, 710, 390, 'seupedro_idl', {
            velocidade:         0,           // estático — sem patrulha
            distanciaInteracao: 80,
            grupoNPCs:          this.grupoNPCs,
            onFimDialogo: () => {
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('NegociacaoPedro');
                });
            },
            // animacoes: não configuradas — Pedro usa sprite estático por enquanto
            // Quando tiver spritesheet direcional, adicione as chaves aqui:
            // animacoes: { idle: 'pedro_idle', lado: 'pedro_lado', ... }
        });
        this.pedro.setScale(1.5);
        this.pedro.setDepth(5);
        this.pedro.setFalas(FALAS_PEDRO);

        // Colisão NPC↔NPC (chamada uma vez após criar todos os NPCs)
        this.physics.add.collider(this.grupoNPCs, this.grupoNPCs);

        // Colisão Jogador↔Pedro
        this.personagem.adicionarColisao(this.pedro);

        // ── Porta de saída ────────────────────────────────────────────────────
        this.portaPedro = this.add.zone(751, 530, 45, 15);
        this.physics.add.existing(this.portaPedro);
        this.portaPedro.body.setAllowGravity(false);
        this.portaPedro.body.moves = false;

        // ── Câmera ────────────────────────────────────────────────────────────
        this.cameras.main.startFollow(this.personagem.sprite);
        this.cameras.main.setZoom(2.4);
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    update() {
        this.personagem.atualizar();

        // Delega toda a lógica de interação do Pedro para a classe NPC
        this.pedro.atualizar(this.personagem.sprite, this.teclas.interagir);

        // ── Porta de saída ────────────────────────────────────────────────────
        const estaNoPortal     = this.physics.overlap(this.personagem.sprite, this.portaPedro);
        const apertouInteragir = Phaser.Input.Keyboard.JustDown(this.teclas.interagir);

        if (estaNoPortal && apertouInteragir && !this.pedro.dialogoAberto) {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MapaGelo', { vindoDe: 'CenaCasaGelo' });
            });
        }
    }
}
