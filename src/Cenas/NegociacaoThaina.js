import CenaNegociacao from '../Classes/CenaNegociacao.js';

// ─────────────────────────────────────────────────────────────────────────────
// NegociacaoThaina.js — Cliente da Vila do Varejo
//
// CONTEXTO: Thaina é dona de uma loja de doces com problema de falha técnica
// e travamento na maquininha atual.
//
// FASES: abordagem → sondagem → demonstração (mín. 3 produtos)
//
// COERÊNCIA NARRATIVA:
//   GanchoDaDor ou PontoDeDorTecnico na sondagem → dor de falha técnica revelada
//   → CieloFlash2 match principal (+30), CieloZip e CieloTap matches secundários (+15)
//   → Outros produtos penalizam (não resolvem o travamento)
//
//   SondagemDeFluxo, PerguntaDeImpacto, ChaveDeExclusividade, Estrategia
//   → dor genérica → todos os produtos dão pontuação padrão, sem penalidade
//
// INSÍGNIA: InsigniaProduto1 — ajuste o path quando o asset existir.
// ─────────────────────────────────────────────────────────────────────────────

// Produtos que resolvem a dor de falha técnica e seus bônus extras
const PRODUTOS_MATCH_FALHA = {
    CieloFlash2: 30, // match principal — multiconexão + IA anti-falhas
    CieloZip:    15, // match secundário — bateria longa, hardware confiável
    CieloTap:    15, // match secundário — celular como backup imediato
};

// Pontuação padrão quando a dor não foi especificada
const PONTUACAO_PRODUTO_PADRAO = 10;

// Cartas de sondagem que revelam a dor de falha técnica
const CARTAS_DOR_FALHA = ['GanchoDaDor', 'PontoDeDor'];

// Mínimo de produtos que o jogador precisa apresentar
const PRODUTOS_NECESSARIOS = 3;

export default class NegociacaoThaina extends CenaNegociacao {
    constructor() {
        super('NegociacaoThaina', {
            nomeCliente:       'thaina',
            satisfacaoInicial: 0,

            fases: ['abordagem', 'sondagem', 'demonstracao'],

            acertosPorFase: {
                abordagem:    1,
                sondagem:     2,
                demonstracao: 3, // controlado por _apresentarProduto, mas mantém consistência
            },

            cartasExigidas: {
                abordagem: [
                    'DiretoAoPonto', 'GanchoSocial', 'AntiPitch', 'Proatividade',
                    'CuriosidadeDespertada', 'ReferenciaLocal', 'GatilhoDeEscassez', 'ParceriaEstrategica',
                ],
                sondagem: [
                    'GanchoDaDor', 'PontoDeDor', 'SondagemDeFluxo',
                    'PerguntaDeImpacto', 'ChaveDeExclusividade', 'Estrategia',
                ],
                demonstracao: [
                    'CieloFlash2', 'CieloZip', 'CieloTap',
                    'CieloFlash', 'CVBA', 'CieloLioOn',
                    'FlashRecarga', 'LioOnGestao', 'LioOnApps',
                    'MoedaEstrangeira', 'CrediarioDigital', 'Antecipacao',
                ],
            },

            cartasPorFase: {
                abordagem:    5, // sorteia 5 das 12
                sondagem:     6, // sorteia 6 das 12 (com paginação)
                demonstracao: 6, // mostra 6 das 12, jogador escolhe mín. 3
            },
        });

        this._produtosSelecionados = [];
        this._cartaSondagemUsada   = null;
    }

    // ── Insígnia ──────────────────────────────────────────────────────────────

    _getInsignia() {
        return {
            key:  'insignia_thaina',
            path: 'assets/insignias/InsigniaProduto1.png',
            nome: 'Mestre dos Produtos',
        };
    }

    preload() {
        super.preload();

        this.load.image('thaina_fundo',      'assets/NPC/Thaina/casa_thaina_negociacao.png');
        this.load.image('thaina_satisfeito', 'assets/NPC/Thaina/thaina_feliz.png');
        this.load.image('thaina_neutro',     'assets/NPC/Thaina/thaina_neutra.png');
        this.load.image('thaina_bravo',      'assets/NPC/Thaina/thaina_raiva.png');

        // ── 12 cartas de produto ──────────────────────────────────────────────
        // ── Cartas de abordagem ───────────────────────────────────────────────
        this.load.image('DiretoAoPonto',        'assets/Cartas/Abordagem/DiretoAoPonto.png');
        this.load.image('GanchoSocial',         'assets/Cartas/Abordagem/GanchoSocial.png');
        this.load.image('AntiPitch',            'assets/Cartas/Abordagem/AntiPitch.png');
        this.load.image('Proatividade',         'assets/Cartas/Abordagem/Proatividade.png');
        this.load.image('CuriosidadeDespertada','assets/Cartas/Abordagem/CuriosidadeDespertada.png');
        this.load.image('ReferenciaLocal',      'assets/Cartas/Abordagem/ReferenciaLocal.png');
        this.load.image('GatilhoDeEscassez',    'assets/Cartas/Abordagem/GatilhoDeEscassez.png');
        this.load.image('ParceriaEstrategica',  'assets/Cartas/Abordagem/ParceriaEstrategica.png');
        this.load.image('DesarmeElegante',      'assets/Cartas/Abordagem/DesarmeElegante.png');
        this.load.image('ComparacaoInteligente','assets/Cartas/Abordagem/ComparacaoInteligente.png');
        this.load.image('Problematica',         'assets/Cartas/Abordagem/Problematica.png');
        this.load.image('QuebraDePadrao',       'assets/Cartas/Abordagem/QuebraDePadrao.png');

        // ── Cartas de sondagem ────────────────────────────────────────────────
        this.load.image('GanchoDaDor',           'assets/Cartas/Sondagem/GanchoDaDor.png');
        this.load.image('PontoDeDor',            'assets/Cartas/Sondagem/PontoDeDor.png');
        this.load.image('SondagemDeFluxo',       'assets/Cartas/Sondagem/SondagemDeFluxo.png');
        this.load.image('PerguntaDeImpacto',     'assets/Cartas/Sondagem/PerguntaDeImpacto.png');
        this.load.image('ChaveDeExclusividade',  'assets/Cartas/Sondagem/ChaveDeExclusividade.png');
        this.load.image('Estrategia',            'assets/Cartas/Sondagem/Estrategia.png');
        this.load.image('LoboCurioso',           'assets/Cartas/Sondagem/LoboCurioso.png');
        this.load.image('AutoridadeImplicita',   'assets/Cartas/Sondagem/AutoridadeImplicita.png');
        this.load.image('Cliffhanger',           'assets/Cartas/Sondagem/Cliffhanger.png');
        this.load.image('EgoCorporativo',        'assets/Cartas/Sondagem/EgoCorporativo.png');
        this.load.image('SondagemDeCredito',     'assets/Cartas/Sondagem/SondagemDeCredito.png');
        this.load.image('DiagnosticoDeParceria', 'assets/Cartas/Sondagem/DiagnosticoDeParceria.png');

        // ── 12 cartas de produto ──────────────────────────────────────────────
        this.load.image('CieloFlash2',      'assets/Cartas/Produtos/FLASH2.png');
        this.load.image('CieloZip',         'assets/Cartas/Produtos/CIELOZIP.png');
        this.load.image('CieloTap',         'assets/Cartas/Produtos/CIELOTAP.png');
        this.load.image('CieloFlash',       'assets/Cartas/Produtos/FLASH.png');
        this.load.image('CVBA',             'assets/Cartas/Produtos/CVBA.png');
        this.load.image('CieloLioOn',       'assets/Cartas/Produtos/LIOON.png');
        this.load.image('FlashRecarga',     'assets/Cartas/Produtos/FlashRecarga.png');
        this.load.image('LioOnGestao',      'assets/Cartas/Produtos/LioOnGestao.png');
        this.load.image('LioOnApps',        'assets/Cartas/Produtos/LioOnApps.png');
        this.load.image('MoedaEstrangeira', 'assets/Cartas/Produtos/MoedaEstrangeira.png');
        this.load.image('CrediarioDigital', 'assets/Cartas/Produtos/CrediarioDigital.png');
        this.load.image('Antecipacao',      'assets/Cartas/Produtos/Antecipacao.png');

        const insignia = this._getInsignia();
        if (insignia) this.load.image(insignia.key, insignia.path);
    }

    // ── Pontuação dinâmica baseada na sondagem ────────────────────────────────

    _dorFalhaRevelada() {
        return CARTAS_DOR_FALHA.includes(this._cartaSondagemUsada);
    }

    _getPontuacaoCarta(key) {
        if (this._dorFalhaRevelada()) {
            return PRODUTOS_MATCH_FALHA[key] ?? 0;
        }
        return PONTUACAO_PRODUTO_PADRAO;
    }

    _produtoEstaErrado(key) {
        if (!this._dorFalhaRevelada()) return false;
        return !(key in PRODUTOS_MATCH_FALHA);
    }

    // ── Falas ─────────────────────────────────────────────────────────────────

    _falaInicioFase(fase) {
        const falas = {
            abordagem:    'Oi, tô ocupada aqui, mas pode falar.',
            sondagem:     'Tá bom, me conta. O que você veio propor?',
            demonstracao: `Minha maquininha trava toda hora. Me mostre pelo menos ${PRODUTOS_NECESSARIOS} opções que possam resolver isso.`,
        };
        return falas[fase] ?? 'O que você tem a me apresentar?';
    }

    _falaAcertoFase(fase) {
        const falas = {
            abordagem:    'Pode falar sim! Sou a Thaina, dona daqui.',
            sondagem:     'É exatamente isso! Minha maquininha trava na hora do pico e perco venda.',
            demonstracao: 'Gostei! Pelo menos um desses resolve o meu problema.',
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

    // ── Deck completo — 12 cartas por fase ───────────────────────────────────

    _getCartasDaFase(fase, quantidade) {
        const todasCartas = {
            abordagem: [
                // Positivas
                'DiretoAoPonto', 'GanchoSocial', 'AntiPitch', 'Proatividade',
                'CuriosidadeDespertada', 'ReferenciaLocal', 'GatilhoDeEscassez', 'ParceriaEstrategica',
                // Negativas
                'DesarmeElegante', 'ComparacaoInteligente', 'Problematica', 'QuebraDePadrao',
            ],
            sondagem: [
                // Positivas / revelam dor
                'GanchoDaDor', 'PontoDeDor', 'SondagemDeFluxo',
                'PerguntaDeImpacto', 'ChaveDeExclusividade', 'Estrategia',
                // Negativas
                'LoboCurioso', 'AutoridadeImplicita', 'Cliffhanger',
                'EgoCorporativo', 'SondagemDeCredito', 'DiagnosticoDeParceria',
            ],
            demonstracao: [
                // Matches de falha técnica
                'CieloFlash2', 'CieloZip', 'CieloTap',
                // Demais produtos
                'CieloFlash', 'CVBA', 'CieloLioOn',
                'FlashRecarga', 'LioOnGestao', 'LioOnApps',
                'MoedaEstrangeira', 'CrediarioDigital', 'Antecipacao',
            ],
        };

        const exigidas     = this.clienteConfig.cartasExigidas[fase] ?? [];
        const disponiveis  = todasCartas[fase] ?? [];
        const embaralhadas = Phaser.Utils.Array.Shuffle([...disponiveis]);

        return Array.from({ length: quantidade }, (_, i) => {
            const key = embaralhadas[i] ?? `carta_${fase}_${i}`;
            return { key, fase, obrigatoria: exigidas.includes(key) };
        });
    }

    // ── Captura carta de sondagem usada ──────────────────────────────────────

    _resolverCarta(carta) {
        if (this.clienteConfig.fases[this.faseAtual] === 'sondagem') {
            this._cartaSondagemUsada = carta.key;
        }
        super._resolverCarta(carta);
    }

    // ── Seleção múltipla na demonstração ──────────────────────────────────────

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
            fontFamily:    '"Courier New", monospace',
            fontSize:      '14px',
            color:         '#ccaa44',
            letterSpacing: 2,
        }).setOrigin(0.5).setDepth(50);
    }

    _textoContador() {
        return `Produtos apresentados: ${this._produtosSelecionados.length} / ${PRODUTOS_NECESSARIOS}`;
    }

    _atualizarContador() {
        if (this._contadorTexto) this._contadorTexto.setText(this._textoContador());
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

        const faltam     = PRODUTOS_NECESSARIOS - this._produtosSelecionados.length;
        const labelBotao = faltam === 1
            ? 'APRESENTAR ✓ (último!)'
            : `APRESENTAR ✓ (faltam ${faltam})`;

        const { btn: btnVoltar,     texto: textoVoltar     } = this._criarBotao(40, 40, 100, 50, '◀ VOLTAR', 0x1a3a5a, 0xcc4444, '#ff6666');
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
                let msg;
                if (this._dorFalhaRevelada() && carta.key === 'CieloFlash2') {
                    msg = `Esse resolve! A IA prevê falhas antes de acontecer. Me mostra mais ${faltam}.`;
                } else if (this._dorFalhaRevelada() && (carta.key === 'CieloZip' || carta.key === 'CieloTap')) {
                    msg = `Interessante, esse pode ajudar. Me mostra mais ${faltam}.`;
                } else {
                    msg = `Produto apresentado. Continue mostrando mais ${faltam}.`;
                }
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

    // ── Retorno ───────────────────────────────────────────────────────────────

    _cenaDeRetorno() {
        return 'VilaDoVarejo';
    }
}