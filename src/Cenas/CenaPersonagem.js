export default class CenaPersonagem extends Phaser.Scene {
    constructor() {
        super('CenaPersonagem');
        this.spriteSelecionado = 'IdleFrente'; // default
        this.indexSelecionado  = 0;
    }

    preload() {
        // Load all 4 character spritesheets
        // Replace these keys/paths with your actual character assets
        this.load.spritesheet('IdleFrente', '../assets/animacoes/idlefrente.png',   { frameWidth: 64, frameHeight: 64 });
        //this.load.spritesheet('Personagem2', '../assets/animacoes/personagem2.png', { frameWidth: 64, frameHeight: 64 });
        //this.load.spritesheet('Personagem3', '../assets/animacoes/personagem3.png', { frameWidth: 64, frameHeight: 64 });
        //this.load.spritesheet('Personagem4', '../assets/animacoes/personagem4.png', { frameWidth: 64, frameHeight: 64 });
    }

    create() {
        const W = this.scale.width;   // 1500
        const H = this.scale.height;  // 800

        // ── Background ───────────────────────────────────────────────────────
        this.add.rectangle(0, 0, W, H, 0x0a0a1a).setOrigin(0, 0);

        // ── Title ─────────────────────────────────────────────────────────────
        this.add.text(W / 2, 80, 'ESCOLHA SEU PERSONAGEM', {
            fontFamily: '"Courier New", monospace',
            fontSize: '36px',
            color: '#e0d0ff',
            letterSpacing: 8,
            stroke: '#6644cc',
            strokeThickness: 4,
        }).setOrigin(0.5);

        // Decorative line under title
        const line = this.add.graphics();
        line.lineStyle(2, 0x6644cc, 1);
        line.lineBetween(W / 2 - 280, 110, W / 2 + 280, 110);
        line.lineStyle(1, 0x6644cc, 0.3);
        line.lineBetween(W / 2 - 380, 115, W / 2 + 380, 115);

        // ── Opção de personagem ─────────────────────────────────────────────────
        // Each entry: { key, label, frameEnd }
        this.opcoes = [
            { key: 'IdleFrente',  label: '1', frameEnd: 11 },
            //{ key: 'Personagem2', label: 'Mago',         frameEnd: 11 },
            //{ key: 'Personagem3', label: 'Arqueiro',     frameEnd: 11 },
            //{ key: 'Personagem4', label: 'Guerreiro',    frameEnd: 11 },
        ];

        this.cards      = [];   // background rectangles
        this.previews   = [];   // animated sprites
        this.selecionar = this._selecionar.bind(this);

        const totalCards  = this.opcoes.length;
        const cardWidth   = 200;
        const cardHeight  = 260;
        const spacing     = 60;
        const totalWidth  = totalCards * cardWidth + (totalCards - 1) * spacing;
        const startX      = (W - totalWidth) / 2;
        const cardY       = 320;

        this.opcoes.forEach((opcao, i) => {
            const cx = startX + i * (cardWidth + spacing) + cardWidth / 2;
            const cy = cardY;

            // Card background
            const card = this.add.rectangle(cx, cy, cardWidth, cardHeight, 0x111133)
                .setStrokeStyle(2, 0x3333aa)
                .setInteractive({ useHandCursor: true });

            // Animated character preview
            const animKey = `preview_${opcao.key}`;
            if (!this.anims.exists(animKey)) {
                this.anims.create({
                    key: animKey,
                    frames: this.anims.generateFrameNumbers(opcao.key, { start: 0, end: opcao.frameEnd }),
                    frameRate: 8,
                    repeat: -1,
                });
            }

            const sprite = this.add.sprite(cx, cy - 20, opcao.key)
                .setScale(3.5)
                .play(animKey, true);

            // Character name label
            this.add.text(cx, cy + cardHeight / 2 - 30, opcao.label, {
                fontFamily: '"Courier New", monospace',
                fontSize: '18px',
                color: '#aaaadd',
            }).setOrigin(0.5);

            // Click handler
            card.on('pointerdown', () => this.selecionar(i));

            // Hover effects
            card.on('pointerover', () => {
                if (i !== this.indexSelecionado) {
                    card.setFillStyle(0x1a1a44);
                    this.tweens.add({ targets: sprite, scaleY: 3.8, scaleX: 3.8, duration: 120 });
                }
            });
            card.on('pointerout', () => {
                if (i !== this.indexSelecionado) {
                    card.setFillStyle(0x111133);
                    this.tweens.add({ targets: sprite, scaleY: 3.5, scaleX: 3.5, duration: 120 });
                }
            });

            this.cards.push(card);
            this.previews.push(sprite);
        });

        // Select default card
        this._selecionar(0);

        // ── Name input ────────────────────────────────────────────────────────
        this.add.text(W / 2, 530, 'SEU NOME:', {
            fontFamily: '"Courier New", monospace',
            fontSize: '20px',
            color: '#8877cc',
            letterSpacing: 4,
        }).setOrigin(0.5);

        // Styled HTML input
        this.nomeDigitado = '';

        const inputBg = this.add.rectangle(W / 2, 580, 340, 50, 0x0d0d22)
            .setStrokeStyle(2, 0x4433aa);

        this.inputText = this.add.text(W / 2, 580, 'Digite seu nome...', {
        fontFamily: '"Courier New", monospace',
        fontSize: '20px',
            color: '#554466',
        }).setOrigin(0.5);

// Type using keyboard
        this.input.keyboard.on('keydown', (event) => {
            if (event.keyCode === 8) {
                // Backspace
                this.nomeDigitado = this.nomeDigitado.slice(0, -1);
            } else if (event.keyCode === 13) {
                // Enter
                this._confirmar();
            } else if (this.nomeDigitado.length < 16 && event.key.length === 1) {
                this.nomeDigitado += event.key;
            }

            // Update display
            this.inputText.setText(this.nomeDigitado || 'Digite seu nome...');
            this.inputText.setColor(this.nomeDigitado ? '#e0d0ff' : '#554466');
});

        // ── Confirm button ────────────────────────────────────────────────────
        const btnBg = this.add.rectangle(W / 2, 680, 260, 55, 0x2a1a66)
            .setStrokeStyle(2, 0x7755ee)
            .setInteractive({ useHandCursor: true });

        const btnText = this.add.text(W / 2, 680, 'COMEÇAR', {
            fontFamily: '"Courier New", monospace',
            fontSize: '22px',
            color: '#ccbbff',
            letterSpacing: 4,
        }).setOrigin(0.5);

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

        // ── Fade in ───────────────────────────────────────────────────────────
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
    const nome = this.nomeDigitado.trim() || 'Jogador';  // ← changed this line
        // Save to registry (runtime) and localStorage (persistence)
        this.game.registry.set('nomeJogador',          nome);
        this.game.registry.set('spriteJogador',        this.spriteSelecionado);
        this.game.registry.set('personagemConfigurado', true);

        localStorage.setItem('personagemConfigurado', 'true');
        localStorage.setItem('nomeJogador',           nome);
        localStorage.setItem('spriteJogador',         this.spriteSelecionado);

        // Transition
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('MundoCasa');
        });
    }
}