var config = {
        type: Phaser.AUTO,
        width: 1500,
        height: 800,
        backgroundColor: '#000000',
       

        physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Jogo top-down não tem gravidade
            debug: false // false tira a hitbox, true mostra a hitbox
        }
     },
        scene: [MenuPrincipal, CenaJogo, CenaConfig, CenaCasa, MundoCasa]
        
    };


var game = new Phaser.Game(config);


