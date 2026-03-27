import CenaPonte from '../Classes/CenaPonte.js';

export default class PonteMC_QG extends CenaPonte {
    constructor() {
        super('PonteMC_QG', {
            eixo:           'horizontal',
            assetKey:       'fundo_ponte',
            assetPath:      'assets/CenarioCasa/ponte.png',
            zoom:           4.4,
            cenaOrigem:     'MundoDaCielita',
            portalA:        { cena: 'MundoDaCielita' }, // esquerda
            portalB:        { cena: 'QuebraGelo'  }, // direita
            registryOrigem: 'CenaPonteh',
        });
    }
}