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