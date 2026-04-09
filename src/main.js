import Preloader        from './Cenas/Preloader.js';
import MenuPrincipal    from './Cenas/MenuPrincipal.js';
import CenaConfig       from './Cenas/CenaConfig.js';

import HUDCenas         from './Cenas/HUDCenas.js';
import TutorialOverlay  from './Cenas/TutorialOverlay.js';
import CenaPersonagem   from './Cenas/CenaPersonagem.js';
import PauseMenu        from './Cenas/Pausaoverlay.js';

import CenaIntroducao   from './Cenas/CenaIntroducao.js';

import CasaCielita      from './Cenas/CasaCielita.js';
import MundoDaCielita   from './Cenas/MundoDaCielita.js';

import QuebraGelo       from './Cenas/QuebraGelo.js';
import CenaCasaGelo     from './Cenas/CenaCasaGelo.js';
import CasaGelo2        from './Cenas/CasaGelo2.js';
import NegociacaoPedro  from './Cenas/NegociacaoPedro.js';

import PonteMC_QG       from './Cenas/PonteMC_QG.js';
import PonteQG_VV       from './Cenas/PonteQG_VV.js';
import PonteVV_PP       from './Cenas/PonteVV_PP.js';

import VilaDoVarejo     from './Cenas/VilaDoVarejo.js';
import CasaVarejo1      from './Cenas/CasaVarejo1.js';
import CasaVarejo2      from './Cenas/CasaVarejo2.js';
import NegociacaoThaina from './Cenas/NegociacaoThaina.js';

import PraiaDosProveitos from './Cenas/PraiaDosProveitos.js';
import CasaPraia1 from './Cenas/CasaPraia1.js';
import CasaPraia2 from './Cenas/CasaPraia2.js';
import CasaPraiaGrande from './Cenas/CasaPraiaGrande.js';
import NegociacaoJulia from './Cenas/NegociacaoJulia.js';

import CidadeCielo from './Cenas/CidadeCielo.js';
import CasaCidade1 from './Cenas/CasaCidade1.js';
import CasaCidade2 from './Cenas/CasaCidade2.js';

import AudioManager     from './Classes/AudioManager.js';

const config = {
    type: Phaser.AUTO,
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container',
        width: 1500,
        height: 800,
    },
    backgroundColor: '#ffffff',
    dom: { createContainer: true },
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },

    scene:[
        
        Preloader, AudioManager, MenuPrincipal, CenaConfig,

        CenaPersonagem, CenaIntroducao, TutorialOverlay, HUDCenas,PauseMenu,

        CasaCielita, MundoDaCielita, PonteMC_QG,

        QuebraGelo, CenaCasaGelo, CasaGelo2, PonteQG_VV,
        NegociacaoPedro, 

        VilaDoVarejo, CasaVarejo1, CasaVarejo2, 
        NegociacaoThaina, PonteVV_PP,

        PraiaDosProveitos, CasaPraia1, CasaPraia2, CasaPraiaGrande, NegociacaoJulia,

        CidadeCielo, CasaCidade1, CasaCidade2
    ]

    //Preloader carrega as sprites antes do jogo começar 
    //para evitar redundância
};

const game = new Phaser.Game(config);