import Jogador        from '../Classes/Jogador.js';
import NPC            from '../Classes/NPC.js';
import DialogoManager from '../Classes/DialogoManager.js';
import CenaMapa       from '../Classes/CenaMapa.js';

export default class CasaPraiaGrande extends CenaMapa {

    constructor() {
        super('CasaPraiaGrande');
    }

    init(data) {
        // Recebe a cena de origem para saber para onde voltar ou onde spawnar
        this.origem = data?.vindoDe || null; 
    }

    preload() {
      
        this.load.image('CasaPraiaGrande', 'assets/PraiaDosProveitos/PraiaCasaGrande/CasaPraiaGrande.png');
        
        // Mantém a porta de saída
        this.load.image('portaSaida', 'assets/CenarioCasa/ROOM1-HOUSE/porta_cielita.png');

        // NOVO: Carrega o arquivo TMJ da Casa Praia Grande
        this.load.tilemapTiledJSON('mapaCasaPraiaGrande', 'assets/PraiaDosProveitos/PraiaCasaGrande/CasaPraiaGrande.tmj');
    }

    create() {
        // Pinta o fundo do "vazio" de preto
        this.cameras.main.setBackgroundColor('#000000');

        // Escala aplicada ao cenário extraída para uma variável (facilita o cálculo das hitboxes)
        const escalaCenario = 0.80;
        
        const cenario = this.add.image(0, 0, 'CasaPraiaGrande').setOrigin(0, 0).setScale(escalaCenario);
        const larguraImagem = cenario.displayWidth;
        const alturaImagem = cenario.displayHeight;

        // Limites físicos: prende o jogador dentro da área total da imagem
        this.physics.world.setBounds(0, 0, larguraImagem, alturaImagem);
 
        // ── Jogador ───────────────────────────────────────────────────────────
        this.jogador = new Jogador(this, larguraImagem / 2, 650); 
        this.jogador.sprite.setCollideWorldBounds(true);
        this.jogador.sprite.setScale(3);
        this.jogador.velocidade = 170;

        // ── Leitura de Hitboxes do Tiled ──────────────────────────────────────
        const mapa = this.make.tilemap({ key: 'mapaCasaPraiaGrande' });
        
        // ATENÇÃO: Verifique se o nome da camada no seu Tiled continua 'Object Layer 1'
        const camadaObjetos = mapa.getObjectLayer('Object Layer 1');
        
        if (camadaObjetos) {
            camadaObjetos.objects.forEach(obj => {
                if (obj.polygon) {
                    // Escala os pontos do polígono para 0.80
                    const pontosEscalados = obj.polygon.map(p => {
                        return { x: p.x * escalaCenario, y: p.y * escalaCenario };
                    });
                    
                    // Desenha o polígono (azul transparente para testar)
                    const poly = this.add.polygon(
                        obj.x * escalaCenario, 
                        obj.y * escalaCenario, 
                        pontosEscalados, 
                        0x0000ff, 
                        0.5 
                    ).setOrigin(0, 0); 
                    
                    this.physics.add.existing(poly, true);
                    this.jogador.adicionarColisao(poly); 
                    
                } else {
                    // Para zonas retangulares simples
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

        this.teclas = this.jogador.configurarTeclas();
        this.cameras.main.centerOn(larguraImagem / 2, alturaImagem / 2);
       
        // ── Porta de Saída ───────────────────────────────────────────────────
        
        // Lembre-se de ajustar o doorX e doorY para a porta do cenário "CasaPraiaGrande"
        const doorX = larguraImagem / 2; 
        const doorY = 700;

        this.add.image(doorX, doorY, 'portaSaida').setScale(2);
        
        this.PortaCasaPraiaGrande = this.add.zone(doorX, doorY, 60, 60);
        this.physics.add.existing(this.PortaCasaPraiaGrande, true);
    }

    update() {
        this.jogador.atualizar();

        // CORREÇÃO: Variável atualizada para PortaCasaPraiaGrande
        if (this.jogador.temOverlap(this.PortaCasaPraiaGrande) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                // CORREÇÃO: Atualizado o envio de onde o jogador está vindo
                this.scene.start('PraiaDosProveitos', { vindoDe: 'CasaPraiaGrande' });
            });
        }
    }
}