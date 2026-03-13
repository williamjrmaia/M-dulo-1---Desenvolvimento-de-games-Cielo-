export default class MenuPrincipal extends Phaser.Scene {
            constructor() { super('MenuPrincipal'); }
            preload() {
             this.load.image('menu_jogo', 'assets/Menu/menu_fundo.png');
             this.load.image('botao_iniciar', 'assets/Menu/botoes/iniciar_02.png');
             this.load.image('botao_iniciar_hover', 'assets/Menu//botoes/iniciar_01.png');
             this.load.image('botao_sair', 'assets/Menu/botoes/sair_02.png');
             this.load.image('botao_sair_hover', 'assets/Menu/botoes/sair_01.png');
             this.load.image('botao_config', 'assets/Menu/botoes/configuracao_02.png');
             this.load.image('botao_config_hover', 'assets/Menu/botoes/configuracao_01.png');
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

                //Clicar no botão, começar a animação de FADE e trocar para a CenaJogo
                botaoInicio.on('pointerover', () => {
                    botaoInicio.setTexture('botao_iniciar_hover');
                })
                botaoInicio.on('pointerout', () => {
                    botaoInicio.setTexture('botao_iniciar');
                })
                // troca de cena só ocorre após o fade terminar, evitando flash branco
                botaoInicio.on('pointerdown', () => {
                    this.cameras.main.fadeOut(1000, 0, 0, 0);
                    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    this.scene.start('CenaPersonagem');
                  
                })
                });

                //Botão para entrar nas configs do jogo
                botaoConfig.on('pointerover', () => {
                    botaoConfig.setTexture('botao_config_hover');
                })
                botaoConfig.on('pointerout', () => {
                    botaoConfig.setTexture('botao_config');
                })
                botaoConfig.on('pointerdown', () => {
                    this.scene.start('CenaConfig');
                });
                
                //Botão de sair fecha todas as abas
                botaoSair.on('pointerover', () => {
                    botaoSair.setTexture('botao_sair_hover');
                })
                botaoSair.on('pointerout', () => {
                    botaoSair.setTexture('botao_sair')
                })
                botaoSair.on('pointerdown', () => {
                    window.close();
                });
            }
               
        }


        