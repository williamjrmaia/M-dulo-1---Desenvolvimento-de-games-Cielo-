import CenaNegociacao from '../Classes/CenaNegociacao.js';
import CartaAbordagem from '../Classes/FasesNegociacao/CartaAbordagem.js';
import CartaSondagem  from '../Classes/FasesNegociacao/CartaSondagem.js';
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
        });

        // Valores reais do cliente — revelados na sondagem e usados na demonstração
        this.aspectosCliente = {
            pessoas: 'baixo',
            lucro:   'alto',
            estoque: 'baixo',
        };
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
            // ── P: Propósito ──
            new CartaAbordagem({
                key:           'Proximidade',
                letra:         'P',
                correta:       true,
                dialogoAcerto: 'Claro! Sou o Pedro, dono do estabelecimento. Me conta mais.',
                dialogoErro:   'Não entendi o que você veio fazer aqui.',
            }),

            // ── I: Identificação ──
            new CartaAbordagem({
                key:           'Interesse',
                letra:         'I',
                correta:       true,
                dialogoAcerto: 'Ah, conheço sim! Boa referência.',
                dialogoErro:   'Isso não tem nada a ver com o meu negócio.',
            }),

            // ── F: Foco ──
            new CartaAbordagem({
                key:           'Familiaridade',
                letra:         'F',
                correta:       true,
                dialogoAcerto: 'Interessante, você não está aqui só pra vender. Pode continuar.',
                dialogoErro:   'Parece que você só quer me vender algo.',
            }),

            // ── E: Empatia ──
            new CartaAbordagem({
                key:           'Empatia',
                letra:         'E',
                correta:       true,
                dialogoAcerto: 'Faz sentido. Você entende a minha situação.',
                dialogoErro:   'Isso não se aplica ao meu caso.',
            }),

            // ── CPC: Contato com Pessoa Certa ──
            // Só fica disponível após P, I, F e E estarem preenchidos
            new CartaAbordagem({
                key:           'CPC',
                letra:         'CPC',
                correta:       true,
                dialogoAcerto: 'Ótimo! Você falou com a pessoa certa. Vamos continuar.',
                dialogoErro:   '', // CPC correto não tem erro
            }),
        ];
    }

    // ── Cartas da sondagem ────────────────────────────────────────────────────
    //
    // COMO ADICIONAR UMA CARTA NOVA:
    //
    //   new CartaSondagem({
    //       key:           'NomeDaCartaNoAsset',  // arquivo em assets/cartas/
    //       aspecto:       'lucro',               // 'pessoas', 'lucro' ou 'estoque'
    //       correta:       true,                  // false = carta errada (perde satisfação)
    //       dialogoAcerto: 'Fala do Pedro revelando o aspecto',
    //       dialogoErro:   'Fala do Pedro ao errar',
    //   }),
    //
    //   Regras:
    //   - Pode ter várias cartas do mesmo aspecto (corretas e erradas)
    //   - Uma carta errada não revela o ícone e perde satisfação
    //   - Os três aspectos precisam ser revelados para avançar de fase
    // ─────────────────────────────────────────────────────────────────────────

    _getCartasSondagem() {
        return [
            // ── Pessoas ──
            new CartaSondagem({
                key:           'LucroCerto',
                aspecto:       'lucro',
                correta:       true,
                dialogoAcerto: 'Atendo poucas pessoas por dia, mas são clientes fiéis.',
                dialogoErro:   'Isso não me ajuda a entender o meu fluxo de clientes.',
            }),

            // ── Lucro ──
            new CartaSondagem({
                key:           'LucroErrado',
                aspecto:       'lucro',
                correta:       false,
                dialogoAcerto: 'O negócio vai bem, tenho uma margem alta nos produtos.',
                dialogoErro:   'Essa pergunta não faz sentido pra mim agora.',
            }),

            // ── Estoque ──
            new CartaSondagem({
                key:           'Movimento',
                aspecto:       'pessoas',
                correta:       true,
                dialogoAcerto: 'Meu estoque gira pouco, trabalho com produtos especiais.',
                dialogoErro:   'Não entendo o que você quer saber com isso.',
            }),

            // ── Erradas (aspectos variados) ──
            new CartaSondagem({
                key:           'EstoqueErrado',
                aspecto:       'estoque',
                correta:       false,
                dialogoAcerto: '',
                dialogoErro:   'Isso não é relevante pra minha operação.',
            }),

            new CartaSondagem({
                key:           'EstoqueCerto',
                aspecto:       'estoque',
                correta:       true,
                dialogoAcerto: 'Tenho um estoque bem controlado, o que me permite oferecer produtos de qualidade.',
                dialogoErro:   'Não gosto desse tipo de abordagem.',
            }),
        ];
    }

    _falaInicioFase(fase) {
        const falas = {
            abordagem: 'Olá, boa tarde! Em que posso ajudar?',
            sondagem:  'Tudo bem, me conta mais. O que você tem em mente?',
        };
        return falas[fase] ?? 'O que você tem a me apresentar?';
    }

    _cenaDeRetorno() {
        return 'CenaCasaGelo';
    }
}