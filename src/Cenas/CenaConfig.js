import ColorblindManager from './ColorblindManager.js';

export default class CenaConfig extends Phaser.Scene {
    constructor() {
        super('CenaConfig');
    }

    preload() {
        this.load.image('menu_jogo', 'assets/Menu/menu_fundo.png');
    }

    create() {
        const CX = 750;
        const CY = 400;

        if (!this.registry.get('colorblindManager')) {
            this.registry.set('colorblindManager', new ColorblindManager());
        }
        this._cbManager = this.registry.get('colorblindManager');

        this.add.image(CX, CY, 'menu_jogo');

        const painelW = 700, painelH = 520;
        this.add.rectangle(CX + 6, CY + 6, painelW, painelH, 0x000000, 0.5).setOrigin(0.5);
        this.add.rectangle(CX, CY, painelW, painelH, 0x1a2a4a).setOrigin(0.5);
        this.add.rectangle(CX, CY - painelH / 2 + 4, painelW, 8, 0x5bc8f5).setOrigin(0.5, 0);
        this.add.rectangle(CX, CY + painelH / 2 - 4, painelW, 8, 0x5bc8f5).setOrigin(0.5, 1);

        this.add.text(CX, CY - 210, 'CONFIGURAÇÕES', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '20px', color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
        }).setOrigin(0.5);
        this.add.rectangle(CX, CY - 188, 620, 3, 0x5bc8f5).setOrigin(0.5);

        this._containerMenu  = this.add.container(0, 0);
        this._containerVisao = this.add.container(0, 0);
        this._containerRes   = this.add.container(0, 0);
        this._containerSom   = this.add.container(0, 0);

        this._criarMenuPrincipal(CX, CY);
        this._criarTelaVisao(CX, CY);
        this._criarTelaResolucao(CX, CY);
        this._criarTelaSom(CX, CY);

        this._mostrarTela('menu');
    }

    // ─── Navegação ────────────────────────────────────────────────────────────

    _mostrarTela(tela) {
        this._containerMenu.setVisible(tela === 'menu');
        this._containerVisao.setVisible(tela === 'visao');
        this._containerRes.setVisible(tela === 'resolucao');
        this._containerSom.setVisible(tela === 'som');
    }

    // ─── Menu principal ───────────────────────────────────────────────────────

    _criarMenuPrincipal(CX, CY) {
        const c = this._containerMenu;
        const categorias = [
            { label: 'MODO DE VISÃO', icone: '👁️', desc: 'Opções de daltonismo e Brilho', tela: 'visao'     },
            { label: 'RESOLUÇÃO',     icone: '🖥️', desc: 'Tamanho da janela',     tela: 'resolucao' },
            { label: 'SOM',           icone: '🔊', desc: 'Regular Volume',       tela: 'som'       },
        ];
        const btnW = 560, btnH = 64, gap = 20, startY = CY - 100;
        categorias.forEach((cat, i) => {
            this._criarBotaoCategoria(c, CX, startY + i * (btnH + gap), btnW, btnH,
                cat.label, cat.desc, cat.icone, () => this._mostrarTela(cat.tela));
        });
        this._criarBotaoAcao(c, CX, CY + 210, '◀  SAIR', () => this.scene.start('MenuPrincipal'));
    }

    _criarBotaoCategoria(container, x, y, w, h, label, desc, icone, callback) {
        const sombra   = this.add.rectangle(x + 4, y + 4, w, h, 0x000000, 0.45).setOrigin(0.5);
        const fundo    = this.add.rectangle(x, y, w, h, 0x0d1b33).setOrigin(0.5);
        const borda    = this.add.rectangle(x, y, w, h).setOrigin(0.5).setStrokeStyle(3, 0x2a3f6f);
        const barra    = this.add.rectangle(x - w / 2 + 8, y, 6, h - 16, 0x2a3f6f).setOrigin(0.5);
        const txtLabel = this.add.text(x - w / 2 + 28, y - 11, label, {
            fontFamily: '"Press Start 2P", monospace', fontSize: '11px', color: '#8ab4cc',
        }).setOrigin(0, 0.5);
        const txtDesc  = this.add.text(x - w / 2 + 28, y + 11, desc, {
            fontFamily: 'monospace', fontSize: '12px', color: '#4a6880',
        }).setOrigin(0, 0.5);
        const txtIcone = this.add.text(x + w / 2 - 28, y, icone, { fontSize: '22px' }).setOrigin(0.5);
        const txtSeta  = this.add.text(x + w / 2 - 55, y, '▶', {
            fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#2a3f6f',
        }).setOrigin(0.5);
        const zona = this.add.zone(x, y, w, h).setOrigin(0.5).setInteractive({ useHandCursor: true });
        zona.on('pointerover', () => {
            fundo.setFillStyle(0x1a3a6a); borda.setStrokeStyle(3, 0x5bc8f5);
            barra.setFillStyle(0x5bc8f5); txtLabel.setColor('#ffffff');
            txtDesc.setColor('#a0d8f0');  txtSeta.setColor('#5bc8f5');
        });
        zona.on('pointerout', () => {
            fundo.setFillStyle(0x0d1b33); borda.setStrokeStyle(3, 0x2a3f6f);
            barra.setFillStyle(0x2a3f6f); txtLabel.setColor('#8ab4cc');
            txtDesc.setColor('#4a6880');  txtSeta.setColor('#2a3f6f');
        });
        zona.on('pointerdown', callback);
        container.add([sombra, fundo, borda, barra, txtLabel, txtDesc, txtIcone, txtSeta, zona]);
    }

    // ─── Tela: Modo de Visão ──────────────────────────────────────────────────

    _criarTelaVisao(CX, CY) {
        const c = this._containerVisao;

        c.add(this.add.text(CX, CY - 168, 'MODO DE VISÃO', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '11px', color: '#5bc8f5',
        }).setOrigin(0.5));

        const modos  = this._cbManager.getModos();
        const btnW   = 260, btnH = 56, colGap = 30, rowGap = 18;
        const startX = CX - btnW / 2 - colGap / 2;
        const startY = CY - 128;

        const posicoes = [
            { x: startX,                 y: startY },
            { x: startX + btnW + colGap, y: startY },
            { x: startX,                 y: startY + btnH + rowGap },
            { x: startX + btnW + colGap, y: startY + btnH + rowGap },
            { x: CX,                     y: startY + 2 * (btnH + rowGap) },
        ];

        this._botoesVisao = [];
        modos.forEach((modo, i) => {
            const pos   = posicoes[i];
            const ativo = this._cbManager.getModoAtual() === modo.key;
            const grupo = this._criarBotaoModo(
                c, pos.x, pos.y, btnW, btnH,
                modo.label, modo.descricao, modo.icone, ativo,
                () => this._selecionarModo(modo.key)
            );
            this._botoesVisao.push({ key: modo.key, grupo });
        });

        this._criarSliderBrilho(c, CX, CY + 148);
        this._criarBotaoAcao(c, CX, CY + 218, '◀  VOLTAR', () => this._mostrarTela('menu'));
    }

    _criarBotaoModo(container, x, y, w, h, label, descricao, icone, ativo, callback) {
        const sombra    = this.add.rectangle(x + 3, y + 3, w, h, 0x000000, 0.4).setOrigin(0.5);
        const fundo     = this.add.rectangle(x, y, w, h, ativo ? 0x2255aa : 0x0d1b33).setOrigin(0.5);
        const borda     = this.add.rectangle(x, y, w, h).setOrigin(0.5).setStrokeStyle(3, ativo ? 0x5bc8f5 : 0x2a3f6f);
        const indicador = this.add.rectangle(x - w / 2 + 10, y, 6, h - 16, ativo ? 0x5bc8f5 : 0x2a3f6f).setOrigin(0.5);
        const txtLabel  = this.add.text(x - w / 2 + 26, y - 10, label, {
            fontFamily: '"Press Start 2P", monospace', fontSize: '9px',
            color: ativo ? '#ffffff' : '#8ab4cc',
        }).setOrigin(0, 0.5);
        const txtDesc   = this.add.text(x - w / 2 + 26, y + 10, descricao, {
            fontFamily: 'monospace', fontSize: '11px',
            color: ativo ? '#a0d8f0' : '#4a6880',
        }).setOrigin(0, 0.5);
        const txtIcone  = this.add.text(x + w / 2 - 20, y, icone, { fontSize: '18px' }).setOrigin(0.5);
        const zona = this.add.zone(x, y, w, h).setOrigin(0.5).setInteractive({ useHandCursor: true });
        zona.on('pointerover', () => {
            if (!fundo._ativo) { fundo.setFillStyle(0x1a3a6a); borda.setStrokeStyle(3, 0x7ad8ff); }
        });
        zona.on('pointerout', () => {
            if (!fundo._ativo) { fundo.setFillStyle(0x0d1b33); borda.setStrokeStyle(3, 0x2a3f6f); }
        });
        zona.on('pointerdown', callback);
        container.add([sombra, fundo, borda, indicador, txtLabel, txtDesc, txtIcone, zona]);
        return { fundo, borda, indicador, txtLabel, txtDesc };
    }

    _selecionarModo(modoKey) {
        this._cbManager.setMode(modoKey);
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

    // ─── Slider de Brilho ─────────────────────────────────────────────────────

   _criarSliderBrilho(container, x, y) {
    const sliderW = 560, sliderH = 54;

    const sombra = this.add.rectangle(x + 3, y + 3, sliderW, sliderH, 0x000000, 0.4).setOrigin(0.5);
    const fundo  = this.add.rectangle(x, y, sliderW, sliderH, 0x0d1b33).setOrigin(0.5);
    fundo.setStrokeStyle(3, 0x2a3f6f);
    const barra  = this.add.rectangle(x - sliderW / 2 + 8, y, 6, sliderH - 16, 0x2a3f6f).setOrigin(0.5);

    const txtLabel = this.add.text(x - sliderW / 2 + 26, y - 12, 'BRILHO', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '9px', color: '#8ab4cc',
    }).setOrigin(0, 0.5);

    const trilhoX = x - sliderW / 2 + 110;
    const trilhoW = sliderW - 200;
    const trilhoY = y + 12;

    // ── ATENÇÃO: agora salvos em variável e adicionados ao container ──
    const trilhoBase  = this.add.rectangle(trilhoX + trilhoW / 2, trilhoY, trilhoW, 6, 0x1a3a6a).setOrigin(0.5);
    const trilhoAtivo = this.add.rectangle(trilhoX, trilhoY, 1, 6, 0x5bc8f5).setOrigin(0, 0.5);

    const icolSol  = this.add.text(trilhoX - 18, trilhoY, '☀', { fontSize: '11px', color: '#4a6880' }).setOrigin(0.5);
    const icolSol2 = this.add.text(trilhoX + trilhoW + 18, trilhoY, '☀', { fontSize: '18px', color: '#f5d85b' }).setOrigin(0.5);

    const handle = this.add.rectangle(0, trilhoY, 14, 22, 0x5bc8f5)
        .setOrigin(0.5).setStrokeStyle(2, 0xffffff);

    const txtValor = this.add.text(x + sliderW / 2 - 36, y + 12, '100%', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '9px', color: '#5bc8f5',
    }).setOrigin(0.5);

    const MIN = 0.2, MAX = 1.5;
    const brilhoSalvo = (() => {
        try { return parseFloat(localStorage.getItem('cielo_brilho')) || 1.0; } catch { return 1.0; }
    })();
    let brilhoAtual = Math.min(Math.max(brilhoSalvo, MIN), MAX);

    const xParaBrilho  = (v)  => trilhoX + ((v - MIN) / (MAX - MIN)) * trilhoW;
    const pxParaBrilho = (px) => MIN + ((Math.min(Math.max(px, trilhoX), trilhoX + trilhoW) - trilhoX) / trilhoW) * (MAX - MIN);

    const aplicarBrilho = (v) => {
        brilhoAtual = Math.min(Math.max(v, MIN), MAX);
        const hx = xParaBrilho(brilhoAtual);
        handle.setX(hx);
        trilhoAtivo.width = hx - trilhoX;
        txtValor.setText(Math.round(brilhoAtual * 100) + '%');
        const canvas = document.querySelector('#game canvas') || document.querySelector('canvas');
        if (canvas) {
            const filtros = canvas.style.filter.replace(/brightness\([^)]*\)/g, '').trim();
            canvas.style.filter = [filtros, `brightness(${brilhoAtual.toFixed(2)})`].filter(Boolean).join(' ');
        }
        try { localStorage.setItem('cielo_brilho', brilhoAtual); } catch {}
    };

    aplicarBrilho(brilhoAtual);

    const zona = this.add.zone(x, y, sliderW, sliderH)
        .setOrigin(0.5).setInteractive({ useHandCursor: true });

    let arrastando = false;
    zona.on('pointerdown', (ptr) => { arrastando = true; aplicarBrilho(pxParaBrilho(ptr.x)); });
    this.input.on('pointermove', (ptr) => { if (arrastando) aplicarBrilho(pxParaBrilho(ptr.x)); });
    this.input.on('pointerup', () => { arrastando = false; });

    // Todos os objetos dentro do container
    container.add([sombra, fundo, barra, txtLabel, trilhoBase, trilhoAtivo, icolSol, icolSol2, handle, txtValor, zona]);
}

    // ─── Tela: Resolução ──────────────────────────────────────────────────────

    _criarTelaResolucao(CX, CY) {
    const c = this._containerRes;

    c.add(this.add.text(CX, CY - 168, 'RESOLUÇÃO', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '11px', color: '#5bc8f5',
    }).setOrigin(0.5));

    const resolucoes = [
    { label: '1280 × 720',  desc: 'HD',               w: 1280, h: 720  },
    { label: '1500 × 800',  desc: 'Padrão do jogo',   w: 1500, h: 800  },
    { label: '1600 × 900',  desc: 'HD+',              w: 1600, h: 900  },
    { label: '1920 × 1080', desc: 'FULL HD',          w: 1920, h: 1080 },
];

    // Lê resolução salva (padrão: 1500x800 que é o tamanho original do jogo)
    const salvo = (() => {
        try { return JSON.parse(localStorage.getItem('cielo_resolucao')); } catch { return null; }
    })();

    const btnW = 500, btnH = 60, gap = 18;
    const startY = CY - 100;

    this._botoesRes = [];

    resolucoes.forEach((res, i) => {
        const y    = startY + i * (btnH + gap);
        const ativo = salvo ? (salvo.w === res.w && salvo.h === res.h) : (res.w === 1500 && res.h === 800);


        const grupo = this._criarBotaoResolucao(c, CX, y, btnW, btnH, res.label, res.desc, ativo, () => {
            this._aplicarResolucao(res.w, res.h);
        });
        this._botoesRes.push({ w: res.w, h: res.h, grupo });
    });

    this._criarBotaoAcao(c, CX, CY + 210, '◀  VOLTAR', () => this._mostrarTela('menu'));
}

_criarBotaoResolucao(container, x, y, w, h, label, desc, ativo, callback) {
    const sombra    = this.add.rectangle(x + 3, y + 3, w, h, 0x000000, 0.4).setOrigin(0.5);
    const fundo     = this.add.rectangle(x, y, w, h, ativo ? 0x2255aa : 0x0d1b33).setOrigin(0.5);
    const borda     = this.add.rectangle(x, y, w, h).setOrigin(0.5).setStrokeStyle(3, ativo ? 0x5bc8f5 : 0x2a3f6f);
    const indicador = this.add.rectangle(x - w / 2 + 10, y, 6, h - 16, ativo ? 0x5bc8f5 : 0x2a3f6f).setOrigin(0.5);

    const txtLabel = this.add.text(x - w / 2 + 28, y - 10, label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '11px', color: ativo ? '#ffffff' : '#8ab4cc',
    }).setOrigin(0, 0.5);

    const txtDesc = this.add.text(x - w / 2 + 28, y + 12, desc, {
        fontFamily: 'monospace', fontSize: '12px',
        color: ativo ? '#a0d8f0' : '#4a6880',
    }).setOrigin(0, 0.5);

    // Ícone de check quando ativo
    const txtCheck = this.add.text(x + w / 2 - 28, y, ativo ? '✔' : '', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px', color: '#5bc8f5',
    }).setOrigin(0.5);

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

    container.add([sombra, fundo, borda, indicador, txtLabel, txtDesc, txtCheck, zona]);
    return { fundo, borda, indicador, txtLabel, txtDesc, txtCheck };
}

_aplicarResolucao(w, h) {
    // Salva preferência
    try { localStorage.setItem('cielo_resolucao', JSON.stringify({ w, h })); } catch {}

    // Atualiza visual dos botões
    this._botoesRes.forEach(({ w: bw, h: bh, grupo }) => {
        const ativo = bw === w && bh === h;
        grupo.fundo._ativo = ativo;
        grupo.fundo.setFillStyle(ativo ? 0x2255aa : 0x0d1b33);
        grupo.borda.setStrokeStyle(3, ativo ? 0x5bc8f5 : 0x2a3f6f);
        grupo.indicador.setFillStyle(ativo ? 0x5bc8f5 : 0x2a3f6f);
        grupo.txtLabel.setColor(ativo ? '#ffffff' : '#8ab4cc');
        grupo.txtDesc.setColor(ativo ? '#a0d8f0' : '#4a6880');
        grupo.txtCheck.setText(ativo ? '✔' : '');
    });

    // Redimensiona o canvas do Phaser
    this.scale.resize(w, h);

    // Centraliza o canvas na página
    const canvas = document.querySelector('#game canvas') || document.querySelector('canvas');
    if (canvas) {
        canvas.style.display   = 'block';
        canvas.style.margin    = 'auto';
        canvas.style.position  = 'relative';
    }
}

    // ─── Tela: Som ────────────────────────────────────────────────────────────

    _criarTelaSom(CX, CY) {
        const c = this._containerSom;

        
        // Slider de Música
        c.add(this.add.text(CX, CY - 160, '🎵  MÚSICA', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px', color: '#8ab4cc',
        }).setOrigin(0.5));
        this._criarSliderSom(c, CX, CY - 108, 'cielo_vol_musica', 0.5,
            (v) => {
                const audio = this.registry.get('audio');
                if (audio) audio.setVolumeMusica(v);
            }
        );

        // Linha separadora
        c.add(this.add.rectangle(CX, CY - 48, 560, 2, 0x2a3f6f).setOrigin(0.5));

        // Slider de Ambiente
        c.add(this.add.text(CX, CY - 12, '🌿  SOM AMBIENTE', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px', color: '#8ab4cc',
        }).setOrigin(0.5));
        this._criarSliderSom(c, CX, CY + 44, 'cielo_vol_ambiente', 0.3,
            (v) => {
                const audio = this.registry.get('audio');
                if (audio) audio.setVolumeAmbiente(v);
            }
        );

        this._criarBotaoAcao(c, CX, CY + 210, '◀  VOLTAR', () => this._mostrarTela('menu'));
    }

    /**
     * Slider de volume reutilizável para a tela de Som.
     * @param {Phaser.GameObjects.Container} container
     * @param {number} x  centro horizontal
     * @param {number} y  centro vertical
     * @param {string} storageKey  chave no localStorage
     * @param {number} padrao      valor padrão (0–1)
     * @param {Function} onChange  callback(v) chamado ao arrastar
     */
    _criarSliderSom(container, x, y, storageKey, padrao, onChange) {
        const sliderW = 560, sliderH = 54;

        const sombra = this.add.rectangle(x + 3, y + 3, sliderW, sliderH, 0x000000, 0.4).setOrigin(0.5);
        const fundo  = this.add.rectangle(x, y, sliderW, sliderH, 0x0d1b33).setOrigin(0.5);
        fundo.setStrokeStyle(3, 0x2a3f6f);
        const barra  = this.add.rectangle(x - sliderW / 2 + 8, y, 6, sliderH - 16, 0x2a3f6f).setOrigin(0.5);

        const trilhoX = x - sliderW / 2 + 60;
        const trilhoW = sliderW - 120;
        const trilhoY = y + 10;

        const trilhoBase  = this.add.rectangle(trilhoX + trilhoW / 2, trilhoY, trilhoW, 6, 0x1a3a6a).setOrigin(0.5);
        const trilhoAtivo = this.add.rectangle(trilhoX, trilhoY, 1, 6, 0x5bc8f5).setOrigin(0, 0.5);

        const icolMin = this.add.text(trilhoX - 18, trilhoY, '🔈', { fontSize: '13px' }).setOrigin(0.5);
        const icolMax = this.add.text(trilhoX + trilhoW + 18, trilhoY, '🔊', { fontSize: '18px' }).setOrigin(0.5);

        const handle = this.add.rectangle(0, trilhoY, 14, 22, 0x5bc8f5)
            .setOrigin(0.5).setStrokeStyle(2, 0xffffff);

        const txtValor = this.add.text(x + sliderW / 2 - 36, y + 10, '100%', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '9px', color: '#5bc8f5',
        }).setOrigin(0.5);

        // ── Leitura do valor salvo ────────────────────────────────────────────
        const valorSalvo = (() => {
            try { const s = localStorage.getItem(storageKey); return s !== null ? parseFloat(s) : padrao; }
            catch { return padrao; }
        })();
        let valorAtual = Phaser.Math.Clamp(valorSalvo, 0, 1);

        const xParaValor  = (v)  => trilhoX + v * trilhoW;
        const pxParaValor = (px) => Phaser.Math.Clamp((Math.min(Math.max(px, trilhoX), trilhoX + trilhoW) - trilhoX) / trilhoW, 0, 1);

        const aplicar = (v) => {
            valorAtual = Phaser.Math.Clamp(v, 0, 1);
            const hx = xParaValor(valorAtual);
            handle.setX(hx);
            trilhoAtivo.width = hx - trilhoX;
            txtValor.setText(Math.round(valorAtual * 100) + '%');
            try { localStorage.setItem(storageKey, valorAtual); } catch {}
            onChange(valorAtual);
        };

        aplicar(valorAtual);

        // ── Interatividade ────────────────────────────────────────────────────
        const zona = this.add.zone(x, y, sliderW, sliderH)
            .setOrigin(0.5).setInteractive({ useHandCursor: true });

        let arrastando = false;
        zona.on('pointerdown', (ptr) => { arrastando = true; aplicar(pxParaValor(ptr.x)); });
        this.input.on('pointermove', (ptr) => { if (arrastando) aplicar(pxParaValor(ptr.x)); });
        this.input.on('pointerup', () => { arrastando = false; });

        container.add([sombra, fundo, barra, trilhoBase, trilhoAtivo, icolMin, icolMax, handle, txtValor, zona]);
    }

    // ─── Botão genérico ───────────────────────────────────────────────────────

    _criarBotaoAcao(container, x, y, rotulo, callback) {
        const w = 220, h = 44;
        const sombra = this.add.rectangle(x + 4, y + 4, w, h, 0x000000, 0.5).setOrigin(0.5);
        const fundo  = this.add.rectangle(x, y, w, h, 0x2255aa).setOrigin(0.5);
        fundo.setStrokeStyle(3, 0x5bc8f5);
        const txt = this.add.text(x, y, rotulo, {
            fontFamily: '"Press Start 2P", monospace', fontSize: '12px',
            color: '#ffffff', stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5);
        const zona = this.add.zone(x, y, w, h).setOrigin(0.5).setInteractive({ useHandCursor: true });
        zona.on('pointerover', () => { fundo.setFillStyle(0x3377cc); txt.setColor('#5bc8f5'); });
        zona.on('pointerout',  () => { fundo.setFillStyle(0x2255aa); txt.setColor('#ffffff'); });
        zona.on('pointerdown', callback);
        if (container) container.add([sombra, fundo, txt, zona]);
    }
}