import Jogador        from "../Classes/Jogador.js";
import NPC            from "../Classes/NPC.js";
import DialogoManager from "../Classes/DialogoManager.js";
import CenaMapa from "../Classes/CenaMapa.js";

export default class VilaDoVarejo extends CenaMapa {
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

        // Spritesheet da Cielita (guia inicial)
        this.load.spritesheet(
            'cielitaparada',
            './assets/NPC/cielita/idlecielita.png',
            { frameWidth: 16, frameHeight: 25 }
        );

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

        super.create();

        const nomeJogador = this.game.registry.get('nomeJogador')
                 || localStorage.getItem('nomeJogador')
                 || 'Jogador';

        this.registry.get('audio').tocarMusica('musica_viladovarejo', 0.5);
        this.registry.get('audio').tocarAmbiente('passos_viladovarejo', 0.5);

        // Ferramenta de debug: clica no mapa e vê a coordenada no console.
        this.input.on('pointerdown', (pointer) => {
            const worldX = pointer.worldX.toFixed(0);
            const worldY = pointer.worldY.toFixed(0);
            console.log(`x: ${worldX}, y: ${worldY}`);
        });
        this.add.image(110, 0, 'fundoVila').setOrigin(0, 0).setScale(1);

        // Define até onde a física (e o jogador) pode ir
        this.physics.world.setBounds(110, 0, 1264, 842);
        
        // Cria as animações de caminhada e idle para Eric e Jorge simultaneamente
        NPC.criarAnimacoes(this, [
            { key: 'cielitaparada', frameRate: 3 },
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

        // Controla se o diálogo inicial da Cielita já foi concluído
        this.dialogoCielitaConcluido = this.registry.get('cielita_varejo_concluido') || false;
        // Controla se o jogador já conversou com o Eric (próxima missão)
        this.dialogoEricConcluido = this.registry.get('eric_varejo_concluido') || false;

        // ── NPC: Cielita ─────────────────────────────────────────────────────
        // Guia de introdução ao mapa da Vila do Varejo
        this.cielita = new NPC(this, 270, 230, 'cielitaparada', {
            velocidade: 0,
            distanciaInteracao: 60,
            grupoNPCs: this.grupoNPCs,
            animacoes: { idle: 'cielitaparada' },
            scaleIndicador: 1.3,
            onFimDialogo: () => {
                this.dialogoCielitaConcluido = true;
                this.registry.set('cielita_varejo_concluido', true);
            },
        });
        
        this.cielita.setScale(1.5);
        // Ajuste: virar o sprite para a direção "frente" (evita ficar espelhado no idle)
        this.cielita.setFlipX(true);
        this.cielita.setDepth(1);
        this.cielita.setFalas([
            { personagem: 'Cielita', texto: 'Bem-vindo à Vila do Varejo! Aqui, cada esquina tem uma nova oportunidade.' },
            { personagem: 'Cielita', texto: 'Fique de olho nas lojas e converse com os moradores para entender o que está acontecendo na Vila.' },
            { personagem: 'Cielita', texto: 'Se precisar voltar, procure as pontes: existe uma para o Quebra Gelo e outra para a Praia dos Proveitos.' },
            { personagem: 'Jogador', texto: 'Obrigado, Cielita! Vou explorar e conversar com todo mundo.' },
            { personagem: 'Cielita', texto: 'Ótimo. Quando quiser, eu estarei por aqui para te orientar.' },
        ]);

        // ── Configuração do Eric ─────────────────────────────────────────────
        this.eric = new NPC(this, 515, 230, 'eric_idle', {
            velocidade: 40,
            distanciaInteracao: 30,
            flipDireita: false,
            grupoNPCs: this.grupoNPCs,
            animacoes: {
                idle: 'eric_idle', andar: 'eric_andar', costa: 'eric_costas', lado: 'eric_lado',
            },
            onFimDialogo: () => {
                this.dialogoEricConcluido = true;
                this.registry.set('eric_varejo_concluido', true);
            },
            waypoints: [ // Rota de patrulha do Eric
                { x: 0, y: 0 }, { x: 390, y: 0 }, { x: 390, y: 300 },
                { x: 135, y: 300 }, { x: 135, y: 270 }, { x: 0, y: 270 }
            ],
        });
        
        this.eric.setScale(1.6);
        this.eric.setFalas([
            { personagem: 'Eric', texto: 'Olá, viajante! Me chamo Eric. Seja bem-vindo à Vila do Varejo. Qual seu nome?' },
            { personagem: 'Jogador', texto: `Prazer, Eric! Me chamo ${nomeJogador}.` },
            { personagem: 'Eric', texto: `Prazer, ${nomeJogador}! A Vila do Varejo é um lugar movimentado, cheio de lojas e moradores.` },
            { personagem: 'Eric', texto: 'Ultimamente, tenho ouvido rumores sobre problemas com a loja de doces da Thainá...' },
            { personagem: 'Eric', texto: '...parece que ela tem tido dificuldades para conseguir fazer vendas devido a problemas com a maquininha.' },
            { personagem: 'Eric', texto: 'Se você gosta de desafios, talvez queira conversar com ela para ver se consegue ajuda-la.' },
            { personagem: 'Jogador', texto: 'Obrigado pela dica, Eric! Vou procurar a loja da Thainá.' },
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
        this.jorge.setFalas([
            { personagem: 'Jorge', texto: `Olá, você se chama ${nomeJogador}, não é?` },
            { personagem: 'Jogador', texto: 'Sim, sou eu! Como você sabe meu nome?' },
            { personagem: 'Jorge', texto: 'Ah, eu sei de tudo que acontece na Vila do Varejo. Sou como um detetive, sempre observando.' },
            { personagem: 'Jorge', texto: 'Ultimamente, tenho notado que a Thainá tem tido muitos problemas com a maquininha de cartão.' },
            { personagem: 'Jorge', texto: 'Ela tem ficado muito estressada, e isso tem afetado as vendas dela.' },
            { personagem: 'Jorge', texto: 'Se você gosta de ajudar as pessoas, talvez queira conversar com ela para ver se consegue ajuda-la.' },
            { personagem: 'Jogador', texto: 'Obrigado pela dica, Jorge! Vou procurar a loja da Thainá.' },
            { personagem: 'Jorge', texto: 'Ah, e se você conseguir ajudar a Thainá, volte aqui para me contar! Adoro saber de tudo que acontece.' },
            { personagem: 'Jogador', texto: 'Com certeza, Jorge! Vou ajudar a Thainá e depois volto para te contar.' },
            { personagem: 'Jorge', texto: 'Forsche' },
        ]);

        // Faz os NPCs colidirem entre si (ninguém atravessa ninguém)
        this.physics.add.collider(this.grupoNPCs, this.grupoNPCs);

        // ── Jogador e Física ─────────────────────────────────────────────────
        this.personagem = new Jogador(this, 400, 300, 1.5);
        this.personagem.superficiePasso = 'passos_viladovarejo';
        this.teclas = this.personagem.configurarTeclas();
        this.personagem.sprite.setCollideWorldBounds(true);
        this.personagem.adicionarColisao(this.grupoNPCs);
        this.personagem.sprite.setDepth(10);
        
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

        if (this.origem === 'QuebraGelo') {
            this.personagem.sprite.setPosition(270, 50);
        }
        if (this.origem === 'PonteVV_PP') {
            this.personagem.sprite.setPosition(1260, 60);
        }
        if (this.origem === 'CasaVarejo1') {
            this.personagem.sprite.setPosition(555, 245);
        }
        if (this.origem === 'CasaVarejo2') {
            this.personagem.sprite.setPosition(1125, 465);
        }
        if (this.origem === 'PonteQG_VV') {
            this.personagem.sprite.setPosition(270, 50);
        }
        
        if (this.origem === 'NegociacaoThaina') {
            this.personagem.sprite.setPosition(400, 320);
        }

        DialogoManager.configurarCameraUI(this, 1.7, [this.eric, this.jorge, this.cielita]);

        // Balão inicial (somente se ainda não falou com a Cielita)
        if (!this.dialogoCielitaConcluido) {
            this.game.events.emit('atualizarBalao', { texto: 'Fale com a Cielita', visivel: true });
        }
    }

    update() {
        if (super.update()) return;

        // Atualiza o player e a lógica de movimento/diálogo dos NPCs
        this.personagem.atualizar();
        this.eric.atualizar(this.personagem.sprite, [this.teclas.interagir, this.teclas.interagir2]);
        this.jorge.atualizar(this.personagem.sprite, [this.teclas.interagir, this.teclas.interagir2]);
        this.cielita.atualizar(this.personagem.sprite, [this.teclas.interagir, this.teclas.interagir2]);

        // ── HUD (balão de orientação) ─────────────────────────────────────
        const distEric = Phaser.Math.Distance.Between(
            this.personagem.sprite.x, this.personagem.sprite.y,
            this.eric.x,              this.eric.y
        );
        const pertoEric = distEric <= this.eric._cfg.distanciaInteracao;

        // porta CasaVarejo1 representa a loja/casa da Thainá
        const pertoLojaThaina = this.personagem.temOverlap(this.portaCasa1Varejo);

        if (this.cielita.dialogoAberto || this.eric.dialogoAberto || this.jorge.dialogoAberto) {
            this.game.events.emit('atualizarBalao', { texto: '', visivel: false });
        } else if (!this.dialogoCielitaConcluido) {
            this.game.events.emit('atualizarBalao', { texto: 'Fale com a Cielita', visivel: true });
        } else if (!this.dialogoEricConcluido) {
            this.game.events.emit(
                'atualizarBalao',
                { texto: pertoEric ? 'fale com eric' : 'Procure por Eric pelo Mapa', visivel: true }
            );
        } else if (pertoLojaThaina) {
            this.game.events.emit('atualizarBalao', { texto: 'Entre na casa da Thaina', visivel: true });
        } else {
            this.game.events.emit('atualizarBalao', { texto: 'Procure pela Loja da Thaina', visivel: true });
        }

        // ── Verificação de Troca de Cena ──────────────────────────────────────
        if (this.personagem.temOverlap(this.portalGelo)) {
            this.trocarCena('PonteQG_VV');
            return;
        }

        if (this.personagem.temOverlap(this.portalparapraia)) {
            this.trocarCena('PonteVV_PP');
            return;
        }

        // Portas precisam da tecla de interação (E)
        if (this.personagem.temOverlap(this.portaCasa1Varejo) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CasaVarejo1');
            return;
        }

        if (this.personagem.temOverlap(this.portaCasa2Varejo) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CasaVarejo2');
            return;
        }
    }
}
