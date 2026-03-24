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

        // ✅ Escuta no barramento global compartilhado por todas as cenas
        this._onAtualizarBalao = ({ texto, visivel }) => {
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
}