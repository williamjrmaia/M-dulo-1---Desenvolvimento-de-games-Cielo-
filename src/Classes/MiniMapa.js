
export default class MiniMapa {

    constructor(cena, playerSprite, opcoes = {}) {
        this._cena   = cena;
        this._player = playerSprite;

        const {
            zoom      = 0.5,
            largura   = 240,
            altura    = 220,
            marginX   = 14,
            marginY   = 14,
            corFundo  = 0x001122,
            corBorda  = 0x44aaff,
            corPlayer = 0x003399,
            corNPC    = 0xffff00,
            corMissao = 0xff2222,
        } = opcoes;

        this._cfg = { zoom, largura, altura, marginX, marginY,
                      corFundo, corBorda, corPlayer, corNPC, corMissao };

        this._cam         = null;
        this._pontoPlayer = null;
        this._missao      = null;
        this._npcPontos   = [];
        this._borda       = null;
        this._label       = null;

        // Lê o estado salvo no registry — persiste entre cenas.
        // Se nunca foi definido, começa visível (true).
        this._visivel = this._cena.game.registry.get('minimapa_visivel') ?? true;

        this._criar();

        // Destrói automaticamente quando a cena for encerrada
        this._cena.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.destruir();
        });
    }

    _criar() {
        const { zoom, largura, altura, marginX, marginY,
                corFundo, corBorda, corPlayer, corMissao } = this._cfg;

        const W = this._cena.scale.width;

        // ── Câmera do mini mapa ──
        this._cam = this._cena.cameras.add(
            W - largura - marginX,
            marginY,
            largura,
            altura
        );
        this._cam.setZoom(zoom);
        this._cam.setBackgroundColor(corFundo);
        this._cam.setAlpha(0.85);
        this._cam.startFollow(this._player);

        // Limita o mini mapa aos bounds do mundo — evita o preto fora do mapa
        const wb = this._cena.physics.world.bounds;
        this._cam.setBounds(wb.x, wb.y, wb.width, wb.height);

        // ── Ponto azul do jogador ──
        this._pontoPlayer = this._cena.add.circle(
            this._player.x,
            this._player.y,
            12, corPlayer
        );
        this._pontoPlayer.setDepth(999);
        this._cena.cameras.main.ignore(this._pontoPlayer);

        // ── Triângulo vermelho de missão ──
        this._missao = this._cena.add.triangle(
            0, 0,
            0, 24, 12, 0, 24, 24,
            corMissao
        );
        this._missao.setDepth(999);
        this._missao.setVisible(false);
        this._cena.cameras.main.ignore(this._missao);

        // ── Borda dupla: preta por fora, azul por dentro ──
        this._borda = this._cena.add.graphics();

        // Borda preta externa
        this._borda.lineStyle(4, 0x000000, 1);
        this._borda.strokeRect(
            W - largura - marginX - 4,
            marginY - 4,
            largura + 8,
            altura + 8
        );

        // Borda azul interna
        this._borda.lineStyle(2, corBorda, 1);
        this._borda.strokeRect(
            W - largura - marginX - 1,
            marginY - 1,
            largura + 2,
            altura + 2
        );

        this._borda.setScrollFactor(0).setDepth(1001);
        this._cam.ignore(this._borda);

        // ── Label "MAPA" ──
        this._label = this._cena.add.text(
            W - largura - marginX,
            marginY + altura + 4,
            'MAPA',
            { fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#4457ff' }
        ).setScrollFactor(0).setDepth(1001);
        this._cam.ignore(this._label);

        // ── Aplica o estado salvo logo ao criar ──
        // Garante que se o jogador havia escondido o mapa, ele continua escondido
        this._aplicarVisibilidade();

        // ── Ignora elementos do HUD no mini mapa ──
        this._cena.time.delayedCall(50, () => {
            const hudCena = this._cena.scene.get('HUDCenas');
            if (hudCena?.children?.list) {
                hudCena.children.list.forEach(obj => {
                    try { this._cam.ignore(obj); } catch(_) {}
                });
            }
        });

        // ── Tecla M: alterna visibilidade e salva o estado no registry ──
        this._onTeclaM = () => {
            this._visivel = !this._visivel;

            // Salva no registry para persistir entre cenas
            this._cena.game.registry.set('minimapa_visivel', this._visivel);

            this._aplicarVisibilidade();
        };
        this._cena.input.keyboard.on('keydown-M', this._onTeclaM);
    }

    // _aplicarVisibilidade — aplica o estado atual de _visivel em todos os elementos
    _aplicarVisibilidade() {
        this._cam.setVisible(this._visivel);
        this._borda.setVisible(this._visivel);
        this._label.setVisible(this._visivel);

        if (this._pontoPlayer) this._pontoPlayer.setVisible(this._visivel);

        // O triângulo só aparece se o mini mapa estiver visível E a missão estiver ativa
        if (this._missao) {
            const missaoAtiva = this._cena.game.registry.get('minimapa_missao_ativa') ?? false;
            this._missao.setVisible(this._visivel && missaoAtiva);
        }

        this._npcPontos.forEach(({ ponto }) => ponto.setVisible(this._visivel));
    }

    // registrarNPCs(grupoNPCs)
    // Cria um ponto amarelo para cada NPC do grupo.
    // Pode ser chamado novamente para atualizar a lista de NPCs.
    registrarNPCs(grupoNPCs) {
        this._npcPontos.forEach(({ ponto }) => { try { ponto.destroy(); } catch(_){} });
        this._npcPontos = [];

        // Cena sem NPCs — ignora silenciosamente
        if (!grupoNPCs) return;

        grupoNPCs.getChildren().forEach(npc => {
            const ponto = this._cena.add.circle(npc.x, npc.y, 9, this._cfg.corNPC);
            ponto.setDepth(998);
            ponto.setVisible(this._visivel); // respeita estado atual ao registrar
            this._cena.cameras.main.ignore(ponto);
            this._npcPontos.push({ npc, ponto });
        });
    }

    // definirMissao(x, y)
    // Mostra o triângulo vermelho na coordenada do objetivo no mapa.
    definirMissao(x, y) {
        if (!this._missao) return;
        this._missao.setPosition(x, y);
        this._cena.game.registry.set('minimapa_missao_ativa', true);
        // Só mostra se o mini mapa estiver visível
        this._missao.setVisible(this._visivel);
    }

    // esconderMissao()
    // Esconde o triângulo de missão.
    esconderMissao() {
        if (!this._missao) return;
        this._missao.setVisible(false);
        this._cena.game.registry.set('minimapa_missao_ativa', false);
    }

    // atualizar()
    // Sincroniza as posições dos pontos com os objetos reais.
    // Deve ser chamado no update() da cena.
    atualizar() {
        if (this._pontoPlayer && this._player) {
            this._pontoPlayer.x = this._player.x;
            this._pontoPlayer.y = this._player.y;
        }

        this._npcPontos.forEach(({ npc, ponto }) => {
            ponto.x = npc.x;
            ponto.y = npc.y;
        });
    }

    // destruir()
    // Limpa todos os objetos criados pelo mini mapa.
    // Chamado automaticamente no shutdown da cena.
    destruir() {
        this._cena.input.keyboard.off('keydown-M', this._onTeclaM);
        try { if (this._cam)         this._cena.cameras.remove(this._cam); } catch(_) {}
        try { if (this._pontoPlayer) this._pontoPlayer.destroy(); }          catch(_) {}
        try { if (this._missao)      this._missao.destroy(); }               catch(_) {}
        try { if (this._borda)       this._borda.destroy(); }                catch(_) {}
        try { if (this._label)       this._label.destroy(); }                catch(_) {}
        this._npcPontos.forEach(({ ponto }) => { try { ponto.destroy(); } catch(_){} });
        this._npcPontos = [];
    }
}
