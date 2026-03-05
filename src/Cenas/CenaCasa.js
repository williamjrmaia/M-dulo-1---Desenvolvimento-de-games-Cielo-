import Jogador from "./classes.js";

export default class CenaCasa extends Phaser.Scene {

    constructor() {
        super('CenaCasa');
    }

    preload() {
        this.load.image('DentroCasa', '../assets/CenarioCasa/ROOM1-HOUSE/Scene1_House1.png');

        // Personagem
        this.load.spritesheet('Andando',    '../assets/animacoes/andarfrente.png',  { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('IdleFrente', '../assets/animacoes/idlefrente.png',   { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('Lado',       '../assets/animacoes/andarlado.png',    { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('Costa',      '../assets/animacoes/andarcosta.png',   { frameWidth: 64, frameHeight: 64 });

        // NPC
        this.load.spritesheet('cielitaparada', '../assets/NPC/cielita/idlecielita.png', { frameWidth: 16, frameHeight: 25 });

        // Objetos
        this.load.image('balao', 'assets/objetos/balao dialogo.png');
        this.load.image('IndicadorE', 'assets/objetos/Botão E.png');

    }

    create() {
        // Background
        var background = this.add.image(750, 400, 'DentroCasa').setScale(2.3);

        // World bounds
        let larguraMapa = background.displayWidth;
        let alturaMapa  = background.displayHeight;
        let limiteX     = background.x - larguraMapa / 2;
        let limiteY     = background.y - alturaMapa  / 2;
        this.physics.world.setBounds(limiteX, limiteY, larguraMapa, alturaMapa);

        // NPC
        this.cielita = this.physics.add.sprite(750, 400, 'cielitaparada').setScale(2.3);
        this.cielita.setImmovable(true);
        this.cielita.play('cielitaparada', true);

        // Player — sprite creation, animations and input all in one place
        this.jogador = new Jogador(this, 750, 480);
        this.teclas  = this.jogador.configurarTeclas();

        // Collisions
        this.jogador.adicionarColisao(this.cielita);

        // Door trigger
        this.gatilhoPorta = this.add.zone(limiteX + larguraMapa / 2, limiteY + alturaMapa - 20, 40, 40);
        this.physics.add.existing(this.gatilhoPorta);
        this.gatilhoPorta.body.setAllowGravity(false);
        this.gatilhoPorta.body.setImmovable(true);

        this.naPorta = false;
        this.jogador.adicionarOverlap(this.gatilhoPorta, () => {
            this.naPorta = true;
        });

        // Sistema de Dialogo

        this.dialogos = [
            { texto: "Olá, seja bem-vindo à minha casa!", personagem: 'Cielita' },
            { texto: "Sinta-se à vontade para explorar e conversar comigo.", personagem: 'Cielita' },
            { texto: "Se precisar de algo, é só me chamar!", personagem: 'Cielita' }
        ];

        this.indiceDialogo = 0;
        this.dialogoAberto = false;
        this.digitando = false;
        this.DISTANCIA_INTERACAO = 80;

        const larguraTela = this.scale.width;
        const alturaTela = this.scale.height;
        const caixaY = alturaTela - 100;

        // Caixa de diálogo fixa na tela
        const textura = this.textures.get('balao').getSourceImage();
        const caixaLargura = textura.width;
        const caixaAltura = textura.height;  


        this.caixaImagem = this.add.image(this.scale.width / 2, caixaY, 'balao')
        .setScrollFactor(0)
        .setDepth(20)
        .setVisible(false) 
        .setDisplaySize(larguraTela, caixaAltura);

        // Nome do personagem
        this.textoNome = this.add.text(
            larguraTela / 2 - this.caixaImagem.displayWidth / 2 + 30,
            caixaY - this.caixaImagem.displayHeight / 2 + 14,
            '', {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffdd57',
                fontStyle: 'bold'
            }
        ).setScrollFactor(0).setDepth(21).setVisible(false);

         // Texto da fala
        this.textoFala = this.add.text(
            larguraTela / 2 - this.caixaImagem.displayWidth / 2 + 30,
            caixaY - this.caixaImagem.displayHeight / 2 + 36,
            '', {
                fontFamily: 'Arial',
                fontSize: '17px',
                color: '#ffffff',
                wordWrap: { width: larguraTela - 60 }
            }
        ).setScrollFactor(0).setDepth(21).setVisible(false);

        // Indicador ▼ piscando
        this.indicadorAvancar = this.add.text(
            larguraTela / 2 + this.caixaImagem.displayWidth / 2 - 30,
            caixaY + this.caixaImagem.displayHeight / 2 - 18,
            '▼', {
                fontFamily: 'Arial',
                fontSize: '13px',
                color: '#ffffff'
            }
        ).setScrollFactor(0).setDepth(21).setVisible(false);

        this.tweens.add({
            targets: this.indicadorAvancar,
            alpha: 0,
            duration: 400,
            yoyo: true,
            repeat: -1
        });

        // Indicador "Aperte E" acima da Cielita
        this.indicadorE = this.add.image(0, 0, 'IndicadorE')
        .setDepth(11)
        .setVisible(false)
        .setScale(2.5);

    }

    mostrarDialogo(indice) {
        const entrada = this.dialogos[indice];

        this.caixaImagem.setVisible(true);
        this.textoNome.setVisible(true).setText(entrada.personagem);
        this.textoFala.setVisible(true).setText('');
        this.indicadorAvancar.setVisible(false);
        this.dialogoAberto = true;
        this.digitando     = true;

        const cor = entrada.personagem === 'Cielita' ? '#ffdd57' : '#88eeff';
        this.textoNome.setColor(cor);

        let i = 0;
        const textoCompleto = entrada.texto;

        if (this.timerTypewriter) this.timerTypewriter.remove();

        this.timerTypewriter = this.time.addEvent({
            delay: 35,
            repeat: textoCompleto.length - 1,
            callback: () => {
                this.textoFala.setText(textoCompleto.substring(0, i + 1));
                i++;
                if (i >= textoCompleto.length) {
                    this.digitando = false;
                    this.indicadorAvancar.setVisible(true);
                }
            }
        });
    }

    fecharDialogo() {
        this.caixaImagem.setVisible(false);
        this.textoNome.setVisible(false);
        this.textoFala.setVisible(false);
        this.indicadorAvancar.setVisible(false);
        this.dialogoAberto = false;
        this.digitando     = false;
        this.indiceDialogo = 0;
        if (this.timerTypewriter) this.timerTypewriter.remove();
    }
    

    update() {
        this.jogador.atualizar();

        if (!this.jogador.temOverlap(this.gatilhoPorta)) {
            this.naPorta = false;
        }

        if (this.naPorta && Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('MundoCasa');
            });
        }
                // --- Proximidade com Cielita ---
        const dist = Phaser.Math.Distance.Between(
            this.jogador.sprite.x, this.jogador.sprite.y,
            this.cielita.x, this.cielita.y
        );
        const perto = dist <= this.DISTANCIA_INTERACAO;

        // Indicador "Aperte E" — só aparece quando diálogo está fechado
        if (perto && !this.dialogoAberto) {
            this.indicadorE
                .setPosition(this.cielita.x - 10, this.cielita.y - this.cielita.displayHeight / 2 - 20)
                .setVisible(true);
        } else {
            this.indicadorE.setVisible(false);
        }

        // Fecha se jogador se afastar durante o diálogo
        if (!perto && this.dialogoAberto) {
            this.fecharDialogo();
        }

        // --- Tecla E ---
        if (Phaser.Input.Keyboard.JustDown(this.teclas.interagir)) { 
            // Inicia diálogo
            if (perto && !this.dialogoAberto) {
                this.indiceDialogo = 0;
                this.mostrarDialogo(this.indiceDialogo);
                return;
            }

            // Completa o texto imediatamente se ainda está digitando
            if (this.dialogoAberto && this.digitando) {
                this.timerTypewriter.remove();
                this.textoFala.setText(this.dialogos[this.indiceDialogo].texto);
                this.digitando = false;
                this.indicadorAvancar.setVisible(true);
                return;
            }

            // Avança para próxima fala ou fecha
            if (this.dialogoAberto && !this.digitando) {
                this.indiceDialogo++;
                if (this.indiceDialogo < this.dialogos.length) {
                    this.mostrarDialogo(this.indiceDialogo);
                } else {
                    this.fecharDialogo();
                }

            }
        }
    }
}
