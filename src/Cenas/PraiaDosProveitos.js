import CenaMapa from '../Classes/CenaMapa.js';
import Jogador from '../Classes/Jogador.js';
import NPC from '../Classes/NPC.js';
import DialogoManager from '../Classes/DialogoManager.js';

export default class PraiaDosProveitos extends CenaMapa {
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

        // Spritesheet da Cielita (introdução na entrada)
        this.load.spritesheet(
            'cielitaparada',
            './assets/NPC/cielita/idlecielita.png',
            { frameWidth: 16, frameHeight: 25 }
        );

        // Spritesheets do Felipe 
        this.load.spritesheet('felipe_idle',   'assets/NPC/FELIPE/spr_felipe_front_idl.png',  { frameWidth: 16, frameHeight: 22 });
        this.load.spritesheet('felipe_andar',  'assets/NPC/FELIPE/spr_felipe_front_walk.png', { frameWidth: 16, frameHeight: 22 });
        this.load.spritesheet('felipe_costas', 'assets/NPC/FELIPE/spr_felipe_back_walk.png',  { frameWidth: 16, frameHeight: 22 });
        this.load.spritesheet('felipe_lado',   'assets/NPC/FELIPE/spr_felipe_side_walk.png',  { frameWidth: 16, frameHeight: 22 });
        
        // Carrega o arquivo TMJ (JSON do Tiled) para as hitboxes
        this.load.json('hitboxesPraia', 'assets/PraiaDosProveitos/PraiaDosProveitos.tmj'); 
    }

    create() {
        super.create();

        this.registry.get('audio').tocarMusica('musica_praiadosproveitos', 0.5);
        this.registry.get('audio').tocarAmbiente('ambiente_praiadosproveitos', 0.4);

        // --- 2. POSICIONAMENTO DO FUNDO ---
        const fundo = this.add.image(0, 0, 'fundoPraia').setOrigin(0, 0);
        
        const larguraMapa = fundo.width;
        const alturaMapa = fundo.height;

        this.physics.world.setBounds(0, 0, larguraMapa, alturaMapa);
        
        // --- 3. CRIAÇÃO DO JOGADOR ---
        this.personagem = new Jogador(this, 630, 800, 1.2);
        this.personagem.superficiePasso = 'passos_praiadosproveitos';
        this.personagem.configurarTeclas();
        this.personagem.sprite.setCollideWorldBounds(true);
        this.personagem.sprite.setDepth(10);
        
        // --- 4. IMPORTAÇÃO DAS HITBOXES DO TILED ---
        this.obstaculos = this.physics.add.staticGroup();

        const mapData = this.cache.json.get('hitboxesPraia');

        const offsetX = 3;
        const offsetY = 0;

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

        // --- 5. CONFIGURAÇÃO DAS COLISÕES E CÂMERA ---
        this.physics.add.collider(this.personagem.sprite, this.obstaculos);
        
        this.cameras.main.startFollow(this.personagem.sprite);
        this.cameras.main.setZoom(2.4);
        this.cameras.main.setBounds(0, 0, larguraMapa, alturaMapa);

        // Portal de volta para a Vila do Varejo
        this.PortalPonte1 = this.add.zone(630, 830, 20, 20);
        this.physics.add.existing(this.PortalPonte1, true);

        // Portal para ir à CidadeCielo
        this.PortalCielo = this.add.zone(160, 25, 30, 15);
        this.physics.add.existing(this.PortalCielo, true);

        //Criando a PortaCasaPraia1
        this.PortaCasaPraia1 = this.add.zone(675, 500, 30, 30);
        this.physics.add.existing(this.PortaCasaPraia1, true)

        //Criando a PortaCasaPraia2
        this.PortaCasaPraia2 = this.add.zone(921, 685, 30, 30);
        this.physics.add.existing(this.PortaCasaPraia2, true)
        
        this.teclas = this.personagem.configurarTeclas();

        // ── Animações (Cielita + Felipe) ────────────────────────────────────
        NPC.criarAnimacoes(this, [
            { key: 'cielitaparada', frameRate: 3 },
            { key: 'felipe_idle',   frameRate: 4, start: 0, end: 3 }, // 4 frames de idle (frente)
            { key: 'felipe_andar',  frameRate: 6, start: 0, end: 3 }, // 4 frames de walk (frente)
            { key: 'felipe_costas', frameRate: 6, start: 0, end: 3 }, // 4 frames de walk (costas)
            { key: 'felipe_lado',   frameRate: 6, start: 0, end: 3 }, // reutiliza back_walk para lateral
        ]);

        this.grupoNPCs = this.physics.add.group();

        // ── NPC: Cielita ─────────────────────────────────────────────────────
        this.dialogoCielitaPraiaConcluido = this.registry.get('cielita_praia_concluida') || false;

        this.cielita = new NPC(this, 630, 660, 'cielitaparada', {
            velocidade: 0,
            distanciaInteracao: 60,
            grupoNPCs: this.grupoNPCs,
            animacoes: { idle: 'cielitaparada' },
            scaleIndicador: 1.3,
            onFimDialogo: () => {
                this.dialogoCielitaPraiaConcluido = true;
                this.registry.set('cielita_praia_concluida', true);
            },
        });

        this.cielita.setScale(1.1);
        this.cielita.setDepth(1);
        this.cielita.setFlipX(true);
        this.cielita.setFalas([
            { personagem: 'Cielita', texto: 'Bem-vindo à Praia dos Proveitos! O mar esconde caminhos e oportunidades.' },
            { personagem: 'Cielita', texto: 'Explore a praia, converse com os moradores e descubra seus segredos.' },
            { personagem: 'Cielita', texto: 'E encontre a chefa, ela é responsável pela maior movimentação comercial da praia.' },
            { personagem: 'Cielita', texto: 'Se precisar de ajuda, estarei aqui na entrada. Boa sorte!' },
            { personagem: 'Jogador', texto: 'Obrigado, Cielita! Vou explorar.' },
        ]);

        // ── NPC: Felipe ───────────────────────────────────────────────────────
        // Controla se o jogador já conversou com o Felipe
        this.dialogoFelipeConcluido = this.registry.get('felipe_praia_concluido') || false;

        // Felipe patrulha horizontalmente sobre o deck em loop contínuo.
        // Distância vertical: 0 (sem deslocamento vertical).
        // Distância horizontal: 420px (metade dos 840px originais) para um loop mais curto.
        this.felipe = new NPC(this, 370, 320, 'felipe_idle', {
            velocidade: 45,
            distanciaInteracao: 35,
            flipDireita: false,
            grupoNPCs: this.grupoNPCs,
            animacoes: {
                idle:  'felipe_idle',
                andar: 'felipe_andar',  // frente
                costa: 'felipe_costas', // costas
                lado:  'felipe_lado',   // lateral (back_walk espelhado)
            },
            onFimDialogo: () => {
                this.dialogoFelipeConcluido = true;
                this.registry.set('felipe_praia_concluido', true);
            },
            loop: true, // repete os waypoints em loop contínuo
            waypoints: [
                { x:    0, y: 0 }, // ponto inicial — extremidade esquerda do deck
                { x:  420, y: 0 }, // extremidade direita (metade do deck original)
                { x:    0, y: 0 }, // retorna à esquerda (fecha o loop)
            ],
        });
        this.felipe.setScale(1.3);
        this.felipe.setFalas([
            { personagem: 'Felipe', texto: 'Essa praia é incrível, né? Mas cuidado com as ondas — elas podem te surpreender!' },
            { personagem: 'Felipe', texto: 'Não só as ondas surpreendem, mas a chefa também.' },
            { personagem: 'Jogador', texto: 'Chefa? Quem é essa? Aliás, como você se chama?' },
            { personagem: 'Felipe', texto: 'Ah, me chamo Felipe. Sou um dos moradores daqui e conheço cada canto dessa praia. E você, como se chama?' },
            { personagem: 'Jogador', texto: `Prazer, Felipe! Me chamo ${this.personagem.nome}.` },
            { personagem: 'Felipe', texto: `Prazer, ${this.personagem.nome}! A Chefa é a dona do quiosque mais movimentado da praia, ela é uma figura e tanto!` },
            { personagem: 'Felipe', texto: 'Boatos dizem que ela foi responsável por quase quebrar a grande pousada da praia.' },
            { personagem: 'Felipe', texto: 'Ela é tão temida que até os vendedores ambulantes evitam se meter com ela.' },
            { personagem: 'Jogador', texto: 'Nossa, parece uma pessoa e tanto! Vou procurar o quiosque dela para descobrir mais.' },
            { personagem: 'Felipe', texto: 'Boa sorte! Se você gosta de desafios, a Chefa é a pessoa certa para conversar, agora vou ali dar uns mergulhos.' },
        ]);

        // NPCs não se atravessam
        this.physics.add.collider(this.grupoNPCs, this.grupoNPCs);

        // Colisão jogador ↔ NPCs
        this.personagem.adicionarColisao(this.cielita);
        this.personagem.adicionarColisao(this.grupoNPCs);

        // UI de diálogo (Cielita + Felipe)
        DialogoManager.configurarCameraUI(this, 2.4, [this.cielita, this.felipe]);

        if (!this.dialogoCielitaPraiaConcluido) {
            this.game.events.emit('atualizarBalao', { texto: 'Fale com a Cielita', visivel: true });
        }

        if (this.origem === 'CasaPraia1') this.personagem.sprite.setPosition(675, 530);
        if (this.origem === 'CasaPraia2') this.personagem.sprite.setPosition(923, 675);
        
        if (this.origem === 'CidadeCielo') this.personagem.sprite.setPosition(160, 50);
    }

    update() {
        if (super.update()) return;

        this.personagem.atualizar();

        // ── Atualiza NPCs ────────────────────────────────────────────────────
        if (this.cielita) {
            this.cielita.atualizar(this.personagem.sprite, this.teclas.interagir);
        }
        if (this.felipe) {
            this.felipe.atualizar(this.personagem.sprite, this.teclas.interagir);
        }

        // ── HUD (balão de orientação) ─────────────────────────────────────────
        const dialogoAberto = this.cielita?.dialogoAberto || this.felipe?.dialogoAberto;

        if (dialogoAberto) {
            this.game.events.emit('atualizarBalao', { texto: '', visivel: false });
        } else if (!this.dialogoCielitaPraiaConcluido) {
            this.game.events.emit('atualizarBalao', { texto: 'Fale com a Cielita', visivel: true });
        } else if (!this.dialogoFelipeConcluido) {
            const distFelipe = Phaser.Math.Distance.Between(
                this.personagem.sprite.x, this.personagem.sprite.y,
                this.felipe.x,            this.felipe.y
            );
            const pertoFelipe = distFelipe <= this.felipe._cfg.distanciaInteracao;
            this.game.events.emit('atualizarBalao', {
                texto: pertoFelipe ? 'Fale com o Felipe' : 'Procure pelo Felipe na Praia',
                visivel: true,
            });
        } else {
            this.game.events.emit('atualizarBalao', { texto: '', visivel: false });
        }

        // ── Portal de saída ───────────────────────────────────────────────────
        if (this.personagem.temOverlap(this.PortalPonte1)) {
            this.trocarCena('PonteVV_PP');
            return;
        }

        if (this.personagem.temOverlap(this.PortaCasaPraia1) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CasaPraia1');
            return;
        }

        if (this.personagem.temOverlap(this.PortalCielo)) {
            this.trocarCena('CidadeCielo');
         if (this.personagem.temOverlap(this.PortaCasaPraia2) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CasaPraia2');
            return;
        }
    }
}

        }
    
