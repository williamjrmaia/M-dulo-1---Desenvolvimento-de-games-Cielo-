import MenuPrincipal from './MenuPrincipal.js';
import CenaJogo from './CenaJogo.js';
import CenaConfig from './CenaConfig.js';
import CenaCasa from './CenaCasa.js';
import MundoCasa from './MundoCasa.js';

const config = {
    type: Phaser.AUTO,
    width: 1500,
    height: 800,
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },
    scene: [MenuPrincipal, CenaJogo, CenaConfig, CenaCasa, MundoCasa]
};

const game = new Phaser.Game(config);



