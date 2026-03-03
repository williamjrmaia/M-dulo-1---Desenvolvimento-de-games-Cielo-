export default class Jogador {

    constructor(cena, x, y, scale = 2.3) {
        this.cena = cena;
        this.velocidade = 100;

        // Create physics sprite
        this.sprite = cena.physics.add.sprite(x, y, 'IdleFrente').setScale(scale);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.body.setSize(10, 15);
        this.sprite.setOffset(27, 30);

        this._criarAnimacoes();
    }

    _criarAnimacoes() {
        const cena = this.cena;
        if (cena.anims.exists('andar')) return;

        cena.anims.create({ key: 'andar',     frames: cena.anims.generateFrameNumbers('Andando',   { start: 0, end: 11 }), frameRate: 10, repeat: -1 });
        cena.anims.create({ key: 'idleFrente',frames: cena.anims.generateFrameNumbers('IdleFrente', { start: 0, end: 11 }), frameRate: 10, repeat: -1 });
        cena.anims.create({ key: 'lado',      frames: cena.anims.generateFrameNumbers('Lado',       { start: 0, end: 11 }), frameRate: 10, repeat: -1 });
        cena.anims.create({ key: 'costa',     frames: cena.anims.generateFrameNumbers('Costa',      { start: 0, end: 11 }), frameRate: 10, repeat: -1 });
    }

    configurarTeclas() {
        this.teclas = this.cena.input.keyboard.addKeys({
            up:       Phaser.Input.Keyboard.KeyCodes.W,
            down:     Phaser.Input.Keyboard.KeyCodes.S,
            left:     Phaser.Input.Keyboard.KeyCodes.A,
            right:    Phaser.Input.Keyboard.KeyCodes.D,
            interagir: Phaser.Input.Keyboard.KeyCodes.E
        });
        return this.teclas;
    }

    atualizar() {
        const { sprite, teclas, velocidade } = this;
        if (!sprite || !teclas) return;

        sprite.setVelocity(0);

        const nenhumaTecla =
            !teclas.left.isDown &&
            !teclas.right.isDown &&
            !teclas.up.isDown &&
            !teclas.down.isDown;

        if (nenhumaTecla) {
            sprite.play('idleFrente', true);
            return;
        }

        if (teclas.left.isDown) {
            sprite.setVelocityX(-velocidade);
            sprite.play('lado', true);
            sprite.setFlipX(false);
        } else if (teclas.right.isDown) {
            sprite.setVelocityX(velocidade);
            sprite.play('lado', true);
            sprite.setFlipX(true);
        }

        if (teclas.up.isDown) {
            sprite.setVelocityY(-velocidade);
            if (!teclas.left.isDown && !teclas.right.isDown)
                sprite.play('costa', true);
        } else if (teclas.down.isDown) {
            sprite.setVelocityY(velocidade);
            if (!teclas.left.isDown && !teclas.right.isDown)
                sprite.play('andar', true);
        }
    }

    // --- Convenience passthrough helpers ---

    /** Add a collider between this player and another object. */
    adicionarColisao(objeto) {
        return this.cena.physics.add.collider(this.sprite, objeto);
    }

    /** Add an overlap between this player and another object. */
    adicionarOverlap(objeto, callback) {
        return this.cena.physics.add.overlap(this.sprite, objeto, callback, null, this.cena);
    }

    /** Check overlap this frame (for polling in update). */
    temOverlap(objeto) {
        return this.cena.physics.overlap(this.sprite, objeto);
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
}