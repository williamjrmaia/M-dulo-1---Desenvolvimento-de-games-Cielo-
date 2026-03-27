import CenaNegociacao from '../Classes/CenaNegociacao.js';

const PONTUACAO_PRODUTO = {
    CieloLioOn:  10,
    CieloFlash:  15,
    CVBA:        20,
    CieloFlash2: 25,
};

export default class NegociacaoJulia extends CenaNegociacao {
    constructor() {
        super('NegociacaoJulia', {
            nomeCliente:       'Chefa',        // bate com Chefa_feliz / Chefa_neutro / Chefa_brava
            satisfacaoInicial: 0,
            fases:             ['abordagem', 'sondagem'],
            cartasExigidas: {
                abordagem: ['DiretoAoPonto', 'GanchoSocial', 'AntiPitch'],
                sondagem:  ['PerguntaDeImpacto', 'GanchoDaDor'],
            },
            cartasPorFase: {
                abordagem: 5,
                sondagem:  6,
            },
        });
    }

    preload() {
        super.preload();
        // sprites da Chefa já carregados no Preloader:
        // Chefa_feliz, Chefa_neutro, Chefa_brava, sprite_chefa
    }

    _getPontuacaoCarta(key) {
        return PONTUACAO_PRODUTO[key] ?? 0;
    }

    _falaInicioFase(fase) {
        const falas = {
            abordagem: 'Olá! Posso ajudar?',
            sondagem:  'Tudo bem. Me conta mais, o que você tem em mente?',
        };
        return falas[fase] ?? 'O que você tem a me apresentar?';
    }

    _falaAcertoFase(fase) {
        const falas = {
            abordagem: 'Boa abordagem! Sou a Julia, responsável pelo estabelecimento.',
            sondagem:  'Entendi. Continue, estou prestando atenção.',
        };
        return falas[fase] ?? 'Pode continuar.';
    }

    _falaErroFase(fase) {
        const falas = {
            abordagem: 'Não tenho interesse. Obrigada.',
            sondagem:  'Isso não se aplica à minha realidade.',
        };
        return falas[fase] ?? 'Não entendi sua estratégia.';
    }

    _getCartasDaFase(fase, quantidade) {
        const todasCartas = {
            abordagem: ['DiretoAoPonto', 'GanchoSocial', 'AntiPitch', 'ComparacaoInteligente', 'DesarmeElegante'],
            sondagem:  ['PerguntaDeImpacto', 'GanchoDaDor', 'AutoridadeImplicita', 'ChaveDeExclusividade', 'Cliffhanger', 'LoboCurioso'],
        };

        const exigidas     = this.clienteConfig.cartasExigidas[fase] ?? [];
        const disponiveis  = todasCartas[fase] ?? [];
        const embaralhadas = Phaser.Utils.Array.Shuffle([...disponiveis]);

        return Array.from({ length: quantidade }, (_, i) => {
            const key = embaralhadas[i] ?? `carta_${fase}_${i}`;
            return { key, fase, obrigatoria: exigidas.includes(key) };
        });
    }

    _cenaDeRetorno() {
        return 'PraiaDosProveitos';
    }
}