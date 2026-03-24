import Jogador from '../Classes/Jogador.js';

export default class CasaVarejo2 extends Phaser.Scene {

    constructor() {
        super('CasaVarejo2');
    }

    init(data) {
        // Recebe a informação de onde o jogador veio para gerenciar o spawn
        this.origem = data.vindoDe; 
    }

    preload() {
         // Carrega o visual interno e o sprite da porta (reutilizando assets da Casa 1)
         this.load.image('CasaVarejo2', 'assets/VilaDoVarejo/CasaVarejo2/CasaVarejo2.png');
         this.load.image('PortaSaida', 'assets/CenarioCasa/ROOM1-HOUSE/porta_cielita.png');
         
         // ── Implementação de Hitbox: Carrega os dados de colisão do Tiled ─────
         this.load.tilemapTiledJSON('mapaCasaVarejo2', 'assets/VilaDoVarejo/CasaVarejo2/CasaVarejo2.tmj');
    }

    create() {
        // ── Configuração Visual ─────────────────────────────────────────────
        
        // Renderiza o cenário centralizado e o sprite da porta de saída
        const fundo = this.add.image(750, 400, 'CasaVarejo2');
        this.add.image(750, 510, 'PortaSaida').setScale(1.5);

        this.fazendoTransicao = false;

        // ── Implementação de Hitbox: Limites de Física e Offset ──────────────
        
        // Calcula o deslocamento para alinhar as hitboxes do Tiled ao centro da cena
        const offsetX = fundo.x - (fundo.width / 2);
        const offsetY = fundo.y - (fundo.height / 2);
        
        const larguraMapa = 350;
        const alturaMapa = 233; 

        const xInicialFisica = 750 - (larguraMapa / 2);
        const yInicialFisica = 400 - (alturaMapa / 2);

        // Define os limites da física dentro da casa
        this.physics.world.setBounds(xInicialFisica, yInicialFisica, larguraMapa, alturaMapa);

        // ── Configuração do Jogador ──────────────────────────────────────────

        // Instancia o protagonista na posição de entrada (perto da porta)
        this.personagem = new Jogador(this, 750, 480, 1);
        this.teclas = this.personagem.configurarTeclas();
        this.personagem.sprite.setCollideWorldBounds(true);

        // -- Câmera
            this.cameras.main.setBackgroundColor('#000000');
            this.cameras.main.centerOn(750, 400);
            this.cameras.main.setZoom(3.5);

        // ── Implementação de Hitbox: Leitura de Hitboxes do Tiled ────────────
        
        const mapa = this.make.tilemap({ key: 'mapaCasaVarejo2' });
        const camadaObjetos = mapa.getObjectLayer('Object Layer 1');
        
        if (camadaObjetos) {
            camadaObjetos.objects.forEach(obj => {
                if (obj.polygon) {
                    // Cria polígonos complexos (azul transparente para facilitar o ajuste)
                    const poly = this.add.polygon(obj.x + offsetX, obj.y + offsetY, obj.polygon, 0x0000ff, 0.5);
                    this.physics.add.existing(poly, true);
                    this.personagem.adicionarColisao(poly);
                } else {
                    // Cria zonas retangulares simples para objetos e móveis
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

        // Define a cor de fundo para preencher o que sobrar fora do cenário
        this.cameras.main.setBackgroundColor('#000000');
       
        // ── Interação de Saída ───────────────────────────────────────────────

        // Cria uma zona física invisível sobre a porta para detectar quando o player quer sair
        this.PortaCasaVarejo2 = this.add.zone(750, 510, 40, 10);
        this.physics.add.existing(this.PortaCasaVarejo2, true);
    }

    update() {
        // Bloqueia comandos se estiver no meio de um Fade Out
        if (this.fazendoTransicao) return;

        // Atualiza a movimentação e animações do personagem
        this.personagem.atualizar();    

        // Verifica se o player está na porta e apertou a tecla de interação (E)
        if (this.personagem.temOverlap(this.PortaCasaVarejo2) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('VilaDoVarejo', { vindoDe: 'CasaVarejo2' });
            return;
        }
    }

    // ── Lógica de Transição ────────────────────────────────────────────────
    
    // Função auxiliar para mudar de cena com efeito de escurecimento suave
    trocarCena(nomeCena, dados = {}) {
        this.fazendoTransicao = true;
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(nomeCena, dados);
        });
    }
}