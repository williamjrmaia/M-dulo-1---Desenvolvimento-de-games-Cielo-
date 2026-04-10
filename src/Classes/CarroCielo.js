export default class CarroCielo {

    constructor(cena, { xi, yi, xf, yf, T, pausaMs = 2000, escala = 1, jogadorSprite, onFimCiclo, texturaKey = 'carro_cielo', flipX = false, flipY = false, miniMapa = null }) {
        this._cena = cena;
        this._onFimCiclo = onFimCiclo || null;

        this.xi       = xi;
        this.yi       = yi;
        this.xf       = xf;
        this.yf       = yf;
        this.T        = T;
        this._pausaMs = pausaMs;

        this.vx = (xf - xi) / T;
        this.ay = (2 * (yf - yi)) / (T * T);

        this._iniciado      = false;
        this._ativo         = true;
        this._t0Ms          = 0;
        this._emPausa       = false;
        this._pausaInicioMs = 0;

        // ✅ usa texturaKey e aplica flipX/flipY
        this.sprite = cena.physics.add.image(xi, yi, texturaKey)
            .setDepth(6)
            .setScale(escala)
            .setImmovable(false)
            .setFlipX(flipX)
            .setFlipY(flipY);

        this.sprite.body.setAllowGravity(false);

        // Ignora este sprite em todas as câmeras secundárias (ex: uiCam do DialogoManager)
        // para evitar que apareça duplicado na tela.
        cena.cameras.cameras.forEach(cam => {
            if (cam !== cena.cameras.main) cam.ignore(this.sprite);
        });

        if (miniMapa) {
    miniMapa.ignorarObjeto(this.sprite);
        }
        if (jogadorSprite) {
            cena.physics.add.collider(this.sprite, jogadorSprite);
        }
    }

    atualizar(timeNowMs) {

        if (this._emPausa) {
            if (timeNowMs - this._pausaInicioMs >= this._pausaMs) {
                this._iniciarCiclo(timeNowMs);
            }
            this.sprite.body.setVelocity(0, 0);
            return;
        }

        if (!this._iniciado) {
            this._t0Ms     = timeNowMs;
            this._iniciado = true;
        }

        const t = (timeNowMs - this._t0Ms) / 1000;

        // ✅ bloco de fim de ciclo único — sem duplicata
        if (t >= this.T) {
            this.sprite.body.reset(this.xf, this.yf);
            this.sprite.body.setVelocity(0, 0);

            this._cena.time.delayedCall(50, () => {
                this._emPausa       = true;
                this._pausaInicioMs = this._cena.time.now;
                this._iniciado      = false;

                if (this._onFimCiclo) {
                    this._onFimCiclo();
                    this._onFimCiclo = null;
                }
            });
            return;
        }

        const x = this.xi + this.vx * t;
        const y = this.yi + (0.5 * this.ay * t * t);

        this.sprite.body.reset(x, y);
    }

    _iniciarCiclo(timeNowMs) {
        this._emPausa  = false;
        this._iniciado = false;
        this._t0Ms     = timeNowMs;
        this.sprite.body.reset(this.xi, this.yi);
    }

    get estaAtivo() { return this._ativo; }
}