// =============================================================================
// CarroCielo.js
// Carro decorativo que circula pela rua inferior da Cidade Cielo em loop
// contínuo com pausa entre ciclos.
//
// EIXO X → Movimento Uniforme (MU):            velocidade constante
// EIXO Y → Movimento Uniformemente Variado (MUV): parte do repouso, v0y = 0
//
// Coordenadas calculadas a partir do mapa real (escala 1:1 com o jogo):
//   xi=165  yi=684  xf=1335  yf=688  T=5s  pausaMs=2000
//
// A posição é calculada pelas equações cinemáticas puras — sem setVelocity,
// sem tweens, sem funções de movimento do Phaser.
// O corpo físico é reposicionado manualmente via body.reset(), mantendo
// a colisão ativa e permitindo que o carro empurre o jogador.
//
// ── REFERÊNCIA ────────────────────────────────────────────────────────────────
//   HALLIDAY, D.; RESNICK, R.; WALKER, J. Fundamentos de Física, Vol. 1.
//   Rio de Janeiro: LTC, 10ª ed., 2016. Cap. 2, pp. 18-52.
//
// ── INTEGRAÇÃO ────────────────────────────────────────────────────────────────
//   // create():
//   this.carro = new CarroCielo(this, {
//       xi: 165, yi: 684, xf: 1335, yf: 688,
//       T: 5, pausaMs: 2000, escala: 1.2,
//       jogadorSprite: this.jogador.sprite,
//   });
//
//   // update():
//   this.carro.atualizar(this.time.now);
// =============================================================================

export default class CarroCielo {

    /**
     * @param {Phaser.Scene} cena
     * @param {object}  p
     * @param {number}  p.xi           - posição inicial X (px)
     * @param {number}  p.yi           - posição inicial Y (px)
     * @param {number}  p.xf           - posição final   X (px)
     * @param {number}  p.yf           - posição final   Y (px)
     * @param {number}  p.T            - duração de cada ciclo (segundos)
     * @param {number}  [p.pausaMs]    - pausa entre ciclos em ms (padrão: 2000)
     * @param {number}  [p.escala]     - escala do sprite (padrão: 1)
     * @param {Phaser.GameObjects.Sprite} p.jogadorSprite - sprite do jogador
     */
    constructor(cena, { xi, yi, xf, yf, T, pausaMs = 2000, escala = 1, jogadorSprite }) {
        this._cena = cena;

        // ── 1. Parâmetros de entrada ───────────────────────────────────────────
        this.xi      = xi;
        this.yi      = yi;
        this.xf      = xf;
        this.yf      = yf;
        this.T       = T;
        this._pausaMs = pausaMs;

        // ── 2. Parâmetros derivados ────────────────────────────────────────────
        // MU — eixo X:  vx = (xf - xi) / T
        this.vx = (xf - xi) / T;

        // MUV — eixo Y (v0y = 0):  ay = 2*(yf - yi) / T²
        this.ay = (2 * (yf - yi)) / (T * T);

        // ── 3. Estado do ciclo ─────────────────────────────────────────────────
        this._iniciado       = false;
        this._ativo          = true;
        this._t0Ms           = 0;
        this._emPausa        = false;
        this._pausaInicioMs  = 0;

        // ── 4. Sprite com corpo físico dinâmico ────────────────────────────────
        this.sprite = cena.physics.add.image(xi, yi, 'carro_cielo')
            .setDepth(6)
            .setScale(escala)
            .setImmovable(false);

        this.sprite.body.setAllowGravity(false);

        // ── 5. Colisão com o jogador ───────────────────────────────────────────
        if (jogadorSprite) {
            cena.physics.add.collider(this.sprite, jogadorSprite);
        }

        // ── 6. Log de inicialização ────────────────────────────────────────────
        console.log('=== CarroCielo: INICIALIZADO ===');
        console.log('  Parâmetros de entrada:');
        console.log('    xi =', xi, 'px  |  yi =', yi, 'px');
        console.log('    xf =', xf, 'px  |  yf =', yf, 'px');
        console.log('    T  =', T, 's   |  pausa =', pausaMs, 'ms');
        console.log('  Parâmetros derivados:');
        console.log('    [MU  eixo X] vx =', this.vx.toFixed(4), 'px/s  (constante)');
        console.log('    [MUV eixo Y] ay =', this.ay.toFixed(4), 'px/s² (v0y = 0)');
        console.log('================================');
    }

    // ──────────────────────────────────────────────────────────────────────────
    // atualizar(timeNowMs)
    //   Chamado a cada frame pela cena (this.time.now, em ms).
    //   Calcula posição por cinemática pura e reposiciona o corpo físico.
    // ──────────────────────────────────────────────────────────────────────────
    atualizar(timeNowMs) {

        // Gerenciamento de pausa entre ciclos
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

        // Tempo decorrido em segundos
        const t = (timeNowMs - this._t0Ms) / 1000;

        // Condicional de fim de ciclo
        if (t >= this.T) {
            this.sprite.body.reset(this.xf, this.yf);
            this.sprite.body.setVelocity(0, 0);
            this._emPausa       = true;
            this._pausaInicioMs = timeNowMs;
            this._iniciado      = false;
            console.log('[CarroCielo] Ciclo concluído. Pausando por', this._pausaMs, 'ms.');
            return;
        }

        // ── MU — eixo X ───────────────────────────────────────────────────────
        // vx = (xf - xi) / T  →  constante
        // x(t) = xi + vx * t
        const x = this.xi + this.vx * t;

        console.log(
            '[MU  X] t=' + t.toFixed(3) + 's' +
            ' | vx=' + this.vx.toFixed(4) + ' px/s' +
            ' | x=' + x.toFixed(2) + ' px'
        );

        // ── MUV — eixo Y ──────────────────────────────────────────────────────
        // v0y = 0  →  ay = 2*(yf - yi) / T²
        // vy(t) = ay * t
        // y(t)  = yi + (1/2) * ay * t²
        const vy = this.ay * t;
        const y  = this.yi + (0.5 * this.ay * t * t);

        console.log(
            '[MUV Y] t=' + t.toFixed(3) + 's' +
            ' | ay=' + this.ay.toFixed(4) + ' px/s²' +
            ' | vy=' + vy.toFixed(4) + ' px/s' +
            ' | y=' + y.toFixed(2) + ' px'
        );

        // Aplica posição diretamente ao corpo físico
        this.sprite.body.reset(x, y);
    }

    _iniciarCiclo(timeNowMs) {
        this._emPausa  = false;
        this._iniciado = false;
        this._t0Ms     = timeNowMs;
        this.sprite.body.reset(this.xi, this.yi);
        console.log('[CarroCielo] Novo ciclo iniciado.');
    }

    get estaAtivo() { return this._ativo; }
}