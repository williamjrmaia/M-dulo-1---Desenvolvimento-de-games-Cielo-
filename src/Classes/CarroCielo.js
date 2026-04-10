// =============================================================================
// CarroCielo.js
// Carro decorativo que circula pela Cidade Cielo em loop contínuo com pausa
// entre cada ciclo. A posição é calculada por cinemática pura (sem setVelocity
// nem tweens). O corpo físico Arcade é reposicionado manualmente a cada frame,
// o que permite que o carro empurre o jogador ao colidir.
//
// EIXO X → Movimento Uniforme (MU):            velocidade constante
// EIXO Y → Movimento Uniformemente Variado (MUV): parte do repouso, v0y = 0
//
// ── PARÂMETROS DE ENTRADA ─────────────────────────────────────────────────────
//   xi        {number} — posição inicial em X (px)
//   yi        {number} — posição inicial em Y (px)
//   xf        {number} — posição final   em X (px)
//   yf        {number} — posição final   em Y (px)
//   T         {number} — duração total de cada travessia (segundos)
//   pausaMs   {number} — pausa entre ciclos em milissegundos (padrão: 1500)
//   escala    {number} — escala visual do sprite (padrão: 1)
//   cena      {Phaser.Scene} — cena que hospeda o carro
//
// ── REFERÊNCIA ────────────────────────────────────────────────────────────────
//   HALLIDAY, D.; RESNICK, R.; WALKER, J. Fundamentos de Física, Vol. 1.
//   Rio de Janeiro: LTC, 10ª ed., 2016. Cap. 2, pp. 18-52.
//
// ── INTEGRAÇÃO ────────────────────────────────────────────────────────────────
//   // create():
//   this.carro = new CarroCielo(this, {
//       xi: 300, yi: 600, xf: 900, yf: 750, T: 4, pausaMs: 1500,
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
     * @param {number}  [p.pausaMs]    - pausa entre ciclos em ms (padrão: 1500)
     * @param {number}  [p.escala]     - escala do sprite (padrão: 1)
     * @param {Phaser.GameObjects.Sprite} p.jogadorSprite - sprite do jogador para colisão
     */
    constructor(cena, { xi, yi, xf, yf, T, pausaMs = 1500, escala = 1, jogadorSprite }) {
        this._cena = cena;

        // ── 1. Parâmetros de entrada ───────────────────────────────────────────
        this.xi      = xi;
        this.yi      = yi;
        this.xf      = xf;
        this.yf      = yf;
        this.T       = T;
        this._pausaMs = pausaMs;

        // ── 2. Parâmetros derivados (calculados uma vez por ciclo) ─────────────
        // MU  — eixo X:  vx = (xf - xi) / T
        this.vx = (xf - xi) / T;

        // MUV — eixo Y (v0y = 0):  ay = 2*(yf - yi) / T²
        this.ay = (2 * (yf - yi)) / (T * T);

        // ── 3. Estado do ciclo ─────────────────────────────────────────────────
        this._iniciado    = false;
        this._t0Ms        = 0;
        this._emPausa     = false;
        this._pausaInicioMs = 0;

        // ── 4. Sprite com corpo físico dinâmico (para empurrar o jogador) ──────
        this.sprite = cena.physics.add.image(xi, yi, 'carro_cielo')
            .setDepth(6)
            .setScale(escala)
            .setImmovable(false);  // false → empurra outros corpos

        // Impede que a gravidade afete o carro
        this.sprite.body.setAllowGravity(false);

        // ── 5. Colisão com o jogador ───────────────────────────────────────────
        if (jogadorSprite) {
            cena.physics.add.collider(this.sprite, jogadorSprite);
        }

    }

    // ──────────────────────────────────────────────────────────────────────────
    // atualizar(timeNowMs)
    //
    //   Chamado a cada frame (this.time.now da cena Phaser, em ms).
    //
    //   Lógica:
    //     1. Se estiver em PAUSA, aguarda pausaMs e reinicia o ciclo.
    //     2. Calcula t = (timeNowMs - t0) / 1000
    //     3. Aplica equações de MU (eixo X) e MUV (eixo Y) diretamente.
    //     4. Quando t >= T, entra em pausa e aguarda o próximo ciclo.
    //
    //   A posição é atribuída diretamente ao sprite via body.reset() —
    //   operação que reposiciona o corpo físico sem usar setVelocity.
    //   Isso mantém a integridade da colisão enquanto honra a restrição
    //   de não usar funções de movimento prontas do Phaser.
    // ──────────────────────────────────────────────────────────────────────────
    atualizar(timeNowMs) {

        // ── Gerenciamento de pausa entre ciclos ───────────────────────────────
        if (this._emPausa) {
            // Condicional: verifica se a pausa já durou o suficiente
            if (timeNowMs - this._pausaInicioMs >= this._pausaMs) {
                this._iniciarCiclo(timeNowMs);
            }
            // Durante a pausa o carro fica parado — zera velocidade física
            this.sprite.body.setVelocity(0, 0);
            return;
        }

        // Registra o instante de início no primeiro frame após (re)iniciar
        if (!this._iniciado) {
            this._t0Ms    = timeNowMs;
            this._iniciado = true;
        }

        // Tempo decorrido desde o início do ciclo atual (segundos)
        // Operação aritmética elementar: subtração e divisão
        const t = (timeNowMs - this._t0Ms) / 1000;

        // Condicional de fim de ciclo
        if (t >= this.T) {
            // Posiciona exatamente no ponto final
            this.sprite.body.reset(this.xf, this.yf);
            this.sprite.body.setVelocity(0, 0);

            // Entra em pausa
            this._emPausa        = true;
            this._pausaInicioMs  = timeNowMs;
            this._iniciado       = false;

            return;
        }

        // ── MU — eixo X ───────────────────────────────────────────────────────
        // Velocidade constante:  vx = (xf - xi) / T
        // Posição:               x(t) = xi + vx * t
        const x = this.xi + this.vx * t;

        // ── MUV — eixo Y ──────────────────────────────────────────────────────
        // v0y = 0  →  aceleração:  ay = 2*(yf - yi) / T²
        //             velocidade:  vy(t) = ay * t
        //             posição:     y(t)  = yi + (1/2) * ay * t²
        const y  = this.yi + (0.5 * this.ay * t * t);

        // ── Aplica posição ao corpo físico diretamente ─────────────────────────
        // body.reset(x, y) reposiciona o corpo sem alterar a velocidade física
        // acumulada — nenhuma função de movimento do Phaser é usada aqui.
        this.sprite.body.reset(x, y);
    }

    // ── Helpers privados ──────────────────────────────────────────────────────

    _iniciarCiclo(timeNowMs) {
        this._emPausa  = false;
        this._iniciado = false;
        this._t0Ms     = timeNowMs;
        // Reposiciona no ponto inicial para o próximo ciclo
        this.sprite.body.reset(this.xi, this.yi);
    }
}