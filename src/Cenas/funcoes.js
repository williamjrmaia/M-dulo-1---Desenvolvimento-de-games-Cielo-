export function atualizarMovimentoJogador(personagem, teclas) {
    let vel = 100;
    personagem.setVelocity(0);

    var nenhumaTeclaPrecionada = !teclas.left.isDown && !teclas.right.isDown && !teclas.up.isDown && !teclas.down.isDown;

    if (nenhumaTeclaPrecionada) {
        if (!personagem.anims.isPlaying || personagem.anims.currentAnim.key !== 'idleFrente') {
            personagem.play('idleFrente');
        }
    } else {
        // ESQUERDA
        if (teclas.left.isDown) {
            personagem.setVelocityX(-vel);
            personagem.play('lado', true);
            personagem.setFlipX(false);
        }
        // DIREITA
        else if (teclas.right.isDown) { // Usando 'else if' para evitar conflito se apertar duas teclas
            personagem.setVelocityX(vel);
            personagem.play('lado', true);
            personagem.setFlipX(true);
        }

        // CIMA
        if (teclas.up.isDown) {
            personagem.setVelocityY(-vel);
            personagem.play('costa', true);
        }
        // BAIXO
        else if (teclas.down.isDown) {
            personagem.setVelocityY(vel);
            personagem.play('andar', true);
        }
    }
}

export function criarAnimacoesJogador(cena) {
   
    if (!cena.anims.exists('andar')) {
        cena.anims.create({ key: 'andar', frames: cena.anims.generateFrameNumbers('Andando', { start: 0, end: 11 }), frameRate: 10, repeat: -1 });
        cena.anims.create({ key: 'idleFrente', frames: cena.anims.generateFrameNumbers('IdleFrente', { start: 0, end: 11 }), frameRate: 10, repeat: -1 });
        cena.anims.create({ key: 'lado', frames: cena.anims.generateFrameNumbers('Lado', { start: 0, end: 11 }), frameRate: 10, repeat: -1 });
        cena.anims.create({ key: 'costa', frames: cena.anims.generateFrameNumbers('Costa', { start: 0, end: 11 }), frameRate: 10, repeat: -1 });
        
    }
}

export function criarCasa(cena, x, y) {
    var casa = cena.obstaculos.create(x, y, 'casa').setScale(0.589);
    casa.body.setSize(50, 50); 
    casa.body.setOffset(40, 40);
}

export function criarArvore(cena, x, y) {
    var arvore = cena.obstaculos.create(x, y, 'Arvore1').setScale(1.0);
    arvore.body.setSize(10, 10); 
    arvore.body.setOffset(20, 50);
    arvore.setDepth(5000);
}

export function criarArvore2(cena, x, y) {
    var arvore = cena.obstaculos.create(x, y, 'Arvore2').setScale(1.0);
    arvore.body.setSize(10, 10); 
    arvore.body.setOffset(20, 50);
    arvore.setDepth(5000);
}

export function criarArvore3(cena, x, y) {
    var arvore = cena.obstaculos.create(x, y, 'Arvore3').setScale(1.0);
    arvore.body.setSize(10, 10); 
    arvore.body.setOffset(20, 50);
    arvore.setDepth(5000);
}

export function criarArvore4(cena, x, y) {
    var arvore = cena.obstaculos.create(x, y, 'Arvore4').setScale(1.0);
    arvore.body.setSize(10, 10); 
    arvore.body.setOffset(20, 50);
    arvore.setDepth(5000);
}