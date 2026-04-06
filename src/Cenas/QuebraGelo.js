import Jogador        from '../Classes/Jogador.js';
import Insignia       from '../Classes/Insignias.js';
import NPC            from '../Classes/NPC.js';
import DialogoManager from '../Classes/DialogoManager.js';
import CenaMapa from       '../Classes/CenaMapa.js';

export default class QuebraGelo extends CenaMapa {
    constructor() { 
        super('QuebraGelo'); 
    }

    // Função de pegar a origem do mapa (usada para trocar de cena -> spawnar em um lugar específico)
    init(data) {
        this.origem = data?.vindoDe;
    }

    preload() {
        // Carregando imagens do mapa
        this.load.image('Ponte',    './assets/CenarioCasa/ponte.png');
        this.load.image('MapaGelo', './assets/MapaGelo/MapaGelo.png');
        this.load.image('Placa',    './assets/MapaGelo/PlacaCasaPedro.png');
        this.load.tilemapTiledJSON('mapa_dados', './assets/MapaGelo/MapaGeloHitbox.tmj');
        this.load.spritesheet('cielitaparada', './assets/NPC/cielita/idlecielita.png', { frameWidth: 16, frameHeight: 25 });

        // LORENA
        this.load.spritesheet('lorena_idle',   'assets/NPC/LORENA/spr_lorena_front_idl_strip.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('lorena_andar',  'assets/NPC/LORENA/spr_lorena_front_walk.png',      { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('lorena_lado',   'assets/NPC/LORENA/spr_lorena_side_walk.png',       { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('lorena_costa', 'assets/NPC/LORENA/spr_lorena_back_walk.png',       { frameWidth: 32, frameHeight: 32 });

        // Carrega os assets de todas as insígnias
        Insignia.preload(this);
    }

    create() {
        super.create();
        this._mensagemBloqueio = null;

        const nomeJogador = this.game.registry.get('nomeJogador')
                 || localStorage.getItem('nomeJogador')
                 || 'Jogador';

        // Controla se os diálogos já foram concluídos puxando do registro global
        this.dialogoCielitaConcluido = this.registry.get('cielita_gelo_concluido') || false;
        this.dialogoLorenaConcluido  = this.registry.get('lorena_gelo_concluido') || false;

        // debug para coordenadas
        this.input.on('pointerdown', p => console.log(`x: ${p.worldX.toFixed(0)}, y: ${p.worldY.toFixed(0)}`));

        // Toca música do Quebra Gelo
        this.registry.get('audio').tocarMusica('musica_quebragelo', 0.5);
        // Toca som ambiente do Quebra Gelo
        this.registry.get('audio').tocarAmbiente('ambiente_quebragelo', 0.6);

        const larguraMapa = 1500;
        const alturaMapa  = 1200;

        // Colocando o centro do limite + paredes
        this.physics.world.setBounds(0, 0, larguraMapa, alturaMapa);
        this.cameras.main.setBounds(0, 0, larguraMapa, alturaMapa);

        // Criando o tilemap (hitbox) do mapa de Gelo, cujo nome é 'mapa_dados'
        const mapa = this.make.tilemap({ key: 'mapa_dados' });
        // Criando a imagem do mapa de gelo + a placa da casa do SeuPedro
        this.add.image(0, 0, 'MapaGelo').setOrigin(0, 0);
        this.add.image(655, 155, 'Placa').setScale(0.4);

        // Animações de NPCs
        NPC.criarAnimacoes(this, [
            { key: 'cielitaparada', frameRate: 3 },
            { key: 'lorena_idle',   frameRate: 3 },
            { key: 'lorena_andar',  frameRate: 4 },
            { key: 'lorena_lado',   frameRate: 4 },
            { key: 'lorena_costa', frameRate: 4 },
        ]);

        // ── Grupo de NPCs ─────────────────────────────────────────────────────
        this.grupoNPCs = this.physics.add.group();

        // ── NPC: Cielita ──────────────────────────────────────────────────────
        this.cielita = new NPC(this, 300, 190, 'cielitaparada', {
            velocidade:         0,
            distanciaInteracao: 60,
            grupoNPCs:          this.grupoNPCs,
            animacoes: { idle: 'cielitaparada' },
            scaleIndicador:     1.3,
            onFimDialogo: () => {
                this.dialogoCielitaConcluido = true;
                this.registry.set('cielita_gelo_concluido', true); // Salva no registro
            },

        });
        // Proporções e ambientação da NPC Cielita
        this.cielita.setScale(1.1);
        this.cielita.setDepth(5);
        this.cielita.setFalas([
    { personagem: 'Cielita', texto: 'Bem-vindo ao Mapa Gelo! Aqui o frio é intenso, mas as oportunidades são ainda maiores.' },
    { personagem: 'Cielita', texto: 'Explore com cuidado — há lojas, iglus e moradores para conversar.' },
    { personagem: 'Cielita', texto: 'Converse com todos para saber mais sobre a região e sua história.' },
    { personagem: 'Cielita', texto: 'Algumas casas são interagiveis, desbrave toda a região' },
    { personagem: 'Cielita', texto: 'Se quiser visitar o Seu Pedro, procure a porta marcada pela placa ao norte.' },
    { personagem: 'Jogador', texto: 'Obrigado, Cielita! Vou explorar tudo por aqui.' },
    { personagem: 'Cielita', texto: 'Boa sorte, aventureiro! Estarei aqui se precisar de mim.' },
]);
        // -- NPC: Lorena
        this.lorena = new NPC(this, 300, 320, 'lorena_idle', {
            velocidade:         40,
            distanciaInteracao: 30,
            grupoNPCs:          this.grupoNPCs,
            animacoes: {
                idle:  'lorena_idle',
                andar: 'lorena_andar',
                costa: 'lorena_costa',
                lado:  'lorena_lado',
            },
            scaleIndicador: 1.3,
            onFimDialogo: () => {
                this.dialogoLorenaConcluido = true;
                this.registry.set('lorena_gelo_concluido', true); // Salva no registro
            },
            waypoints: [
                { x: 0,   y: 0   },
                { x: 0,   y: 200 },
                { x: 315, y: 200 },
                { x: 315, y: 0   },
            ],
        });

        this.lorena.setFalas([
            { personagem: 'Lorena', texto: 'Olá! Me chamo Lorena, você é novo por aqui?' },
            { personagem: 'Jogador', texto: `Sim, sou um(a) GN explorando o Cielo Verso, me chamo ${nomeJogador}. Prazer em conhecê-la!` },
            { personagem: 'Lorena', texto: `Prazer, ${nomeJogador}! Aqui no Quebra Gelo ouvi boatos sobre problemas com Sondagem, nesses últimos dias o Seu Pedro esteve irritado com novos exploradores...` },
            { personagem: 'Lorena', texto: `... que estavam sendo insistentes de uma forma irritante.` },
            { personagem: 'Jogador', texto: `Obrigado, Lorena! Irei verificar isso.` },
        ]);
        this.lorena.setScale(1.1);
        this.lorena.body.setSize(14, 19);

        // Colisão NPC↔NPC
        this.physics.add.collider(this.grupoNPCs, this.grupoNPCs);

        // ── Jogador ───────────────────────────────────────────────────────────
        this.personagem = new Jogador(this, 25, 212, 1.0);
        this.personagem.superficiePasso = 'passos_quebragelo';
        this.personagem.sprite.setCollideWorldBounds(true);
        this.personagem.sprite.setDepth(10);

        this.personagem.adicionarColisao(this.cielita);
        // Colisão Jogador↔Cielita
        this.personagem.adicionarColisao(this.grupoNPCs);

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

        // ── PORTAIS E PORTAS ──────────────────────────────────────────────────
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
        this.cameras.main.setBounds(0, 0, 1024, 1024);
        
        if (this.origem === 'CenaCasaGelo') this.personagem.sprite.setPosition(655, 210);
        if (this.origem === 'CasaGelo2')    this.personagem.sprite.setPosition(400, 675);
        if (this.origem === 'PonteQG_VV')   this.personagem.sprite.setPosition(897, 990);

        // ── Câmera UI para diálogos ───────────────────────────────────────────
        DialogoManager.configurarCameraUI(this, 2.6, [this.cielita, this.lorena]);
        
        // Exibe o indicativo inicial apenas se ainda não tiver falado com a Cielita
        if (!this.dialogoCielitaConcluido) {
            this.game.events.emit('atualizarBalao', { texto: 'Fale com a Cielita', visivel: true });
        }

        // Verifica e concede a insígnia se o jogador já completou ambas as negociações
        this._verificarEConcederInsignia();
    }

    update() {
        if (super.update()) return;

        this.personagem.atualizar();
        // ── Atualiza NPCs (lida com indicador E, diálogo e proximidade) ───────
        this.cielita.atualizar(this.personagem.sprite, this.teclas.interagir);
        this.lorena.atualizar(this.personagem.sprite, this.teclas.interagir);

        // ── Atualiza HUD conforme o progresso dos diálogos ───────────────────
        const distLorena = Phaser.Math.Distance.Between(
            this.personagem.sprite.x, this.personagem.sprite.y,
            this.lorena.x,            this.lorena.y
        );
        const pertoLorena = distLorena <= this.lorena._cfg.distanciaInteracao;

        // Puxa do registro se o Pedro já foi vencido
        const registry = this.registry.get('negociacoesVencidas') ?? {};
        const pedroVencido = !!registry['pedro_vencido'];

        // Porta do Pedro (acougue) - usado para trocar a missão quando o jogador se aproxima
        const naPorta1 = this.personagem.temOverlap(this.GeloPorta);
        const naPorta2 = this.personagem.temOverlap(this.GeloPorta2);
        const pertoAcougue = naPorta1 || naPorta2;

        if (this.cielita.dialogoAberto || this.lorena.dialogoAberto) {
            // Qualquer diálogo aberto: esconde o balão
            this.game.events.emit('atualizarBalao', { texto: '', visivel: false });
        } else if (!this.dialogoCielitaConcluido) {
            // Ainda não falou com a Cielita
            this.game.events.emit('atualizarBalao', { texto: 'Fale com a Cielita', visivel: true });
        } else if (!this.dialogoLorenaConcluido && pertoLorena) {
            // Perto da Lorena mas ainda não conversou
            this.game.events.emit('atualizarBalao', { texto: 'Fale com a Lorena', visivel: true });
        } else if (!this.dialogoLorenaConcluido) {
            // Já falou com a Cielita, ainda não encontrou a Lorena
            this.game.events.emit('atualizarBalao', { texto: 'Procure por lorena pelo mapa', visivel: true });
        } else if (!pedroVencido) {
            // Já falou com a Lorena E ainda não venceu o Pedro: indica a próxima etapa
            if (pertoAcougue) {
                this.game.events.emit('atualizarBalao', { texto: 'Entre no Acougue', visivel: true });
            } else {
                this.game.events.emit('atualizarBalao', { texto: 'Procure o acougue do Pedro', visivel: true });
            }
        } else {
            // Já venceu o Pedro: próxima missão é ir para a Vila do Varejo
            this.game.events.emit('atualizarBalao', { texto: 'Procure a ponte para ir a vila do varejo', visivel: true });
        }

        // ── Portal de volta — livre, sem verificação de insígnia ──────────────
        if (this.personagem.temOverlap(this.PortalGelo)) {
            this.trocarCena('PonteMC_QG');
            return;
        }

        // ── Portal VilaDoVarejo — exige insígnia ──────────────────────────────
        if (this.personagem.temOverlap(this.PortalVarejo)) {
            // Nota: Adicione a função _temInsignia() se ela não estiver na classe
            if (typeof this._temInsignia === 'function' && !this._temInsignia()) {
                this._mostrarMensagemBloqueio();
                return;
            }
            this.trocarCena('PonteQG_VV');
            return;
        }

        // ── Porta Casa do Pedro — aperta E para entrar ────────────────────────
        if (pertoAcougue && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CenaCasaGelo');
            return;
        }

        // ── Porta CasaGelo2 — LIVRE, sem verificação de insígnia ─────────────
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

        const bg = this.add.rectangle(W / 2, H * 0.2, 520, 60, 0x000000, 0.8)
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
}