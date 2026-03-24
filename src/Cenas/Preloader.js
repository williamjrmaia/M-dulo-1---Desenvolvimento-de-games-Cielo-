export default class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        // skin: chave usada no registry | pasta: caminho dos assets | cor: sufixo do arquivo
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
                    { frameWidth: 64, frameHeight: 64 } // tamanho padrão de todos os sprites do jogador
                );
            });
        });

        //assets para o diálogo do jogo
        this.load.image('balao',      './assets/objetos/balao_dialogo.png');
        this.load.image('IndicadorE', './assets/objetos/botao_e.png');

        this.load.image('Tutorial', 'assets/CenarioCasa/tutorial_andar.png');

        // ABORDAGEM ---------------------------
        this.load.image('AntiPitch',             'assets/Cartas/Abordagem/AntiPitch.png');
        this.load.image('ComparacaoInteligente', 'assets/Cartas/Abordagem/ComparacaoInteligente.png');
        this.load.image('DesarmeElegante',       'assets/Cartas/Abordagem/DesarmeElegante.png');
        this.load.image('DiretoAoPonto',         'assets/Cartas/Abordagem/DiretoAoPonto.png');
        this.load.image('GanchoSocial',          'assets/Cartas/Abordagem/GanchoSocial.png');

        //SONDAGEM -----------------------------
        this.load.image('AutoridadeImplicita',  'assets/Cartas/Sondagem/AutoridadeImplicita.png');
        this.load.image('ChaveDeExclusividade', 'assets/Cartas/Sondagem/ChaveDeExclusividade.png');
        this.load.image('Cliffhanger',          'assets/Cartas/Sondagem/Cliffhanger.png');
        this.load.image('GanchoDaDor',          'assets/Cartas/Sondagem/GanchoDaDor.png');
        this.load.image('LoboCurioso',          'assets/Cartas/Sondagem/LoboCurioso.png');
        this.load.image('PerguntaDeImpacto',    'assets/Cartas/Sondagem/PerguntaDeImpacto.png');

        //DEMONSTRAÇÃO -------------------------
        this.load.image('CieloLioOn',  'assets/Cartas/Produtos/LIOON.png');
        this.load.image('CieloFlash',  'assets/Cartas/Produtos/FLASH.png');
        this.load.image('CVBA',        'assets/Cartas/Produtos/CVBA.png');
        this.load.image('CieloFlash2', 'assets/Cartas/Produtos/FLASH2.png');

        this.load.image('Ajuste', 'assets/Cartas/Negociacao/AjustesDeCondicoes.png');
        this.load.image('Quebra', 'assets/Cartas/Negociacao/QuebraDeObjecao.png');
        this.load.image('Validacao', 'assets/Cartas/Negociacao/ValidacaoDeValor.png');
        this.load.image('Comparativo', 'assets/Cartas/Negociacao/ComparativoDeValor.png');
        this.load.image('Recuo', 'assets/Cartas/Negociacao/RecuoEstrategico.png');
        

        this.load.image('Adicional', 'assets/Cartas/Fechamento/FechamentoAlternativo.png');
        this.load.image('Alternativo', 'assets/Cartas/Fechamento/FechamentoAlternativo.png');
        this.load.image('Desconto', 'assets/Cartas/Fechamento/FechamentoDesconto.png');
        this.load.image('Penalidade', 'assets/Cartas/Fechamento/FechamentoDePenalidade.png');
        this.load.image('Teste', 'assets/Cartas/Fechamento/FechamentoTeste.png');


        this.load.image('Pedro_neutro',    'assets/NPC/Pedro/BossPedro.png');
        this.load.image('Pedro_satisfeito','assets/NPC/Pedro/feliz.png');
        this.load.image('Pedro_bravo',     'assets/NPC/Pedro/BossPedro.png');

        this.load.image('Sofia', 'assets/NPC/Sofia/sofia.png');

        // ── Barra de satisfação ──
        this.load.image('barra_vazia',        'assets/objetos/barra/barra_vazia.png');
        this.load.image('barra_baixa',        'assets/objetos/barra/barra_baixa.png');
        this.load.image('barra_baixa_metade', 'assets/objetos/barra/barra_baixa_metade.png');
        this.load.image('barra_metade',       'assets/objetos/barra/barra_metade.png');
        this.load.image('barra_metade_cheia', 'assets/objetos/barra/barra_metade_cheia.png');
        this.load.image('barra_cheia',        'assets/objetos/barra/barra_cheia.png');
        
    }

    create() {
        this.scene.start('MenuPrincipal');
    }
}