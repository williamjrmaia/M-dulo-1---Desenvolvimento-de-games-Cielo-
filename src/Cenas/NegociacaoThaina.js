import CenaNegociacao from '../Classes/CenaNegociacao.js';
import Insignia       from '../Classes/Insignia.js';

// ─────────────────────────────────────────────────────────────────────────────
// NegociacaoThaina.js — Cliente da Vila do Varejo
//
// CONTEXTO: Thaina é dona de um estabelecimento com problemas de falha
// técnica / travamento na maquininha atual.
//
// FASES: abordagem → sondagem → demonstração (3 produtos)
// A fase de demonstração exige que o jogador selecione 3 cartas de produto.
//
// COERÊNCIA NARRATIVA:
//   Se o jogador usou GanchoDaDor na sondagem → Thaina revelou dor de falha
//   técnica → CieloFlash2 é o produto correto (multiconexão + IA anti-falhas)
//   → dá bônus máximo; qualquer outro produto penaliza a satisfação.
//
//   Se usou PerguntaDeImpacto → dor não foi especificada → todos os produtos
//   dão pontuação normal, sem bônus nem penalidade extra.
//
// INSÍGNIA: 'vila_varejo' — cadastrada em Insignia.CATALOGO
// ─────────────────────────────────────────────────────────────────────────────

// Pontuação base por produto quando a dor NÃO foi especificada na sondagem
const PONTUACAO_PRODUTO_PADRAO = {
    CieloLioOn:  10,
    CieloFlash:  10,
    CVBA:        10,
    CieloFlash2: 10,
};

// Pontuação quando a dor de FALHA TÉCNICA foi revelada (GanchoDaDor)
// CieloFlash2 resolve a dor → bônus máximo; os outros penalizam
const PONTUACAO_PRODUTO_FALHA = {
    CieloFlash2: 30, // match correto — multiconexão + IA anti-falhas
    CieloLioOn:   0, // não resolve falha técnica — penalidade aplicada em _apresentarProduto
    CieloFlash:   0,
    CVBA:         0,
};

// Carta de sondagem que revela a dor de falha técnica
const CARTA_DOR_FALHA = 'GanchoDaDor';

// Quantas cartas de produto o jogador precisa selecionar na demonstração
const PRODUTOS_NECESSARIOS = 3;

export default class NegociacaoThaina extends CenaNegociacao {
    constructor() {
        super('NegociacaoThaina', {
            nomeCliente:       'thaina',
            satisfacaoInicial: 0,

            // Apenas 3 fases — negociação e fechamento removidos
            fases: ['abordagem', 'sondagem', 'demonstracao'],

            cartasExigidas: {
                abordagem:    ['DiretoAoPonto', 'GanchoSocial', 'AntiPitch'],
                sondagem:     ['PerguntaDeImpacto', 'GanchoDaDor'],
                demonstracao: ['CieloLioOn', 'CieloFlash', 'CVBA', 'CieloFlash2'],
            },
            cartasPorFase: {
                abordagem:    5,
                sondagem:     6,
                demonstracao: 4, // mostra 4 cartas, jogador escolhe 3
            },
        });

        // Controle da seleção múltipla na demonstração
        this._produtosSelecionados = [];

        // Guarda qual carta de sondagem o jogador usou
        this._cartaSondagemUsada = null;
    }

    // ── Insígnia ──────────────────────────────────────────────────────────────

    preload() {
        super.preload();

        this.load.image('thaina_fundo',      'assets/NPC/Thaina/casa_thaina_negociacao.png');
        this.load.image('thaina_satisfeito', 'assets/NPC/Thaina/thaina_feliz.png');
        this.load.image('thaina_neutro',     'assets/NPC/Thaina/thaina_neutra.png');
        this.load.image('thaina_bravo',      'assets/NPC/Thaina/thaina_raiva.png');

        Insignia.preload(this);
    }

    // Chamado internamente por CenaNegociacao ao vencer a negociação
    _aoVencer() {
        const insignia = new Insignia(this, 'vila_varejo');
        insignia.conceder();
    }

    _chaveVitoria() {
        return 'varejo_vencido';
    }

    // ── Pontuação dinâmica — depende da carta usada na sondagem ──────────────

    _getPontuacaoCarta(key) {
        if (this._cartaSondagemUsada === CARTA_DOR_FALHA) {
            return PONTUACAO_PRODUTO_FALHA[key] ?? 0;
        }
        return PONTUACAO_PRODUTO_PADRAO[key] ?? 0;
    }

    // Produto errado = não resolve a dor revelada na sondagem
    _produtoEstaErrado(key) {
        if (this._cartaSondagemUsada !== CARTA_DOR_FALHA) return false;
        return key !== 'CieloFlash2';
    }

    // ── Falas ─────────────────────────────────────────────────────────────────

    _falaInicioFase(fase) {
        const falas = {
            abordagem:    'Oi, tô ocupada aqui, mas pode falar.',
            sondagem:     'Tá bom, me conta. O que você tem pra me oferecer?',
            demonstracao: `Minha maquininha trava toda hora. Me mostre ${PRODUTOS_NECESSARIOS} opções que possam resolver isso.`,
        };
        return falas[fase] ?? 'O que você tem a me apresentar?';
    }

    _falaAcertoFase(fase) {
        const falas = {
            abordagem:    'Pode falar sim! Sou a Thaina, dona daqui.',
            sondagem:     'É exatamente isso! Minha maquininha trava na hora do pico e perco venda.',
            demonstracao: 'Gostei! Pelo menos um desses resolve meu problema.',
        };
        return falas[fase] ?? 'Pode continuar.';
    }

    _falaErroFase(fase) {
        const falas = {
            abordagem:    'Não tenho interesse, obrigada.',
            sondagem:     'Isso não tem nada a ver com o meu problema.',
            demonstracao: 'Nenhum desses resolve o que eu preciso.',
        };
        return falas[fase] ?? 'Não entendi sua estratégia.';
    }

    // ── Deck de cartas por fase ───────────────────────────────────────────────

    _getCartasDaFase(fase, quantidade) {
        const todasCartas = {
            abordagem:    ['DiretoAoPonto', 'GanchoSocial', 'AntiPitch', 'ComparacaoInteligente', 'DesarmeElegante'],
            sondagem:     ['PerguntaDeImpacto', 'GanchoDaDor', 'AutoridadeImplicita', 'ChaveDeExclusividade', 'Cliffhanger', 'LoboCurioso'],
            demonstracao: ['CieloLioOn', 'CieloFlash', 'CieloFlash2', 'CVBA'],
        };

        const exigidas     = this.clienteConfig.cartasExigidas[fase] ?? [];
        const disponiveis  = todasCartas[fase] ?? [];
        const embaralhadas = Phaser.Utils.Array.Shuffle([...disponiveis]);

        return Array.from({ length: quantidade }, (_, i) => {
            const key = embaralhadas[i] ?? `carta_${fase}_${i}`;
            return { key, fase, obrigatoria: exigidas.includes(key) };
        });
    }

    // Sobrescreve _resolverCarta apenas para capturar a carta de sondagem usada
    _resolverCarta(carta) {
        if (this.clienteConfig.fases[this.faseAtual] === 'sondagem') {
            this._cartaSondagemUsada = carta.key;
        }
        super._resolverCarta(carta);
    }

    // ── Lógica de seleção múltipla na demonstração ────────────────────────────

    _iniciarFase() {
        this._produtosSelecionados = [];
        this._contadorTexto        = null;
        super._iniciarFase();

        if (this.clienteConfig.fases[this.faseAtual] === 'demonstracao') {
            this._criarContadorProdutos();
        }
    }

    _criarContadorProdutos() {
        const W = this.scale.width;
        const H = this.scale.height;

        if (this._contadorTexto) this._contadorTexto.destroy();

        this._contadorTexto = this.add.text(W / 2, H * 0.62, this._textoContador(), {
            fontFamily: '"Courier New", monospace',
            fontSize:   '14px',
            color:      '#ccaa44',
            letterSpacing: 2,
        }).setOrigin(0.5).setDepth(50);
    }

    _textoContador() {
        return `Produtos apresentados: ${this._produtosSelecionados.length} / ${PRODUTOS_NECESSARIOS}`;
    }

    _atualizarContador() {
        if (this._contadorTexto) {
            this._contadorTexto.setText(this._textoContador());
        }
    }

    _mostrarDetalheCarta(carta) {
        if (!this.negociacaoAtiva) return;
        if (this.cartaEmDetalhes) return;

        const fase = this.clienteConfig.fases[this.faseAtual];

        if (fase !== 'demonstracao') {
            super._mostrarDetalheCarta(carta);
            return;
        }

        if (this._produtosSelecionados.find(c => c.key === carta.key)) {
            this._mostrarDialogo('Você já apresentou este produto!');
            return;
        }

        this.cartaEmDetalhes = carta;

        const W = this.scale.width;
        const H = this.scale.height;
        const { LAYERS } = CenaNegociacao;

        const overlay = this.add
            .rectangle(0, 0, W, H, 0x000000, 0.7)
            .setOrigin(0, 0).setDepth(LAYERS.OVERLAY).setInteractive();

        const cartaZoom = this._criarFundoCartaZoom(W / 2, H / 2, carta.key);
        cartaZoom.setDepth(LAYERS.MODAL);

        const restantes  = PRODUTOS_NECESSARIOS - this._produtosSelecionados.length;
        const labelBotao = restantes === 1 ? 'APRESENTAR ✓ (último!)' : `APRESENTAR ✓ (faltam ${restantes})`;

        const { btn: btnVoltar,     texto: textoVoltar     } = this._criarBotao(40, 40, 100, 50, '◀ VOLTAR',  0x1a3a5a, 0xcc4444, '#ff6666');
        const { btn: btnSelecionar, texto: textoSelecionar } = this._criarBotao(W / 2, H / 2 + 320, 220, 50, labelBotao, 0x1a4a2a, 0x22cc66, '#22cc66');

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
            this._apresentarProduto(carta);
        });
    }

    _apresentarProduto(carta) {
        this._produtosSelecionados.push(carta);
        this._atualizarContador();

        const errado = this._produtoEstaErrado(carta.key);
        const pontos = this._getPontuacaoCarta(carta.key);

        if (errado) {
            this._alterarSatisfacao(-CenaNegociacao.PERDA_SATISFACAO);
            this._mostrarDialogo('Isso não resolve o travamento. Você prestou atenção no que eu disse?');
        } else {
            this._alterarSatisfacao(CenaNegociacao.GANHO_SATISFACAO + pontos);

            const faltam = PRODUTOS_NECESSARIOS - this._produtosSelecionados.length;
            if (faltam > 0) {
                const msg = this._cartaSondagemUsada === CARTA_DOR_FALHA && carta.key === 'CieloFlash2'
                    ? `Esse resolve! A IA prevê falhas antes de acontecer. Me mostra mais ${faltam}.`
                    : `Produto apresentado! Continue mostrando mais ${faltam}.`;
                this._mostrarDialogo(msg);
            }
        }

        if (this._produtosSelecionados.length < PRODUTOS_NECESSARIOS) return;

        this.negociacaoAtiva = false;

        if (this.satisfacao <= 0) {
            this._perderNegociacao();
            return;
        }

        this._mostrarDialogo(this._falaAcertoFase('demonstracao'));
        this.time.delayedCall(4000, () => {
            this.negociacaoAtiva = true;
            this._avancarOuVencer();
        });
    }

    // ── Retorna para a Vila do Varejo ─────────────────────────────────────────

    _cenaDeRetorno() {
        return 'VilaDoVarejo';
    }
}