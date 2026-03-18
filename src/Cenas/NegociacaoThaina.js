import CenaNegociacao from '../Classes/CenaNegociacao.js';

const CARD_WIDTH         = 270;
const CARD_HEIGHT        = 330;
const CARD_SPACING       = 25;
const CARD_ZOOM_WIDTH    = 400;
const CARD_ZOOM_HEIGHT   = 550;
const ANIM_FADE_DURATION = 300;
const ANIM_HOVER_OFFSET  = 8;

const LAYERS = {
    OVERLAY:   100,
    MODAL:     101,
    MODAL_BTN: 102,
};

// TODO: ajustar pontuação por produto quando o design da Thaina estiver definido
const PONTUACAO_PRODUTO = {
    CieloLioOn:  10,
    CieloFlash:  15,
    CVBA:        20,
    CieloFlash2: 25,
};

export default class NegociacaoThaina extends CenaNegociacao {
    constructor() {
        super('NegociacaoThaina', {
            nomeCliente:       'thaina',
            satisfacaoInicial: 0,
            cartasExigidas: {
                // TODO: substituir pelas cartas corretas da Thaina quando definidas
                abordagem:    ['DiretoAoPonto', 'GanchoSocial', 'AntiPitch'],
                sondagem:     ['PerguntaDeImpacto', 'GanchoDaDor'],
                demonstracao: ['CieloLioOn', 'CieloFlash', 'CVBA', 'CieloFlash2'], // todas acertam
                negociacao:   ['Ajuste', 'Validacao', 'Quebra'],
                fechamento:   ['Adicional', 'Alternativo', 'Desconto'],
            },
            cartasPorFase: {
                abordagem:    5,
                sondagem:     6,
                demonstracao: 4,
                negociacao:   3,
                fechamento:   5,
            },
        });
    }

    _getPontuacaoCarta(key) {
        return PONTUACAO_PRODUTO[key] ?? 0;
    }

    // TODO: substituir pelas falas reais da Thaina quando o roteiro estiver pronto
    _falaInicioFase(fase) {
        const falas = {
            abordagem:    'Olá! Pode me ajudar?',
            demonstracao: 'Interessante, me mostre como funciona na prática.',
            negociacao:   'O produto parece bom, mas preciso rever os custos.',
            fechamento:   'Se as condições estiverem certas, podemos fechar negócio.',
        };
        return falas[fase] ?? 'O que você tem a me apresentar?';
    }

    _falaAcertoFase(fase) {
        const falas = {
            abordagem:    'Que bom! Vamos conversar. Sou a Thaina, dona daqui.',
            sondagem:     'Faz sentido. Continue, estou ouvindo.',
            demonstracao: 'Gostei! Parece que atende o que eu preciso.',
            negociacao:   'As condições me parecem razoáveis.',
            fechamento:   'Temos um acordo! Bem-vindo à Cielo.',
        };
        return falas[fase] ?? 'Pode continuar.';
    }

    _falaErroFase(fase) {
        const falas = {
            abordagem:  'Não, obrigada. Não tenho interesse.',
            sondagem:   'Isso não responde à minha situação.',
            negociacao: 'Não consigo aceitar essas condições.',
            fechamento: 'Não chegamos a um acordo. Talvez outra hora.',
        };
        return falas[fase] ?? 'Não entendi sua estratégia.';
    }

    _getCartasDaFase(fase, quantidade) {
        // TODO: substituir por cartas exclusivas da Thaina quando disponíveis
        const todasCartas = {
            abordagem:    ['DiretoAoPonto', 'GanchoSocial', 'AntiPitch', 'ComparacaoInteligente', 'DesarmeElegante'],
            sondagem:     ['PerguntaDeImpacto', 'GanchoDaDor', 'AutoridadeImplicita', 'ChaveDeExclusividade', 'Cliffhanger', 'LoboCurioso'],
            demonstracao: ['CieloLioOn', 'CieloFlash', 'CieloFlash2', 'CVBA'],
            negociacao:   ['Ajuste', 'Validacao', 'Quebra'],
            fechamento:   ['Adicional', 'Alternativo', 'Desconto', 'Penalidade', 'Teste'],
        };

        const exigidas     = this.clienteConfig.cartasExigidas[fase] ?? [];
        const disponiveis  = todasCartas[fase] ?? [];
        const embaralhadas = Phaser.Utils.Array.Shuffle([...disponiveis]);

        return Array.from({ length: quantidade }, (_, i) => {
            const key = embaralhadas[i] ?? `carta_${fase}_${i}`;
            return { key, fase, obrigatoria: exigidas.includes(key) };
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
        if (this.cartaEmDetalhes) return; // já tem um modal aberto

        this.cartaEmDetalhes = carta;

        const W = this.scale.width;
        const H = this.scale.height;

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
            this._resolverCarta(carta); // ← toda a lógica de acerto/erro fica aqui
        });
    }

    _criarFundoCarta(x, y, key) {
        const obj = this.textures.exists(key)
            ? this.add.image(x, y, key).setDisplaySize(CARD_WIDTH, CARD_HEIGHT)
            : this.add.rectangle(x, y, CARD_WIDTH, CARD_HEIGHT, 0x0d1f2e).setStrokeStyle(2, 0x1a4a6a);
        return obj.setInteractive({ useHandCursor: true });
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
            fontFamily: '"Courier New", monospace',
            fontSize: '13px',
            color: corTexto,
            letterSpacing: 1,
        }).setOrigin(0.5).setDepth(LAYERS.MODAL_BTN);

        return { btn, texto };
    }

    preload() {
        super.preload();
        this.load.image('Thaina_fundo', 'assets/MapaGelo/Cena01_house2.png');
    }

    _cenaDeRetorno() {
        return 'VilaDoVarejo';
    }
}