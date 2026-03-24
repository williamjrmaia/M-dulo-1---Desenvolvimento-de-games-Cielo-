import Jogador        from "../Classes/Jogador.js";
import NPC            from "../Classes/NPC.js";
import DialogoManager from "../Classes/DialogoManager.js";

export default class VilaDoVarejo extends Phaser.Scene {
    constructor() {
        super('VilaDoVarejo');
    }

    init(data) {
        // Recebe de onde o jogador veio para decidir o ponto de spawn exato
        this.origem = data.vindoDe;
    }

    preload() {
        // Assets do mapa e elementos de interface para diálogos
        this.load.image('fundoVila', 'assets/VilaDoVarejo/vila_do_varejo.png');
        this.load.image('IndicadorE',   'assets/objetos/botao_e.png');
        this.load.image('balao',        'assets/objetos/balao_dialogo.png');

        // Spritesheets do Eric (o NPC informativo)
        this.load.spritesheet('eric_idle', 'assets/NPC/ERIC/spr_eric_front_idl.png', {frameWidth: 14, frameHeight: 19});
        this.load.spritesheet('eric_andar', 'assets/NPC/ERIC/spr_eric_front_walk.png', {frameWidth: 14, frameHeight: 19});
        this.load.spritesheet('eric_lado', 'assets/NPC/ERIC/spr_eric_side_walk.png', {frameWidth: 14, frameHeight: 19});
        this.load.spritesheet('eric_costas', 'assets/NPC/ERIC/spr_eric_back_walk.png', {frameWidth: 14, frameHeight: 19});

        // Spritesheets do Jorge (o NPC que gosta de dar voltas)
        this.load.spritesheet('jorge_idle', 'assets/NPC/JORGE/spr_jorge_front_idl.png', {frameWidth: 14, frameHeight: 19});
        this.load.spritesheet('jorge_andar', 'assets/NPC/JORGE/spr_jorge_front_walk.png', {frameWidth: 14, frameHeight: 19});
        this.load.spritesheet('jorge_lado', 'assets/NPC/JORGE/spr_jorge_side_walk.png', {frameWidth: 14, frameHeight: 19});
        this.load.spritesheet('jorge_costas', 'assets/NPC/JORGE/spr_jorge_back_walk.png', {frameWidth: 14, frameHeight: 19});
        
        // Dados de colisão exportados do Tiled
        this.load.json('hitboxesVila', 'assets/VilaDoVarejo/VilaDoVarejo.tmj'); 
    }

    create() {
        // Ferramenta de debug: clica no mapa e vê a coordenada no console. Mão na roda!
        this.input.on('pointerdown', (pointer) => {
            const worldX = pointer.worldX.toFixed(0);
            const worldY = pointer.worldY.toFixed(0);
            console.log(`x: ${worldX}, y: ${worldY}`);
        });

        this.fazendoTransicao = false;
        this.add.image(110, 0, 'fundoVila').setOrigin(0, 0).setScale(1);

        // Define até onde a física (e o jogador) pode ir
        this.physics.world.setBounds(110, 0, 1264, 842);
        
        // Cria as animações de caminhada e idle para Eric e Jorge simultaneamente
        NPC.criarAnimacoes(this, [
            { key: 'eric_idle',    frameRate: 3 },
            { key: 'eric_andar',   frameRate: 4 },
            { key: 'eric_lado',    frameRate: 4 },
            { key: 'eric_costas',  frameRate: 4 },
            { key: 'jorge_idle',   frameRate: 3 },
            { key: 'jorge_andar',  frameRate: 4 },
            { key: 'jorge_lado',   frameRate: 4 },
            { key: 'jorge_costas', frameRate: 4 },
        ]);

        this.grupoNPCs = this.physics.add.group();

        // ── Configuração do Eric ─────────────────────────────────────────────
        this.eric = new NPC(this, 515, 230, 'eric_idle', {
            velocidade: 40,
            distanciaInteracao: 30,
            flipDireita: true,
            grupoNPCs: this.grupoNPCs,
            animacoes: {
                idle: 'eric_idle', andar: 'eric_andar', costa: 'eric_costas', lado: 'eric_lado',
            },
            waypoints: [ // Rota de patrulha do Eric
                { x: 0, y: 0 }, { x: 390, y: 0 }, { x: 390, y: 300 },
                { x: 135, y: 300 }, { x: 135, y: 270 }, { x: 0, y: 270 }
            ],
        });
        this.eric.setScale(1.6);
        this.eric.setFalas([
            { personagem: 'Eric', texto: 'Eu ouvi que a loja de doces da Thainá estava com problemas na maquininha...' },
            { personagem: 'Jogador', texto: 'Obrigado!' },
        ]);

        // ── Configuração do Jorge ────────────────────────────────────────────
        this.jorge = new NPC(this, 1160, 680, 'jorge_idle', {
            velocidade: 50,
            distanciaInteracao: 30,
            grupoNPCs: this.grupoNPCs,
            animacoes: {
                idle: 'jorge_idle', andar: 'jorge_andar', costa: 'jorge_costas', lado: 'jorge_lado', 
            },
            waypoints: [ // Rota complexa do Jorge com uma pausa longa de 45 segundos
                {x: 0, y: 0}, {x: 0, y: 10}, {x: -260, y: 20}, {x: -260, y: 70},
                {x: -270, y: 70}, {x: -270, y: 80}, {x: -510, y: 80}, {x: -510, y: -80},
                {x: -580, y: -80}, {x: -580, y: -120, pausa: 45000},
                {x: -580, y: -80}, {x: -510, y: -80}, {x: -510, y: 80}, {x: -270, y: 80},
                {x: -270, y: 70}, {x: -260, y: 70}, {x: -260, y: 20}, {x: 0, y: 10}
            ]
        });
        this.jorge.setScale(1.6);
        this.jorge.setFalas([{ personagem: 'Jorge', texto: 'Forsche...' }]);

        // Faz os NPCs colidirem entre si (ninguém atravessa ninguém)
        this.physics.add.collider(this.grupoNPCs, this.grupoNPCs);

        // ── Jogador e Física ─────────────────────────────────────────────────
        this.personagem = new Jogador(this, 400, 300, 1.5);
        this.teclas = this.personagem.configurarTeclas();
        this.personagem.sprite.setCollideWorldBounds(true);
        this.personagem.adicionarColisao(this.grupoNPCs);
        
        this.obstaculos = this.physics.add.staticGroup();

        // Lê o JSON do Tiled e cria zonas de colisão invisíveis no mapa
        const mapData = this.cache.json.get('hitboxesVila');
        const offsetX = 112; // Ajuste para alinhar o mapa visual com a física
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

        // ── Gatilhos (Portas e Portais) ───────────────────────────────────────
        this.portaCasa1Varejo = this.add.zone(555, 225, 40, 30);
        this.portaCasa2Varejo = this.add.zone(1126, 450, 40, 30);
        this.portalGelo       = this.add.zone(270, 20, 25, 15);
        this.portalparapraia  = this.add.zone(1260, 40, 20, 20);

        [this.portaCasa1Varejo, this.portaCasa2Varejo, this.portalGelo, this.portalparapraia].forEach(p => this.physics.add.existing(p, true));

        this.physics.add.collider(this.personagem.sprite, this.obstaculos);

        // Câmera segue o jogador dentro dos limites da vila
        this.cameras.main.startFollow(this.personagem.sprite);
        this.cameras.main.setBounds(110, 0, 1264, 842);

        // ── Lógica de Spawn (Onde o player aparece ao entrar na cena) ────────
        if (this.origem === 'MapaGelo')          this.personagem.sprite.setPosition(270, 50);
        if (this.origem === 'PraiaDosProveitos') this.personagem.sprite.setPosition(1260, 70);
        if (this.origem === 'CasaVarejo1')       this.personagem.sprite.setPosition(555, 245);
        if (this.origem === 'CasaVarejo2')       this.personagem.sprite.setPosition(1125, 465);
        if (this.origem === 'CenaPonteV')        this.personagem.sprite.setPosition(270, 50);
        if (this.origem === 'NegociacaoThaina')  this.personagem.sprite.setPosition(400, 320);

        // Configura o zoom da UI de diálogo
        DialogoManager.configurarCameraUI(this, 1.7, [this.eric]);
    }

    update() {
        if (this.fazendoTransicao) return;

        // Atualiza o player e a lógica de movimento/diálogo dos NPCs
        this.personagem.atualizar();
        this.eric.atualizar(this.personagem.sprite, this.teclas.interagir);
        this.jorge.atualizar(this.personagem.sprite, this.teclas.interagir);

        // ── Verificação de Troca de Cena ──────────────────────────────────────
        if (this.personagem.temOverlap(this.portalGelo)) {
            this.trocarCena('CenaPonteV', { vindoDe: 'VilaDoVarejo' });
            return;
        }

        if (this.personagem.temOverlap(this.portalparapraia)) {
            this.trocarCena('PraiaDosProveitos', { vindoDe: 'VilaDoVarejo' });
            return;
        }

        // Portas precisam da tecla de interação (E)
        if (this.personagem.temOverlap(this.portaCasa1Varejo) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CasaVarejo1', { vindoDe: 'VilaDoVarejo' });
            return;
        }

        if (this.personagem.temOverlap(this.portaCasa2Varejo) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CasaVarejo2', { vindoDe: 'VilaDoVarejo' });
            return;
        }
    }

    // Função para transição suave (Fade Out)
    trocarCena(nomeCena, dados = {}) {
        this.fazendoTransicao = true;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(nomeCena, dados);
        });
    }
}