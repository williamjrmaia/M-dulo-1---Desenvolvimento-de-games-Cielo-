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
        
        // Carrega o arquivo TMJ (JSON do Tiled) para as hitboxes
        this.load.json('hitboxesPraia', 'assets/PraiaDosProveitos/PraiaDosProveitos.tmj'); 
    }

    create() {
        super.create();

        this.registry.get('audio').tocarMusica('musica_praiadosproveitos', 0.5);
        this.registry.get('audio').tocarAmbiente('ambiente_praiadosproveitos', 0.4);

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

        //Criando portais para transição
        this.PortalPonte1 = this.add.zone(630, 830, 20, 20)
        this.physics.add.existing(this.PortalPonte1, true)

        
        this.teclas = this.personagem.configurarTeclas();

        // ── NPC: Cielita (entrada da Praia dos Proveitos) ──────────────────
        this.dialogoCielitaPraiaConcluido = this.registry.get('cielita_praia_concluida') || false;

        NPC.criarAnimacoes(this, [
            { key: 'cielitaparada', frameRate: 3 },
        ]);

        this.grupoNPCs = this.physics.add.group();

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
        this.cielita.setDepth(5);
        this.cielita.setFlipX(true);
        this.cielita.setFalas([
            { personagem: 'Cielita', texto: 'Bem-vindo à Praia dos Proveitos! O mar esconde caminhos e oportunidades.' },
            { personagem: 'Cielita', texto: 'Se precisar de ajuda, estarei aqui na entrada. Boa sorte!' },
            { personagem: 'Jogador', texto: 'Obrigado, Cielita! Vou explorar.' },
        ]);

        // Colisão jogador ↔ Cielita
        this.personagem.adicionarColisao(this.cielita);

        // UI de diálogo
        DialogoManager.configurarCameraUI(this, 2.4, [this.cielita]);

        if (!this.dialogoCielitaPraiaConcluido) {
            this.game.events.emit('atualizarBalao', { texto: 'Fale com a Cielita', visivel: true });
        }
    }

    update() {
        if (super.update()) return;

        this.personagem.atualizar();

        if (this.cielita) {
            this.cielita.atualizar(this.personagem.sprite, this.teclas.interagir);

            if (this.cielita.dialogoAberto) {
                this.game.events.emit('atualizarBalao', { texto: '', visivel: false });
            } else if (!this.dialogoCielitaPraiaConcluido) {
                this.game.events.emit('atualizarBalao', { texto: 'Fale com a Cielita', visivel: true });
            }
        }

        if (this.personagem.temOverlap(this.PortalPonte1)) {
            this.trocarCena('VilaDoVarejo');
            return;
        }
    }

}