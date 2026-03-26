
import Jogador from '../Classes/Jogador.js';

export default class CasaPraia1 extends Phaser.Scene {

    constructor() {
        super('CasaPraia1');
    }

    init(data) {
        this.origem = data?.vindoDe || null;
    }

    preload() {
        // Carrega a imagem do cenário
        this.load.image('CasaPraia1', 'assets/PraiaDosProveitos/PraiaCasa1/CasaPraia1.png');
        this.load.image('portaSaida',      'assets/CenarioCasa/ROOM1-HOUSE/porta_cielita.png');

        // Carrega o arquivo do Tiled com base na sua foto do diretório
        this.load.tilemapTiledJSON('mapaCasaPraia1', 'assets/PraiaDosProveitos/PraiaCasa1/CasaPraia1.tmj');
    }

    create() {

        
        // Pinta o fundo do "vazio" de preto
        this.cameras.main.setBackgroundColor('#000000');

        // Escala aplicada ao cenário (vamos usar essa variável para multiplicar as hitboxes depois)
        const escalaCenario = 1.5;

        // Adiciona o cenário ancorado no 0,0
        const cenario = this.add.image(0, 0, 'CasaPraia1').setOrigin(0, 0).setScale(escalaCenario);
        const larguraImagem = cenario.displayWidth;
        const alturaImagem = cenario.displayHeight;

        this.add.image(265, 380, 'portaSaida').setScale(2)

        // Limites físicos: prende o jogador dentro da área total da imagem
        this.physics.world.setBounds(0, 0, larguraImagem, alturaImagem);

        // ── Jogador ───────────────────────────────────────────────────────────
        this.jogador = new Jogador(this, larguraImagem / 2, 330); 
        this.jogador.sprite.setCollideWorldBounds(true);
        this.jogador.sprite.setScale(1.5);
        
        // ── Leitura de Hitboxes do Tiled ──────────────────────────────────────
        const mapa = this.make.tilemap({ key: 'mapaCasaPraia1' });
        
        // ATENÇÃO: Verifique se o nome da camada no Tiled é exatamente 'Object Layer 1'
        const camadaObjetos = mapa.getObjectLayer('Object Layer 1');
        
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

        // ── Teclas ────────────────────────────────────────────────────────────
        this.teclas = this.jogador.configurarTeclas();
        
        // ── Câmera (Travada e com Zoom) ───────────────────────────────────────
        this.cameras.main.centerOn(larguraImagem / 2, alturaImagem / 2);
        this.cameras.main.setZoom(2); 

        // Porta para sair da casa
        
        this.PortaCasaPraia1 = this.add.zone(265, 380, 60, 20);
        this.physics.add.existing(this.PortaCasaPraia1, true);
    }

    update() {
        // 1. Corrigido de personagem para jogador
        this.jogador.atualizar();

        // 2. Corrigido de personagem para jogador na verificação da porta
        if (this.jogador.temOverlap(this.PortaCasaPraia1) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('PraiaDosProveitos', { vindoDe: 'CasaPraia1' });
            });
        }
        }
    }
   