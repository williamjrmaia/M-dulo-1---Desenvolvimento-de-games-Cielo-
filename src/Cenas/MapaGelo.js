import Jogador from '../Classes/Jogador.js';

export default class MapaGelo extends Phaser.Scene {
    constructor() { 
        super('MapaGelo'); 
    }

     init(data) {
        this.origem = data.vindoDe; 
    }

    preload() {
        this.load.image('Ponte', './assets/CenarioCasa/ponte.png');
        this.load.image('MapaGelo', './assets/MapaGelo/MapaGelo.png');
        this.load.image('Placa', './assets/MapaGelo/PlacaCasaPedro.png');
        this.load.tilemapTiledJSON('mapa_dados', './assets/MapaGelo/MapaGeloHitbox.tmj');
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
                    // retângulos do Tiled usam topo-esquerdo; zone usa centro — por isso o offset de width/2 e height/2
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
        //Porta para Casa do Pedro
        this.geloPorta = this.add.zone(622, 190, 17, 20);
        this.physics.add.existing(this.geloPorta, true);
        //Porta para CasaGelo2
        this.GeloPortaCasa2 = this.add.zone(400, 675, 20, 20);
        this.physics.add.existing(this.GeloPortaCasa2, true);
        
        this.geloPorta2 = this.add.zone(685, 190, 17, 20);
        this.physics.add.existing(this.geloPorta2, true);

        //Portal para VilaDoVarejo
        this.portalVarejo = this.add.zone(897, 1015, 25, 15)
        this.physics.add.existing(this.portalVarejo, true)
        
        //Parede em baixo do portal pra não vazar do mapa
        this.ParedePortal = this.add.zone(897, 1025, 70, 5)
        this.physics.add.existing(this.ParedePortal, true)


        this.teclas = this.personagem.configurarTeclas();
        this.cameras.main.startFollow(this.personagem.sprite);
        this.cameras.main.setZoom(2.6);
        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.cameras.main.setBounds(0, 0, 1024, 1024);

        if (this.origem === 'CenaCasaGelo') {
            this.personagem.sprite.setPosition(655, 210)
        }

        if (this.origem === 'VilaDoVarejo') {
            this.personagem.sprite.setPosition(897, 980)
        }
         if (this.origem === 'CasaGelo2') {
            this.personagem.sprite.setPosition(400, 675)
        }
         if (this.origem === 'CenaPonteV') {
            this.personagem.sprite.setPosition(897, 980);
        }
       

    }
        
    update() {
        // Se já estiver mudando de cena, ignora o resto
        if (this.fazendoTransicao) return;

        this.personagem.atualizar();

        // 1. Lógica do Portal Lateral (Saída automática)
        if (this.personagem.temOverlap(this.portalGelo)) {
            this.trocarCena('CenaPonteh', { vindoDe: 'MapaGelo' });
            return;
        }



        // Portal Varejo (automático)
         if (this.personagem.temOverlap(this.portalVarejo)) {
            console.log('overlap portalVarejo detectado, indo para CenaPontev');
            this.trocarCena('CenaPonteV', { vindoDe: 'MapaGelo' });
            return;
        }


        // 2. Lógica das Portas (Interação com a tecla 'E')
        // Checamos individualmente se ele está em uma OU na outra porta
        const naPorta1 = this.personagem.temOverlap(this.geloPorta);
        const naPorta2 = this.personagem.temOverlap(this.geloPorta2);
        const naPortaGelo2 = this.personagem.temOverlap(this.GeloPortaCasa2)

        if (naPorta1 || naPorta2) {
            // Se estiver em qualquer porta e apertar a tecla de interagir
            if (Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
                this.trocarCena('CenaCasaGelo');
            }
        }

         if (naPortaGelo2) {
            // Se estiver em qualquer porta e apertar a tecla de interagir
            if (Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
                this.trocarCena('CasaGelo2');
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