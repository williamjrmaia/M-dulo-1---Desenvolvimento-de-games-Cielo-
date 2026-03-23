import Jogador        from '../Classes/Jogador.js';
import NPC            from '../Classes/NPC.js';
import DialogoManager from '../Classes/DialogoManager.js';

// ── Falas da Cielita no início do Mapa Gelo ──────────────────────────────────
const FALAS_CIELITA_GELO = [
    { personagem: 'Cielita', texto: 'Bem-vindo ao Mapa Gelo! Aqui o frio é intenso, mas as oportunidades são ainda maiores.' },
    { personagem: 'Cielita', texto: 'Explore com cuidado — há lojas, igluus e portais escondidos por toda parte.' },
    { personagem: 'Cielita', texto: 'Se quiser visitar o Seu Pedro, procure a porta marcada pela placa ao norte.' },
    { personagem: 'Jogador', texto: 'Obrigado, Cielita! Vou explorar tudo por aqui.' },
    { personagem: 'Cielita', texto: 'Boa sorte, aventureiro! Estarei aqui se precisar de mim.' },
];

//Construindo a cena do MapaGelo
export default class MapaGelo extends Phaser.Scene {
    constructor() { 
        super('MapaGelo'); 
    }

    //Função de pegar a origem do mapa (usada para trocar de cena -> spawnar em um lugar específico)
    init(data) {
        this.origem = data?.vindoDe; 
    }

    preload() {
        //Carregando imagens do mapa
        this.load.image('Ponte',    './assets/CenarioCasa/ponte.png');
        this.load.image('MapaGelo', './assets/MapaGelo/MapaGelo.png');
        this.load.image('Placa',    './assets/MapaGelo/PlacaCasaPedro.png');
        this.load.tilemapTiledJSON('mapa_dados', './assets/MapaGelo/MapaGeloHitbox.tmj');
        Jogador.preloadInsignias(this);
        // Assets da Cielita (mesmos do CenaCasa)
        this.load.spritesheet('cielitaparada', './assets/NPC/cielita/idlecielita.png', { frameWidth: 16, frameHeight: 25 });
        this.load.image('balao',      './assets/objetos/balao_dialogo.png');
        this.load.image('IndicadorE', './assets/objetos/botao_e.png');
    }

    create() {
        //Bloqueadores para evitar bugs (tipo o apertar E no meio da transição reinicia ela mesma)
        this.fazendoTransicao  = false;
        this._mensagemBloqueio = null;

        //Definindo a altura e largura do mapa (para hitbox e para a câmera)
        const larguraMapa = 1500;
        const alturaMapa  = 1200; 

        //Colocando o centro do límite + paredes
        this.physics.world.setBounds(0, 0, larguraMapa, alturaMapa);
        this.cameras.main.setBounds(0, 0, larguraMapa, alturaMapa);
        // Zoom definido antes de criar NPCs para que o DialogoManager leia o valor correto
        this.cameras.main.setZoom(2.6);

        //Criando o tilemap (hitbox) do mapa de Gelo, cujo nome é 'mapa_dados'
        const mapa = this.make.tilemap({ key: 'mapa_dados' });
        //Criando a imagem do mapa de gelo + a placa da casa do SeuPedro
        this.add.image(0, 0, 'MapaGelo').setOrigin(0, 0);
        this.add.image(655, 155, 'Placa').setScale(0.4);

        // ── Animação da Cielita ───────────────────────────────────────────────
        if (!this.anims.exists('cielitaparada')) {
            this.anims.create({
                key:       'cielitaparada',
                frames:    this.anims.generateFrameNumbers('cielitaparada', { start: 0, end: -1 }),
                frameRate: 3,
                repeat:    -1,
            });
        }

        // ── Grupo de NPCs ─────────────────────────────────────────────────────
        this.grupoNPCs = this.physics.add.group();

        // ── NPC: Cielita — posicionada perto do spawn do jogador (início do mapa) ──
        this.cielita = new NPC(this, 300, 190, 'cielitaparada', {
            velocidade:         0,
            distanciaInteracao: 60,
            grupoNPCs:          this.grupoNPCs,
            animacoes: { idle: 'cielitaparada' },
            scaleIndicador:     1.3,
        });
        //Proporções e ambientação da NPC Cielita
        this.cielita.setScale(1.1);
        this.cielita.setDepth(5);
        this.cielita.setFalas(FALAS_CIELITA_GELO);

        // Colisão NPC↔NPC
        this.physics.add.collider(this.grupoNPCs, this.grupoNPCs);

        // ── Jogador ───────────────────────────────────────────────────────────
        this.personagem = new Jogador(this, 25, 212, 1.0);
        this.personagem.sprite.setCollideWorldBounds(true);
        this.personagem.sprite.setDepth(10);

        // Colisão Jogador↔Cielita
        this.personagem.adicionarColisao(this.cielita);

        // ── Hitboxes do Tiled ─────────────────────────────────────────────────
        const camadaObjetos = mapa.getObjectLayer('Object Layer 1');
        if (camadaObjetos) {
            camadaObjetos.objects.forEach(obj => {
                if (obj.polygon) {
                    const poly = this.add.polygon(obj.x, obj.y, obj.polygon, 0x0000ff, 0);
                    this.physics.add.existing(poly, true);
                    this.personagem.adicionarColisao(poly);
                } else {
                    let zonaTiled = this.add.zone(obj.x + (obj.width / 2), obj.y + (obj.height / 2), obj.width, obj.height);
                    this.physics.add.existing(zonaTiled, true);
                    this.personagem.adicionarColisao(zonaTiled);
                }
            });
        }

        // PORTAIS E PORTAS
        this.PortalGelo     = this.add.zone(10,  215,  10, 15);
        this.GeloPorta      = this.add.zone(622, 190,  17, 20);
        this.GeloPortaCasa2 = this.add.zone(400, 675,  20, 20);
        this.GeloPorta2     = this.add.zone(685, 190,  17, 20);
        this.PortalVarejo   = this.add.zone(897, 1015, 25, 15);
        this.ParedePortal   = this.add.zone(897, 1025, 70,  5);

        [this.PortalGelo, this.GeloPorta, this.GeloPortaCasa2,
         this.GeloPorta2, this.PortalVarejo, this.ParedePortal
        ].forEach(z => this.physics.add.existing(z, true));

        // Parede abaixo do portal (evita vazar do mapa)
        this.physics.add.existing(this.ParedePortal, true);

        // ── Teclas e câmera ───────────────────────────────────────────────────
        this.teclas = this.personagem.configurarTeclas();
        this.cameras.main.startFollow(this.personagem.sprite);
        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.cameras.main.setBounds(0, 0, 1024, 1024);

        if (this.origem === 'CenaCasaGelo') this.personagem.sprite.setPosition(655, 210);
        if (this.origem === 'CasaGelo2')    this.personagem.sprite.setPosition(400, 675);
        if (this.origem === 'CenaPonteV') this.personagem.sprite.setPosition(897, 990);

        DialogoManager.configurarCameraUI(this, 2.6, [this.cielita]);
        
         //── Câmera UI para diálogos ───────────────────────────────────────────
        // A câmera principal tem zoom=2.6, o que faz o Phaser aplicar um clip
        // region de 577×308px, ocultando elementos scrollFactor(0) fora dessa
        // área (ex: diálogo em y=740). Uma câmera UI separada com zoom=1 resolve
        // isso: o diálogo é ignorado pela câmera principal e renderizado apenas
        // pela câmera UI nas coordenadas de tela corretas.
        const uiCam = this.cameras.add(0, 0, this.scale.width, this.scale.height);
        const _dlg  = this.cielita._dialogo;
        if (_dlg) {
            const elementosDialogo = [_dlg._fundo, _dlg._textoNome, _dlg._textoFala, _dlg._indicador].filter(Boolean);
            const objetosMundo     = this.children.list.filter(obj => !elementosDialogo.includes(obj));
            uiCam.ignore(objetosMundo);
            this.cameras.main.ignore(elementosDialogo);
        }

        // Verifica e concede a insígnia se o jogador já venceu a negociação
        this.personagem.verificarInsigniaMapa('mapa_gelo');
        
    }

    update() {
        // IF para impedir bugs de repetição
        if (this.fazendoTransicao) return;
        //Atualizando as animações e spritesheets do personagem
        this.personagem.atualizar();
        // ── Atualiza Cielita (lida com indicador E, diálogo e proximidade) ────
        this.cielita.atualizar(this.personagem.sprite, this.teclas.interagir);

        // Portal de volta — livre, sem verificação de insígnia
        if (this.personagem.temOverlap(this.PortalGelo)) {
            this.trocarCena('CenaPonteh', { vindoDe: 'MapaGelo' });
            return;
        }

        // Portal VilaDoVarejo — exige insígnia
        if (this.personagem.temOverlap(this.PortalVarejo)) {
            this.trocarCena('CenaPonteV', { vindoDe: 'MapaGelo' });
            if (!this._temInsignia()) {
                this._mostrarMensagemBloqueio();
                return;
            }
            this.trocarCena('VilaDoVarejo', { vindoDe: 'MapaGelo' });
            return;
        }

        // Porta Casa do Pedro — exige insígnia, aperta E para entrar
        const naPorta1 = this.personagem.temOverlap(this.GeloPorta);
        const naPorta2 = this.personagem.temOverlap(this.GeloPorta2);

        //Se estiver interagindo ou na Porta1 ou na Porta2 (que são da CasaPedro), apertar a tecla de interagir (E) vai entrar na casa. A não ser que não tenha a insignia
        if ((naPorta1 || naPorta2) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CenaCasaGelo');
            return;
        }

        // Porta CasaGelo2 — exige insígnia, aperta E para entrar
        if (this.personagem.temOverlap(this.GeloPortaCasa2) &&
            Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            if (!this._temInsignia()) {
                this._mostrarMensagemBloqueio();
                return;
            }
            this.trocarCena('CasaGelo2');
        }
    }

    // ── Verificação de insígnia ───────────────────────────────────────────────

    _temInsignia() {
        // Usa o método do Jogador que consulta 'insigniasJogador' no registry
        return this.personagem.temInsignia('mapa_gelo');
    }

    /**
     * Exibe uma mensagem temporária na tela indicando que o acesso está bloqueado.
     * Útil para feedbacks de progresso (ex: impedir passagem sem vencer um NPC).
     */
    _mostrarMensagemBloqueio() {
        // Impede que múltiplas mensagens sejam criadas ao mesmo tempo se uma já estiver visível
        if (this._mensagemBloqueio) return;

        // Pega as dimensões atuais do canvas do jogo para centralizar os elementos
        const W = this.scale.width;
        const H = this.scale.height;

        // Cria o retângulo de fundo (background) da mensagem
        // Posicionado no centro (W/2) e a 20% da altura da tela (H * 0.2)
        const bg = this.add.rectangle(W / 2, H * 0.2, 520, 60, 0x000000, 0.8)
            .setStrokeStyle(2, 0xcc4444) // Borda avermelhada para indicar "negado/erro"
            .setDepth(200)               // Garante que fique acima de quase todos os elementos
            .setScrollFactor(0);         // Faz o elemento "fixar" na tela, ignorando o movimento da câmera

        // Cria o texto de aviso
        const texto = this.add.text(W / 2, H * 0.2, '⛔ Você precisa vencer a negociação com Pedro primeiro!', {
            fontFamily: '"Courier New", monospace',
            fontSize:   '13px',
            color:      '#ff6666',
            align:      'center',
            wordWrap:   { width: 500 }, // Quebra linha automaticamente se o texto for longo
        }).setOrigin(0.5).setDepth(201)   // Origem no centro e profundidade ligeiramente maior que o bg
          .setScrollFactor(0);

        // Armazena a referência para controle de existência
        this._mensagemBloqueio = { bg, texto };

        // Agenda a destruição dos elementos após 2.5 segundos (2500ms)
        this.time.delayedCall(2500, () => {
            bg.destroy();
            texto.destroy();
            this._mensagemBloqueio = null; // Libera o estado para permitir uma nova mensagem no futuro
        });
    }

    // ── Transição ─────────────────────────────────────────────────────────────

    /**
     * Realiza uma transição suave de "fade out" (escurecimento) antes de iniciar outra cena.
     * @param {string} nomeCena - A chave da cena para a qual o jogo deve ir.
     * @param {object} dados - Dados opcionais para passar para a função init() da próxima cena.
     */
    trocarCena(nomeCena, dados = {}) {
        this.fazendoTransicao = true;
        
        // Inicia o efeito de escurecer a tela (duração de 500ms)
        this.cameras.main.fadeOut(500, 0, 0, 0);

        // Quando o efeito de fade terminar, o Phaser executa a troca real de cena
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(nomeCena, dados);
        });
    }
}


