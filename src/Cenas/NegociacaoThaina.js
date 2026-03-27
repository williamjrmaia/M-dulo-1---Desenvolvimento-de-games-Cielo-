import CenaNegociacao from '../Classes/CenaNegociacao.js';
import Insignia       from '../Classes/Insignias.js';

// ─────────────────────────────────────────────────────────────────────────────
// NegociacaoThaina.js — Cliente da Vila do Varejo
//
// CONTEXTO: Thaina é dona de um estabelecimento com problemas de falha
// tecnica / travamento na maquininha atual.
//
// FASES: abordagem → sondagem → demonstracao
//   - Abordagem:    o jogador escolhe 1 carta de um deck de 12
//   - Sondagem:     o jogador escolhe 2 cartas de um deck de 12
//   - Demonstracao: o jogador apresenta 3 produtos de um deck de 12
//
// COERENCIA NARRATIVA:
//   As duas cartas de sondagem sao avaliadas em conjunto. Se o jogador
//   usou GanchoDaDor OU PontoDeDorTecnico em qualquer uma das duas
//   jogadas, a dor de falha tecnica de Thaina foi revelada.
//
//   Com a dor revelada → CieloFlash2 e o produto correto (multiconexao +
//   IA anti-falhas) → bonus maximo; qualquer outro produto penaliza a
//   satisfacao.
//
//   Sem a dor revelada → todos os produtos dao pontuacao padrao, sem
//   bonus nem penalidade extra por adequacao.
//
// INSIGNIA: concede InsigniaProduto1 ao vencer (insignia de produto),
//   seguindo o mesmo padrao de NegociacaoPedro, que concede insignia de mapa.
// ─────────────────────────────────────────────────────────────────────────────

// Pontuacao base por produto quando a dor NAO foi especificada na sondagem.
// Todos os produtos valem igual, pois Thaina nao revelou sua necessidade real.
const PONTUACAO_PRODUTO_PADRAO = {
    Antecipacao:    10,
    CrediarioDigital: 10,
    CVBA:           10,
    CieloFlash:     10,
    CieloFlash2:    10,
    FlashRecarga:   10,
    CieloLioOn:     10,
    LioOnApps:      10,
    LioOnGestao:    10,
    MoedaEstrangeira: 10,
    CieloTap:       10,
    CieloZip:       10,
};

// Pontuacao quando a dor de FALHA TECNICA foi revelada na sondagem.
// CieloFlash2 (multiconexao + IA anti-falhas) resolve diretamente a dor
// descrita por Thaina; os demais nao resolvem e penalizam a satisfacao.
const PONTUACAO_PRODUTO_FALHA = {
    CieloFlash2:    30, // produto correto — multiconexao + IA previne travamentos
    Antecipacao:     0, // nao resolve falha tecnica
    CrediarioDigital: 0,
    CVBA:            0,
    CieloFlash:      0,
    FlashRecarga:    0,
    CieloLioOn:      0,
    LioOnApps:       0,
    LioOnGestao:     0,
    MoedaEstrangeira: 0,
    CieloTap:        0,
    CieloZip:        0,
};

// Cartas de sondagem que revelam a dor de falha tecnica de Thaina.
// O jogador pode chegar a essa informacao por dois caminhos diferentes:
//   GanchoDaDor      → pergunta direta sobre dificuldades com gestao/relatorios
//   PontoDeDorTecnico → pergunta especifica sobre travamento na maquininha
const CARTAS_DOR_FALHA = new Set(['GanchoDaDor', 'PontoDeDorTecnico']);

// Quantas cartas de produto o jogador precisa apresentar na demonstracao
const PRODUTOS_NECESSARIOS = 3;

// Quantas cartas sao exibidas na mao do jogador por fase.
// CORRECAO: abordagem exibia 1 carta (sem escolha real) e sondagem exibia 2
// (mas a classe pai exigia 3 acertos para avancar, causando travamento).
// Agora abordagem mostra 4 opcoes e sondagem mostra 6 (paginadas em 2x3).
// A logica de "1 acerto avanca a abordagem" e tratada em _resolverCarta abaixo.
const CARTAS_NA_MAO = {
    abordagem:    4, // exibe 4 opcoes; jogador escolhe 1 e a fase avanca
    sondagem:     6, // exibe 6 opcoes em 2 paginas de 3; jogador escolhe 2
    demonstracao: 4, // exibe 4 produtos; jogador apresenta 3
};

// Quantas cartas corretas o jogador precisa jogar para avancar cada fase.
// A abordagem avanca com 1 acerto; a sondagem avanca com 2.
// A demonstracao tem logica propria em _apresentarProduto, este valor nao e usado.
const ACERTOS_POR_FASE = {
    abordagem: 1,
    sondagem:  2,
};

export default class NegociacaoThaina extends CenaNegociacao {
    constructor() {
        super('NegociacaoThaina', {
            nomeCliente:       'thaina',
            satisfacaoInicial: 0,

            // Apenas 3 fases — negociacao e fechamento nao existem nesta cena
            fases: ['abordagem', 'sondagem', 'demonstracao'],

            // Define quais cartas sao consideradas "corretas" em cada fase.
            cartasExigidas: {
                abordagem:    ['DiretoAoPonto', 'GanchoSocial', 'AntiPitch', 'Proatividade',
                               'CuriosidadeDespertada', 'ReferenciaLocal', 'GatilhoDeEscassez',
                               'ParceriaEstrategica'],
                sondagem:     ['PerguntaDeImpacto', 'GanchoDaDor', 'ChaveDeExclusividade',
                               'Estrategia', 'SondagemDeFluxo', 'SondagemDePrazo',
                               'PontoDeDorTecnico'],
                demonstracao: ['CieloFlash2', 'CieloFlash', 'CieloLioOn', 'LioOnGestao',
                               'CieloTap', 'CieloZip', 'CVBA', 'Antecipacao'],
            },

            // cartasPorFase controla quantas cartas sao exibidas na mao.
            cartasPorFase: CARTAS_NA_MAO,
        });

        // Controle da selecao multipla na fase de demonstracao
        this._produtosSelecionados = [];

        // Guarda as chaves das cartas de sondagem escolhidas pelo jogador.
        // Como sao 2 rodadas de sondagem, acumula em um Set para facilitar
        // a verificacao de dor revelada.
        this._cartasSondagemUsadas = new Set();
    }

    // ── Preload 
    // Os assets das cartas novas (abordagem, sondagem e produtos completos)
    // sao carregados no Preloader global. Aqui so carregamos o fundo e os
    // sprites especificos da cena de Thaina, que nao sao usados em outro lugar.

    preload() {
        super.preload();

        this.load.image('thaina_fundo',      'assets/NPC/Thaina/casa_thaina_negociacao.png');
        this.load.image('thaina_satisfeito', 'assets/NPC/Thaina/thaina_feliz.png');
        this.load.image('thaina_neutro',     'assets/NPC/Thaina/thaina_neutra.png');
        this.load.image('thaina_bravo',      'assets/NPC/Thaina/thaina_raiva.png');

        Insignia.preload(this);
    }

    // ── Insignia 

    _aoVencer() {
        const insignia = new Insignia(this, 'produto1');
        insignia.conceder();
    }

    _chaveVitoria() {
        return 'varejo_vencido';
    }

    // ── Helper: dor revelada? 

    _dorFalhaRevelada() {
        for (const carta of this._cartasSondagemUsadas) {
            if (CARTAS_DOR_FALHA.has(carta)) return true;
        }
        return false;
    }

    // ── Pontuacao dinamica — depende das cartas usadas na sondagem 

    _getPontuacaoCarta(key) {
        if (this._dorFalhaRevelada()) {
            return PONTUACAO_PRODUTO_FALHA[key] ?? 0;
        }
        return PONTUACAO_PRODUTO_PADRAO[key] ?? 0;
    }

    _produtoEstaErrado(key) {
        if (!this._dorFalhaRevelada()) return false;
        return key !== 'CieloFlash2';
    }

    // ── Falas 

    _falaInicioFase(fase) {
        const falas = {
            abordagem:    'Oi, to ocupada aqui, mas pode falar.',
            sondagem:     'Ta bom, me conta. O que voce tem pra me oferecer?',
            demonstracao: `Minha maquininha trava toda hora. Me mostre ${PRODUTOS_NECESSARIOS} opcoes que possam resolver isso.`,
        };
        return falas[fase] ?? 'O que voce tem a me apresentar?';
    }

    _falaAcertoFase(fase) {
        const falas = {
            abordagem:    'Pode falar sim! Sou a Thaina, dona daqui.',
            sondagem:     'E exatamente isso! Minha maquininha trava na hora do pico e perco venda.',
            demonstracao: 'Gostei! Pelo menos um desses resolve meu problema.',
        };
        return falas[fase] ?? 'Pode continuar.';
    }

    _falaErroFase(fase) {
        const falas = {
            abordagem:    'Nao tenho interesse, obrigada.',
            sondagem:     'Isso nao tem nada a ver com o meu problema.',
            demonstracao: 'Nenhum desses resolve o que eu preciso.',
        };
        return falas[fase] ?? 'Nao entendi sua estrategia.';
    }

    // ── Deck de cartas por fase 

    _getCartasDaFase(fase, quantidade) {
        const todasCartas = {
            abordagem: [
                'DiretoAoPonto',        // positiva
                'DesarmeElegante',      // negativa
                'ComparacaoInteligente',// negativa
                'GanchoSocial',         // positiva
                'Proatividade',         // positiva
                'AntiPitch',            // positiva
                'Problematica',         // negativa
                'CuriosidadeDespertada',// positiva
                'ReferenciaLocal',      // positiva
                'QuebradePadrao',       // negativa
                'GatilhoDeEscassez',    // positiva
                'ParceriaEstrategica',  // positiva
            ],

            sondagem: [
                'LoboCurioso',          // negativa
                'AutoridadeImplicita',  // negativa
                'ChaveDeExclusividade', // positiva
                'Cliffhanger',          // negativa
                'PerguntaDeImpacto',    // positiva
                'GanchoDaDor',          // positiva — revela dor de falha tecnica
                'Estrategia',           // positiva
                'EgoCorporativo',       // negativa
                'SondagemDeFluxo',      // positiva
                'PontoDeDorTecnico',    // revela dor de falha tecnica
                'SondagemDePrazo',      // positiva
                'DiagnosticoDeParceria',// negativa
            ],

            demonstracao: [
                'Antecipacao',
                'CrediarioDigital',
                'CVBA',
                'CieloFlash',
                'CieloFlash2',          // correto para Thaina
                'FlashRecarga',
                'CieloLioOn',
                'LioOnApps',
                'LioOnGestao',
                'MoedaEstrangeira',
                'CieloTap',
                'CieloZip',
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


    // ACERTOS_POR_FASE: abordagem avanca com 1 acerto, sondagem com 2.
    // A demonstracao tem logica propria em _apresentarProduto e nao passa por aqui.

    _resolverCarta(carta) {
        if (!this.negociacaoAtiva) return;

        const fase     = this.clienteConfig.fases[this.faseAtual];
        const exigidas = this.clienteConfig.cartasExigidas[fase] ?? [];
        const acertou  = exigidas.length === 0 || exigidas.includes(carta.key);

        // Registra cartas usadas na sondagem para verificar dor revelada depois
        if (fase === 'sondagem') {
            this._cartasSondagemUsadas.add(carta.key);
        }

        if (acertou) {
            const pontos = this._getPontuacaoCarta(carta.key);
            this._alterarSatisfacao(CenaNegociacao.GANHO_SATISFACAO + pontos);
            this.acertosNaFase++;

            // Remove a carta visualmente da mao
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

    // ── Inicializacao de fase

    _iniciarFase() {
        this._produtosSelecionados = [];
        this._contadorTexto        = null;
        super._iniciarFase();

        if (this.clienteConfig.fases[this.faseAtual] === 'demonstracao') {
            this._criarContadorProdutos();
        }
    }

    // ── Contador visual de produtos apresentados 

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

    // ── Modal de detalhes da carta na demonstracao 

    _mostrarDetalheCarta(carta) {
        if (!this.negociacaoAtiva) return;
        if (this.cartaEmDetalhes) return;

        const fase = this.clienteConfig.fases[this.faseAtual];

        if (fase !== 'demonstracao') {
            super._mostrarDetalheCarta(carta);
            return;
        }

        if (this._produtosSelecionados.find(c => c.key === carta.key)) {
            this._mostrarDialogo('Voce ja apresentou este produto!');
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
        const labelBotao = restantes === 1 ? 'APRESENTAR (ultimo!)' : `APRESENTAR (faltam ${restantes})`;

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
            this._apresentarProduto(carta);
        });
    }

    // ── Logica de apresentacao de produto 

    _apresentarProduto(carta) {
        this._produtosSelecionados.push(carta);
        this._atualizarContador();

        const errado = this._produtoEstaErrado(carta.key);
        const pontos = this._getPontuacaoCarta(carta.key);

        if (errado) {
            this._alterarSatisfacao(-CenaNegociacao.PERDA_SATISFACAO);
            this._mostrarDialogo('Isso nao resolve o travamento. Voce prestou atencao no que eu disse?');
        } else {
            this._alterarSatisfacao(CenaNegociacao.GANHO_SATISFACAO + pontos);

            const faltam = PRODUTOS_NECESSARIOS - this._produtosSelecionados.length;
            if (faltam > 0) {
                const msg = this._dorFalhaRevelada() && carta.key === 'CieloFlash2'
                    ? `Esse resolve! A IA preve falhas antes de acontecer. Me mostra mais ${faltam}.`
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

    // ── Retorno de cena 

    _cenaDeRetorno() {
        return 'VilaDoVarejo';
    }
}