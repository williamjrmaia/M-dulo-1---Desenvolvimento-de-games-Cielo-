export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

   preload() {
    // Abordagem
    this.load.image('AntiPitch',             'assets/Cartas/Abordagem/AntiPitch.png');
    this.load.image('ComparacaoInteligente', 'assets/Cartas/Abordagem/ComparacaoInteligente.png');
    this.load.image('DesarmeElegante',       'assets/Cartas/Abordagem/DesarmeElegante.png');
    this.load.image('DiretoAoPonto',         'assets/Cartas/Abordagem/DiretoAoPonto.png');
    this.load.image('GanchoSocial',          'assets/Cartas/Abordagem/GanchoSocial.png');

    // Sondagem
    this.load.image('AutoridadeImplicita',  'assets/Cartas/Sondagem/AutoridadeImplicita.png');
    this.load.image('ChaveDeExclusividade', 'assets/Cartas/Sondagem/ChaveDeExclusividade.png');
    this.load.image('Cliffhanger',          'assets/Cartas/Sondagem/Cliffhanger.png');
    this.load.image('GanchoDaDor',          'assets/Cartas/Sondagem/GanchoDaDor.png');
    this.load.image('LoboCurioso',          'assets/Cartas/Sondagem/LoboCurioso.png');
    this.load.image('PerguntaDeImpacto',    'assets/Cartas/Sondagem/PerguntaDeImpacto.png');

    // Produtos / Demonstração
    this.load.image('CieloLioOn',  'assets/Cartas/Produtos/LIOON.png');
    this.load.image('CieloFlash',  'assets/Cartas/Produtos/FLASH.png');
    this.load.image('CVBA',        'assets/Cartas/Produtos/CVBA.png');
    this.load.image('CieloFlash2', 'assets/Cartas/Produtos/FLASH2.png');
}

    create() {
        const W      = this.scale.width;
        const H      = this.scale.height;
        const barraW = 400;
        const barraH = 20;
        const barraX = (W - barraW) / 2;
        const barraY = H / 2 + 20;

        this.add.rectangle(0, 0, W, H, 0x060e14).setOrigin(0, 0);

        this.add.text(W / 2, H / 2 - 60, 'CARREGANDO...', {
            fontFamily:    '"Courier New", monospace',
            fontSize:      '20px',
            color:         '#4a8aaa',
            letterSpacing: 6,
        }).setOrigin(0.5);

        this.add.rectangle(W / 2, barraY + barraH / 2, barraW, barraH, 0x0a1520)
            .setStrokeStyle(1, 0x2a4a5a)
            .setOrigin(0.5);

        const fill = this.add.rectangle(barraX, barraY, 0, barraH - 4, 0x22aa55)
            .setOrigin(0, 0);

        const textoPorc = this.add.text(W / 2, barraY + 35, '0%', {
            fontFamily: '"Courier New", monospace',
            fontSize:   '13px',
            color:      '#3a6a7a',
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            fill.width = barraW * value;
            textoPorc.setText(`${Math.floor(value * 100)}%`);
        });

        const irParaJogo = () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once(
                Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
                () => this.scene.start('NegociacaoPedro')
            );
        };

        // Se não há nada para baixar (tudo em cache), 'complete' nunca dispara
        if (this.load.totalToLoad === 0) {
            irParaJogo();
        } else {
            this.load.once('complete', irParaJogo);
        }
    }
}