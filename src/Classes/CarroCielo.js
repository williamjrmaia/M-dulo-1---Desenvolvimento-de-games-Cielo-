// =============================================================================
// CarroCielo.js
// Carro decorativo que percorre um trajeto retangular em loop contínuo.
//
// O trajeto é definido por um array de SEGMENTOS, cada um com ponto inicial,
// ponto final, duração, textura e flip. O carro percorre todos os segmentos
// em sequência e, ao concluir o loop completo, pausa antes de reiniciar.
//
// EIXO X → Movimento Uniforme (MU):            vx = (xf-xi)/T  (constante)
// EIXO Y → Movimento Uniformemente Variado (MUV): ay = 2*(yf-yi)/T²  (v0y=0)
//
// Em segmentos puramente horizontais: yf = yi  → ay = 0, Y constante.
// Em segmentos puramente verticais:   xf = xi  → vx = 0, X constante.
// A matemática é idêntica ao original — apenas aplicada por trecho.
//
// ── REFERÊNCIA ────────────────────────────────────────────────────────────────
//   HALLIDAY, D.; RESNICK, R.; WALKER, J. Fundamentos de Física, Vol. 1.
//   Rio de Janeiro: LTC, 10ª ed., 2016. Cap. 2, pp. 18-52.
//
// ── PERCURSO PADRÃO (Cidade Cielo) ────────────────────────────────────────────
//
//   A (165,684) ──[carro_cielo]──► B (480,684)
//                                  │
//                              [carro2]
//                                  │
//                                  ▼
//   D (165,768) ◄──[carro_cielo]── C (480,768)
//   │
//   [carro2 flipY]
//   │
//   ▲ volta a A
//
// ── INTEGRAÇÃO ────────────────────────────────────────────────────────────────
//   // create():
//   this.carro = new CarroCielo(this, {
//       pausaMs:       2000,
//       jogadorSprite: this.jogador.sprite,
//       segmentos: [
//           { xi:165, yi:684, xf:480, yf:684, T:3, textura:'carro_cielo'              },
//           { xi:480, yi:684, xf:480, yf:768, T:2, textura:'carro2'                   },
//           { xi:480, yi:768, xf:165, yf:768, T:3, textura:'carro_cielo', flipX:true  },
//           { xi:165, yi:768, xf:165, yf:684, T:2, textura:'carro2',      flipY:true  },
//       ],
//   });
//
//   // update():
//   this.carro.atualizar(this.time.now);
// =============================================================================

export default class CarroCielo {

    /**
     * @param {Phaser.Scene} cena
     * @param {object}  p
     * @param {Array}   p.segmentos        - array de segmentos do percurso
     * @param {number}  [p.pausaMs]        - pausa ao fim do loop completo (ms, padrão: 2000)
     * @param {number}  [p.pausaSegMs]     - pausa entre segmentos/esquinas (ms, padrão: 0)
     * @param {number}  [p.escala]         - escala global do sprite (padrão: 1)
     * @param {Phaser.GameObjects.Sprite} p.jogadorSprite
     *
     * Cada segmento: { xi, yi, xf, yf, T, textura, flipX?, flipY?, escala? }
     */
    constructor(cena, { segmentos, pausaMs = 2000, pausaSegMs = 0, escala = 1, jogadorSprite }) {
        this._cena        = cena;
        this._segmentos   = segmentos;
        this._pausaMs     = pausaMs;
        this._pausaSegMs  = pausaSegMs;
        this._escalaGlobal = escala;

        // ── Estado ─────────────────────────────────────────────────────────────
        this._segAtual        = 0;
        this._iniciado        = false;
        this._emPausa         = false;
        this._pausaInicioMs   = 0;
        this._t0Ms            = 0;
        this._pausaFimLoop    = false;   // true = pausa pós-loop completo

        // ── Sprite inicial (primeiro segmento) ────────────────────────────────
        const s0 = segmentos[0];
        this.sprite = cena.physics.add.image(s0.xi, s0.yi, s0.textura)
            .setDepth(6)
            .setScale(s0.escala ?? escala)
            .setFlipX(s0.flipX ?? false)
            .setFlipY(s0.flipY ?? false)
            .setImmovable(false);

        this.sprite.body.setAllowGravity(false);

        if (jogadorSprite) {
            cena.physics.add.collider(this.sprite, jogadorSprite);
        }

        // Pré-calcula parâmetros cinemáticos do segmento inicial
        this._calcularParametros();

        // ── Log ───────────────────────────────────────────────────────────────
        console.log('=== CarroCielo: INICIALIZADO (%d segmentos) ===', segmentos.length);
        segmentos.forEach((s, i) => {
            const vx = (s.xf - s.xi) / s.T;
            const ay = (2 * (s.yf - s.yi)) / (s.T * s.T);
            console.log(
                '  [seg %d] %s  xi=%d yi=%d → xf=%d yf=%d  T=%ds' +
                '  [MU]  vx=%.4f px/s  [MUV] ay=%.4f px/s²  flipX=%s flipY=%s',
                i, s.textura, s.xi, s.yi, s.xf, s.yf, s.T,
                vx, ay,
                s.flipX ?? false,
                s.flipY ?? false
            );
        });
        console.log('  pausa loop=', pausaMs, 'ms  pausa seg=', pausaSegMs, 'ms');
        console.log('================================================');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // _calcularParametros()
    //   Deriva vx e ay para o segmento corrente usando as equações cinemáticas.
    // ─────────────────────────────────────────────────────────────────────────
    _calcularParametros() {
        const s = this._segmentos[this._segAtual];

        this.xi = s.xi;
        this.yi = s.yi;
        this.xf = s.xf;
        this.yf = s.yf;
        this.T  = s.T;

        // MU — eixo X:  vx = (xf - xi) / T
        this.vx = (s.xf - s.xi) / s.T;

        // MUV — eixo Y (v0y = 0):  ay = 2*(yf - yi) / T²
        this.ay = (2 * (s.yf - s.yi)) / (s.T * s.T);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // _aplicarSegmento()
    //   Atualiza textura, flip e escala do sprite para o segmento atual.
    // ─────────────────────────────────────────────────────────────────────────
    _aplicarSegmento() {
        const s = this._segmentos[this._segAtual];
        this.sprite.setTexture(s.textura);
        this.sprite.setFlipX(s.flipX ?? false);
        this.sprite.setFlipY(s.flipY ?? false);
        this.sprite.setScale(s.escala ?? this._escalaGlobal);
        this._calcularParametros();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // atualizar(timeNowMs)
    //   Chamado a cada frame. Calcula posição por cinemática pura e reposiciona
    //   o corpo físico via body.reset().
    // ─────────────────────────────────────────────────────────────────────────
    atualizar(timeNowMs) {

        // ── Gerenciamento de pausa (entre segmentos ou fim de loop) ──────────
        if (this._emPausa) {
            const duracao = this._pausaFimLoop ? this._pausaMs : this._pausaSegMs;
            if (timeNowMs - this._pausaInicioMs >= duracao) {
                this._emPausa = false;
                this._iniciado = false;
            }
            this.sprite.body.setVelocity(0, 0);
            return;
        }

        // ── Inicializa o segmento atual ───────────────────────────────────────
        if (!this._iniciado) {
            this._t0Ms     = timeNowMs;
            this._iniciado = true;
            this._aplicarSegmento();
            this.sprite.body.reset(this.xi, this.yi);
        }

        // Tempo decorrido no segmento (segundos)
        const t = (timeNowMs - this._t0Ms) / 1000;

        // ── Fim do segmento ───────────────────────────────────────────────────
        if (t >= this.T) {
            this.sprite.body.reset(this.xf, this.yf);
            this.sprite.body.setVelocity(0, 0);

            const proximoSeg = (this._segAtual + 1) % this._segmentos.length;
            const fimDeLoop  = proximoSeg === 0;

            this._segAtual = proximoSeg;
            this._iniciado = false;

            if (fimDeLoop && this._pausaMs > 0) {
                // Pausa longa ao fim do loop completo
                this._emPausa      = true;
                this._pausaFimLoop = true;
                this._pausaInicioMs = timeNowMs;
                console.log('[CarroCielo] Loop completo. Pausando %dms.', this._pausaMs);
            } else if (!fimDeLoop && this._pausaSegMs > 0) {
                // Pausa curta na virada de segmento (esquina)
                this._emPausa      = true;
                this._pausaFimLoop = false;
                this._pausaInicioMs = timeNowMs;
                console.log('[CarroCielo] Fim seg %d → próx %d. Pausando %dms.',
                    this._segAtual - 1, this._segAtual, this._pausaSegMs);
            }
            return;
        }

        // ── MU — eixo X ───────────────────────────────────────────────────────
        // vx = (xf - xi) / T  →  constante
        // x(t) = xi + vx * t
        const x = this.xi + this.vx * t;

        // ── MUV — eixo Y ──────────────────────────────────────────────────────
        // v0y = 0  →  ay = 2*(yf - yi) / T²
        // vy(t) = ay * t
        // y(t)  = yi + (1/2) * ay * t²
        const y = this.yi + (0.5 * this.ay * t * t);

        // Reposiciona o corpo físico mantendo colisão ativa
        this.sprite.body.reset(x, y);
    }

    get segmentoAtual() { return this._segAtual; }
    get emPausa()       { return this._emPausa;  }
}
