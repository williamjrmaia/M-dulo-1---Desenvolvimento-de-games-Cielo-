export default class Jogador {

    constructor(cena, x, y, scale = 2.3) {
        this.cena = cena;
        this.velocidade = 100;

        const skin = cena.game.registry.get('spriteJogador') || 'man_whi';
        this.skin = skin;

        this.sprite = cena.physics.add.sprite(x, y, `${skin}_front_idl`).setScale(scale);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.body.setSize(10, 5);
        this.sprite.setOffset(27, 40);

        this._criarAnimacoes();
        this._ultimaDirecao = 'frente';

        this.superficiePasso  = 'passos_interiorcasas'; // padrão — cada cena sobrescreve
        this._passoCooldown   = false;

        const largura = cena.cameras.main.width;
        this.cena.add.text(largura - 10, 10, 'Aperte H para acessar o tutorial', {
            fontSize:        '11px',
            fill:            '#FFD700',
            backgroundColor: '#000000',
            padding:         { x: 6, y: 3 },
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(10);
    }

    _criarAnimacoes() {
        const cena = this.cena;
        const s    = this.skin;

        if (cena.anims.exists(`${s}_idle`)) return;

        cena.anims.create({ key: `${s}_idle`,        frames: cena.anims.generateFrameNumbers(`${s}_front_idl`,  { start: 0, end: 11 }), frameRate: 10, repeat: -1 });
        cena.anims.create({ key: `${s}_idle_costas`, frames: cena.anims.generateFrameNumbers(`${s}_back_idl`,   { start: 0, end: 11 }), frameRate: 10, repeat: -1 });
        cena.anims.create({ key: `${s}_andar`,       frames: cena.anims.generateFrameNumbers(`${s}_front_walk`, { start: 0, end: 5  }), frameRate: 10, repeat: -1 });
        cena.anims.create({ key: `${s}_costa`,       frames: cena.anims.generateFrameNumbers(`${s}_back_walk`,  { start: 0, end: 5  }), frameRate: 10, repeat: -1 });
        cena.anims.create({ key: `${s}_lado`,        frames: cena.anims.generateFrameNumbers(`${s}_side_walk`,  { start: 0, end: 5  }), frameRate: 10, repeat: -1 });
    }

    _tocarPasso() {
        if (this._passoCooldown) return;
        if (!this.cena.cache.audio.exists(this.superficiePasso)) return;

        this.cena.sound.play(this.superficiePasso, { volume: 0.4 });
        this._passoCooldown = true;

        // Intervalo entre passos — ajusta o número (ms) se quiser mais rápido ou lento
        this.cena.time.delayedCall(320, () => {
            this._passoCooldown = false;
        });
    }

    configurarTeclas() {
        this.teclas = this.cena.input.keyboard.addKeys({
            up:        Phaser.Input.Keyboard.KeyCodes.W,
            down:      Phaser.Input.Keyboard.KeyCodes.S,
            left:      Phaser.Input.Keyboard.KeyCodes.A,
            right:     Phaser.Input.Keyboard.KeyCodes.D,
            interagir: Phaser.Input.Keyboard.KeyCodes.E,
            tutorial:  Phaser.Input.Keyboard.KeyCodes.H,
        });
        return this.teclas;
    }

    atualizar() {
        const { sprite, teclas, velocidade } = this;
        const s = this.skin;
        if (!sprite || !teclas) return;

        if (this.cena.scene.isActive('TutorialOverlay')) {
            this.sprite.setVelocity(0);
            if (Phaser.Input.Keyboard.JustDown(teclas.tutorial)) {
                this.cena.scene.stop('TutorialOverlay');
                this.cena.input.keyboard.enabled = true;
            }
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(teclas.tutorial)) {
            this.sprite.setVelocity(0);
            // passa a chave da cena atual para o overlay saber qual teclado reativar ao fechar
            this.cena.scene.launch('TutorialOverlay', { cenaOrigem: this.cena.scene.key });
            this.cena.scene.bringToTop('TutorialOverlay');
            this.cena.input.keyboard.enabled = false;
        }

        sprite.setVelocity(0);

        const nenhumaTecla =
            !teclas.left.isDown && !teclas.right.isDown &&
            !teclas.up.isDown   && !teclas.down.isDown;

        if (nenhumaTecla) {
            const idleAnim = this._ultimaDirecao === 'costas' ? `${s}_idle_costas` : `${s}_idle`;
            sprite.play(idleAnim, true);
            return;
        }

        let vx = 0, vy = 0;

        if (teclas.left.isDown) {
            vx = -velocidade;
            sprite.play(`${s}_lado`, true);
            sprite.setFlipX(false);
            this._ultimaDirecao = 'lado';
        } else if (teclas.right.isDown) {
            vx = velocidade;
            sprite.play(`${s}_lado`, true);
            sprite.setFlipX(true);
            this._ultimaDirecao = 'lado';
        }

        if (teclas.up.isDown) {
            vy = -velocidade;
            if (!teclas.left.isDown && !teclas.right.isDown) {
                sprite.play(`${s}_costa`, true);
                this._ultimaDirecao = 'costas';
            }
        } else if (teclas.down.isDown) {
            vy = velocidade;
            if (!teclas.left.isDown && !teclas.right.isDown) {
                sprite.play(`${s}_andar`, true);
                this._ultimaDirecao = 'frente';
            }
        }

        const mag = Math.sqrt(vx * vx + vy * vy);
        if (mag > 0) {
            sprite.setVelocityX((vx / mag) * velocidade);
            sprite.setVelocityY((vy / mag) * velocidade);
            this._tocarPasso();
        }
    }

    // ── Colisão e overlap ─────────────────────────────────────────────────────

    adicionarColisao(objeto) {
        return this.cena.physics.add.collider(this.sprite, objeto);
    }

    adicionarOverlap(objeto, callback) {
        return this.cena.physics.add.overlap(this.sprite, objeto, callback, null, this.cena);
    }

    temOverlap(objeto) {
        return this.cena.physics.overlap(this.sprite, objeto);
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
}