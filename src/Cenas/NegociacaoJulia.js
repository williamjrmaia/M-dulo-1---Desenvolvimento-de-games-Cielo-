import CenaNegociacao    from '../Classes/CenaNegociacao.js';
import CartaAbordagem    from '../Classes/FasesNegociacao/CartaAbordagem.js';
import CartaSondagem     from '../Classes/FasesNegociacao/CartaSondagem.js';
import CartaDemonstracao from '../Classes/FasesNegociacao/CartaDemonstracao.js';
import CartaNegociacao   from '../Classes/FasesNegociacao/CartaNegociacao.js';
import Insignia          from '../Classes/Insignia.js';

// ─────────────────────────────────────────────────────────────────────────────
// NegociacaoJulia.js — Cliente da Praia dos Proveitos
//
// FASES: abordagem → sondagem → demonstracao → negociacao
// ─────────────────────────────────────────────────────────────────────────────

const CONDICOES_NEGOCIACAO  = ['suporte', 'taxa'];
const CONDICOES_NECESSARIAS = 2;

// Prefixo das texturas da Chefa — todas carregadas com 'chefa_' (minúsculo)
const SPRITE_KEY = 'chefa';

// Mapeamento: condição revelada → aspecto a acender (mesmo sistema da sondagem)
const CONDICAO_PARA_ASPECTO = {
    suporte: 'pessoas',
    taxa:    'lucro',
};



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
        this._bgIconeDemo        = null;
        this._iconeDemo          = null;
    }

    // ── Preload ───────────────────────────────────────────────────────────────

    preload() {
        super.preload();

        this.load.image('julia_fundo',      'assets/NPC/JULIA/loja_chefa_negociacao.png');

        // Texturas da sprite da Chefa — sempre com prefixo minúsculo 'chefa_'
        this.load.image('chefa_satisfeito', 'assets/NPC/JULIA/CHEFE_FELIZ.png');
        this.load.image('chefa_neutro',     'assets/NPC/JULIA/CHEFE_NEUTRA.png');
        this.load.image('chefa_bravo',      'assets/NPC/JULIA/CHEFE_IRRITADA.png');

        this.load.image('demo_estoque_off', 'assets/Icones/Sondagem/icone_caixa_baixo_off.png');
        this.load.image('demo_estoque_on',  'assets/Icones/Sondagem/icone_caixa_cima.png');

        // Os ícones de negociação reutilizam os assets da sondagem —
        // já carregados pelo super.preload() via CenaNegociacao.
        // Nenhum asset adicional de negociação é necessário aqui.

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

        this._criarIconeDemo(barraX, barraY);
    }

    // ── Fundo — sobrescreve a base para usar 'julia_fundo' no lugar certo ────

    _criarFundo(W, H) {
        if (this.textures.exists('julia_fundo')) {
            this.add.image(0, 0, 'julia_fundo')
                .setOrigin(0, 0)
                .setDisplaySize(W, H)
                .setDepth(0);
        } else {
            this.add.rectangle(0, 0, W, H * 0.6, 0x111a24).setOrigin(0, 0).setDepth(0);
        }

        if (this.textures.exists('balcao')) {
            this.add.image(W / 2, H * 0.79, 'balcao').setDisplaySize(W, H * 0.42).setDepth(1);
        } else {
            this.add.rectangle(0, H * 0.58, W, H * 0.42, 0x0a0f14).setOrigin(0, 0).setDepth(1);
        }

        const div = this.add.graphics().setDepth(1);
        div.lineStyle(2, 0x2a4a6a, 0.8);
        div.lineBetween(0, H * 0.58, W, H * 0.58);
    }

    // ── Cartas — depth 2 para ficarem na frente do balcão (depth 1) ──────────

    _criarFundoCarta(x, y, key) {
        const { CARD_WIDTH, CARD_HEIGHT } = CenaNegociacao;
        const obj = this.textures.exists(key)
            ? this.add.image(x, y, key).setDisplaySize(CARD_WIDTH, CARD_HEIGHT)
            : this.add.rectangle(x, y, CARD_WIDTH, CARD_HEIGHT, 0x0d1f2e).setStrokeStyle(2, 0x1a4a6a);
        return obj.setDepth(2).setInteractive({ useHandCursor: true });
    }

    // ── Área do cliente ───────────────────────────────────────────────────────

    _criarAreaCliente(W, H) {
        const nome         = this.clienteConfig.nomeCliente;
        const chaveInicial = `${SPRITE_KEY}_${this._getEstadoSatisfacao()}`;

        this.add.text(W / 2, H * 0.04, nome, {
            fontFamily: '"Courier New", monospace',
            fontSize:   '26px',
            color:      '#c8e6f0',
            letterSpacing: 4,
            stroke:          '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        this.spriteCliente = this.textures.exists(chaveInicial)
            ? this.add.image(W * 0.5, H * 0.22, chaveInicial).setScale(0.4)
            : this.add.rectangle(W / 2, H * 0.28, 100, 150, 0x1a3a5a).setStrokeStyle(2, 0x2a6a9a);
    }

    // ── Atualização da sprite ─────────────────────────────────────────────────

    _atualizarSpriteCliente() {
        const chave = `${SPRITE_KEY}_${this._getEstadoSatisfacao()}`;
        if (!this.textures.exists(chave)) return;

        this.tweens.add({
            targets:  this.spriteCliente,
            alpha:    0,
            duration: 150,
            onComplete: () => {
                if (this.spriteCliente?.setTexture) this.spriteCliente.setTexture(chave);
                this.tweens.add({ targets: this.spriteCliente, alpha: 1, duration: 150 });
            },
        });
    }

    // ── Ícone exclusivo da demonstração ───────────────────────────────────────

    _criarIconeDemo(barraX, barraY) {
        const iconeH  = 24;
        const largura = iconeH * 2;
        const pad     = 8;
        const y       = barraY + 53;

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
            scaleX:   1.3, scaleY: 1.3,
            duration: 150, yoyo:   true,
            ease:     'Back.easeOut',
        });
    }

    // ── Insígnia e vitória ────────────────────────────────────────────────────

    _getInsignia() {
        return {
            key:  'insignia_praia_proveitos',
            nome: 'Ancião dos Proveitos',
        };
    }   

    // ── Controle de fases ─────────────────────────────────────────────────────

    _iniciarFase() {
        super._iniciarFase();

        const fase = this.clienteConfig.fases[this.faseAtual];

        if (fase === 'demonstracao') {
            this._setAspectosVisiveis(false);
            this._setIconeDemoVisivel(true);
            this._distribuirCartasDemonstracao();

        } else if (fase === 'negociacao') {
            this._condicoesReveladas = new Set();
            this._setPIFEVisivel(false);
            this._setIconeDemoVisivel(false);
            this._resetarIconesNegociacao();
            this._limparCartas();
            this._distribuirCartasNegociacao();

        } else {
            // 'abordagem' e 'sondagem': super faz tudo
            this._setIconeDemoVisivel(false);
        }
    }

    // ── Reset dos ícones de aspecto para a fase de negociação ─────────────────
    //
    // Redimensiona o _bgAspectos para exatamente 2 ícones (pessoas + lucro),
    // reposiciona os ícones centralizados dentro do novo retângulo,
    // e oculta o estoque que não participa da negociação.

    _resetarIconesNegociacao() {
        // Mesma lógica da sondagem: mostra o bg e os ícones relevantes,
        // oculta apenas o estoque. Não tenta redimensionar nem reposicionar nada.
        const iconeH  = 24;
        const largura = 48;

        const dEstoque = this._iconesAspectos['estoque'];
        if (dEstoque) dEstoque.obj.setVisible(false);

        for (const aspecto of ['pessoas', 'lucro']) {
            const d     = this._iconesAspectos[aspecto];
            const chave = `sondagem_${aspecto}_interrogacao`;
            if (!d) continue;

            if (this.textures.exists(chave) && d.obj.setTexture) {
                d.obj.setTexture(chave);
            } else if (d.obj.setFillStyle) {
                d.obj.setFillStyle(0x333333);
            }

            if (d.obj.setDisplaySize) d.obj.setDisplaySize(largura, iconeH);
            else d.obj.setScale(1);

            d.obj.setVisible(true);
        }

        this._bgAspectos?.setVisible(true);
    }

    // ── Revelar ícone de aspecto — sobrescreve a base para garantir o tamanho ─
    //
    // A base faz setTexture mas não chama setDisplaySize depois, o que faz a
    // imagem assumir seu tamanho natural (geralmente muito maior).
    // Aqui forçamos as dimensões corretas logo após a troca de textura.

    _revelarIconeAspecto(aspecto) {
        const d = this._iconesAspectos[aspecto];
        if (!d) return;

        const valor = this.aspectosCliente[aspecto];
        const chave = `sondagem_${aspecto}_${valor}`;

        if (this.textures.exists(chave) && d.obj.setTexture) {
            d.obj.setTexture(chave);
            if (d.obj.setDisplaySize) d.obj.setDisplaySize(48, 24);
        } else if (d.obj.setFillStyle) {
            d.obj.setFillStyle(0x22cc66);
        }

        this.tweens.add({
            targets:  d.obj,
            scaleX:   1.3,
            scaleY:   1.3,
            duration: 150,
            yoyo:     true,
            ease:     'Back.easeOut',
        });
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
                dialogoAcerto: 'Sou a Julia.',
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
        const pool = [
            new CartaDemonstracao({ key: 'CieloLioOn',       pessoas: 'alto',  lucro: 'baixo', estoque: 'alto'  }), // carta correta
            new CartaDemonstracao({ key: 'CieloFlash',       pessoas: 'alto',  lucro: 'baixo', estoque: 'baixo' }),
            new CartaDemonstracao({ key: 'CrediarioDigital', pessoas: 'alto',  lucro: 'baixo', estoque: 'baixo' }),
            new CartaDemonstracao({ key: 'LioOnGestao',      pessoas: 'baixo', lucro: 'baixo', estoque: 'alto'  }),
            new CartaDemonstracao({ key: 'LioOnApps',        pessoas: 'alto',  lucro: 'alto',  estoque: 'baixo' }),
            new CartaDemonstracao({ key: 'CieloTap',         pessoas: 'alto',  lucro: 'alto',  estoque: 'baixo' }),
            new CartaDemonstracao({ key: 'CieloZip',         pessoas: 'baixo', lucro: 'alto',  estoque: 'alto'  }),
            new CartaDemonstracao({ key: 'FlashRecarga',     pessoas: 'baixo', lucro: 'alto',  estoque: 'baixo' }),
        ];

        const correta = pool[0];
        const demais  = Phaser.Utils.Array.Shuffle(pool.slice(1));
        const cartas  = Phaser.Utils.Array.Shuffle([correta, ...demais.slice(0, 3)]);
        this._distribuirCartas(cartas);
    }

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
            this._acenderIconeDemo();
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
                // Acende o ícone de aspecto correspondente — mesmo sistema da sondagem
                const aspecto = CONDICAO_PARA_ASPECTO[carta.condicao];
                if (aspecto) this._revelarIconeAspecto(aspecto);
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

    _cenaDeRetorno() { return 'PraiaDosProveitos'; }
}