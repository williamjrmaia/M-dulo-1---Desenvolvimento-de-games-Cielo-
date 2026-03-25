export default class AudioManager extends Phaser.Scene {
    constructor() {
        super('AudioManager');
    }

    create() {
        this.registry.set('audio', this);
        this.musicaAtual = null;
        this.chaveAtual = null;
    }

    tocarMusica(chave, volume = 0.5) {
        if (this.chaveAtual === chave) return;

        const tocar = () => {
            this.musicaAtual = this.sound.add(chave, { loop: true, volume: 0 });
            this.musicaAtual.play();
            this.tweens.add({ targets: this.musicaAtual, volume, duration: 800 });
            this.chaveAtual = chave;
        };

        if (this.musicaAtual && this.musicaAtual.isPlaying) {
            this.tweens.add({
                targets: this.musicaAtual,
                volume: 0,
                duration: 800,
                onComplete: () => {
                    this.musicaAtual.stop();
                    this.musicaAtual.destroy();
                    tocar();
                }
            });
        } else {
            tocar();
        }
    }

    pararMusica() {
        if (!this.musicaAtual) return;
        this.tweens.add({
            targets: this.musicaAtual,
            volume: 0,
            duration: 800,
            onComplete: () => {
                this.musicaAtual.stop();
                this.musicaAtual.destroy();
                this.musicaAtual = null;
                this.chaveAtual = null;
            }
        });
    }
}