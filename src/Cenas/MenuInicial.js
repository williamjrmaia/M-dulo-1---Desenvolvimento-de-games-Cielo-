export default class MenuPrincipal extends Phaser.Scene {
            constructor() { super('MenuPrincipal'); }
            preload() {
             this.load.image('menu_jogo', 'Assets/Menu/menu_fundo.png');
             this.load.image('botao_iniciar', 'Assets/Menu/iniciar.png');
             this.load.image('botao_sair', 'Assets/Menu/sair.png');
             this.load.image('botao_config', 'Assets/Menu/configuracao.png');
            }

            create() {
                let tela = this.add.image(750, 400, 'menu_jogo')
                let botaoInicio = this.add.image(748, 340, 'botao_iniciar').setScale(1.1)
                let botaoConfig = this.add.image(750, 396, 'botao_config').setScale(1.1)
                let botaoSair = this.add.image(750, 454, 'botao_sair').setScale(1.1)
            

                //deixar o botao interativo
                botaoInicio.setInteractive();
                botaoConfig.setInteractive();
                botaoSair.setInteractive();

                //this.cameras.main.fadeIn(2000, 0, 0, 0); Isso aqui adiciona um fadein no começo da tela, mas fica meio chato quando você volta das configs > Menu e vendo o fade toda hora

                //Clicar no botão, começar a animação de FADE e trocar para a CenaJogo
                botaoInicio.on('pointerdown', () => {
                    this.cameras.main.fadeOut(2000, 0, 0, 0);
                    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    this.scene.start('MundoCasa');
                  
                })
                });

                //Botão para entrar nas configs do jogo
                botaoConfig.on('pointerdown', () => {
                    this.scene.start('CenaConfig');
                });
                
                //Botão de sair fecha todas as abas
                botaoSair.on('pointerdown', () => {
                    window.close();
                });
            }
               
        }


        class CenaConfig extends Phaser.Scene {
            constructor() { super('CenaConfig'); }

            preload() {
                this.load.image('menu_jogo', 'Assets/Menu/menu_fundo.png');
            }
            create() {
            

            this.add.image(750, 400, 'menu_jogo', 'Assets/Menu/menu_fundo.png');
            this.add.rectangle(750, 400, 600, 500, 0x000000)
            let botaoSair = this.add.rectangle(420, 634, 50, 30, 0x000000);
            this.add.text(400, 627, "Sair").setScale(1)

            botaoSair.setInteractive()


            //Sair das configurações para ir ao Menu novamente
            botaoSair.on('pointerdown', () => {
                this.scene.start('MenuPrincipal')
            })
            


            }

        }

        //Função da movimentação

        function criarAnimacoesJogador(cena) {
   
    if (!cena.anims.exists('andar')) {
        cena.anims.create({ key: 'andar', frames: cena.anims.generateFrameNumbers('Andando', { start: 0, end: 11 }), frameRate: 10, repeat: -1 });
        cena.anims.create({ key: 'idleFrente', frames: cena.anims.generateFrameNumbers('IdleFrente', { start: 0, end: 11 }), frameRate: 10, repeat: -1 });
        cena.anims.create({ key: 'lado', frames: cena.anims.generateFrameNumbers('Lado', { start: 0, end: 11 }), frameRate: 10, repeat: -1 });
        cena.anims.create({ key: 'costa', frames: cena.anims.generateFrameNumbers('Costa', { start: 0, end: 11 }), frameRate: 10, repeat: -1 });
        
    }
}
        function atualizarMovimentoJogador(personagem, teclas) {
    let vel = 100;
    personagem.setVelocity(0);

    var nenhumaTeclaPrecionada = !teclas.left.isDown && !teclas.right.isDown && !teclas.up.isDown && !teclas.down.isDown;

    if (nenhumaTeclaPrecionada) {
        if (!personagem.anims.isPlaying || personagem.anims.currentAnim.key !== 'idleFrente') {
            personagem.play('idleFrente');
        }
    } else {
        // ESQUERDA
        if (teclas.left.isDown) {
            personagem.setVelocityX(-vel);
            personagem.play('lado', true);
            personagem.setFlipX(false);
        }
        // DIREITA
        else if (teclas.right.isDown) { // Usando 'else if' para evitar conflito se apertar duas teclas
            personagem.setVelocityX(vel);
            personagem.play('lado', true);
            personagem.setFlipX(true);
        }

        // CIMA
        if (teclas.up.isDown) {
            personagem.setVelocityY(-vel);
            personagem.play('costa', true);
        }
        // BAIXO
        else if (teclas.down.isDown) {
            personagem.setVelocityY(vel);
            personagem.play('andar', true);
        }
    }
}