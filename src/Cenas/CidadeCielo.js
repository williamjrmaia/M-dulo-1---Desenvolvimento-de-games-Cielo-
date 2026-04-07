import Jogador        from "../Classes/Jogador.js";
import NPC            from "../Classes/NPC.js";
import DialogoManager from "../Classes/DialogoManager.js";
import CenaMapa       from "../Classes/CenaMapa.js";
import MiniMapa from '../Classes/MiniMapa.js';

export default class CidadeCielo extends CenaMapa {

    constructor() {
        super('CidadeCielo');
    }

    init(data) {
        this.origem = data?.vindoDe || null;
    }

    preload() {
        this.load.image('CidadeCielo', './assets/CidadeCielo/CidadeCielo.png');
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

        // Controla se o diálogo de introdução já foi concluído nesta sessão
        this.dialogoCielitaConcluido = this.registry.get('cielita_cidadecielo_concluido') || false;

        const escalaCenario = 1.5;

        const cenario = this.add.image(0, 0, 'CidadeCielo').setOrigin(0, 0).setScale(escalaCenario);
        const larguraImagem = cenario.displayWidth;
        const alturaImagem  = cenario.displayHeight;

        this.physics.world.setBounds(0, 0, larguraImagem, alturaImagem);

        // ── Animações da Cielita ──────────────────────────────────────────────
        NPC.criarAnimacoes(this, [
            { key: 'cielitaparada', frameRate: 3 },
        ]);

        // ── Grupo de NPCs ─────────────────────────────────────────────────────
        this.grupoNPCs = this.physics.add.group();

        // ── NPC: Cielita (introdução no início do mapa) ───────────────────────
        // Posicionada bem no início, perto de onde o jogador aparece (y ≈ 830)
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

        // Colisão NPC↔NPC (necessário mesmo com um único NPC)
        this.physics.add.collider(this.grupoNPCs, this.grupoNPCs);

        // ── Jogador ───────────────────────────────────────────────────────────
        this.jogador = new Jogador(this, larguraImagem / 2, 830);
        this.jogador.sprite.setCollideWorldBounds(true);
        this.jogador.sprite.setScale(1.3);
        this.miniMapa = new MiniMapa(this, this.jogador.sprite, { zoom: 0.6 })
        this.miniMapa.definirMissao(545, 550);              // triângulo da missão

        // Colisão Jogador↔Cielita
        this.jogador.adicionarColisao(this.grupoNPCs);

        // ── Criação do Portal ─────────────────────────────────────────────────
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

        // ── Posição Inicial baseada na origem ─────────────────────────────────
        if (this.origem === 'PraiaDosProveitos') {
            this.jogador.sprite.setPosition(540, 840);
        }

        // ── Câmera UI para diálogos ───────────────────────────────────────────
        // Necessária com zoom alto (2.3) para que a caixa de diálogo apareça corretamente
        DialogoManager.configurarCameraUI(this, 2.3, [this.cielita]);

        // ── HUD: indicativo inicial ───────────────────────────────────────────
        if (!this.dialogoCielitaConcluido) {
            this.game.events.emit('atualizarBalao', { texto: 'Fale com a Cielita', visivel: true });
        }
    }

    update() {
        if (super.update()) return;

        this.jogador.atualizar();
        this.miniMapa.atualizar();

        // ── Atualiza NPC Cielita ──────────────────────────────────────────────
        this.cielita.atualizar(this.jogador.sprite, [this.teclas.interagir, this.teclas.interagir2]);

        this.miniMapa.registrarNPCs(this.grupoNPCs);       // pontos amarelos dos NPCs (deixar a baixo quando criarem mais NPCs)

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
    }
}