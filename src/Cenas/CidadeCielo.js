import Jogador        from "../Classes/Jogador.js";
import NPC            from "../Classes/NPC.js";
import DialogoManager from "../Classes/DialogoManager.js";
import CenaMapa       from "../Classes/CenaMapa.js";
import CarroCielo     from "../Classes/CarroCielo.js";
import MiniMapa       from '../Classes/MiniMapa.js';

export default class CidadeCielo extends CenaMapa {

    constructor() {
        super('CidadeCielo');
    }

    init(data) {
        this.origem = data?.vindoDe || null;
    }

    preload() {
        this.load.image('CidadeCielo',   './assets/CidadeCielo/CidadeCielo.png');
        // ── Texturas do carro ─────────────────────────────────────────────────
        this.load.image('carro_cielo',   './assets/CidadeCielo/carro_cielo.png'); // horizontal
        this.load.image('carro2',        './assets/CidadeCielo/carro2.png');      // vertical
        this.load.tilemapTiledJSON('mapaCidadeCielo', './assets/CidadeCielo/CidadeCielo.tmj');

        // ── Assets da Cielita ─────────────────────────────────────────────────
        this.load.spritesheet('cielitaparada', './assets/NPC/cielita/idlecielita.png', {
            frameWidth:  16,
            frameHeight: 25,
        });
    }

    create() {
        super.create();

        this.registry.get('audio').tocarMusica('musica_cidadecielo', 0.5);
        this.registry.get('audio').tocarAmbiente('passos_cidadecielo', 0.8);

        this.dialogoCielitaConcluido = this.registry.get('cielita_cidadecielo_concluido') || false;

        const escalaCenario = 1.5;

        const cenario      = this.add.image(0, 0, 'CidadeCielo').setOrigin(0, 0).setScale(escalaCenario);
        const larguraImagem = cenario.displayWidth;
        const alturaImagem  = cenario.displayHeight;

        this.physics.world.setBounds(0, 0, larguraImagem, alturaImagem);

        // ── Animações da Cielita ──────────────────────────────────────────────
        NPC.criarAnimacoes(this, [
            { key: 'cielitaparada', frameRate: 3 },
        ]);

        // ── Grupo de NPCs ─────────────────────────────────────────────────────
        this.grupoNPCs = this.physics.add.group();

        // ── NPC: Cielita ──────────────────────────────────────────────────────
        this.cielita = new NPC(this, larguraImagem / 1.93 - 20, 750, 'cielitaparada', {
            velocidade:         0,
            distanciaInteracao: 60,
            grupoNPCs:          this.grupoNPCs,
            animacoes:          { idle: 'cielitaparada' },
            scaleIndicador:     1.3,
            onFimDialogo: () => {
                this.dialogoCielitaConcluido = true;
                this.registry.set('cielita_cidadecielo_concluido', true);
            },
        });
        this.cielita.setScale(1.1);
        this.cielita.setDepth(5);
        this.cielita.setFalas([
            { personagem: 'Cielita', texto: 'Bem-vindo à Cidade Cielo! Este é o coração do Cielo Verso.' },
            { personagem: 'Cielita', texto: 'Aqui você encontrará habitantes, lojas e segredos espalhados por toda a cidade.' },
            { personagem: 'Cielita', texto: 'Explore cada canto com atenção — há muitas histórias esperando para serem descobertas.' },
            { personagem: 'Cielita', texto: 'Converse com os moradores, eles podem te ajudar a entender melhor este lugar.' },
            { personagem: 'Jogador', texto: 'Obrigado, Cielita! Vou explorar tudo por aqui.' },
            { personagem: 'Cielita', texto: 'Boa sorte, aventureiro! Estarei aqui se precisar de mim.' },
        ]);

        this.physics.add.collider(this.grupoNPCs, this.grupoNPCs);

        // ── Portas ────────────────────────────────────────────────────────────
        this.PortaCasaCidade1 = this.add.zone(546, 567, 50, 25);
        this.physics.add.existing(this.PortaCasaCidade1, true);

        this.PortaLojaCidade1 = this.add.zone(835, 150, 35, 25);
        this.physics.add.existing(this.PortaLojaCidade1, true);

        // ── Jogador ───────────────────────────────────────────────────────────
        this.jogador = new Jogador(this, larguraImagem / 2, 830);
        this.jogador.sprite.setCollideWorldBounds(true);
        this.jogador.sprite.setScale(1.3);

        // ── MiniMapa ──────────────────────────────────────────────────────────
        this.miniMapa = new MiniMapa(this, this.jogador.sprite, { zoom: 0.6 });
        this.miniMapa.registrarNPCs(this.grupoNPCs);
        this.miniMapa.definirMissao(545, 550);

        this.jogador.adicionarColisao(this.grupoNPCs);

        // ── Carro — percurso retangular ───────────────────────────────────────
        //
        //   A (165,684) ──[carro_cielo]──────────► B (480,684)
        //                                           │
        //                                       [carro2]
        //                                           │ ▼
        //   D (165,768) ◄──[carro_cielo flipX]── C (480,768)
        //   │
        //   [carro2 flipY] ▲
        //   │
        //   volta a A
        //
        // Ajuste xi/yi/xf/yf conforme o layout real do seu tilemap.
        // Os valores abaixo foram calculados a partir da escala 1.5 aplicada
        // ao mapa (pixel da imagem × 1.5 = coordenada do mundo de jogo).
        //
        this.carro = new CarroCielo(this, {
            pausaMs:    2000,   // pausa após completar o loop inteiro
            pausaSegMs: 150,    // pequena pausa nas esquinas (ms); use 0 para remover
            escala:     1.2,
            jogadorSprite: this.jogador.sprite,
            segmentos: [
                // ── Segmento 1: direita ──────────────────────────────────────
                // carro_cielo normal, MU horizontal
                {
                    xi: 165, yi: 684,
                    xf: 480, yf: 684,
                    T: 3,
                    textura: 'carro_cielo',
                    flipX: false,
                    flipY: false,
                },
                // ── Segmento 2: descida ──────────────────────────────────────
                // carro2 normal, MUV vertical (v0y = 0, acelera para baixo)
                {
                    xi: 480, yi: 684,
                    xf: 480, yf: 768,
                    T: 2,
                    textura: 'carro2',
                    flipX: false,
                    flipY: false,
                },
                // ── Segmento 3: esquerda ─────────────────────────────────────
                // carro_cielo espelhado em X, MU horizontal (vx negativo)
                {
                    xi: 480, yi: 768,
                    xf: 165, yf: 768,
                    T: 3,
                    textura: 'carro_cielo',
                    flipX: true,
                    flipY: false,
                },
                // ── Segmento 4: subida ───────────────────────────────────────
                // carro2 espelhado em Y, MUV vertical (v0y = 0, acelera para cima)
                {
                    xi: 165, yi: 768,
                    xf: 165, yf: 684,
                    T: 2,
                    textura: 'carro2',
                    flipX: false,
                    flipY: true,
                },
            ],
        });

        // ── Portal ────────────────────────────────────────────────────────────
        this.PortalCielo = this.add.zone(540, 880, 30, 20);
        this.physics.add.existing(this.PortalCielo, true);

        // ── Leitura de Hitboxes do Tiled ──────────────────────────────────────
        const mapa = this.make.tilemap({ key: 'mapaCidadeCielo' });
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

        // ── Teclas ────────────────────────────────────────────────────────────
        this.teclas = this.jogador.configurarTeclas();

        // ── Câmera ────────────────────────────────────────────────────────────
        this.cameras.main.startFollow(this.jogador.sprite);
        this.cameras.main.setZoom(2.3);
        this.cameras.main.setBounds(0, 0, larguraImagem, alturaImagem);

        // ── Posição inicial baseada na origem ─────────────────────────────────
        if (this.origem === 'PraiaDosProveitos') {
            this.jogador.sprite.setPosition(540, 840);
        }
        if (this.origem === 'CasaCidade1') {
            this.jogador.sprite.setPosition(546, 595);
        }
        if (this.origem === 'CasaCidade2') {
            this.jogador.sprite.setPosition(835, 150);
        }

        // ── Câmera UI para diálogos ───────────────────────────────────────────
        DialogoManager.configurarCameraUI(this, 2.3, [this.cielita]);

        // ── HUD inicial ───────────────────────────────────────────────────────
        if (!this.dialogoCielitaConcluido) {
            this.game.events.emit('atualizarBalao', { texto: 'Fale com a Cielita', visivel: true });
        }
    }

    update(time, delta) {
        if (super.update()) return;

        // ── Atualiza o carro (chamada ÚNICA por frame) ─────────────────────────
        this.carro.atualizar(this.time.now);

        this.jogador.atualizar();
        this.miniMapa.atualizar();

        // ── Atualiza NPC Cielita ──────────────────────────────────────────────
        this.cielita.atualizar(this.jogador.sprite, [this.teclas.interagir, this.teclas.interagir2]);

        // ── HUD dinâmico ──────────────────────────────────────────────────────
        if (this.cielita.dialogoAberto) {
            this.game.events.emit('atualizarBalao', { texto: '', visivel: false });
        } else if (!this.dialogoCielitaConcluido) {
            this.game.events.emit('atualizarBalao', { texto: 'Fale com a Cielita', visivel: true });
        } else {
            this.game.events.emit('atualizarBalao', { texto: '', visivel: false });
        }

        // ── Portal ────────────────────────────────────────────────────────────
        if (this.jogador.temOverlap(this.PortalCielo)) {
            this.trocarCena('PraiaDosProveitos');
            return;
        }

        if (this.jogador.temOverlap(this.PortaCasaCidade1) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CasaCidade1');
            return;
        }

        if (this.jogador.temOverlap(this.PortaLojaCidade1) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CasaCidade2');
            return;
        }
    }
}