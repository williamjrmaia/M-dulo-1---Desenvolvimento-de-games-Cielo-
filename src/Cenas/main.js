import Preloader from './Preloader.js';
import MenuPrincipal from './MenuPrincipal.js';
import CenaPersonagem from './CenaPersonagem.js';
import CenaConfig from './CenaConfig.js';
import CenaCasa from './CenaCasa.js';
import MundoCasa from './MundoCasa.js';
import NegociacaoPedro from './NegociacaoPedro.js';
import MapaGelo from './MapaGelo.js';
import CenaCasaGelo from './CenaCasaGelo.js';
import TutorialOverlay from './TutorialOverlay.js';
import BootScene from './BootScene.js';
import VilaDoVarejo from './VilaDoVarejo.js';

const config = {
    type: Phaser.AUTO,
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game',
        width: 1500,
        height: 800,
    },
    backgroundColor: '#ffffff',
    dom: {createContainer: true},
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },

    scene: [Preloader, MenuPrincipal, CenaPersonagem, CenaConfig, CenaCasa, MundoCasa, MapaGelo, CenaCasaGelo, NegociacaoPedro, VilaDoVarejo,
        TutorialOverlay, BootScene]//Preloader carrega as sprites antes do jogo começar 
                                                                                      //para evitar redundância

};

const game = new Phaser.Game(config);



