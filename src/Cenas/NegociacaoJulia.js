import CenaNegociacao from '../Classes/CenaNegociacao.js';
 
// ─────────────────────────────────────────────────────────────────────────────
// NegociacaoJulia.js — Cliente da Praia dos Proveitos
// ─────────────────────────────────────────────────────────────────────────────

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

const PONTUACAO_PRODUTO_TAXA = {
    CieloFlash:       30,
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

const PRODUTOS_NECESSARIOS   = 3;
const BENEFICIOS_NECESSARIOS = 3;

const BENEFICIOS = ['taxa', 'prazo', 'suporte'];

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

        this.aspectosCliente = {
            pessoas: 'alto',
            lucro:   'baixo',
            estoque: 'alto',
        };

        this._produtosSelecionados = [];
        this._beneficiosRevelados  = new Set();
        this._iconesBeneficios     = {};
    }

    // ── Preload ───────────────────────────────────────────────────────────────
    // Todos os assets ja carregados no Preloader global.

    preload() {
        super.preload();

        this.load.image('julia_fundo',      'assets/NPC/Julia/casa_julia_negociacao.png');
        this.load.image('julia_satisfeito', 'assets/NPC/JULIA/CHEFE_FELIZ.png');
        this.load.image('julia_neutro',     'assets/NPC/JULIA/CHEFE_NEUTRA.png');
        this.load.image('julia_bravo',      'assets/NPC/JULIA/CHEFE_IRRITADA.png');

        BENEFICIOS.forEach(b => {
            this.load.image(`beneficio_${b}_off`, `assets/Icones/Beneficios/beneficio_${b}_off.png`);
            this.load.image(`beneficio_${b}_on`,  `assets/Icones/Beneficios/beneficio_${b}_on.png`);
        });

        Insignia.preload(this);
    }

    // ── Create ────────────────────────────────────────────────────────────────

    _aoVencer() {}

        const W = this.scale.width;
        const H = this.scale.height;

        const barraW = 300;
        const barraX = W - barraW / 2 - 40;
        const barraY = H * 0.08;

        this._criarIconesBeneficios(barraX, barraW, barraY);
    }

    // ── Ícones de benefícios ──────────────────────────────────────────────────

    _criarIconesBeneficios(barraX, barraW, barraY) {
        const iconeH  = 28;
        const largura = iconeH * 2;
        const espaco  = 6;
        const totalW  = BENEFICIOS.length * largura + (BENEFICIOS.length - 1) * espaco;
        const startX  = barraX - totalW / 2 + largura / 2;
        const y       = barraY + 80;
        const pad     = 8;

        this.add.rectangle(barraX, y, totalW + pad * 2, iconeH + pad * 2, 0x222222, 0.85)
            .setStrokeStyle(1, 0x555555)
            .setDepth(49);

        this._iconesBeneficios = {};

        BENEFICIOS.forEach((beneficio, i) => {
            const x        = startX + i * (largura + espaco);
            const chaveOff = `beneficio_${beneficio}_off`;
            const chaveOn  = `beneficio_${beneficio}_on`;

            const icone = this.textures.exists(chaveOff)
                ? this.add.image(x, y, chaveOff).setDisplaySize(largura, iconeH).setDepth(50)
                : this.add.rectangle(x, y, largura, iconeH, 0x333333).setStrokeStyle(1, 0x555555).setDepth(50);

            this._iconesBeneficios[beneficio] = { obj: icone, chaveOff, chaveOn };
        });

        this._setIconesBeneficiosVisiveis(false);
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

    _dorTaxaRevelada() {
        return this._aspectosRevelados.has('lucro');
    }

    _produtoEstaErrado(key) {
        if (!this._dorConcorrenciaRevelada()) return false;
        return key !== 'CVBA';
    }

    // ── Controle de fases ─────────────────────────────────────────────────────
    //
    // CORREÇÃO PRINCIPAL:
    //
    // O problema original estava aqui. A Julia sobrescrevia _iniciarFase()
    // completamente e tentava gerenciar abordagem/sondagem manualmente,
    // pulando o fluxo do super — que é justamente o que faz PIFE, CPC,
    // aspectos e indicadores funcionarem corretamente (como no Pedro).
    //
    // A correção segue o padrão da Thaina:
    //   - Para 'abordagem' e 'sondagem': chama super._iniciarFase() diretamente
    //     e deixa a classe pai cuidar de tudo.
    //   - Para 'demonstracao': chama super._iniciarFase() primeiro (para
    //     diálogo e indicadores), depois injeta a lógica extra da fase.
    //   - Para 'beneficio': gerencia manualmente (pois não existe no Pedro/Thaina).

    _iniciarFase() {
        this._produtosSelecionados = [];
        this._contadorTexto        = null;

        const fase = this.clienteConfig.fases[this.faseAtual];

        if (fase === 'demonstracao') {
            // Igual à Thaina: deixa o super iniciar normalmente (mostra diálogo,
            // atualiza indicadores, configura PIFE/aspectos visíveis), depois
            // injeta a distribuição de produtos e o contador.
            super._iniciarFase();
            this._setIconesBeneficiosVisiveis(false);
            this._distribuirCartasDemonstracao();
            this._criarContadorProdutos();

        } else if (fase === 'beneficio') {
            // Fase exclusiva da Julia — gerencia manualmente.
            this.acertosNaFase        = 0;
            this._beneficiosRevelados = new Set();
            this._atualizarIndicadoresFase();
            this._mostrarDialogo(this._falaInicioFase(fase));
            this._limparCartas();
            this._setPIFEVisivel(false);
            this._setAspectosVisiveis(false);
            this._setIconesBeneficiosVisiveis(true);
            this._distribuirCartasBeneficio();

        } else {
            // 'abordagem' e 'sondagem': delega totalmente ao super, igual ao Pedro.
            // O super cuida de PIFE, CPC, aspectos e todos os indicadores visuais.
            this._setIconesBeneficiosVisiveis(false);
            super._iniciarFase();
        }
    }

    // ── _mostrarDetalheCarta ──────────────────────────────────────────────────
    //
    // CORREÇÃO SECUNDÁRIA:
    //
    // Para 'abordagem' e 'sondagem', delegamos ao super._mostrarDetalheCarta()
    // sem intervenção — ele já sabe resolver PIFE/CPC e aspectos corretamente.
    //
    // Para 'demonstracao' e 'beneficio', usamos a lógica local da Julia,
    // igual ao que a Thaina faz para a demonstração dela.

    // ── Deck de cartas por fase ───────────────────────────────────────────────

        const fase = this.clienteConfig.fases[this.faseAtual];

        if (fase === 'abordagem' || fase === 'sondagem') {
            // Delega ao super — comportamento idêntico ao Pedro.
            super._mostrarDetalheCarta(carta);
            return;
        }

        if (fase === 'demonstracao') {
            if (this._produtosSelecionados.find(c => c.key === carta.key)) {
                this._mostrarDialogo('Você já apresentou este produto!');
                return;
            }
            this._abrirModalApresentar(carta, () => this._apresentarProduto(carta));
            return;
        }

        if (fase === 'beneficio') {
            if (this._beneficiosRevelados.has(carta.beneficio)) {
                this._mostrarDialogo('Esse benefício já foi apresentado!');
                return;
            }
            this._abrirModalApresentar(carta, () => this._resolverBeneficio(carta));
            return;
        }

        // Fallback para fases não mapeadas
        super._mostrarDetalheCarta(carta);
    }

      // ── Cartas da abordagem ───────────────────────────────────────────────────
        //
        // COMO ADICIONAR UMA CARTA NOVA:
        //
        //   Copie um dos blocos abaixo e ajuste os campos:
        //
        //   new CartaAbordagem({
        //       key:          'NomeDaCartaNoAsset',  // arquivo em assets/cartas/
        //       letra:        'P',                   // 'P', 'I', 'F', 'E' ou 'CPC'
        //       correta:      true,                  // false = carta errada (perde satisfação)
        //       dialogoAcerto: 'Fala do Pedro ao acertar esta carta específica',
        //       dialogoErro:   'Fala do Pedro ao errar esta carta específica',
        //   }),
        //
        //   Regras:
        //   - Pode ter várias cartas da mesma letra (P, I, F ou E)
        //   - Só pode haver UMA carta com letra: 'CPC', e ela deve ter correta: true
        //   - A carta CPC só fica disponível após P, I, F e E estarem todos preenchidos
        //   - Cartas com correta: false sempre tiram satisfação ao serem jogadas,
        //     independente da letra
        // ─────────────────────────────────────────────────────────────────────────
    
        _getCartasAbordagem() {
            return [
                // ── P: Propósito ──
                new CartaAbordagem({
                    key:           'DiretoAoPonto',
                    letra:         'P',
                    correta:       true,
                    dialogoAcerto: 'Claro! Sou o Pedro, dono do estabelecimento. Me conta mais.',
                    dialogoErro:   'Não entendi o que você veio fazer aqui.',
                }),
    
                // ── I: Identificação ──
                new CartaAbordagem({
                    key:           'GanchoSocial',
                    letra:         'I',
                    correta:       true,
                    dialogoAcerto: 'Ah, conheço sim! Boa referência.',
                    dialogoErro:   'Isso não tem nada a ver com o meu negócio.',
                }),
    
                // ── F: Foco ──
                new CartaAbordagem({
                    key:           'AntiPitch',
                    letra:         'F',
                    correta:       true,
                    dialogoAcerto: 'Interessante, você não está aqui só pra vender. Pode continuar.',
                    dialogoErro:   'Parece que você só quer me vender algo.',
                }),
    
                // ── E: Empatia ──
                new CartaAbordagem({
                    key:           'ComparacaoInteligente',
                    letra:         'E',
                    correta:       true,
                    dialogoAcerto: 'Faz sentido. Você entende a minha situação.',
                    dialogoErro:   'Isso não se aplica ao meu caso.',
                }),
    
                // ── CPC: Contato com Pessoa Certa ──
                // Só fica disponível após P, I, F e E estarem preenchidos
                new CartaAbordagem({
                    key:           'CartaCPC',
                    letra:         'CPC',
                    correta:       true,
                    dialogoAcerto: 'Ótimo! Você falou com a pessoa certa. Vamos continuar.',
                    dialogoErro:   '', // CPC correto não tem erro
                }),
            ];
        }
    
        // ── Cartas da sondagem ────────────────────────────────────────────────────
        //
        // COMO ADICIONAR UMA CARTA NOVA:
        //
        //   new CartaSondagem({
        //       key:           'NomeDaCartaNoAsset',  // arquivo em assets/cartas/
        //       aspecto:       'lucro',               // 'pessoas', 'lucro' ou 'estoque'
        //       correta:       true,                  // false = carta errada (perde satisfação)
        //       dialogoAcerto: 'Fala do Pedro revelando o aspecto',
        //       dialogoErro:   'Fala do Pedro ao errar',
        //   }),
        //
        //   Regras:
        //   - Pode ter várias cartas do mesmo aspecto (corretas e erradas)
        //   - Uma carta errada não revela o ícone e perde satisfação
        //   - Os três aspectos precisam ser revelados para avançar de fase
        // ─────────────────────────────────────────────────────────────────────────
    
        _getCartasSondagem() {
            return [
                // ── Pessoas ──
                new CartaSondagem({
                    key:           'PerguntaDeImpacto',
                    aspecto:       'pessoas',
                    correta:       true,
                    dialogoAcerto: 'Atendo poucas pessoas por dia, mas são clientes fiéis.',
                    dialogoErro:   'Isso não me ajuda a entender o meu fluxo de clientes.',
                }),
    
                // ── Lucro ──
                new CartaSondagem({
                    key:           'GanchoDaDor',
                    aspecto:       'lucro',
                    correta:       true,
                    dialogoAcerto: 'O negócio vai bem, tenho uma margem alta nos produtos.',
                    dialogoErro:   'Essa pergunta não faz sentido pra mim agora.',
                }),
    
                // ── Estoque ──
                new CartaSondagem({
                    key:           'SondagemDeFluxo',
                    aspecto:       'estoque',
                    correta:       true,
                    dialogoAcerto: 'Meu estoque gira pouco, trabalho com produtos especiais.',
                    dialogoErro:   'Não entendo o que você quer saber com isso.',
                }),
    
                // ── Erradas (aspectos variados) ──
                new CartaSondagem({
                    key:           'LoboCurioso',
                    aspecto:       'pessoas',
                    correta:       false,
                    dialogoAcerto: '',
                    dialogoErro:   'Isso não é relevante pra minha operação.',
                }),
    
                new CartaSondagem({
                    key:           'AutoridadeImplicita',
                    aspecto:       'lucro',
                    correta:       false,
                    dialogoAcerto: '',
                    dialogoErro:   'Não gosto desse tipo de abordagem.',
                }),
            ];
        }
    
        _falaInicioFase(fase) {
            const falas = {
                abordagem: 'Olá, boa tarde! Em que posso ajudar?',
                sondagem:  'Tudo bem, me conta mais. O que você tem em mente?',
            };
            return falas[fase] ?? 'O que você tem a me apresentar?';
        }
    // ── Fase de demonstração ──────────────────────────────────────────────────

    _distribuirCartasDemonstracao() {
        const todasCartas = [
            'Antecipacao', 'CrediarioDigital', 'CVBA', 'CieloFlash',
            'CieloFlash2', 'FlashRecarga', 'CieloLioOn', 'LioOnApps',
            'LioOnGestao', 'MoedaEstrangeira', 'CieloTap', 'CieloZip',
        ];
        const embaralhadas = Phaser.Utils.Array.Shuffle([...todasCartas]);
        const cartas = embaralhadas.slice(0, 4).map(key => ({ key, fase: 'demonstracao' }));
        this._distribuirCartas(cartas);
    }

    // Modal reutilizável para demonstração e benefícios — igual à Thaina
    _abrirModalApresentar(carta, aoSelecionar) {
        this.cartaEmDetalhes = carta;

        const W = this.scale.width;
        const H = this.scale.height;
        const { LAYERS } = CenaNegociacao;

        const fase      = this.clienteConfig.fases[this.faseAtual];
        const total     = fase === 'beneficio' ? BENEFICIOS_NECESSARIOS : PRODUTOS_NECESSARIOS;
        const feitos    = fase === 'beneficio' ? this._beneficiosRevelados.size : this._produtosSelecionados.length;
        const restantes = total - feitos;
        const label     = restantes === 1 ? 'APRESENTAR (último!)' : `APRESENTAR (faltam ${restantes})`;

        const overlay   = this.add.rectangle(0, 0, W, H, 0x000000, 0.7).setOrigin(0, 0).setDepth(LAYERS.OVERLAY).setInteractive();
        const cartaZoom = this._criarFundoCartaZoom(W / 2, H / 2, carta.key);
        cartaZoom.setDepth(LAYERS.MODAL);

        const { btn: btnVoltar,     texto: textoVoltar     } = this._criarBotao(40, 40, 100, 50, 'VOLTAR',  0x1a3a5a, 0xcc4444, '#ff6666');
        const { btn: btnSelecionar, texto: textoSelecionar } = this._criarBotao(W / 2, H / 2 + 320, 220, 50, label, 0x1a4a2a, 0x22cc66, '#22cc66');

        btnVoltar.setDepth(LAYERS.MODAL);     textoVoltar.setDepth(LAYERS.MODAL_BTN);
        btnSelecionar.setDepth(LAYERS.MODAL); textoSelecionar.setDepth(LAYERS.MODAL_BTN);

        const fechar = () => {
            [overlay, cartaZoom, btnVoltar, textoVoltar, btnSelecionar, textoSelecionar].forEach(o => o.destroy());
            this.cartaEmDetalhes = null;
        };

        const exigidas     = this.clienteConfig.cartasExigidas[fase] ?? [];
        const disponiveis  = todasCartas[fase] ?? [];
        const embaralhadas = Phaser.Utils.Array.Shuffle([...disponiveis]);

        btnSelecionar.on('pointerover', () => btnSelecionar.setFillStyle(0x2a6a3a));
        btnSelecionar.on('pointerout',  () => btnSelecionar.setFillStyle(0x1a4a2a));
        btnSelecionar.on('pointerdown', () => { fechar(); aoSelecionar(); });
    }

    _apresentarProduto(carta) {
        this._produtosSelecionados.push(carta);
        this._atualizarContadorProdutos();

        const errado = this._produtoEstaErrado(carta.key);
        const pontos = this._getPontuacaoCarta(carta.key);

        if (errado) {
            this._alterarSatisfacao(-CenaNegociacao.PERDA_SATISFACAO);
            this._mostrarDialogo('Isso não resolve minha dor com as taxas. Você prestou atenção?');
        } else {
            this._alterarSatisfacao(CenaNegociacao.GANHO_SATISFACAO + pontos);
            const faltam = PRODUTOS_NECESSARIOS - this._produtosSelecionados.length;
            if (faltam > 0) {
                const msg = this._dorTaxaRevelada() && carta.key === 'CieloFlash'
                    ? `Perfeito! Taxa reduzida é exatamente o que eu precisava. Me mostra mais ${faltam}.`
                    : `Produto apresentado! Continue mostrando mais ${faltam}.`;
                this._mostrarDialogo(msg);
            }
        }

        if (this._produtosSelecionados.length < PRODUTOS_NECESSARIOS) return;

        this.negociacaoAtiva = false;
        this._mostrarDialogo('Tá bom, me convenceu com os produtos. Mas quero saber das condições.');
        this.time.delayedCall(4000, () => {
            if (this.satisfacao <= 0) { this._perderNegociacao(); return; }
            this.negociacaoAtiva = true;
            this._avancarOuVencer();
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

            this._alterarSatisfacao(CenaNegociacao.GANHO_SATISFACAO);
            this._removerCartaVisual(carta);

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
                this._mostrarDialogo(carta.dialogoAcerto);
                this.time.delayedCall(4000, () => {
                    if (this.satisfacao <= 0) { this._perderNegociacao(); return; }
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

    _getCartasBeneficio() {
        return [
            new CartaBeneficio({
                key:           'Ajuste',
                beneficio:     'taxa',
                correta:       true,
                dialogoAcerto: 'Ótimo! Uma taxa menor faz toda a diferença no meu faturamento.',
                dialogoErro:   'Isso não resolve o problema das taxas.',
            }),
            new CartaBeneficio({
                key:           'Antecipacao',
                beneficio:     'prazo',
                correta:       true,
                dialogoAcerto: 'Receber mais rápido me ajuda muito no fluxo de caixa da temporada!',
                dialogoErro:   'Prazo não é minha principal preocupação agora.',
            }),
            new CartaBeneficio({
                key:           'Validacao',
                beneficio:     'suporte',
                correta:       true,
                dialogoAcerto: 'Suporte na praia? Perfeito! Já precisei muito disso e nunca tinha.',
                dialogoErro:   'Isso não me convence sobre o suporte.',
            }),
            new CartaBeneficio({
                key:           'Comparativo',
                beneficio:     'taxa',
                correta:       false,
                dialogoAcerto: '',
                dialogoErro:   'Comparar com concorrente não me ajuda a decidir.',
            }),
            new CartaBeneficio({
                key:           'Recuo',
                beneficio:     'prazo',
                correta:       false,
                dialogoAcerto: '',
                dialogoErro:   'Parece que você está recuando na proposta. Não gostei.',
            }),
        ];
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