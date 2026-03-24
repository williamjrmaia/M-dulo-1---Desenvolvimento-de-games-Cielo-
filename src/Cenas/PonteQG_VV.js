import CenaPonte from '../Classes/CenaPonte.js';

export default class PonteQG_VV extends CenaPonte {
    constructor() {
        super('PonteQG_VV', {
            eixo:      'vertical',
            assetKey:  'fundo_ponte_v',
            assetPath: 'assets/CenarioCasa/ponte_transicao_vertical.png',
            zoom:      5.6,
            cenaOrigem: 'QuebraGelo',
            portalA:   { cena: 'QuebraGelo'   }, // cima
            portalB:   { cena: 'VilaDoVarejo' }, // baixo
        });
    }
}