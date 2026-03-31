import CenaNegociacao from '../Classes/CenaNegociacao.js';
import Insignia       from '../Classes/Insignias.js';

// Pontuação extra por produto — somada ao GANHO_SATISFACAO base
const PONTUACAO_PRODUTO = {
    CieloLioOn:  10,
    CieloFlash:  15,
    CVBA:        20,
    CieloFlash2: 25,
};

export default class NegociacaoPedro extends CenaNegociacao {
    constructor() {
        super('NegociacaoPedro', {
            nomeCliente:       'Pedro',
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
        this.load.image('Pedro_fundo', 'assets/MapaGelo/Cena01_house1.png');

        // Carrega os assets de todas as insígnias
        Insignia.preload(this);
    }

    // Chamado internamente por CenaNegociacao ao vencer a negociação
    _aoVencer() {
        const insignia = new Insignia(this, 'mapa_gelo');
        insignia.conceder();
    }

    _chaveVitoria() {
        return 'pedro_vencido';
    }

    _getPontuacaoCarta(key) {
        return PONTUACAO_PRODUTO[key] ?? 0;
    }

    _falaInicioFase(fase) {
        const falas = {
            abordagem: 'Olá, boa tarde! Em que posso ajudar?',
            sondagem:  'Tudo bem, me conta mais. O que você tem em mente?',
        };
        return falas[fase] ?? 'O que você tem a me apresentar?';
    }

    _falaAcertoFase(fase) {
        const falas = {
            abordagem: 'Claro, sou o dono do estabelecimento! Me chamo Pedro.',
            sondagem:  'Entendi, isso faz bastante sentido. Continue...',
        };
        return falas[fase] ?? 'Pode continuar.';
    }

    _falaErroFase(fase) {
        const falas = {
            abordagem: 'Não estou interessado nisso. Obrigado.',
            sondagem:  'Hm, isso não responde à minha situação.',
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
        return 'QuebraGelo';
    }
}