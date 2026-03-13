// =============================================================================
// DialogoManager.js
// Gerencia caixas de diálogo com efeito typewriter para qualquer cena/NPC.
//
// USO BÁSICO:
//   import DialogoManager from '../Classes/DialogoManager.js';
//
//   // No create() da cena:
//   this.dialogo = new DialogoManager(this);
//
//   // Para abrir um diálogo (passa array de falas):
//   this.dialogo.abrir([
//       { personagem: 'Cielita', texto: 'Olá, aventureiro!' },
//       { personagem: 'Jogador', texto: 'Olá!'              },
//   ]);
//
//   // No update(), para avançar com a tecla E:
//   if (Phaser.Input.Keyboard.JustDown(teclas.interagir)) {
//       this.dialogo.avancar();
//   }
//
//   // Para checar se está aberto (ex: bloquear movimento):
//   if (this.dialogo.aberto) { ... }
//
// CALLBACK DE FIM:
//   this.dialogo.abrir(falas, () => {
//       console.log('diálogo encerrado!');
//   });
// =============================================================================

export default class DialogoManager {

    // Delay do typewriter em ms por caractere
    static DELAY_TYPEWRITER = 35;

    // Cores padrão por tipo de personagem — adicione quantos quiser
    static CORES_PERSONAGEM = {
        'Cielita':   '#ffdd57',
        'Jogador':   '#88eeff',
        'Seu João': '#ff9900',
        _default:    '#ffffff',
    };

    constructor(cena, opcoes = {}) {
        this._cena      = cena;
        this._aberto    = false;
        this._digitando = false;
        this._indice    = 0;
        this._falas     = [];
        this._onFim     = null;
        this._timer     = null;

        const W = cena.scale.width;
        const H = cena.scale.height;

        this._cfg = Object.assign({
            caixaLargura: W,
            caixaAltura:  H * 0.15,
            caixaX:       W / 2,
            caixaY:       H - (H * 0.15) / 2,
            depth:        20,
            fundoKey:     'balao',
        }, opcoes);

        this._criarUI();
    }

    // -------------------------------------------------------------------------
    // API pública
    // -------------------------------------------------------------------------

    abrir(falas, onFim = null) {
        if (!falas || falas.length === 0) return;
        this._falas  = falas;
        this._indice = 0;
        this._onFim  = onFim;
        this._aberto = true;
        this._mostrarFala(0);
    }

    avancar() {
        if (!this._aberto) return;
        if (this._digitando) {
            this._completarTypewriter();
            return;
        }

        // Avança para a próxima fala ou fecha
        this._indice++;
        if (this._indice < this._falas.length) {
            this._mostrarFala(this._indice);
        } else {
            this.fechar();
        }
    }

    /** Fecha o diálogo imediatamente, sem esperar o fim das falas. */
    fechar() {
        this._aberto    = false;
        this._digitando = false;
        this._indice    = 0;

        if (this._timer) {
            this._timer.remove();
            this._timer = null;
        }

        this._setVisivel(false);

        if (typeof this._onFim === 'function') {
            this._onFim();
            this._onFim = null;
        }
    }

    /** Retorna true se o diálogo estiver aberto. */
    get aberto() { return this._aberto; }

    /** Retorna true se o typewriter ainda está em andamento. */
    get digitando() { return this._digitando; }

    // -------------------------------------------------------------------------
    // UI
    // -------------------------------------------------------------------------

    _criarUI() {
        const cena = this._cena;
        const { caixaX, caixaY, caixaLargura, caixaAltura, depth, fundoKey } = this._cfg;

        if (cena.textures.exists(fundoKey)) {
            this._fundo = cena.add.image(caixaX, caixaY, fundoKey)
                .setDisplaySize(caixaLargura, caixaAltura)
                .setScrollFactor(0)
                .setDepth(depth)
                .setVisible(false);
        } else {
            this._fundo = cena.add.rectangle(caixaX, caixaY, caixaLargura, caixaAltura, 0x000000, 0.8)
                .setScrollFactor(0)
                .setDepth(depth)
                .setVisible(false);
        }

        const esqX  = caixaX - caixaLargura / 2 + 20;
        const topoY = caixaY - caixaAltura  / 2;

        this._textoNome = cena.add.text(esqX, topoY + 10, '', {
            fontFamily: 'Arial',
            fontSize:   '18px',
            color:      '#ffffff',
            fontStyle:  'bold',
        })
        .setScrollFactor(0)
        .setDepth(depth + 1)
        .setVisible(false)
        .setOrigin(0, 0);

        this._textoFala = cena.add.text(esqX, topoY + 35, '', {
            fontFamily: 'Arial',
            fontSize:   '17px',
            color:      '#ffffff',
            wordWrap:   { width: caixaLargura - 40 },
        })
        .setScrollFactor(0)
        .setDepth(depth + 1)
        .setVisible(false)
        .setOrigin(0, 0);

        this._indicador = cena.add.text(
            caixaX + caixaLargura / 2 - 25,
            caixaY + caixaAltura  / 2 - 15,
            '▼', {
                fontFamily: 'Arial',
                fontSize:   '13px',
                color:      '#ffffff',
            }
        )
        .setScrollFactor(0)
        .setDepth(depth + 1)
        .setVisible(false)
        .setOrigin(0, 0);

        cena.tweens.add({
            targets:  this._indicador,
            alpha:    0,
            duration: 400,
            yoyo:     true,
            repeat:   -1,
        });
    }

    // -------------------------------------------------------------------------
    // Internos
    // -------------------------------------------------------------------------

    _mostrarFala(indice) {
        const fala = this._falas[indice];

        this._setVisivel(true);
        this._indicador.setVisible(false);
        this._digitando = true;

        const nomeExibido = fala.personagem === 'Jogador'
            ? (this._cena.game.registry.get('nomeJogador') || 'Jogador')
            : fala.personagem;

        const cor = DialogoManager.CORES_PERSONAGEM[fala.personagem]
                 ?? DialogoManager.CORES_PERSONAGEM._default;

        this._textoNome.setText(nomeExibido).setColor(cor);
        this._textoFala.setText('');

        let i = 0;
        const textoCompleto = fala.texto;

        if (this._timer) this._timer.remove();

        this._timer = this._cena.time.addEvent({
            delay:    DialogoManager.DELAY_TYPEWRITER,
            repeat:   textoCompleto.length - 1,
            callback: () => {
                this._textoFala.setText(textoCompleto.substring(0, i + 1));
                i++;
                if (i >= textoCompleto.length) {
                    this._digitando = false;
                    this._indicador.setVisible(true);
                }
            },
        });
    }

    _completarTypewriter() {
        if (this._timer) {
            this._timer.remove();
            this._timer = null;
        }
        this._textoFala.setText(this._falas[this._indice].texto);
        this._digitando = false;
        this._indicador.setVisible(true);
    }

    _setVisivel(visivel) {
        this._fundo.setVisible(visivel);
        this._textoNome.setVisible(visivel);
        this._textoFala.setVisible(visivel);
        if (!visivel) this._indicador.setVisible(false);
    }
}