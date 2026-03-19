import ColorblindManager from './ColorblindManager.js';

export default class CenaConfig extends Phaser.Scene {
    constructor() {
        super('CenaConfig');
        // Instância compartilhada — persiste entre trocas de cena via registry
    }

    preload() {
        this.load.image('menu_jogo', 'assets/Menu/menu_fundo.png');
    }

    create() {
        const CX = 750;   // centro X da tela (1500 / 2)
        const CY = 400;   // centro Y da tela (800  / 2)

        // ── Recupera ou cria o ColorblindManager no registry ──────────────────
        if (!this.registry.get('colorblindManager')) {
            this.registry.set('colorblindManager', new ColorblindManager());
        }
        const cbManager = this.registry.get('colorblindManager');

        // ── Fundo ─────────────────────────────────────────────────────────────
        this.add.image(CX, CY, 'menu_jogo');

        // Painel central
        const painelW = 700;
        const painelH = 520;
        const painelX = CX;
        const painelY = CY;

        // Sombra do painel
        this.add.rectangle(painelX + 6, painelY + 6, painelW, painelH, 0x000000, 0.5)
            .setOrigin(0.5);

        // Painel principal (estilo pixel art — bordas contrastantes)
        this.add.rectangle(painelX, painelY, painelW, painelH, 0x1a2a4a)
            .setOrigin(0.5);

        // Borda superior (destaque azul claro igual ao menu)
        this.add.rectangle(painelX, painelY - painelH / 2 + 4, painelW, 8, 0x5bc8f5)
            .setOrigin(0.5, 0);

        // Borda inferior
        this.add.rectangle(painelX, painelY + painelH / 2 - 4, painelW, 8, 0x5bc8f5)
            .setOrigin(0.5, 1);

        // ── Título ────────────────────────────────────────────────────────────
        this.add.text(CX, painelY - 210, 'CONFIGURAÇÕES', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize:   '20px',
            color:      '#ffffff',
            stroke:     '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        // Linha separadora abaixo do título
        this.add.rectangle(CX, painelY - 188, 620, 3, 0x5bc8f5).setOrigin(0.5);

        // ── Subtítulo seção daltonismo ────────────────────────────────────────
        this.add.text(CX, painelY - 168, 'MODO DE VISÃO', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize:   '11px',
            color:      '#5bc8f5',
        }).setOrigin(0.5);

        // ── Botões de modo ────────────────────────────────────────────────────
        const modos    = cbManager.getModos();
        const btnW     = 260;
        const btnH     = 56;
        const colGap   = 30;
        const rowGap   = 18;
        const startX   = CX - btnW / 2 - colGap / 2;   // coluna esquerda
        const startY   = painelY - 120;

        // Layout: 2 colunas × 3 linhas (5 modos + 1 reserva)
        const posicoes = [
            { x: startX,           y: startY },            // none
            { x: startX + btnW + colGap, y: startY },      // deuteranopia
            { x: startX,           y: startY + btnH + rowGap },   // protanopia
            { x: startX + btnW + colGap, y: startY + btnH + rowGap }, // tritanopia
            { x: CX,               y: startY + 2 * (btnH + rowGap) }, // achromatopsia (centro)
        ];

        this._botoesVisao = [];

        modos.forEach((modo, i) => {
            const pos  = posicoes[i];
            const ativo = cbManager.getModoAtual() === modo.key;

            const grupo = this._criarBotaoModo(
                pos.x, pos.y, btnW, btnH,
                modo.label, modo.descricao, modo.icone,
                ativo,
                () => this._selecionarModo(modo.key, cbManager)
            );

            this._botoesVisao.push({ key: modo.key, grupo });
        });

        // ── Linha separadora ──────────────────────────────────────────────────
        this.add.rectangle(CX, painelY + 175, 620, 3, 0x5bc8f5).setOrigin(0.5);

        // ── Botão SAIR ────────────────────────────────────────────────────────
        this._criarBotaoSair(CX, painelY + 210);
    }

    // ─── helpers ──────────────────────────────────────────────────────────────

    /**
     * Cria um botão de seleção de modo de visão.
     * Retorna referências para poder atualizar o estado visual depois.
     */
    _criarBotaoModo(x, y, w, h, label, descricao, icone, ativo, callback) {
        const corFundo   = ativo ? 0x2255aa : 0x0d1b33;
        const corBorda   = ativo ? 0x5bc8f5 : 0x2a3f6f;
        const corTexto   = ativo ? '#ffffff' : '#8ab4cc';

        // Sombra
        const sombra = this.add.rectangle(x + 3, y + 3, w, h, 0x000000, 0.4).setOrigin(0.5);

        // Fundo do botão
        const fundo = this.add.rectangle(x, y, w, h, corFundo).setOrigin(0.5);

        // Borda (retângulo vazado via dois retângulos)
        const borda = this.add.rectangle(x, y, w, h).setOrigin(0.5)
            .setStrokeStyle(3, corBorda);

        // Indicador ativo (quadradinho à esquerda)
        const indicador = this.add.rectangle(x - w / 2 + 10, y, 6, h - 16, ativo ? 0x5bc8f5 : 0x2a3f6f)
            .setOrigin(0.5);

        // Textos
        const txtLabel = this.add.text(x - w / 2 + 26, y - 10, label, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize:   '9px',
            color:      corTexto,
        }).setOrigin(0, 0.5);

        const txtDesc = this.add.text(x - w / 2 + 26, y + 10, descricao, {
            fontFamily: 'monospace',
            fontSize:   '11px',
            color:      ativo ? '#a0d8f0' : '#4a6880',
        }).setOrigin(0, 0.5);

        // Ícone à direita
        const txtIcone = this.add.text(x + w / 2 - 20, y, icone, {
            fontSize: '18px',
        }).setOrigin(0.5);

        // Zona interativa
        const zona = this.add.zone(x, y, w, h).setOrigin(0.5).setInteractive({ useHandCursor: true });

        zona.on('pointerover', () => {
            if (!fundo._ativo) {
                fundo.setFillStyle(0x1a3a6a);
                borda.setStrokeStyle(3, 0x7ad8ff);
            }
        });
        zona.on('pointerout', () => {
            if (!fundo._ativo) {
                fundo.setFillStyle(0x0d1b33);
                borda.setStrokeStyle(3, 0x2a3f6f);
            }
        });
        zona.on('pointerdown', callback);

        return { fundo, borda, indicador, txtLabel, txtDesc, sombra };
    }

    /** Atualiza visual de todos os botões ao mudar de modo */
    _selecionarModo(modoKey, cbManager) {
        cbManager.setMode(modoKey);

        this._botoesVisao.forEach(({ key, grupo }) => {
            const ativo = key === modoKey;
            grupo.fundo._ativo = ativo;

            grupo.fundo.setFillStyle(ativo ? 0x2255aa : 0x0d1b33);
            grupo.borda.setStrokeStyle(3, ativo ? 0x5bc8f5 : 0x2a3f6f);
            grupo.indicador.setFillStyle(ativo ? 0x5bc8f5 : 0x2a3f6f);
            grupo.txtLabel.setColor(ativo ? '#ffffff' : '#8ab4cc');
            grupo.txtDesc.setColor(ativo ? '#a0d8f0' : '#4a6880');
        });
    }

    /** Botão de sair com estilo igual ao menu principal */
    _criarBotaoSair(x, y) {
        const w = 220, h = 44;

        const sombra = this.add.rectangle(x + 4, y + 4, w, h, 0x000000, 0.5).setOrigin(0.5);
        const fundo  = this.add.rectangle(x, y, w, h, 0x2255aa).setOrigin(0.5);
        fundo.setStrokeStyle(3, 0x5bc8f5);

        const txt = this.add.text(x, y, '◀  VOLTAR', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize:   '12px',
            color:      '#ffffff',
            stroke:     '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        const zona = this.add.zone(x, y, w, h).setOrigin(0.5).setInteractive({ useHandCursor: true });

        zona.on('pointerover', () => {
            fundo.setFillStyle(0x3377cc);
            txt.setColor('#5bc8f5');
        });
        zona.on('pointerout', () => {
            fundo.setFillStyle(0x2255aa);
            txt.setColor('#ffffff');
        });
        zona.on('pointerdown', () => {
            this.scene.start('MenuPrincipal');
        });
    }
}
