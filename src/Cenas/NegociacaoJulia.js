import CenaNegociacao from '../Classes/CenaNegociacao.js';
 
// ─────────────────────────────────────────────────────────────────────────────
// NegociacaoJulia.js — Cliente da Praia dos Proventos
//
// CONTEXTO: Julia ("Chefa") é dona de um estabelecimento que sente pressão
// da concorrência com preços melhores e teme perder clientes por isso.
//
// FASES: abordagem → sondagem → demonstracao → beneficios
//
//   - Abordagem:    jogador escolhe 1 carta de um deck de 5
//   - Sondagem:     jogador escolhe 2 cartas de um deck de 6
//   - Demonstracao: jogador apresenta 3 produtos de um deck de 12
//   - Beneficios:   jogador escolhe 2 beneficios de uma mao de 5
//                   (as 2 corretas sempre aparecem + 3 erradas aleatorias)
//
// COERENCIA NARRATIVA — DOR DE CONCORRENCIA:
//   Se o jogador usou GanchoDaDor OU PerguntaDeImpacto em qualquer rodada
//   da sondagem, a dor de concorrencia de Julia foi revelada.
//
//   Com a dor revelada:
//     - Demonstracao: CVBA = 30 pts; demais produtos = 0 pts + penalidade
//     - Beneficios:   Taxas e Comparativo sao os corretos (20 pts cada);
//                     demais = 0 pts + penalidade normal
//
//   Sem a dor revelada:
//     - Todos os produtos e beneficios valem 10 pts (padrao igualitario)
//
// BENEFICIOS — ESTRUTURA DA MAO:
//   As 2 cartas corretas (Taxas + Comparativo) sempre aparecem na mao.
//   As 3 restantes sao sorteadas aleatoriamente entre as 10 erradas.
//   Selecionar uma carta errada penaliza a satisfacao e a descarta da mao,
//   mas nao conta para o total de 2 necessarios — o jogador precisa achar
//   as 2 corretas para avancar.
//
// SEM INSIGNIA: esta cena nao concede insignia ao jogador.
// ─────────────────────────────────────────────────────────────────────────────

// ── Pontuacao de DEMONSTRACAO ─────────────────────────────────────────────────

const PONTUACAO_PRODUTO_PADRAO = {
    Antecipacao:      10,
    CrediarioDigital: 10,
    CVBA:             10,
    CieloFlash:       10,
    CieloFlash2:      10,
    FlashRecarga:     10,
    CieloLioOn:       10,
    LioOnApps:        10,
    LioOnGestao:      10,
    MoedaEstrangeira: 10,
    CieloTap:         10,
    CieloZip:         10,
};

// Com dor revelada: apenas CVBA resolve o problema de concorrencia
const PONTUACAO_PRODUTO_CONCORRENCIA = {
    CVBA:             30,
    Antecipacao:       0,
    CrediarioDigital:  0,
    CieloFlash:        0,
    CieloFlash2:       0,
    FlashRecarga:      0,
    CieloLioOn:        0,
    LioOnApps:         0,
    LioOnGestao:       0,
    MoedaEstrangeira:  0,
    CieloTap:          0,
    CieloZip:          0,
};

// ── Pontuacao de BENEFICIOS ───────────────────────────────────────────────────

// Sem dor revelada: todos os beneficios valem igual
const PONTUACAO_BENEFICIO_PADRAO = {
    Aceitacao:            10,
    AceitaCarteiras:      10,
    AnosDeMercado:        10,
    Bandeiras:            10,
    FidelidadeBeneficios: 10,
    Gestao:               10,
    RecebimentoRapido:    10,
    Seguranca:            10,
    Suporte:              10,
    Taxas:                10,
    Comparativo:          10,
    Troca:                10,
};

// Com dor revelada: Taxas e Comparativo resolvem a pressao de preco/concorrencia
const PONTUACAO_BENEFICIO_CONCORRENCIA = {
    Taxas:                20, // correto — taxas negociaveis combatem preco da concorrencia
    Comparativo:          20, // correto — comparativo de valor diferencia da concorrencia
    Aceitacao:             0,
    AceitaCarteiras:       0,
    AnosDeMercado:         0,
    Bandeiras:             0,
    FidelidadeBeneficios:  0,
    Gestao:                0,
    RecebimentoRapido:     0,
    Seguranca:             0,
    Suporte:               0,
    Troca:                 0,
};

// Beneficios corretos para Julia
const BENEFICIOS_CORRETOS = new Set(['Taxas', 'Comparativo']);

// Pool de beneficios errados para sortear as 3 cartas extras da mao
const BENEFICIOS_ERRADOS = [
    'Aceitacao', 'AceitaCarteiras', 'AnosDeMercado', 'Bandeiras',
    'FidelidadeBeneficios', 'Gestao', 'RecebimentoRapido',
    'Seguranca', 'Suporte', 'Troca',
];

// ── Cartas de sondagem que revelam a dor ─────────────────────────────────────
const CARTAS_DOR_CONCORRENCIA = new Set(['GanchoDaDor', 'PerguntaDeImpacto']);

// ── Constantes de progresso ───────────────────────────────────────────────────
const PRODUTOS_NECESSARIOS   = 3;
const BENEFICIOS_NECESSARIOS = 2;

const CARTAS_NA_MAO = {
    abordagem:    5,
    sondagem:     6,
    demonstracao: 4,
    beneficios:   5, // 2 corretas garantidas + 3 erradas aleatorias
};

const ACERTOS_POR_FASE = {
    abordagem: 1,
    sondagem:  2,
    // demonstracao e beneficios tem logica propria
};

// ─────────────────────────────────────────────────────────────────────────────

export default class NegociacaoJulia extends CenaNegociacao {
    constructor() {
        super('NegociacaoJulia', {
            nomeCliente:       'Chefa',
            satisfacaoInicial: 0,

            fases: ['abordagem', 'sondagem', 'demonstracao', 'beneficios'],

            cartasExigidas: {
                abordagem:    ['DiretoAoPonto', 'GanchoSocial', 'AntiPitch'],
                sondagem:     ['PerguntaDeImpacto', 'GanchoDaDor', 'ChaveDeExclusividade',
                               'Estrategia', 'SondagemDeFluxo', 'SondagemDePrazo'],
                demonstracao: ['CVBA', 'CieloFlash2', 'CieloFlash', 'CieloLioOn',
                               'LioOnGestao', 'CieloTap', 'CieloZip', 'Antecipacao'],
                beneficios:   ['Taxas', 'Comparativo'],
            },

            cartasPorFase: CARTAS_NA_MAO,
        });

        // Selecao multipla — demonstracao
        this._produtosSelecionados   = [];
        this._contadorTexto          = null;

        // Selecao multipla — beneficios
        this._beneficiosSelecionados = [];
        this._contadorBeneficioTexto = null;

        // Cartas de sondagem usadas (para detectar dor revelada)
        this._cartasSondagemUsadas = new Set();
    }

    // ── Preload ───────────────────────────────────────────────────────────────
    // Todos os assets ja carregados no Preloader global.

    preload() {
        super.preload();
    }

    // ── Sem insignia ──────────────────────────────────────────────────────────

    _aoVencer() {}

    _chaveVitoria() {
        return 'praia_vencido';
    }

    // ── Helper: dor de concorrencia revelada? ─────────────────────────────────

    _dorConcorrenciaRevelada() {
        for (const carta of this._cartasSondagemUsadas) {
            if (CARTAS_DOR_CONCORRENCIA.has(carta)) return true;
        }
        return false;
    }

    // ── Pontuacao dinamica ────────────────────────────────────────────────────

    _getPontuacaoCarta(key) {
        // Verifica se a chave pertence ao grupo de beneficios
        if (BENEFICIOS_CORRETOS.has(key) || BENEFICIOS_ERRADOS.includes(key)) {
            return this._dorConcorrenciaRevelada()
                ? (PONTUACAO_BENEFICIO_CONCORRENCIA[key] ?? 0)
                : (PONTUACAO_BENEFICIO_PADRAO[key] ?? 0);
        }
        // Produto de demonstracao
        return this._dorConcorrenciaRevelada()
            ? (PONTUACAO_PRODUTO_CONCORRENCIA[key] ?? 0)
            : (PONTUACAO_PRODUTO_PADRAO[key] ?? 0);
    }

    _produtoEstaErrado(key) {
        if (!this._dorConcorrenciaRevelada()) return false;
        return key !== 'CVBA';
    }

    _beneficioEstaErrado(key) {
        if (!this._dorConcorrenciaRevelada()) return false;
        return !BENEFICIOS_CORRETOS.has(key);
    }

    // ── Falas ─────────────────────────────────────────────────────────────────

    _falaInicioFase(fase) {
        const falas = {
            abordagem:    'Olá! Posso ajudar?',
            sondagem:     'Tudo bem. Me conta mais, o que você tem em mente?',
            demonstracao: `Meus concorrentes estão com preços mais baixos. Me mostre ${PRODUTOS_NECESSARIOS} opções que me ajudem a competir.`,
            beneficios:   `Certo. Agora me apresente ${BENEFICIOS_NECESSARIOS} benefícios que justifiquem a escolha de vocês.`,
        };
        return falas[fase] ?? 'O que você tem a me apresentar?';
    }

    _falaAcertoFase(fase) {
        const falas = {
            abordagem:    'Boa abordagem! Sou a Julia, responsável pelo estabelecimento.',
            sondagem:     'Exatamente isso. Estou perdendo clientes para a concorrência por causa do preço.',
            demonstracao: 'Gostei! Pelo menos um desses me ajuda a me diferenciar da concorrência.',
            beneficios:   'Esses benefícios fazem sentido para o meu negócio. Vamos fechar!',
        };
        return falas[fase] ?? 'Pode continuar.';
    }

    _falaErroFase(fase) {
        const falas = {
            abordagem:    'Não tenho interesse. Obrigada.',
            sondagem:     'Isso não se aplica à minha realidade.',
            demonstracao: 'Nenhum desses resolve o que eu preciso.',
            beneficios:   'Esse benefício não tem nada a ver com o meu problema.',
        };
        return falas[fase] ?? 'Não entendi sua estratégia.';
    }

    // ── Deck de cartas por fase ───────────────────────────────────────────────

    _getCartasDaFase(fase, quantidade) {
        // Fase de beneficios: montagem especial com 2 corretas garantidas
        if (fase === 'beneficios') {
            return this._montarMaoBeneficios();
        }

        const todasCartas = {
            abordagem: [
                'DiretoAoPonto',
                'GanchoSocial',
                'AntiPitch',
                'ComparacaoInteligente',
                'DesarmeElegante',
            ],
            sondagem: [
                'PerguntaDeImpacto',     // revela dor de concorrencia
                'GanchoDaDor',           // revela dor de concorrencia
                'AutoridadeImplicita',
                'ChaveDeExclusividade',
                'Cliffhanger',
                'LoboCurioso',
            ],
            demonstracao: [
                'Antecipacao', 'CrediarioDigital', 'CVBA', 'CieloFlash',
                'CieloFlash2', 'FlashRecarga', 'CieloLioOn', 'LioOnApps',
                'LioOnGestao', 'MoedaEstrangeira', 'CieloTap', 'CieloZip',
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

    // Mao de beneficios: 2 corretas garantidas + 3 erradas aleatorias, tudo embaralhado
    _montarMaoBeneficios() {
        const erradasEmbaralhadas = Phaser.Utils.Array.Shuffle([...BENEFICIOS_ERRADOS]);
        const erradasSorteadas    = erradasEmbaralhadas.slice(0, 3);

        const todasNaMao = Phaser.Utils.Array.Shuffle([
            'Taxas', 'Comparativo', ...erradasSorteadas,
        ]);

        return todasNaMao.map(key => ({
            key,
            fase:        'beneficios',
            obrigatoria: BENEFICIOS_CORRETOS.has(key),
        }));
    }

    // ── Resolucao de carta ────────────────────────────────────────────────────

    _resolverCarta(carta) {
        if (!this.negociacaoAtiva) return;

        const fase = this.clienteConfig.fases[this.faseAtual];

        // Fases com logica propria de selecao multipla
        if (fase === 'demonstracao') {
            this._apresentarProduto(carta);
            return;
        }
        if (fase === 'beneficios') {
            this._selecionarBeneficio(carta);
            return;
        }

        // Abordagem e sondagem: logica de acertos sequenciais
        const exigidas = this.clienteConfig.cartasExigidas[fase] ?? [];
        const acertou  = exigidas.length === 0 || exigidas.includes(carta.key);

        if (fase === 'sondagem') {
            this._cartasSondagemUsadas.add(carta.key);
        }

        if (acertou) {
            const pontos = this._getPontuacaoCarta(carta.key);
            this._alterarSatisfacao(CenaNegociacao.GANHO_SATISFACAO + pontos);
            this.acertosNaFase++;

            if (carta._objetos?.bg) carta._objetos.bg.destroy();
            this.cartasNaMao = this.cartasNaMao.filter(c => c !== carta);

            const acertosNecessarios = ACERTOS_POR_FASE[fase] ?? CenaNegociacao.ACERTOS_PARA_AVANCAR;
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

    // ── Inicializacao de fase ─────────────────────────────────────────────────

    _iniciarFase() {
        this._produtosSelecionados   = [];
        this._beneficiosSelecionados = [];
        this._contadorTexto          = null;
        this._contadorBeneficioTexto = null;

        super._iniciarFase();

        const fase = this.clienteConfig.fases[this.faseAtual];

        if (fase === 'demonstracao') this._criarContadorProdutos();
        if (fase === 'beneficios')   this._criarContadorBeneficios();
    }

    // ── Contador visual — demonstracao ────────────────────────────────────────

    _criarContadorProdutos() {
        const W = this.scale.width;
        const H = this.scale.height;

        if (this._contadorTexto) this._contadorTexto.destroy();

        this._contadorTexto = this.add.text(W / 2, H * 0.62, this._textoContadorProdutos(), {
            fontFamily:    '"Courier New", monospace',
            fontSize:      '14px',
            color:         '#ccaa44',
            letterSpacing: 2,
        }).setOrigin(0.5).setDepth(50);
    }

    _textoContadorProdutos() {
        return `Produtos apresentados: ${this._produtosSelecionados.length} / ${PRODUTOS_NECESSARIOS}`;
    }

    _atualizarContadorProdutos() {
        if (this._contadorTexto) this._contadorTexto.setText(this._textoContadorProdutos());
    }

    // ── Contador visual — beneficios ──────────────────────────────────────────

    _criarContadorBeneficios() {
        const W = this.scale.width;
        const H = this.scale.height;

        if (this._contadorBeneficioTexto) this._contadorBeneficioTexto.destroy();

        this._contadorBeneficioTexto = this.add.text(W / 2, H * 0.62, this._textoContadorBeneficios(), {
            fontFamily:    '"Courier New", monospace',
            fontSize:      '14px',
            color:         '#ccaa44',
            letterSpacing: 2,
        }).setOrigin(0.5).setDepth(50);
    }

    _textoContadorBeneficios() {
        return `Benefícios apresentados: ${this._beneficiosSelecionados.length} / ${BENEFICIOS_NECESSARIOS}`;
    }

    _atualizarContadorBeneficios() {
        if (this._contadorBeneficioTexto) this._contadorBeneficioTexto.setText(this._textoContadorBeneficios());
    }

    // ── Modal de detalhes ─────────────────────────────────────────────────────

    _mostrarDetalheCarta(carta) {
        if (!this.negociacaoAtiva) return;
        if (this.cartaEmDetalhes) return;

        const fase = this.clienteConfig.fases[this.faseAtual];

        // Abordagem e sondagem: modal padrao da classe pai (botao SELECIONAR)
        if (fase !== 'demonstracao' && fase !== 'beneficios') {
            super._mostrarDetalheCarta(carta);
            return;
        }

        // Demonstracao: guard de duplicata
        if (fase === 'demonstracao') {
            if (this._produtosSelecionados.find(c => c.key === carta.key)) {
                this._mostrarDialogo('Você já apresentou este produto!');
                return;
            }
            const restantes = PRODUTOS_NECESSARIOS - this._produtosSelecionados.length;
            this._abrirModalApresentar(carta, restantes, () => this._apresentarProduto(carta));
            return;
        }

        // Beneficios: guard de duplicata
        if (fase === 'beneficios') {
            if (this._beneficiosSelecionados.find(c => c.key === carta.key)) {
                this._mostrarDialogo('Você já apresentou este benefício!');
                return;
            }
            const restantes = BENEFICIOS_NECESSARIOS - this._beneficiosSelecionados.length;
            this._abrirModalApresentar(carta, restantes, () => this._selecionarBeneficio(carta));
        }
    }

    // Modal reutilizavel para demonstracao e beneficios
    _abrirModalApresentar(carta, restantes, aoConfirmar) {
        this.cartaEmDetalhes = carta;

        const W = this.scale.width;
        const H = this.scale.height;
        const { LAYERS } = CenaNegociacao;

        const overlay = this.add
            .rectangle(0, 0, W, H, 0x000000, 0.7)
            .setOrigin(0, 0).setDepth(LAYERS.OVERLAY).setInteractive();

        const cartaZoom = this._criarFundoCartaZoom(W / 2, H / 2, carta.key);
        cartaZoom.setDepth(LAYERS.MODAL);

        const labelBotao = restantes === 1
            ? 'APRESENTAR (último!)'
            : `APRESENTAR (faltam ${restantes})`;

        const { btn: btnVoltar,     texto: textoVoltar     } = this._criarBotao(40, 40, 100, 50, 'VOLTAR',   0x1a3a5a, 0xcc4444, '#ff6666');
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
            aoConfirmar();
        });
    }

    // ── Logica de apresentacao de produto (demonstracao) ──────────────────────

    _apresentarProduto(carta) {
        this._produtosSelecionados.push(carta);
        this._atualizarContadorProdutos();

        const errado = this._produtoEstaErrado(carta.key);
        const pontos = this._getPontuacaoCarta(carta.key);

        if (errado) {
            this._alterarSatisfacao(-CenaNegociacao.PERDA_SATISFACAO);
            this._mostrarDialogo('Isso não resolve meu problema com a concorrência. Você prestou atenção no que eu disse?');
        } else {
            this._alterarSatisfacao(CenaNegociacao.GANHO_SATISFACAO + pontos);

            const faltam = PRODUTOS_NECESSARIOS - this._produtosSelecionados.length;
            if (faltam > 0) {
                const msg = this._dorConcorrenciaRevelada() && carta.key === 'CVBA'
                    ? `Essa proposta de valor é exatamente o que preciso para me diferenciar! Me mostra mais ${faltam}.`
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

    // ── Logica de selecao de beneficio ────────────────────────────────────────

    _selecionarBeneficio(carta) {
        if (!this.negociacaoAtiva) return;

        const errado = this._beneficioEstaErrado(carta.key);
        const pontos = this._getPontuacaoCarta(carta.key);

        if (errado) {
            // Penaliza, descarta a carta da mao, mas NAO conta no progresso
            this._alterarSatisfacao(-CenaNegociacao.PERDA_SATISFACAO);
            this._mostrarDialogo(this._falaErroFase('beneficios'));

            if (carta._objetos?.bg) carta._objetos.bg.destroy();
            this.cartasNaMao = this.cartasNaMao.filter(c => c !== carta);

            this.negociacaoAtiva = false;
            this.time.delayedCall(2000, () => {
                if (this.satisfacao <= 0) {
                    this._perderNegociacao();
                } else {
                    this.negociacaoAtiva = true;
                }
            });
            return;
        }

        // Beneficio correto: conta no progresso e remove da mao
        this._beneficiosSelecionados.push(carta);
        this._atualizarContadorBeneficios();
        this._alterarSatisfacao(CenaNegociacao.GANHO_SATISFACAO + pontos);

        if (carta._objetos?.bg) carta._objetos.bg.destroy();
        this.cartasNaMao = this.cartasNaMao.filter(c => c !== carta);

        const faltam = BENEFICIOS_NECESSARIOS - this._beneficiosSelecionados.length;

        if (faltam > 0) {
            const msg = this._dorConcorrenciaRevelada()
                ? `Ótimo! Esse benefício ataca diretamente o problema de preço. Ainda falta ${faltam} benefício.`
                : `Benefício apresentado! Ainda falta ${faltam} benefício.`;
            this._mostrarDialogo(msg);
            return;
        }

        // Ambos os beneficios corretos foram apresentados — avanca
        this.negociacaoAtiva = false;

        if (this.satisfacao <= 0) {
            this._perderNegociacao();
            return;
        }

        this._mostrarDialogo(this._falaAcertoFase('beneficios'));
        this.time.delayedCall(4000, () => {
            this.negociacaoAtiva = true;
            this._avancarOuVencer();
        });
    }

    // ── Retorno de cena ───────────────────────────────────────────────────────

    _cenaDeRetorno() {
        return 'PraiaDosProveitos';
    }
}