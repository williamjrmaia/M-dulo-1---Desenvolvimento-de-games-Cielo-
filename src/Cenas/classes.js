export default class Jogador {

    constructor(cena, x, y, scale = 2.3) {
        this.cena = cena;
        this.velocidade = 100;

        // Lê o personagem escolhido — fallback para man_whi
        const skin = cena.game.registry.get('spriteJogador') || 'man_whi';
        this.skin = skin;

        // Usa a chave correta do Preloader
        this.sprite = cena.physics.add.sprite(x, y, `${skin}_front_idl`).setScale(scale);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.body.setSize(10, 15);
        this.sprite.setOffset(27, 30);

        this._criarAnimacoes();
    }

    _criarAnimacoes() {
        const cena = this.cena;
        const s = this.skin;

    console.log('skin:', s);
    console.log('front_idl existe?', cena.textures.exists(`${s}_front_idl`));
    console.log('front_walk existe?', cena.textures.exists(`${s}_front_walk`));
    console.log('side_walk existe?',  cena.textures.exists(`${s}_side_walk`));

    if (cena.anims.exists(`${s}_idle`)) return;

        if (cena.anims.exists(`${s}_idle`)) return;

        cena.anims.create({ key: `${s}_idle`,  frames: cena.anims.generateFrameNumbers(`${s}_front_idl`,  { start: 0, end: 11 }), frameRate: 10, repeat: -1 });
        cena.anims.create({ key: `${s}_andar`, frames: cena.anims.generateFrameNumbers(`${s}_front_walk`, { start: 0, end: 5  }), frameRate: 10, repeat: -1 });
        cena.anims.create({ key: `${s}_costa`, frames: cena.anims.generateFrameNumbers(`${s}_back_walk`,  { start: 0, end: 5  }), frameRate: 10, repeat: -1 });
        cena.anims.create({ key: `${s}_lado`,  frames: cena.anims.generateFrameNumbers(`${s}_side_walk`,  { start: 0, end: 5  }), frameRate: 10, repeat: -1 });
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
        const largura = this.cena.cameras.main.width;
    this.cena.add.text(largura - 10, 10, 'Aperte H para acessar o tutorial', {
        fontSize: '11px',
        fill: '#FFD700',
        backgroundColor: '#000000',
        padding: { x: 6, y: 3 }
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(10);
        return this.teclas;
    }
   

    atualizar() {
        const { sprite, teclas, velocidade } = this;
        const s = this.skin;
        if (!sprite || !teclas) return;
        
        if (Phaser.Input.Keyboard.JustDown(teclas.tutorial)) {
    if (this.cena.scene.isActive('TutorialOverlay')) {
        this.cena.scene.stop('TutorialOverlay');
        this.cena.input.keyboard.enabled = true;
    } else {
        this.sprite.setVelocity(0); 
        this.cena.scene.launch('TutorialOverlay');
        this.cena.scene.bringToTop('TutorialOverlay');
        this.cena.input.keyboard.enabled = false;
    }
}


if (this.cena.scene.isActive('TutorialOverlay')) {
    this.sprite.setVelocity(0);
    return; // impede qualquer movimentação
}
   



       
    
       
        sprite.setVelocity(0);

        const nenhumaTecla =
            !teclas.left.isDown && !teclas.right.isDown &&
            !teclas.up.isDown   && !teclas.down.isDown;

        if (nenhumaTecla) {
            sprite.play(`${s}_idle`, true);
            return;
        }

        if (teclas.left.isDown) {
            sprite.setVelocityX(-velocidade);
            sprite.play(`${s}_lado`, true);
            sprite.setFlipX(false);
        } else if (teclas.right.isDown) {
            sprite.setVelocityX(velocidade);
            sprite.play(`${s}_lado`, true);
            sprite.setFlipX(true);
        }

        if (teclas.up.isDown) {
            sprite.setVelocityY(-velocidade);
            if (!teclas.left.isDown && !teclas.right.isDown)
                sprite.play(`${s}_costa`, true);
        } else if (teclas.down.isDown) {
            sprite.setVelocityY(velocidade);
            if (!teclas.left.isDown && !teclas.right.isDown)
                sprite.play(`${s}_andar`, true);
        }
    }

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