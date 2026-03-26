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
                    { frameWidth: 64, frameHeight: 64 } // tamanho padrao de todos os sprites do jogador
                );
            });
        });

        // zona de porta para indicar saida
        this.load.image('portaSaida', 'assets/CenarioCasa/ROOM1-HOUSE/porta_cielita.png');
        
        // assets para o dialogo do jogo
        this.load.image('balao',      './assets/objetos/balao_dialogo.png');
        this.load.image('IndicadorE', './assets/objetos/botao_e.png');

        this.load.image('Tutorial',       'assets/CenarioCasa/tutorial_andar.png');
        
        // assets de transicao das pontes
        this.load.image('fundo_ponte',    'assets/CenarioCasa/ponte.png');
        this.load.image('fundo_ponte_v',  'assets/CenarioCasa/ponte_transicao_vertical.png');

        // ── ABORDAGEM (12 cartas) ─────────────────────────────────────────────
        // Cartas positivas: DiretoAoPonto, GanchoSocial, Proatividade, AntiPitch,
        //   CuriosidadeDespertada, ReferenciaLocal, GatilhoDeEscassez, ParceriaEstrategica
        // Cartas negativas: DesarmeElegante, ComparacaoInteligente, Problematica, QuebradePadrao
        this.load.image('AntiPitch',              'assets/Cartas/Abordagem/AntiPitch.png');
        this.load.image('ComparacaoInteligente',  'assets/Cartas/Abordagem/ComparacaoInteligente.png');
        this.load.image('CuriosidadeDespertada',  'assets/Cartas/Abordagem/CuriosidadeDespertada.png');
        this.load.image('DesarmeElegante',        'assets/Cartas/Abordagem/DesarmeElegante.png');
        this.load.image('DiretoAoPonto',          'assets/Cartas/Abordagem/DiretoAoPonto.png');
        this.load.image('GanchoSocial',           'assets/Cartas/Abordagem/GanchoSocial.png');
        this.load.image('GatilhoDeEscassez',      'assets/Cartas/Abordagem/GatilhoDeEscassez.png');
        this.load.image('ParceriaEstrategica',    'assets/Cartas/Abordagem/ParceriaEstrategica.png');
        this.load.image('Proatividade',           'assets/Cartas/Abordagem/Proatividade.png');
        this.load.image('Problematica',           'assets/Cartas/Abordagem/Problematica.png');
        this.load.image('QuebradePadrao',         'assets/Cartas/Abordagem/QuebradePadrao.png');
        this.load.image('ReferenciaLocal',        'assets/Cartas/Abordagem/ReferenciaLocal.png');

        // ── SONDAGEM (12 cartas) ──────────────────────────────────────────────
        // Cartas que revelam dor de falha tecnica de Thaina:
        //   GanchoDaDor e PontoDeDorTecnico
        // As demais exploram outros angulos de necessidade do cliente
        this.load.image('AutoridadeImplicita',   'assets/Cartas/Sondagem/AutoridadeImplicita.png');
        this.load.image('ChaveDeExclusividade',  'assets/Cartas/Sondagem/ChaveDeExclusividade.png');
        this.load.image('Cliffhanger',           'assets/Cartas/Sondagem/Cliffhanger.png');
        this.load.image('DiagnosticoDeParceria', 'assets/Cartas/Sondagem/DiagnosticoDeParceria.png');
        this.load.image('EgoCorporativo',        'assets/Cartas/Sondagem/EgoCorporativo.png');
        this.load.image('Estrategia',            'assets/Cartas/Sondagem/Estrategia.png');
        this.load.image('GanchoDaDor',           'assets/Cartas/Sondagem/GanchoDaDor.png');
        this.load.image('LoboCurioso',           'assets/Cartas/Sondagem/LoboCurioso.png');
        this.load.image('PerguntaDeImpacto',     'assets/Cartas/Sondagem/PerguntaDeImpacto.png');
        this.load.image('PontoDeDorTecnico',     'assets/Cartas/Sondagem/PontoDeDorTecnico.png');
        this.load.image('SondagemDeFluxo',       'assets/Cartas/Sondagem/SondagemDeFluxo.png');
        this.load.image('SondagemDePrazo',       'assets/Cartas/Sondagem/SondagemDePrazo.png');

        // ── PRODUTOS / DEMONSTRACAO (12 cartas) ───────────────────────────────
        // CieloFlash2 e o produto correto para o problema de Thaina
        // (multiconexao + IA anti-falhas). Os demais sao penalizados quando
        // a dor de falha tecnica foi revelada na sondagem.
        this.load.image('Antecipacao',      'assets/Cartas/Produtos/Antecipacao.png');
        this.load.image('CrediarioDigital', 'assets/Cartas/Produtos/CrediarioDigital.png');
        this.load.image('CVBA',             'assets/Cartas/Produtos/CVBA.png');
        this.load.image('CieloFlash',       'assets/Cartas/Produtos/FLASH.png');
        this.load.image('CieloFlash2',      'assets/Cartas/Produtos/FLASH2.png');
        this.load.image('FlashRecarga',     'assets/Cartas/Produtos/FlashRecarga.png');
        this.load.image('CieloLioOn',       'assets/Cartas/Produtos/LIOON.png');
        this.load.image('LioOnApps',        'assets/Cartas/Produtos/LioOnApps.png');
        this.load.image('LioOnGestao',      'assets/Cartas/Produtos/LioOnGestao.png');
        this.load.image('MoedaEstrangeira', 'assets/Cartas/Produtos/MoedaEstrangeira.png');
        this.load.image('CieloTap',         'assets/Cartas/Produtos/TAP.png');
        this.load.image('CieloZip',         'assets/Cartas/Produtos/ZIP.png');

        // ── NEGOCIACAO (5 cartas) ─────────────────────────────────────────────
        this.load.image('Ajuste',      'assets/Cartas/Negociacao/AjustesDeCondicoes.png');
        this.load.image('Quebra',      'assets/Cartas/Negociacao/QuebraDeObjecao.png');
        this.load.image('Validacao',   'assets/Cartas/Negociacao/ValidacaoDeValor.png');
        this.load.image('Comparativo', 'assets/Cartas/Negociacao/ComparativoDeValor.png');
        this.load.image('Recuo',       'assets/Cartas/Negociacao/RecuoEstrategico.png');

        // ── FECHAMENTO (5 cartas) ─────────────────────────────────────────────
        this.load.image('Adicional',  'assets/Cartas/Fechamento/FechamentoAlternativo.png');
        this.load.image('Alternativo','assets/Cartas/Fechamento/FechamentoAlternativo.png');
        this.load.image('Desconto',   'assets/Cartas/Fechamento/FechamentoDesconto.png');
        this.load.image('Penalidade', 'assets/Cartas/Fechamento/FechamentoDePenalidade.png');
        this.load.image('Teste',      'assets/Cartas/Fechamento/FechamentoTeste.png');

        // ── NPCs ──────────────────────────────────────────────────────────────
        this.load.image('Pedro_neutro',    'assets/NPC/Pedro/BossPedro.png');
        this.load.image('Pedro_satisfeito','assets/NPC/Pedro/feliz.png');
        this.load.image('Pedro_bravo',     'assets/NPC/Pedro/BossPedro.png');

        this.load.image('Sofia', 'assets/NPC/Sofia/sofia.png');

        // ── Insignias ─────────────────────────────────────────────────────────
        // InsigniaAbordagem1: concedida em negociacoes de abordagem (ex: Pedro)
        // InsigniaProduto1:   concedida ao vencer NegociacaoThaina
        this.load.image('InsigniaAbordagem1', 'assets/Insignias/InsigniaAbordagem1.png');
        this.load.image('InsigniaProduto1',   'assets/Insignias/InsigniaProduto1.png');

        // ── Barra de satisfacao ───────────────────────────────────────────────
        this.load.image('barra_vazia',        'assets/objetos/barra/barra_vazia.png');
        this.load.image('barra_baixa',        'assets/objetos/barra/barra_baixa.png');
        this.load.image('barra_baixa_metade', 'assets/objetos/barra/barra_baixa_metade.png');
        this.load.image('barra_metade',       'assets/objetos/barra/barra_metade.png');
        this.load.image('barra_metade_cheia', 'assets/objetos/barra/barra_metade_cheia.png');
        this.load.image('barra_cheia',        'assets/objetos/barra/barra_cheia.png');


        // ── Audios ────────────────────────────────────────────────────────────
        this.load.audio('musica_fundo_inicio', 'assets/Audio/musica_fundo_inicio.mp3');
        this.load.audio('blip_dialogo',        'assets/Audio/blip_dialogo.wav');

        // ── Músicas ──
        this.load.audio('musica_fundo_inicio', 'assets/Audio/musica_fundo_inicio.mp3');
        this.load.audio('musica_quebragelo', 'assets/Audio/musica_quebragelo.mp3');
        this.load.audio('musica_viladovarejo', 'assets/Audio/musica_viladovarejo.mp3');
        this.load.audio('musica_praiadosproveitos', 'assets/Audio/musica_praiadosproveitos.mp3');

        // ── Áudio ambiente ──
        this.load.audio('ambiente_quebragelo', 'assets/Audio/ambiente_quebragelo.mp3');
        this.load.audio('ambiente_viladovarejo', 'assets/Audio/ambiente_viladovarejo.mp3');
        this.load.audio('ambiente_praiadosproveitos', 'assets/Audio/ambiente_praiadosproveitos.mp3');


        // ── Narração da Introdução ──
        this.load.audio('blip_teclado', 'assets/Audio/blip_teclado.wav');


    }

    create() {
        this.scene.launch('AudioManager');
        this.time.delayedCall(100, () => {
            this.scene.start('MenuPrincipal');
        });
    }
}