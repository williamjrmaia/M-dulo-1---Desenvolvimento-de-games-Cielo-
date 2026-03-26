export default class AudioManager extends Phaser.Scene {
    constructor() {
        super('AudioManager');
    }

    create() {
        this.registry.set('audio', this);
        this.musicaAtual   = null;
        this.chaveAtual    = null;
        this.ambienteAtual = null;
        this.chaveAmbiente = null;

        // Carrega volumes salvos (ou usa os padrões)
        this._volumeMusica   = this._carregarVolume('cielo_vol_musica',   0.5);
        this._volumeAmbiente = this._carregarVolume('cielo_vol_ambiente',  0.3);
    }

    // ── Getters / Setters de volume ───────────────────────────────────────────

    getVolumeMusica()   { return this._volumeMusica;   }
    getVolumeAmbiente() { return this._volumeAmbiente; }

    /**
     * Altera o volume da música em tempo real e persiste no localStorage.
     * @param {number} v - valor entre 0 e 1
     */
    setVolumeMusica(v) {
        this._volumeMusica = Phaser.Math.Clamp(v, 0, 1);
        if (this.musicaAtual && this.musicaAtual.isPlaying) {
            this.musicaAtual.setVolume(this._volumeMusica);
        }
        this._salvarVolume('cielo_vol_musica', this._volumeMusica);
    }

    /**
     * Altera o volume do ambiente em tempo real e persiste no localStorage.
     * @param {number} v - valor entre 0 e 1
     */
    setVolumeAmbiente(v) {
        this._volumeAmbiente = Phaser.Math.Clamp(v, 0, 1);
        if (this.ambienteAtual && this.ambienteAtual.isPlaying) {
            this.ambienteAtual.setVolume(this._volumeAmbiente);
        }
        this._salvarVolume('cielo_vol_ambiente', this._volumeAmbiente);
    }

    // ── Música principal (com fade) ───────────────────────────────────────────

    tocarMusica(chave, _volumeIgnorado = 0.5) {
        // Usa sempre o volume salvo; o parâmetro legado é ignorado silenciosamente
        const vol = this._volumeMusica;

        if (this.chaveAtual === chave) return;

        const tocar = () => {
            this.musicaAtual = this.sound.add(chave, { loop: true, volume: 0 });
            this.musicaAtual.play();
            this.tweens.add({ targets: this.musicaAtual, volume: vol, duration: 800 });
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

    tocarAmbiente(chave, _volumeIgnorado = 0.3) {
        const vol = this._volumeAmbiente;

        if (this.chaveAmbiente === chave) return;

        if (this.ambienteAtual && this.ambienteAtual.isPlaying) {
            this.tweens.add({
                targets: this.ambienteAtual,
                volume: 0,
                duration: 600,
                onComplete: () => {
                    this.ambienteAtual.stop();
                    this.ambienteAtual.destroy();
                    this._iniciarAmbiente(chave, vol);
                }
            });
        } else {
            this._iniciarAmbiente(chave, vol);
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

    // ── Som de typewriter para diálogos ──────────────────────────────────────

    tocarBlipDialogo() {
        if (this.cache.audio.exists('blip_teclado')) {
            this.sound.play('blip_teclado', { volume: 0.005 });
        }
    }

    tocarTransicao() {
        if (this.cache.audio.exists('transicao_entre_mapas')) {
            this.sound.play('transicao_entre_mapas', { volume: 0.5 });
        }
    }

    tocarInsignia() {
        if (this.cache.audio.exists('insignia_sound')) {
            this.sound.play('insignia_sound', { volume: 0.7 });
        }
    }

    tocarBotaoMenu() {
        if (this.cache.audio.exists('botoes_menu')) {
            this.sound.play('botoes_menu', { volume: 2.5 });
        }
    }

    // ── Helpers de persistência ───────────────────────────────────────────────

    _salvarVolume(chave, valor) {
        try { localStorage.setItem(chave, valor); } catch (_) {}
    }

    _carregarVolume(chave, padrao) {
        try {
            const salvo = localStorage.getItem(chave);
            return salvo !== null ? parseFloat(salvo) : padrao;
        } catch (_) {
            return padrao;
        }
    }
}