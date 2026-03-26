export default class AudioManager extends Phaser.Scene {
    constructor() {
        super('AudioManager');
    }

    create() {
        this.registry.set('audio', this);
        this.musicaAtual  = null;
        this.chaveAtual   = null;
        this.ambienteAtual = null;
        this.chaveAmbiente = null;
    }

    // ── Música principal (com fade) ───────────────────────────────────────────
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
                this.chaveAtual  = null;
            }
        });
    }

    // ── Som ambiente (toca junto com a música) ────────────────────────────────
    tocarAmbiente(chave, volume = 0.3) {
        if (this.chaveAmbiente === chave) return;

        if (this.ambienteAtual && this.ambienteAtual.isPlaying) {
            this.tweens.add({
                targets: this.ambienteAtual,
                volume: 0,
                duration: 600,
                onComplete: () => {
                    this.ambienteAtual.stop();
                    this.ambienteAtual.destroy();
                    this._iniciarAmbiente(chave, volume);
                }
            });
        } else {
            this._iniciarAmbiente(chave, volume);
        }
    }

    _iniciarAmbiente(chave, volume) {
        this.ambienteAtual = this.sound.add(chave, { loop: true, volume: 0 });
        this.ambienteAtual.play();
        this.tweens.add({ targets: this.ambienteAtual, volume, duration: 600 });
        this.chaveAmbiente = chave;
    }

    pararAmbiente() {
        if (!this.ambienteAtual) return;
        this.tweens.add({
            targets: this.ambienteAtual,
            volume: 0,
            duration: 600,
            onComplete: () => {
                this.ambienteAtual.stop();
                this.ambienteAtual.destroy();
                this.ambienteAtual  = null;
                this.chaveAmbiente  = null;
            }
        });
    }
}