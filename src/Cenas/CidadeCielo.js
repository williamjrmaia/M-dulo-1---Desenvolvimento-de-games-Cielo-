import Jogador        from "../Classes/Jogador.js";
import NPC            from "../Classes/NPC.js";
import DialogoManager from "../Classes/DialogoManager.js";
import CenaMapa       from "../Classes/CenaMapa.js";
import CarroCielo from "../Classes/CarroCielo.js";
import MiniMapa from '../Classes/MiniMapa.js';

export default class CidadeCielo extends CenaMapa {

    constructor() {
        super('CidadeCielo');
    }

    init(data) {
        this.origem = data?.vindoDe || null;
    }

    preload() {
        this.load.image('CidadeCielo', './assets/CidadeCielo/CidadeCielo.png');
        this.load.image('carro_cielo', './assets/CidadeCielo/carro_cielo.png');
        this.load.tilemapTiledJSON('mapaCidadeCielo', './assets/CidadeCielo/CidadeCielo.tmj');
        this.load.image('carro2', './assets/CidadeCielo/carro2.png');

        // ── Assets da Cielita ─────────────────────────────────────────────────
        this.load.spritesheet('cielitaparada', './assets/NPC/cielita/idlecielita.png', {
            frameWidth:  16,
            frameHeight: 25,
        });
    }

    _iniciarCadeiaCarros() {
    this.carro1 = new CarroCielo(this, {
        xi: 200, yi: 600,
        xf: 680, yf: 600,
        T: 8, pausaMs: 2000,
        escala: 1.2,
        texturaKey: 'carro_cielo',
        flipX: true, flipY: false,
        jogadorSprite: this.jogador.sprite,
        miniMapa: this.miniMapa,
        onFimCiclo: () => {
            this.carro1.sprite.destroy();
            this.carro1 = null;
            

            this.carro2 = new CarroCielo(this, {
                xi: 680, yi: 600,
                xf: 680, yf: 550,
                T: 1, pausaMs: 1000,
                escala: 0.6,
                texturaKey: 'carro2',
                flipX: false, flipY: true,
                jogadorSprite: this.jogador.sprite,
                miniMapa: this.miniMapa,
                onFimCiclo: () => {
                    this.carro2.sprite.destroy();
                    this.carro2 = null;

                    this.carro3 = new CarroCielo(this, {
                        xi: 680, yi: 550,
                        xf: 775, yf: 550,
                        T: 1, pausaMs: 1000,
                        escala: 1.2,
                        texturaKey: 'carro_cielo',
                        flipX: true, flipY: false,
                        jogadorSprite: this.jogador.sprite,
                        miniMapa: this.miniMapa,
                        onFimCiclo: () => {
                            this.carro3.sprite.destroy();
                            this.carro3 = null;

                            this.carro4 = new CarroCielo(this, {
                                xi: 775, yi: 550,
                                xf: 775, yf: 395,
                                T: 3, pausaMs: 1000,
                                escala: 0.6,
                                texturaKey: 'carro2',
                                flipX: false, flipY: false,
                                jogadorSprite: this.jogador.sprite,
                                miniMapa: this.miniMapa,
                                onFimCiclo: () => {
                                    this.carro4.sprite.destroy();
                                    this.carro4 = null;

                                    this.carro5 = new CarroCielo(this, {
                                        xi: 775, yi: 395,
                                        xf: 670, yf: 395,
                                        T: 2, pausaMs: 500,
                                        escala: 1.2,
                                        texturaKey: 'carro_cielo',
                                        flipX: false, flipY: false,
                                        jogadorSprite: this.jogador.sprite,
                                        miniMapa: this.miniMapa,
                                        onFimCiclo: () => {
                                            this.carro5.sprite.destroy();
                                            this.carro5 = null;

                                            this.carro6 = new CarroCielo(this, {
                                                xi: 670, yi: 395,
                                                xf: 670, yf: 220,
                                                T: 3, pausaMs: 500,
                                                escala: 0.6,
                                                texturaKey: 'carro2',
                                                flipX: false, flipY: false,
                                                jogadorSprite: this.jogador.sprite,
                                                miniMapa: this.miniMapa,
                                                onFimCiclo: () => {
                                                    this.carro6.sprite.destroy();
                                                    this.carro6 = null;

                                                    this.carro7 = new CarroCielo(this, {
                                                        xi: 670, yi: 220,
                                                        xf: 450, yf: 220,
                                                        T: 3.5, pausaMs: 500,
                                                        escala: 1.2,
                                                        texturaKey: 'carro_cielo',
                                                        flipX: false, flipY: false,
                                                        jogadorSprite: this.jogador.sprite,
                                                        miniMapa: this.miniMapa,
                                                        onFimCiclo: () => {
                                                            this.carro7.sprite.destroy();
                                                            this.carro7 = null;

                                                            this.carro8 = new CarroCielo(this, {
                                                                xi: 450, yi: 220,
                                                                xf: 405, yf: 220,
                                                                T: 2, pausaMs: 1000,
                                                                escala: 1.2,
                                                                texturaKey: 'carro_cielo',
                                                                flipX: false, flipY: false,
                                                                jogadorSprite: this.jogador.sprite,
                                                                miniMapa: this.miniMapa,
                                                                onFimCiclo: () => {
                                                                    this.carro8.sprite.destroy();
                                                                    this.carro8 = null;

                                                                    this.carro9 = new CarroCielo(this, {
                                                                        xi: 405, yi: 220,
                                                                        xf: 405, yf: 420,
                                                                        T: 4, pausaMs: 500,
                                                                        escala: 0.6,
                                                                        texturaKey: 'carro2',
                                                                        flipX: false, flipY: true,
                                                                        jogadorSprite: this.jogador.sprite,
                                                                        miniMapa: this.miniMapa,
                                                                        onFimCiclo: () => {
                                                                            this.carro9.sprite.destroy();
                                                                            this.carro9 = null;

                                                                            this.carro10 = new CarroCielo(this, {
                                                                                xi: 405, yi: 420,
                                                                                xf: 200, yf: 420,
                                                                                T: 1, pausaMs: 500,
                                                                                escala: 1.2,
                                                                                texturaKey: 'carro_cielo',
                                                                                flipX: false, flipY: false,
                                                                                jogadorSprite: this.jogador.sprite,
                                                                                miniMapa: this.miniMapa,
                                                                                onFimCiclo: () => {
                                                                                    this.carro10.sprite.destroy();
                                                                                    this.carro10 = null;

                                                                                    this.carro11 = new CarroCielo(this, {
                                                                                        xi: 200, yi: 420,
                                                                                        xf: 200, yf: 600,
                                                                                        T: 2, pausaMs: 2000,
                                                                                        escala: 0.6,
                                                                                        texturaKey: 'carro2',
                                                                                        flipX: false, flipY: true,
                                                                                        jogadorSprite: this.jogador.sprite,
                                                                                        miniMapa: this.miniMapa,
                                                                                        onFimCiclo: () => {
                                                                                            this.carro11.sprite.destroy();
                                                                                            this.carro11 = null;

                                                                                            // 🔁 Fecha o loop
                                                                                            this._iniciarCadeiaCarros();
                                                                                        }
                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

    create() {
        super.create();

        if (this.carro) {
        this.carro.sprite.destroy();
        this.carro = null;
}

        this.registry.get('audio').tocarMusica('musica_cidadecielo', 0.5);
        this.registry.get('audio').tocarAmbiente('passos_cidadecielo', 0.8);

        // Controla se o diálogo de introdução já foi concluído nesta sessão
        this.dialogoCielitaConcluido = this.registry.get('cielita_cidadecielo_concluido') || false;

        const escalaCenario = 1.5;

        const cenario = this.add.image(0, 0, 'CidadeCielo').setOrigin(0, 0).setScale(escalaCenario);
        const larguraImagem = cenario.displayWidth;
        const alturaImagem  = cenario.displayHeight;

        this.physics.world.setBounds(0, 0, larguraImagem, alturaImagem);

        // ── Animações da Cielita ──────────────────────────────────────────────
        NPC.criarAnimacoes(this, [
            { key: 'cielitaparada', frameRate: 3 },
        ]);

        // ── Grupo de NPCs ─────────────────────────────────────────────────────
        this.grupoNPCs = this.physics.add.group();

        // ── NPC: Cielita (introdução no início do mapa) ───────────────────────
        // Posicionada bem no início, perto de onde o jogador aparece (y ≈ 830)
        this.cielita = new NPC(this, larguraImagem / 1.93 - 20, 750, 'cielitaparada', {
            velocidade:         0,
            distanciaInteracao: 60,
            grupoNPCs:          this.grupoNPCs,
            animacoes:          { idle: 'cielitaparada' },
            scaleIndicador:     1.3,
            onFimDialogo: () => {
                this.dialogoCielitaConcluido = true;
                this.registry.set('cielita_cidadecielo_concluido', true);
            },
        });
        this.cielita.setScale(1.1);
        this.cielita.setDepth(5);
        this.cielita.setFalas([
            { personagem: 'Cielita', texto: 'Bem-vindo à Cidade Cielo! Este é o coração do Cielo Verso.' },
            { personagem: 'Cielita', texto: 'Aqui você encontrará habitantes, lojas e segredos espalhados por toda a cidade.' },
            { personagem: 'Cielita', texto: 'Explore cada canto com atenção — há muitas histórias esperando para serem descobertas.' },
            { personagem: 'Cielita', texto: 'Converse com os moradores, eles podem te ajudar a entender melhor este lugar.' },
            { personagem: 'Jogador', texto: 'Obrigado, Cielita! Vou explorar tudo por aqui.' },
            { personagem: 'Cielita', texto: 'Boa sorte, aventureiro! Estarei aqui se precisar de mim.' },
        ]);

        // Colisão NPC↔NPC (necessário mesmo com um único NPC)
        this.physics.add.collider(this.grupoNPCs, this.grupoNPCs);
        // ── Portas ───────────────────────────────────────────────────────────
        // Porta para o prédio principal
        this.PortaCasaCidade1 = this.add.zone(546, 567, 50, 25);
        this.physics.add.existing(this.PortaCasaCidade1, true);

        //Porta para a loja secundária
        this.PortaLojaCidade1 = this.add.zone(835, 150, 35, 25);
        this.physics.add.existing(this.PortaLojaCidade1, true);

        // ── Jogador ───────────────────────────────────────────────────────────
        this.jogador = new Jogador(this, larguraImagem / 2, 830);
        this.jogador.sprite.setCollideWorldBounds(true);
        this.jogador.sprite.setScale(1.3);
        //-- MiniMapa ───────────────────────────────────────────────────────────
        this.miniMapa = new MiniMapa(this, this.jogador.sprite, { zoom: 0.6 });
        this.miniMapa.registrarNPCs(this.grupoNPCs);
        this.miniMapa.definirMissao(545, 550);              // triângulo da missão

        // Colisão Jogador↔Cielita
        this.jogador.adicionarColisao(this.grupoNPCs);


        // ── Criação do Portal ─────────────────────────────────────────────────
        this.PortalCielo = this.add.zone(540, 880, 30, 20);
        this.physics.add.existing(this.PortalCielo, true);

        // ── Leitura de Hitboxes do Tiled ──────────────────────────────────────
        const mapa = this.make.tilemap({ key: 'mapaCidadeCielo' });
        const camadaObjetos = mapa.getObjectLayer('Object Layer 1');

        if (camadaObjetos) {
            camadaObjetos.objects.forEach(obj => {
                if (obj.polygon) {
                    const pontosEscalados = obj.polygon.map(p => ({
                        x: p.x * escalaCenario,
                        y: p.y * escalaCenario,
                    }));

                    const poly = this.add.polygon(
                        obj.x * escalaCenario,
                        obj.y * escalaCenario,
                        pontosEscalados,
                        0x0000ff,
                        0.5
                    ).setOrigin(0, 0);

                    this.physics.add.existing(poly, true);
                    this.jogador.adicionarColisao(poly);

                } else {
                    const larguraTiled = obj.width  * escalaCenario;
                    const alturaTiled  = obj.height * escalaCenario;

                    const zonaTiled = this.add.zone(
                        (obj.x * escalaCenario) + (larguraTiled / 2),
                        (obj.y * escalaCenario) + (alturaTiled  / 2),
                        larguraTiled,
                        alturaTiled
                    );

                    this.physics.add.existing(zonaTiled, true);
                    this.jogador.adicionarColisao(zonaTiled);
                }
            });
        }

        // ── Teclas ────────────────────────────────────────────────────────────
        this.teclas = this.jogador.configurarTeclas();

        // ── Câmera ────────────────────────────────────────────────────────────
        this.cameras.main.startFollow(this.jogador.sprite);
        this.cameras.main.setZoom(2.3);
        this.cameras.main.setBounds(0, 0, larguraImagem, alturaImagem);

        // ── Posição Inicial baseada na origem ─────────────────────────────────
        if (this.origem === 'PraiaDosProveitos') {
            this.jogador.sprite.setPosition(540, 840);
        }

        // ── Câmera UI para diálogos ───────────────────────────────────────────
        // Necessária com zoom alto (2.3) para que a caixa de diálogo apareça corretamente
        DialogoManager.configurarCameraUI(this, 2.3, [this.cielita]);

        // ── HUD: indicativo inicial ───────────────────────────────────────────
        if (!this.dialogoCielitaConcluido) {
            this.game.events.emit('atualizarBalao', { texto: 'Fale com a Cielita', visivel: true });
        }

        // Criação de todos os movimentos dos carros
        // Carro 1 (horizontal)
    
        this._iniciarCadeiaCarros();


         if (this.origem === 'CasaCidade1') {
            this.jogador.sprite.setPosition(546, 595); 
        }

         if (this.origem === 'CasaCidade2') {
            this.jogador.sprite.setPosition(835, 150); 
        }
    }


    update(time, delta) {
        if (super.update()) return;

        this.jogador.atualizar();
        this.miniMapa.atualizar();

        // ── Atualiza NPC Cielita ──────────────────────────────────────────────
        this.cielita.atualizar(this.jogador.sprite, [this.teclas.interagir, this.teclas.interagir2]);


        // ── HUD dinâmico ──────────────────────────────────────────────────────
        if (this.cielita.dialogoAberto) {
            this.game.events.emit('atualizarBalao', { texto: '', visivel: false });
        } else if (!this.dialogoCielitaConcluido) {
            this.game.events.emit('atualizarBalao', { texto: 'Fale com a Cielita', visivel: true });
        } else {
            this.game.events.emit('atualizarBalao', { texto: '', visivel: false });
        }

        // ── Portal ────────────────────────────────────────────────────────────
        if (this.jogador.temOverlap(this.PortalCielo)) {
            this.trocarCena('PraiaDosProveitos');
            return;
        }

        if (this.jogador.temOverlap(this.PortaCasaCidade1) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CasaCidade1');
            return;
        }

         if (this.jogador.temOverlap(this.PortaLojaCidade1) && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.trocarCena('CasaCidade2');
            return;
        }
       
        if (this.carro1)  this.carro1.atualizar(time);
        if (this.carro2)  this.carro2.atualizar(time);
        if (this.carro3)  this.carro3.atualizar(time);
        if (this.carro4)  this.carro4.atualizar(time);
        if (this.carro5)  this.carro5.atualizar(time);
        if (this.carro6)  this.carro6.atualizar(time);
        if (this.carro7)  this.carro7.atualizar(time);
        if (this.carro8)  this.carro8.atualizar(time);
        if (this.carro9)  this.carro9.atualizar(time);
        if (this.carro10) this.carro10.atualizar(time);
        if (this.carro11) this.carro11.atualizar(time);
    }
}