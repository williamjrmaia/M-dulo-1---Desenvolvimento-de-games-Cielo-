/**
 * ColorblindManager.js
 * Gerenciador de modos de daltonismo para Cielo's World (Phaser 3).
 *
 * Como usar em qualquer cena:
 *   import ColorblindManager from './ColorblindManager.js';
 *   const cbManager = new ColorblindManager();
 *   cbManager.setMode('deuteranopia');
 *   cbManager.setMode('none'); // desativa o filtro
 */

const MODOS = {
    none: {
        label: 'Nenhum',
        descricao: 'Visão padrão',
        icone: '👁️',
        filter: null,
    },
    deuteranopia: {
        label: 'Deuteranopia',
        descricao: 'Dificuldade com verde',
        icone: '🟡',
        filter: `
            <feColorMatrix type="matrix" values="
                0.625 0.375 0     0 0
                0.700 0.300 0     0 0
                0     0.300 0.700 0 0
                0     0     0     1 0
            "/>
        `,
    },
    protanopia: {
        label: 'Protanopia',
        descricao: 'Dificuldade com vermelho',
        icone: '🔴',
        filter: `
            <feColorMatrix type="matrix" values="
                0.567 0.433 0     0 0
                0.558 0.442 0     0 0
                0     0.242 0.758 0 0
                0     0     0     1 0
            "/>
        `,
    },
    tritanopia: {
        label: 'Tritanopia',
        descricao: 'Dificuldade com azul',
        icone: '🔵',
        filter: `
            <feColorMatrix type="matrix" values="
                0.950 0.050 0     0 0
                0     0.433 0.567 0 0
                0     0.475 0.525 0 0
                0     0     0     1 0
            "/>
        `,
    },
    achromatopsia: {
        label: 'Acromatopsia',
        descricao: 'Ausência total de cor',
        icone: '⬜',
        filter: `
            <feColorMatrix type="matrix" values="
                0.299 0.587 0.114 0 0
                0.299 0.587 0.114 0 0
                0.299 0.587 0.114 0 0
                0     0     0     1 0
            "/>
        `,
    },
};

const SVG_ID      = 'cb-svg-filters';
const STORAGE_KEY = 'cielo_colorblind_mode';

export class ColorblindManager {
    constructor() {
        this.modoAtual = 'none';
        this._injetarSVG();
        this._carregarSalvo();
    }

    /** Retorna lista de modos para popular a UI */
    getModos() {
        return Object.entries(MODOS).map(([key, v]) => ({
            key,
            label:    v.label,
            descricao: v.descricao,
            icone:    v.icone,
        }));
    }

    getModoAtual() {
        return this.modoAtual;
    }

    /**
     * Aplica o modo de daltonismo no canvas do Phaser.
     * O Phaser usa o id 'game' como parent — o canvas fica dentro dele.
     * @param {'none'|'deuteranopia'|'protanopia'|'tritanopia'|'achromatopsia'} modo
     */
    setMode(modo) {
        if (!MODOS[modo]) {
            console.warn(`[ColorblindManager] Modo inválido: "${modo}"`);
            return;
        }
        this.modoAtual = modo;
        this._aplicarFiltro(modo);
        this._salvar(modo);
    }

    // ─── privados ────────────────────────────────────────────────────────────

    _injetarSVG() {
        if (document.getElementById(SVG_ID)) return;

        const NS  = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('id', SVG_ID);
        svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';

        const defs = document.createElementNS(NS, 'defs');

        Object.entries(MODOS).forEach(([key, { filter }]) => {
            if (!filter) return;
            const el = document.createElementNS(NS, 'filter');
            el.setAttribute('id', `cb-${key}`);
            el.setAttribute('color-interpolation-filters', 'linearRGB');
            el.innerHTML = filter;
            defs.appendChild(el);
        });

        svg.appendChild(defs);
        document.body.insertBefore(svg, document.body.firstChild);
    }

    _aplicarFiltro(modo) {
        // Tenta encontrar o canvas diretamente
        const canvas = document.querySelector('#game canvas') || document.querySelector('canvas');
        if (!canvas) {
            console.warn('[ColorblindManager] Canvas não encontrado. Certifique-se que o Phaser já iniciou.');
            return;
        }
        canvas.style.filter = modo === 'none' ? '' : `url(#cb-${modo})`;
    }

    _salvar(modo) {
        try { localStorage.setItem(STORAGE_KEY, modo); } catch (_) {}
    }

    _carregarSalvo() {
        try {
            const salvo = localStorage.getItem(STORAGE_KEY);
            if (salvo && MODOS[salvo]) this.setMode(salvo);
        } catch (_) {}
    }
}

export { MODOS };
export default ColorblindManager;
