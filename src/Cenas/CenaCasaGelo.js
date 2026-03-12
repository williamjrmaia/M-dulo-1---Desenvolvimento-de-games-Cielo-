import Jogador from '../Classes/Jogador.js';
import DialogoPedro from '../Classes/DialogoPedro.js';


export default class CenaCasaGelo extends Phaser.Scene {
    constructor() { 
        super('CenaCasaGelo'); 
    }

     init(data) {
        this.origem = data.vindoDe; 
    }

   
      preload() {
    this.load.image('CasaPedro', 'assets/MapaGelo/CasaPedro.png');
    this.load.tilemapTiledJSON('mapa_casa', 'assets/MapaGelo/CasaPedroHitbox.tmj');

    // ← ADICIONE ESTAS LINHAS:
    this.load.image('IndicadorE', 'assets/objetos/botao_e.png');
    this.load.image('balao',      'assets/objetos/balao dialogo.png');
    this.load.image('seupedro_idl', 'assets/NPC/Pedro/spr_seupedro_front_idl_stop.png');
}

    create() {
    // 1. Configurações de Posicionamento
    const centerX = 750;
    const centerY = 400;

    // 2. Adicionar a imagem de fundo
    const bg = this.add.image(centerX, centerY, 'CasaPedro');
    console.log('bg tamanho:', bg.displayWidth, bg.displayHeight);
    console.log('bg visivel:', bg.visible);
    
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

    // NPC Seu Pedro
    this.seupedro = this.physics.add.sprite(710, 390, 'seupedro_idl');
    this.seupedro.setImmovable(true);
    this.seupedro.body.setAllowGravity(false);
    this.seupedro.setScale(1.5);
    this.seupedro.setDepth(5);

this.physics.add.collider(this.personagem.sprite, this.seupedro);



// Botão E acima da cabeça
this.indicadorE = this.add.image(0, 0, 'IndicadorE')
    .setDepth(15)
    .setVisible(false)
    .setScale(1.1);

// Distância de interação
this.DISTANCIA_INTERACAO = 80;

// Diálogo
this.dialogoPedro = new DialogoPedro(this, {
    caixaX:       this.cameras.main.width / 2,
    caixaY:       this.cameras.main.height - 80,
    caixaLargura: this.cameras.main.width,
    caixaAltura:  160,
});

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
        this.zonaInteracaoPedro = this.add.zone(750, 430, 300, 30);
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
        this.add.image(780, 400, 'Pedro').setScale(1.5).setDepth(1);
        // e na criação do personagem:
        this.personagem.sprite.setDepth(2);
    }

     update() {
    this.personagem.atualizar();

    // ── Interação com Seu Pedro ───────────────────────────────
    const dist = Phaser.Math.Distance.Between(
        this.personagem.sprite.x, this.personagem.sprite.y,
        this.seupedro.x,          this.seupedro.y
    );
    const perto = dist <= this.DISTANCIA_INTERACAO;

    this.indicadorE.setVisible(perto && !this.dialogoPedro.aberto);
    if (perto) {
        this.indicadorE.setPosition(
            this.seupedro.x,
            this.seupedro.y - (this.seupedro.displayHeight / 2) - 12
        );
    }

    if (!perto && this.dialogoPedro.aberto) {
        this.dialogoPedro.fechar();
    }

    // ── Portal de saída ───────────────────────────────────────
    const estaNoPortal     = this.physics.overlap(this.personagem.sprite, this.portaPedro);
    const apertouInteragir = Phaser.Input.Keyboard.JustDown(this.teclas.interagir);

    if (estaNoPortal && apertouInteragir && !this.dialogoPedro.aberto) {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MapaGelo', { vindoDe: 'CenaCasaGelo' });
        });
        return;
    }

    // ── Tecla E ───────────────────────────────────────────────
    if (apertouInteragir) {
        if (perto && !this.dialogoPedro.aberto) {
            this.dialogoPedro.abrir(() => {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('NegociacaoPedro');
    });
});
            return;
        }
        this.dialogoPedro.avancar();
    }
 }
}