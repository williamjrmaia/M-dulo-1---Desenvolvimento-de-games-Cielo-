# Inteli - Instituto de Tecnologia e Liderança 

<p align="center">
<a href= "https://www.inteli.edu.br/"><img src="documents/assets/logointeli.png" alt="Inteli - Instituto de Tecnologia e Liderança" border="0" width=40% height=40%></a>
</p>

<br>

# Cielo Verso

## O Octeto Fantástico

## 👨‍🎓 Integrantes: 
- <a href="https://www.linkedin.com/in/arthur-proen%C3%A7a-87522b355/">Arthur Augusto Proença Gonçalves</a>
- <a href="https://www.linkedin.com/in/eric-ferraz-52069b3b8/">Eric Pimentel Ferraz</a>
- <a href="https://www.linkedin.com/in/felipe-menossi-estrada/">Felipe Menossi Estrada</a> 
- <a href="https://www.linkedin.com/in/jorge-nader-3b3b94400/">Jorge Nader</a> 
- <a href="https://www.linkedin.com/in/j%C3%BAlia-silva-sales-a7b3602a6/">Júlia Silva Sales</a>
- <a href="https://www.linkedin.com/in/rafael-succi/">Rafael Sleumer Hamacek Succi</a> 
- <a href="https://www.linkedin.com/in/thain%C3%A1-lima-33b7a7288/">Thainá Camilly Alves de Lima</a>
- <a href="https://www.linkedin.com/in/william-maia-95785b323/">William Junior dos Santos</a>

## 👩‍🏫 Professores:
### Orientador(a) 
- <a href="https://www.linkedin.com/in/vanunes/">Vanessa Tavares Nunes</a>
### Instrutores
- <a href="https://www.linkedin.com/in/anacristinadossantos/">Ana Cristina dos Santos</a>
- <a href="https://www.linkedin.com/in/cristiano-benites-ph-d-687647a8/">Cristiano da Silva Benites</a> 
- <a href="https://www.linkedin.com/in/fabiana-martins-de-oliveira-8993b0b2/">Fabiana Martins de Oliveira</a> 
- <a href="https://www.linkedin.com/in/geraldo-magela-severino-vasconcelos-22b1b220/">Geraldo Magela Severino Vasconcelos</a>
- <a href="https://www.linkedin.com/in/pedroteberga/">Pedro Marins Freire Teberga</a> 

## 📜 Descrição

Cielo Verso é um jogo educacional RPG 2D com visão top-down, desenvolvido em pixel art, com o objetivo de capacitar os Gerentes de Negócios da Cielo por meio de uma experiência gamificada de treinamento comercial. O projeto parte de um gap identificado pela Cielo: a capacitação dos Gerentes de Negócios varia muito de região para região. Para enfrentá-lo, transforma conceitos técnicos de vendas, produtos e negociação em mecânicas interativas, padronizando o aprendizado de forma acessível e envolvente para toda a força de vendas nacional.

O jogador assume o papel de um Gerente de Negócios em busca de especialização, guiado por Cielita — mentora, tutora e fio condutor de toda a jornada. É ela quem apresenta o universo do jogo, orienta o uso das mecânicas e acompanha o jogador ao longo de quatro regiões temáticas. Cada região representa um pilar do conhecimento comercial da Cielo: o Quebra-Gelo introduz cultura corporativa, proposta de valor e superação de objeções; a Vila do Varejo aprofunda o portfólio de produtos e soluções; a Floresta dos Proveitos desenvolve a argumentação de benefícios e diferenciais competitivos; e a Cidade Cielo coloca todo o aprendizado à prova em negociações estratégicas reais.

A mecânica central do jogo é baseada em um sistema de cartas de negociação, organizado em cinco etapas do funil de vendas: abordagem, sondagem, demonstração, negociação e fechamento. O jogador seleciona as cartas mais adequadas ao perfil de cada cliente, gerenciando uma barra de satisfação que reage em tempo real às suas escolhas. Acertar na abordagem eleva a satisfação do cliente; escolhas inadequadas a reduzem, exigindo novas estratégias para recuperar a negociação.

O jogo também celebra a diversidade brasileira: os personagens jogáveis e os NPCs representam diferentes etnias, gêneros e faixas etárias, enquanto os cenários são inspirados nas regiões geográficas do país — do frio do Sul ao dinamismo do Sudeste e à biodiversidade do Norte e Nordeste.

Desenvolvido com Phaser 3 e executado diretamente no navegador Google Chrome, o Cielo Verso é acessível em desktop e mobile, sem necessidade de instalação. No fim, o jogo cumpre um papel prático: nivelar o conhecimento comercial da força de vendas, independentemente de onde ela esteja.

🎮 [Acesse o jogo aqui](https://octetofantastico.itch.io/cielo-verso)
🔑 Senha: `cieloverso`



## 📁 Estrutura de pastas

Dentre os arquivos e pastas presentes na raiz do projeto, definem-se:

- **assets**: aqui estão todos os recursos visuais e sonoros do jogo, organizados nas seguintes subpastas:
  - **Ambientacao**: sprites e tiles utilizados na ambientação dos cenários.
  - **Audio**: trilha sonora e efeitos de som.
  - **Cartas**: imagens das cartas utilizadas no jogo.
  - **CenarioCasa**: assets visuais do cenário da casa.
  - **CidadeCielo**: assets visuais da Cidade Cielo.
  - **Icones**: ícones utilizados na interface do usuário.
  - **Insignias**: imagens de insígnias e conquistas do jogador.
  - **MapaGelo**: assets visuais do mapa de gelo.
  - **menu**: elementos visuais utilizados nas telas de menu.
  - **NPC**: sprites e animações dos personagens não-jogáveis.
  - **objetos**: assets dos objetos interativos presentes no jogo.
  - **PLAYER**: sprites e animações do personagem jogável.
  - **PraiaDosProveitos**: assets visuais da Praia dos Proveitos.
  - **VilaDoVarejo**: assets visuais da Vila do Varejo.

- **documents**: aqui estão todos os documentos do projeto, incluindo:
  - **assets**: imagens e recursos utilizados na documentação.
  - **other**: documentos complementares ao GDD.
  - **gdd.md**: o Game Design Document (GDD) principal do jogo.

- **src**: todo o código-fonte do jogo, organizado em:
  - **Cenas**: arquivos responsáveis por cada cena do jogo.
  - **Classes**: definições de classes e lógica central do jogo.
  > Para descrição detalhada de cada cena e classe, consulte o [GDD](documents/gdd.md).
  - **main.js**: ponto de entrada da aplicação.

- **.gitlab-ci.yml**: arquivo de configuração do pipeline de CI/CD.

- **index.html**: página HTML principal que inicializa o jogo no navegador.

- **README.md**: arquivo que serve como guia e explicação geral sobre o projeto (o mesmo que você está lendo agora).

## 🔧 Como executar o código

### Pré-requisitos

- Navegador **Google Chrome**
- Extensão **Live Server** instalada no Visual Studio Code
  - Para instalar: abra o VSCode → aba de Extensões (`Ctrl+Shift+X`) → pesquise por "Live Server" → instale a extensão de **Ritwick Dey**

### Passo a passo

1. Clone o repositório:
   ```bash
   git clone https://git.inteli.edu.br/graduacao/2026-1a/t28/g04.git
   ```
2. Abra a pasta do projeto no Visual Studio Code
3. Localize o arquivo `index.html` na raiz do projeto
4. Clique com o botão direito sobre o `index.html` e selecione **"Open with Live Server"**
5. O jogo abrirá automaticamente no navegador Google Chrome


## 🗃 Histórico de lançamentos

* 0.5.0 - 10/04/2025
    * Revisão e refinamentos finais do MVP
* 0.4.0 - 27/03/2025
    * Entrega do MVP completo com todas as regiões jogáveis
* 0.3.0 - 13/03/2025
    * Implementação do sistema de negociação por cartas com 5 fases
    * Implementação do sistema de diálogo com efeito typewriter
    * Implementação da tela de seleção de personagem com 4 avatares
    * Implementação das transições de cena com fade
* 0.2.0 - 27/02/2025
    * Integração de duas cenas funcionando
    * Implementação do sistema de colisão e hitboxes
    * Adição da NPC Cielita com interação por proximidade
    * Definição dos mapas e regiões temáticas do jogo
* 0.1.0 - 13/02/2025
    * Movimentação do personagem com teclas WASD
    * Sistema de câmera com zoom dinâmico
    * Animações do personagem principal
    * Versão inicial do mapa

## 📋 Licença/License

<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"><p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/"><a property="dct:title" rel="cc:attributionURL" href="https://git.inteli.edu.br/graduacao/2026-1a/t28/g04">Cielo Verso</a> by <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https://git.inteli.edu.br/graduacao/2026-1a/t28/g04">Inteli, Arthur Augusto Proença Gonçalves, Eric Pimentel Ferraz, Felipe Menossi Estrada, Jorge Nader, Júlia Silva Sales, Rafael Sleumer Hamacek Succi, Thainá Camilly Alves de Lima, William Junior dos Santos</a> is licensed under <a href="http://creativecommons.org/licenses/by/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">Attribution 4.0 International</a>.</p>


