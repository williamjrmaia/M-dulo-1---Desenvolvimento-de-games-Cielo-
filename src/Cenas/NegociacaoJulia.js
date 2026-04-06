import CenaNegociacao from '../Classes/CenaNegociacao.js';
import CartaAbordagem from '../Classes/FasesNegociacao/CartaAbordagem.js';
import CartaSondagem  from '../Classes/FasesNegociacao/CartaSondagem.js';
import CartaBeneficio from '../Classes/FasesNegociacao/CartaBeneficio.js';
import Insignia       from '../Classes/Insignias.js';

// ─────────────────────────────────────────────────────────────────────────────
// NegociacaoJulia.js — Cliente da Praia dos Proveitos
//
// CONTEXTO: Julia é dona de uma loja de artigos de praia. Atende muito
// movimento na alta temporada, mas sofre com taxas altas e sem suporte
// quando a maquininha apresenta problema na areia.
//
// FASES:
//   abordagem   → PIFE + CPC         (igual ao Pedro e à Thaina)
//   sondagem    → 3 aspectos         (igual ao Pedro e à Thaina)
//   demonstracao → 3 produtos        (igual à Thaina)
//   beneficio   → 3 benefícios       (novo — ícones iguais aos aspectos)
//
// ASPECTOS DA JULIA:
//   pessoas: 'alto'   — loja cheia na temporada, muito volume de vendas
//   lucro:   'baixo'  — taxa alta corrói a margem nos meses de pico
//   estoque: 'alto'   — giro altíssimo de produtos de praia no verão
//
// BENEFÍCIOS:
//   taxa     → redução de taxa / condição especial de MDR
//   prazo    → prazo de recebimento mais rápido (antecipação)
//   suporte  → suporte presencial / assistência técnica em campo
//
// COERÊNCIA NARRATIVA:
//   Se o aspecto 'lucro' foi revelado na sondagem, a dor de taxa foi
//   identificada → CieloFlash (menor taxa do mercado) ganha bônus máximo
//   na demonstração; outros produtos sem foco em taxa penalizam.
// ─────────────────────────────────────────────────────────────────────────────

// ── Pontuação de produtos ─────────────────────────────────────────────────────

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

// Com a dor de taxa revelada, apenas CieloFlash resolve; demais penalizam
const PONTUACAO_PRODUTO_TAXA = {
    CieloFlash:       30,
    Antecipacao:       0,
    CrediarioDigital:  0,
    CVBA:              0,
    CieloFlash2:       0,
    FlashRecarga:      0,
    CieloLioOn:        0,
    LioOnApps:         0,
    LioOnGestao:       0,
    MoedaEstrangeira:  0,
    CieloTap:          0,
    CieloZip:          0,
};

const PRODUTOS_NECESSARIOS  = 3;
const BENEFICIOS_NECESSARIOS = 3; // taxa + prazo + suporte

// Nomes dos três benefícios — usados para criar e controlar os ícones
const BENEFICIOS = ['taxa', 'prazo', 'suporte'];

export default class NegociacaoJulia extends CenaNegociacao {
    constructor() {
        super('NegociacaoJulia', {
            nomeCliente:       'julia',
            satisfacaoInicial: 0,
            fases:             ['abordagem', 'sondagem', 'demonstracao', 'beneficio'],
        });

        // Aspectos reais da Julia — revelados na sondagem
        this.aspectosCliente = {
            pessoas: 'alto',
            lucro:   'baixo',
            estoque: 'alto',
        };

        // Controle interno da fase de demonstração
        this._produtosSelecionados = [];

        // Controle interno da fase de benefícios
        this._beneficiosRevelados = new Set();
        this._iconesBeneficios    = {};
    }

    // ── Preload ───────────────────────────────────────────────────────────────

    preload() {
        super.preload();

        this.load.image('julia_fundo',      'assets/NPC/Julia/casa_julia_negociacao.png');
        this.load.image('julia_satisfeito', 'assets/NPC/Julia/julia_feliz.png');
        this.load.image('julia_neutro',     'assets/NPC/Julia/julia_neutra.png');
        this.load.image('julia_bravo',      'assets/NPC/Julia/julia_raiva.png');

        // Ícones dos benefícios (_off = não revelado, _on = revelado)
        BENEFICIOS.forEach(b => {
            this.load.image(`beneficio_${b}_off`, `assets/Icones/Beneficios/beneficio_${b}_off.png`);
            this.load.image(`beneficio_${b}_on`,  `assets/Icones/Beneficios/beneficio_${b}_on.png`);
        });

        Insignia.preload(this);
    }

    // ── Cria os ícones de benefícios no mesmo estilo dos aspectos ─────────────
    // Chamado dentro do create() herdado, logo após _criarBarraSatisfacao().
    // Sobrescrevemos create() só para injetar os ícones extras.

    create() {
        super.create();

        const W = this.scale.width;
        const H = this.scale.height;

        // Posicionamento: abaixo dos ícones de aspecto, mesma coluna da barra
        const barraW = 300;
        const barraX = W - barraW / 2 - 40;
        const barraY = H * 0.08;

        this._criarIconesBeneficios(barraX, barraW, barraY);
    }

    _criarIconesBeneficios(barraX, barraW, barraY) {
        const iconeH  = 28;
        const largura = iconeH * 2;
        const espaco  = 6;
        const totalW  = BENEFICIOS.length * largura + (BENEFICIOS.length - 1) * espaco;
        const startX  = barraX - totalW / 2 + largura / 2;

        // Fica uma linha abaixo dos ícones de aspectos (que estão em barraY + 43)
        const y = barraY + 80;

        const pad = 8;
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

        // Começa escondido — só aparece na fase de benefícios
        this._setIconesBeneficiosVisiveis(false);
    }

    _setIconesBeneficiosVisiveis(visivel) {
        for (const d of Object.values(this._iconesBeneficios)) d.obj.setVisible(visivel);
    }

    _revelarIconeBeneficio(beneficio) {
        const d = this._iconesBeneficios[beneficio];
        if (!d) return;

        if (this.textures.exists(d.chaveOn) && d.obj.setTexture) d.obj.setTexture(d.chaveOn);
        else if (d.obj.setFillStyle) d.obj.setFillStyle(0x22cc66);

        this.tweens.add({
            targets:  d.obj,
            scaleX:   1.3, scaleY: 1.3,
            duration: 150, yoyo: true,
            ease:     'Back.easeOut',
        });
    }

    // ── Insígnia e vitória ────────────────────────────────────────────────────

    _aoVencer() {
        const insignia = new Insignia(this, 'praia_proveitos');
        insignia.conceder();
    }

    _chaveVitoria() { return 'julia_vencida'; }

    // ── Pontuação dinâmica ────────────────────────────────────────────────────

    _getPontuacaoCarta(key) {
        return this._dorTaxaRevelada()
            ? (PONTUACAO_PRODUTO_TAXA[key]   ?? 0)
            : (PONTUACAO_PRODUTO_PADRAO[key] ?? 0);
    }

    // Dor de taxa revelada quando o aspecto 'lucro' foi sondado
    _dorTaxaRevelada() {
        return this._aspectosRevelados.has('lucro');
    }

    _produtoEstaErrado(key) {
        if (!this._dorTaxaRevelada()) return false;
        return key !== 'CieloFlash';
    }

    // ── Controle de fases ─────────────────────────────────────────────────────

    _iniciarFase() {
        this._produtosSelecionados = [];
        this._contadorTexto        = null;

        const fase = this.clienteConfig.fases[this.faseAtual];

        if (fase === 'demonstracao') {
            // Setup base manual — evita que super distribua cartas genéricas
            this.acertosNaFase = 0;
            this._atualizarIndicadoresFase();
            this._mostrarDialogo(this._falaInicioFase(fase));
            this._limparCartas();
            this._setPIFEVisivel(false);
            this._setAspectosVisiveis(false);
            this._setIconesBeneficiosVisiveis(false);

            this._distribuirCartasDemonstracao();
            this._criarContadorProdutos();

        } else if (fase === 'beneficio') {
            // Setup base manual — inicia a fase de benefícios com ícones próprios
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
            // Abordagem e sondagem — usa o fluxo normal do pai
            this._setIconesBeneficiosVisiveis(false);
            super._iniciarFase();
        }
    }

    // ── Cartas da abordagem (PIFE + CPC) ──────────────────────────────────────

    _getCartasAbordagem() {
        return [
            // ── P: Propósito ──
            new CartaAbordagem({
                key:           'DiretoAoPonto',
                letra:         'P',
                correta:       true,
                dialogoAcerto: 'Pode falar! Sou a Julia, aqui da loja. O que você tem pra mim?',
                dialogoErro:   'Não entendi o que você veio fazer aqui.',
            }),

            // ── I: Identificação ──
            new CartaAbordagem({
                key:           'ReferenciaLocal',
                letra:         'I',
                correta:       true,
                dialogoAcerto: 'Ah, conhece o pessoal da praia? Boa referência!',
                dialogoErro:   'Isso não tem nada a ver com o meu negócio.',
            }),

            // ── F: Foco ──
            new CartaAbordagem({
                key:           'AntiPitch',
                letra:         'F',
                correta:       true,
                dialogoAcerto: 'Gostei, você não chegou só pra empurrar produto. Pode continuar.',
                dialogoErro:   'Parece que você só quer me vender algo.',
            }),

            // ── E: Empatia ──
            new CartaAbordagem({
                key:           'CuriosidadeDespertada',
                letra:         'E',
                correta:       true,
                dialogoAcerto: 'É, dá pra ver que você entende o movimento que é aqui no verão.',
                dialogoErro:   'Isso não se aplica ao meu caso.',
            }),

            // ── Erradas ──
            new CartaAbordagem({
                key:           'GatilhoDeEscassez',
                letra:         'P',
                correta:       false,
                dialogoAcerto: '',
                dialogoErro:   'Não gostei dessa pressão logo de cara.',
            }),

            new CartaAbordagem({
                key:           'Problematica',
                letra:         'I',
                correta:       false,
                dialogoAcerto: '',
                dialogoErro:   'Isso me deixou desconfortável.',
            }),

            // ── CPC ──
            new CartaAbordagem({
                key:           'ParceriaEstrategica',
                letra:         'CPC',
                correta:       true,
                dialogoAcerto: 'Ótimo! Você tá falando com a dona mesmo. Vamos ao que interessa.',
                dialogoErro:   '',
            }),
        ];
    }

    // ── Cartas da sondagem (aspectos) ─────────────────────────────────────────

    _getCartasSondagem() {
        return [
            // ── Pessoas ──
            new CartaSondagem({
                key:           'PerguntaDeImpacto',
                aspecto:       'pessoas',
                correta:       true,
                dialogoAcerto: 'Na temporada é lotado! Chego a fazer centenas de vendas por dia.',
                dialogoErro:   'Não entendi o que você quer saber com isso.',
            }),

            // ── Lucro ──
            new CartaSondagem({
                key:           'GanchoDaDor',
                aspecto:       'lucro',
                correta:       true,
                dialogoAcerto: 'A taxa que pago é absurda! No pico da temporada perco uma grana grossa com isso.',
                dialogoErro:   'Essa pergunta não faz sentido pra mim agora.',
            }),

            // ── Estoque ──
            new CartaSondagem({
                key:           'SondagemDeFluxo',
                aspecto:       'estoque',
                correta:       true,
                dialogoAcerto: 'Meu giro é enorme! Vendo protetor solar, cangas, boia... tudo muito rápido.',
                dialogoErro:   'Não entendo o que você quer saber com isso.',
            }),

            // ── Erradas ──
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

            new CartaSondagem({
                key:           'EgoCorporativo',
                aspecto:       'estoque',
                correta:       false,
                dialogoAcerto: '',
                dialogoErro:   'Você está mais preocupado com você do que comigo.',
            }),
        ];
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

    _mostrarDetalheCarta(carta) {
        if (!this.negociacaoAtiva || this.cartaEmDetalhes) return;

        const fase = this.clienteConfig.fases[this.faseAtual];

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

        super._mostrarDetalheCarta(carta);
    }

    // Modal reutilizável para demonstração e benefícios
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

        btnVoltar.on('pointerover', () => btnVoltar.setFillStyle(0x2a4a6a));
        btnVoltar.on('pointerout',  () => btnVoltar.setFillStyle(0x1a3a5a));
        btnVoltar.on('pointerdown', fechar);

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
        if (this.satisfacao <= 0) { this._perderNegociacao(); return; }

        this._mostrarDialogo('Tá bom, me convenceu com os produtos. Mas quero saber das condições.');
        this.time.delayedCall(4000, () => {
            this.negociacaoAtiva = true;
            this._avancarOuVencer();
        });
    }

    // ── Fase de benefícios ────────────────────────────────────────────────────

    _distribuirCartasBeneficio() {
        const cartas = this._getCartasBeneficio();
        const { CARD_WIDTH, CARD_SPACING, ANIM_FADE_DURATION, ANIM_HOVER_OFFSET } = CenaNegociacao;
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

    _resolverBeneficio(carta) {
        if (!this.negociacaoAtiva) return;

        if (carta.correta) {
            if (!this._beneficiosRevelados.has(carta.beneficio)) {
                this._beneficiosRevelados.add(carta.beneficio);
                this._revelarIconeBeneficio(carta.beneficio);
            }

            this._alterarSatisfacao(CenaNegociacao.GANHO_SATISFACAO);
            this._mostrarDialogo(carta.dialogoAcerto);
            this._removerCartaVisual(carta);

            if (this._beneficiosRevelados.size >= BENEFICIOS_NECESSARIOS) {
                this.negociacaoAtiva = false;
                this.time.delayedCall(4000, () => {
                    this.negociacaoAtiva = true;
                    this._avancarOuVencer();
                });
            } else {
                const faltam = BENEFICIOS_NECESSARIOS - this._beneficiosRevelados.size;
                this._mostrarDialogo(`${carta.dialogoAcerto} (Ainda faltam ${faltam} benefício(s))`);
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

    _getCartasBeneficio() {
        return [
            // ── Taxa ──
            new CartaBeneficio({
                key:           'Ajuste',
                beneficio:     'taxa',
                correta:       true,
                dialogoAcerto: 'Ótimo! Uma taxa menor faz toda a diferença no meu faturamento.',
                dialogoErro:   'Isso não resolve o problema das taxas.',
            }),

            // ── Prazo ──
            new CartaBeneficio({
                key:           'Antecipacao',
                beneficio:     'prazo',
                correta:       true,
                dialogoAcerto: 'Receber mais rápido me ajuda muito no fluxo de caixa da temporada!',
                dialogoErro:   'Prazo não é minha principal preocupação agora.',
            }),

            // ── Suporte ──
            new CartaBeneficio({
                key:           'Validacao',
                beneficio:     'suporte',
                correta:       true,
                dialogoAcerto: 'Suporte na praia? Perfeito! Já precisei muito disso e nunca tinha.',
                dialogoErro:   'Isso não me convence sobre o suporte.',
            }),

            // ── Erradas ──
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

    // ── Contadores visuais ────────────────────────────────────────────────────

    _criarContadorProdutos() {
        const W = this.scale.width;
        const H = this.scale.height;
        if (this._contadorTexto) this._contadorTexto.destroy();
        this._contadorTexto = this.add.text(W / 2, H * 0.62, this._textoContadorProdutos(), {
            fontFamily: '"Courier New", monospace',
            fontSize:   '14px',
            color:      '#ccaa44',
            letterSpacing: 2,
        }).setOrigin(0.5).setDepth(50);
    }

    _textoContadorProdutos() {
        return `Produtos apresentados: ${this._produtosSelecionados.length} / ${PRODUTOS_NECESSARIOS}`;
    }

    _atualizarContadorProdutos() {
        if (this._contadorTexto) this._contadorTexto.setText(this._textoContadorProdutos());
    }

    // ── Falas ─────────────────────────────────────────────────────────────────

    _falaInicioFase(fase) {
        const falas = {
            abordagem:    'Oi! Tô ocupada aqui, mas pode falar.',
            sondagem:     'Me conta mais. O que você tem pra me oferecer?',
            demonstracao: `A taxa que pago tá me matando. Me mostre ${PRODUTOS_NECESSARIOS} opções que resolvam isso.`,
            beneficio:    'Os produtos me interessaram. Agora quero saber quais condições vocês oferecem.',
        };
        return falas[fase] ?? 'O que você tem a me apresentar?';
    }

    // ── Retorno de cena ───────────────────────────────────────────────────────

    _cenaDeRetorno() { return 'PraiaDosProveitos'; }
}