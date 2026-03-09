import Jogador from './classes.js';

export default class MapaGelo extends Phaser.Scene {
    constructor() { 
        super('MapaGelo'); 
    }

    preload() {
        // Carregamento de imagens
        this.load.image('Ponte', '../assets/CenarioCasa/ponte.png');
        this.load.image('MapaGelo', '../assets/MapaGelo/MapaGelo.png');
        this.load.tilemapTiledJSON('mapa_dados', '../assets/MapaGelo/MapaGeloHitbox.tmj');
       
            
        // Carregamento do personagem
        this.load.spritesheet('Andando',    '../assets/animacoes/andarfrente.png',  { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('IdleFrente', '../assets/animacoes/idlefrente.png',   { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('Lado',       '../assets/animacoes/andarlado.png',    { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('Costa',      '../assets/animacoes/andarcosta.png',   { frameWidth: 64, frameHeight: 64 });
    }

    create() {
        // 1. Configurações Iniciais
        this.fazendoTransicao = false;
        const larguraMapa = 1500;
        const alturaMapa = 1200; 

        // Limites do mundo e câmera
        this.physics.world.setBounds(0, 0, larguraMapa, alturaMapa);
        this.cameras.main.setBounds(0, 0, larguraMapa, alturaMapa);

        // 2. Adição do Cenário e Personagem (APENAS UMA VEZ)
        const mapa = this.make.tilemap({ key: 'mapa_dados' });
        this.add.image(0, 0, 'MapaGelo').setOrigin(0, 0);
      
        
        this.personagem = new Jogador(this, 25, 212, 1.0);
        this.personagem.sprite.setCollideWorldBounds(true);
        

        // 3. HITBOXES DO TILED (Camada roxa 'Object Layer 1')
        const camadaObjetos = mapa.getObjectLayer('Object Layer 1');

        if (camadaObjetos) {
            camadaObjetos.objects.forEach(obj => {
                if (obj.polygon) {
                    // Se for polígono (curvas da terra)
                    const poly = this.add.polygon(obj.x, obj.y, obj.polygon, 0x0000ff, 0);
                    this.physics.add.existing(poly, true);
                    this.personagem.adicionarColisao(poly);
                } else {
                    // Se for retângulo (caixas/muros desenhados no Tiled)
                    let zonaTiled = this.add.zone(obj.x + (obj.width / 2), obj.y + (obj.height / 2), obj.width, obj.height);
                    this.physics.add.existing(zonaTiled, true);
                    this.personagem.adicionarColisao(zonaTiled);
                }
            });
        }

        // 4. SUAS HITBOXES MANUAIS (Mantidas como solicitado)
        
        // Portal (Física própria do Phaser)
        this.portalGelo = this.add.zone(10, 215, 10, 15);
        this.physics.add.existing(this.portalGelo);
        this.portalGelo.body.setImmovable(true);
        this.portalGelo.body.setAllowGravity(false);

        
        // 5. Configuração de Câmera e Controles
        this.teclas = this.personagem.configurarTeclas();
        this.cameras.main.startFollow(this.personagem.sprite);
        this.cameras.main.setZoom(2.6);
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }
        
    update() {
        this.personagem.atualizar();

        if (this.personagem.temOverlap(this.portalGelo)) {
            if (!this.fazendoTransicao) {
                this.fazendoTransicao = true;
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    this.scene.start('MundoCasa', { vindoDe: 'MapaGelo' });
                });
            }
        } else {
            this.fazendoTransicao = false;
        }
    }       
}