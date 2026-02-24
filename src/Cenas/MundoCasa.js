class MundoCasa extends Phaser.Scene {
            constructor() {super('MundoCasa'); }

            preload() {
                this.load.image('MundoCasa', 'Assets/CenarioCasa/Scene1.png');
                this.load.image('MenuFundo', 'Assets/Menu/menu_fundo.png');
                this.load.spritesheet('Andando', 'Assets/Animações/andarfrente.png', { frameWidth: 64, frameHeight: 64 });
                this.load.spritesheet('IdleFrente', 'Assets/Animações/idlefrente.png', { frameWidth: 64, frameHeight: 64 });
                this.load.spritesheet('Lado', 'Assets/Animações/andarlado.png', { frameWidth: 64, frameHeight: 64 });
                this.load.spritesheet('Costa', 'Assets/Animações/andarcosta.png', { frameWidth: 64, frameHeight: 64 });
    
            }

            create() {
               
                this.add.image(750, 400, 'MenuFundo');
                this.add.image(750, 400, 'MundoCasa');
                
                
                let limiteX = 750 - (400 / 2); // 550
                let limiteY = 400 - (350 / 2); // 225

                this.physics.world.setBounds(limiteX, limiteY, 400, 350);

                // 1. Criar o personagem com física na posição que você quiser
            this.personagem = this.physics.add.sprite(750, 480, 'IdleFrente').setScale(1.0);
            this.personagem.setCollideWorldBounds(true); // Impede ele de sair da tela
            this.personagem.body.setSize(15, 20); // Deixa a hitbox pequena, apenas nos pés
               
                //Hitbox da casa + porta
            this.gatilhoCasa = this.add.zone(875, 337, 73, 58);
            this.physics.add.existing(this.gatilhoCasa);
            this.gatilhoCasa.body.setImmovable(true);
            this.gatilhoCasa.body.setAllowGravity(false);

            this.gatilhoPorta = this.add.zone(857, 375, 20, 20);
            this.physics.add.existing(this.gatilhoPorta);

            this.physics.add.collider(this.personagem, this.gatilhoCasa);
             
            this.naPorta = false
            this.physics.add.overlap(this.personagem, this.gatilhoPorta, () => {
                this.naPorta = true;
            }, null, this )


                // 2. Criar os controles (teclas)
            this.teclas = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            interagir: Phaser.Input.Keyboard.KeyCodes.E
            });

            

             criarAnimacoesJogador(this);  
             }
            update() {

                if (!this.physics.overlap(this.personagem, this.gatilhoPorta)) {
                this.naPorta = false;
                }

                if (this.naPorta && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
        console.log("Entrando na casa...");
        
        // Desativa o input para evitar múltiplos cliques durante o fade
        this.input.keyboard.enabled = false;

        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('CenaCasa');
        });
    }

              
                this.cameras.main.setZoom(2.6);
                this.cameras.main.setBounds(0, 0, 1500, 800)
                this.cameras.main.startFollow(this.personagem);

                atualizarMovimentoJogador(this.personagem, this.teclas);
            
        }
    }