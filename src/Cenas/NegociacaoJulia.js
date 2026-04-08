import CenaNegociacao from '../Classes/CenaNegociacao.js';
import CartaAbordagem from '../Classes/FasesNegociacao/CartaAbordagem.js';
import CartaSondagem  from '../Classes/FasesNegociacao/CartaSondagem.js';
import CartaBeneficio from '../Classes/FasesNegociacao/CartaBeneficio.js';
import Insignia       from '../Classes/Insignias.js';

// ─────────────────────────────────────────────────────────────────────────────
// NegociacaoJulia.js — Cliente da Praia dos Proveitos
//
// FASES: abordagem (PIFE+CPC) → sondagem (aspectos) → demonstracao (produtos)
//        → beneficios (taxa / prazo / suporte)
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

const PONTUACAO_BENEFICIO_PADRAO = {
    Ajuste:      10,
    Antecipacao: 10,
    Validacao:   10,
    Comparativo:  0,
    Recuo:        0,
};

const BENEFICIOS_CORRETOS = new Set(['Ajuste', 'Antecipacao', 'Validacao']);
const BENEFICIOS_ERRADOS  = ['Comparativo', 'Recuo'];

const PRODUTOS_NECESSARIOS   = 3;
const BENEFICIOS_NECESSARIOS = 3;
const BENEFICIOS = ['taxa', 'prazo', 'suporte'];

export default class NegociacaoJulia extends CenaNegociacao {
    constructor() {
        super('NegociacaoJulia', {
            nomeCliente:       'Chefa',
            satisfacaoInicial: 0,
            fases:             ['abordagem', 'sondagem', 'demonstracao', 'beneficios'],
            cartasPorFase: {
                abordagem:    5,
                sondagem:     5,
                demonstracao: 4,
                beneficios:   3,
            },
        });

        this.aspectosCliente = {
            pessoas: 'alto',
            lucro:   'baixo',
            estoque: 'alto',
        };

        this._produtosSelecionados   = [];
        this._beneficiosSelecionados = [];
        this._iconesBeneficios       = {};
    }

    // ── Preload ───────────────────────────────────────────────────────────────

    preload() {
        super.preload();

        this.load.image('julia_fundo',      'assets/NPC/JULIA/casa_julia_negociacao.png');
        this.load.image('julia_satisfeito', 'assets/NPC/JULIA/CHEFE_FELIZ.png');
        this.load.image('julia_neutro',     'assets/NPC/JULIA/CHEFE_NEUTRA.png');
        this.load.image('julia_bravo',      'assets/NPC/JULIA/CHEFE_IRRITADA.png');

        BENEFICIOS.forEach(b => {
            this.load.image(`beneficio_${b}_off`, `assets/Icones/Beneficios/beneficio_${b}_off.png`);
            this.load.image(`beneficio_${b}_on`,  `assets/Icones/Beneficios/beneficio_${b}_on.png`);
        });

        Insignia.preload(this);
    }

    // ── Vitória ───────────────────────────────────────────────────────────────

    _aoVencer() {
        // TODO: adicionar entrada 'praia_proveitos' em Insignia.CATALOGO e conceder aqui
    }

    _chaveVitoria() { return 'julia_vencida'; }

    // ── Pontuação ─────────────────────────────────────────────────────────────

    _getPontuacaoCarta(key) {
        if (BENEFICIOS_CORRETOS.has(key) || BENEFICIOS_ERRADOS.includes(key)) {
            return PONTUACAO_BENEFICIO_PADRAO[key] ?? 0;
        }
        return PONTUACAO_PRODUTO_PADRAO[key] ?? 0;
    }

    _beneficioEstaErrado(key) {
        return BENEFICIOS_ERRADOS.includes(key);
    }

    // ── Ícones de benefícios ──────────────────────────────────────────────────

    _criarIconesBeneficios() {
        const W      = this.scale.width;
        const H      = this.scale.height;
        const barraX = W - 300 / 2 - 40;
        const barraY = H * 0.08;

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
    }

    _setIconesBeneficiosVisiveis(visivel) {
        Object.values(this._iconesBeneficios).forEach(({ obj }) => obj.setVisible(visivel));
    }

    _acenderIconeBeneficio(beneficio) {
        const icone = this._iconesBeneficios[beneficio];
        if (!icone) return;
        if (this.textures.exists(icone.chaveOn)) {
            icone.obj.setTexture(icone.chaveOn);
        } else {
            icone.obj.setFillStyle(0x22cc66);
        }
    }

    // ── Controle de fases ─────────────────────────────────────────────────────

    _iniciarFase() {
        this._produtosSelecionados   = [];
        this._beneficiosSelecionados = [];
        this._contadorTexto          = null;

        const fase = this.clienteConfig.fases[this.faseAtual];

        if (fase === 'demonstracao') {
            super._iniciarFase();
            this._setIconesBeneficiosVisiveis(false);
            this._distribuirCartasDemonstracao();
            this._criarContadorProdutos();

        } else if (fase === 'beneficios') {
            this.acertosNaFase = 0;
            this._atualizarIndicadoresFase();
            this._mostrarDialogo(this._falaInicioFase(fase));
            this._limparCartas();
            this.cartaEmDetalhes = null;
            this._setPIFEVisivel(false);
            this._setAspectosVisiveis(false);
            this._criarIconesBeneficios();
            this._setIconesBeneficiosVisiveis(true);
            this._distribuirCartasBeneficio();
            this._criarContadorBeneficios();

        } else {
            // abordagem e sondagem: delega ao super — igual ao Pedro
            this._setIconesBeneficiosVisiveis(false);
            super._iniciarFase();
        }
    }

    // ── Modal de detalhe (demonstração e benefícios) ──────────────────────────

    _mostrarDetalheCarta(carta) {
        if (!this.negociacaoAtiva || this.cartaEmDetalhes) return;

        const fase = this.clienteConfig.fases[this.faseAtual];

        if (fase !== 'demonstracao' && fase !== 'beneficios') {
            super._mostrarDetalheCarta(carta);
            return;
        }

        if (fase === 'demonstracao') {
            if (this._produtosSelecionados.find(c => c.key === carta.key)) {
                this._mostrarDialogo('Você já apresentou este produto!');
                return;
            }
            const restantes = PRODUTOS_NECESSARIOS - this._produtosSelecionados.length;
            this._abrirModalApresentar(carta, restantes, () => this._apresentarProduto(carta));
            return;
        }

        if (fase === 'beneficios') {
            if (this._beneficiosSelecionados.find(c => c.key === carta.key)) {
                this._mostrarDialogo('Você já apresentou este benefício!');
                return;
            }
            const restantes = BENEFICIOS_NECESSARIOS - this._beneficiosSelecionados.length;
            this._abrirModalApresentar(carta, restantes, () => this._selecionarBeneficio(carta));
        }
    }

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

        btnVoltar.setDepth(LAYERS.MODAL);     textoVoltar.setDepth(LAYERS.MODAL_BTN);
        btnSelecionar.setDepth(LAYERS.MODAL); textoSelecionar.setDepth(LAYERS.MODAL_BTN);

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
        btnSelecionar.on('pointerdown', () => { fecharModal(); aoConfirmar(); });
    }

    // ── Cartas da abordagem ───────────────────────────────────────────────────
    //
    // COMO ADICIONAR UMA CARTA NOVA:
    //
    //   new CartaAbordagem({
    //       key:           'NomeDaCartaNoAsset',  // arquivo em assets/cartas/
    //       letra:         'P',                   // 'P', 'I', 'F', 'E' ou 'CPC'
    //       correta:       true,                  // false = perde satisfação
    //       dialogoAcerto: 'Fala da Julia ao acertar',
    //       dialogoErro:   'Fala da Julia ao errar',
    //   }),
    //
    //   Regras:
    //   - Pode ter várias cartas da mesma letra (P, I, F ou E)
    //   - Só pode haver UMA carta com letra: 'CPC', e ela deve ter correta: true
    //   - A carta CPC só fica disponível após P, I, F e E estarem preenchidos
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
                dialogoErro:   '',
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
    //       correta:       true,                  // false = perde satisfação
    //       dialogoAcerto: 'Fala da Julia revelando o aspecto',
    //       dialogoErro:   'Fala da Julia ao errar',
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
        ];
    }

    _falaInicioFase(fase) {
        const falas = {
            abordagem:    'Olá, boa tarde! Em que posso ajudar?',
            sondagem:     'Tudo bem, me conta mais. O que você tem em mente?',
            demonstracao: `Me mostre ${PRODUTOS_NECESSARIOS} produtos que possam me ajudar.`,
            beneficios:   'Agora quero saber das condições. O que você tem pra me oferecer?',
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

    _apresentarProduto(carta) {
        this._produtosSelecionados.push(carta);
        this._atualizarContadorProdutos();

        const pontos = this._getPontuacaoCarta(carta.key);
        this._alterarSatisfacao(CenaNegociacao.GANHO_SATISFACAO + pontos);

        const faltam = PRODUTOS_NECESSARIOS - this._produtosSelecionados.length;
        if (faltam > 0) {
            this._mostrarDialogo(`Produto apresentado! Continue mostrando mais ${faltam}.`);
            return;
        }

        this.negociacaoAtiva = false;
        if (this.satisfacao <= 0) { this._perderNegociacao(); return; }

        this._mostrarDialogo('Tá bom, me convenceu com os produtos. Mas quero saber das condições.');
        this.time.delayedCall(4000, () => {
            this.negociacaoAtiva = true;
            this._avancarOuVencer();
        });
    }

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

    // ── Fase de benefícios ────────────────────────────────────────────────────
    //
    // COMO ADICIONAR UMA CARTA NOVA:
    //
    //   new CartaBeneficio({
    //       key:           'NomeDaCartaNoAsset',  // arquivo em assets/cartas/
    //       beneficio:     'taxa',                // 'taxa', 'prazo' ou 'suporte'
    //       correta:       true,                  // false = perde satisfação
    //       dialogoAcerto: 'Fala da Julia ao revelar o benefício',
    //       dialogoErro:   'Fala da Julia ao errar',
    //   }),
    //
    //   Regras:
    //   - Os três benefícios (taxa, prazo, suporte) precisam ser revelados para vencer
    //   - Adicionar a chave em BENEFICIOS_CORRETOS ou BENEFICIOS_ERRADOS conforme necessário
    // ─────────────────────────────────────────────────────────────────────────

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

    _distribuirCartasBeneficio() {
        const cartas = Phaser.Utils.Array.Shuffle(this._getCartasBeneficio());
        this._distribuirCartas(cartas);
    }

    _selecionarBeneficio(carta) {
        if (!this.negociacaoAtiva) return;

        if (this._beneficioEstaErrado(carta.key)) {
            this._alterarSatisfacao(-CenaNegociacao.PERDA_SATISFACAO);
            this._mostrarDialogo(carta.dialogoErro);
            if (carta._objetos?.bg) carta._objetos.bg.destroy();
            this.cartasNaMao = this.cartasNaMao.filter(c => c !== carta);
            this.negociacaoAtiva = false;
            this.time.delayedCall(2000, () => {
                if (this.satisfacao <= 0) this._perderNegociacao();
                else this.negociacaoAtiva = true;
            });
            return;
        }

        this._beneficiosSelecionados.push(carta);
        this._atualizarContadorBeneficios();
        this._acenderIconeBeneficio(carta.beneficio);
        this._alterarSatisfacao(CenaNegociacao.GANHO_SATISFACAO + this._getPontuacaoCarta(carta.key));

        if (carta._objetos?.bg) carta._objetos.bg.destroy();
        this.cartasNaMao = this.cartasNaMao.filter(c => c !== carta);

        const faltam = BENEFICIOS_NECESSARIOS - this._beneficiosSelecionados.length;

        if (faltam > 0) {
            this._mostrarDialogo(`${carta.dialogoAcerto} Ainda faltam ${faltam} benefício(s).`);
            return;
        }

        this.negociacaoAtiva = false;
        if (this.satisfacao <= 0) { this._perderNegociacao(); return; }

        this._mostrarDialogo(this._falaAcertoFase('beneficios'));
        this.time.delayedCall(4000, () => {
            this.negociacaoAtiva = true;
            this._avancarOuVencer();
        });
    }

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

    // ── Retorno de cena ───────────────────────────────────────────────────────

    _cenaDeRetorno() {
        return 'PraiaDosProveitos';
    }
}
