import Jogador        from '../Classes/Jogador.js';
import NPC            from '../Classes/NPC.js';
import DialogoManager from '../Classes/DialogoManager.js';
import CenaMapa from '../Classes/CenaMapa.js';

export default class CasaVarejo1 extends CenaMapa {

    constructor() {
        super('CasaVarejo1');
    }

    init(data) {
        // Recebe a cena de origem para saber para onde voltar ou onde spawnar
        this.origem = data.vindoDe; 
    }

    preload() {
        // Carrega assets do cenário e os dados de colisão do Tiled
        this.load.image('CasaVarejo1', 'assets/VilaDoVarejo/CasaVarejo1/CasaVarejo1.png');
        this.load.tilemapTiledJSON('mapaCasaVarejo1', 'assets/VilaDoVarejo/CasaVarejo1/CasaVarejo1.tmj');

        // Assets da Thainá e elementos visuais do balão de diálogo
        this.load.spritesheet('thaina_idl', 'assets/NPC/Thaina/spr_thaina_front_idl.png', {frameWidth: 14, frameHeight: 19});
    }

    create() {
        super.create();

        // 1. Posiciona o cenário e o sprite visual da porta de saída
        const fundo = this.add.image(750, 400, 'CasaVarejo1');
        this.add.image(750, 510, 'portaSaida').setScale(1.5);

        // TRUQUE: Calcula o deslocamento para alinhar as hitboxes do Tiled ao centro da cena
        const offsetX = fundo.x - (fundo.width / 2);
        const offsetY = fundo.y - (fundo.height / 2);
        
        const larguraMapa = 350;
        const alturaMapa = 233; 

        const xInicialFisica = 750 - (larguraMapa / 2);
        const yInicialFisica = 400 - (alturaMapa / 2);

        // 2. Define os limites da física dentro da casa
        this.physics.world.setBounds(xInicialFisica, yInicialFisica, larguraMapa, alturaMapa);

        // Cria a animação de "espera" da Thainá
        NPC.criarAnimacoes(this, [
            { key: 'thaina_idl', frameRate: 3 },
        ]);

        this.grupoNPCs = this.physics.add.group();

        // ── Configuração da NPC Thainá ───────────────────────────────────────
        this.thaina = new NPC(this, 650, 450, 'thaina_idl', {
            velocidade: 0,
            distanciaInteracao: 80,
            grupoNPCs: this.grupoNPCs,
            onFimDialogo: () => {
                const registry = this.registry.get('negociacoesVencidas') ?? {};
                if (!registry['varejo_vencido']) {
                    this.game.events.emit('atualizarBalao', { texto: '', visivel: false });
                    this.scene.start('NegociacaoThaina');
                }
            },
            scaleIndicador: 1.3,
            animacoes: { idle: 'thaina_idl' }
        });
        this.thaina.setScale(1.3);

        this.thaina.setFalas([
            { personagem: 'Thainá',  texto: 'Bem-vindo!' },
            { personagem: 'Jogador', texto: 'Olá!' },
        ]);

        this._thainaVencidaAnterior = null; // força atualização inicial das falas
        
        // 3. Cria o Personagem e configura a colisão com a NPC
        this.personagem = new Jogador(this, 750, 480, 1);
        this.personagem.sprite.setCollideWorldBounds(true);
        this.personagem.adicionarColisao(this.thaina);

        // ── Leitura de Hitboxes do Tiled ─────────────────────────────────────
        const mapa = this.make.tilemap({ key: 'mapaCasaVarejo1' });
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

        // Estética da câmera e fundo
        this.cameras.main.setBackgroundColor('#000000');
        this.cameras.main.centerOn(750, 400);
        
        // Gatilho invisível para sair da casa
        this.PortaCasaVarejo1 = this.add.zone(750, 510, 40, 10);
        this.physics.add.existing(this.PortaCasaVarejo1, true);

        this.teclas = this.personagem.configurarTeclas();

        // Garante que o diálogo use uma câmera fixa para não bugar com o zoom
        DialogoManager.configurarCameraUI(this, 3.5, [this.thaina]);
    }

    update() {
        if (super.update()) return;

        // Atualiza movimentos do player e lógica de proximidade da NPC
        this.personagem.atualizar();
        this.thaina.atualizar(this.personagem.sprite, [this.teclas.interagir, this.teclas.interagir2]);

        // ── HUD ─────────────────────────────────────────────────────────────
        const registry      = this.registry.get('negociacoesVencidas') ?? {};
        const thainaVencida = !!registry['varejo_vencido'];

        if (thainaVencida !== this._thainaVencidaAnterior) {
            this._thainaVencidaAnterior = thainaVencida;
            if (thainaVencida) {
                this.thaina.setFalas([
                    { personagem: 'Thainá', texto: 'Obrigado pela maquininha!' },
                ]);
            } else {
                this.thaina.setFalas([
                    { personagem: 'Thainá',  texto: 'Bem-vindo!' },
                    { personagem: 'Jogador', texto: 'Olá!' },
                ]);
            }
        }

        if (this.thaina.dialogoAberto || thainaVencida) {
            this.game.events.emit('atualizarBalao', { texto: '', visivel: false });
        } else {
            this.game.events.emit('atualizarBalao', { texto: 'Negocie com a Thaina', visivel: true });
        }

        // Se estiver na porta e apertar 'E', volta para a Vila
        if (this.personagem.temOverlap(this.PortaCasaVarejo1) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('VilaDoVarejo');
            return;
        }
    }
}