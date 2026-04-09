export default class MenuPrincipal extends Phaser.Scene {
            constructor() { super('MenuPrincipal'); }
            preload() {
             this.load.image('menu_jogo', 'assets/menu/menu_fundo.png');
             this.load.image('logo', 'assets/menu/logo.png');
             this.load.image('botao_iniciar', 'assets/menu/botoes/iniciar_02.png');
             this.load.image('botao_iniciar_hover', 'assets/menu/botoes/iniciar_01.png');
             this.load.image('botao_sair', 'assets/menu/botoes/sair_02.png');
             this.load.image('botao_sair_hover', 'assets/menu/botoes/sair_01.png');
             this.load.image('botao_config', 'assets/menu/botoes/configuracao_02.png');
             this.load.image('botao_config_hover', 'assets/menu/botoes/configuracao_01.png');
            }

            create() {
                // Toca música de fundo do menu (se o AudioManager já estiver pronto)
                const audio = this.registry.get('audio');
                if (audio && typeof audio.tocarMusica === 'function') {
                    audio.tocarMusica('musica_fundo_inicio', 0.5);
                }

                let tela = this.add.image(750, 400, 'menu_jogo')

                // Logo centralizado no topo
                let logo = this.add.image(750, 100, 'logo').setOrigin(0.5, 0.5).setScale(0.6);

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
                    this.sound.play('som_clique', { volume: 2.5 });
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
                    this.sound.play('som_clique', { volume: 2.5 });
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
                    this.sound.play('som_clique', { volume: 2.5 });
                    window.close();
                });
            }
               
        }