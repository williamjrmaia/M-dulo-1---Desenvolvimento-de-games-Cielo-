import CenaNegociacao from '../Classes/CenaNegociacao.js';
import CartaAbordagem from '../Classes/FasesNegociacao/CartaAbordagem.js';
import Insignia       from '../Classes/Insignias.js';

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
                sondagem: ['PerguntaDeImpacto', 'GanchoDaDor'],
            },
            cartasPorFase: {
                sondagem: 6,
            },
        });
    }

    preload() {
        super.preload();
        this.load.image('Pedro_fundo', 'assets/MapaGelo/Cena01_house1.png');
        Insignia.preload(this);
    }

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

    // ── Cartas da abordagem ───────────────────────────────────────────────────
    //
    // COMO ADICIONAR UMA CARTA NOVA:
    //
    //   Copie um dos blocos abaixo e ajuste os campos:
    //
    //   new CartaAbordagem({
    //       key:          'NomeDaCartaNoAsset',  // arquivo em assets/cartas/
    //       letra:        'P',                   // 'P', 'I', 'F', 'E' ou 'CPC'
    //       correta:      true,                  // false = carta errada (perde satisfação)
    //       dialogoAcerto: 'Fala do Pedro ao acertar esta carta específica',
    //       dialogoErro:   'Fala do Pedro ao errar esta carta específica',
    //   }),
    //
    //   Regras:
    //   - Pode ter várias cartas da mesma letra (P, I, F ou E)
    //   - Só pode haver UMA carta com letra: 'CPC', e ela deve ter correta: true
    //   - A carta CPC só fica disponível após P, I, F e E estarem todos preenchidos
    //   - Cartas com correta: false sempre tiram satisfação ao serem jogadas,
    //     independente da letra
    // ─────────────────────────────────────────────────────────────────────────

    _getCartasAbordagem() {
        return [
            // ── P: Proximidade ──
            new CartaAbordagem({
                key:           'DiretoAoPonto',
                letra:         'P',
                correta:       true,
                dialogoAcerto: 'Claro! Sou o Pedro, dono do estabelecimento. Me conta mais.',
                dialogoErro:   'Não entendi o que você veio fazer aqui.',
            }),

            // ── I: Interesse ──
            new CartaAbordagem({
                key:           'GanchoSocial',
                letra:         'I',
                correta:       true,
                dialogoAcerto: 'Ah, conheço sim! Boa referência.',
                dialogoErro:   'Isso não tem nada a ver com o meu negócio.',
            }),

            // ── F: Familiaridade ──
            new CartaAbordagem({
                key:           'AntiPitch',
                letra:         'F',
                correta:       true,
                dialogoAcerto: 'Interessante, você não está aqui só pra vender. Pode continuar.',
                dialogoErro:   'Parece que você só quer me vender algo.',
            }),

            // ── E: Empatia ──
            new CartaAbordagem({
                key:           'ComparacaoInteligente',
                letra:         'E',
                correta:       true,
                dialogoAcerto: 'Faz sentido. Você entende a minha situação.',
                dialogoErro:   'Isso não se aplica ao meu caso.',
            }),

            // ── CPC: Contato com Pessoa Certa ──
            // Só fica disponível após P, I, F e E estarem preenchidos
            new CartaAbordagem({
                key:           'CartaCPC',
                letra:         'CPC',
                correta:       true,
                dialogoAcerto: 'Ótimo! Você falou com a pessoa certa. Vamos continuar.',
                dialogoErro:   '', // CPC correto não tem erro
            }),
        ];
    }

    // ── Fases restantes ───────────────────────────────────────────────────────

    _falaInicioFase(fase) {
        const falas = {
            abordagem: 'Olá, boa tarde! Em que posso ajudar?',
            sondagem:  'Tudo bem, me conta mais. O que você tem em mente?',
        };
        return falas[fase] ?? 'O que você tem a me apresentar?';
    }

    _falaAcertoFase(fase) {
        const falas = {
            sondagem: 'Entendi, isso faz bastante sentido. Continue...',
        };
        return falas[fase] ?? 'Pode continuar.';
    }

    _falaErroFase(fase) {
        const falas = {
            sondagem: 'Hm, isso não responde à minha situação.',
        };
        return falas[fase] ?? 'Não entendi sua estratégia.';
    }

    _getCartasDaFase(fase, quantidade) {
        const todasCartas = {
            sondagem: ['PerguntaDeImpacto', 'GanchoDaDor', 'AutoridadeImplicita', 'ChaveDeExclusividade', 'Cliffhanger', 'LoboCurioso'],
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