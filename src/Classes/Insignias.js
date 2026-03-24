/**
 * Classe Insignia
 *
 * Responsável por toda a mecânica de insígnias do jogo:
 *  - Catálogo central de insígnias (INSIGNIAS)
 *  - Preload dos assets
 *  - Verificação se a negociação foi vencida
 *  - Concessão e persistência no registry
 *  - Exibição da notificação animada
 *
 * Como usar numa cena de negociação (ex: NegociacaoPedro):
 *
 *   import Insignia from '../Classes/Insignia.js';
 *
 *   // No preload():
 *   Insignia.preload(this);
 *
 *   // No create() ou ao vencer a negociação:
 *   const insignia = new Insignia(this, 'mapa_gelo');
 *   insignia.conceder();
 */
export default class Insignia {

    // ── Catálogo central ──────────────────────────────────────────────────────
    // Cadastre aqui todas as insígnias do jogo.
    // negociacaoChave: chave salva no registry ao vencer a negociação.
    // assetKey:        chave interna do Phaser para a imagem.
    // assetPath:       caminho do arquivo PNG.
    // nome:            texto exibido na notificação.
    static CATALOGO = {
        mapa_gelo: {
            nome:            'Mestre do Gelo',
            assetKey:        'insignia_mapa_gelo',
            assetPath:       'assets/insignias/InsigniaAbordagem1.png',
            negociacaoChave: 'pedro_vencido',
        },
        vila_varejo: {
            nome:            'Rei do Varejo',
            assetKey:        'insignia_vila_varejo',
            assetPath:       'assets/insignias/InsigniaProduto1.png',
            negociacaoChave: 'varejo_vencido',
        },
        // Adicione novas insígnias aqui seguindo o mesmo padrão.
    };

    // ── Preload estático ──────────────────────────────────────────────────────

    /**
     * Carrega os assets de todas as insígnias cadastradas.
     * Chame no preload() de qualquer cena que use insígnias:
     *
     *   Insignia.preload(this);
     *
     * @param {Phaser.Scene} cena
     */
    static preload(cena) {
        Object.values(Insignia.CATALOGO).forEach(({ assetKey, assetPath }) => {
            if (!cena.textures.exists(assetKey)) {
                cena.load.image(assetKey, assetPath);
            }
        });
    }

    // ── Instância ─────────────────────────────────────────────────────────────

    /**
     * @param {Phaser.Scene} cena         - cena Phaser atual
     * @param {string}       chave        - chave de Insignia.CATALOGO (ex: 'mapa_gelo')
     */
    constructor(cena, chave) {
        this.cena  = cena;
        this.chave = chave;
        this.dados = Insignia.CATALOGO[chave] ?? null;

        if (!this.dados) {
            console.warn(`[Insignia] Chave desconhecida: "${chave}". Verifique Insignia.CATALOGO.`);
        }
    }

    // ── API pública ───────────────────────────────────────────────────────────

    /**
     * Verifica se a negociação foi vencida e, caso o jogador ainda não
     * tenha a insígnia, concede e exibe a notificação.
     *
     * @returns {boolean} true se a insígnia foi concedida agora
     */
    conceder() {
        if (!this.dados) return false;
        if (!this._negociacaoVencida()) return false;
        if (this._jogadorJaTem()) return false;

        this._salvarNoRegistry();
        this._mostrarNotificacao();

        return true;
    }

    /**
     * Verifica se o jogador já possui esta insígnia.
     * @returns {boolean}
     */
    jogadorTem() {
        return this._jogadorJaTem();
    }

    /**
     * Retorna todas as chaves de insígnias conquistadas pelo jogador.
     * @returns {string[]}
     */
    static getInsignias(cena) {
        return cena.game.registry.get('insigniasJogador') ?? [];
    }

    // ── Métodos internos ──────────────────────────────────────────────────────

    _negociacaoVencida() {
        const vitorias = this.cena.game.registry.get('negociacoesVencidas') ?? {};
        return vitorias[this.dados.negociacaoChave] === true;
    }

    _jogadorJaTem() {
        const insignias = this.cena.game.registry.get('insigniasJogador') ?? [];
        return insignias.includes(this.chave);
    }

    _salvarNoRegistry() {
        const insignias = this.cena.game.registry.get('insigniasJogador') ?? [];
        insignias.push(this.chave);
        this.cena.game.registry.set('insigniasJogador', insignias);
    }

    _mostrarNotificacao() {
        const cena  = this.cena;
        const dados = this.dados;
        const W     = cena.scale.width;
        const cx    = W / 2;
        const cy    = 50;

        const fundo = cena.add
            .rectangle(cx, cy, 280, 64, 0x060e14, 0.92)
            .setStrokeStyle(2, 0x2a4a6a)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(500)
            .setAlpha(0);

        const imagem = cena.add
            .image(cx - 110, cy, dados.assetKey)
            .setDisplaySize(48, 48)
            .setScrollFactor(0)
            .setDepth(501)
            .setAlpha(0);

        const textoTitulo = cena.add
            .text(cx - 80, cy - 12, 'INSÍGNIA CONQUISTADA!', {
                fontFamily:    '"Courier New", monospace',
                fontSize:      '10px',
                color:         '#5a8a9a',
                letterSpacing: 1,
            })
            .setOrigin(0, 0.5)
            .setScrollFactor(0)
            .setDepth(501)
            .setAlpha(0);

        const textoNome = cena.add
            .text(cx - 80, cy + 8, dados.nome, {
                fontFamily: '"Courier New", monospace',
                fontSize:   '14px',
                color:      '#ffd700',
            })
            .setOrigin(0, 0.5)
            .setScrollFactor(0)
            .setDepth(501)
            .setAlpha(0);

        const objetos = [fundo, imagem, textoTitulo, textoNome];

        cena.tweens.add({
            targets:  objetos,
            alpha:    1,
            y:        '+=10',
            duration: 350,
            ease:     'Power2',
            onComplete: () => {
                cena.time.delayedCall(2500, () => {
                    cena.tweens.add({
                        targets:  objetos,
                        alpha:    0,
                        duration: 400,
                        onComplete: () => objetos.forEach(o => o.destroy()),
                    });
                });
            },
        });
    }
}