export default class CenaCasa extends Phaser.Scene {

    constructor() {
        super('CenaCasa'); 
    }

    preload() {
        this.load.image('DentroCasa', '../assets/CenarioCasa/ROOM1-HOUSE/Scene1_House1.png');

        // Personagem e NPC
        this.load.spritesheet('Andando', '../assets/animacoes/andarfrente.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('IdleFrente', '../assets/animacoes/idlefrente.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('Lado', '../assets/animacoes/andarlado.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('Costa', '../assets/animacoes/andarcosta.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('cielitapa', '../assets/NPC/cielita/idlecielita.png', { frameWidth: 16, frameHeight: 25 });
    }

    create() {
        // Cenário e NPC
        this.add.image(750, 400, 'DentroCasa').setScale(2.3);
        this.cielita = this.physics.add.sprite(750, 400, 'cielitapa').setScale(2.3);
        this.cielita.setImmovable(true);

        // Personagem principal
        this.personagem = this.physics.add.sprite(750, 480, 'IdleFrente').setScale(2.3);
        this.personagem.setCollideWorldBounds(true);
        this.personagem.body.setSize(10, 15);
        this.personagem.setOffset(27, 30);
     

        // Controles
        this.teclas = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });

        // --- CRIANDO AS ANIMAÇÕES ---
        // OBS: Você pode precisar ajustar o "end" dependendo de quantos frames tem sua imagem.
        this.anims.create({
            key: 'idleFrente',
            frames: this.anims.generateFrameNumbers('IdleFrente', { start: 0, end: 0 }), 
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'andar',
            frames: this.anims.generateFrameNumbers('Andando', { start: 0, end: 3 }), 
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'lado',
            frames: this.anims.generateFrameNumbers('Lado', { start: 0, end: 3 }), 
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'costa',
            frames: this.anims.generateFrameNumbers('Costa', { start: 0, end: 3 }), 
            frameRate: 8,
            repeat: -1
        });

        //cielita
        this.anims.create({
            key: 'cielitaIdle',
            frames: this.anims.generateFrameNumbers('cielitapa', { start: 0, end: 3 }), 
            frameRate: 5,
            repeat: -1
        });
       
        this.cielita.play('cielitaIdle', true);
        
        this.physics.add.collider(this.personagem, this.cielita);
     
    }

    update() {
        let vel = 100;
        this.personagem.setVelocity(0);


        // Usando this.teclas e verificando se nenhuma está pressionada
        var nenhumaTeclaPressionada = !this.teclas.left.isDown && !this.teclas.right.isDown && !this.teclas.up.isDown && !this.teclas.down.isDown;
        if (nenhumaTeclaPressionada) {
            // O true garante que a animação não recomece se já estiver rodando
            this.personagem.play('idleFrente', true);
            

        } else {
            // ESQUERDA
            if (this.teclas.left.isDown) {
                this.personagem.setVelocityX(-vel);
                this.personagem.play('lado', true);
                this.personagem.setFlipX(false);
            }
            // DIREITA
            else if (this.teclas.right.isDown) { 
                this.personagem.setVelocityX(vel);
                this.personagem.play('lado', true);
                this.personagem.setFlipX(true);
            }

            // CIMA
            if (this.teclas.up.isDown) {
                this.personagem.setVelocityY(-vel);
                // Só troca a animação para "costa" se não estiver andando de lado
                if (!this.teclas.left.isDown && !this.teclas.right.isDown) {
                    this.personagem.play('costa', true);
                }
            }
            // BAIXO
            else if (this.teclas.down.isDown) {
                this.personagem.setVelocityY(vel);
                // Só troca a animação para "frente" se não estiver andando de lado
                if (!this.teclas.left.isDown && !this.teclas.right.isDown) {
                    this.personagem.play('andar', true);
                }
            }
        }
          
    }
}