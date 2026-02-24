export default class CenaConfig extends Phaser.Scene {
            constructor() { super('CenaConfig'); }

            preload() {
                this.load.image('menu_jogo', '../assets/menu/menu_fundo.png');
            }
            create() {
            

            this.add.image(750, 400, 'menu_jogo', '../assets/menu/menu_fundo.png');
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

        