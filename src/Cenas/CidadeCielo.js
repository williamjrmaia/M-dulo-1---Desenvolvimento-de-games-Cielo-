import Jogador        from "../Classes/Jogador.js";
import NPC            from "../Classes/NPC.js";
import DialogoManager from "../Classes/DialogoManager.js";
import CenaMapa       from "../Classes/CenaMapa.js"; // Certifique-se de que a importação está aqui!

export default class CidadeCielo extends CenaMapa {

    constructor() {
        super('CidadeCielo'); // 1. O nome da cena vai aqui!
    }

    init(data) {
        this.origem = data?.vindoDe || null;
    }

    preload() {
        this.load.image('CidadeCielo', './assets/CidadeCielo/CidadeCielo.png');
        this.load.tilemapTiledJSON('mapaCidadeCielo', './assets/CidadeCielo/CidadeCielo.tmj');
    }

    create() {
        super.create(); // 2. Chama a configuração de fade/câmera da CenaMapa AQUI!

        const escalaCenario = 1.5;

        const cenario = this.add.image(0, 0, 'CidadeCielo').setOrigin(0, 0).setScale(escalaCenario);
        const larguraImagem = cenario.displayWidth;
        const alturaImagem = cenario.displayHeight;

        this.physics.world.setBounds(0, 0, larguraImagem, alturaImagem);

        // ── Portas ───────────────────────────────────────────────────────────
        // Porta para o prédio principal
        this.PortaCasaCidade1 = this.add.zone(546, 567, 50, 25);
        this.physics.add.existing(this.PortaCasaCidade1, true);

        //Porta para a loja secundária
        this.PortaLojaCidade1 = this.add.zone(835, 150, 35, 25);
        this.physics.add.existing(this.PortaLojaCidade1, true);

        // ── Jogador ───────────────────────────────────────────────────────────
        this.jogador = new Jogador(this, larguraImagem / 2, 830); 
        this.jogador.sprite.setCollideWorldBounds(true);
        this.jogador.sprite.setScale(1.3);
        
        // ── Criação do Portal ─────────────────────────────────────────────────
        this.PortalCielo = this.add.zone(540, 880, 30, 20);
        this.physics.add.existing(this.PortalCielo, true);

        // ── Leitura de Hitboxes do Tiled ──────────────────────────────────────
        const mapa = this.make.tilemap({ key: 'mapaCidadeCielo' });
        const camadaObjetos = mapa.getObjectLayer('Object Layer 1');
        
        if (camadaObjetos) {
            camadaObjetos.objects.forEach(obj => {
                if (obj.polygon) {
                    const pontosEscalados = obj.polygon.map(p => {
                        return { x: p.x * escalaCenario, y: p.y * escalaCenario };
                    });
                    
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
        
        // ── Câmera ────────────────────────────────────────────────────────────
        this.cameras.main.startFollow(this.jogador.sprite);
        this.cameras.main.setZoom(2.3);
        this.cameras.main.setBounds(0, 0, larguraImagem, alturaImagem);

        // ── Posição Inicial baseada na origem ─────────────────────────────────
        if (this.origem === 'PraiaDosProveitos') {
            this.jogador.sprite.setPosition(540, 840); 
        }

        if (this.origem === 'CasaCidade1') {
            this.jogador.sprite.setPosition(546, 595); 
        }

         if (this.origem === 'CasaCidade2') {
            this.jogador.sprite.setPosition(835, 150); 
        }
    }

    update() {
        if (super.update()) return; // 3. Trava o update durante a transição (fade)

        this.jogador.atualizar();

        // Verifica o portal usando a variável correta (this.jogador)
        if (this.jogador.temOverlap(this.PortalCielo)) {
            this.trocarCena('PraiaDosProveitos');
            return;
        }

        if (this.jogador.temOverlap(this.PortaCasaCidade1) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CasaCidade1');
            return;
        }

         if (this.jogador.temOverlap(this.PortaLojaCidade1) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CasaCidade2');
            return;
        }
    }
}