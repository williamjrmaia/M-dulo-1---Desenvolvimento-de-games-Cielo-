import MenuPrincipal from './MenuPrincipal.js';
import CenaConfig from './CenaConfig.js';
import CenaCasa from './CenaCasa.js';
import MundoCasa from './MundoCasa.js';
import MapaGelo from './MapaGelo.js';

const config = {
    type: Phaser.AUTO,
    width: 1500,
    height: 800,
    backgroundColor: '#ffffff',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [MenuPrincipal, CenaConfig, CenaCasa, MundoCasa, MapaGelo]
};

const game = new Phaser.Game(config);



