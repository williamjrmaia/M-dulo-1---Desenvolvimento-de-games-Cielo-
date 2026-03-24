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
         this.load.image('CasaVarejo1', 'assets/VilaDoVarejo/CasaVarejo1/CasaVarejo1.png');
         this.load.image('PortaSaida', 'assets/CenarioCasa/ROOM1-HOUSE/porta_cielita.png');
    }

    create() {
        // ── Configuração Visual ─────────────────────────────────────────────
        
        // Renderiza o cenário centralizado e o sprite da porta de saída
        const fundo = this.add.image(750, 400, 'CasaVarejo1');
        this.add.image(750, 510, 'PortaSaida').setScale(0.7);

        this.fazendoTransicao = false;

        // ── Configuração do Jogador ──────────────────────────────────────────

        // Instancia o protagonista na posição de entrada (perto da porta)
        this.personagem = new Jogador(this, 750, 480, 1);
        this.teclas = this.personagem.configurarTeclas();
        this.personagem.sprite.setCollideWorldBounds(true);

        // Define a cor de fundo para preencher o que sobrar fora do cenário
        this.cameras.main.setBackgroundColor('#000000');
       
        // ── Interação de Saída ───────────────────────────────────────────────

        // Cria uma zona física invisível sobre a porta para detectar quando o player quer sair
        this.PortaCasaVarejo2 = this.add.zone(750, 510, 20, 10);
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