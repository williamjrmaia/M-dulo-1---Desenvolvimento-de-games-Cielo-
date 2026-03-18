export default class CenaPersonagem extends Phaser.Scene {
    constructor() {
        super('CenaPersonagem');
        this.indexSelecionado  = 0;
    }

    preload() {
        // Carrega as animações idle das 4 skins
        this.load.spritesheet('man_whi', 'assets/PLAYER/MAN/WHITE/spr_player_man_front_idl_whi.png',   { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('man_bla', 'assets/PLAYER/MAN/BLACK/spr_player_man_front_idl_bla.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('woman_whi', 'assets/PLAYER/WOMAN/WHITE/spr_player_woman_front_idl_whi.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('woman_bla', 'assets/PLAYER/WOMAN/BLACK/spr_player_woman_front_idl_bla.png', { frameWidth: 64, frameHeight: 64 });
    }

    create() {
        const W = this.scale.width;   // 1500
        const H = this.scale.height;  // 800

        // Background
        this.add.rectangle(0, 0, W, H, 0x0a0a1a).setOrigin(0, 0);

        // Título "ESCOLHA SEU PERSONAGEM"
        this.add.text(W / 2, 80, 'ESCOLHA SEU PERSONAGEM', {
            fontFamily: '"Courier New", monospace',
            fontSize: '36px',
            color: '#d0f6ff',
            letterSpacing: 8,
            stroke: '#44cccc',
            strokeThickness: 4,
        }).setOrigin(0.5);

        // Linha embaixo do título
        const line = this.add.graphics();
        line.lineStyle(2, 0x6644cc, 1);
        line.lineBetween(W / 2 - 280, 110, W / 2 + 280, 110);
        line.lineStyle(1, 0x6644cc, 0.3);
        line.lineBetween(W / 2 - 380, 115, W / 2 + 380, 115);

        // Opção de personagem
        this.opcoes = [
            { key: 'man_whi',  frameEnd: 11 },
            { key: 'man_bla',   frameEnd: 11 },
            { key: 'woman_whi', frameEnd: 11 },
            { key: 'woman_bla',  frameEnd: 11 },
        ];


        this.cards      = [];   // retângulos atrás dos sprites
        this.previews   = [];   // sprites animados
        this.selecionar = this._selecionar.bind(this);

        const totalCards  = this.opcoes.length; //deixa modular a quantidade de opções
        const cardWidth   = 200;
        const cardHeight  = 260;
        const spacing     = 60;
        //Espaça automaticamente as opções
        const totalWidth  = totalCards * cardWidth + (totalCards - 1) * spacing;
        const startX      = (W - totalWidth) / 2;
        const cardY       = 320;

        this.opcoes.forEach((opcao, i) => {
            const cx = startX + i * (cardWidth + spacing) + cardWidth / 2;
            const cy = cardY;

            // Background carta
            const card = this.add.rectangle(cx, cy, cardWidth, cardHeight, 0x111133)
                .setStrokeStyle(2, 0x3333aa)
                .setInteractive({ useHandCursor: true });

            // Preview do personagem usa já sprites para ser mais bonito
            const animKey = `preview_${opcao.key}`;
            if (!this.anims.exists(animKey)) {
                this.anims.create({
                    key: animKey,
                    frames: this.anims.generateFrameNumbers(opcao.key, { start: 0, end: opcao.frameEnd }),
                    frameRate: 8,
                    repeat: -1,
                });
            }

            const sprite = this.add.sprite(cx, cy - 20, opcao.key)//colocar scale certa nos sprites
                .setScale(4.5)
                .play(animKey, true);

            // Checa o click
            card.on('pointerdown', () => this.selecionar(i));

            // aumenta o persongaem escolhido e muda a cor do bloco dele
            card.on('pointerover', () => {
                if (i !== this.indexSelecionado) {
                    card.setFillStyle(0x1a1a44);
                    this.tweens.add({ targets: sprite, scaleY: 4.8, scaleX: 4.8, duration: 120 });
                }
            });
            card.on('pointerout', () => {//caso mude de ideia, faz o oposto do acima
                if (i !== this.indexSelecionado) {
                    card.setFillStyle(0x111133);
                    this.tweens.add({ targets: sprite, scaleY: 4.5, scaleX: 4.5, duration: 120 });
                }
            });

            this.cards.push(card);
            this.previews.push(sprite);
        });



        // Input de nome
        this.add.text(W / 2, 530, 'SEU NOME:', {
            fontFamily: '"Courier New", monospace',
            fontSize: '20px',
            color: '#8877cc',
            letterSpacing: 4,
        }).setOrigin(0.5);

        // input estilizado em HTML
        this.nomeDigitado = '';

        const inputBg = this.add.rectangle(W / 2, 580, 340, 50, 0x0d0d22)
            .setStrokeStyle(2, 0x4433aa);

        this.inputText = this.add.text(W / 2, 580, 'Digite seu nome...', {
        fontFamily: '"Courier New", monospace',
        fontSize: '20px',
            color: '#554466',
        }).setOrigin(0.5);

// Código para escrita no Phaser
        this.input.keyboard.on('keydown', (event) => {
            if (event.keyCode === 8) {
                // Backspace
                this.nomeDigitado = this.nomeDigitado.slice(0, -1);
            } else if (event.keyCode === 13) {
                // Enter
                this._confirmar();
            } else if (this.nomeDigitado.length < 16 && event.key.length === 1) { // máx 16 chars; event.key.length===1 filtra teclas especiais (Shift, Alt...)
                this.nomeDigitado += event.key;
            }

            // atualiza com o nome do GN
            this.inputText.setText(this.nomeDigitado || 'Digite seu nome...');
            this.inputText.setColor(this.nomeDigitado ? '#e0d0ff' : '#445f66');
});

        // botão confirm (WIP)
        const btnBg = this.add.rectangle(W / 2, 680, 260, 55, 0x2a1a66)
            .setStrokeStyle(2, 0x7755ee)
            .setInteractive({ useHandCursor: true });

        const btnText = this.add.text(W / 2, 680, 'COMEÇAR', {
            fontFamily: '"Courier New", monospace',
            fontSize: '22px',
            color: '#ccbbff',
            letterSpacing: 4,
        }).setOrigin(0.5);

        // efeito de "pressão": botão desce 2px no hover e volta no pointerout
        btnBg.on('pointerover', () => {
            btnBg.setFillStyle(0x4422aa);
            btnText.setColor('#ffffff');
            this.tweens.add({ targets: [btnBg, btnText], y: '+=2', duration: 60 });
        });
        btnBg.on('pointerout', () => {
            btnBg.setFillStyle(0x2a1a66);
            btnText.setColor('#ccbbff');
            this.tweens.add({ targets: [btnBg, btnText], y: '-=2', duration: 60 });
        });
        btnBg.on('pointerdown', () => this._confirmar());

        // Fade in 
        this.cameras.main.fadeIn(600, 0, 0, 0);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    _selecionar(index) {
        // Deselect all cards
        this.cards.forEach((card, i) => {
            card.setFillStyle(0x111133);
            card.setStrokeStyle(2, 0x3333aa);
            this.tweens.add({ targets: this.previews[i], scaleX: 3.5, scaleY: 3.5, duration: 150 });
        });

        // Highlight selected
        this.cards[index].setFillStyle(0x221155);
        this.cards[index].setStrokeStyle(2, 0x9966ff);
        this.tweens.add({ targets: this.previews[index], scaleX: 4.2, scaleY: 4.2, duration: 150 });

        this.spriteSelecionado = this.opcoes[index].key;
        this.indexSelecionado  = index;
    }

    _confirmar() {
    const nome = this.nomeDigitado.trim() || 'Jogador';
        // registry garante que a opção persista durante o jogo
        this.game.registry.set('nomeJogador', nome);
        this.game.registry.set('spriteJogador', this.spriteSelecionado);
        this.game.registry.set('personagemConfigurado', true);

        //garante que persista entre sessões de jogatina
        localStorage.setItem('personagemConfigurado', 'true');
        localStorage.setItem('nomeJogador', nome);
        localStorage.setItem('spriteJogador', this.spriteSelecionado);

        // transição para a primeira cena
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('CasaGelo2');
        });
    }
}