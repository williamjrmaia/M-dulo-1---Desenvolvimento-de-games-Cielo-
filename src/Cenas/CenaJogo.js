class CenaJogo extends Phaser.Scene {
            constructor() { super('CenaJogo'); }
            preload() {
                 // Carregando spritesheets com animações
            this.load.spritesheet('Andando', 'Assets/Animações/andarfrente.png', { frameWidth: 64, frameHeight: 64 });
            this.load.spritesheet('IdleFrente', 'Assets/Animações/idlefrente.png', { frameWidth: 64, frameHeight: 64 });
            this.load.spritesheet('Lado', 'Assets/Animações/andarlado.png', { frameWidth: 64, frameHeight: 64 });
            this.load.spritesheet('Costa', 'Assets/Animações/andarcosta.png', { frameWidth: 64, frameHeight: 64 });
            //this.load.spritesheet('DiagUR', 'Assets/Animações/diagonalcimadireita.png', { frameWidth: 64, frameHeight: 64 });
            //this.load.spritesheet('DiagUL', 'Assets/Animações/diagonalcimaesquerda.png', { frameWidth: 64, frameHeight: 64 });
            //this.load.spritesheet('DiagDR', 'Assets/Animações/diagonalbaixodireita.png', { frameWidth: 64, frameHeight: 64 });
            //this.load.spritesheet('DiagDL', 'Assets/Animações/diagonalbaixoesquerda.png', { frameWidth: 64, frameHeight: 64 });
            // COLOCAR NOMES DAS ANIMS IGUAIS ESSES AQUI         ˆˆˆˆˆˆˆˆˆˆˆˆ

        // Criando os assets no PRELOAD (Não aparece no jogo ainda, só quando colocar no create)
            this.load.image('coco', 'Assets/objetos/coco.jpeg');
            this.load.image('casa', 'Assets/objetos/casa.png');
            this.load.image('fundo', 'Assets/mapa_exportado.png');
            this.load.image('Arvore1', 'Assets/objetos/arvore1.png');
            this.load.image('Arvore2', 'Assets/objetos/arvore2.png');
            this.load.image('Arvore3', 'Assets/objetos/arvore3.png');
            this.load.image('Arvore4', 'Assets/objetos/arvore4.png');

      }
            create() {
                
        //Quando apertamos o botão do MENU jogar, ele transita para o jogo normal, e esse fadeIn abaixo coloca um gradiente para não ser uma transição dura
        this.cameras.main.fadeIn(1000, 0, 0, 0);

                // Criação do ícone do Coco para teste. Futuramente se tornará um cadeado para simbolizar zonas trancadas que o player não tem acesso ainda
        this.coco = this.add.image(400, 670, 'coco').setScale(0.1).setDepth(1);
        this.coco.setVisible(false); // Torna o item invisível


        // Objetos do mapa + mapa
        //this.obstaculos = this.physics.add.staticGroup(); FISICA

        this.add.image(742, 400, 'fundo').setScale(0.589).setDepth(0); 
        // Define a profundidade do fundo para que fique atrás de todos os outros objetos

        //Obstáculos
        this.obstaculos = this.physics.add.staticGroup();

        // Funções dos obstáculos, para não precisar ficar repetindo código, apenas chamar o nome da função "criarCasa(), x, y" <- coloca uma casa
        function criarCasa(cena, x, y) {
            var casa = cena.obstaculos.create(x, y, 'casa').setScale(0.589);
            casa.body.setSize(50, 50); 
            casa.body.setOffset(40, 40);
        }

       function criarArvore(cena, x, y) {
            var arvore = cena.obstaculos.create(x, y, 'Arvore1').setScale(1.0);
            arvore.body.setSize(10, 10); 
            arvore.body.setOffset(20, 50);
            arvore.setDepth(5000); // Define a profundidade da árvore para que fique atrás do personagem
        }
        function criarArvore2(cena, x, y) {
            var arvore = cena.obstaculos.create(x, y, 'Arvore2').setScale(1.0);
            arvore.body.setSize(10, 10); 
            arvore.body.setOffset(20, 50);
            arvore.setDepth(5000);
        }
        function criarArvore3(cena, x, y) {
            var arvore = cena.obstaculos.create(x, y, 'Arvore3').setScale(1.0);
            arvore.body.setSize(10, 10); 
            arvore.body.setOffset(20, 50);
            arvore.setDepth(5000);
        }
        function criarArvore4(cena, x, y) {
            var arvore = cena.obstaculos.create(x, y, 'Arvore4').setScale(1.0);
            arvore.body.setSize(10, 10); 
            arvore.body.setOffset(20, 50);
            arvore.setDepth(5000);
        }


        
       

      

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


        //Geração de ícones quando se aproxima de um certo local
        //Coco teste
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