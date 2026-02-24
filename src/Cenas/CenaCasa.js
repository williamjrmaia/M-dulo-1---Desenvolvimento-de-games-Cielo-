class CenaCasa extends Phaser.Scene {
            constructor() {super('CenaCasa'); }
            preload(){
                  this.load.image('DentroCasa', 'Assets/CenarioCasa/Scene1_House1.png');
            }
            create(){
                this.add.image(750, 400, 'DentroCasa')
            }

        }