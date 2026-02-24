export default class CenaCasa extends Phaser.Scene {
            constructor() {super('CenaCasa'); }
            preload(){
                  this.load.image('DentroCasa', '../assets/CenarioCasa/ROOM1-HOUSE/Scene1_House1.png');
            }
            create(){
                this.add.image(750, 400, 'DentroCasa')
            }

        }