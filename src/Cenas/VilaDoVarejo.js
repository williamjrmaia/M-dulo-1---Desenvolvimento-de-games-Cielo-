import Jogador from "../Classes/Jogador.js";

export default class VilaDoVarejo extends Phaser.Scene {
    constructor() {
        super('VilaDoVarejo');
    }

    init(data) {
        this.origem = data.vindoDe; 
    }

    preload() {
        // Carrega a imagem do cenário
        this.load.image('fundoVila', 'assets/VilaDoVarejo/vila_do_varejo.png');
        
        // Carrega o seu arquivo TMJ (que é um JSON gerado pelo Tiled)
        this.load.json('hitboxesVila', 'assets/VilaDoVarejo/VilaDoVarejo.tmj'); 
    }

    create() {

        this.fazendoTransicao = false;
        // Coloca o fundo primeiro
        this.add.image(110, 0, 'fundoVila').setOrigin(0, 0).setScale(1);
    
        // Limites do mundo (bordas da tela)
        this.physics.world.setBounds(110, 0, 1264, 842);
        
        // Cria o jogador
        this.personagem = new Jogador(this, 400, 300, 1.5);
        this.personagem.configurarTeclas();
        this.personagem.sprite.setCollideWorldBounds(true);
        
        // Cria um grupo físico estático para guardar todos os obstáculos do cenário
        this.obstaculos = this.physics.add.staticGroup();

        //Cria as hitbox vindo do Tiled
        const mapData = this.cache.json.get('hitboxesVila');

        // Valores de deslocamento (offset) para bater com a imagem de fundo
        const offsetX = 112;
        const offsetY = 4;

        //Posicionamento e criação da hitbox vindo do Tiled como um json
        if (mapData && mapData.layers) {
            mapData.layers.forEach(layer => {
                if (layer.type === 'objectgroup' && layer.objects) {
                    layer.objects.forEach(obj => {
                        // Agora somamos o offsetX e offsetY nas coordenadas!
                        let zona = this.add.zone(obj.x + offsetX, obj.y + offsetY, obj.width, obj.height).setOrigin(0, 0);
                        this.physics.add.existing(zona, true);
                        this.obstaculos.add(zona);
                    });
                }
            });
        }

        //Porta Casa1Varejo
        this.portaCasa1Varejo = this.add.zone(555, 225, 40, 30)
        this.physics.add.existing(this.portaCasa1Varejo, true);
        
        //Porta Casa2Varejo
        this.portaCasa2Varejo = this.add.zone(1126, 450, 40, 30)
        this.physics.add.existing(this.portaCasa2Varejo, true);

        //Portal para voltar ao Gelo
        this.portalGelo = this.add.zone(270, 20, 25, 15)
        this.physics.add.existing(this.portalGelo, true)

        // Adiciona a colisão entre o jogador e o grupo de obstáculos que acabamos de criar
        this.physics.add.collider(this.personagem.sprite, this.obstaculos);
        
        // Configura a câmera
        this.cameras.main.startFollow(this.personagem.sprite);
        this.cameras.main.setZoom(1.7);
        this.cameras.main.setBounds(110, 0, 1264, 842);

        if (this.origem === 'MapaGelo') {
            this.personagem.sprite.setPosition(270, 50);
        }
         if (this.origem === 'PraiaDosProveitos') {
            this.personagem.sprite.setPosition(1260, 70)
        }
        if (this.origem === 'CasaVarejo1') {
            this.personagem.sprite.setPosition(555, 245)
        }
        if (this.origem === 'CasaVarejo2') {
            this.personagem.sprite.setPosition(1125, 465)
        }
        this.portalparapraia = this.add.zone(1260, 40, 20, 20)
        this.physics.add.existing(this.portalparapraia, true)
}

    update() {

         if (this.fazendoTransicao) return;

        if (this.personagem) {
            this.personagem.atualizar();
        }

        if (this.personagem.temOverlap(this.portalGelo)) {
            this.trocarCena('MapaGelo', { vindoDe: 'VilaDoVarejo' });
            return;
        }

        if (this.personagem.temOverlap(this.portalparapraia)) {
            this.trocarCena('PraiaDosProveitos', { vindoDe: 'VilaDoVarejo' });
            return;
        }
         if (this.personagem.temOverlap(this.portaCasa1Varejo) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CasaVarejo1', { vindoDe: 'VilaDoVarejo' });
            return;
        }

         if (this.personagem.temOverlap(this.portaCasa2Varejo) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CasaVarejo2', { vindoDe: 'VilaDoVarejo' });
            return;
        }
        this.teclas = this.personagem.configurarTeclas();

         
    }

    trocarCena(nomeCena, dados = {}) {
        this.fazendoTransicao = true;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(nomeCena, dados);
        });
    }
}