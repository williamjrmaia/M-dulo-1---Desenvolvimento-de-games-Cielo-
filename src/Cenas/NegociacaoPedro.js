import CenaNegociacao from './CenaNegociacao.js';

export default class NegociacaoPedro extends CenaNegociacao {
    constructor() {
       super('NegociacaoPedro', {
           nomeCliente:       'pedro',   // ← define pasta e chaves dos assets
           satisfacaoInicial: 50,       // 0 a 100
           cartasExigidas: {
                abordagem:    ['DiretoAoPonto', 'GanchoSocial', 'AntiPitch'],
                sondagem:     ['carta_pergunta_negocio'],
                demonstracao: ['carta_maquininha'],
                negociacao:   ['carta_desconto'],
                fechamento:   ['carta_contrato'],
           },
           cartasPorFase: {
                abordagem:    5,
                sondagem:     4,
                produtos:     4,
                demonstracao: 3,
                negociacao:   3,
                fechamento:   3,
           },
       });
    }
    preload() {
           super.preload(); // ← SEMPRE chame o super
           // Assets extras específicos deste cliente se precisar       
          }

    //Personalize as falas do cliente
    _falaInicioFase(fase) {
        const falas = {
            abordagem:  "Olá, boa tarde! Em que posso ajudar?",
            sondagem:   "Pois é, os negócios estão indo, mas sinto que poderia ser melhor.",
            demonstracao: "Ah, essa maquininha parece ser interesante. O que ela faz de bom?",
            negociacao: "O serviço é bom, mas esse custo está alto para o meu bolso.",
            fechamento: "Bom, se os termos forem esses, podemos assinar."
        };
        return falas[fase] || "Pode continuar...";
    }
    // Quando o jogador usa as cartas certas

    _falaAcertoFase(fase) {
        const falas = {
            abordagem: "Claro, sou o dono do estabelecimento! Me chamo Pedro.",
        };
        return falas[fase] || "Pode continuar";
    }
    _falaErroFase(fase)   {
         const falas = {
            abordagem: "Não estou interessado nisso. Obrigado.",
        };
        return falas[fase] || "Não entendi sua estratégia";
    }
    _cenaDeRetorno()      { 
        return 'MapaGelo'; 
    }
}