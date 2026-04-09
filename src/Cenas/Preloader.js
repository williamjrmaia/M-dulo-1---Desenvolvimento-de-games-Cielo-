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
                    { frameWidth: 64, frameHeight: 64 }
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

        // assets balcão da negociação
        this.load.image('balcao', 'assets/Icones/Fundo_madeira.png');

        // Ícones PIFE+CPC — abordagem
        this.load.image('pife_p_off',   'assets/Icones/Abordagem/pife_p_off.png');
        this.load.image('pife_p_on',    'assets/Icones/Abordagem/pife_p_on.png');
        this.load.image('pife_i_off',   'assets/Icones/Abordagem/pife_i_off.png');
        this.load.image('pife_i_on',    'assets/Icones/Abordagem/pife_i_on.png');
        this.load.image('pife_f_off',   'assets/Icones/Abordagem/pife_f_off.png');
        this.load.image('pife_f_on',    'assets/Icones/Abordagem/pife_f_on.png');
        this.load.image('pife_e_off',   'assets/Icones/Abordagem/pife_e_off.png');
        this.load.image('pife_e_on',    'assets/Icones/Abordagem/pife_e_on.png');
        this.load.image('cpc_on', 'assets/Icones/Abordagem/icone_cpc_on.png');
        this.load.image('cpc_off',  'assets/Icones/Abordagem/icone_cpc_off.png');
       // Ícones sondagem — pessoas (fluxo)
this.load.image('sondagem_pessoas_interrogacao', 'assets/Icones/Sondagem/icone_fluxo_g_off.png');
this.load.image('sondagem_pessoas_baixo',        'assets/Icones/Sondagem/icone_fluxo_g_off.png');
this.load.image('sondagem_pessoas_alto',         'assets/Icones/Sondagem/icone_fluxo_g.png');

// Ícones sondagem — estoque (caixa)
this.load.image('sondagem_estoque_interrogacao', 'assets/Icones/Sondagem/icone_caixa_off.png');
this.load.image('sondagem_estoque_baixo',        'assets/Icones/Sondagem/icone_caixa_baixo.png');
this.load.image('sondagem_estoque_alto',         'assets/Icones/Sondagem/icone_caixa_cima.png');

// Ícones sondagem — lucro (mantém os arquivos que já funcionam)
this.load.image('sondagem_lucro_interrogacao',   'assets/Icones/Sondagem/sondagem_lucro_interrogacao.png');
this.load.image('sondagem_lucro_baixo',          'assets/Icones/Sondagem/sondagem_lucro_baixo.png');
this.load.image('sondagem_lucro_medio',          'assets/Icones/Sondagem/sondagem_lucro_medio.png');
this.load.image('sondagem_lucro_alto',           'assets/Icones/Sondagem/sondagem_lucro_alto.png');
        // ── ABORDAGEM (5 cartas) ─────────────────────────────────────────────
           
        this.load.image('Proximidade', 'assets/Cartas/Abordagem/Proximidade.png');
        this.load.image('Interesse', 'assets/Cartas/Abordagem/Interesse.png');
        this.load.image('Familiaridade', 'assets/Cartas/Abordagem/Familiaridade.png');
        this.load.image('Empatia', 'assets/Cartas/Abordagem/Empatia.png');
        this.load.image('CPC', 'assets/Cartas/Abordagem/CPC.png');

        //ABORDAGEM - ícones lucro, estoque, pessoas
        this.load.image('sondagem_pessoas_interrogacao', 'assets/Icones/Sondagem/sondagem_pessoas_interrogacao.png');
        this.load.image('sondagem_pessoas_baixo',        'assets/Icones/Sondagem/sondagem_pessoas_baixo.png');
        this.load.image('sondagem_pessoas_alto',         'assets/Icones/Sondagem/sondagem_pessoas_alto.png');
        this.load.image('sondagem_lucro_interrogacao',   'assets/Icones/Sondagem/sondagem_lucro_interrogacao.png');
        this.load.image('sondagem_lucro_baixo',          'assets/Icones/Sondagem/sondagem_lucro_baixo.png');
        this.load.image('sondagem_lucro_medio',          'assets/Icones/Sondagem/sondagem_lucro_medio.png');
        this.load.image('sondagem_lucro_alto',           'assets/Icones/Sondagem/sondagem_lucro_alto.png');
        this.load.image('sondagem_estoque_interrogacao', 'assets/Icones/Sondagem/sondagem_estoque_interrogacao.png');
        this.load.image('sondagem_estoque_baixo',        'assets/Icones/Sondagem/sondagem_estoque_baixo.png');
        this.load.image('sondagem_estoque_alto',         'assets/Icones/Sondagem/sondagem_estoque_alto.png');

        // ── SONDAGEM (5 cartas) ──────────────────────────────────────────────
            
        this.load.image('LucroCerto', 'assets/Cartas/Sondagem/LucroCerto.png');
        this.load.image('LucroErrado', 'assets/Cartas/Sondagem/LucroErrado.png');
        this.load.image('Movimento', 'assets/Cartas/Sondagem/Movimento.png');
        this.load.image('EstoqueCerto', 'assets/Cartas/Sondagem/EstoqueCerto.png');
        this.load.image('EstoqueErrado', 'assets/Cartas/Sondagem/EstoqueErrado.png');
        


        // ── PRODUTOS / DEMONSTRACAO (12 cartas) ───────────────────────────────
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
        this.load.image('Aceitacao',      'assets/Cartas/Negociacao/AceitacaoAmpla.png');
        this.load.image('Suporte',      'assets/Cartas/Negociacao/Suporte24h.png');
        this.load.image('Taxas',   'assets/Cartas/Negociacao/TaxasNegociaveis.png');
        this.load.image('Recebimento', 'assets/Cartas/Negociacao/RecebimentoRapido.png');
        this.load.image('Gestao',       'assets/Cartas/Negociacao/GestaoIntegrada.png');

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

        this.load.image('Chefa_feliz',  'assets/NPC/JULIA/CHEFE_FELIZ.png');
        this.load.image('Chefa_neutro', 'assets/NPC/JULIA/CHEFE_NEUTRA.png');
        this.load.image('Chefa_brava',  'assets/NPC/JULIA/CHEFE_IRRITADA.png');

        // ── Chefa como spritesheet para exibir frame único na CasaPraia1 ──────
        this.load.spritesheet('Chefa', 'assets/NPC/JULIA/spr_chefe_front_idl.png', {
            frameWidth:  16,
            frameHeight: 20,
        });

        this.load.image('Sofia', 'assets/NPC/Sofia/sofia.png');

        // ── Insignias ─────────────────────────────────────────────────────────
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
        this.load.audio('blip_dialogo',        'assets/Audio/blip_teclado.wav');

        // ── Músicas ──
        this.load.audio('musica_fundo_inicio',       'assets/Audio/musica_fundo_inicio.mp3');
        this.load.audio('musica_quebragelo',          'assets/Audio/musica_quebragelo.mp3');
        this.load.audio('musica_viladovarejo',        'assets/Audio/musica_viladovarejo.mp3');
        this.load.audio('musica_praiadosproveitos',   'assets/Audio/musica_praiadosproveitos.mp3');
        this.load.audio('musica_cidadecielo',         'assets/Audio/musica_cidadecielo.mp3');
        this.load.audio('musica_batalha',             'assets/Audio/musica_batalha.mp3');

        // ── Áudio ambiente ──
        this.load.audio('ambiente_quebragelo',        'assets/Audio/ambiente_quebragelo.mp3');
        this.load.audio('ambiente_viladovarejo',      'assets/Audio/ambiente_viladovarejo.mp3');
        this.load.audio('ambiente_praiadosproveitos', 'assets/Audio/ambiente_praiadosproveitos.mp3');

        // ── Passos do personagem ──
        this.load.audio('passos_casacielita',        'assets/Audio/passos_casacielita.mp3');
        this.load.audio('passos_quebragelo',         'assets/Audio/passos_quebragelo.mp3');
        this.load.audio('passos_viladovarejo',       'assets/Audio/passos_viladovarejo.mp3');
        this.load.audio('passos_praiadosproveitos',  'assets/Audio/passos_praiadosproveitos.mp3');
        this.load.audio('passos_cidadecielo',        'assets/Audio/passos_cidadecielo.mp3');
        this.load.audio('passos_interiorcasas',      'assets/Audio/passos_interiorcasas.wav');

        // ── Narração da Introdução ──
        this.load.audio('blip_teclado', 'assets/Audio/blip_teclado.wav');

        // ── Áudio de clique ──
        this.load.audio('som_clique', 'assets/Audio/botoes_menu.wav');

        // ── Transições entre Mapas ──
        this.load.audio('transicao_ponte', 'assets/Audio/transicao_entre_mapas.wav');

        // ── Som de conquista de insígnia ──
        this.load.audio('som_insignia', 'assets/Audio/insignia_sound.mp3');
    }

    create() {
        this.scene.launch('AudioManager');
        this.time.delayedCall(100, () => {
            this.scene.start('MenuPrincipal');
        });
    }
}