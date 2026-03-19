import Jogador        from "../Classes/Jogador.js";
import NPC            from "../Classes/NPC.js";
import DialogoManager from "../Classes/DialogoManager.js";

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
        //diálogo
        this.load.image('IndicadorE',   'assets/objetos/botao_e.png');
        this.load.image('balao',        'assets/objetos/balao_dialogo.png');

        this.load.spritesheet('eric_idle', 'assets/NPC/ERIC/spr_eric_front_idl.png', {frameWidth: 14, frameHeight: 19});
        this.load.spritesheet('eric_andar', 'assets/NPC/ERIC/spr_eric_front_walk.png', {frameWidth: 14, frameHeight: 19});
        this.load.spritesheet('eric_lado', 'assets/NPC/ERIC/spr_eric_side_walk.png', {frameWidth: 14, frameHeight: 19});
        this.load.spritesheet('eric_costas', 'assets/NPC/ERIC/spr_eric_back_walk.png', {frameWidth: 14, frameHeight: 19});
        
        // Carrega o seu arquivo TMJ (que é um JSON gerado pelo Tiled)
        this.load.json('hitboxesVila', 'assets/VilaDoVarejo/VilaDoVarejo.tmj'); 

        
    }

    create() {

        //debug para coordenadas
        this.input.on('pointerdown', (pointer) => {
    const worldX = pointer.worldX.toFixed(0);
    const worldY = pointer.worldY.toFixed(0);
    console.log(`x: ${worldX}, y: ${worldY}`);
});

        this.fazendoTransicao = false;
        // Coloca o fundo primeiro
        this.add.image(110, 0, 'fundoVila').setOrigin(0, 0).setScale(1);
    
        // Limites do mundo (bordas da tela)
        this.physics.world.setBounds(110, 0, 1264, 842);
        
        this.anims.create({
            key: 'eric_idle',
            frames: this.anims.generateFrameNumbers('eric_idle', { start: 0, end: 3 }),
            frameRate: 3,
            repeat: -1
        });

        this.anims.create({
            key: 'eric_andar',
            frames: this.anims.generateFrameNumbers('eric_andar', { start: 0, end: 3 }),
            frameRate: 4,
            repeat: -1
        });

        this.anims.create({
            key: 'eric_lado',
            frames: this.anims.generateFrameNumbers('eric_lado', { start: 0, end: 3 }),
            frameRate: 4,
            repeat: -1
        });

        this.anims.create({
            key: 'eric_costas',
            frames: this.anims.generateFrameNumbers('eric_costas', { start: 0, end: 3 }),
            frameRate: 4,
            repeat: -1
        });

        //Grupo de colisão
        this.grupoNPCs = this.physics.add.group();

        this.eric = new NPC(this, 515, 230, 'eric_idle', {
        velocidade: 40,
        distanciaInteracao: 30,
        flipDireita: true,
        grupoNPCs: this.grupoNPCs,        // registra no grupo automaticamente
        animacoes: {
            idle:  'eric_idle',          // chaves de animações criadas na cena
            andar: 'eric_andar',         // frente
            costa: 'eric_costas',        // costas
            lado:  'eric_lado',          // lateral
        },
        waypoints: [                      // relativos à posição de spawn
            { x:   0, y:  0 },
            { x: 390, y:  0 },
            { x: 390, y: 300 },
            { x: 135,   y: 300},
            { x: 135, y: 270},
            { x: 0, y: 270}
        ],});
        this.eric.setScale(1.6);
        this.eric.setFalas([
        { personagem: 'Eric',      texto: 'Eu ouvi que a loja de doces da Thainá estava com problemas na maquininha...' },
        { personagem: 'Jogador',   texto: 'Obrigado!'  },
        ]);


        this.physics.add.collider(this.grupoNPCs, this.grupoNPCs);

        // Cria o jogador
        this.personagem = new Jogador(this, 400, 300, 1.5);
        this.teclas = this.personagem.configurarTeclas();
        this.personagem.sprite.setCollideWorldBounds(true);
        
        this.personagem.adicionarColisao(this.grupoNPCs);
        
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

        //Portal para voltar ao Gelo
        this.portalGelo = this.add.zone(270, 20, 25, 15)
        this.physics.add.existing(this.portalGelo, true)

        // Adiciona a colisão entre o jogador e o grupo de obstáculos que acabamos de criar
        this.physics.add.collider(this.personagem.sprite, this.obstaculos);
        
        // Configura a câmera
        this.cameras.main.startFollow(this.personagem.sprite);
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
        if (this.origem === 'CenaPonteV') {
            this.personagem.sprite.setPosition(270, 50);
        }
        
        this.portalparapraia = this.add.zone(1260, 40, 20, 20)
        this.physics.add.existing(this.portalparapraia, true)

        DialogoManager.configurarCameraUI(this, 1.7, [this.eric]);
}

    update() {

         if (this.fazendoTransicao) return;

        this.personagem.atualizar();
        this.eric.atualizar(this.personagem.sprite, this.teclas.interagir);

        if (this.personagem.temOverlap(this.portalGelo)) {
            this.trocarCena('CenaPonteV', { vindoDe: 'VilaDoVarejo' });
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

         
    }

    trocarCena(nomeCena, dados = {}) {
        this.fazendoTransicao = true;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(nomeCena, dados);
        });
    }
}