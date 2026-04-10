// =============================================================================
// MiniMapa.js
//
// Classe responsável por criar e gerenciar o mini mapa do jogo.
//
// COMO USAR — em cada cena, após criar o personagem/jogador:
//
//   import MiniMapa from '../Classes/MiniMapa.js';
//
//   create() {
//       // ... seu código ...
//       this.personagem = new Jogador(this, x, y);
//
//       this.miniMapa = new MiniMapa(this, this.personagem.sprite);
//
//       // Opcional — pontos amarelos dos NPCs:
//       this.miniMapa.registrarNPCs(this.grupoNPCs);
//
//       // Opcional — triângulo de missão (coordenadas do objetivo no mapa):
//       this.miniMapa.definirMissao(300, 190);
//   }
//
//   update() {
//       this.miniMapa.atualizar();
//   }
//
// OPÇÕES DO CONSTRUTOR:
//   new MiniMapa(cena, playerSprite, opcoes)
//
//   opcoes.zoom      {number}  Quanto do mapa é visível (padrão: 0.5)
//   opcoes.largura   {number}  Largura em px              (padrão: 240)
//   opcoes.altura    {number}  Altura em px               (padrão: 220)
//   opcoes.marginX   {number}  Margem da borda direita    (padrão: 14)
//   opcoes.marginY   {number}  Margem do topo             (padrão: 14)
//   opcoes.corFundo  {hex}     Cor de fundo               (padrão: 0x001122)
//   opcoes.corBorda  {hex}     Cor da borda azul          (padrão: 0x44aaff)
//   opcoes.corPlayer {hex}     Cor do ponto do jogador    (padrão: 0x003399)
//   opcoes.corNPC    {hex}     Cor dos pontos de NPC      (padrão: 0xffff00)
//   opcoes.corMissao {hex}     Cor do triângulo de missão (padrão: 0xff2222)
//
// MÉTODOS DISPONÍVEIS:
//   miniMapa.registrarNPCs(grupoNPCs)    — cria pontos para cada NPC do grupo
//   miniMapa.definirMissao(x, y)         — mostra triângulo na coordenada
//   miniMapa.esconderMissao()            — esconde o triângulo
//   miniMapa.atualizar()                 — sincroniza posições (chamar no update)
//   miniMapa.destruir()                  — limpa tudo (chamado automaticamente
//                                          ao trocar de cena)
//
// TECLA M: mostra/esconde o mini mapa durante o jogo.
// =============================================================================
 
export default class MiniMapa {
 
    constructor(cena, playerSprite, opcoes = {}) {
        this._cena   = cena;
        this._player = playerSprite;
        this._objetosIgnorados = [];
 
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
        this._visivel     = true;
 
     
        this._criar();
 
        // Destrói automaticamente quando a cena for encerrada
        this._cena.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.destruir();
        });
    }
 
    // =========================================================================
    // _criar — monta a câmera e os elementos visuais na cena do mapa
    // =========================================================================
    _criar() {
        const { zoom, largura, altura, marginX, marginY,
                corFundo, corBorda, corPlayer, corMissao } = this._cfg;
 
        const W = this._cena.scale.width;
 
        // ── Câmera do mini mapa ───────────────────────────────────────────────
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
 
        // ── Ponto azul do jogador ─────────────────────────────────────────────
        this._pontoPlayer = this._cena.add.circle(
            this._player.x,
            this._player.y,
            12, corPlayer
        );
        this._pontoPlayer.setDepth(999);
        this._cena.cameras.main.ignore(this._pontoPlayer);
 
        // ── Triângulo vermelho de missão ──────────────────────────────────────
        this._missao = this._cena.add.triangle(
            0, 0,
            0, 24, 12, 0, 24, 24,
            corMissao
        );
        this._missao.setDepth(999);
        this._missao.setVisible(false);
        this._cena.cameras.main.ignore(this._missao);
 
        // ── Borda dupla: preta por fora, azul por dentro ──────────────────────
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
 
        // ── Label "MAPA" ──────────────────────────────────────────────────────
        this._label = this._cena.add.text(
            W - largura - marginX,
            marginY + altura + 4,
            'MAPA',
            { fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#4457ff' }
        ).setScrollFactor(0).setDepth(1001);
        this._cam.ignore(this._label);
 
        // ── Ignora elementos do HUD no mini mapa ─────────────────────────────
        this._cena.time.delayedCall(50, () => {
            const hudCena = this._cena.scene.get('HUDCenas');
            if (hudCena?.children?.list) {
                hudCena.children.list.forEach(obj => {
                    try { this._cam.ignore(obj); } catch(_) {}
                });
            }
        });
 
        // ── Tecla M: mostra/esconde o mini mapa ──────────────────────────────
        this._onTeclaM = () => {
            this._visivel = !this._visivel;
 
            this._cam.setVisible(this._visivel);
            this._borda.setVisible(this._visivel);
            this._label.setVisible(this._visivel);
 
            if (this._pontoPlayer) this._pontoPlayer.setVisible(this._visivel);
            if (this._missao)      this._missao.setVisible(this._visivel && this._missao.visible);
            this._npcPontos.forEach(({ ponto }) => ponto.setVisible(this._visivel));
        };
        this._cena.input.keyboard.on('keydown-M', this._onTeclaM);
    }
 
    // =========================================================================
    // registrarNPCs(grupoNPCs)
    // Cria um ponto amarelo para cada NPC do grupo.
    // Pode ser chamado novamente para atualizar a lista de NPCs.
    // =========================================================================
    registrarNPCs(grupoNPCs) {
        this._npcPontos.forEach(({ ponto }) => { try { ponto.destroy(); } catch(_){} });
        this._npcPontos = [];
 
        // Cena sem NPCs — ignora silenciosamente
        if (!grupoNPCs) return;
 
        grupoNPCs.getChildren().forEach(npc => {
            const ponto = this._cena.add.circle(npc.x, npc.y, 9, this._cfg.corNPC);
            ponto.setDepth(998);
            this._cena.cameras.main.ignore(ponto);
            this._npcPontos.push({ npc, ponto });
        });
    }
 
    // =========================================================================
    // definirMissao(x, y)
    // Mostra o triângulo vermelho na coordenada do objetivo no mapa.
    // =========================================================================
    definirMissao(x, y) {
        if (!this._missao) return;
        this._missao.setPosition(x, y);
        this._missao.setVisible(true);
    }
 
    // =========================================================================
    // esconderMissao()
    // Esconde o triângulo de missão.
    // =========================================================================
    esconderMissao() {
        if (this._missao) this._missao.setVisible(false);
    }
 
    // =========================================================================
    // atualizar()
    // Sincroniza as posições dos pontos com os objetos reais.
    // Deve ser chamado no update() da cena.
    // =========================================================================
    atualizar() {
    if (this._pontoPlayer && this._player) {
        this._pontoPlayer.x = this._player.x;
        this._pontoPlayer.y = this._player.y;
    }

    this._npcPontos.forEach(({ npc, ponto }) => {
        ponto.x = npc.x;
        ponto.y = npc.y;
    });

    // Reaplica ignore a cada frame para objetos dinâmicos
    this._objetosIgnorados.forEach(obj => {
        if (obj && obj.active) {
            try { this._cam.ignore(obj); } catch(_) {}
        }
    });
}

   ignorarObjeto(objeto) {
    if (!this._cam || !objeto) return;
    try { this._cam.ignore(objeto); } catch(_) {}
    // Guarda referência para reaplicar a cada frame
    this._objetosIgnorados.push(objeto);
    }   
    // =========================================================================
    // destruir()
    // Limpa todos os objetos criados pelo mini mapa.
    // Chamado automaticamente no shutdown da cena.
    // =========================================================================
    destruir() {
        this._cena.input.keyboard.off('keydown-M', this._onTeclaM);
        try { if (this._cam)         this._cena.cameras.remove(this._cam); } catch(_) {}
        try { if (this._pontoPlayer) this._pontoPlayer.destroy(); }          catch(_) {}
        try { if (this._missao)      this._missao.destroy(); }               catch(_) {}
        try { if (this._borda)       this._borda.destroy(); }                catch(_) {}
        try { if (this._label)       this._label.destroy(); }                catch(_) {}
        this._npcPontos.forEach(({ ponto }) => { try { ponto.destroy(); } catch(_){} });
        this._npcPontos = [];

        this._objetosIgnorados = [];
    }
}
 