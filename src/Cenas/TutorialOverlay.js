export default class TutorialOverlay extends Phaser.Scene {
    constructor() { super('TutorialOverlay'); }

    create() {
        const { width, height } = this.cameras.main;

        this.cenaAnterior = this.scene.manager.scenes.find(s =>
            s.scene.key !== 'TutorialOverlay' && s.scene.isActive()
        );

        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);

        const imgTutorial = this.add.image(width / 2, height / 2, 'Tutorial');
        imgTutorial.setDisplaySize(width * 0.85, height * 0.85);

        this.add.text(width / 2, height - 30, 'Para fechar o tutorial aperte H', {
            fontSize: '12px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);

        this.podeFechar = false;
        this.time.delayedCall(300, () => {
            this.podeFechar = true;
        });

        this.teclah = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);

        // 👇 ESSA É A CORREÇÃO PRINCIPAL
        this.events.on('shutdown', () => {
            if (this.cenaAnterior) {
                this.cenaAnterior.input.keyboard.enabled = true;
            }
        });
    }

    update() {
        if (this.podeFechar && Phaser.Input.Keyboard.JustDown(this.teclah)) {
            this.scene.stop();
        }
    }
}