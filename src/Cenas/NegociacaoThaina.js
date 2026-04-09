import CenaNegociacao    from '../Classes/CenaNegociacao.js';
import CartaAbordagem    from '../Classes/FasesNegociacao/CartaAbordagem.js';
import CartaSondagem     from '../Classes/FasesNegociacao/CartaSondagem.js';
import CartaDemonstracao from '../Classes/FasesNegociacao/CartaDemonstracao.js';
import Insignia          from '../Classes/Insignia.js';

// ─────────────────────────────────────────────────────────────────────────────
// NegociacaoThaina.js — Cliente da Vila do Varejo
//
// CONTEXTO: Thaina é dona de um estabelecimento com problemas de falha
// técnica / travamento na maquininha atual.
//
// FASES: abordagem (PIFE+CPC) → sondagem (aspectos) → demonstracao (produtos)
//
// ASPECTOS DA THAINA:
//   pessoas: 'alto'   — atende muito movimento, precisa de estabilidade
//   lucro:   'medio'  — margem razoável, mas perde venda quando a máquina trava
//   estoque: 'alto'   — giro alto, precisa de maquininha que não falhe no pico
//
// COERÊNCIA NARRATIVA:
//   Se o jogador revelou o aspecto 'estoque' ou 'lucro' na sondagem, a dor de
//   falha técnica foi identificada. Nesse caso CieloFlash2 (multiconexão + IA
//   anti-falhas) dá bônus máximo; produtos irrelevantes penalizam a satisfação.
//   Sem a dor revelada, todos os produtos valem igual.
// ─────────────────────────────────────────────────────────────────────────────


export default class NegociacaoThaina extends CenaNegociacao {
    constructor() {
        super('NegociacaoThaina', {
            nomeCliente:       'thaina',
            satisfacaoInicial: 0,
            fases:             ['abordagem', 'sondagem', 'demonstracao'],
        });

        // Aspectos reais da Thaina — revelados na sondagem
        this.aspectosCliente = {
            pessoas: 'alto',
            lucro:   'medio',
            estoque: 'alto',
        };

    }

    // ── Preload ───────────────────────────────────────────────────────────────

    preload() {
        super.preload();
        this.load.image('thaina_fundo',      'assets/NPC/Thaina/casa_thaina_negociacao.png');
        this.load.image('thaina_satisfeito', 'assets/NPC/Thaina/thaina_feliz.png');
        this.load.image('thaina_neutro',     'assets/NPC/Thaina/thaina_neutra.png');
        this.load.image('thaina_bravo',      'assets/NPC/Thaina/thaina_raiva.png');
        Insignia.preload(this);
    }

    // ── Insígnia e vitória ────────────────────────────────────────────────────

    _aoVencer() {
        const insignia = new Insignia(this, 'vila_varejo');
        insignia.conceder();
    }

    _chaveVitoria() { return 'varejo_vencido'; }

    // ── Cartas da abordagem (sistema PIFE + CPC) ──────────────────────────────

    _getCartasAbordagem() {
        return [
            // ── P: Propósito ──
            new CartaAbordagem({
                key:           'Proximidade',
                letra:         'P',
                correta:       true,
                dialogoAcerto: 'Pode falar! Sou a Thaina, dona daqui. O que você tem pra mim?',
                dialogoErro:   'Não entendi o que você veio fazer aqui.',
            }),

            // ── I: Identificação ──
            new CartaAbordagem({
                key:           'Interesse',
                letra:         'I',
                correta:       true,
                dialogoAcerto: 'Ah, conhece o pessoal daqui? Boa referência!',
                dialogoErro:   'Isso não tem nada a ver com o meu negócio.',
            }),

            // ── F: Foco ──
            new CartaAbordagem({
                key:           'Familiaridade',
                letra:         'F',
                correta:       true,
                dialogoAcerto: 'Gostei, você não chegou só pra empurrar produto. Pode continuar.',
                dialogoErro:   'Parece que você só quer me vender algo.',
            }),

            // ── E: Empatia ──
            new CartaAbordagem({
                key:           'Empatia',
                letra:         'E',
                correta:       true,
                dialogoAcerto: 'É, dá pra ver que você entende o que é trabalhar no varejo.',
                dialogoErro:   'Isso não se aplica ao meu caso.',
            }),

            // ── CPC: Contato com Pessoa Certa ──
            // Só fica disponível após P, I, F e E preenchidos
            new CartaAbordagem({
                key:           'CPC',
                letra:         'CPC',
                correta:       true,
                dialogoAcerto: 'Ótimo! Você está falando com a pessoa certa. Vamos ao que interessa.',
                dialogoErro:   '',
            }),
        ];
    }

    // ── Cartas da sondagem (sistema de aspectos) ──────────────────────────────

    _getCartasSondagem() {
        return [
            // ── Pessoas ──
        

            // ── Lucro ──
            new CartaSondagem({
                key:           'LucroCerto',
                aspecto:       'lucro',
                correta:       true,
                dialogoAcerto: 'Minha margem tá razoável, mas quando a maquininha trava no pico eu perco venda mesmo.',
                dialogoErro:   'Essa pergunta não faz sentido pra mim agora.',
            }),

            // ── Estoque ──
            new CartaSondagem({
                key:           'LucroErrado',
                aspecto:       'lucro',
                correta:       false,
                dialogoAcerto: 'Meu giro é alto! E é exatamente no pico que a maquininha resolve travar.',
                dialogoErro:   'Não entendo o que você quer saber com isso.',
            }),

            // ── Erradas ──
            new CartaSondagem({
                key:           'Movimento',
                aspecto:       'pessoas',
                correta:       true,
                dialogoAcerto: '',
                dialogoErro:   'Isso não é relevante pra minha operação.',
            }),

            new CartaSondagem({
                key:           'EstoqueErrado',
                aspecto:       'estoque',
                correta:       false,
                dialogoAcerto: '',
                dialogoErro:   'Não gosto desse tipo de abordagem.',
            }),

            new CartaSondagem({
                key:           'EstoqueCerto',
                aspecto:       'estoque',
                correta:       true,
                dialogoAcerto: 'Tenho um estoque bem controlado, o que me permite oferecer produtos de qualidade.',
                dialogoErro:   'Não gosto desse tipo de abordagem.',
            }),
        ];
    }

    // ── Fase de demonstração ──────────────────────────────────────────────────
    // O Pedro não tem demonstração — toda essa lógica é exclusiva da Thaina.
    // Sobrescrevemos _iniciarFase() apenas para injetar a distribuição de
    // produtos e o contador depois que super._iniciarFase() rodar normalmente.

    _iniciarFase() {
        super._iniciarFase();

        if (this.clienteConfig.fases[this.faseAtual] === 'demonstracao') {
            this._distribuirCartasDemonstracao();
        }
    }

    _distribuirCartasDemonstracao() {
        // Thaina: aspectosCliente = { pessoas: 'alto', lucro: 'medio', estoque: 'alto' }
        // A carta correta tem os 3 atributos certos. As demais têm 0, 1 ou 2 acertos.
        const pool = [
            new CartaDemonstracao({ key: 'CieloFlash2',      pessoas: 'alto',  lucro: 'medio', estoque: 'alto'  }), // 3/3 — correta
            new CartaDemonstracao({ key: 'CrediarioDigital', pessoas: 'alto',  lucro: 'medio', estoque: 'baixo' }), // 2/3 — -10
            new CartaDemonstracao({ key: 'CVBA',             pessoas: 'baixo', lucro: 'medio', estoque: 'alto'  }), // 2/3 — -10
            new CartaDemonstracao({ key: 'CieloFlash',       pessoas: 'alto',  lucro: 'baixo', estoque: 'alto'  }), // 2/3 — -10
            new CartaDemonstracao({ key: 'CieloLioOn',       pessoas: 'alto',  lucro: 'medio', estoque: 'baixo' }), // 2/3 — -10
            new CartaDemonstracao({ key: 'LioOnGestao',      pessoas: 'baixo', lucro: 'medio', estoque: 'alto'  }), // 2/3 — -10
            new CartaDemonstracao({ key: 'LioOnApps',        pessoas: 'alto',  lucro: 'alto',  estoque: 'baixo' }), // 1/3 — -20
            new CartaDemonstracao({ key: 'CieloTap',         pessoas: 'alto',  lucro: 'alto',  estoque: 'baixo' }), // 1/3 — -20
            new CartaDemonstracao({ key: 'CieloZip',         pessoas: 'baixo', lucro: 'alto',  estoque: 'alto'  }), // 1/3 — -20
            new CartaDemonstracao({ key: 'Antecipacao',      pessoas: 'baixo', lucro: 'alto',  estoque: 'baixo' }), // 0/3 — -30
            new CartaDemonstracao({ key: 'FlashRecarga',     pessoas: 'baixo', lucro: 'alto',  estoque: 'baixo' }), // 0/3 — -30
            new CartaDemonstracao({ key: 'MoedaEstrangeira', pessoas: 'baixo', lucro: 'alto',  estoque: 'baixo' }), // 0/3 — -30
        ];

        const correta = pool[0];
        const demais  = Phaser.Utils.Array.Shuffle(pool.slice(1));
        const cartas  = Phaser.Utils.Array.Shuffle([correta, ...demais.slice(0, 3)]);
        this._distribuirCartas(cartas);
    }

    _mostrarDetalheCarta(carta) {
        if (!this.negociacaoAtiva || this.cartaEmDetalhes) return;

        const fase = this.clienteConfig.fases[this.faseAtual];
        if (fase !== 'demonstracao') {
            super._mostrarDetalheCarta(carta);
            return;
        }

        this._abrirModalApresentar(carta, () => this._apresentarProduto(carta));
    }

    _abrirModalApresentar(carta, aoSelecionar) {
        this.cartaEmDetalhes = carta;

        const W = this.scale.width;
        const H = this.scale.height;
        const { LAYERS } = CenaNegociacao;

        const overlay   = this.add.rectangle(0, 0, W, H, 0x000000, 0.7).setOrigin(0, 0).setDepth(LAYERS.OVERLAY).setInteractive();
        const cartaZoom = this._criarFundoCartaZoom(W / 2, H / 2, carta.key);
        cartaZoom.setDepth(LAYERS.MODAL);

        const { btn: btnVoltar,     texto: textoVoltar     } = this._criarBotao(40, 40, 100, 50, 'VOLTAR',      0x1a3a5a, 0xcc4444, '#ff6666');
        const { btn: btnSelecionar, texto: textoSelecionar } = this._criarBotao(W / 2, H / 2 + 320, 220, 50, 'APRESENTAR', 0x1a4a2a, 0x22cc66, '#22cc66');

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
            this._mostrarDialogo('Esse resolve! A IA prevê falhas antes de acontecer. Era exatamente isso que eu precisava.');
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
        if (acertos === 2) return 'Até resolve algumas coisas, mas não é o que eu preciso pra evitar o travamento.';
        if (acertos === 1) return 'Não é isso. Quase nada aqui se aplica ao meu problema.';
        return 'Isso não tem nada a ver com o que eu tô passando.';
    }

    // ── Falas ─────────────────────────────────────────────────────────────────

    _falaInicioFase(fase) {
        const falas = {
            abordagem:    'Oi, tô ocupada aqui, mas pode falar.',
            sondagem:     'Tá bom, me conta. O que você tem pra me oferecer?',
            demonstracao: 'Minha maquininha trava toda hora. Me mostre o produto certo pra resolver isso.',
        };
        return falas[fase] ?? 'O que você tem a me apresentar?';
    }

    // ── Retorno de cena ───────────────────────────────────────────────────────

    _cenaDeRetorno() { return 'VilaDoVarejo'; }
}