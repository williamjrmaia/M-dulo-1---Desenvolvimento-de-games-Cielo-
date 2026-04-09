// CenaNegociacao.js — Classe base para todas as cenas de negociação
//
// FASES IMPLEMENTADAS:
//   abordagem   → lógica PIFE+CPC         via _resolverAbordagem()
//   sondagem    → lógica de aspectos      via _resolverSondagem()
//   demais      → lógica genérica         via _resolverCarta()

export default class CenaNegociacao extends Phaser.Scene {

    static FASES = ['abordagem', 'sondagem', 'demonstracao', 'negociacao', 'fechamento'];

    static LABELS_FASE = {
        abordagem:    'Abordagem',
        sondagem:     'Sondagem',
        demonstracao: 'Demonstração',
        negociacao:   'Negociação',
        fechamento:   'Fechamento',
    };

    static SATISFACAO_ESTADOS = [
        { min: 67, max: 100, estado: 'satisfeito', cor: 0x44cc88 },
        { min: 34, max: 66,  estado: 'neutro',     cor: 0xccaa44 },
        { min: 0,  max: 33,  estado: 'bravo',      cor: 0xcc4444 },
    ];

    static GANHO_SATISFACAO     = 20;
    static PERDA_SATISFACAO     = 15;
    static ACERTOS_PARA_AVANCAR = 3;

    static CARD_WIDTH         = 270;
    static CARD_HEIGHT        = 330;
    static CARD_SPACING       = 25;
    static CARD_ZOOM_WIDTH    = 400;
    static CARD_ZOOM_HEIGHT   = 550;
    static ANIM_FADE_DURATION = 300;
    static ANIM_HOVER_OFFSET  = 8;

    static LAYERS = {
        OVERLAY:   100,
        MODAL:     101,
        MODAL_BTN: 102,
    };

    static LETRAS_PIFE = ['P', 'I', 'F', 'E'];

    // Aspectos da sondagem na ordem de exibição dos ícones
    static ASPECTOS_SONDAGEM = ['pessoas', 'lucro', 'estoque'];

    constructor(key, clienteConfig = {}) {
        super(key);

        this.clienteConfig = {
            nomeCliente:       clienteConfig.nomeCliente        ?? 'default',
            satisfacaoInicial: clienteConfig.satisfacaoInicial  ??  0,
            cartasExigidas:    clienteConfig.cartasExigidas     ?? {},
            fases:             clienteConfig.fases              ?? CenaNegociacao.FASES,
            cartasPorFase:     clienteConfig.cartasPorFase      ?? {
                abordagem:    5,
                sondagem:     5,
                demonstracao: 5,
                negociacao:   5,
                fechamento:   5,
            },
        };

        this.faseAtual       = 0;
        this.satisfacao      = this.clienteConfig.satisfacaoInicial;
        this.cartasNaMao     = [];
        this.negociacaoAtiva = false;
        this.cartaEmDetalhes = null;
        this.acertosNaFase   = 0;

        this._paginas     = null;
        this._paginaAtual = 0;
        this.btnPrevPage  = null;
        this.btnProxPage  = null;

        // Estado da fase de abordagem
        this._letrasPreenchidas = new Set();
        this._cpcDisponivel     = false;
        this._iconesPIFE        = {};

        // Tween do pulso da carta CPC (guardado para poder cancelar ao jogar)
        this._tweenCPC = null;

        // Estado da fase de sondagem
        this._aspectosRevelados = new Set();
        this._iconesAspectos    = {};

        // Definido na subclasse — valores reais do cliente para a sondagem
        this.aspectosCliente = {
            pessoas: null,
            lucro:   null,
            estoque: null,
        };
    }

    preload() {
        this.load.image('reacao_bravo',  'assets/objetos/reacoes/reacao_bravo.png');
        this.load.image('reacao_neutro', 'assets/objetos/reacoes/reacao_neutro.png');
        this.load.image('reacao_feliz',  'assets/objetos/reacoes/reacao_feliz.png');

        const insignia = this._getInsignia();
        if (insignia) this.load.image(insignia.key, insignia.path);
    }

    create() {

        // ── CORREÇÃO: guard para evitar tela branca se AudioManager não estiver pronto ──
        const audio = this.registry.get('audio');
        if (audio) {
            audio.tocarMusica('musica_batalha', 0.5);
        }

        const W = this.scale.width;
        const H = this.scale.height;

        this._criarFundo(W, H);
        this._criarAreaCliente(W, H);
        this._criarBarraSatisfacao(W, H);
        this._criarBarraFases(W, H);
        this._criarAreaCartas(W, H);
        this._criarDialogo(W, H);

        this.negociacaoAtiva = true;
        this._iniciarFase();

        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    // ── UI ────────────────────────────────────────────────────────────────────

    _criarFundo(W, H) {
        const nome = this.clienteConfig.nomeCliente;

        // Fundo superior — imagem do cliente ou retângulo fallback
        if (this.textures.exists(`${nome}_fundo`)) {
            this.add.image(W / 2, H * 0.3, `${nome}_fundo`).setDisplaySize(W, H * 0.6);
        } else {
            this.add.rectangle(0, 0, W, H * 0.6, 0x111a24).setOrigin(0, 0);
        }

        // Área inferior das cartas — balcão ou retângulo escuro fallback
        if (this.textures.exists('balcao')) {
            this.add.image(W / 2, H * 0.79, 'balcao').setDisplaySize(W, H * 0.42);
        } else {
            this.add.rectangle(0, H * 0.58, W, H * 0.42, 0x0a0f14).setOrigin(0, 0);
        }

        // Linha divisória entre as duas áreas
        const div = this.add.graphics();
        div.lineStyle(2, 0x2a4a6a, 0.8);
        div.lineBetween(0, H * 0.58, W, H * 0.58);
    }

    _criarAreaCliente(W, H) {
        const nome         = this.clienteConfig.nomeCliente;
        const chaveInicial = `${nome}_${this._getEstadoSatisfacao()}`;

        this.add.text(W / 2, H * 0.04, nome, {
            fontFamily: '"Courier New", monospace',
            fontSize: '26px', color: '#c8e6f0', letterSpacing: 4,
            stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5);

        this.spriteCliente = this.textures.exists(chaveInicial)
            ? this.add.image(W / 2, H * 0.28, chaveInicial).setScale(0.3)
            : this.add.rectangle(W / 2, H * 0.28, 100, 150, 0x1a3a5a).setStrokeStyle(2, 0x2a6a9a);
    }

    _criarBarraSatisfacao(W, H) {
        const barraW = 300;
        const x      = W - barraW / 2 - 40;
        const y      = H * 0.08;

        this.add.text(x, y - 22, 'SATISFAÇÃO', {
            fontFamily: '"Courier New", monospace',
            fontSize: '12px', color: '#5a8a9a', letterSpacing: 3,
        }).setOrigin(0.5);

        this.barraSatisfacaoImg = this.add.image(x, y, this._getChaveBarra()).setDisplaySize(barraW, 40);
        this.reacaoImg          = this.add.image(x - barraW / 2 - 50, y, this._getChaveReacao()).setDisplaySize(40, 40).setScale(1.3);
        this.satisfacaoTexto    = this.add.text(x, y + 28, `${this.satisfacao}%`, {
            fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#7aaabb',
        }).setOrigin(0.5);

        this._criarIconesPIFE(x, barraW, y);
        this._criarIconesAspectos(x, barraW, y);
    }

    // ── Ícones PIFE+CPC ───────────────────────────────────────────────────────

    _criarIconesPIFE(barraX, barraW, barraY) {
        const letras  = [...CenaNegociacao.LETRAS_PIFE, 'CPC'];
        const iconeH  = 26;
        const largura = iconeH * 2;
        const espaco  = 6;
        const totalW  = letras.length * largura + (letras.length - 1) * espaco;
        const startX  = barraX - totalW / 2 + largura / 2;
        const y       = barraY + 53;
        const pad     = 8;

        this._bgPIFE = this.add
            .rectangle(barraX, y, totalW + pad * 2, iconeH + pad * 2, 0x222222, 0.85)
            .setStrokeStyle(1, 0x555555)
            .setDepth(49);

        this._iconesPIFE = {};

        letras.forEach((letra, i) => {
            const x = startX + i * (largura + espaco);

            const chaveOff = letra === 'CPC' ? 'cpc_off' : `pife_${letra.toLowerCase()}_off`;
            const chaveOn  = letra === 'CPC' ? 'cpc_on'  : `pife_${letra.toLowerCase()}_on`;

            const icone = this.textures.exists(chaveOff)
                ? this.add.image(x, y, chaveOff).setDisplaySize(largura, iconeH).setDepth(50)
                : this.add.rectangle(x, y, largura, iconeH, 0x333333)
                    .setStrokeStyle(1, 0x555555)
                    .setDepth(50);

            this._iconesPIFE[letra] = { obj: icone, chaveOff, chaveOn };
        });

        this._setPIFEVisivel(false);
    }

    _setPIFEVisivel(visivel) {
        this._bgPIFE?.setVisible(visivel);
        for (const d of Object.values(this._iconesPIFE)) d.obj.setVisible(visivel);
    }

    _acenderIconePIFE(letra) {
        const d = this._iconesPIFE[letra];
        if (!d) return;

        if (this.textures.exists(d.chaveOn) && d.obj.setTexture) {
            d.obj.setTexture(d.chaveOn);
        } else if (d.obj.setFillStyle) {
            d.obj.setFillStyle(0x22cc66);
        }

        this.tweens.add({
            targets:  d.obj,
            scaleX:   1.3,
            scaleY:   1.3,
            duration: 150,
            yoyo:     true,
            ease:     'Sine.easeInOut',
        });
    }

    // ── Ícones de aspectos da sondagem ────────────────────────────────────────

    _criarIconesAspectos(barraX, barraW, barraY) {
        const aspectos = CenaNegociacao.ASPECTOS_SONDAGEM;
        const iconeH   = 24;
        const largura  = iconeH * 2;
        const espaco   = 6;
        const totalW   = aspectos.length * largura + (aspectos.length - 1) * espaco;
        const startX   = barraX - totalW / 2 + largura / 2;
        const y        = barraY + 53;
        const pad      = 8;

        this._bgAspectos = this.add
            .rectangle(barraX, y, totalW + pad * 2, iconeH + pad * 2, 0x222222, 0.85)
            .setStrokeStyle(1, 0x555555)
            .setDepth(49);

        this._iconesAspectos = {};

        aspectos.forEach((aspecto, i) => {
            const x     = startX + i * (largura + espaco);
            const chave = `sondagem_${aspecto}_interrogacao`;

            const icone = this.textures.exists(chave)
                ? this.add.image(x, y, chave).setDisplaySize(largura, iconeH).setDepth(50)
                : this.add.rectangle(x, y, largura, iconeH, 0x333333)
                    .setStrokeStyle(1, 0x555555)
                    .setDepth(50);

            this._iconesAspectos[aspecto] = { obj: icone };
        });

        this._setAspectosVisiveis(false);
    }

    _setAspectosVisiveis(visivel) {
        this._bgAspectos?.setVisible(visivel);
        for (const d of Object.values(this._iconesAspectos)) d.obj.setVisible(visivel);
    }

    _revelarIconeAspecto(aspecto) {
        const d = this._iconesAspectos[aspecto];
        if (!d) return;

        const valor = this.aspectosCliente[aspecto];
        const chave = `sondagem_${aspecto}_${valor}`;

        if (this.textures.exists(chave) && d.obj.setTexture) {
            d.obj.setTexture(chave);
        } else if (d.obj.setFillStyle) {
            d.obj.setFillStyle(0x22cc66);
        }

        this.tweens.add({
            targets:  d.obj,
            scaleX:   1.3,
            scaleY:   1.3,
            duration: 150,
            yoyo:     true,
            ease:     'Back.easeOut',
        });
    }

    // ── Barra de fases ────────────────────────────────────────────────────────

    _criarBarraFases(W, H) {
        const fases   = this.clienteConfig.fases;
        const largura = W * 0.55;
        const startX  = (W - largura) / 2;
        const y       = H * 0.535;
        const passo   = fases.length > 1 ? largura / (fases.length - 1) : largura;

        this.indicadoresFase = [];

        fases.forEach((fase, i) => {
            const x = startX + i * passo;

            if (i < fases.length - 1) {
                const linha = this.add.graphics();
                linha.lineStyle(2, 0x1a3a5a, 1);
                linha.lineBetween(x, y, x + passo, y);
            }

            const circulo = this.add.circle(x, y, 13, 0x1a3a5a).setStrokeStyle(2, 0x2a6a9a);
            this.add.text(x, y, `${i + 1}`, {
                fontFamily: '"Courier New", monospace', fontSize: '16px', color: '#4a8aaa',
            }).setOrigin(0.5);
            this.add.text(x, y + 22, CenaNegociacao.LABELS_FASE[fase] ?? fase, {
                fontFamily: '"Courier New", monospace', fontSize: '14px', color: '#3a6a7a',
            }).setOrigin(0.5);

            this.indicadoresFase.push(circulo);
        });
    }

    _criarAreaCartas(W, H) { this.grupoCartas = this.add.group(); }

    _criarDialogo(W, H) {
        this.dialogoBg = this.add
            .rectangle(W / 2, H * 0.47, W * 0.45, 55, 0x060e14, 0.9)
            .setStrokeStyle(1, 0x2a5a7a);
        this.dialogoTexto = this.add.text(W / 2, H * 0.47, '', {
            fontFamily: '"Courier New", monospace', fontSize: '16px', color: '#a0c8d8',
            wordWrap: { width: W * 0.42 }, align: 'center',
        }).setOrigin(0.5);
    }

    // ── Fluxo de fases ────────────────────────────────────────────────────────

    _iniciarFase() {
        const fase = this.clienteConfig.fases[this.faseAtual];

        this.acertosNaFase = 0;
        this._atualizarIndicadoresFase();
        this._mostrarDialogo(this._falaInicioFase(fase));
        this._limparCartas();
        this.cartaEmDetalhes = null;

        this._setPIFEVisivel(false);
        this._setAspectosVisiveis(false);

        if (fase === 'abordagem')    { this._iniciarAbordagem();    return; }
        if (fase === 'sondagem')     { this._iniciarSondagem();     return; }
        if (fase === 'demonstracao') { this._iniciarDemonstracao(); return; }

        const numCartas = this.clienteConfig.cartasPorFase[fase] || 3;
        this._distribuirCartas(this._getCartasDaFase(fase, numCartas));
    }

    // ── Demonstração ──────────────────────────────────────────────────────────

    _iniciarDemonstracao() {
        this._distribuirCartas(this._getCartasDemonstracao());
    }

    _mostrarDetalheCartaDemonstracao(carta) {
        if (!this.negociacaoAtiva || this.cartaEmDetalhes) return;
        this._abrirModalCarta(carta, () => this._resolverDemonstracao(carta));
    }

    _resolverDemonstracao(carta) {
        if (!this.negociacaoAtiva) return;

        const acertos = carta.contarAcertos(this.aspectosCliente);

        this._removerCartaVisual(carta);

        if (acertos === 3) {
            this._alterarSatisfacao(CenaNegociacao.GANHO_SATISFACAO);
            this._mostrarDialogo(this._falaAcertoFase('demonstracao'));
            this.negociacaoAtiva = false;
            this.time.delayedCall(4000, () => {
                this.negociacaoAtiva = true;
                this._avancarOuVencer();
            });

        } else if (acertos === 2) {
            this._alterarSatisfacao(-10);
            this._mostrarDialogo(this._falaErroFase('demonstracao'));
            this.negociacaoAtiva = false;
            this.time.delayedCall(2000, () => {
                if (this.satisfacao <= 0) this._perderNegociacao();
                else this.negociacaoAtiva = true;
            });

        } else {
            this._alterarSatisfacao(-20);
            this._mostrarDialogo(this._falaErroFase('demonstracao'));
            this.negociacaoAtiva = false;
            this.time.delayedCall(2000, () => {
                if (this.satisfacao <= 0) this._perderNegociacao();
                else this.negociacaoAtiva = true;
            });
        }
    }

    // ── Abordagem ─────────────────────────────────────────────────────────────

    _iniciarAbordagem() {
        this._letrasPreenchidas = new Set();
        this._cpcDisponivel     = false;
        this._tweenCPC          = null;
        this._setPIFEVisivel(true);
        this._distribuirCartasAbordagem(this._getCartasAbordagem());
    }

    _distribuirCartasAbordagem(cartas) {
        const W = this.scale.width;
        const H = this.scale.height;
        const { CARD_WIDTH, CARD_SPACING, ANIM_FADE_DURATION, ANIM_HOVER_OFFSET } = CenaNegociacao;
        const totalW = cartas.length * CARD_WIDTH + (cartas.length - 1) * CARD_SPACING;
        const startX = (W - totalW) / 2;
        const y      = H * 0.78;

        this.cartasNaMao = [];

        cartas.forEach((carta, i) => {
            const x  = startX + i * (CARD_WIDTH + CARD_SPACING) + CARD_WIDTH / 2;
            const bg = this._criarFundoCarta(x, y, carta.key);

            bg.setAlpha(0);
            this.tweens.add({ targets: bg, alpha: 1, duration: ANIM_FADE_DURATION, delay: i * 80 });
            bg.on('pointerover', () => this.tweens.add({ targets: bg, y: `-=${ANIM_HOVER_OFFSET}`, duration: 100 }));
            bg.on('pointerout',  () => this.tweens.add({ targets: bg, y: `+=${ANIM_HOVER_OFFSET}`, duration: 100 }));
            bg.on('pointerdown', () => this._mostrarDetalheCartaAbordagem(carta));

            if (carta.isCPC) { bg.setAlpha(0.4).disableInteractive(); }

            carta._objetos = { bg };
            this.cartasNaMao.push(carta);
            this.grupoCartas.add(bg);
        });
    }

    _mostrarDetalheCartaAbordagem(carta) {
        if (!this.negociacaoAtiva || this.cartaEmDetalhes) return;
        if (carta.isCPC && !this._cpcDisponivel) return;
        this._abrirModalCarta(carta, () => this._resolverAbordagem(carta));
    }

    _resolverAbordagem(carta) {
        if (!this.negociacaoAtiva) return;

        if (carta.isCPC) {
            this._pararPulsoCPC(carta);
            this._mostrarDialogo(carta.dialogoAcerto);
            this._alterarSatisfacao(CenaNegociacao.GANHO_SATISFACAO);
            this._removerCartaVisual(carta);
            this.negociacaoAtiva = false;
            this.time.delayedCall(4000, () => {
                this.negociacaoAtiva = true;
                this._avancarOuVencer();
            });
            return;
        }

        if (carta.correta) {
            if (!this._letrasPreenchidas.has(carta.letra)) {
                this._letrasPreenchidas.add(carta.letra);
                this._acenderIconePIFE(carta.letra);
            }
            this._alterarSatisfacao(CenaNegociacao.GANHO_SATISFACAO);
            this._mostrarDialogo(carta.dialogoAcerto);
            this._removerCartaVisual(carta);

            const pifeFull = CenaNegociacao.LETRAS_PIFE.every(l => this._letrasPreenchidas.has(l));
            if (pifeFull && !this._cpcDisponivel) {
                this._cpcDisponivel = true;
                this._liberarCartaCPC();
            }

        } else {
            this._alterarSatisfacao(-CenaNegociacao.PERDA_SATISFACAO);
            this._mostrarDialogo(carta.dialogoErro);
            this.negociacaoAtiva = false;
            this.time.delayedCall(2000, () => {
                if (this.satisfacao <= 0) this._perderNegociacao();
                else this.negociacaoAtiva = true;
            });
        }
    }

    _pararPulsoCPC(carta) {
        if (this._tweenCPC) {
            this._tweenCPC.stop();
            this._tweenCPC = null;
        }
        if (carta?._objetos?.bg) {
            carta._objetos.bg.setScale(1);
        }
    }

    _liberarCartaCPC() {
        const cpc = this.cartasNaMao.find(c => c.isCPC);
        if (!cpc?._objetos) return;

        this.tweens.add({ targets: cpc._objetos.bg, alpha: 1, duration: 300 });
        cpc._objetos.bg.setInteractive({ useHandCursor: true });
        this._acenderIconePIFE('CPC');

        this._tweenCPC = this.tweens.add({
            targets:  cpc._objetos.bg,
            scaleX:   0.25,
            scaleY:   0.25,
            duration: 700,
            yoyo:     true,
            repeat:   -1,
            ease:     'Sine.easeInOut',
        });

        this._mostrarDialogo('Agora você pode usar o CPC!');
    }

    // ── Sondagem ──────────────────────────────────────────────────────────────

    _iniciarSondagem() {
        this._aspectosRevelados = new Set();
        this._setAspectosVisiveis(true);
        this._distribuirCartasSondagem(this._getCartasSondagem());
    }

    _distribuirCartasSondagem(cartas) {
        const W = this.scale.width;
        const H = this.scale.height;
        const { CARD_WIDTH, CARD_SPACING, ANIM_FADE_DURATION, ANIM_HOVER_OFFSET } = CenaNegociacao;
        const totalW = cartas.length * CARD_WIDTH + (cartas.length - 1) * CARD_SPACING;
        const startX = (W - totalW) / 2;
        const y      = H * 0.78;

        this.cartasNaMao = [];

        cartas.forEach((carta, i) => {
            const x  = startX + i * (CARD_WIDTH + CARD_SPACING) + CARD_WIDTH / 2;
            const bg = this._criarFundoCarta(x, y, carta.key);

            bg.setAlpha(0);
            this.tweens.add({ targets: bg, alpha: 1, duration: ANIM_FADE_DURATION, delay: i * 80 });
            bg.on('pointerover', () => this.tweens.add({ targets: bg, y: `-=${ANIM_HOVER_OFFSET}`, duration: 100 }));
            bg.on('pointerout',  () => this.tweens.add({ targets: bg, y: `+=${ANIM_HOVER_OFFSET}`, duration: 100 }));
            bg.on('pointerdown', () => this._mostrarDetalheCartaSondagem(carta));

            carta._objetos = { bg };
            this.cartasNaMao.push(carta);
            this.grupoCartas.add(bg);
        });
    }

    _mostrarDetalheCartaSondagem(carta) {
        if (!this.negociacaoAtiva || this.cartaEmDetalhes) return;
        this._abrirModalCarta(carta, () => this._resolverSondagem(carta));
    }

    _resolverSondagem(carta) {
        if (!this.negociacaoAtiva) return;

        if (carta.correta) {
            if (!this._aspectosRevelados.has(carta.aspecto)) {
                this._aspectosRevelados.add(carta.aspecto);
                this._revelarIconeAspecto(carta.aspecto);
            }
            this._alterarSatisfacao(CenaNegociacao.GANHO_SATISFACAO);
            this._mostrarDialogo(carta.dialogoAcerto);
            this._removerCartaVisual(carta);

            const completa = CenaNegociacao.ASPECTOS_SONDAGEM.every(a => this._aspectosRevelados.has(a));
            if (completa) {
                this.negociacaoAtiva = false;
                this.time.delayedCall(4000, () => {
                    this.negociacaoAtiva = true;
                    this._avancarOuVencer();
                });
            } else {
                const faltam = CenaNegociacao.ASPECTOS_SONDAGEM.length - this._aspectosRevelados.size;
                this._mostrarDialogo(`${carta.dialogoAcerto} (Ainda faltam ${faltam} aspecto(s))`);
            }

        } else {
            this._alterarSatisfacao(-CenaNegociacao.PERDA_SATISFACAO);
            this._mostrarDialogo(carta.dialogoErro);
            this.negociacaoAtiva = false;
            this.time.delayedCall(2000, () => {
                if (this.satisfacao <= 0) this._perderNegociacao();
                else this.negociacaoAtiva = true;
            });
        }
    }

    // ── Modal de carta (compartilhado) ────────────────────────────────────────

    _abrirModalCarta(carta, aoSelecionar) {
        this.cartaEmDetalhes = carta;

        const W = this.scale.width;
        const H = this.scale.height;
        const { LAYERS } = CenaNegociacao;

        const overlay   = this.add.rectangle(0, 0, W, H, 0x000000, 0.7).setOrigin(0, 0).setDepth(LAYERS.OVERLAY).setInteractive();
        const cartaZoom = this._criarFundoCartaZoom(W / 2, H / 2, carta.key);
        cartaZoom.setDepth(LAYERS.MODAL);

        const { btn: btnVoltar,     texto: textoVoltar     } = this._criarBotao(40, 40, 100, 50, '◀ VOLTAR',     0x1a3a5a, 0xcc4444, '#ff6666');
        const { btn: btnSelecionar, texto: textoSelecionar } = this._criarBotao(W / 2, H / 2 + 320, 180, 50, 'SELECIONAR ✓', 0x1a4a2a, 0x22cc66, '#22cc66');

        btnVoltar.setDepth(LAYERS.MODAL);     textoVoltar.setDepth(LAYERS.MODAL_BTN);
        btnSelecionar.setDepth(LAYERS.MODAL); textoSelecionar.setDepth(LAYERS.MODAL_BTN);

        const fechar = () => {
            [overlay, cartaZoom, btnVoltar, textoVoltar, btnSelecionar, textoSelecionar].forEach(o => o.destroy());
            this.cartaEmDetalhes = null;
        };

        btnVoltar.on('pointerover', () => btnVoltar.setFillStyle(0x2a4a6a));
        btnVoltar.on('pointerout',  () => btnVoltar.setFillStyle(0x1a3a5a));
        btnVoltar.on('pointerdown', fechar);

        btnSelecionar.on('pointerover', () => btnSelecionar.setFillStyle(0x2a6a3a));
        btnSelecionar.on('pointerout',  () => btnSelecionar.setFillStyle(0x1a4a2a));
        btnSelecionar.on('pointerdown', () => { fechar(); aoSelecionar(); });
    }

    // ── Lógica genérica (fases sem implementação própria) ─────────────────────

    _resolverCarta(carta) {
        if (!this.negociacaoAtiva) return;

        const fase     = this.clienteConfig.fases[this.faseAtual];
        const exigidas = this.clienteConfig.cartasExigidas[fase] ?? [];
        const acertou  = exigidas.length === 0 || exigidas.includes(carta.key);

        if (acertou) {
            const pontos = this._getPontuacaoCarta(carta.key);
            this._alterarSatisfacao(CenaNegociacao.GANHO_SATISFACAO + pontos);
            this.acertosNaFase++;

            if (carta._objetos?.bg) carta._objetos.bg.destroy();
            this.cartasNaMao = this.cartasNaMao.filter(c => c !== carta);

            const exigidasCount      = exigidas.length > 0 ? exigidas.length : CenaNegociacao.ACERTOS_PARA_AVANCAR;
            const acertosNecessarios = Math.min(CenaNegociacao.ACERTOS_PARA_AVANCAR, exigidasCount);
            const faltam             = acertosNecessarios - this.acertosNaFase;

            if (faltam <= 0) {
                this._mostrarDialogo(this._falaAcertoFase(fase));
                this.negociacaoAtiva = false;
                this.time.delayedCall(4000, () => {
                    this.negociacaoAtiva = true;
                    this._avancarOuVencer();
                });
            } else {
                this._mostrarDialogo(`✅ Boa escolha! Ainda faltam ${faltam} carta(s) para avançar.`);
            }

        } else {
            this._mostrarDialogo(this._falaErroFase(fase));
            this._alterarSatisfacao(-CenaNegociacao.PERDA_SATISFACAO);
            this.negociacaoAtiva = false;
            this.time.delayedCall(2000, () => {
                if (this.satisfacao <= 0) this._perderNegociacao();
                else this.negociacaoAtiva = true;
            });
        }
    }

    _getPontuacaoCarta(key) { return 0; }

    _avancarOuVencer() {
        if (this.faseAtual < this.clienteConfig.fases.length - 1) {
            this.faseAtual++;
            this._iniciarFase();
        } else {
            this._vencerNegociacao();
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    _removerCartaVisual(carta) {
        if (carta._objetos?.bg) carta._objetos.bg.destroy();
        this.cartasNaMao = this.cartasNaMao.filter(c => c !== carta);
    }

    _atualizarIndicadoresFase() {
        this.indicadoresFase.forEach((circulo, i) => {
            this.tweens.killTweensOf(circulo);
            circulo.setScale(1);
            if (i < this.faseAtual) {
                circulo.setFillStyle(0x22aa55).setStrokeStyle(2, 0x44cc77);
            } else if (i === this.faseAtual) {
                circulo.setFillStyle(0x1a4a8a).setStrokeStyle(2, 0x4488ff);
                this.tweens.add({ targets: circulo, scaleX: 1.2, scaleY: 1.2, duration: 200, yoyo: true });
            } else {
                circulo.setFillStyle(0x1a3a5a).setStrokeStyle(2, 0x2a6a9a);
            }
        });
    }

    _mostrarDialogo(texto) {
        this.dialogoTexto.setText(texto);
        this.dialogoTexto.setAlpha(0);
        this.tweens.add({ targets: this.dialogoTexto, alpha: 1, duration: 300 });
    }

    _limparCartas() {
        this.grupoCartas.clear(true, true);
        this.cartasNaMao = [];
    }

    // ── Renderização de cartas (fases genéricas) ──────────────────────────────

    _distribuirCartas(cartas) {
        const W      = this.scale.width;
        const H      = this.scale.height;
        const { CARD_WIDTH, CARD_SPACING, ANIM_FADE_DURATION, ANIM_HOVER_OFFSET } = CenaNegociacao;
        const totalW = cartas.length * CARD_WIDTH + (cartas.length - 1) * CARD_SPACING;
        const startX = (W - totalW) / 2;
        const y      = H * 0.78;

        this.cartasNaMao = [];

        cartas.forEach((carta, i) => {
            const x  = startX + i * (CARD_WIDTH + CARD_SPACING) + CARD_WIDTH / 2;
            const bg = this._criarFundoCarta(x, y, carta.key);

            bg.setAlpha(0);
            this.tweens.add({ targets: bg, alpha: 1, duration: ANIM_FADE_DURATION, delay: i * 80 });
            bg.on('pointerover', () => this.tweens.add({ targets: bg, y: `-=${ANIM_HOVER_OFFSET}`, duration: 100 }));
            bg.on('pointerout',  () => this.tweens.add({ targets: bg, y: `+=${ANIM_HOVER_OFFSET}`, duration: 100 }));
            bg.on('pointerdown', () => this._mostrarDetalheCarta(carta));

            carta._objetos = { bg };
            this.cartasNaMao.push(carta);
            this.grupoCartas.add(bg);
        });
    }

    _mostrarDetalheCarta(carta) {
        if (!this.negociacaoAtiva || this.cartaEmDetalhes) return;

        const fase = this.clienteConfig.fases[this.faseAtual];

        if (fase === 'demonstracao') {
            this._abrirModalCarta(carta, () => this._resolverDemonstracao(carta));
        } else {
            this._abrirModalCarta(carta, () => this._resolverCarta(carta));
        }
    }

    _criarFundoCarta(x, y, key) {
        const { CARD_WIDTH, CARD_HEIGHT } = CenaNegociacao;
        const obj = this.textures.exists(key)
            ? this.add.image(x, y, key).setDisplaySize(CARD_WIDTH, CARD_HEIGHT)
            : this.add.rectangle(x, y, CARD_WIDTH, CARD_HEIGHT, 0x0d1f2e).setStrokeStyle(2, 0x1a4a6a);
        return obj.setInteractive({ useHandCursor: true });
    }

    _criarFundoCartaZoom(x, y, key) {
        const { CARD_ZOOM_WIDTH, CARD_ZOOM_HEIGHT } = CenaNegociacao;
        return this.textures.exists(key)
            ? this.add.image(x, y, key).setDisplaySize(CARD_ZOOM_WIDTH, CARD_ZOOM_HEIGHT)
            : this.add.rectangle(x, y, CARD_ZOOM_WIDTH, CARD_ZOOM_HEIGHT, 0x0d1f2e).setStrokeStyle(2, 0x1a4a6a);
    }

    _criarBotao(x, y, w, h, label, corFundo, corBorda, corTexto) {
        const { LAYERS } = CenaNegociacao;
        const btn = this.add
            .rectangle(x, y, w, h, corFundo)
            .setStrokeStyle(2, corBorda)
            .setInteractive({ useHandCursor: true })
            .setDepth(LAYERS.MODAL);
        const texto = this.add
            .text(x, y, label, {
                fontFamily: '"Courier New", monospace', fontSize: '15px',
                color: corTexto, letterSpacing: 1,
            })
            .setOrigin(0.5)
            .setDepth(LAYERS.MODAL_BTN);
        return { btn, texto };
    }

    // ── Fim de negociação ─────────────────────────────────────────────────────

    _vencerNegociacao() {
        this.negociacaoAtiva = false;
        this._mostrarDialogo('✅ Negociação concluída com sucesso!');

        const chave = this._chaveVitoria();
        if (chave) {
            const vitorias = this.game.registry.get('negociacoesVencidas') ?? {};
            vitorias[chave] = true;
            this.game.registry.set('negociacoesVencidas', vitorias);
        }
        this.game.registry.set('ultimaNegociacao', 'vitoria');

        const insignia = this._getInsignia();
        if (insignia) {
            const insignias = this.game.registry.get('insigniasDesbloqueadas') ?? {};
            if (!insignias[insignia.key]) {
                insignias[insignia.key] = true;
                this.game.registry.set('insigniasDesbloqueadas', insignias);
            }
            this.time.delayedCall(1000, () => this._mostrarModalInsignia(insignia, () => this._irParaCenaDeRetorno()));
        } else {
            this.time.delayedCall(2000, () => this._irParaCenaDeRetorno());
        }
    }

    _mostrarModalInsignia(insignia, aoFechar) {
        const W = this.scale.width;
        const H = this.scale.height;
        const { LAYERS } = CenaNegociacao;

        const overlay = this.add.rectangle(0, 0, W, H, 0x000000, 0.75).setOrigin(0, 0).setDepth(LAYERS.OVERLAY);
        const painel  = this.add.rectangle(W / 2, H / 2, 420, 480, 0x0a1a2a).setStrokeStyle(3, 0xf0c040).setDepth(LAYERS.MODAL);
        const titulo  = this.add.text(W / 2, H / 2 - 190, '🏅 INSÍGNIA DESBLOQUEADA!', {
            fontFamily: '"Courier New", monospace', fontSize: '18px', color: '#f0c040',
            letterSpacing: 2, stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5).setDepth(LAYERS.MODAL);

        const imgInsignia = this.textures.exists(insignia.key)
            ? this.add.image(W / 2, H / 2 - 50, insignia.key).setDisplaySize(180, 180).setDepth(LAYERS.MODAL)
            : this.add.rectangle(W / 2, H / 2 - 50, 180, 180, 0x1a3a5a).setStrokeStyle(2, 0xf0c040).setDepth(LAYERS.MODAL);

        const escalaFinal = 180 / Math.max(imgInsignia.width, imgInsignia.height);
        imgInsignia.setScale(0);
        this.tweens.add({ targets: imgInsignia, scaleX: escalaFinal, scaleY: escalaFinal, duration: 400, ease: 'Back.easeOut' });

        const nomeTexto = this.add.text(W / 2, H / 2 + 100, insignia.nome, {
            fontFamily: '"Courier New", monospace', fontSize: '22px', color: '#ffffff',
            letterSpacing: 2, stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5).setDepth(LAYERS.MODAL);

        const { btn: btnContinuar, texto: textoContinuar } = this._criarBotao(W / 2, H / 2 + 170, 200, 50, 'CONTINUAR ▶', 0x1a4a2a, 0x22cc66, '#22cc66');
        btnContinuar.setDepth(LAYERS.MODAL); textoContinuar.setDepth(LAYERS.MODAL_BTN);

        const fechar = () => {
            [overlay, painel, titulo, imgInsignia, nomeTexto, btnContinuar, textoContinuar].forEach(o => o.destroy());
            if (aoFechar) aoFechar();
        };

        btnContinuar.on('pointerover', () => btnContinuar.setFillStyle(0x2a6a3a));
        btnContinuar.on('pointerout',  () => btnContinuar.setFillStyle(0x1a4a2a));
        btnContinuar.on('pointerdown', fechar);
    }

    _irParaCenaDeRetorno() {
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once(
            Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
            () => this.scene.start(this._cenaDeRetorno())
        );
    }

    _perderNegociacao() {
        this.negociacaoAtiva = false;
        this._mostrarDialogo('❌ Negociação perdida. Tente novamente.');
        this.game.registry.set('ultimaNegociacao', 'derrota');
        this.time.delayedCall(2000, () => this._irParaCenaDeRetorno());
    }

    // ── Satisfação ────────────────────────────────────────────────────────────

    _alterarSatisfacao(delta) {
        this.satisfacao = Phaser.Math.Clamp(this.satisfacao + delta, 0, 100);
        this._atualizarBarraSatisfacao();
        this._atualizarSpriteCliente();
    }

    _atualizarBarraSatisfacao() {
        this.barraSatisfacaoImg.setTexture(this._getChaveBarra());
        this.reacaoImg.setTexture(this._getChaveReacao());
        this.satisfacaoTexto.setText(`${this.satisfacao}%`);
    }

    _getChaveReacao() {
        if (this.satisfacao <= 33) return 'reacao_bravo';
        if (this.satisfacao <= 66) return 'reacao_neutro';
        return 'reacao_feliz';
    }

    _getChaveBarra() {
        const s = this.satisfacao;
        if (s === 0)  return 'barra_vazia';
        if (s <= 20)  return 'barra_baixa';
        if (s <= 40)  return 'barra_baixa_metade';
        if (s <= 60)  return 'barra_metade';
        if (s <= 80)  return 'barra_metade_cheia';
        return 'barra_cheia';
    }

    _atualizarSpriteCliente() {
        const nome  = this.clienteConfig.nomeCliente;
        const chave = `${nome}_${this._getEstadoSatisfacao()}`;
        if (!this.textures.exists(chave)) return;

        this.tweens.add({
            targets: this.spriteCliente, alpha: 0, duration: 150,
            onComplete: () => {
                if (this.spriteCliente.setTexture) this.spriteCliente.setTexture(chave);
                this.tweens.add({ targets: this.spriteCliente, alpha: 1, duration: 150 });
            },
        });
    }

    _getEstadoSatisfacao() {
        for (const faixa of CenaNegociacao.SATISFACAO_ESTADOS) {
            if (this.satisfacao >= faixa.min && this.satisfacao <= faixa.max) return faixa.estado;
        }
        return 'neutro';
    }

    _getCorSatisfacao() {
        for (const faixa of CenaNegociacao.SATISFACAO_ESTADOS) {
            if (this.satisfacao >= faixa.min && this.satisfacao <= faixa.max) return faixa.cor;
        }
        return 0xccaa44;
    }

    // ── Sobrescreva na subclasse ──────────────────────────────────────────────

    _getCartasAbordagem()    { return []; }
    _getCartasSondagem()     { return []; }
    _getCartasDemonstracao() { return []; }
    _getCartasDaFase(fase, quantidade) {
        return Array.from({ length: quantidade }, (_, i) => ({ key: `carta_${fase}_${i}`, fase }));
    }

    _falaInicioFase(fase)  { return '...'; }
    _falaAcertoFase(fase)  { return 'Muito bem!'; }
    _falaErroFase(fase)    { return 'Não é isso que preciso agora.'; }
    _cenaDeRetorno()       { return 'MundoCasa'; }
    _chaveVitoria()        { return null; }
    _getInsignia()         { return null; }
}