import Jogador from '../Classes/Jogador.js';


export default class CenaCasaGelo extends Phaser.Scene {
    constructor() { 
        super('CenaCasaGelo'); 
    }

     init(data) {
        this.origem = data.vindoDe; 
    }

    preload() {
        this.load.image('CasaPedro', './assets/MapaGelo/CasaPedro.png');
        this.load.tilemapTiledJSON('mapa_casa', './assets/MapaGelo/CasaPedroHitbox.tmj');
    }

    create() {
    // 1. Configurações de Posicionamento
    const centerX = 750;
    const centerY = 400;

    // 2. Adicionar a imagem de fundo
    const bg = this.add.image(centerX, centerY, 'CasaPedro');
    
    // 3. Carregar o Mapa para ler os dados do Tiled
    const map = this.make.tilemap({ key: 'mapa_casa' });
    
    // 4. Criar o Personagem
    // Ajustei a posição inicial para não nascer dentro de uma parede
    this.personagem = new Jogador(this, centerX, centerY + 100, 1.0);
    this.personagem.sprite.setScale(1.3);
    this.personagem.sprite.setCollideWorldBounds(true);
    this.teclas = this.personagem.configurarTeclas();

    // 5. CRIAÇÃO DAS HITBOXES
    const paredes = this.physics.add.staticGroup();
    
    // MUDANÇA AQUI: Use o nome exato que está no Tiled ('Object Layer 1')
    const objetoCamada = map.getObjectLayer('Object Layer 1');
    
    if (objetoCamada) {
        // Calculamos onde o mapa começa no mundo do Phaser
        // Se a imagem está no centro (750, 400), o topo-esquerdo é:
        const offsetX = centerX - (bg.displayWidth / 2);
        const offsetY = centerY - (bg.displayHeight / 2);

        objetoCamada.objects.forEach(obj => {
            // Criamos uma zona de colisão baseada na posição do Tiled + Offset da imagem
            let x = 408 + obj.x + (obj.width / 2);
            let y = 124 + obj.y + (obj.height / 2);
            
            let zona = this.add.zone(x, y, obj.width, obj.height);
            this.physics.add.existing(zona, true); // true = estático
            paredes.add(zona);
        });
    } else {
        console.error("Camada 'Object Layer 1' não encontrada! Verifique o nome no Tiled.");
    }

    // 6. Ativar Colisão entre o sprite e o grupo de paredes
    this.physics.add.collider(this.personagem.sprite, paredes);

    // 7. Câmera
    this.cameras.main.startFollow(this.personagem.sprite);
    this.cameras.main.setZoom(2.4);
    this.cameras.main.fadeIn(500, 0, 0, 0);

   
    this.portaPedro = this.add.zone(751, 530, 45, 15);
    this.physics.add.existing(this.portaPedro);
    this.portaPedro.body.setAllowGravity(false);
    this.portaPedro.body.moves = false;

    this.personagem.configurarTeclas();

    

        // ✅ ZONA DE INTERAÇÃO COM PEDRO
        this.zonaInteracaoPedro = this.add.zone(750, 300, 200, 200);
        this.physics.world.enable(this.zonaInteracaoPedro);
        this.zonaInteracaoPedro.body.setImmovable(true);
        this.zonaInteracaoPedro.body.setAllowGravity(false);
        
        // Configurar overlap para disparar a negociação
        this.physics.add.overlap(
            this.personagem.sprite, 
            this.zonaInteracaoPedro, 
            this.irParaNegociacao, 
            null, 
            this
        );
    }

    irParaNegociacao() {
        console.log("Iniciando negociação com Pedro...");
        this.cameras.main.fadeOut(500, 0, 0, 0);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('NegociacaoPedro');
        });
    }

    update() {
  
    this.personagem.atualizar();

    // 1. CORREÇÃO: O nome deve ser 'portaPedro', o mesmo que você criou lá em cima
    // Usamos o retorno da física diretamente
    const estaNoPortal = this.physics.overlap(this.personagem.sprite, this.portaPedro);
    
    // 2. Pegar o input de interagir
    const apertouInteragir = Phaser.Input.Keyboard.JustDown(this.teclas.interagir);

    if (estaNoPortal && apertouInteragir) {
        console.log("Saindo para o mapa...");
        this.cameras.main.fadeOut(500, 0, 0, 0); 
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MapaGelo', { vindoDe: 'CenaCasaGelo' });
        });
    }
}


}
    
