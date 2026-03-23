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
        this.load.image('fundoVila', 'assets/VilaDoVarejo/vila_do_varejo.png');
        //diálogo
        this.load.image('IndicadorE',   'assets/objetos/botao_e.png');
        this.load.image('balao',        'assets/objetos/balao_dialogo.png');

        //eric
        this.load.spritesheet('eric_idle', 'assets/NPC/ERIC/spr_eric_front_idl.png', {frameWidth: 14, frameHeight: 19});
        this.load.spritesheet('eric_andar', 'assets/NPC/ERIC/spr_eric_front_walk.png', {frameWidth: 14, frameHeight: 19});
        this.load.spritesheet('eric_lado', 'assets/NPC/ERIC/spr_eric_side_walk.png', {frameWidth: 14, frameHeight: 19});
        this.load.spritesheet('eric_costas', 'assets/NPC/ERIC/spr_eric_back_walk.png', {frameWidth: 14, frameHeight: 19});

        //jorge
        this.load.spritesheet('jorge_idle', 'assets/NPC/JORGE/spr_jorge_front_idl.png', {frameWidth: 14, frameHeight: 19});
        this.load.spritesheet('jorge_andar', 'assets/NPC/JORGE/spr_jorge_front_walk.png', {frameWidth: 14, frameHeight: 19});
        this.load.spritesheet('jorge_lado', 'assets/NPC/JORGE/spr_jorge_side_walk.png', {frameWidth: 14, frameHeight: 19});
        this.load.spritesheet('jorge_costas', 'assets/NPC/JORGE/spr_jorge_back_walk.png', {frameWidth: 14, frameHeight: 19});
        
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

        this.add.image(110, 0, 'fundoVila').setOrigin(0, 0).setScale(1);

        this.physics.world.setBounds(110, 0, 1264, 842);
        
        NPC.criarAnimacoes(this, [
            //ERIC ANIMS -------------------------
            { key: 'eric_idle',    frameRate: 3 },
            { key: 'eric_andar',   frameRate: 4 },
            { key: 'eric_lado',    frameRate: 4 },
            { key: 'eric_costas',  frameRate: 4 },
            //JORGE ANIMS ------------------------
            { key: 'jorge_idle',   frameRate: 3 },
            { key: 'jorge_andar',  frameRate: 4 },
            { key: 'jorge_lado',   frameRate: 4 },
            { key: 'jorge_costas', frameRate: 4 },
        ]);

        //Grupo de colisão
        this.grupoNPCs = this.physics.add.group();

        this.eric = new NPC(this, 515, 230, 'eric_idle', {
        velocidade: 40,
        distanciaInteracao: 30,
        flipDireita: true,
        grupoNPCs: this.grupoNPCs,       // registra no grupo automaticamente
        animacoes: {
            idle:  'eric_idle',          // chaves de animações criadas na cena
            andar: 'eric_andar',         // frente
            costa: 'eric_costas',        // costas
            lado:  'eric_lado',          // lateral
        },
        waypoints: [                     // relativos à posição de spawn
            { x:   0, y:  0 },
            { x: 390, y:  0 },
            { x: 390, y: 300 },
            { x: 135,   y: 300 },
            { x: 135, y: 270 },
            { x: 0, y: 270 }
        ],});
        this.eric.setScale(1.6);
        this.eric.setFalas([
        { personagem: 'Eric',      texto: 'Eu ouvi que a loja de doces da Thainá estava com problemas na maquininha...' },
        { personagem: 'Jogador',   texto: 'Obrigado!'  },
        ]);

        this.jorge = new NPC(this, 1160, 680, 'jorge_idle', {
            velocidade: 50,
            distanciaInteracao: 30,
            grupoNPCs: this.grupoNPCs,
            animacoes: {
                idle:  'jorge_idle',
                andar: 'jorge_andar',
                costa: 'jorge_costas',  
                lado:  'jorge_lado', 
            },
            waypoints: [ {x: 0, y: 0},
                         {x: 0, y:10},
                         {x: -260, y:20},
                         {x: -260, y: 70},
                         {x: -270, y:70},
                         {x: -270, y: 80},
                         {x: -510, y: 80},
                         {x: -510, y: -80},
                         {x: -580, y: -80},
                         {x: -580, y: -120, pausa: 45000},
                         {x: -580, y: -80},
                         {x: -510, y: -80},
                         {x: -510, y: 80},
                         {x: -270, y: 80},
                         {x: -270, y:70},
                         {x: -260, y: 70},
                         {x: -260, y:20},
                         {x: 0, y:10}

            ]
        });
        this.jorge.setScale(1.6);
        this.jorge.setFalas([ 
            { personagem: 'Jorge', texto: 'Forsche...'} 
        ]);

        this.physics.add.collider(this.grupoNPCs, this.grupoNPCs);

        // Cria o jogador
        this.personagem = new Jogador(this, 400, 300, 1.5);
        this.teclas = this.personagem.configurarTeclas();
        this.personagem.sprite.setCollideWorldBounds(true);
        
        this.personagem.adicionarColisao(this.grupoNPCs);
        
        // Cria um grupo físico estático para guardar todos os obstáculos do cenário
        this.obstaculos = this.physics.add.staticGroup();

        const mapData = this.cache.json.get('hitboxesVila');
        const offsetX = 112;
        const offsetY = 4;

        if (mapData && mapData.layers) {
            mapData.layers.forEach(layer => {
                if (layer.type === 'objectgroup' && layer.objects) {
                    layer.objects.forEach(obj => {
                        let zona = this.add.zone(obj.x + offsetX, obj.y + offsetY, obj.width, obj.height).setOrigin(0, 0);
                        this.physics.add.existing(zona, true);
                        this.obstaculos.add(zona);
                    });
                }
            });
        }

        this.portaCasa1Varejo = this.add.zone(555, 225, 40, 30);
        this.physics.add.existing(this.portaCasa1Varejo, true);

        this.portaCasa2Varejo = this.add.zone(1126, 450, 40, 30);
        this.physics.add.existing(this.portaCasa2Varejo, true);

        this.portalGelo = this.add.zone(270, 20, 25, 15);
        this.physics.add.existing(this.portalGelo, true);

        this.portalparapraia = this.add.zone(1260, 40, 20, 20);
        this.physics.add.existing(this.portalparapraia, true);

        this.physics.add.collider(this.personagem.sprite, this.obstaculos);

        this.cameras.main.startFollow(this.personagem.sprite);
        this.cameras.main.setBounds(110, 0, 1264, 842);

        if (this.origem === 'MapaGelo') {
            this.personagem.sprite.setPosition(270, 50);
        }
        if (this.origem === 'PraiaDosProveitos') {
            this.personagem.sprite.setPosition(1260, 70);
        }
        if (this.origem === 'CasaVarejo1') {
            this.personagem.sprite.setPosition(555, 245);
        }
        if (this.origem === 'CasaVarejo2') {
            this.personagem.sprite.setPosition(1125, 465);
        }
        if (this.origem === 'CenaPonteV') {
            this.personagem.sprite.setPosition(270, 50);
        }
        
        if (this.origem === 'NegociacaoThaina') {
            this.personagem.sprite.setPosition(400, 320);
        }

        DialogoManager.configurarCameraUI(this, 1.7, [this.eric, this.jorge]);
    }

    update() {
        if (this.fazendoTransicao) return;

        this.personagem.atualizar();
        this.eric.atualizar(this.personagem.sprite, this.teclas.interagir);
        this.jorge.atualizar(this.personagem.sprite, this.teclas.interagir);

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

        if (this.personagem.temOverlap(this.portaCasa2Varejo) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CasaVarejo2', { vindoDe: 'VilaDoVarejo' });
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
