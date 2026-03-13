export default class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        const personagens = [
            { skin: 'man_whi',   pasta: 'MAN/WHITE',   cor: 'whi' },
            { skin: 'man_bla',   pasta: 'MAN/BLACK',   cor: 'bla' },
            { skin: 'woman_whi', pasta: 'WOMAN/WHITE', cor: 'whi' },
            { skin: 'woman_bla', pasta: 'WOMAN/BLACK', cor: 'bla' },
        ];

        const genero = { man_whi: 'man', man_bla: 'man', woman_whi: 'woman', woman_bla: 'woman' };
        const anims  = ['front_idl', 'front_walk', 'back_idl', 'back_walk', 'side_walk'];

        personagens.forEach(({ skin, pasta, cor }) => {
            const gen = genero[skin];
            anims.forEach(anim => {
                this.load.spritesheet(
                    `${skin}_${anim}`,
                    `assets/PLAYER/${pasta}/spr_player_${gen}_${anim}_${cor}.png`,
                    { frameWidth: 64, frameHeight: 64 }
                );
            });
        });

        this.load.image('Tutorial', 'assets/CenarioCasa/tutorial_andar.png');

        // ── Cartas (carregadas aqui para ficarem em cache antes da NegociacaoPedro) ──
        this.load.image('AntiPitch',             'assets/Cartas/Abordagem/AntiPitch.png');
        this.load.image('ComparacaoInteligente', 'assets/Cartas/Abordagem/ComparacaoInteligente.png');
        this.load.image('DesarmeElegante',       'assets/Cartas/Abordagem/DesarmeElegante.png');
        this.load.image('DiretoAoPonto',         'assets/Cartas/Abordagem/DiretoAoPonto.png');
        this.load.image('GanchoSocial',          'assets/Cartas/Abordagem/GanchoSocial.png');

        this.load.image('AutoridadeImplicita',  'assets/Cartas/Sondagem/AutoridadeImplicita.png');
        this.load.image('ChaveDeExclusividade', 'assets/Cartas/Sondagem/ChaveDeExclusividade.png');
        this.load.image('Cliffhanger',          'assets/Cartas/Sondagem/Cliffhanger.png');
        this.load.image('GanchoDaDor',          'assets/Cartas/Sondagem/GanchoDaDor.png');
        this.load.image('LoboCurioso',          'assets/Cartas/Sondagem/LoboCurioso.png');
        this.load.image('PerguntaDeImpacto',    'assets/Cartas/Sondagem/PerguntaDeImpacto.png');

        this.load.image('CieloLioOn',  'assets/Cartas/Produtos/LIOON.png');
        this.load.image('CieloFlash',  'assets/Cartas/Produtos/FLASH.png');
        this.load.image('CVBA',        'assets/Cartas/Produtos/CVBA.png');
        this.load.image('CieloFlash2', 'assets/Cartas/Produtos/FLASH2.png');


        this.load.image('Pedro_neutro',    'assets/NPC/BossPedro.png');
        this.load.image('Pedro_satisfeito','assets/NPC/BossPedro.png');
        this.load.image('Pedro_bravo',     'assets/NPC/BossPedro.png');
        
    }

    create() {
        this.scene.start('MenuPrincipal');
    }
}