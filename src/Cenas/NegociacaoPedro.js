import CenaNegociacao from './CenaNegociacao.js';

export default class NegociacaoJoao extends CenaNegociacao {
    constructor() {
       super('NegociacaoJoao', {
           nomeCliente:       'joao',   // ← define pasta e chaves dos assets
           satisfacaoInicial: 50,       // 0 a 100
           cartasExigidas: {
                abordagem:    ['carta_cumprimento', 'carta_pessoa_certa'],
                sondagem:     ['carta_pergunta_negocio'],
                demonstracao: ['carta_maquininha'],
                negociacao:   ['carta_desconto'],
                fechamento:   ['carta_contrato'],
           },
           cartasPorFase: {
                abordagem:    5,
                sondagem:     4,
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
        // ... 
    }
    _falaAcertoFase(fase) {
        // ... 
    }
    _falaErroFase(fase)   {
        // ... 
    }
    _cenaDeRetorno()      { 
        return 'MapaGelo'; 
    }
}