import Jogador from '../Classes/Jogador.js';

export default class PraiaDosProveitos extends Phaser.Scene {
    constructor() {
        super('PraiaDosProveitos');
    }

    init(data) {
        this.origem = data.vindoDe; 
    }

    preload() {
        // --- 1. CARREGAMENTO DOS ASSETS ---
        // Carrega a imagem do cenário
        this.load.image('fundoPraia', 'assets/PraiaDosProveitos/praia_dos_proveitos.png');
        
        // Carrega o arquivo TMJ (JSON do Tiled) para as hitboxes
        this.load.json('hitboxesPraia', 'assets/PraiaDosProveitos/PraiaDosProveitos.tmj'); 
    }

    create() {
        this.fazendoTransicao = false;

        // --- 2. POSICIONAMENTO DO FUNDO ---
        // Definimos a imagem no canto superior esquerdo (0,0) para alinhar com o Tiled
        const fundo = this.add.image(0, 0, 'fundoPraia').setOrigin(0, 0);
        
        // Dimensões da sua imagem (1264x842)
        const larguraMapa = fundo.width;
        const alturaMapa = fundo.height;

        // Limites do mundo físico (para o personagem não sair da imagem)
        this.physics.world.setBounds(0, 0, larguraMapa, alturaMapa);
        
        // --- 3. CRIAÇÃO DO JOGADOR ---
        this.personagem = new Jogador(this, 630, 800, 1.2);
        this.personagem.configurarTeclas();
        this.personagem.sprite.setCollideWorldBounds(true);
        
        // --- 4. IMPORTAÇÃO DAS HITBOXES DO TILED ---
        // Cria o grupo físico estático para os obstáculos
        this.obstaculos = this.physics.add.staticGroup();

        // Pega os dados do JSON carregado
        const mapData = this.cache.json.get('hitboxesPraia');

        // Como posicionamos o fundo em (0,0), não precisamos de offset!
        const offsetX = 3;
        const offsetY = 0;

        // Loop para ler as camadas de objeto do Tiled e criar as zonas de colisão
        if (mapData && mapData.layers) {
            mapData.layers.forEach(layer => {
                // Verifique se no Tiled você criou uma "Camada de Objetos" (Object Layer)
                if (layer.type === 'objectgroup' && layer.objects) {
                    layer.objects.forEach(obj => {
                        // Cria a zona física estática baseada nas coordenadas e tamanho do Tiled
                        let zona = this.add.zone(obj.x + offsetX, obj.y + offsetY, obj.width, obj.height).setOrigin(0, 0);
                        this.physics.add.existing(zona, true); // true = estático
                        this.obstaculos.add(zona);
                    });
                }
            });
        }

        // --- 5. CONFIGURAÇÃO DAS COLISÕES E CÂMERA ---
        // Adiciona a colisão entre o jogador e as hitboxes importadas
        this.physics.add.collider(this.personagem.sprite, this.obstaculos);
        
        // Configura a câmera para seguir o personagem e travar nas bordas da imagem
        this.cameras.main.startFollow(this.personagem.sprite);
        this.cameras.main.setZoom(2.4);
        this.cameras.main.setBounds(0, 0, larguraMapa, alturaMapa);
        this.cameras.main.fadeIn(500, 0, 0, 0);

        //Criando portais para transição
        this.PortalPonte1 = this.add.zone(630, 830, 20, 20)
        this.physics.add.existing(this.PortalPonte1, true)

        
        this.teclas = this.personagem.configurarTeclas();
    }

    update() {
        if (this.fazendoTransicao) return;

        this.personagem.atualizar();

        if (this.personagem.temOverlap(this.PortalPonte1)) {
            this.trocarCena('VilaDoVarejo', { vindoDe: 'PraiaDosProveitos' });
            return;
        }
    }

    // Método para transição de cena (mantenha como estava)
    trocarCena(nomeCena, dados = {}) {
        this.fazendoTransicao = true;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(nomeCena, dados);
        });
    }
}