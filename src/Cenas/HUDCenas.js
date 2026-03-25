export default class HUDCenas extends Phaser.Scene {
    constructor() { super({ key: 'HUDCenas' }); }

    preload() {
        this.load.image('balaoInd', './assets/objetos/balao_ind.png');
    }

    create() {
        const W = this.scale.width;

        // ✅ Garante que a câmera do HUD não sofre scroll junto com a cena principal
        this.cameras.main.setScroll(0, 0);

        this.balaoInd = this.add.image(W / 2, 40, 'balaoInd')
            .setDepth(10)
            .setScale(1.5)
            .setScrollFactor(0); // ✅ Fixo na tela, ignora movimento de câmera

        this.textoBalao = this.add.text(W / 2, 40, '', {
            fontSize: '13px',
            fill: '#ffffff',
            fontFamily: 'Arial',
        }).setOrigin(0.5)
          .setDepth(11)
          .setScrollFactor(0); // ✅ Fixo na tela, ignora movimento de câmera

        // Começa invisível
        this.balaoInd.setVisible(false);
        this.textoBalao.setVisible(false);

        // Controle de ativação/desativação das indicativas (tecla O)
        this._indicativosAtivos = true;
        this._ultimoBalao = { texto: '', visivel: false };

        // Toggle: aperte O para ligar/desligar as indicativas
        this._teclaToggleIndicativos = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.O
        );

        // ✅ Escuta no barramento global compartilhado por todas as cenas
        this._onAtualizarBalao = ({ texto, visivel }) => {
            // Guarda o último estado para quando o usuário reativar.
            this._ultimoBalao = { texto, visivel };

            if (!this._indicativosAtivos) {
                this.balaoInd.setVisible(false);
                this.textoBalao.setVisible(false);
                return;
            }

            this.textoBalao.setText(texto);
            this.balaoInd.setVisible(visivel);
            this.textoBalao.setVisible(visivel);
        };

        this.game.events.on('atualizarBalao', this._onAtualizarBalao, this);

        // ✅ Remove o listener quando o HUD for encerrado (evita duplicatas ao reiniciar)
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.game.events.off('atualizarBalao', this._onAtualizarBalao, this);
        });
    }

    update() {
        // Alterna o HUD indicativo com a tecla O
        if (Phaser.Input.Keyboard.JustDown(this._teclaToggleIndicativos)) {
            this._indicativosAtivos = !this._indicativosAtivos;

            const { texto, visivel } = this._ultimoBalao;
            if (this._indicativosAtivos && visivel) {
                this.textoBalao.setText(texto);
                this.balaoInd.setVisible(true);
                this.textoBalao.setVisible(true);
            } else {
                this.balaoInd.setVisible(false);
                this.textoBalao.setVisible(false);
            }
        }
    }
}