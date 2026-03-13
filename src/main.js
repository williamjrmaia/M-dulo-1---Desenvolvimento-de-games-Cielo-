import Preloader from './Cenas/Preloader.js';
import MenuPrincipal from './Cenas/MenuPrincipal.js';
import CenaPersonagem from './Cenas/CenaPersonagem.js';
import CenaConfig from './Cenas/CenaConfig.js';
import CenaCasa from './Cenas/CenaCasa.js';
import MundoCasa from './Cenas/MundoCasa.js';
import NegociacaoJoao from './Cenas/NegociacaoJoao.js';
import MapaGelo from './Cenas/MapaGelo.js';
import CenaCasaGelo from './Cenas/CenaCasaGelo.js';
import TutorialOverlay from './Cenas/TutorialOverlay.js';

const config = {
    type: Phaser.AUTO,
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

    scene: [Preloader, MenuPrincipal, CenaPersonagem, CenaConfig, CenaCasa, MundoCasa, MapaGelo, NegociacaoJoao, 
        TutorialOverlay, CenaCasaGelo]//Preloader carrega as sprites antes do jogo começar 
                                      //para evitar redundância

};

const game = new Phaser.Game(config);



