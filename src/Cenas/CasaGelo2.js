import Jogador from '../Classes/Jogador.js';
import NPC     from '../Classes/NPC.js';

// Construção do cenário CasaGelo2
export default class CasaGelo2 extends Phaser.Scene {

    constructor() {
        super('CasaGelo2');
    }

    init(data) {
        this.origem = data.vindoDe; 
    }

    preload() {
        // dando Preload nas Imagens
        this.load.image('Casa2', 'assets/MapaGelo/Scene2_House2.png');
        this.load.image('PortaSaida', 'assets/CenarioCasa/ROOM1-HOUSE/porta_cielita.png');
        
        // Arquivo JSON do Tiled
        this.load.tilemapTiledJSON('mapaCasaGelo2', 'assets/MapaGelo/CasaGelo2.tmj');
    }

    create() {
        //Definindo centro do mapa (para formatação da hitbox e câmera)
        const centerX = 750;
        const centerY = 400;
        //Definindo centro da câmera
        this.cameras.main.setBounds(0, 0, larguraMapa, alturaMapa);
        
        // 1. Adiciona o cenário no centro 
        const fundo = this.add.image(centerX, centerY, 'Casa2');

        // TRUQUE: Calculamos a distância entre o centro e o canto superior esquerdo da imagem
        // Vamos usar isso para empurrar as hitboxes do Tiled para o lugar certo
        const offsetX = fundo.x - (fundo.width / 2);
        const offsetY = fundo.y - (fundo.height / 2);

        // 2. Personagem nas suas coordenadas originais
        this.personagem = new Jogador(this, 750, 510, 1.3);
        this.personagem.configurarTeclas();
        this.personagem.sprite.setCollideWorldBounds(true);

        // 3. LER AS HITBOXES DO TILED (COM O DESLOCAMENTO)
        const mapa = this.make.tilemap({ key: 'mapaCasaGelo2' });
        const camadaObjetos = mapa.getObjectLayer('Object Layer 1');
        
        //Verificando a existência da camada de hitbox e aplicando ela
        if (camadaObjetos) {
            camadaObjetos.objects.forEach(obj => {
                if (obj.polygon) {
                    // Somamos o offsetX e offsetY para a hitbox acompanhar a imagem
                    // Mantive 0.5 de opacidade para você ver a hitbox azul e confirmar que encaixou!
                    const poly = this.add.polygon(obj.x + offsetX, obj.y + offsetY, obj.polygon, 0x0000ff, 0.5);
                    this.physics.add.existing(poly, true); // true = corpo estático
                    this.personagem.adicionarColisao(poly);
                } else {
                    // Mesma coisa para os retângulos
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

        // 4. Câmera
        this.cameras.main.startFollow(this.personagem.sprite);
        this.cameras.main.setZoom(2.4);
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // 5. Porta de sair no lugar original
        this.add.image(750, 530, 'PortaSaida');
        this.PortaSaida = this.add.zone(750, 525, 40, 15);
        this.physics.add.existing(this.PortaSaida, true);

        //Função das teclas (chamadas em outra cena)
        this.teclas = this.personagem.configurarTeclas();
    }

    update() {
        //Atualizando as animações e movimentos do personagem
        this.personagem.atualizar();

        //Se o personagem não estiver em contato com a porta, this.naPorta = false
        if (!this.personagem.temOverlap(this.PortaSaida)) {
            this.naPorta = false;
        } else {
            this.naPorta = true;
        }
        //Se o personagem tem overlap com a porta e a tecla interagir for precionada(E), ele torca de cena
        if (this.personagem.temOverlap(this.PortaSaida) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('MapaGelo', { vindoDe: 'CasaGelo2' });
            return;
        }
    }

    // Função de trocar de cena com animação de FADE de tela
    trocarCena(nomeCena, dados = {}) {
        this.fazendoTransicao = true;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(nomeCena, dados);
        });
    }
}