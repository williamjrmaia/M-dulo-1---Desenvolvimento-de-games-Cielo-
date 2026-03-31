// ─────────────────────────────────────────────────────────────────────────────
// CenaNegociacao.js — Classe base para todas as cenas de negociação
//
// MUDANÇAS nesta versão:
//   - Fase de abordagem usa lógica PIFE+CPC via _resolverAbordagem()
//   - Ícones PIFE+CPC abaixo da barra de satisfação
//   - _resolverCarta() detecta a fase e roteia para o handler correto
//   - Subclasses implementam _getCartasAbordagem() em vez de _getCartasDaFase()
//     para a fase de abordagem. _getCartasDaFase() permanece para as demais fases.
// ─────────────────────────────────────────────────────────────────────────────

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

    // Letras do PIFE na ordem de exibição dos ícones
    static LETRAS_PIFE = ['P', 'I', 'F', 'E'];

    constructor(key, clienteConfig = {}) {
        super(key);

        this.clienteConfig = {
            nomeCliente:       clienteConfig.nomeCliente        ?? 'default',
            satisfacaoInicial: clienteConfig.satisfacaoInicial  ??  0,
            cartasExigidas:    clienteConfig.cartasExigidas     ?? {},
            fases:             clienteConfig.fases              ?? CenaNegociacao.FASES,
            cartasPorFase:     clienteConfig.cartasPorFase      ?? {
                abordagem:    5,
                sondagem:     6,
                demonstracao: 4,
                negociacao:   3,
                fechamento:   3,
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
        this._letrasPreenchidas = new Set(); // quais letras do PIFE já foram acertadas
        this._cpcDisponivel     = false;     // CPC só fica clicável após PIFE completo
        this._iconesPIFE        = {};        // refs dos objetos visuais dos ícones
    }

    preload() {
        this.load.image('reacao_bravo',  'assets/objetos/reacoes/reacao_bravo.png');
        this.load.image('reacao_neutro', 'assets/objetos/reacoes/reacao_neutro.png');
        this.load.image('reacao_feliz',  'assets/objetos/reacoes/reacao_feliz.png');

        const insignia = this._getInsignia();
        if (insignia) {
            this.load.image(insignia.key, insignia.path);
        }
    }

    create() {
        this.registry.get('audio').tocarMusica('musica_batalha', 0.5);

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
        if (this.textures.exists(`${nome}_fundo`)) {
            this.add.image(W / 2, H * 0.3, `${nome}_fundo`).setDisplaySize(W, H * 0.6);
        } else {
            this.add.rectangle(0, 0, W, H * 0.6, 0x111a24).setOrigin(0, 0);
        }
        this.add.rectangle(0, H * 0.58, W, H * 0.42, 0x0a0f14).setOrigin(0, 0);
        const div = this.add.graphics();
        div.lineStyle(2, 0x2a4a6a, 0.8);
        div.lineBetween(0, H * 0.58, W, H * 0.58);
    }

    _criarAreaCliente(W, H) {
        const nome         = this.clienteConfig.nomeCliente;
        const chaveInicial = `${nome}_${this._getEstadoSatisfacao()}`;

        this.add.text(W / 2, H * 0.04, nome, {
            fontFamily: '"Courier New", monospace',
            fontSize: '26px',
            color: '#c8e6f0',
            letterSpacing: 4,
            stroke: '#000000',
            strokeThickness: 3,
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
            fontSize: '12px',
            color: '#5a8a9a',
            letterSpacing: 3,
        }).setOrigin(0.5);

        this.barraSatisfacaoImg = this.add.image(x, y, this._getChaveBarra())
            .setDisplaySize(barraW, 40);

        this.reacaoImg = this.add.image(x - barraW / 2 - 50, y, this._getChaveReacao())
            .setDisplaySize(40, 40)
            .setScale(1.3);

        this.satisfacaoTexto = this.add.text(x, y + 28, `${this.satisfacao}%`, {
            fontFamily: '"Courier New", monospace',
            fontSize: '12px',
            color: '#7aaabb',
        }).setOrigin(0.5);

        // Ícones PIFE+CPC — criados aqui mas só visíveis na abordagem
        this._criarIconesPIFE(W, H, x, barraW, y);
    }

    // Cria os 5 ícones (P, I, F, E, CPC) abaixo da barra de satisfação.
    // Cada ícone tem dois assets: <letra>_off (P&B) e <letra>_on (colorido).
    // Convenção de nomes:  pife_p_off, pife_p_on, pife_i_off, ..., pife_cpc_off, pife_cpc_on
    _criarIconesPIFE(W, H, barraX, barraW, barraY) {
        const letras   = [...CenaNegociacao.LETRAS_PIFE, 'CPC'];
        const iconeW   = 44;
        const espacamento = 10;
        const totalW   = letras.length * iconeW + (letras.length - 1) * espacamento;
        const startX   = barraX - totalW / 2 + iconeW / 2;
        const y        = barraY + 68; // abaixo do texto de porcentagem

        this._iconesPIFE = {};

        letras.forEach((letra, i) => {
            const x       = startX + i * (iconeW + espacamento);
            const chaveOff = `pife_${letra.toLowerCase()}_off`;
            const chaveOn  = `pife_${letra.toLowerCase()}_on`;

            // Fallback: retângulo cinza se o asset não existir ainda
            const icone = this.textures.exists(chaveOff)
                ? this.add.image(x, y, chaveOff).setDisplaySize(iconeW, iconeW)
                : this.add.rectangle(x, y, iconeW, iconeW, 0x333333).setStrokeStyle(1, 0x555555);

            this._iconesPIFE[letra] = { obj: icone, chaveOff, chaveOn, x, y, w: iconeW };
        });

        // Começa invisível — só aparece na fase de abordagem
        this._setPIFEVisivel(false);
    }

    _setPIFEVisivel(visivel) {
        for (const letra of Object.keys(this._iconesPIFE)) {
            this._iconesPIFE[letra].obj.setVisible(visivel);
        }
    }

    // Acende o ícone de uma letra (troca para a versão colorida)
    _acenderIcone(letra) {
        const dados = this._iconesPIFE[letra];
        if (!dados) return;

        if (this.textures.exists(dados.chaveOn) && dados.obj.setTexture) {
            dados.obj.setTexture(dados.chaveOn);
        } else if (dados.obj.setFillStyle) {
            // fallback retângulo — fica verde
            dados.obj.setFillStyle(0x22cc66);
        }

        // Animação de pulso ao acender
        this.tweens.add({
            targets: dados.obj, scaleX: 1.3, scaleY: 1.3,
            duration: 150, yoyo: true, ease: 'Back.easeOut',
        });
    }

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
                fontFamily: '"Courier New", monospace',
                fontSize: '16px',
                color: '#4a8aaa',
            }).setOrigin(0.5);

            this.add.text(x, y + 22, CenaNegociacao.LABELS_FASE[fase] ?? fase, {
                fontFamily: '"Courier New", monospace',
                fontSize: '14px',
                color: '#3a6a7a',
            }).setOrigin(0.5);

            this.indicadoresFase.push(circulo);
        });
    }

    _criarAreaCartas(W, H) {
        this.grupoCartas = this.add.group();
    }

    _criarDialogo(W, H) {
        this.dialogoBg = this.add.rectangle(W / 2, H * 0.47, W * 0.45, 55, 0x060e14, 0.9)
            .setStrokeStyle(1, 0x2a5a7a);

        this.dialogoTexto = this.add.text(W / 2, H * 0.47, '', {
            fontFamily: '"Courier New", monospace',
            fontSize: '16px',
            color: '#a0c8d8',
            wordWrap: { width: W * 0.42 },
            align: 'center',
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

        if (fase === 'abordagem') {
            this._iniciarAbordagem();
            return;
        }

        // Esconde os ícones PIFE nas outras fases
        this._setPIFEVisivel(false);

        const numCartas    = this.clienteConfig.cartasPorFase[fase] || 3;
        const cartasDaFase = this._getCartasDaFase(fase, numCartas);

        if (fase === 'sondagem' && cartasDaFase.length > 3) {
            this._paginas = [];
            for (let i = 0; i < cartasDaFase.length; i += 3) {
                this._paginas.push(cartasDaFase.slice(i, i + 3));
            }
            this._paginaAtual = 0;
            this._mostrarPaginaSondagem();
        } else {
            this._paginas = null;
            this._distribuirCartas(cartasDaFase);
            if (this.btnPrevPage) this.btnPrevPage.setVisible(false);
            if (this.btnProxPage) this.btnProxPage.setVisible(false);
        }
    }

    // ── Abordagem: lógica PIFE+CPC ────────────────────────────────────────────

    _iniciarAbordagem() {
        // Reseta estado PIFE
        this._letrasPreenchidas = new Set();
        this._cpcDisponivel     = false;

        // Mostra ícones PIFE
        this._setPIFEVisivel(true);

        // Obtém as cartas da subclasse e distribui
        const cartas = this._getCartasAbordagem();
        this._distribuirCartasAbordagem(cartas);
    }

    // Distribui as cartas de abordagem. Cartas CPC ficam bloqueadas até PIFE completo.
    _distribuirCartasAbordagem(cartas) {
        const W = this.scale.width;
        const H = this.scale.height;
        const { CARD_WIDTH, CARD_HEIGHT, CARD_SPACING, ANIM_FADE_DURATION, ANIM_HOVER_OFFSET } = CenaNegociacao;

        const totalW = cartas.length * CARD_WIDTH + (cartas.length - 1) * CARD_SPACING;
        const startX = (W - totalW) / 2;
        const y      = H * 0.78;

        this.cartasNaMao = [];

        cartas.forEach((carta, i) => {
            const x  = startX + i * (CARD_WIDTH + CARD_SPACING) + CARD_WIDTH / 2;
            const bg = this._criarFundoCarta(x, y, carta.key);

            // Ícone da letra em cima da carta
            const chaveIcone = `pife_${carta.letra.toLowerCase()}_off`;
            const iconeLetra = this.textures.exists(chaveIcone)
                ? this.add.image(x, y - CARD_HEIGHT / 2 + 20, chaveIcone).setDisplaySize(32, 32)
                : this.add.text(x, y - CARD_HEIGHT / 2 + 20, carta.letra, {
                    fontFamily: '"Courier New", monospace',
                    fontSize: '14px',
                    color: '#aaaaaa',
                }).setOrigin(0.5);

            bg.setAlpha(0);
            this.tweens.add({ targets: bg, alpha: 1, duration: ANIM_FADE_DURATION, delay: i * 80 });

            bg.on('pointerover', () => this.tweens.add({ targets: bg, y: `-=${ANIM_HOVER_OFFSET}`, duration: 100 }));
            bg.on('pointerout',  () => this.tweens.add({ targets: bg, y: `+=${ANIM_HOVER_OFFSET}`, duration: 100 }));
            bg.on('pointerdown', () => this._mostrarDetalheCartaAbordagem(carta));

            // Cartas CPC começam semi-transparentes e sem interação
            if (carta.isCPC) {
                bg.setAlpha(0.4).disableInteractive();
                iconeLetra.setAlpha(0.4);
            }

            carta._objetos = { bg, iconeLetra };
            this.cartasNaMao.push(carta);
            this.grupoCartas.add(bg);
        });
    }

    // Modal de detalhe para cartas de abordagem (sem botão SELECIONAR bloqueado para CPC)
    _mostrarDetalheCartaAbordagem(carta) {
        if (!this.negociacaoAtiva) return;
        if (this.cartaEmDetalhes) return;
        if (carta.isCPC && !this._cpcDisponivel) return;

        this.cartaEmDetalhes = carta;

        const W = this.scale.width;
        const H = this.scale.height;
        const { LAYERS } = CenaNegociacao;

        const overlay = this.add
            .rectangle(0, 0, W, H, 0x000000, 0.7)
            .setOrigin(0, 0).setDepth(LAYERS.OVERLAY).setInteractive();

        const cartaZoom = this._criarFundoCartaZoom(W / 2, H / 2, carta.key);
        cartaZoom.setDepth(LAYERS.MODAL);

        const { btn: btnVoltar,     texto: textoVoltar     } = this._criarBotao(40, 40, 100, 50, '◀ VOLTAR',   0x1a3a5a, 0xcc4444, '#ff6666');
        const { btn: btnSelecionar, texto: textoSelecionar } = this._criarBotao(W / 2, H / 2 + 320, 180, 50, 'SELECIONAR ✓', 0x1a4a2a, 0x22cc66, '#22cc66');

        btnVoltar.setDepth(LAYERS.MODAL);
        textoVoltar.setDepth(LAYERS.MODAL_BTN);
        btnSelecionar.setDepth(LAYERS.MODAL);
        textoSelecionar.setDepth(LAYERS.MODAL_BTN);

        const fecharModal = () => {
            [overlay, cartaZoom, btnVoltar, textoVoltar, btnSelecionar, textoSelecionar]
                .forEach(obj => obj.destroy());
            this.cartaEmDetalhes = null;
        };

        btnVoltar.on('pointerover', () => btnVoltar.setFillStyle(0x2a4a6a));
        btnVoltar.on('pointerout',  () => btnVoltar.setFillStyle(0x1a3a5a));
        btnVoltar.on('pointerdown', fecharModal);

        btnSelecionar.on('pointerover', () => btnSelecionar.setFillStyle(0x2a6a3a));
        btnSelecionar.on('pointerout',  () => btnSelecionar.setFillStyle(0x1a4a2a));
        btnSelecionar.on('pointerdown', () => {
            fecharModal();
            this._resolverAbordagem(carta);
        });
    }

    // Resolve a jogada de uma carta na abordagem
    _resolverAbordagem(carta) {
        if (!this.negociacaoAtiva) return;

        if (carta.isCPC) {
            // CPC encerra a abordagem — só chega aqui se PIFE estava completo
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
            // Acertou a letra — preenche se ainda não estava preenchida
            if (!this._letrasPreenchidas.has(carta.letra)) {
                this._letrasPreenchidas.add(carta.letra);
                this._acenderIcone(carta.letra);
            }

            this._alterarSatisfacao(CenaNegociacao.GANHO_SATISFACAO);
            this._mostrarDialogo(carta.dialogoAcerto);
            this._removerCartaVisual(carta);

            // Verifica se PIFE está completo para liberar o CPC
            const pifeFull = CenaNegociacao.LETRAS_PIFE.every(l => this._letrasPreenchidas.has(l));
            if (pifeFull && !this._cpcDisponivel) {
                this._cpcDisponivel = true;
                this._liberarCartaCPC();
            }

        } else {
            // Errou — perde satisfação, carta permanece na mão
            this._alterarSatisfacao(-CenaNegociacao.PERDA_SATISFACAO);
            this._mostrarDialogo(carta.dialogoErro);
            this.negociacaoAtiva = false;

            this.time.delayedCall(2000, () => {
                if (this.satisfacao <= 0) {
                    this._perderNegociacao();
                } else {
                    this.negociacaoAtiva = true;
                }
            });
        }
    }

    // Libera a carta CPC visualmente após PIFE completo
    _liberarCartaCPC() {
        const cartaCPC = this.cartasNaMao.find(c => c.isCPC);
        if (!cartaCPC || !cartaCPC._objetos) return;

        const { bg, iconeLetra } = cartaCPC._objetos;

        this.tweens.add({ targets: [bg, iconeLetra], alpha: 1, duration: 300 });
        bg.setInteractive({ useHandCursor: true });

        // Acende o ícone CPC na barra
        this._acenderIcone('CPC');

        // Pulso visual para chamar atenção
        this.tweens.add({
            targets: bg, scaleX: 1.05, scaleY: 1.05,
            duration: 400, yoyo: true, repeat: 2, ease: 'Sine.easeInOut',
        });

        this._mostrarDialogo('Agora você pode usar o CPC!');
    }

    _removerCartaVisual(carta) {
        if (carta._objetos?.bg)        carta._objetos.bg.destroy();
        if (carta._objetos?.iconeLetra) carta._objetos.iconeLetra.destroy();
        this.cartasNaMao = this.cartasNaMao.filter(c => c !== carta);
    }

    // ── Lógica central (fases não-abordagem) ──────────────────────────────────

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
                if (this.satisfacao <= 0) {
                    this._perderNegociacao();
                } else {
                    this.negociacaoAtiva = true;
                }
            });
        }
    }

    _getPontuacaoCarta(key) {
        return 0;
    }

    _avancarOuVencer() {
        if (this.faseAtual < this.clienteConfig.fases.length - 1) {
            this.faseAtual++;
            this._iniciarFase();
        } else {
            this._vencerNegociacao();
        }
    }

    // ── Paginação ─────────────────────────────────────────────────────────────

    _mostrarPaginaSondagem() {
        if (!this._paginas) return;
        this._limparCartas();
        this._distribuirCartas(this._paginas[this._paginaAtual]);
        this._atualizarSetaNavegacao();
    }

    _atualizarSetaNavegacao() {
        const hasPrev = this._paginaAtual > 0;
        const hasNext = this._paginas && this._paginaAtual < this._paginas.length - 1;
        const y       = this.scale.height * 0.78;

        if (!this.btnPrevPage) {
            this.btnPrevPage = this.add.text(50, y, '<', {
                fontFamily: 'Courier', fontSize: '32px', color: '#ffffff',
            }).setInteractive({ useHandCursor: true }).setDepth(900);
            this.btnPrevPage.on('pointerdown', () => { this._paginaAtual--; this._mostrarPaginaSondagem(); });
        }
        if (!this.btnProxPage) {
            this.btnProxPage = this.add.text(this.scale.width - 50, y, '>', {
                fontFamily: 'Courier', fontSize: '32px', color: '#ffffff',
            }).setInteractive({ useHandCursor: true }).setDepth(900);
            this.btnProxPage.on('pointerdown', () => { this._paginaAtual++; this._mostrarPaginaSondagem(); });
        }

        this.btnPrevPage.setVisible(hasPrev);
        this.btnProxPage.setVisible(hasNext);
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

            this.time.delayedCall(1000, () => {
                this._mostrarModalInsignia(insignia, () => {
                    this._irParaCenaDeRetorno();
                });
            });
        } else {
            this.time.delayedCall(2000, () => {
                this._irParaCenaDeRetorno();
            });
        }
    }

    _mostrarModalInsignia(insignia, aoFechar) {
        const W = this.scale.width;
        const H = this.scale.height;
        const { LAYERS } = CenaNegociacao;

        const overlay = this.add
            .rectangle(0, 0, W, H, 0x000000, 0.75)
            .setOrigin(0, 0)
            .setDepth(LAYERS.OVERLAY);

        const painel = this.add
            .rectangle(W / 2, H / 2, 420, 480, 0x0a1a2a)
            .setStrokeStyle(3, 0xf0c040)
            .setDepth(LAYERS.MODAL);

        const titulo = this.add.text(W / 2, H / 2 - 190, '🏅 INSÍGNIA DESBLOQUEADA!', {
            fontFamily: '"Courier New", monospace',
            fontSize: '18px',
            color: '#f0c040',
            letterSpacing: 2,
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(LAYERS.MODAL);

        const imgInsignia = this.textures.exists(insignia.key)
            ? this.add.image(W / 2, H / 2 - 50, insignia.key)
                .setDisplaySize(180, 180)
                .setDepth(LAYERS.MODAL)
            : this.add.rectangle(W / 2, H / 2 - 50, 180, 180, 0x1a3a5a)
                .setStrokeStyle(2, 0xf0c040)
                .setDepth(LAYERS.MODAL);

        imgInsignia.setScale(0);
        this.tweens.add({
            targets: imgInsignia, scaleX: 1, scaleY: 1,
            duration: 400, ease: 'Back.easeOut',
        });

        const nomeTexto = this.add.text(W / 2, H / 2 + 100, insignia.nome, {
            fontFamily: '"Courier New", monospace',
            fontSize: '22px',
            color: '#ffffff',
            letterSpacing: 2,
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(LAYERS.MODAL);

        const { btn: btnContinuar, texto: textoContinuar } = this._criarBotao(
            W / 2, H / 2 + 170, 200, 50, 'CONTINUAR ▶', 0x1a4a2a, 0x22cc66, '#22cc66'
        );
        btnContinuar.setDepth(LAYERS.MODAL);
        textoContinuar.setDepth(LAYERS.MODAL_BTN);

        const fechar = () => {
            [overlay, painel, titulo, imgInsignia, nomeTexto, btnContinuar, textoContinuar]
                .forEach(obj => obj.destroy());
            if (aoFechar) aoFechar();
        };

        btnContinuar.on('pointerover', () => btnContinuar.setFillStyle(0x2a6a3a));
        btnContinuar.on('pointerout',  () => btnContinuar.setFillStyle(0x1a4a2a));
        btnContinuar.on('pointerdown', fechar);
    }

    _irParaCenaDeRetorno() {
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(this._cenaDeRetorno());
        });
    }

    _perderNegociacao() {
        this.negociacaoAtiva = false;
        this._mostrarDialogo('❌ Negociação perdida. Tente novamente.');
        this.game.registry.set('ultimaNegociacao', 'derrota');

        this.time.delayedCall(2000, () => {
            this._irParaCenaDeRetorno();
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

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

    // ── Renderização de cartas (fases não-abordagem) ──────────────────────────

    _distribuirCartas(cartas) {
        const W      = this.scale.width;
        const H      = this.scale.height;
        const { CARD_WIDTH, CARD_HEIGHT, CARD_SPACING, ANIM_FADE_DURATION, ANIM_HOVER_OFFSET } = CenaNegociacao;
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
        if (!this.negociacaoAtiva) return;
        if (this.cartaEmDetalhes) return;

        this.cartaEmDetalhes = carta;

        const W = this.scale.width;
        const H = this.scale.height;
        const { LAYERS } = CenaNegociacao;

        const overlay = this.add
            .rectangle(0, 0, W, H, 0x000000, 0.7)
            .setOrigin(0, 0).setDepth(LAYERS.OVERLAY).setInteractive();

        const cartaZoom = this._criarFundoCartaZoom(W / 2, H / 2, carta.key);
        cartaZoom.setDepth(LAYERS.MODAL);

        const { btn: btnVoltar, texto: textoVoltar } = this._criarBotao(
            40, 40, 100, 50, '◀ VOLTAR', 0x1a3a5a, 0xcc4444, '#ff6666'
        );
        const { btn: btnSelecionar, texto: textoSelecionar } = this._criarBotao(
            W / 2, H / 2 + 320, 180, 50, 'SELECIONAR ✓', 0x1a4a2a, 0x22cc66, '#22cc66'
        );

        const fecharModal = () => {
            [overlay, cartaZoom, btnVoltar, textoVoltar, btnSelecionar, textoSelecionar]
                .forEach(obj => obj.destroy());
            this.cartaEmDetalhes = null;
        };

        btnVoltar.on('pointerover', () => btnVoltar.setFillStyle(0x2a4a6a));
        btnVoltar.on('pointerout',  () => btnVoltar.setFillStyle(0x1a3a5a));
        btnVoltar.on('pointerdown', fecharModal);

        btnSelecionar.on('pointerover', () => btnSelecionar.setFillStyle(0x2a6a3a));
        btnSelecionar.on('pointerout',  () => btnSelecionar.setFillStyle(0x1a4a2a));
        btnSelecionar.on('pointerdown', () => {
            fecharModal();
            this._resolverCarta(carta);
        });
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

        const texto = this.add.text(x, y, label, {
            fontFamily: '"Courier New", monospace',
            fontSize: '15px',
            color: corTexto,
            letterSpacing: 1,
        }).setOrigin(0.5).setDepth(LAYERS.MODAL_BTN);

        return { btn, texto };
    }

    // ── Sobrescreva na subclasse ──────────────────────────────────────────────

    // Retorna array de objetos Carta para a fase de abordagem.
    // Veja Carta.js para a estrutura e como criar novas cartas.
    _getCartasAbordagem() {
        return [];
    }

    _getCartasDaFase(fase, quantidade) {
        return Array.from({ length: quantidade }, (_, i) => ({
            key: `carta_${fase}_${i}`, label: `Carta ${i + 1}`, fase,
        }));
    }

    _falaInicioFase(fase)  { return '...'; }
    _falaAcertoFase(fase)  { return 'Muito bem!'; }
    _falaErroFase(fase)    { return 'Não é isso que preciso agora.'; }
    _cenaDeRetorno()       { return 'MundoCasa'; }
    _chaveVitoria()        { return null; }
    _getInsignia()         { return null; }
}