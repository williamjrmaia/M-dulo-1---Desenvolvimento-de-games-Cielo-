import CenaNegociacao from './CenaNegociacao.js';

export default class NegociacaoPedro extends CenaNegociacao {
    constructor() {
       super('NegociacaoPedro', {
           nomeCliente:       'pedro',   // ← define pasta e chaves dos assets
           satisfacaoInicial: 50,       // 0 a 100
           cartasExigidas: {
                abordagem:    ['DiretoAoPonto', 'GanchoSocial', 'AntiPitch'],
                sondagem:     ['PerguntaDeImpacto', 'GanchoDaDor'],
                demonstracao: ['carta_maquininha'],
                negociacao:   ['carta_desconto'],
                fechamento:   ['carta_contrato'],
           },
           cartasPorFase: {
                abordagem:    5,
                sondagem:     4,
                produtos:     4,
                demonstracao: 3,
                negociacao:   3,
                fechamento:   3,
           },
       });
       this.cartaEmDetalhes = null; // Armazena qual carta está sendo visualizada
    }
    preload() {
           super.preload(); // ← SEMPRE chame o super
           
           // Cartas de Abordagem
           this.load.image('AntiPitch', 'assets/Cartas/Abordagem/AntiPitch.png'); 
           this.load.image('ComparacaoInteligente', 'assets/Cartas/Abordagem/ComparacaoInteligente.png'); 
           this.load.image('DesarmeElegante', 'assets/Cartas/Abordagem/DesarmeElegante.png'); 
           this.load.image('DiretoAoPonto', 'assets/Cartas/Abordagem/DiretoAoPonto.png'); 
           this.load.image('GanchoSocial', 'assets/Cartas/Abordagem/GanchoSocial.png');

           // Cartas de Sondagem
           this.load.image('AutoridadeImplicita', 'assets/Cartas/Sondagem/AutoridadeImplicita.png');
           this.load.image('ChaveDeExclusividade', 'assets/Cartas/Sondagem/ChaveDeExclusividade.png');
           this.load.image('Cliffhanger', 'assets/Cartas/Sondagem/Cliffhanger.png');
           this.load.image('GanchoDaDor', 'assets/Cartas/Sondagem/GanchoDaDor.png');
           this.load.image('LoboCurioso', 'assets/Cartas/Sondagem/LoboCurioso.png');
           this.load.image('PerguntaDeImpacto', 'assets/Cartas/Sondagem/PerguntaDeImpacto.png');
    }

    //Personalize as falas do cliente
    _falaInicioFase(fase) {
        const falas = {
            abordagem:  "Olá, boa tarde! Em que posso ajudar?",
            sondagem:   "Pois é, os negócios estão indo, mas sinto que poderia ser melhor.",
            demonstracao: "Ah, essa maquininha parece ser interesante. O que ela faz de bom?",
            negociacao: "O serviço é bom, mas esse custo está alto para o meu bolso.",
            fechamento: "Bom, se os termos forem esses, podemos assinar."
        };
        return falas[fase] || "Pode continuar...";
    }
    // Quando o jogador usa as cartas certas

    _falaAcertoFase(fase) {
        const falas = {
            abordagem: "Claro, sou o dono do estabelecimento! Me chamo Pedro.",
            sondagem: "Entendi, isso faz bastante sentido. Continue...",
        };
        return falas[fase] || "Pode continuar";
    }
    _falaErroFase(fase)   {
         const falas = {
            abordagem: "Não estou interessado nisso. Obrigado.",
            sondagem: "Hm, isso não responde muito bem à minha situação.",
        };
        return falas[fase] || "Não entendi sua estratégia";
    }

    _getCartasDaFase(fase, quantidade) {
        // Define todas as cartas disponíveis por fase
        const todasCartas = {
            abordagem: ['DiretoAoPonto', 'GanchoSocial', 'AntiPitch', 'ComparacaoInteligente', 'DesarmeElegante'],
            sondagem: ['PerguntaDeImpacto', 'GanchoDaDor', 'AutoridadeImplicita', 'ChaveDeExclusividade', 'Cliffhanger', 'LoboCurioso'],
            demonstracao: ['carta_maquininha'],
            negociacao: ['carta_desconto'],
            fechamento: ['carta_contrato'],
        };

        const cartasExigidas = this.clienteConfig.cartasExigidas[fase] || [];
        const cartasDisponiveis = todasCartas[fase] || [];
        const cartas = [];

        // Embaralhar e pegar cartas
        const cartasEmbaralhadas = Phaser.Utils.Array.Shuffle([...cartasDisponiveis]);
        
        for (let i = 0; i < quantidade; i++) {
            const cartaKey = cartasEmbaralhadas[i] || `carta_${fase}_${i}`;
            
            cartas.push({
                key: cartaKey,
                label: cartaKey,
                descricao: 'Estratégia de vendas',
                fase,
                obrigatoria: cartasExigidas.includes(cartaKey),
            });
        }

        return cartas;
    }

    _distribuirCartas(cartas) {
        const W       = this.scale.width;
        const H       = this.scale.height;
        const cardW   = 270;
        const cardH   = 330;
        const spacing = 25;
        const totalW  = cartas.length * cardW + (cartas.length - 1) * spacing;
        const startX  = (W - totalW) / 2;
        const y       = H * 0.78;

        this.cartasNaMao = [];

        cartas.forEach((carta, i) => {
            const x = startX + i * (cardW + spacing) + cardW / 2;

            // Tenta carregar a imagem da carta, caso contrário usa placeholder
            const bg = this.textures.exists(carta.key) 
                ? this.add.image(x, y, carta.key).setDisplaySize(cardW, cardH)
                : this.add.rectangle(x, y, cardW, cardH, 0x0d1f2e).setStrokeStyle(2, 0x1a4a6a);

            bg.setInteractive({ useHandCursor: true });

            bg.setAlpha(0);
            this.tweens.add({ targets: [bg], alpha: 1, duration: 300, delay: i * 80 });

            bg.on('pointerover', () => {
                if (!carta._selecionada) {
                    this.tweens.add({ targets: [bg], y: `-=8`, duration: 100 });
                }
            });
            bg.on('pointerout', () => {
                if (!carta._selecionada) {
                    this.tweens.add({ targets: [bg], y: `+=8`, duration: 100 });
                }
            });
            bg.on('pointerdown', () => this._mostrarDetalheCarta(carta, bg));

            carta._selecionada = false;
            carta._objetos     = { bg };
            this.cartasNaMao.push(carta);
            this.grupoCartas.addMultiple([bg]);
        });
    }

    _mostrarDetalheCarta(carta, bg) {
        const W = this.scale.width;
        const H = this.scale.height;

        // Criar overlay semi-transparente
        const overlay = this.add.rectangle(0, 0, W, H, 0x000000, 0.7).setOrigin(0, 0).setDepth(1000);
        overlay.setInteractive();

        // Carta ampliada no centro
        const cartaZoom = this.textures.exists(carta.key) 
            ? this.add.image(W / 2, H / 2, carta.key).setDisplaySize(400, 550)
            : this.add.rectangle(W / 2, H / 2, 400, 550, 0x0d1f2e).setStrokeStyle(2, 0x1a4a6a);
        
        cartaZoom.setDepth(1001);

        // Botão Voltar (canto superior esquerdo)
        const btnVoltar = this.add.rectangle(40, 40, 100, 50, 0x1a3a5a)
            .setStrokeStyle(2, 0xcc4444)
            .setInteractive({ useHandCursor: true })
            .setDepth(1001);

        const textoVoltar = this.add.text(40, 40, '◀ VOLTAR', {
            fontFamily: '"Courier New", monospace',
            fontSize: '14px',
            color: '#ff6666',
            letterSpacing: 1,
        }).setOrigin(0.5).setDepth(1002);

        // Botão Selecionar (abaixo da carta)
        const btnSelecionarBg = this.add.rectangle(W / 2, H / 2 + 320, 150, 50, 0x1a4a2a)
            .setStrokeStyle(2, 0x22cc66)
            .setInteractive({ useHandCursor: true })
            .setDepth(1001);

        const textoSelecionar = this.add.text(W / 2, H / 2 + 320, 'SELECIONAR ✓', {
            fontFamily: '"Courier New", monospace',
            fontSize: '12px',
            color: '#22cc66',
            letterSpacing: 1,
        }).setOrigin(0.5).setDepth(1002);

        // Interações dos botões
        btnVoltar.on('pointerover', () => btnVoltar.setFillStyle(0x2a4a6a));
        btnVoltar.on('pointerout', () => btnVoltar.setFillStyle(0x1a3a5a));
        btnVoltar.on('pointerdown', () => {
            overlay.destroy();
            cartaZoom.destroy();
            btnVoltar.destroy();
            textoVoltar.destroy();
            btnSelecionarBg.destroy();
            textoSelecionar.destroy();
            this.cartaEmDetalhes = null;
        });

        btnSelecionarBg.on('pointerover', () => btnSelecionarBg.setFillStyle(0x2a6a3a));
        btnSelecionarBg.on('pointerout', () => btnSelecionarBg.setFillStyle(0x1a4a2a));
        btnSelecionarBg.on('pointerdown', () => {
            // Selecionar a carta (add/remove de cartasSelecionadas)
            const jaEstaSelected = this.cartasSelecionadas.includes(carta);
            const fase = CenaNegociacao.FASES[this.faseAtual];
            const cartasExigidas = this.clienteConfig.cartasExigidas[fase] || [];
            const ehCartaObrigatoria = cartasExigidas.includes(carta.key);
            
            if (jaEstaSelected) {
                this.cartasSelecionadas = this.cartasSelecionadas.filter(c => c !== carta);
                textoSelecionar.setText('SELECIONAR ✓');
                btnSelecionarBg.setFillStyle(0x1a4a2a);
            } else {
                this.cartasSelecionadas.push(carta);
                textoSelecionar.setText('SELECIONADO ✓');
                btnSelecionarBg.setFillStyle(0x2a6a3a);

                // Em abordagem e sondagem: se selecionar uma carta obrigatória, avança para próxima fase
                if ((fase === 'abordagem' || fase === 'sondagem') && ehCartaObrigatoria) {
                    this.time.delayedCall(300, () => {
                        overlay.destroy();
                        cartaZoom.destroy();
                        btnVoltar.destroy();
                        textoVoltar.destroy();
                        btnSelecionarBg.destroy();
                        textoSelecionar.destroy();
                        this.cartaEmDetalhes = null;

                        // Avançar para próxima fase sem validar todas as cartas
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
                    });
                }
            }
        });

        // Mostrar estado inicial se a carta já está selecionada
        if (this.cartasSelecionadas.includes(carta)) {
            textoSelecionar.setText('SELECIONADO ✓');
            btnSelecionarBg.setFillStyle(0x2a6a3a);
        }

        this.cartaEmDetalhes = carta;
    }

    _cenaDeRetorno()      { 
        return 'MapaGelo'; 
    }
}