export default class CenaIntroducao extends Phaser.Scene {

    constructor() {
        super('CenaIntroducao');
    }

    preload() {
        // Substitua pelo caminho real da sua imagem de fundo
        this.load.image('IntroFundo', './assets/intro/fundo_intro.png');

        this.load.image('balao',      './assets/objetos/balao_dialogo.png');
        this.load.image('IndicadorE', './assets/objetos/botao_e.png');
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        // ── Nome do jogador — lido aqui, quando a cena já está ativa ──────────
        const nomeJogador = this.game.registry.get('nomeJogador')
                         || localStorage.getItem('nomeJogador')
                         || 'Jogador';

        // ── Falas narrativas com contexto de GN/vendas ────────────────────────
        this._falas = [
            { personagem: 'Cielita', texto: 'Todo grande negócio começa com uma conversa...' },
            { personagem: 'Cielita', texto: 'Mas nem toda conversa se transforma em negócio.' },
            { personagem: 'Cielita', texto: `É aí que entram os escolhidos, ${nomeJogador}.` },
            { personagem: 'Cielita', texto: 'No Cielo Verso, você vai aprender a ouvir o que o cliente não diz, oferecer o que ele ainda não sabe que precisa...' },
            { personagem: 'Cielita', texto: '...e fechar acordos que mudam o rumo de um negócio.' },
            { personagem: 'Cielita', texto: 'A maquininha é apenas o começo. O que você faz com ela é o que define um verdadeiro Gerente de Negócios.' },
            { personagem: 'Cielita', texto: 'Sua jornada começa agora. Mostre do que você é capaz.' },
        ];

        // ── Fundo preto de segurança ──────────────────────────────────────────
        this.add.rectangle(W / 2, H / 2, W, H, 0x000000);

        // ── Imagem de fundo da intro ──────────────────────────────────────────
        this.add.image(W / 2, H / 2, 'IntroFundo');

        // ── Estado do diálogo ─────────────────────────────────────────────────
        this._falasIndex   = 0;
        this._digitando    = false;
        this._textoAtual   = '';
        this._timerDigitar = null;

        // ── Caixa de diálogo (balão) ──────────────────────────────────────────
        const balaoY = H / 2;
        this.balao   = this.add.image(W / 2, balaoY, 'balao')
            .setDisplaySize(W * 0.80, H * 0.22)
            .setDepth(10);

        // ── Nome do personagem ────────────────────────────────────────────────
        this.txtNome = this.add.text(
            W / 2 - (W * 0.80) / 2 + 24,
            balaoY - (H * 0.22) / 2 + 14,
            '',
            {
                fontFamily: 'Arial',
                fontSize:   '18px',
                color:      '#f5d76e',
                fontStyle:  'bold',
            }
        ).setDepth(11);

        // ── Texto da fala (efeito máquina de escrever) ────────────────────────
        this.txtFala = this.add.text(
            W / 2 - (W * 0.80) / 2 + 24,
            balaoY - (H * 0.22) / 2 + 42,
            '',
            {
                fontFamily: 'Arial',
                fontSize:   '17px',
                color:      '#ffffff',
                wordWrap:   { width: W * 0.80 - 48 },
            }
        ).setDepth(11);

        // ── Indicador "pressione E" (ícone) ──────────────────────────────────
        this.indicador = this.add.image(
            W / 2 + (W * 0.80) / 2 - 28,
            balaoY + (H * 0.22) / 2 - 16,
            'IndicadorE'
        )
            .setScale(1.4)
            .setDepth(11)
            .setVisible(false);

        // ── Texto "Aperte E para continuar" abaixo da caixa ──────────────────
        this.txtAvancar = this.add.text(
            W / 2,
            balaoY + (H * 0.22) / 2 + 24,
            'Aperte E para continuar',
            {
                fontFamily: 'Arial',
                fontSize:   '14px',
                color:      '#aaaaaa',
                fontStyle:  'italic',
            }
        )
            .setOrigin(0.5, 0)
            .setDepth(11)
            .setVisible(false);

        this.tweens.add({
            targets:  [this.indicador, this.txtAvancar],
            alpha:    0,
            duration: 500,
            yoyo:     true,
            repeat:   -1,
        });

        // ── Tecla de avançar ──────────────────────────────────────────────────
        this.teclaAvancar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // ── Fade in e início do diálogo ───────────────────────────────────────
        this.cameras.main.fadeIn(800, 0, 0, 0);
        this.cameras.main.once(
            Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE,
            () => this._mostrarFala(0),
        );
    }

    // ── Exibe a fala no índice indicado ──────────────────────────────────────
    _mostrarFala(index) {
        const fala = this._falas[index];

        this.indicador.setVisible(false);
        this.txtAvancar.setVisible(false);
        this.txtNome.setText(fala.personagem);
        this.txtFala.setText('');
        this._textoAtual = fala.texto;
        this._digitando  = true;

        let charIndex = 0;

        if (this._timerDigitar) this._timerDigitar.remove();

        this._timerDigitar = this.time.addEvent({
            delay:    40,
            repeat:   fala.texto.length - 1,
            callback: () => {
                this.txtFala.setText(fala.texto.substring(0, charIndex + 1));
                charIndex++;
                if (charIndex >= fala.texto.length) {
                    this._digitando = false;
                    this.indicador.setVisible(true);
                    this.txtAvancar.setVisible(true);
                }
            },
        });
    }

    // ── Avança ou conclui o diálogo ──────────────────────────────────────────
    _avancar() {
        // Texto ainda digitando → exibe tudo imediatamente
        if (this._digitando) {
            if (this._timerDigitar) this._timerDigitar.remove();
            this._digitando = false;
            this.txtFala.setText(this._textoAtual);
            this.indicador.setVisible(true);
            this.txtAvancar.setVisible(true);
            return;
        }

        this._falasIndex++;

        if (this._falasIndex < this._falas.length) {
            this._mostrarFala(this._falasIndex);
            return;
        }

        // ── Fim do diálogo → vai para CenaCasa ───────────────────────────────
        this.teclaAvancar.enabled = false;
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once(
            Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
            () => this.scene.start('CenaCasa'),
        );
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.teclaAvancar)) {
            this._avancar();
        }
    }
}