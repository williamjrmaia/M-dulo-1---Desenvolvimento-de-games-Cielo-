import CenaNegociacao from '../Classes/CenaNegociacao.js';
import CartaAbordagem from '../Classes/FasesNegociacao/CartaAbordagem.js';
import CartaSondagem  from '../Classes/FasesNegociacao/CartaSondagem.js';
import Insignia       from '../Classes/Insignias.js';

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

const PONTUACAO_PRODUTO_FALHA = {
    CieloFlash2:      30, // resolve diretamente o travamento
    Antecipacao:       0,
    CrediarioDigital:  0,
    CVBA:              0,
    CieloFlash:        0,
    FlashRecarga:      0,
    CieloLioOn:        0,
    LioOnApps:         0,
    LioOnGestao:       0,
    MoedaEstrangeira:  0,
    CieloTap:          0,
    CieloZip:          0,
};

const PRODUTOS_NECESSARIOS = 3;

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

        // Produtos escolhidos na fase de demonstração
        this._produtosSelecionados = [];
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
        const insignia = new Insignia(this, 'produto1');
        insignia.conceder();
    }

    _chaveVitoria() { return 'varejo_vencido'; }

    // ── Pontuação dinâmica (depende dos aspectos revelados na sondagem) ───────

    _getPontuacaoCarta(key) {
        return this._dorFalhaRevelada()
            ? (PONTUACAO_PRODUTO_FALHA[key]  ?? 0)
            : (PONTUACAO_PRODUTO_PADRAO[key] ?? 0);
    }

    // A dor de falha técnica é revelada quando o jogador sonda 'estoque' ou 'lucro'
    _dorFalhaRevelada() {
        return this._aspectosRevelados.has('estoque') || this._aspectosRevelados.has('lucro');
    }

    _produtoEstaErrado(key) {
        if (!this._dorFalhaRevelada()) return false;
        return key !== 'CieloFlash2';
    }

    // ── Cartas da abordagem (sistema PIFE + CPC) ──────────────────────────────

    _getCartasAbordagem() {
        return [
            // ── P: Propósito ──
            new CartaAbordagem({
                key:           'DiretoAoPonto',
                letra:         'P',
                correta:       true,
                dialogoAcerto: 'Pode falar! Sou a Thaina, dona daqui. O que você tem pra mim?',
                dialogoErro:   'Não entendi o que você veio fazer aqui.',
            }),

            // ── I: Identificação ──
            new CartaAbordagem({
                key:           'GanchoSocial',
                letra:         'I',
                correta:       true,
                dialogoAcerto: 'Ah, conhece o pessoal daqui? Boa referência!',
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
                key:           'Proatividade',
                letra:         'E',
                correta:       true,
                dialogoAcerto: 'É, dá pra ver que você entende o que é trabalhar no varejo.',
                dialogoErro:   'Isso não se aplica ao meu caso.',
            }),

            // ── Cartas erradas ──
            new CartaAbordagem({
                key:           'DesarmeElegante',
                letra:         'P',
                correta:       false,
                dialogoAcerto: '',
                dialogoErro:   'Não gostei dessa abordagem, não.',
            }),

            new CartaAbordagem({
                key:           'Problematica',
                letra:         'I',
                correta:       false,
                dialogoAcerto: '',
                dialogoErro:   'Isso me deixou desconfortável.',
            }),

            // ── CPC: Contato com Pessoa Certa ──
            // Só fica disponível após P, I, F e E preenchidos
            new CartaAbordagem({
                key:           'ParceriaEstrategica',
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
            new CartaSondagem({
                key:           'PerguntaDeImpacto',
                aspecto:       'pessoas',
                correta:       true,
                dialogoAcerto: 'Atendo bastante gente, especialmente nos fins de semana. É bem movimentado.',
                dialogoErro:   'Não entendi o que você quer saber com isso.',
            }),

            // ── Lucro ──
            new CartaSondagem({
                key:           'GanchoDaDor',
                aspecto:       'lucro',
                correta:       true,
                dialogoAcerto: 'Minha margem tá razoável, mas quando a maquininha trava no pico eu perco venda mesmo.',
                dialogoErro:   'Essa pergunta não faz sentido pra mim agora.',
            }),

            // ── Estoque ──
            new CartaSondagem({
                key:           'SondagemDeFluxo',
                aspecto:       'estoque',
                correta:       true,
                dialogoAcerto: 'Meu giro é alto! E é exatamente no pico que a maquininha resolve travar.',
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
    // O Pedro não tem demonstração — toda essa lógica é exclusiva da Thaina.
    // Sobrescrevemos _iniciarFase() apenas para injetar a distribuição de
    // produtos e o contador depois que super._iniciarFase() rodar normalmente.

    _iniciarFase() {
        this._produtosSelecionados = [];
        this._contadorTexto        = null;
        super._iniciarFase();

        if (this.clienteConfig.fases[this.faseAtual] === 'demonstracao') {
            this._distribuirCartasDemonstracao();
            this._criarContadorProdutos();
        }
    }

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

    // Sobrescreve o clique nas cartas para a fase de demonstração
    _mostrarDetalheCarta(carta) {
        if (!this.negociacaoAtiva || this.cartaEmDetalhes) return;

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

        const overlay   = this.add.rectangle(0, 0, W, H, 0x000000, 0.7).setOrigin(0, 0).setDepth(LAYERS.OVERLAY).setInteractive();
        const cartaZoom = this._criarFundoCartaZoom(W / 2, H / 2, carta.key);
        cartaZoom.setDepth(LAYERS.MODAL);

        const restantes  = PRODUTOS_NECESSARIOS - this._produtosSelecionados.length;
        const labelBotao = restantes === 1 ? 'APRESENTAR (último!)' : `APRESENTAR (faltam ${restantes})`;

        const { btn: btnVoltar,     texto: textoVoltar     } = this._criarBotao(40, 40, 100, 50, 'VOLTAR',   0x1a3a5a, 0xcc4444, '#ff6666');
        const { btn: btnSelecionar, texto: textoSelecionar } = this._criarBotao(W / 2, H / 2 + 320, 220, 50, labelBotao, 0x1a4a2a, 0x22cc66, '#22cc66');

        btnVoltar.setDepth(LAYERS.MODAL);     textoVoltar.setDepth(LAYERS.MODAL_BTN);
        btnSelecionar.setDepth(LAYERS.MODAL); textoSelecionar.setDepth(LAYERS.MODAL_BTN);

        const fecharModal = () => {
            [overlay, cartaZoom, btnVoltar, textoVoltar, btnSelecionar, textoSelecionar].forEach(o => o.destroy());
            this.cartaEmDetalhes = null;
        };

        btnVoltar.on('pointerover', () => btnVoltar.setFillStyle(0x2a4a6a));
        btnVoltar.on('pointerout',  () => btnVoltar.setFillStyle(0x1a3a5a));
        btnVoltar.on('pointerdown', fecharModal);

        btnSelecionar.on('pointerover', () => btnSelecionar.setFillStyle(0x2a6a3a));
        btnSelecionar.on('pointerout',  () => btnSelecionar.setFillStyle(0x1a4a2a));
        btnSelecionar.on('pointerdown', () => { fecharModal(); this._apresentarProduto(carta); });
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
                const msg = this._dorFalhaRevelada() && carta.key === 'CieloFlash2'
                    ? `Esse resolve! A IA prevê falhas antes de acontecer. Me mostra mais ${faltam}.`
                    : `Produto apresentado! Continue mostrando mais ${faltam}.`;
                this._mostrarDialogo(msg);
            }
        }

        if (this._produtosSelecionados.length < PRODUTOS_NECESSARIOS) return;

        this.negociacaoAtiva = false;
        if (this.satisfacao <= 0) { this._perderNegociacao(); return; }

        this._mostrarDialogo('Gostei! Pelo menos um desses resolve meu problema.');
        this.time.delayedCall(4000, () => {
            this.negociacaoAtiva = true;
            this._avancarOuVencer();
        });
    }

    // ── Contador visual de produtos ───────────────────────────────────────────

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
        if (this._contadorTexto) this._contadorTexto.setText(this._textoContador());
    }

    // ── Falas ─────────────────────────────────────────────────────────────────

    _falaInicioFase(fase) {
        const falas = {
            abordagem:    'Oi, tô ocupada aqui, mas pode falar.',
            sondagem:     'Tá bom, me conta. O que você tem pra me oferecer?',
            demonstracao: `Minha maquininha trava toda hora. Me mostre ${PRODUTOS_NECESSARIOS} opções que possam resolver isso.`,
        };
        return falas[fase] ?? 'O que você tem a me apresentar?';
    }

    // ── Retorno de cena ───────────────────────────────────────────────────────

    _cenaDeRetorno() { return 'VilaDoVarejo'; }
}