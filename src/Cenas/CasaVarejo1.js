import Jogador from '../Classes/Jogador.js';

export default class CasaVarejo1 extends Phaser.Scene {

    constructor() {
        super('CasaVarejo1');
    }

    init(data) {
        this.origem = data.vindoDe; 
    }

    preload() {
        // Carrega a imagem e o arquivo de hitboxes do Tiled
        this.load.image('CasaVarejo1', 'assets/VilaDoVarejo/CasaVarejo1/CasaVarejo1.png');
         this.load.image('PortaSaida', 'assets/CenarioCasa/ROOM1-HOUSE/porta_cielita.png');
        this.load.tilemapTiledJSON('mapaCasaVarejo1', 'assets/VilaDoVarejo/CasaVarejo1/CasaVarejo1.tmj');
    }

    create() {
        this.fazendoTransicao = false;

        //Porta de Saída
        
        

        // 1. Adiciona o cenário no centro
        const fundo = this.add.image(750, 400, 'CasaVarejo1');
        this.add.image(750, 510, 'PortaSaida').setScale(0.7);

        // TRUQUE: Calcula a distância do centro para empurrar as hitboxes depois
        const offsetX = fundo.x - (fundo.width / 2);
        const offsetY = fundo.y - (fundo.height / 2);
        
        const larguraMapa = 350;
        const alturaMapa = 233; 

        const xInicialFisica = 750 - (larguraMapa / 2);
        const yInicialFisica = 400 - (alturaMapa / 2);

        // 2. Limites da física (Paredes extras do mundo)
        this.physics.world.setBounds(xInicialFisica, yInicialFisica, larguraMapa, alturaMapa);
        
        // 3. Cria o Personagem
        this.personagem = new Jogador(this, 750, 480, 1);
        this.personagem.configurarTeclas();
        this.personagem.sprite.setCollideWorldBounds(true);

        // --- INÍCIO: LER AS HITBOXES DO TILED ---
        const mapa = this.make.tilemap({ key: 'mapaCasaVarejo1' });
        
        // Confirme se a camada se chama 'Object Layer 1' lá no Tiled também
        const camadaObjetos = mapa.getObjectLayer('Object Layer 1');
        
        if (camadaObjetos) {
            camadaObjetos.objects.forEach(obj => {
                if (obj.polygon) {
                    // Adicionando offsetX e offsetY. Deixei a opacidade em 0.5 para debugar!
                    const poly = this.add.polygon(obj.x + offsetX, obj.y + offsetY, obj.polygon, 0x0000ff, 0.5);
                    this.physics.add.existing(poly, true); // Corpo estático
                    this.personagem.adicionarColisao(poly);
                } else {
                    let zonaTiled = this.add.zone(
                        (obj.x + offsetX) + (obj.width / 2), 
                        (obj.y + offsetY) + (obj.height / 2), 
                        obj.width, 
                        obj.height
                    );
                    this.physics.add.existing(zonaTiled, true);
                    this.personagem.adicionarColisao(zonaTiled);
                }
            });
        }

        this.cameras.main.setBackgroundColor('#000000');
        this.cameras.main.centerOn(750, 400);
        this.cameras.main.setZoom(3.5); 

        //Porta para sair
        this.PortaCasaVarejo1 = this.add.zone(750, 510, 20, 10)
        this.physics.add.existing(this.PortaCasaVarejo1, true)

        this.teclas = this.personagem.configurarTeclas();

        
    }

    update() {
        if (this.fazendoTransicao) return;
        this.personagem.atualizar();    

        if (this.personagem.temOverlap(this.PortaCasaVarejo1) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('VilaDoVarejo', { vindoDe: 'CasaVarejo1' });
            return;
        }
        
    }

    trocarCena(nomeCena, dados = {}) {
        this.fazendoTransicao = true;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(nomeCena, dados);
        });
    }

}