// =============================================================================
// NPC.js
// Classe base para todos os NPCs do jogo. Gerencia patrulha por waypoints,
// diálogo via DialogoManager e o indicador de interação (ícone "E").
//
// DEPENDÊNCIA: DialogoManager.js
//
// ── USO BÁSICO ────────────────────────────────────────────────────────────────
//
//   import NPC from '../Classes/NPC.js';
//
//   // No create() da cena:
//   //   NPC.criarAnimacoes(this, [
//   //       { key: 'eric_idle',   frameRate: 3 },
//   //       { key: 'eric_andar',  frameRate: 4 },
//   //       { key: 'eric_lado',   frameRate: 4 },
//   //       { key: 'eric_costas', frameRate: 4 },
//   //   ]);
//
//   // PARÂMETROS opcionais por entrada:
//   //   start (padrão 0)  — frame inicial
//   //   end   (padrão -1) — frame final (-1 = todos os frames)
//
//   // 1. Grupo compartilhado para colisão NPC↔NPC (crie UMA vez por cena)
//   this.grupoNPCs = this.physics.add.group();
//
//   // 2. Instancie cada NPC
//   this.pedro = new NPC(this, 710, 390, 'seupedro_idl', {
//       velocidade: 50,
//       distanciaInteracao: 80,
//       grupoNPCs: this.grupoNPCs,        // registra no grupo automaticamente
//       onFimDialogo: () => {             // callback opcional pós-diálogo
//           this.scene.start('NegociacaoPedro');
//       },
//       animacoes: {
//           idle:  'pedro_idle',          // chaves de animações criadas na cena
//           andar: 'pedro_andar',         // frente
//           costa: 'pedro_costa',         // costas
//           lado:  'pedro_lado',          // lateral
//       },
//       waypoints: [                      // relativos à posição de spawn
//           { x:   0, y:  0 },
//           { x: 100, y:  0 },
//           { x: 100, y: 60 },
//       ],
//   });
//
//   this.pedro.setFalas([
//       { personagem: 'Seu Pedro', texto: 'Bem-vindo!' },
//       { personagem: 'Jogador',   texto: 'Olá!'      },
//   ]);
//
//   // 3. Colisão NPC↔NPC — chame UMA vez, após criar todos os NPCs
//   this.physics.add.collider(this.grupoNPCs, this.grupoNPCs);
//
//   // 4. Colisão NPC↔Jogador (opcional, mesma API do Jogador)
//   this.personagem.adicionarColisao(this.pedro);
//
//   // No update() da cena:
//   this.pedro.atualizar(this.personagem.sprite, this.teclas.interagir);
//
// ── NPC DECORATIVO (sem interação) ────────────────────────────────────────────
//
//   Para NPCs que só patrulham, sem diálogo nem indicador E, passe:
//
//   this.transeunte = new NPC(this, 200, 300, 'transeunte_idl', {
//       interativo: false,   // ← desliga DialogoManager e indicador E
//       velocidade: 40,
//       grupoNPCs:  this.grupoNPCs,
//       animacoes:  { idle: 'trans_idle', lado: 'trans_lado', ... },
//       waypoints:  [{ x: 0, y: 0 }, { x: 150, y: 0 }],
//   });
//
//   // update() — teclaInteragir pode ser null para NPCs não-interativos
//   this.transeunte.atualizar(this.personagem.sprite, null);
//
// ── ASSETS ESPERADOS ──────────────────────────────────────────────────────────
//
//   'IndicadorE' — necessário apenas para NPCs com interativo: true (padrão)
//
// =============================================================================

import DialogoManager from './DialogoManager.js';

export default class NPC extends Phaser.Physics.Arcade.Sprite {

    // cena: Phaser.Scene — cena onde o NPC será criado
    // x, y: posição de spawn no mundo
    // texturaKey: chave da textura/spritesheet já carregada
    // opcoes: configurações (ver defaults abaixo)
    constructor(cena, x, y, texturaKey, opcoes = {}) {
        super(cena, x, y, texturaKey);

        // Registra na cena para update e render
        cena.add.existing(this);
        cena.physics.add.existing(this);

        this._cena   = cena;
        this._spawnX = x;
        this._spawnY = y;

        this._cfg = Object.assign({
            interativo:         true, // false → sem DialogoManager nem indicador E
            velocidade:         60,
            distanciaInteracao: 80,
            texturaIndicador:   'IndicadorE',
            scaleIndicador:     2,
            offsetXIndicador:   0,
            waypoints:          [],   // array de { x, y } relativos ao spawn
            animacoes: {
                idle:  null,          // chave da animação parado
                andar: null,          // caminhando para frente
                costa: null,          // caminhando para trás
                lado:  null,          // caminhando para o lado
            },
            grupoNPCs:    null,       // Phaser.Physics.Arcade.Group — para colisão NPC↔NPC
            onFimDialogo: null,       // function() — chamada ao fim do último texto
            flipDireita:  false,      // true se o sprite padrão aponta para a ESQUERDA (espelha ao andar para direita)
        }, opcoes);

        // ── Colisão NPC↔NPC ───────────────────────────────────────────────────
        // Precisa vir ANTES de setImmovable: group.add() recria o corpo físico
        // e sobrescreveria immovable se chamado depois.
        if (this._cfg.grupoNPCs) {
            this._cfg.grupoNPCs.add(this);
        }

        // ── Física ────────────────────────────────────────────────────────────
        this.setImmovable(true);
        this.body.setAllowGravity(false);

        // ── Patrulha ──────────────────────────────────────────────────────────
        // Converte waypoints relativos para absolutos uma única vez
        // pausa (opcional, em ms): tempo parado ao chegar neste waypoint
        this._waypoints = this._cfg.waypoints.map(wp => ({
            x:     x + wp.x,
            y:     y + wp.y,
            pausa: wp.pausa ?? 0,
        }));
        this._waypointAtual  = 0;
        this._patrulhando    = this._waypoints.length > 0;
        this._pausado        = false;
        this._pausaAte       = 0; // timestamp até quando o NPC fica parado no waypoint

        // ── Diálogo e indicador E — apenas para NPCs interativos ─────────────
        if (this._cfg.interativo) {
            this._dialogo    = new DialogoManager(cena);
            this._falas      = [];
            this._indicadorE = cena.add
                .image(0, 0, this._cfg.texturaIndicador)
                .setDepth(15)
                .setScale(this._cfg.scaleIndicador)
                .setVisible(false);
        } else {
            this._dialogo    = null;
            this._falas      = [];
            this._indicadorE = null;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // API Pública
    // ─────────────────────────────────────────────────────────────────────────

    // Define as falas do NPC. Retorna `this` para encadeamento.
    // falas: Array<{personagem: string, texto: string}>
    setFalas(falas) {
        this._falas = falas;
        return this;
    }

    // Deve ser chamado no update() da cena a cada frame.
    // jogadorSprite: Phaser.GameObjects.Sprite — sprite físico do jogador
    // teclaInteragir: Phaser.Input.Keyboard.Key | Key[] — tecla(s) de interação
    //   Aceita uma única tecla OU um array de teclas — qualquer uma aciona o diálogo.
    //   Retrocompatível: chamadas antigas com uma só tecla continuam funcionando.
    atualizar(jogadorSprite, teclaInteragir) {
        // NPCs não-interativos só patrulham — sem checagem de proximidade
        if (!this._cfg.interativo) {
            if (this._patrulhando) this._atualizarPatrulha();
            return;
        }

        const dist = Phaser.Math.Distance.Between(
            jogadorSprite.x, jogadorSprite.y,
            this.x,          this.y
        );
        const perto = dist <= this._cfg.distanciaInteracao;

        // Pausa a patrulha quando o jogador está perto ou o diálogo está aberto
        this._pausado = perto || this._dialogo.aberto;

        // ── Indicador "E" ─────────────────────────────────────────────────────
        this._indicadorE.setVisible(perto && !this._dialogo.aberto);
        if (perto) {
            this._indicadorE.setPosition(
                this.x + this._cfg.offsetXIndicador,
                this.y - this.displayHeight / 2 - 14
            );
        }

        // ── Fecha diálogo se jogador se afastar ───────────────────────────────
        if (!perto && this._dialogo.aberto) {
            this._dialogo.fechar();
        }

        // ── Tecla(s) de interação ─────────────────────────────────────────────
        // _justDown() aceita uma tecla única ou um array — retorna true se
        // qualquer uma delas foi pressionada neste frame (JustDown).
        // JustDown consome o flag na primeira checagem, então só verificamos
        // quando o jogador está perto ou o diálogo já está aberto.
        if ((perto || this._dialogo.aberto) && this._justDown(teclaInteragir)) {
            if (perto && !this._dialogo.aberto) {
                this._dialogo.abrir(this._falas, this._cfg.onFimDialogo);
                return;
            }
            if (this._dialogo.aberto) {
                this._dialogo.avancar();
            }
        }

        // ── Patrulha ──────────────────────────────────────────────────────────
        if (this._patrulhando && !this._pausado) {
            this._atualizarPatrulha();
        } else if (this._pausado) {
            this.setVelocity(0);
            this._playAnim('idle');
        }
    }

    /** Retorna true se o diálogo deste NPC estiver aberto. Sempre false para NPCs não-interativos. */
    get dialogoAberto() { return this._dialogo ? this._dialogo.aberto : false; }

    // ─────────────────────────────────────────────────────────────────────────
    // Patrulha
    // ─────────────────────────────────────────────────────────────────────────

    _atualizarPatrulha() {
        const alvo = this._waypoints[this._waypointAtual];
        const dist = Phaser.Math.Distance.Between(this.x, this.y, alvo.x, alvo.y);

        // Aguardando pausa no waypoint atual
        if (this._pausaAte > 0) {
            if (Date.now() < this._pausaAte) {
                this.setVelocity(0);
                this._playAnim('idle');
                return;
            }
            this._pausaAte = 0;
        }

        // Chegou no waypoint — aplica pausa (se houver) e avança para o próximo
        if (dist < 4) {
            this.setVelocity(0);
            this.setPosition(alvo.x, alvo.y);
            if (alvo.pausa > 0) {
                this._pausaAte = Date.now() + alvo.pausa;
            }
            this._waypointAtual = (this._waypointAtual + 1) % this._waypoints.length;
            return;
        }

        const vel = this._cfg.velocidade;
        const dx  = alvo.x - this.x;
        const dy  = alvo.y - this.y;

        // Normaliza o vetor de direção para velocidade constante em diagonais
        const mag = Math.sqrt(dx * dx + dy * dy);
        this.setVelocityX((dx / mag) * vel);
        this.setVelocityY((dy / mag) * vel);

        // Animação direcional — eixo dominante decide a animação
        if (Math.abs(dx) >= Math.abs(dy)) {
            this._playAnim('lado');
            // flipDireita: true  → sprite padrão aponta esquerda, espelha ao ir para direita
            // flipDireita: false → sprite padrão aponta direita,  espelha ao ir para esquerda
            this.setFlipX(this._cfg.flipDireita ? dx < 0 : dx > 0);
        } else {
            // dy < 0 → NPC subindo na tela  → costas para a câmera
            // dy > 0 → NPC descendo na tela → frente para a câmera
            this._playAnim(dy < 0 ? 'costa' : 'andar');
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers internos
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Retorna true se qualquer uma das teclas informadas foi pressionada neste frame.
     * Aceita uma única Phaser.Input.Keyboard.Key ou um array delas.
     * Retrocompatível: chamadas antigas com uma só tecla continuam funcionando.
     */
    _justDown(tecla) {
        if (Array.isArray(tecla)) {
            return tecla.some(t => t && Phaser.Input.Keyboard.JustDown(t));
        }
        return tecla && Phaser.Input.Keyboard.JustDown(tecla);
    }

    /**
     * Toca uma animação sem reiniciá-la se já estiver rodando.
     * Se a chave da animação não foi configurada, o método não faz nada,
     * permitindo NPCs sem animações (sprite estático).
     */
    _playAnim(tipo) {
        const key = this._cfg.animacoes[tipo];
        if (!key) return;
        if (this.anims.currentAnim?.key !== key) {
            this.play(key, true);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Limpeza
    // ─────────────────────────────────────────────────────────────────────────

    destroy(fromScene) {
        if (this._indicadorE) this._indicadorE.destroy();
        super.destroy(fromScene);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Utilitários estáticos
    // ─────────────────────────────────────────────────────────────────────────

    // Registra animações no gerenciador de animações da cena de forma concisa.
    // O key da animação é usado também como key do spritesheet (padrão do projeto).
    // Ignora animações já registradas para evitar erros ao revisitar a cena.

    static criarAnimacoes(cena, definicoes) {
        definicoes.forEach(({ key, frameRate, start = 0, end = -1 }) => {
            if (cena.anims.exists(key)) return;
            cena.anims.create({
                key,
                frames:    cena.anims.generateFrameNumbers(key, { start, end }),
                frameRate,
                repeat:    -1,
            });
        });
    }
}