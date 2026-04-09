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

        this._condicoesReveladas   = new Set();
        this._iconesNegociacao     = {};
    }

    // ── Preload ───────────────────────────────────────────────────────────────

    preload() {
        super.preload();

        this.load.image('julia_fundo',      'assets/NPC/JULIA/loja_chefa_negociacao.png');
        this.load.image('chefa_satisfeito', 'assets/NPC/JULIA/CHEFE_FELIZ.png');
        this.load.image('chefa_neutro',     'assets/NPC/JULIA/CHEFE_NEUTRA.png');
        this.load.image('chefa_bravo',      'assets/NPC/JULIA/CHEFE_IRRITADA.png');

        // Ícones da fase de negociação — suporte e taxa
        // Padrão de nomeação igual ao PIFE e aspectos:
        //   negociacao_suporte_off / negociacao_suporte_on
        //   negociacao_taxa_off    / negociacao_taxa_on
        CONDICOES_NEGOCIACAO.forEach(c => {
            this.load.image(`negociacao_${c}_off`, `assets/Icones/Negociacao/negociacao_${c}_off.png`);
            this.load.image(`negociacao_${c}_on`,  `assets/Icones/Negociacao/negociacao_${c}_on.png`);
        });

        Insignia.preload(this);
    }

    // ── Create ────────────────────────────────────────────────────────────────
    // CORREÇÃO: o bloco com W, H, barraW, barraX, barraY e _criarIconesNegociacao
    // estava solto fora de qualquer método. Pertence ao create().

    create() {
        super.create();

        const W      = this.scale.width;
        const H      = this.scale.height;
        const barraW = 300;
        const barraX = W - barraW / 2 - 40;
        const barraY = H * 0.08;

        // Cria os ícones já na inicialização (ocultos), igual ao que o super
        // faz com _criarIconesPIFE e _criarIconesAspectos.
        this._criarIconesNegociacao(barraX, barraW, barraY);
    }

    // ── Posição da sprite da Julia ────────────────────────────────────────────
    // Sobrescreve _criarAreaCliente da classe base para posicionar a sprite
    // da Julia de forma independente dos outros clientes (Pedro, Thaina).
    // Ajuste W * 0.5 (horizontal), H * 0.22 (vertical) e setScale(0.4) (tamanho).

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

    // ── Ícones da fase de negociação ──────────────────────────────────────────
    //
    // Dois ícones (suporte / taxa) na mesma faixa vertical dos ícones PIFE
    // e de aspectos — abaixo da barra de satisfação.
    // Começam ocultos e aparecem apenas na fase 'negociacao'.

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
    //
    //   - 'demonstracao': jogador apresenta um produto; acerto avança, erro penaliza.
    //   - 'negociacao':   super + ícones próprios + cartas de negociação.
    //   - 'abordagem' / 'sondagem': super faz tudo.

    _iniciarFase() {
        super._iniciarFase();

        const fase = this.clienteConfig.fases[this.faseAtual];

        if (fase === 'demonstracao') {
            this._setIconesNegociacaoVisiveis(false);
            this._distribuirCartasDemonstracao();

        } else if (fase === 'negociacao') {
            this._condicoesReveladas = new Set();
            this._setPIFEVisivel(false);
            this._setAspectosVisiveis(false);
            this._setIconesNegociacaoVisiveis(true);
            this._limparCartas();
            this._distribuirCartasNegociacao();

        } else {
            // 'abordagem' e 'sondagem': super fez tudo.
            this._setIconesNegociacaoVisiveis(false);
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
                dialogoAcerto: 'Claro! Sou a Julia, dona do estabelecimento. Me conta mais.',
                dialogoErro:   'Não entendi o que você veio fazer aqui.',
            }),
            new CartaAbordagem({
                key:           'Interesse',
                letra:         'I',
                correta:       true,
                dialogoAcerto: 'Ah, conheço sim! Boa referência.',
                dialogoErro:   'Isso não tem nada a ver com o meu negócio.',
            }),
            new CartaAbordagem({
                key:           'Familiaridade',
                letra:         'F',
                correta:       true,
                dialogoAcerto: 'Interessante, você não está aqui só pra vender. Pode continuar.',
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
        // A carta correta tem os 3 atributos certos. As demais têm 0, 1 ou 2 acertos.
        const pool = [
            new CartaDemonstracao({ key: 'CieloFlash',       pessoas: 'alto',  lucro: 'baixo', estoque: 'alto'  }), // 3/3 — correta
            new CartaDemonstracao({ key: 'CrediarioDigital', pessoas: 'alto',  lucro: 'baixo', estoque: 'baixo' }), // 2/3 — -10
            new CartaDemonstracao({ key: 'CVBA',             pessoas: 'baixo', lucro: 'baixo', estoque: 'alto'  }), // 2/3 — -10
            new CartaDemonstracao({ key: 'CieloFlash2',      pessoas: 'alto',  lucro: 'alto',  estoque: 'alto'  }), // 2/3 — -10
            new CartaDemonstracao({ key: 'CieloLioOn',       pessoas: 'alto',  lucro: 'baixo', estoque: 'baixo' }), // 2/3 — -10
            new CartaDemonstracao({ key: 'LioOnGestao',      pessoas: 'baixo', lucro: 'baixo', estoque: 'alto'  }), // 2/3 — -10
            new CartaDemonstracao({ key: 'LioOnApps',        pessoas: 'alto',  lucro: 'alto',  estoque: 'baixo' }), // 1/3 — -20
            new CartaDemonstracao({ key: 'CieloTap',         pessoas: 'alto',  lucro: 'alto',  estoque: 'baixo' }), // 1/3 — -20
            new CartaDemonstracao({ key: 'CieloZip',         pessoas: 'baixo', lucro: 'alto',  estoque: 'alto'  }), // 1/3 — -20
            new CartaDemonstracao({ key: 'Antecipacao',      pessoas: 'baixo', lucro: 'alto',  estoque: 'baixo' }), // 0/3 — -30
            new CartaDemonstracao({ key: 'FlashRecarga',     pessoas: 'baixo', lucro: 'alto',  estoque: 'baixo' }), // 0/3 — -30
            new CartaDemonstracao({ key: 'MoedaEstrangeira', pessoas: 'baixo', lucro: 'alto',  estoque: 'baixo' }), // 0/3 — -30
        ];

        const correta  = pool[0];
        const demais   = Phaser.Utils.Array.Shuffle(pool.slice(1));
        const cartas   = Phaser.Utils.Array.Shuffle([correta, ...demais.slice(0, 3)]);
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
    //
    // O jogador apresenta cartas de condições. Ao acertar 'suporte' e 'taxa',
    // os dois ícones acendem e a negociação avança.
    // Cartas erradas penalizam a satisfação sem revelar nenhum ícone.

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
    //
    // COMO ADICIONAR UMA CARTA NOVA:
    //
    //   new CartaNegociacao({
    //       key:           'NomeDaCartaNoAsset',
    //       condicao:      'suporte',   // 'suporte' ou 'taxa'
    //       correta:       true,        // false = penaliza satisfação
    //       dialogoAcerto: 'Fala da Julia ao acertar',
    //       dialogoErro:   'Fala da Julia ao errar',
    //   }),
    //
    //   Regras:
    //   - Pode haver mais de uma carta para a mesma condição
    //   - A condição só é revelada uma vez (pelo primeiro acerto)
    //   - Cartas erradas penalizam sem revelar nenhum ícone

    _getCartasNegociacao() {
        return [
            // ── Suporte (correta) ──
            new CartaNegociacao({
                key:           'Suporte',
                condicao:      'suporte',
                correta:       true,
                dialogoAcerto: 'Suporte 24h na praia? Isso é exatamente o que eu precisava ouvir!',
                dialogoErro:   'Isso não me convence sobre o suporte.',
            }),

            // ── Taxas (correta) ──
            new CartaNegociacao({
                key:           'Taxas',
                condicao:      'taxa',
                correta:       true,
                dialogoAcerto: 'Taxas negociáveis? Agora você tá falando a minha língua!',
                dialogoErro:   'Isso não resolve meu problema com as taxas.',
            }),

            // ── Erradas ──
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