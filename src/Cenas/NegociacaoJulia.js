import CenaNegociacao   from '../Classes/CenaNegociacao.js';
import CartaAbordagem   from '../Classes/FasesNegociacao/CartaAbordagem.js';
import CartaSondagem    from '../Classes/FasesNegociacao/CartaSondagem.js';
import CartaDemonstracao from '../Classes/FasesNegociacao/CartaDemonstracao.js';
import CartaNegociacao  from '../Classes/FasesNegociacao/CartaNegociacao.js';
import Insignia         from '../Classes/Insignias.js';

// ─────────────────────────────────────────────────────────────────────────────
// NegociacaoJulia.js — Cliente da Praia dos Proveitos
//
// FASES: abordagem → sondagem → demonstracao → negociacao
//
// FASE DE NEGOCIAÇÃO:
//   O jogador precisa revelar 2 condições corretas: Suporte e Taxas.
//   Cada uma acende um ícone próprio abaixo da barra de satisfação,
//   seguindo o mesmo padrão visual dos ícones PIFE e aspectos.
//
// FASE DE DEMONSTRAÇÃO:
//   Exibe um único ícone de estoque abaixo da barra de satisfação.
//   Começa como interrogação e acende para 'estoque_alto' ao acertar.
// ─────────────────────────────────────────────────────────────────────────────

// Condições que precisam ser reveladas na fase de negociação
const CONDICOES_NEGOCIACAO  = ['suporte', 'taxa'];
const CONDICOES_NECESSARIAS = 2;

export default class NegociacaoJulia extends CenaNegociacao {
    constructor() {
        super('NegociacaoJulia', {
            nomeCliente:       'Chefa',
            satisfacaoInicial: 0,
            fases:             ['abordagem', 'sondagem', 'demonstracao', 'negociacao'],
        });

        this.aspectosCliente = {
            pessoas: 'alto',
            lucro:   'baixo',
            estoque: 'alto',
        };

        this._condicoesReveladas = new Set();
        this._iconesNegociacao   = {};

        // Referências do ícone exclusivo da demonstração
        this._bgIconeDemo  = null;
        this._iconeDemo    = null;
    }

    // ── Preload ───────────────────────────────────────────────────────────────

    preload() {
        super.preload();

        this.load.image('julia_fundo',      'assets/NPC/JULIA/loja_chefa_negociacao.png');
        this.load.image('chefa_satisfeito', 'assets/NPC/JULIA/CHEFE_FELIZ.png');
        this.load.image('chefa_neutro',     'assets/NPC/JULIA/CHEFE_NEUTRA.png');
        this.load.image('chefa_bravo',      'assets/NPC/JULIA/CHEFE_IRRITADA.png');

        // ── Ícone único da fase de demonstração (reutiliza assets de sondagem) ──
        this.load.image('demo_estoque_off', 'assets/Icones/Sondagem/icone_caixa_baixo_off.png');
        this.load.image('demo_estoque_on',  'assets/Icones/Sondagem/icone_caixa_cima.png');

        // ── Ícones da fase de negociação — suporte e taxa ──
        CONDICOES_NEGOCIACAO.forEach(c => {
            this.load.image(`negociacao_${c}_off`, `assets/Icones/Negociacao/negociacao_${c}_off.png`);
            this.load.image(`negociacao_${c}_on`,  `assets/Icones/Negociacao/negociacao_${c}_on.png`);
        });

        Insignia.preload(this);
    }

    // ── Create ────────────────────────────────────────────────────────────────

    create() {
        super.create();

        const W      = this.scale.width;
        const H      = this.scale.height;
        const barraW = 300;
        const barraX = W - barraW / 2 - 40;
        const barraY = H * 0.08;

        // Cria os ícones de negociação já na inicialização (ocultos)
        this._criarIconesNegociacao(barraX, barraW, barraY);

        // Cria o ícone de demonstração já na inicialização (oculto)
        this._criarIconeDemo(barraX, barraY);

        this.add.image(0, 0, 'julia_fundo').setOrigin(0, 0).setDisplaySize(this.scale.width, this.scale.height);
    }

    // ── Posição da sprite da Julia ────────────────────────────────────────────

    _criarAreaCliente(W, H) {
        const nome         = this.clienteConfig.nomeCliente;
        const chaveInicial = `${nome}_${this._getEstadoSatisfacao()}`;

        this.add.text(W / 2, H * 0.04, nome, {
            fontFamily: '"Courier New", monospace',
            fontSize: '26px', color: '#c8e6f0', letterSpacing: 4,
            stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5);

        this.spriteCliente = this.textures.exists(chaveInicial)
            ? this.add.image(W * 0.5, H * 0.22, chaveInicial).setScale(0.4)
            : this.add.rectangle(W / 2, H * 0.28, 100, 150, 0x1a3a5a).setStrokeStyle(2, 0x2a6a9a);
    }

    // ── Ícone exclusivo da demonstração ──────────────────────────────────────

    _criarIconeDemo(barraX, barraY) {
        const iconeH  = 24;
        const largura = iconeH * 2;
        const pad     = 8;
        const y       = barraY + 53;    // mesma linha dos ícones PIFE/aspectos

        this._bgIconeDemo = this.add
            .rectangle(barraX, y, largura + pad * 2, iconeH + pad * 2, 0x222222, 0.85)
            .setStrokeStyle(1, 0x555555)
            .setDepth(49)
            .setVisible(false);

        this._iconeDemo = this.textures.exists('demo_estoque_off')
            ? this.add.image(barraX, y, 'demo_estoque_off').setDisplaySize(largura, iconeH).setDepth(50).setVisible(false)
            : this.add.rectangle(barraX, y, largura, iconeH, 0x333333).setStrokeStyle(1, 0x555555).setDepth(50).setVisible(false);
    }

    _setIconeDemoVisivel(visivel) {
        this._bgIconeDemo?.setVisible(visivel);
        this._iconeDemo?.setVisible(visivel);
    }

    _acenderIconeDemo() {
        if (!this._iconeDemo) return;

        if (this.textures.exists('demo_estoque_on') && this._iconeDemo.setTexture) {
            this._iconeDemo.setTexture('demo_estoque_on');
        } else if (this._iconeDemo.setFillStyle) {
            this._iconeDemo.setFillStyle(0x22cc66);
        }

        this.tweens.add({
            targets:  this._iconeDemo,
            scaleX:   1.3,
            scaleY:   1.3,
            duration: 150,
            yoyo:     true,
            ease:     'Back.easeOut',
        });
    }

    // ── Ícones da fase de negociação ──────────────────────────────────────────

    _criarIconesNegociacao(barraX, barraW, barraY) {
        const iconeH  = 28;
        const largura = iconeH * 2;
        const espaco  = 6;
        const totalW  = CONDICOES_NEGOCIACAO.length * largura + (CONDICOES_NEGOCIACAO.length - 1) * espaco;
        const startX  = barraX - totalW / 2 + largura / 2;
        const y       = barraY + 80;
        const pad     = 8;

        this._bgNegociacao = this.add
            .rectangle(barraX, y, totalW + pad * 2, iconeH + pad * 2, 0x222222, 0.85)
            .setStrokeStyle(1, 0x555555)
            .setDepth(49)
            .setVisible(false);

        this._iconesNegociacao = {};

        CONDICOES_NEGOCIACAO.forEach((condicao, i) => {
            const x        = startX + i * (largura + espaco);
            const chaveOff = `negociacao_${condicao}_off`;
            const chaveOn  = `negociacao_${condicao}_on`;

            const icone = this.textures.exists(chaveOff)
                ? this.add.image(x, y, chaveOff).setDisplaySize(largura, iconeH).setDepth(50)
                : this.add.rectangle(x, y, largura, iconeH, 0x333333)
                    .setStrokeStyle(1, 0x555555)
                    .setDepth(50);

            icone.setVisible(false);

            this._iconesNegociacao[condicao] = { obj: icone, chaveOff, chaveOn };
        });
    }

    _setIconesNegociacaoVisiveis(visivel) {
        this._bgNegociacao?.setVisible(visivel);
        for (const d of Object.values(this._iconesNegociacao)) d.obj.setVisible(visivel);
    }

    _revelarIconeNegociacao(condicao) {
        const d = this._iconesNegociacao[condicao];
        if (!d) return;

        if (this.textures.exists(d.chaveOn) && d.obj.setTexture) {
            d.obj.setTexture(d.chaveOn);
        } else if (d.obj.setFillStyle) {
            d.obj.setFillStyle(0x22cc66);
        }

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

    // ── Controle de fases ─────────────────────────────────────────────────────

    _iniciarFase() {
        super._iniciarFase();

        const fase = this.clienteConfig.fases[this.faseAtual];

        if (fase === 'demonstracao') {
            this._setIconesNegociacaoVisiveis(false);
            this._setAspectosVisiveis(false);
            this._setIconeDemoVisivel(true);          // ← ícone de estoque aparece
            this._distribuirCartasDemonstracao();

        } else if (fase === 'negociacao') {
            this._condicoesReveladas = new Set();
            this._setPIFEVisivel(false);
            this._setAspectosVisiveis(false);
            this._setIconeDemoVisivel(false);         // ← ícone de estoque some
            this._setIconesNegociacaoVisiveis(true);
            this._limparCartas();
            this._distribuirCartasNegociacao();

        } else {
            // 'abordagem' e 'sondagem': super fez tudo
            this._setIconesNegociacaoVisiveis(false);
            this._setIconeDemoVisivel(false);
        }
    }

    // ── _mostrarDetalheCarta ──────────────────────────────────────────────────

    _mostrarDetalheCarta(carta) {
        if (!this.negociacaoAtiva || this.cartaEmDetalhes) return;

        const fase = this.clienteConfig.fases[this.faseAtual];

        if (fase !== 'demonstracao' && fase !== 'negociacao') {
            super._mostrarDetalheCarta(carta);
            return;
        }

        if (fase === 'demonstracao') {
            this._abrirModalApresentar(carta, () => this._apresentarProduto(carta));
            return;
        }

        // fase === 'negociacao'
        if (this._condicoesReveladas.has(carta.condicao)) {
            this._mostrarDialogo('Essa condição já foi apresentada!');
            return;
        }
        this._abrirModalApresentar(carta, () => this._resolverNegociacao(carta));
    }

    // ── Cartas da abordagem ───────────────────────────────────────────────────

    _getCartasAbordagem() {
        return [
            new CartaAbordagem({
                key:           'Proximidade',
                letra:         'P',
                correta:       true,
                dialogoAcerto: 'Bom dia, tudo bem sim..',
                dialogoErro:   'Não entendi o que você veio fazer aqui.',
            }),
            new CartaAbordagem({
                key:           'Interesse',
                letra:         'I',
                correta:       true,
                dialogoAcerto: ' Sou a Julia.',
                dialogoErro:   'Isso não tem nada a ver com o meu negócio.',
            }),
            new CartaAbordagem({
                key:           'Familiaridade',
                letra:         'F',
                correta:       true,
                dialogoAcerto: 'Interessante, ultimamente tenho utilizado bastante as maquininhas. Pode continuar.',
                dialogoErro:   'Parece que você só quer me vender algo.',
            }),
            new CartaAbordagem({
                key:           'Empatia',
                letra:         'E',
                correta:       true,
                dialogoAcerto: 'Faz sentido. Você entende a minha situação.',
                dialogoErro:   'Isso não se aplica ao meu caso.',
            }),
            new CartaAbordagem({
                key:           'CPC',
                letra:         'CPC',
                correta:       true,
                dialogoAcerto: 'Ótimo! Você falou com a pessoa certa. Vamos continuar.',
                dialogoErro:   '',
            }),
        ];
    }

    // ── Cartas da sondagem ────────────────────────────────────────────────────

    _getCartasSondagem() {
        return [
            new CartaSondagem({
                key:           'Movimento',
                aspecto:       'pessoas',
                correta:       true,
                dialogoAcerto: 'Atendo poucas pessoas por dia, mas são clientes fiéis.',
                dialogoErro:   'Isso não me ajuda a entender o meu fluxo de clientes.',
            }),
            new CartaSondagem({
                key:           'LucroCerto',
                aspecto:       'lucro',
                correta:       true,
                dialogoAcerto: 'O negócio vai bem, tenho uma margem alta nos produtos.',
                dialogoErro:   'Essa pergunta não faz sentido pra mim agora.',
            }),
            new CartaSondagem({
                key:           'LucroErrado',
                aspecto:       'lucro',
                correta:       false,
                dialogoAcerto: 'Meu estoque gira pouco, trabalho com produtos especiais.',
                dialogoErro:   'Não entendo o que você quer saber com isso.',
            }),
            new CartaSondagem({
                key:           'EstoqueCerto',
                aspecto:       'estoque',
                correta:       true,
                dialogoAcerto: 'Tenho um estoque bem organizado e controlado.',
                dialogoErro:   'Isso não é relevante pra minha operação.',
            }),
            new CartaSondagem({
                key:           'EstoqueErrado',
                aspecto:       'estoque',
                correta:       false,
                dialogoAcerto: '',
                dialogoErro:   'Não gosto desse tipo de abordagem.',
            }),
        ];
    }

    // ── Fase de demonstração ──────────────────────────────────────────────────

    _distribuirCartasDemonstracao() {
        // Julia: aspectosCliente = { pessoas: 'alto', lucro: 'baixo', estoque: 'alto' }
        const pool = [
            new CartaDemonstracao({ key: 'CieloLioOn',       pessoas: 'alto',  lucro: 'baixo', estoque: 'alto'  }), // 3/3 — correta
            new CartaDemonstracao({ key: 'CieloFlash',       pessoas: 'alto',  lucro: 'baixo', estoque: 'baixo' }), // 2/3 — -10
            new CartaDemonstracao({ key: 'CrediarioDigital', pessoas: 'alto',  lucro: 'baixo', estoque: 'baixo' }), // 2/3 — -10
            new CartaDemonstracao({ key: 'LioOnGestao',      pessoas: 'baixo', lucro: 'baixo', estoque: 'alto'  }), // 2/3 — -10
            new CartaDemonstracao({ key: 'LioOnApps',        pessoas: 'alto',  lucro: 'alto',  estoque: 'baixo' }), // 1/3 — -20
            new CartaDemonstracao({ key: 'CieloTap',         pessoas: 'alto',  lucro: 'alto',  estoque: 'baixo' }), // 1/3 — -20
            new CartaDemonstracao({ key: 'CieloZip',         pessoas: 'baixo', lucro: 'alto',  estoque: 'alto'  }), // 1/3 — -20
            new CartaDemonstracao({ key: 'FlashRecarga',     pessoas: 'baixo', lucro: 'alto',  estoque: 'baixo' }), // 0/3 — -30
        ];

        const correta = pool[0];
        const demais  = Phaser.Utils.Array.Shuffle(pool.slice(1));
        const cartas  = Phaser.Utils.Array.Shuffle([correta, ...demais.slice(0, 3)]);
        this._distribuirCartas(cartas);
    }

    // Modal reutilizável — demonstração e negociação
    _abrirModalApresentar(carta, aoSelecionar) {
        this.cartaEmDetalhes = carta;

        const W = this.scale.width;
        const H = this.scale.height;
        const { LAYERS } = CenaNegociacao;

        const fase      = this.clienteConfig.fases[this.faseAtual];
        const restantes = CONDICOES_NECESSARIAS - this._condicoesReveladas.size;
        const label     = fase === 'negociacao'
            ? (restantes === 1 ? 'APRESENTAR (último!)' : `APRESENTAR (faltam ${restantes})`)
            : 'APRESENTAR';

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
        const acertos = carta.contarAcertos(this.aspectosCliente);
        this._removerCartaVisual(carta);
        this.negociacaoAtiva = false;

        if (acertos === 3) {
            this._acenderIconeDemo();  // ← acende o ícone de estoque_alto
            this._alterarSatisfacao(CenaNegociacao.GANHO_SATISFACAO);
            this._mostrarDialogo('Perfeito! Esse produto resolve exatamente o que eu precisava.');
            this.time.delayedCall(4000, () => {
                this.negociacaoAtiva = true;
                this._avancarOuVencer();
            });
        } else {
            const penalidade = (3 - acertos) * 10;
            this._alterarSatisfacao(-penalidade);
            this._mostrarDialogo(this._dialogoErroProduto(acertos));
            this.time.delayedCall(2000, () => {
                if (this.satisfacao <= 0) this._perderNegociacao();
                else this.negociacaoAtiva = true;
            });
        }
    }

    _dialogoErroProduto(acertos) {
        if (acertos === 2) return 'Esse produto até ajuda em algumas coisas, mas não é o que eu preciso.';
        if (acertos === 1) return 'Não é isso. Quase nada aqui se aplica ao meu negócio.';
        return 'Esse produto não tem nada a ver com a minha realidade.';
    }

    // ── Fase de negociação ────────────────────────────────────────────────────

    _distribuirCartasNegociacao() {
        const cartas = this._getCartasNegociacao();
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

    _resolverNegociacao(carta) {
        if (!this.negociacaoAtiva) return;

        if (carta.correta) {
            if (!this._condicoesReveladas.has(carta.condicao)) {
                this._condicoesReveladas.add(carta.condicao);
                this._revelarIconeNegociacao(carta.condicao);
            }

            this._alterarSatisfacao(CenaNegociacao.GANHO_SATISFACAO);
            this._removerCartaVisual(carta);

            if (this._condicoesReveladas.size >= CONDICOES_NECESSARIAS) {
                this.negociacaoAtiva = false;
                this._mostrarDialogo(carta.dialogoAcerto);
                this.time.delayedCall(4000, () => {
                    if (this.satisfacao <= 0) { this._perderNegociacao(); return; }
                    this.negociacaoAtiva = true;
                    this._avancarOuVencer();
                });
            } else {
                const faltam = CONDICOES_NECESSARIAS - this._condicoesReveladas.size;
                this._mostrarDialogo(`${carta.dialogoAcerto} (Falta mais ${faltam} condição.)`);
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

    // ── Cartas da negociação ──────────────────────────────────────────────────

    _getCartasNegociacao() {
        return [
            new CartaNegociacao({
                key:           'Suporte',
                condicao:      'suporte',
                correta:       true,
                dialogoAcerto: 'Suporte 24h na praia? Isso é exatamente o que eu precisava ouvir!',
                dialogoErro:   'Isso não me convence sobre o suporte.',
            }),
            new CartaNegociacao({
                key:           'Taxas',
                condicao:      'taxa',
                correta:       true,
                dialogoAcerto: 'Taxas negociáveis? Agora você tá falando a minha língua!',
                dialogoErro:   'Isso não resolve meu problema com as taxas.',
            }),
            new CartaNegociacao({
                key:           'Aceitacao',
                condicao:      'suporte',
                correta:       false,
                dialogoAcerto: '',
                dialogoErro:   'Aceitar qualquer condição não é o que eu quero ouvir.',
            }),
            new CartaNegociacao({
                key:           'Recebimento',
                condicao:      'taxa',
                correta:       false,
                dialogoAcerto: '',
                dialogoErro:   'Recebimento rápido é bom, mas não é o meu problema principal agora.',
            }),
            new CartaNegociacao({
                key:           'Gestao',
                condicao:      'suporte',
                correta:       false,
                dialogoAcerto: '',
                dialogoErro:   'Gestão integrada não resolve o que eu preciso no momento.',
            }),
        ];
    }

    // ── Falas ─────────────────────────────────────────────────────────────────

    _falaInicioFase(fase) {
        const falas = {
            abordagem:    'Oi! Tô ocupada aqui, mas pode falar.',
            sondagem:     'Me conta mais. O que você tem pra me oferecer?',
            demonstracao: 'A taxa que pago tá me matando. Me mostre o produto certo pra mim.',
            negociacao:   'Os produtos me interessaram. Mas preciso saber: qual o suporte e quais as condições de taxa?',
        };
        return falas[fase] ?? 'O que você tem a me apresentar?';
    }

    // ── Retorno de cena ───────────────────────────────────────────────────────

    _cenaDeRetorno() {
        return 'PraiaDosProveitos';
    }
}