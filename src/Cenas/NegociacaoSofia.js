import CenaNegociacao from '../Classes/CenaNegociacao.js';

// Pontuação extra por produto — somada ao GANHO_SATISFACAO base
const PONTUACAO_PRODUTO = {
    CieloLioOn:  10,
    CieloFlash:  15,
    CVBA:        20,
    CieloFlash2: 25,
};

export default class NegociacaoSofia extends CenaNegociacao {
    constructor() {
        super('NegociacaoSofia', {
            nomeCliente:       'Sofia',
            satisfacaoInicial: 0,
            cartasExigidas: {
                abordagem:    ['DiretoAoPonto', 'GanchoSocial', 'AntiPitch'],
                sondagem:     ['PerguntaDeImpacto', 'GanchoDaDor'],
                //demonstracao: ['CieloLioOn', 'CieloFlash', 'CVBA', 'CieloFlash2'],
               // negociacao:   ['Ajuste', 'Validacao', 'Quebra'],
               // fechamento:   ['Adicional', 'Alternativo', 'Desconto','Teste'],
            },
            cartasPorFase: {
                abordagem:    5,
                sondagem:     6,
                demonstracao: 4,
                negociacao:   3,
                fechamento:   4,
            },
        });
    }

    _chaveVitoria() {
        return 'pedro_vencido';
    }

    // Insígnia concedida ao vencer a negociação com Sofia
    _getInsignia() {
        return {
            key:  'insignia_sofia',
            path: 'assets/insignias/InsigniaAbordagem1.png',
            nome: 'Mestre da Negociação',
        };
    }

    _getPontuacaoCarta(key) {
        return PONTUACAO_PRODUTO[key] ?? 0;
    }

    _falaInicioFase(fase) {
        const falas = {
            abordagem:    'Olá, boa tarde! Em que posso ajudar?',
            demonstracao: 'Essa maquininha parece interessante. O que ela faz de bom?',
            negociacao:   'O serviço é bom, mas esse custo está alto para o meu bolso.',
            fechamento:   'Bom, se os termos forem esses, podemos assinar.',
        };
        return falas[fase] ?? 'O que você tem a me apresentar?';
    }

    _falaAcertoFase(fase) {
        const falas = {
            abordagem:    'Claro, sou a dona do estabelecimento! Me chamo Sofia.',
            sondagem:     'Entendi, isso faz bastante sentido. Continue...',
            demonstracao: 'Interessante! Esse produto parece atender bem o que preciso.',
            negociacao:   'As condições parecem razoáveis.',
            fechamento:   'Fechado! Bem-vindo à Cielo.',
        };
        return falas[fase] ?? 'Pode continuar.';
    }

    _falaErroFase(fase) {
        const falas = {
            abordagem:  'Não estou interessada nisso. Obrigado.',
            sondagem:   'Hm, isso não responde à minha situação.',
            negociacao: 'Não consigo aceitar essas condições.',
            fechamento: 'Não acho que chegamos a um acordo.',
        };
        return falas[fase] ?? 'Não entendi sua estratégia.';
    }

    _getCartasDaFase(fase, quantidade) {
        const todasCartas = {
            abordagem:    ['DiretoAoPonto', 'GanchoSocial', 'AntiPitch', 'ComparacaoInteligente', 'DesarmeElegante'],
            sondagem:     ['PerguntaDeImpacto', 'GanchoDaDor', 'AutoridadeImplicita', 'ChaveDeExclusividade', 'Cliffhanger', 'LoboCurioso'],
            demonstracao: ['CieloLioOn', 'CieloFlash', 'CieloFlash2', 'CVBA'],
            negociacao:   ['Ajuste', 'Validacao', 'Quebra'],
            fechamento:   ['Adicional', 'Alternativo', 'Desconto', 'Penalidade', 'Teste'],
        };

        const exigidas     = this.clienteConfig.cartasExigidas[fase] ?? [];
        const disponiveis  = todasCartas[fase] ?? [];
        const embaralhadas = Phaser.Utils.Array.Shuffle([...disponiveis]);

        return Array.from({ length: quantidade }, (_, i) => {
            const key = embaralhadas[i] ?? `carta_${fase}_${i}`;
            return { key, fase, obrigatoria: exigidas.includes(key) };
        });
    }

    preload() {
        super.preload();
        this.load.image('Sofia_fundo', 'assets/MapaGelo/Scene2_House2.png');
    }

    _cenaDeRetorno() {
        return 'CasaGelo2';
    }
}