// ─────────────────────────────────────────────────────────────────────────────
// CenaNegociacao.js — Template base para todas as negociações do jogo
//
// COMO USAR: Nunca instancie diretamente. Crie uma subclasse por cliente:
//
//   import CenaNegociacao from './CenaNegociacao.js';
//
//   export default class NegociacaoJoao extends CenaNegociacao {
//       constructor() {
//           super('NegociacaoJoao', {
//               nomeCliente:       'joao',   // ← define pasta e chaves dos assets
//               satisfacaoInicial: 50,       // 0 a 100
//               cartasExigidas: {
//                   abordagem:    ['carta_cumprimento', 'carta_pessoa_certa'],
//                   sondagem:     ['carta_pergunta_negocio'],
//                   demonstracao: ['carta_maquininha'],
//                   negociacao:   ['carta_desconto'],
//                   fechamento:   ['carta_contrato'],
//               },
//               cartasPorFase: {
//                   abordagem:    5,
//                   sondagem:     4,
//                   demonstracao: 3,
//                   negociacao:   3,
//                   fechamento:   3,
//               },
//           });
//       }
//
//       preload() {
//           super.preload(); // ← SEMPRE chame o super
//           // Assets extras específicos deste cliente se precisar
//       }
//
//       // Personalize as falas do cliente
//       _falaInicioFase(fase) { ... }
//       _falaAcertoFase(fase) { ... }
//       _falaErroFase(fase)   { ... }
//       _cenaDeRetorno()      { return 'MundoCasa'; }
//   }
//
// ── ESTRUTURA DE ASSETS ESPERADA ──────────────────────────────────────────────
//
//   assets/CLIENTES/{nomeCliente}/fundo.png         ← background da loja
//   assets/CLIENTES/{nomeCliente}/satisfeito.png    ← sprite cliente feliz
//   assets/CLIENTES/{nomeCliente}/neutro.png        ← sprite cliente neutro
//   assets/CLIENTES/{nomeCliente}/bravo.png         ← sprite cliente bravo
//
// ─────────────────────────────────────────────────────────────────────────────

export default class CenaNegociacao extends Phaser.Scene {

    // ── Fases do funil de vendas ──────────────────────────────────────────────
    static FASES = ['abordagem', 'sondagem', 'demonstracao', 'negociacao', 'fechamento'];

    static LABELS_FASE = {
        
    };
    // Faixas de satisfação — definem qual sprite do cliente mostrar
    // 0–33: bravo | 34–66: neutro | 67–100: satisfeito
    static SATISFACAO_ESTADOS = [
        { min: 67, max: 100, estado: 'satisfeito', cor: 0x44cc88 },
        { min: 34, max: 66,  estado: 'neutro',     cor: 0xccaa44 },
        { min: 0,  max: 33,  estado: 'bravo',      cor: 0xcc4444 },
    ];

    // Quanto a satisfação muda por fase acertada/errada
    static GANHO_SATISFACAO = 20;
    static PERDA_SATISFACAO = 30;

    // ─────────────────────────────────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────────────────────────────────
    constructor(key, clienteConfig = {}) {
        super(key);

        this.clienteConfig = Object.assign({
            nomeCliente:       'default',
            satisfacaoInicial: 50,
            cartasExigidas:    {},
            cartasPorFase: {
                abordagem:    5,
                sondagem:     6,
                produtos:     4,
                negociacao:   3, 
                fechamento:   5,
            },
        }, clienteConfig);

        this.faseAtual          = 0;
        this.satisfacao         = this.clienteConfig.satisfacaoInicial;
        this.cartasNaMao        = [];
        this.cartasSelecionadas = [];
        this.negociacaoAtiva    = false;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // preload — carrega os 4 assets do cliente pelo nomeCliente
    // Subclasses devem chamar super.preload() primeiro
    // ─────────────────────────────────────────────────────────────────────────
    preload() {
        const nome = this.clienteConfig.nomeCliente;

       // this.load.image(`${nome}_fundo`,      `assets/CLIENTES/${nome}/fundo.png`);
       // this.load.image(`${nome}_satisfeito`, `assets/CLIENTES/${nome}/satisfeito.png`);
      //  this.load.image(`${nome}_neutro`,     `assets/CLIENTES/${nome}/neutro.png`);
       // this.load.image(`${nome}_bravo`,      `assets/CLIENTES/${nome}/bravo.png`);
        
        // Carrega as imagens das cartas base de Abordagem
        this.load.image('AntiPitch', 'assets/Cartas/Abordagem/AntiPitch.png');
        this.load.image('ComparacaoInteligente', 'assets/Cartas/Abordagem/ComparacaoInteligente.png');
        this.load.image('DesarmeElegante', 'assets/Cartas/Abordagem/DesarmeElegante.png');
        this.load.image('DiretoAoPonto', 'assets/Cartas/Abordagem/DiretoAoPonto.png');
        this.load.image('GanchoSocial', 'assets/Cartas/Abordagem/GanchoSocial.png');
        
        // Carrega as imagens das cartas de Sondagem
        this.load.image('AutoridadeImplicita', 'assets/Cartas/Sondagem/AutoridadeImplicita.png');
        this.load.image('ChaveDeExclusividade', 'assets/Cartas/Sondagem/ChaveDeExclusividade.png');
        this.load.image('Cliffhanger', 'assets/Cartas/Sondagem/Cliffhanger.png');
        this.load.image('GanchoDaDor', 'assets/Cartas/Sondagem/GanchoDaDor.png');
        this.load.image('LoboCurioso', 'assets/Cartas/Sondagem/LoboCurioso.png');
        this.load.image('PerguntaDeImpacto', 'assets/Cartas/Sondagem/PerguntaDeImpacto.png');

        // Assets de UI compartilhados — descomente quando tiver os arquivos
        // this.load.image('carta_fundo', 'assets/UI/CARTAS/carta_fundo.png');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // create
    // ─────────────────────────────────────────────────────────────────────────
    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this._criarFundo(W, H);
        this._criarAreaCliente(W, H);
        this._criarBarraSatisfacao(W, H);
        this._criarBarraFases(W, H);
        this._criarAreaCartas(W, H);
        this._criarBotaoConfirmar(W, H);
        this._criarDialogo(W, H);

        this.negociacaoAtiva = true;
        this._iniciarFase();

        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UI — Fundo da loja
    // ─────────────────────────────────────────────────────────────────────────
    _criarFundo(W, H) {
        const nome = this.clienteConfig.nomeCliente;

        if (this.textures.exists(`${nome}_fundo`)) {
            this.add.image(W / 2, H * 0.3, `${nome}_fundo`).setDisplaySize(W, H * 0.6);
        } else {
            // Placeholder enquanto não há assets
            this.add.rectangle(0, 0, W, H * 0.6, 0x111a24).setOrigin(0, 0);
        }

        // Faixa inferior (área das cartas) sempre escura
        this.add.rectangle(0, H * 0.58, W, H * 0.42, 0x0a0f14).setOrigin(0, 0);

        // Linha divisória
        const div = this.add.graphics();
        div.lineStyle(2, 0x2a4a6a, 0.8);
        div.lineBetween(0, H * 0.58, W, H * 0.58);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UI — Sprite do cliente + nome
    // ─────────────────────────────────────────────────────────────────────────
    _criarAreaCliente(W, H) {
        const nome         = this.clienteConfig.nomeCliente;
        const estadoInicial = this._getEstadoSatisfacao();
        const chaveInicial  = `${nome}_${estadoInicial}`;

        // Nome do cliente
        this.add.text(W / 2, H * 0.04, nome, {
            fontFamily: '"Courier New", monospace',
            fontSize: '26px',
            color: '#c8e6f0',
            letterSpacing: 4,
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        // Sprite do cliente
        if (this.textures.exists(chaveInicial)) {
            this.spriteCliente = this.add.image(W / 2, H * 0.28, chaveInicial).setScale(2.5);
        } else {
            // Placeholder
            this.spriteCliente = this.add.rectangle(W / 2, H * 0.28, 100, 150, 0x1a3a5a)
                .setStrokeStyle(2, 0x2a6a9a);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UI — Barra de satisfação visível
    // ─────────────────────────────────────────────────────────────────────────
    _criarBarraSatisfacao(W, H) {
        const barraW = 300;
        const barraH = 18;
        const x      = W - barraW / 2 - 40;
        const y      = H * 0.08;

        this.add.text(x, y - 18, 'SATISFAÇÃO', {
            fontFamily: '"Courier New", monospace',
            fontSize: '12px',
            color: '#5a8a9a',
            letterSpacing: 3,
        }).setOrigin(0.5);

        // Fundo da barra
        this.add.rectangle(x, y, barraW, barraH, 0x0a1520)
            .setStrokeStyle(1, 0x2a4a5a);

        // Preenchimento dinâmico
        this.barraSatisfacaoFill = this.add.rectangle(
            x - barraW / 2,
            y,
            barraW * (this.satisfacao / 100),
            barraH - 4,
            this._getCorSatisfacao()
        ).setOrigin(0, 0.5);

        // Valor numérico
        this.satisfacaoTexto = this.add.text(x, y + 20, `${this.satisfacao}%`, {
            fontFamily: '"Courier New", monospace',
            fontSize: '12px',
            color: '#7aaabb',
        }).setOrigin(0.5);

        // Guarda para uso nos updates
        this._barraSatisfacaoConfig = { x: x - barraW / 2, larguraTotal: barraW };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UI — Barra de progresso das 5 fases
    // ─────────────────────────────────────────────────────────────────────────
    _criarBarraFases(W, H) {
        const fases   = CenaNegociacao.FASES;
        const largura = W * 0.55;
        const startX  = (W - largura) / 2;
        const y       = H * 0.535;
        const passo   = largura / (fases.length - 1);

        this.indicadoresFase = [];

        fases.forEach((fase, i) => {
            const x = startX + i * passo;

            if (i < fases.length - 1) {
                const linha = this.add.graphics();
                linha.lineStyle(2, 0x1a3a5a, 1);
                linha.lineBetween(x, y, x + passo, y);
            }

            const circulo = this.add.circle(x, y, 13, 0x1a3a5a)
                .setStrokeStyle(2, 0x2a6a9a);

            this.add.text(x, y, `${i + 1}`, {
                fontFamily: '"Courier New", monospace',
                fontSize: '12px',
                color: '#4a8aaa',
            }).setOrigin(0.5);

            this.add.text(x, y + 22, CenaNegociacao.LABELS_FASE[fase], {
                fontFamily: '"Courier New", monospace',
                fontSize: '10px',
                color: '#3a6a7a',
            }).setOrigin(0.5);

            this.indicadoresFase.push(circulo);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UI — Área de cartas
    // ─────────────────────────────────────────────────────────────────────────
    _criarAreaCartas(W, H) {
        this.grupoCartas = this.add.group();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UI — Botão confirmar jogada
    // ─────────────────────────────────────────────────────────────────────────
    _criarBotaoConfirmar(W, H) {
        this.btnConfirmarBg = this.add.rectangle(W - 110, H - 45, 180, 48, 0x0d2a1a)
            .setStrokeStyle(2, 0x22aa55)
            .setInteractive({ useHandCursor: true })
            .setVisible(false);

        this.btnConfirmarTexto = this.add.text(W - 110, H - 45, 'CONFIRMAR ▶', {
            fontFamily: '"Courier New", monospace',
            fontSize: '15px',
            color: '#22cc66',
            letterSpacing: 2,
        }).setOrigin(0.5).setVisible(false);

        this.btnConfirmarBg.on('pointerover', () => this.btnConfirmarBg.setFillStyle(0x1a4a2a));
        this.btnConfirmarBg.on('pointerout',  () => this.btnConfirmarBg.setFillStyle(0x0d2a1a));
        this.btnConfirmarBg.on('pointerdown', () => this._confirmarJogada());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UI — Caixa de diálogo do cliente
    // ─────────────────────────────────────────────────────────────────────────
    _criarDialogo(W, H) {
        this.dialogoBg = this.add.rectangle(W / 2, H * 0.47, W * 0.45, 55, 0x060e14, 0.9)
            .setStrokeStyle(1, 0x2a5a7a);

        this.dialogoTexto = this.add.text(W / 2, H * 0.47, '', {
            fontFamily: '"Courier New", monospace',
            fontSize: '14px',
            color: '#a0c8d8',
            wordWrap: { width: W * 0.42 },
            align: 'center',
        }).setOrigin(0.5);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LÓGICA — Inicia a fase atual
    // ─────────────────────────────────────────────────────────────────────────
    _iniciarFase() {
        const fase      = CenaNegociacao.FASES[this.faseAtual];
        const numCartas = this.clienteConfig.cartasPorFase[fase] || 3;

        this._atualizarIndicadoresFase();
        this._mostrarDialogo(this._falaInicioFase(fase));
        this._limparCartas();
        this.cartasSelecionadas = [];

        const cartasDaFase = this._getCartasDaFase(fase, numCartas);
        this._distribuirCartas(cartasDaFase);

        this.btnConfirmarBg.setVisible(true);
        this.btnConfirmarTexto.setVisible(true);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LÓGICA — Retorna cartas da fase
    // Sobrescreva na subclasse para usar o deck real
    // ─────────────────────────────────────────────────────────────────────────
    _getCartasDaFase(fase, quantidade) {
        const cartas = [];
        for (let i = 0; i < quantidade; i++) {
            cartas.push({
                key:       `carta_placeholder_${fase}_${i}`,
                label:     `Carta ${i + 1}`,
                descricao: 'Descrição da carta.',
                fase,
            });
        }
        return cartas;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LÓGICA — Renderiza as cartas na mão
    // ─────────────────────────────────────────────────────────────────────────
    _distribuirCartas(cartas) {
        const W       = this.scale.width;
        const H       = this.scale.height;
        const cardW   = 130;
        const cardH   = 175;
        const spacing = 18;
        const totalW  = cartas.length * cardW + (cartas.length - 1) * spacing;
        const startX  = (W - totalW) / 2;
        const y       = H * 0.78;

        this.cartasNaMao = [];

        cartas.forEach((carta, i) => {
            const x = startX + i * (cardW + spacing) + cardW / 2;

            const bg = this.add.rectangle(x, y, cardW, cardH, 0x0d1f2e)
                .setStrokeStyle(2, 0x1a4a6a)
                .setInteractive({ useHandCursor: true });

            const label = this.add.text(x, y - 35, carta.label, {
                fontFamily: '"Courier New", monospace',
                fontSize: '13px',
                color: '#7ab8d0',
                wordWrap: { width: cardW - 16 },
                align: 'center',
            }).setOrigin(0.5);

            const desc = this.add.text(x, y + 15, carta.descricao, {
                fontFamily: '"Courier New", monospace',
                fontSize: '10px',
                color: '#3a6a7a',
                wordWrap: { width: cardW - 16 },
                align: 'center',
            }).setOrigin(0.5);

            [bg, label, desc].forEach(obj => obj.setAlpha(0));
            this.tweens.add({ targets: [bg, label, desc], alpha: 1, duration: 300, delay: i * 80 });

            bg.on('pointerover', () => {
                if (!carta._selecionada) {
                    bg.setFillStyle(0x1a2f3e);
                    this.tweens.add({ targets: [bg, label, desc], y: `-=8`, duration: 100 });
                }
            });
            bg.on('pointerout', () => {
                if (!carta._selecionada) {
                    bg.setFillStyle(0x0d1f2e);
                    this.tweens.add({ targets: [bg, label, desc], y: `+=8`, duration: 100 });
                }
            });
            bg.on('pointerdown', () => this._toggleCarta(carta, bg, label, desc));

            carta._selecionada = false;
            carta._objetos     = { bg, label, desc };
            this.cartasNaMao.push(carta);
            this.grupoCartas.addMultiple([bg, label, desc]);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LÓGICA — Seleciona/desseleciona carta
    // ─────────────────────────────────────────────────────────────────────────
    _toggleCarta(carta, bg, label, desc) {
        carta._selecionada = !carta._selecionada;

        if (carta._selecionada) {
            bg.setFillStyle(0x0d3a2e);
            bg.setStrokeStyle(2, 0x22cc66);
            label.setColor('#22cc66');
            this.cartasSelecionadas.push(carta);
        } else {
            bg.setFillStyle(0x0d1f2e);
            bg.setStrokeStyle(2, 0x1a4a6a);
            label.setColor('#7ab8d0');
            this.cartasSelecionadas = this.cartasSelecionadas.filter(c => c !== carta);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LÓGICA — Confirma jogada e valida cartas
    // ─────────────────────────────────────────────────────────────────────────
    _confirmarJogada() {
        if (!this.negociacaoAtiva) return;
        if (this.cartasSelecionadas.length === 0) {
            this._mostrarDialogo('Selecione ao menos uma carta para continuar.');
            return;
        }

        const fase     = CenaNegociacao.FASES[this.faseAtual];
        const exigidas = this.clienteConfig.cartasExigidas[fase] || [];
        const jogadas  = this.cartasSelecionadas.map(c => c.key);
        const acertou  = exigidas.length === 0 || exigidas.every(k => jogadas.includes(k));

        if (acertou) {
            this._acertarFase(fase);
        } else {
            this._errarFase(fase);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LÓGICA — Fase acertada
    // ─────────────────────────────────────────────────────────────────────────
    _acertarFase(fase) {
        this._mostrarDialogo(this._falaAcertoFase(fase));
        this._alterarSatisfacao(CenaNegociacao.GANHO_SATISFACAO);

        this.time.delayedCall(1800, () => {
            if (this.faseAtual < CenaNegociacao.FASES.length - 1) {
                this.faseAtual++;
                this._iniciarFase();
            } else {
                this._vencerNegociacao();
            }
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LÓGICA — Fase errada
    // ─────────────────────────────────────────────────────────────────────────
    _errarFase(fase) {
        this._mostrarDialogo(this._falaErroFase(fase));
        this._alterarSatisfacao(-CenaNegociacao.PERDA_SATISFACAO);

        this.time.delayedCall(2000, () => {
            this._perderNegociacao();
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LÓGICA — Altera satisfação e atualiza visuais
    // ─────────────────────────────────────────────────────────────────────────
    _alterarSatisfacao(delta) {
        this.satisfacao = Phaser.Math.Clamp(this.satisfacao + delta, 0, 100);
        this._atualizarBarraSatisfacao();
        this._atualizarSpriteCliente();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LÓGICA — Atualiza barra de satisfação
    // ─────────────────────────────────────────────────────────────────────────
    _atualizarBarraSatisfacao() {
        const { larguraTotal } = this._barraSatisfacaoConfig;

        this.tweens.add({
            targets:  this.barraSatisfacaoFill,
            width:    larguraTotal * (this.satisfacao / 100),
            duration: 400,
            ease:     'Quad.easeOut',
        });

        this.barraSatisfacaoFill.setFillStyle(this._getCorSatisfacao());
        this.satisfacaoTexto.setText(`${this.satisfacao}%`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LÓGICA — Troca sprite do cliente conforme satisfação
    // ─────────────────────────────────────────────────────────────────────────
    _atualizarSpriteCliente() {
        const nome  = this.clienteConfig.nomeCliente;
        const chave = `${nome}_${this._getEstadoSatisfacao()}`;

        if (!this.textures.exists(chave)) return;

        this.tweens.add({
            targets:    this.spriteCliente,
            alpha:      0,
            duration:   150,
            onComplete: () => {
                if (this.spriteCliente.setTexture) {
                    this.spriteCliente.setTexture(chave);
                }
                this.tweens.add({ targets: this.spriteCliente, alpha: 1, duration: 150 });
            },
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LÓGICA — Estado atual da satisfação (satisfeito / neutro / bravo)
    // ─────────────────────────────────────────────────────────────────────────
    _getEstadoSatisfacao() {
        for (const faixa of CenaNegociacao.SATISFACAO_ESTADOS) {
            if (this.satisfacao >= faixa.min && this.satisfacao <= faixa.max) {
                return faixa.estado;
            }
        }
        return 'neutro';
    }

    // Cor da barra baseada na satisfação atual
    _getCorSatisfacao() {
        for (const faixa of CenaNegociacao.SATISFACAO_ESTADOS) {
            if (this.satisfacao >= faixa.min && this.satisfacao <= faixa.max) {
                return faixa.cor;
            }
        }
        return 0xccaa44;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LÓGICA — Vitória
    // ─────────────────────────────────────────────────────────────────────────
    _vencerNegociacao() {
        this.negociacaoAtiva = false;
        this.btnConfirmarBg.setVisible(false);
        this.btnConfirmarTexto.setVisible(false);

        this._mostrarDialogo('✅ Negociação concluída com sucesso!');
        this.game.registry.set('ultimaNegociacao', 'vitoria');

        this.time.delayedCall(2000, () => {
            this.cameras.main.fadeOut(600, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start(this._cenaDeRetorno());
            });
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LÓGICA — Derrota
    // ─────────────────────────────────────────────────────────────────────────
    _perderNegociacao() {
        this.negociacaoAtiva = false;
        this.btnConfirmarBg.setVisible(false);
        this.btnConfirmarTexto.setVisible(false);

        this._mostrarDialogo('❌ Negociação perdida. Tente novamente.');
        this.game.registry.set('ultimaNegociacao', 'derrota');

        this.time.delayedCall(2000, () => {
            this.cameras.main.fadeOut(600, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start(this._cenaDeRetorno());
            });
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LÓGICA — Atualiza indicadores visuais das fases
    // ─────────────────────────────────────────────────────────────────────────
    _atualizarIndicadoresFase() {
        this.indicadoresFase.forEach((circulo, i) => {
            if (i < this.faseAtual) {
                circulo.setFillStyle(0x22aa55).setStrokeStyle(2, 0x44cc77);
            } else if (i === this.faseAtual) {
                circulo.setFillStyle(0x1a4a8a).setStrokeStyle(2, 0x4488ff);
                this.tweens.add({ targets: circulo, scaleX: 1.2, scaleY: 1.2, duration: 200, yoyo: true });
            } else {
                circulo.setFillStyle(0x1a3a5a).setStrokeStyle(2, 0x2a6a9a);
            }
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LÓGICA — Diálogo
    // ─────────────────────────────────────────────────────────────────────────
    _mostrarDialogo(texto) {
        this.dialogoTexto.setText(texto);
        this.dialogoTexto.setAlpha(0);
        this.tweens.add({ targets: this.dialogoTexto, alpha: 1, duration: 300 });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LÓGICA — Limpa cartas da tela
    // ─────────────────────────────────────────────────────────────────────────
    _limparCartas() {
        this.grupoCartas.clear(true, true);
        this.cartasNaMao = [];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HOOKS — Sobrescreva nas subclasses para personalizar falas e retorno
    // ─────────────────────────────────────────────────────────────────────────

    _falaInicioFase(fase) {
        const falas = {
            abordagem:    'Olá, posso ajudar?',
            sondagem:     'O que você tem a oferecer?',
            demonstracao: 'Me mostre o que você tem.',
            negociacao:   'Vamos falar de condições.',
            fechamento:   'Então, fechamos negócio?',
        };
        return falas[fase] || '...';
    }

    _falaAcertoFase(fase) {
        const falas = {
            abordagem:    'Boa abordagem! Pode continuar.',
            sondagem:     'Interessante. Me conta mais.',
            demonstracao: 'Gostei do produto.',
            negociacao:   'As condições parecem razoáveis.',
            fechamento:   'Fechado! Bem-vindo à Cielo.',
        };
        return falas[fase] || 'Muito bem!';
    }

    _falaErroFase(fase) {
        return 'Não acho que é isso que preciso agora. Até mais.';
    }

    _cenaDeRetorno() {
        return 'MundoCasa';
    }
}