import Jogador        from '../Classes/Jogador.js';
import NPC            from '../Classes/NPC.js';
import DialogoManager from '../Classes/DialogoManager.js';
import CenaMapa from '../Classes/CenaMapa.js';

export default class CasaVarejo1 extends CenaMapa {

    constructor() {
        super('CasaVarejo1');
    }

    init(data) {
        this.origem = data.vindoDe; 
    }

    preload() {
        // Carrega a imagem e o arquivo de hitboxes do Tiled
        this.load.image('CasaVarejo1', 'assets/VilaDoVarejo/CasaVarejo1/CasaVarejo1.png');
        this.load.tilemapTiledJSON('mapaCasaVarejo1', 'assets/VilaDoVarejo/CasaVarejo1/CasaVarejo1.tmj');

        //sprites da thainá
        this.load.spritesheet('thaina_idl', 'assets/NPC/THAINA/spr_thaina_front_idl.png', {frameWidth: 14, frameHeight: 19});
    }

    create() {
        super.create();

        //Porta de Saída
        
        

        // 1. Adiciona o cenário no centro
        const fundo = this.add.image(750, 400, 'CasaVarejo1');
        this.add.image(750, 510, 'PortaSaida').setScale(0.7);

        // TRUQUE: Calcula a distância do centro para empurrar as hitboxes depois
        const offsetX = fundo.x - (fundo.width / 2);
        const offsetY = fundo.y - (fundo.height / 2);
        
        const larguraMapa = 350;
        const alturaMapa = 233; 

        const xInicialFisica = 750 - (larguraMapa / 2);
        const yInicialFisica = 400 - (alturaMapa / 2);

        // 2. Limites da física (Paredes extras do mundo)
        this.physics.world.setBounds(xInicialFisica, yInicialFisica, larguraMapa, alturaMapa);

        NPC.criarAnimacoes(this, [
            { key: 'thaina_idl', frameRate: 3 },
        ]);

        //Colisão entre NPCs
        this.grupoNPCs = this.physics.add.group();

        //Thainá (NPC)
        this.thaina= new NPC(this, 650, 450, 'thaina_idl', {
            velocidade: 0,
            distanciaInteracao: 80,
            grupoNPCs: this.grupoNPCs,        // registra no grupo automaticamente
            onFimDialogo: () => {             // callback opcional pós-diálogo
               this.scene.start('NegociacaoThaina');
            },
            scaleIndicador:     1.3,
            animacoes: {
                idle:  'thaina_idl'
            }
            });
            this.thaina.setScale(1.3)
        
            this.thaina.setFalas([
                { personagem: 'Thainá', texto: 'Bem-vindo!' },
                { personagem: 'Jogador',   texto: 'Olá!'      },
            ]);
        
        // 3. Cria o Personagem
        this.personagem = new Jogador(this, 750, 480, 1);
        this.personagem.sprite.setCollideWorldBounds(true);

                // Colisão NPC↔Jogador (opcional, mesma API do Jogador)
        this.personagem.adicionarColisao(this.thaina);

        // --- INÍCIO: LER AS HITBOXES DO TILED ---
        const mapa = this.make.tilemap({ key: 'mapaCasaVarejo1' });
        
        // Confirme se a camada se chama 'Object Layer 1' lá no Tiled também
        const camadaObjetos = mapa.getObjectLayer('Object Layer 1');
        
        if (camadaObjetos) {
            camadaObjetos.objects.forEach(obj => {
                if (obj.polygon) {
                    // Adicionando offsetX e offsetY. Deixei a opacidade em 0.5 para debugar!
                    const poly = this.add.polygon(obj.x + offsetX, obj.y + offsetY, obj.polygon, 0x0000ff, 0.5);
                    this.physics.add.existing(poly, true); // Corpo estático
                    this.personagem.adicionarColisao(poly);
                } else {
                    let zonaTiled = this.add.zone(
                        (obj.x + offsetX) + (obj.width / 2), 
                        (obj.y + offsetY) + (obj.height / 2), 
                        obj.width, 
                        obj.height
                    );
                    this.physics.add.existing(zonaTiled, true);
                    this.personagem.adicionarColisao(zonaTiled);
                }
            });
        }

        this.cameras.main.setBackgroundColor('#000000');
        this.cameras.main.centerOn(750, 400);

        //Porta para sair
        this.PortaCasaVarejo1 = this.add.zone(750, 510, 20, 10)
        this.physics.add.existing(this.PortaCasaVarejo1, true)

        this.teclas = this.personagem.configurarTeclas();

        DialogoManager.configurarCameraUI(this, 3.5, [this.thaina]);

        
    }

    update() {
        if (super.update()) return;

        this.personagem.atualizar();
        this.thaina.atualizar(this.personagem.sprite, this.teclas.interagir);

        if (this.personagem.temOverlap(this.PortaCasaVarejo1) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('VilaDoVarejo');
            return;
        }
        
    }
}