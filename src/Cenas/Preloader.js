export default class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        const W = this.scale.width; //1500
        const H = this.scale.height; //800

        //Em inglês pois foi o padrao usado durante a criação dos sprites
        const personagens = [//cria uma biblioteca das skins oferecidas
            { skin: 'man_whi',   pasta: 'MAN/WHITE',   cor: 'whi' },
            { skin: 'man_bla',   pasta: 'MAN/BLACK',   cor: 'bla' },
            { skin: 'woman_whi', pasta: 'WOMAN/WHITE', cor: 'whi' },
            { skin: 'woman_bla', pasta: 'WOMAN/BLACK', cor: 'bla' },
        ];

        const genero = { man_whi: 'man', man_bla: 'man', woman_whi: 'woman', woman_bla: 'woman' };

        const anims = ['front_idl', 'front_walk', 'back_idl', 'back_walk', 'side_walk'];

        personagens.forEach(({ skin, pasta, cor }) => {//transforma o comando de loadar spritesheet
                                                       //em um comando modular, garantindo que seja carregado o personagem certo
            const gen = genero[skin];
            anims.forEach(anim => {
                this.load.spritesheet(
                    `${skin}_${anim}`,
                    `assets/PLAYER/${pasta}/spr_player_${gen}_${anim}_${cor}.png`,
                    { frameWidth: 64, frameHeight: 64 }
                );
            });
        });
    }

    create() {
        this.scene.start('MenuPrincipal');//começa o jogo
    }
}