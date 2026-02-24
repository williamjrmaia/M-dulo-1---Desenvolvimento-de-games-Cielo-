import { criarCasa, criarArvore, criarArvore2, criarArvore3, criarArvore4 } from './funcoes.js';

export default class CenaJogo extends Phaser.Scene {
    constructor() { super('CenaJogo'); }
    
    preload() {
        // carregando spritesheets do personagem
        this.load.spritesheet('Andando', '../assets/animacoes/andarfrente.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('IdleFrente', '../assets/animacoes/idlefrente.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('Lado', '../assets/animacoes/andarlado.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('Costa', '../assets/animacoes/andarcosta.png', { frameWidth: 64, frameHeight: 64 });
        //carregando imagens dos objetos do mapa
        this.load.image('coco', '../assets/objetos/coco.jpeg');
        this.load.image('casa', '../assets/objetos/casa.png');
        this.load.image('fundo', '../assets/mapa_exportado.png');
        this.load.image('Arvore1', '../assets/objetos/arvore1.png');
        this.load.image('Arvore2', '../assets/objetos/arvore2.png');
        this.load.image('Arvore3', '../assets/objetos/arvore3.png');
        this.load.image('Arvore4', '../assets/objetos/arvore4.png');

    }

    create() {
        
        //Quando apertamos o botão do MENU jogar, ele transita para o jogo normal, e esse fadeIn abaixo coloca um gradiente para não ser uma transição dura
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // Criação do ícone do Coco para teste. Futuramente se tornará um cadeado para simbolizar zonas trancadas que o player não tem acesso ainda
        this.coco = this.add.image(400, 670, 'coco').setScale(0.1).setDepth(1);
        this.coco.setVisible(false); // Torna o item invisível

        this.add.image(742, 400, 'fundo').setScale(0.589).setDepth(0); 
        // Define a profundidade do fundo para que fique atrás de todos os outros objetos

        //Obstáculos
        this.obstaculos = this.physics.add.staticGroup();

        // funcoes importadas de funcoes.js para colocar as imagens no jogo
        criarCasa(this, 400, 300);
        criarArvore(this, 500, 400);
        criarArvore2(this, 600, 300);
        criarArvore3(this, 700, 400);
        criarArvore4(this, 800, 300);


        //personagem (ícone, animação e hitbox)
        //Física do personagem
        this.personagem = this.physics.add.sprite(750, 480, 'IdleFrente').setScale(1.0);
        this.personagem.setCollideWorldBounds(true);
        this.personagem.body.setSize(10, 15);
        this.personagem.setOffset(27, 30);

        //Chamando as teclas para fazer a movimentação
        this.physics.add.collider(this.personagem, this.obstaculos); // Colisão entre personagem e obstáculos
        this.teclas = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            //DiagUR: Phaser.Input.Keyboard.KeyCodes.W&&D,
            //DiagUL: Phaser.Input.Keyboard.KeyCodes.W&&A,
            //DiagDR: Phaser.Input.Keyboard.KeyCodes.S&&D,
            //DiagDL: Phaser.Input.Keyboard.KeyCodes.S&&A
        });
        
        criarAnimacoesJogador(this);

        // Criação da CÂMERA que segue o personagem | Zoom | Limites da câmera para não mostrar áreas fora do mapa
        this.cameras.main.startFollow(this.personagem);
        this.cameras.main.setZoom(2.7);
        this.cameras.main.setBounds(0, 0, 1500, 800)
        }
            
            update() {
        let vel = 100;
        this.personagem.setVelocity(0);

        atualizarMovimentoJogador(this.personagem, this.teclas);

        //coloca o coco quando o jogador chega perto de uma area proibida
        let distancia = (Phaser.Math.Distance.Between(
            this.personagem.x, this.personagem.y, 
            this.coco.x, this.coco.y));

        if (distancia < 75) {
            this.coco.setVisible(true);
        } else {
            this.coco.setVisible(false);
        }

      }
}