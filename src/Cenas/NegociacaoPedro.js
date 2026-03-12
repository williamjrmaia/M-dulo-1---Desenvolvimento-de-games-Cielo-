import CenaNegociacao from '../Classes/CenaNegociacao.js';

// ─── Constantes de layout e tempo ────────────────────────────────────────────
const CARD_WIDTH         = 270;
const CARD_HEIGHT        = 330;
const CARD_SPACING       = 25;
const CARD_ZOOM_WIDTH    = 400;
const CARD_ZOOM_HEIGHT   = 550;
const DELAY_PROXIMA_FASE = 1800;
const ANIM_FADE_DURATION = 300;
const ANIM_HOVER_OFFSET  = 8;

// ─── Camadas de profundidade (depth) ─────────────────────────────────────────
const LAYERS = {
    CARTAS:    10,
    OVERLAY:   100,
    MODAL:     101,
    MODAL_BTN: 102,
};

// ─── Pontuação por produto na fase de demonstração ───────────────────────────
const PONTUACAO_PRODUTO = {
    CieloLioOn:  10,
    CieloFlash:  15,
    CVBA:        20,
    CieloFlash2: 25,
};

export default class NegociacaoPedro extends CenaNegociacao {
    constructor() {
        super('NegociacaoPedro', {
            nomeCliente:       'Pedro',
            satisfacaoInicial: 0,
            cartasExigidas: {
                abordagem:    ['DiretoAoPonto', 'GanchoSocial', 'AntiPitch'],
                sondagem:     ['PerguntaDeImpacto', 'GanchoDaDor'],
                demonstracao: [],
                negociacao:   ['carta_desconto'],
                fechamento:   ['carta_contrato'],
            },
            cartasPorFase: {
                abordagem:    5,
                sondagem:     6,
                demonstracao: 4,
                negociacao:   3,
                fechamento:   3,
            },
        });

        this.cartaEmDetalhes = null;
    }

    preload() {
    super.preload();

    this.load.on('loaderror', (file) => {
        console.warn(`[NegociacaoPedro] Asset não encontrado: "${file.key}" → ${file.url}`);
    });

    const carregar = (key, path) => {
        if (!this.textures.exists(key)) {
            this.load.image(key, path);
        }
    };

    // Cartas de Abordagem
    carregar('AntiPitch',            'assets/Cartas/Abordagem/AntiPitch.png');
    carregar('ComparacaoInteligente', 'assets/Cartas/Abordagem/ComparacaoInteligente.png');
    carregar('DesarmeElegante',       'assets/Cartas/Abordagem/DesarmeElegante.png');
    carregar('DiretoAoPonto',         'assets/Cartas/Abordagem/DiretoAoPonto.png');
    carregar('GanchoSocial',          'assets/Cartas/Abordagem/GanchoSocial.png');

    // Cartas de Sondagem
    carregar('AutoridadeImplicita',   'assets/Cartas/Sondagem/AutoridadeImplicita.png');
    carregar('ChaveDeExclusividade',  'assets/Cartas/Sondagem/ChaveDeExclusividade.png');
    carregar('Cliffhanger',           'assets/Cartas/Sondagem/Cliffhanger.png');
    carregar('GanchoDaDor',           'assets/Cartas/Sondagem/GanchoDaDor.png');
    carregar('LoboCurioso',           'assets/Cartas/Sondagem/LoboCurioso.png');
    carregar('PerguntaDeImpacto',     'assets/Cartas/Sondagem/PerguntaDeImpacto.png');

    // Cartas de Demonstração / Produtos
    carregar('CieloLioOn',  'assets/Cartas/Produtos/LIOON.png');
    carregar('CieloFlash',  'assets/Cartas/Produtos/FLASH.png');
    carregar('CVBA',        'assets/Cartas/Produtos/CVBA.png');
    carregar('CieloFlash2', 'assets/Cartas/Produtos/FLASH2.png');
}

    _falaInicioFase(fase) {
        const falas = {
            abordagem:    'Olá, boa tarde! Em que posso ajudar?',
            sondagem:     'Pois é, os negócios estão indo, mas sinto que poderia ser melhor.',
            demonstracao: 'Ah, essa maquininha parece ser interessante. O que ela faz de bom?',
            negociacao:   'O serviço é bom, mas esse custo está alto para o meu bolso.',
            fechamento:   'Bom, se os termos forem esses, podemos assinar.',
        };
        return falas[fase] ?? 'Pode continuar...';
    }

    _falaAcertoFase(fase) {
        const falas = {
            abordagem:    'Claro, sou o dono do estabelecimento! Me chamo Pedro.',
            sondagem:     'Entendi, isso faz bastante sentido. Continue...',
            demonstracao: 'Interessante! Esse produto parece atender bem o que preciso.',
        };
        return falas[fase] ?? 'Pode continuar';
    }

    _falaErroFase(fase) {
        const falas = {
            abordagem: 'Não estou interessado nisso. Obrigado.',
            sondagem:  'Hm, isso não responde muito bem à minha situação.',
        };
        return falas[fase] ?? 'Não entendi sua estratégia';
    }

    _acertarFase(fase) {
        if (fase !== 'demonstracao') {
            super._acertarFase(fase);
            return;
        }

        const soma = this.cartasSelecionadas.reduce(
            (total, carta) => total + (PONTUACAO_PRODUTO[carta.key] ?? 0),
            0
        );

        this._mostrarDialogo(this._falaAcertoFase(fase));
        this._alterarSatisfacao(soma);

        this.time.delayedCall(DELAY_PROXIMA_FASE, () => this._avancarOuVencer());
    }

    _avancarOuVencer() {
        if (this.faseAtual < CenaNegociacao.FASES.length - 1) {
            this.faseAtual++;
            this._iniciarFase();
        } else {
            this._vencerNegociacao();
        }
    }

    _getCartasDaFase(fase, quantidade) {
        const todasCartas = {
            abordagem:    ['DiretoAoPonto', 'GanchoSocial', 'AntiPitch', 'ComparacaoInteligente', 'DesarmeElegante'],
            sondagem:     ['PerguntaDeImpacto', 'GanchoDaDor', 'AutoridadeImplicita', 'ChaveDeExclusividade', 'Cliffhanger', 'LoboCurioso'],
            demonstracao: ['CieloLioOn', 'CieloFlash', 'CVBA', 'CieloFlash2'],
            negociacao:   ['carta_desconto'],
            fechamento:   ['carta_contrato'],
        };

        const cartasExigidas    = this.clienteConfig.cartasExigidas[fase] ?? [];
        const cartasDisponiveis = todasCartas[fase] ?? [];
        const embaralhadas      = Phaser.Utils.Array.Shuffle([...cartasDisponiveis]);

        return Array.from({ length: quantidade }, (_, i) => {
            const key = embaralhadas[i] ?? `carta_${fase}_${i}`;
            return {
                key,
                label:       key,
                descricao:   'Estratégia de vendas',
                fase,
                obrigatoria: cartasExigidas.includes(key),
            };
        });
    }

    _distribuirCartas(cartas) {
        const W      = this.scale.width;
        const H      = this.scale.height;
        const totalW = cartas.length * CARD_WIDTH + (cartas.length - 1) * CARD_SPACING;
        const startX = (W - totalW) / 2;
        const y      = H * 0.78;

        this.cartasNaMao = [];

        cartas.forEach((carta, i) => {
            const x  = startX + i * (CARD_WIDTH + CARD_SPACING) + CARD_WIDTH / 2;
            const bg = this._criarFundoCarta(x, y, carta.key);

            bg.setAlpha(0);
            this.tweens.add({ targets: bg, alpha: 1, duration: ANIM_FADE_DURATION, delay: i * 80 });

            bg.on('pointerover', () => {
                if (!carta._selecionada) {
                    this.tweens.add({ targets: bg, y: `-=${ANIM_HOVER_OFFSET}`, duration: 100 });
                }
            });
            bg.on('pointerout', () => {
                if (!carta._selecionada) {
                    this.tweens.add({ targets: bg, y: `+=${ANIM_HOVER_OFFSET}`, duration: 100 });
                }
            });
            bg.on('pointerdown', () => this._mostrarDetalheCarta(carta));

            carta._selecionada = false;
            carta._objetos     = { bg };
            this.cartasNaMao.push(carta);
            this.grupoCartas.add(bg);
        });
    }

    _mostrarDetalheCarta(carta) {
        if (this.cartaEmDetalhes && this.cartaEmDetalhes !== carta) return;
        this.cartaEmDetalhes = carta;

        const W    = this.scale.width;
        const H    = this.scale.height;
        const fase = CenaNegociacao.FASES[this.faseAtual];

        const overlay = this.add
            .rectangle(0, 0, W, H, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setDepth(LAYERS.OVERLAY)
            .setInteractive();

        const cartaZoom = this._criarFundoCartaZoom(W / 2, H / 2, carta.key);
        cartaZoom.setDepth(LAYERS.MODAL);

        const { btn: btnVoltar, texto: textoVoltar } = this._criarBotao(
            40, 40, 100, 50,
            '◀ VOLTAR', 0x1a3a5a, 0xcc4444, '#ff6666'
        );

        const { btn: btnSelecionar, texto: textoSelecionar } = this._criarBotao(
            W / 2, H / 2 + 320, 150, 50,
            'SELECIONAR ✓', 0x1a4a2a, 0x22cc66, '#22cc66'
        );

        const objetosModal = [overlay, cartaZoom, btnVoltar, textoVoltar, btnSelecionar, textoSelecionar];

        const fecharModal = () => {
            objetosModal.forEach(obj => obj.destroy());
            this.cartaEmDetalhes = null;
        };

        if (this.cartasSelecionadas.includes(carta)) {
            textoSelecionar.setText('SELECIONADO ✓');
            btnSelecionar.setFillStyle(0x2a6a3a);
        }

        btnVoltar.on('pointerover', () => btnVoltar.setFillStyle(0x2a4a6a));
        btnVoltar.on('pointerout',  () => btnVoltar.setFillStyle(0x1a3a5a));
        btnVoltar.on('pointerdown', fecharModal);

        btnSelecionar.on('pointerover', () => btnSelecionar.setFillStyle(0x2a6a3a));
        btnSelecionar.on('pointerout',  () => btnSelecionar.setFillStyle(0x1a4a2a));
        btnSelecionar.on('pointerdown', () => {
            this._alternarSelecaoCarta(carta, textoSelecionar, btnSelecionar, fecharModal);
        });
    }

    _alternarSelecaoCarta(carta, textoSelecionar, btnSelecionar, fecharModal) {
        const jaEstaSelecionada = this.cartasSelecionadas.includes(carta);
        const fase              = CenaNegociacao.FASES[this.faseAtual];

        if (jaEstaSelecionada) {
            this.cartasSelecionadas = this.cartasSelecionadas.filter(c => c !== carta);
            carta._selecionada      = false;
            textoSelecionar.setText('SELECIONAR ✓');
            btnSelecionar.setFillStyle(0x1a4a2a);
            return;
        }

        // Demonstração: apenas 1 produto por vez
        if (fase === 'demonstracao') {
            this.cartasSelecionadas = [];
            this.cartasNaMao.forEach(c => { c._selecionada = false; });
        }

        this.cartasSelecionadas.push(carta);
        carta._selecionada = true;
        textoSelecionar.setText('SELECIONADO ✓');
        btnSelecionar.setFillStyle(0x2a6a3a);

        const cartasExigidas = this.clienteConfig.cartasExigidas[fase] ?? [];
        const ehObrigatoria  = cartasExigidas.includes(carta.key);
        const faseComAvanco  = fase === 'abordagem' || fase === 'sondagem';

        if (faseComAvanco && ehObrigatoria) {
            this.time.delayedCall(ANIM_FADE_DURATION, () => {
                fecharModal();
                this._mostrarDialogo(this._falaAcertoFase(fase));
                this._alterarSatisfacao(CenaNegociacao.GANHO_SATISFACAO);
                this.time.delayedCall(DELAY_PROXIMA_FASE, () => this._avancarOuVencer());
            });
        }
    }

    _criarFundoCarta(x, y, key) {
        const obj = this.textures.exists(key)
            ? this.add.image(x, y, key).setDisplaySize(CARD_WIDTH, CARD_HEIGHT)
            : this.add.rectangle(x, y, CARD_WIDTH, CARD_HEIGHT, 0x0d1f2e).setStrokeStyle(2, 0x1a4a6a);

        obj.setInteractive({ useHandCursor: true });
        return obj;
    }

    _criarFundoCartaZoom(x, y, key) {
        return this.textures.exists(key)
            ? this.add.image(x, y, key).setDisplaySize(CARD_ZOOM_WIDTH, CARD_ZOOM_HEIGHT)
            : this.add.rectangle(x, y, CARD_ZOOM_WIDTH, CARD_ZOOM_HEIGHT, 0x0d1f2e).setStrokeStyle(2, 0x1a4a6a);
    }

    _criarBotao(x, y, w, h, label, corFundo, corBorda, corTexto) {
        const btn = this.add
            .rectangle(x, y, w, h, corFundo)
            .setStrokeStyle(2, corBorda)
            .setInteractive({ useHandCursor: true })
            .setDepth(LAYERS.MODAL);

        const texto = this.add.text(x, y, label, {
            fontFamily:    '"Courier New", monospace',
            fontSize:      '13px',
            color:         corTexto,
            letterSpacing: 1,
        }).setOrigin(0.5).setDepth(LAYERS.MODAL_BTN);

        return { btn, texto };
    }

    _cenaDeRetorno() {
        return 'MapaGelo';
    }
}