import CenaPonte from '../Classes/CenaPonte.js';
 
export default class PonteVV_PP extends CenaPonte {
    constructor() {
        super('PonteVV_PP', {
        eixo:       'vertical',
        assetKey:   'fundo_ponte_v',
        assetPath:  'assets/CenarioCasa/ponte_transicao_vertical.png',
        zoom:       5.6,
        cenaOrigem: 'PraiaDosProveitos',   // quem vem da praia spawna em cima e anda para baixo
        portalA:    { cena: 'PraiaDosProveitos' }, // cima  → volta para a praia
        portalB:    { cena: 'VilaDoVarejo'     }, // baixo → chega na vila
        });
    }
}