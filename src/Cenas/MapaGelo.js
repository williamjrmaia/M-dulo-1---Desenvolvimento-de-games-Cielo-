import Jogador from './classes.js';

export default class MapaGelo extends Phaser.Scene {
    constructor() { 
        super('MapaGelo'); 
    }

     init(data) {
        this.origem = data.vindoDe; 
    }

    preload() {
        this.load.image('Ponte', '../assets/CenarioCasa/ponte.png');
        this.load.image('MapaGelo', '../assets/MapaGelo/MapaGelo.png');
        this.load.image('Placa', '../assets/MapaGelo/PlacaCasaPedro.png');
        this.load.tilemapTiledJSON('mapa_dados', '../assets/MapaGelo/MapaGeloHitbox.tmj');
            
        this.load.spritesheet('Andando',    '../assets/animacoes/andarfrente.png',  { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('IdleFrente', '../assets/animacoes/idlefrente.png',   { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('Lado',       '../assets/animacoes/andarlado.png',    { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('Costa',      '../assets/animacoes/andarcosta.png',   { frameWidth: 64, frameHeight: 64 });
    }

    create() {
        this.fazendoTransicao = false;
        const larguraMapa = 1500;
        const alturaMapa = 1200; 

        this.physics.world.setBounds(0, 0, larguraMapa, alturaMapa);
        this.cameras.main.setBounds(0, 0, larguraMapa, alturaMapa);

        const mapa = this.make.tilemap({ key: 'mapa_dados' });
        this.add.image(0, 0, 'MapaGelo').setOrigin(0, 0);
      
        this.personagem = new Jogador(this, 25, 212, 1.0);
        this.personagem.sprite.setCollideWorldBounds(true);

        //Placa Casa do Pedro
        this.add.image(655, 155, 'Placa').setScale(0.4);

        // HITBOXES DO TILED
        const camadaObjetos = mapa.getObjectLayer('Object Layer 1');
        if (camadaObjetos) {
            camadaObjetos.objects.forEach(obj => {
                if (obj.polygon) {
                    const poly = this.add.polygon(obj.x, obj.y, obj.polygon, 0x0000ff, 0);
                    this.physics.add.existing(poly, true);
                    this.personagem.adicionarColisao(poly);
                } else {
                    let zonaTiled = this.add.zone(obj.x + (obj.width / 2), obj.y + (obj.height / 2), obj.width, obj.height);
                    this.physics.add.existing(zonaTiled, true);
                    this.personagem.adicionarColisao(zonaTiled);
                }
            });
        }

        // PORTAL (Automático)
        this.portalGelo = this.add.zone(10, 215, 10, 15);
        this.physics.add.existing(this.portalGelo, true);

        // PORTAS (Interação com E)
        this.geloPorta = this.add.zone(622, 190, 17, 20);
        this.physics.add.existing(this.geloPorta, true);
        
        this.geloPorta2 = this.add.zone(685, 190, 17, 20);
        this.physics.add.existing(this.geloPorta2, true);
        
        this.teclas = this.personagem.configurarTeclas();
        this.cameras.main.startFollow(this.personagem.sprite);
        this.cameras.main.setZoom(2.6);
        this.cameras.main.fadeIn(500, 0, 0, 0);

        if (this.origem === 'CenaCasaGelo') {
            this.personagem.sprite.setPosition(655, 210)
        }

    }
        
    update() {
        // Se já estiver mudando de cena, ignora o resto
        if (this.fazendoTransicao) return;

        this.personagem.atualizar();

        // 1. Lógica do Portal Lateral (Saída automática)
        if (this.personagem.temOverlap(this.portalGelo)) {
            this.trocarCena('MundoCasa', { vindoDe: 'MapaGelo' });
            return;
        }

        // 2. Lógica das Portas (Interação com a tecla 'E')
        // Checamos individualmente se ele está em uma OU na outra porta
        const naPorta1 = this.personagem.temOverlap(this.geloPorta);
        const naPorta2 = this.personagem.temOverlap(this.geloPorta2);

        if (naPorta1 || naPorta2) {
            // Se estiver em qualquer porta e apertar a tecla de interagir
            if (Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
                this.trocarCena('CenaCasaGelo');
            }
        }
    }

    // Função auxiliar para evitar repetição de código e bugs de colisão dupla
    trocarCena(nomeCena, dados = {}) {
        this.fazendoTransicao = true;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(nomeCena, dados);
        });
    }
}