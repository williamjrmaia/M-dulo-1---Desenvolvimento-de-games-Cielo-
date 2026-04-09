
import Jogador from '../Classes/Jogador.js';

export default class CasaCidade2 extends Phaser.Scene {

    constructor() {
        super('CasaCidade2');
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
        
        // ── Teclas ────────────────────────────────────────────────────────────
        this.teclas = this.jogador.configurarTeclas();
        
        // ── Câmera (Travada e com Zoom) ───────────────────────────────────────
        this.cameras.main.centerOn(larguraImagem / 2, alturaImagem / 2);
        this.cameras.main.setZoom(2); 

        // Porta para sair da casa
        
        this.PortaCasaCidade1 = this.add.zone(265, 380, 60, 20);
        this.physics.add.existing(this.PortaCasaCidade1, true);
    }

    update() {
        // 1. Corrigido de personagem para jogador
        this.jogador.atualizar();

        // 2. Corrigido de personagem para jogador na verificação da porta
        if (this.jogador.temOverlap(this.PortaCasaCidade1) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('CidadeCielo', { vindoDe: 'CasaCidade2' });
            });
        }
        }
    }
   