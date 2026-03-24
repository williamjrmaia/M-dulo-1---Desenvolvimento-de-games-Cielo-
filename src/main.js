import Preloader from './Cenas/Preloader.js';
import MenuPrincipal from './Cenas/MenuPrincipal.js';
import CenaPersonagem from './Cenas/CenaPersonagem.js';
import CenaConfig from './Cenas/CenaConfig.js';
import CenaIntroducao from './Cenas/CenaIntroducao.js';
import CenaCasa from './Cenas/CenaCasa.js';
import MundoCasa from './Cenas/MundoCasa.js';
import NegociacaoPedro from './Cenas/NegociacaoPedro.js';
import MapaGelo from './Cenas/MapaGelo.js';
import CenaCasaGelo from './Cenas/CenaCasaGelo.js';
import TutorialOverlay from './Cenas/TutorialOverlay.js';
import CenaPonteh from './Cenas/CenaPonteh.js';
import CenaPonteV from './Cenas/CenaPonteV.js';
import VilaDoVarejo from './Cenas/VilaDoVarejo.js'; 
import CasaGelo2 from './Cenas/CasaGelo2.js';
import PraiaDosProveitos from './Cenas/PraiaDosProveitos.js'
import CasaVarejo1 from './Cenas/CasaVarejo1.js';
import CasaVarejo2 from './Cenas/CasaVarejo2.js';
import NegociacaoThaina from './Cenas/NegociacaoThaina.js';
import Insignia from './Classes/Insignias.js';


const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container',
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

    scene: [Preloader, MenuPrincipal, CenaPersonagem, CenaConfig, CenaIntroducao, Insignia, CenaCasa, MundoCasa, MapaGelo, NegociacaoPedro, CenaPonteh, CenaPonteV,
        TutorialOverlay, CenaCasaGelo, VilaDoVarejo, CasaGelo2, PraiaDosProveitos, CasaVarejo1, NegociacaoThaina]
};

const game = new Phaser.Game(config);