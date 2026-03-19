export default class Jogador {

    // ── Insígnias por mapa ────────────────────────────────────────────────────
    // Cadastre aqui todos os mapas do jogo.
    // negociacaoChave: chave salva no registry ao vencer a negociação do mapa.
    // assetKey:        chave usada internamente pelo Phaser para a imagem.
    // assetPath:       caminho do arquivo PNG da insígnia.
    // nome:            texto exibido na notificação.
    static INSIGNIAS = {
        mapa_gelo: {
            nome:            'Mestre do Gelo',
            assetKey:        'insignia_mapa_gelo',
            assetPath:       'assets/insignias/InsigniaAbordagem1.png',
            negociacaoChave: 'pedro_vencido',
        },
        // Adicione novos mapas aqui:
        // vila_varejo: {
        //     nome:            'Rei do Varejo',
        //     assetKey:        'insignia_vila_varejo',
        //     assetPath:       'assets/insignias/InsigniaVarejo.png',
        //     negociacaoChave: 'varejo_vencido',
        // },
    };

    constructor(cena, x, y, scale = 2.3) {
        this.cena = cena;
        this.velocidade = 100;

        const skin = cena.game.registry.get('spriteJogador') || 'man_whi';
        this.skin = skin;

        this.sprite = cena.physics.add.sprite(x, y, `${skin}_front_idl`).setScale(scale);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.body.setSize(10, 5);
        this.sprite.setOffset(27, 40);

        this._criarAnimacoes();
        this._ultimaDirecao = 'frente';

        const largura = cena.cameras.main.width;
        this.cena.add.text(largura - 10, 10, 'Aperte H para acessar o tutorial', {
            fontSize: '11px',
            fill: '#FFD700',
            backgroundColor: '#000000',
            padding: { x: 6, y: 3 }
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(10);
    }

    _criarAnimacoes() {
        const cena = this.cena;
        const s = this.skin;

        if (cena.anims.exists(`${s}_idle`)) return;

        cena.anims.create({ key: `${s}_idle`,        frames: cena.anims.generateFrameNumbers(`${s}_front_idl`,  { start: 0, end: 11 }), frameRate: 10, repeat: -1 });
        cena.anims.create({ key: `${s}_idle_costas`, frames: cena.anims.generateFrameNumbers(`${s}_back_idl`,   { start: 0, end: 11 }), frameRate: 10, repeat: -1 });
        cena.anims.create({ key: `${s}_andar`,       frames: cena.anims.generateFrameNumbers(`${s}_front_walk`, { start: 0, end: 5  }), frameRate: 10, repeat: -1 });
        cena.anims.create({ key: `${s}_costa`,       frames: cena.anims.generateFrameNumbers(`${s}_back_walk`,  { start: 0, end: 5  }), frameRate: 10, repeat: -1 });
        cena.anims.create({ key: `${s}_lado`,        frames: cena.anims.generateFrameNumbers(`${s}_side_walk`,  { start: 0, end: 5  }), frameRate: 10, repeat: -1 });
    }

    configurarTeclas() {
        this.teclas = this.cena.input.keyboard.addKeys({
            up:        Phaser.Input.Keyboard.KeyCodes.W,
            down:      Phaser.Input.Keyboard.KeyCodes.S,
            left:      Phaser.Input.Keyboard.KeyCodes.A,
            right:     Phaser.Input.Keyboard.KeyCodes.D,
            interagir: Phaser.Input.Keyboard.KeyCodes.E,
            tutorial:  Phaser.Input.Keyboard.KeyCodes.H,
        });
        return this.teclas;
    }

    atualizar() {
        const { sprite, teclas, velocidade } = this;
        const s = this.skin;
        if (!sprite || !teclas) return;

        if (this.cena.scene.isActive('TutorialOverlay')) {
            this.sprite.setVelocity(0);
            if (Phaser.Input.Keyboard.JustDown(teclas.tutorial)) {
                this.cena.scene.stop('TutorialOverlay');
                this.cena.input.keyboard.enabled = true;
            }
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(teclas.tutorial)) {
            this.sprite.setVelocity(0);
            this.cena.scene.launch('TutorialOverlay');
            this.cena.scene.bringToTop('TutorialOverlay');
            this.cena.input.keyboard.enabled = false;
        }

        sprite.setVelocity(0);

        const nenhumaTecla =
            !teclas.left.isDown && !teclas.right.isDown &&
            !teclas.up.isDown   && !teclas.down.isDown;

        if (nenhumaTecla) {
            const idleAnim = this._ultimaDirecao === 'costas' ? `${s}_idle_costas` : `${s}_idle`;
            sprite.play(idleAnim, true);
            return;
        }

        let vx = 0, vy = 0;

        if (teclas.left.isDown) {
            vx = -velocidade;
            sprite.play(`${s}_lado`, true);
            sprite.setFlipX(false);
            this._ultimaDirecao = 'lado';
        } else if (teclas.right.isDown) {
            vx = velocidade;
            sprite.play(`${s}_lado`, true);
            sprite.setFlipX(true);
            this._ultimaDirecao = 'lado';
        }

        if (teclas.up.isDown) {
            vy = -velocidade;
            if (!teclas.left.isDown && !teclas.right.isDown) {
                sprite.play(`${s}_costa`, true);
                this._ultimaDirecao = 'costas';
            }
        } else if (teclas.down.isDown) {
            vy = velocidade;
            if (!teclas.left.isDown && !teclas.right.isDown) {
                sprite.play(`${s}_andar`, true);
                this._ultimaDirecao = 'frente';
            }
        }

        const mag = Math.sqrt(vx * vx + vy * vy);
        if (mag > 0) {
            sprite.setVelocityX((vx / mag) * velocidade);
            sprite.setVelocityY((vy / mag) * velocidade);
        }
    }

    // ── Sistema de Insígnias ──────────────────────────────────────────────────

    /**
     * Carrega os assets de todas as insígnias cadastradas.
     * Chame no preload() de qualquer mapa que use insígnias:
     *   Jogador.preloadInsignias(this);
     * @param {Phaser.Scene} cena
     */
    static preloadInsignias(cena) {
        Object.values(Jogador.INSIGNIAS).forEach(({ assetKey, assetPath }) => {
            if (!cena.textures.exists(assetKey)) {
                cena.load.image(assetKey, assetPath);
            }
        });
    }

    /**
     * Verifica se a negociação do mapa foi concluída e,
     * se sim, concede a insígnia e exibe a notificação.
     *
     * Chame no create() de cada mapa logo após criar o personagem:
     *   this.personagem.verificarInsigniaMapa('mapa_gelo');
     *
     * @param {string} chaveInsignia - chave de Jogador.INSIGNIAS
     * @returns {boolean} - true se a insígnia foi concedida agora
     */
    verificarInsigniaMapa(chaveInsignia) {
        const dados = Jogador.INSIGNIAS[chaveInsignia];
        if (!dados) return false;

        // Verifica se a negociação do mapa foi vencida
        const vitorias = this.cena.game.registry.get('negociacoesVencidas') ?? {};
        if (vitorias[dados.negociacaoChave] !== true) return false;

        // Verifica se já tem a insígnia para não conceder duas vezes
        const insignias = this.cena.game.registry.get('insigniasJogador') ?? [];
        if (insignias.includes(chaveInsignia)) return false;

        // Concede a insígnia
        insignias.push(chaveInsignia);
        this.cena.game.registry.set('insigniasJogador', insignias);

        // Exibe a notificação com a imagem
        this._mostrarNotificacaoInsignia(dados);

        return true;
    }

    /**
     * Verifica se o jogador possui uma insígnia.
     * @param {string} chaveInsignia
     * @returns {boolean}
     */
    temInsignia(chaveInsignia) {
        const insignias = this.cena.game.registry.get('insigniasJogador') ?? [];
        return insignias.includes(chaveInsignia);
    }

    /**
     * Retorna todas as insígnias conquistadas pelo jogador.
     * @returns {string[]}
     */
    getInsignias() {
        return this.cena.game.registry.get('insigniasJogador') ?? [];
    }

    /**
     * Exibe a notificação animada com a imagem real da insígnia.
     * @param {{ nome: string, assetKey: string }} dados
     */
    _mostrarNotificacaoInsignia(dados) {
        const cena = this.cena;
        const W    = cena.scale.width;
        const cx   = W / 2;
        const cy   = 50;

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
                fontFamily: '"Courier New", monospace',
                fontSize:   '10px',
                color:      '#5a8a9a',
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

    // ── Colisão e overlap ─────────────────────────────────────────────────────

    adicionarColisao(objeto) {
        return this.cena.physics.add.collider(this.sprite, objeto);
    }

    adicionarOverlap(objeto, callback) {
        return this.cena.physics.add.overlap(this.sprite, objeto, callback, null, this.cena);
    }

    temOverlap(objeto) {
        return this.cena.physics.overlap(this.sprite, objeto);
    }

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
}