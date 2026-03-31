import Jogador from '../Classes/Jogador.js';

export default class CasaPraia2 extends Phaser.Scene {

    constructor() {
        super('CasaPraia2'); // Certifique-se de que a chave da cena é 'CasaPraia2'
    }

    init(data) {
        this.origem = data?.vindoDe || null;
    }

    preload() {
        // CORREÇÃO: Carrega a imagem do cenário da Casa 2 com a chave 'CasaPraia2'
        this.load.image('CasaPraia2', 'assets/PraiaDosProveitos/PraiaCasa2/CasaPraia2.png');
        
        // Mantém a porta de saída
        this.load.image('portaSaida', 'assets/CenarioCasa/ROOM1-HOUSE/porta_cielita.png');

        // CORREÇÃO ESSENCIAL: Carrega o arquivo TMJ da Casa 2. Demos a chave 'mapaCasaPraia2' para ele.
        // Baseado no diretório: assets/PraiaDosProveitos/PraiaCasa2/CasaPraia2.tmj
        this.load.tilemapTiledJSON('mapaCasaPraia2', 'assets/PraiaDosProveitos/PraiaCasa2/CasaPraia2.tmj');
    }

    create() {
        // Pinta o fundo do "vazio" de preto
        this.cameras.main.setBackgroundColor('#000000');

        // Escala aplicada ao cenário
        const escalaCenario = 1.5;

        // CORREÇÃO: Usa a imagem correta ('CasaPraia2') ancorada no 0,0
        const cenario = this.add.image(0, 0, 'CasaPraia2').setOrigin(0, 0).setScale(escalaCenario);
        const larguraImagem = cenario.displayWidth;
        const alturaImagem = cenario.displayHeight;

        // Limites físicos: prende o jogador dentro da área total da imagem
        this.physics.world.setBounds(0, 0, larguraImagem, alturaImagem);

        // ── Jogador ───────────────────────────────────────────────────────────
        this.jogador = new Jogador(this, larguraImagem / 2, 330); 
        this.jogador.sprite.setCollideWorldBounds(true);
        this.jogador.sprite.setScale(1.5);
        
        // ── Leitura de Hitboxes do Tiled (CÓDIGO ADICIONADO AQUI) ────────────────
        // 1. Cria o mapa usando a chave CORRETA carregada no preload
        const mapa = this.make.tilemap({ key: 'mapaCasaPraia2' });
        
        // ATENÇÃO: Verifique se o nome da camada no Tiled é exatamente 'Object Layer 1'
        const camadaObjetos = mapa.getObjectLayer('Object Layer 1');
        
        // 2. Loop para processar os objetos (COPIADO DA CASAPRAIA1 E ADAPTADO)
        if (camadaObjetos) {
            camadaObjetos.objects.forEach(obj => {
                if (obj.polygon) {
                    // Como a imagem tem scale de 1.5, precisamos escalar os pontos do polígono
                    const pontosEscalados = obj.polygon.map(p => {
                        return { x: p.x * escalaCenario, y: p.y * escalaCenario };
                    });
                    
                    // Desenha o polígono escalado (azul transparente para você ver e testar)
                    // Dica: mude o 0.5 final para 0.0 quando quiser que fique invisível
                    const poly = this.add.polygon(
                        obj.x * escalaCenario, 
                        obj.y * escalaCenario, 
                        pontosEscalados, 
                        0x0000ff, 
                        0.5 
                    ).setOrigin(0, 0); 
                    
                    this.physics.add.existing(poly, true);
                    this.jogador.adicionarColisao(poly); // Vincula à colisão do seu jogador
                    
                } else {
                    // Para zonas retangulares simples (móveis, paredes retas)
                    let larguraTiled = obj.width * escalaCenario;
                    let alturaTiled = obj.height * escalaCenario;
                    
                    let zonaTiled = this.add.zone(
                        (obj.x * escalaCenario) + (larguraTiled / 2), 
                        (obj.y * escalaCenario) + (alturaTiled / 2), 
                        larguraTiled, 
                        alturaTiled
                    );
                    
                    this.physics.add.existing(zonaTiled, true);
                    this.jogador.adicionarColisao(zonaTiled);
                }
            });
        }
        // ────────────────────────────────────────────────────────────────────────

        // ── Teclas e Câmera ─────────────────────────────────────────────────────
        this.teclas = this.jogador.configurarTeclas();
        this.cameras.main.centerOn(larguraImagem / 2, alturaImagem / 2);
        this.cameras.main.setZoom(2); 

        // ── Porta de Saída ───────────────────────────────────────────────────
        
        // ATENÇÃO: Eu mantive as coordenadas da Casa 1 (265, 380) para desenhar a porta.
        // Como o cenário da Casa 2 é diferente, você PRECISA verificar e ajustar estas
        // coordenadas para que a porta fique desenhada no local correto do novo cenário.
        const doorX = 265; 
        const doorY = 380;

        this.add.image(doorX, doorY, 'portaSaida').setScale(2);
        
        // Renomeei para PortaCasaPraia2 para evitar confusão futura
        this.PortaCasaPraia2 = this.add.zone(doorX, doorY, 60, 20);
        this.physics.add.existing(this.PortaCasaPraia2, true);
    }

    update() {
        this.jogador.atualizar();

        // CORREÇÃO: Usando a variável renomeada PortaCasaPraia2
        if (this.jogador.temOverlap(this.PortaCasaPraia2) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                // CORREÇÃO: Envia que veio da 'CasaPraia2'
                this.scene.start('PraiaDosProveitos', { vindoDe: 'CasaPraia2' });
            });
        }
    }
}