export default class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        const W = this.scale.width;
        const H = this.scale.height;

        // Loading bar
        this.add.rectangle(W / 2, H / 2, 400, 6, 0x222244);
        const barra = this.add.rectangle(W / 2 - 200, H / 2, 0, 6, 0x9966ff).setOrigin(0, 0.5);
        this.load.on('progress', (p) => { barra.width = 400 * p; });

        // Estrutura: { skin_key, pasta_genero, pasta_cor, sufixo_cor }
        const personagens = [
            { skin: 'man_whi',   pasta: 'MAN/WHITE',   cor: 'whi' },
            { skin: 'man_bla',   pasta: 'MAN/BLACK',   cor: 'bla' },
            { skin: 'woman_whi', pasta: 'WOMAN/WHITE', cor: 'whi' },
            { skin: 'woman_bla', pasta: 'WOMAN/BLACK', cor: 'bla' },
        ];

        const genero = { man_whi: 'man', man_bla: 'man', woman_whi: 'woman', woman_bla: 'woman' };

        const anims = ['front_idl', 'front_walk', 'back_idl', 'back_walk', 'side_walk'];

        personagens.forEach(({ skin, pasta, cor }) => {
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
        this.scene.start('MenuPrincipal');
    }
}