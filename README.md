# Pocket Billiards Pro

Crie um aplicativo web mobile-first, instalável como PWA, chamado Sinuca.

O aplicativo será utilizado por amigos para registrar partidas de uma modalidade de sinuca baseada exclusivamente na pontuação das bolas numeradas de 1 a 15.

IMPORTANTE: nesta primeira versão existe APENAS UMA modalidade de jogo.

Não implementar Bola 8, Bola 9, Sinuca Brasileira oficial, 14x1 ou qualquer outra modalidade.

A modalidade deve ser chamada:

Sinuca por Pontos — 1 a 15

OBJETIVO DO APLICATIVO

Criar um aplicativo extremamente simples, rápido e visualmente atrativo para marcar partidas de sinuca.

O usuário deve conseguir:

cadastrar jogadores;

criar partidas individuais;

criar partidas em duplas;

jogar partidas com 2, 3 ou 4 jogadores;

registrar bolas encaçapadas;

registrar faltas;

visualizar pontuação em tempo real;

visualizar as bolas ainda disponíveis na mesa;

visualizar o jogador da vez;

encerrar automaticamente a partida quando alguém atingir a pontuação necessária;

salvar tudo localmente usando IndexedDB;

consultar histórico;

consultar rankings;

instalar o aplicativo como PWA;

utilizar o aplicativo completamente offline.

Não criar login ou cadastro online nesta primeira versão.

REGRA PRINCIPAL DA MODALIDADE

Existem 15 bolas numeradas:

1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 e 15.

Cada bola vale exatamente o valor do seu número.

Exemplo:

Bola 10 = 10 pontos.

Bola 7 = 7 pontos.

Se um jogador encaçapar as bolas 10 e 7:

10 + 7 = 17 pontos.

O aplicativo deve somar automaticamente os valores das bolas.

A soma de todas as bolas disponíveis inicialmente é:

1 + 2 + 3 + ... + 15 = 120 pontos.

BOLA BRANCA

A bola branca é a bola principal/tacadeira.

Ela:

não possui valor de pontuação;

não deve ser contabilizada como bola pontuada;

deve aparecer visualmente na interface como a bola branca/tacadeira;

não pode ser selecionada como uma bola que gera pontos.

Faltas envolvendo a bola branca devem ser registradas através do sistema de faltas.

BOLAS ENCAÇAPADAS

Cada bola numerada pode ser encaçapada e contabilizada uma vez na partida.

Quando uma bola for registrada como encaçapada:

remover visualmente essa bola das bolas disponíveis;

adicionar o valor da bola à pontuação do jogador;

incrementar o contador de bolas encaçapadas;

registrar o evento no histórico da partida;

executar animação de pontuação.

Exemplo:

Jogador encaçapa a bola 10.

Pontuação:

0 → 10

A bola 10 deixa de aparecer entre as bolas disponíveis.

META DE PONTUAÇÃO — PARTIDAS INDIVIDUAIS

A quantidade de jogadores determina a pontuação necessária para vencer.

2 jogadores

Meta:

60 pontos

O primeiro jogador que atingir 60 pontos ou mais vence.

3 jogadores

Meta:

40 pontos

O primeiro jogador que atingir 40 pontos ou mais vence.

4 jogadores

Meta:

30 pontos

O primeiro jogador que atingir 30 pontos ou mais vence.

IMPORTANTE:

A vitória ocorre quando o jogador atingir OU ultrapassar a meta.

Exemplo:

Com 2 jogadores:

Jogador possui 58 pontos.

Encaçapa a bola 5.

Resultado:

63 pontos.

O jogador vence imediatamente.

Não é necessário atingir exatamente 60.

PARTIDAS EM DUPLAS

Permitir partidas entre duas duplas.

Cada jogador deve possuir sua própria pontuação individual.

Exemplo:

Dupla A:

João = 31
Marcos = 28

Total da dupla = 59

Dupla B:

Carlos = 25
Pedro = 34

Total da dupla = 59

A partida ainda não terminou.

Se João encaçapar a bola 2:

João = 33
Marcos = 28

Total da dupla A = 61.

A dupla A vence imediatamente.

REGRA:

Em partidas de duplas, a soma das pontuações dos dois jogadores da dupla deve atingir ou ultrapassar 60 pontos para vencer.

A interface deve destacar claramente tanto a pontuação individual quanto a pontuação total da dupla.

Exemplo:

JOÃO + MARCOS

João: 33
Marcos: 28

TOTAL: 61

CONTROLE DE TURNOS

A partida possui um jogador atual.

Destacar visualmente quem está jogando.

Depois de uma jogada normal, o aplicativo deve seguir para o próximo jogador conforme a lógica configurada para a partida.

O usuário deve ter acesso a:

Não encaçapou

para registrar uma tentativa sem pontuação.

O sistema deve registrar esse evento no histórico.

REGISTRO DE BOLAS

Na tela principal da partida, mostrar todas as bolas ainda disponíveis.

As bolas devem ser grandes e fáceis de tocar.

Organizar aproximadamente assim:

1 2 3 4 5

6 7 8 9 10

11 12 13 14 15

A representação deve utilizar bolas de sinuca visuais, com:

aparência tridimensional;

brilho;

sombra;

número central;

cores semelhantes às bolas reais.

A bola branca deve aparecer separadamente como tacadeira.

REGISTRO DE MÚLTIPLAS BOLAS

Permitir que o jogador selecione várias bolas durante uma mesma sequência.

Exemplo:

Jogador toca:

10

depois:

7

Mostrar temporariamente:

JOGADA ATUAL

10 + 7

TOTAL: +17

Depois o usuário confirma a jogada.

Ao confirmar:

adicionar 17 pontos ao jogador;

marcar 10 e 7 como encaçapadas;

registrar o turno;

atualizar o placar;

verificar condição de vitória.

Criar um botão:

Confirmar jogada

e um botão:

Cancelar

ANIMAÇÃO DE PONTUAÇÃO

Quando uma jogada for confirmada, criar uma animação agradável.

Exemplo:

+17

O número deve aparecer próximo ao jogador e subir suavemente.

Ao mesmo tempo:

38 → 55

A atualização do placar deve ter uma pequena animação.

Quando uma bola for encaçapada, ela pode executar uma animação visual simulando o movimento para uma caçapa.

Priorizar animações rápidas e agradáveis.

FALTAS

Criar um botão sempre acessível:

⚠️ FALTA

Existem duas formas de registrar a penalidade.

Opção padrão

7 pontos

Essa deve ser a opção padrão.

Ao registrar:

Falta → 7 pontos

O jogador beneficiado recebe 7 pontos.

Opção por bola

O usuário pode selecionar:

Valor da bola

Depois selecionar uma das bolas de 1 a 15.

Exemplo:

Falta → bola 10

Resultado:

+10 pontos

Outro exemplo:

Falta → bola 7

Resultado:

+7 pontos

INTERFACE DE FALTA

Ao tocar em FALTA, abrir um modal:

⚠️ Registrar falta

Penalidade:

● 7 pontos

○ Valor da bola

Se o usuário escolher "Valor da bola", mostrar as bolas:

1 2 3 4 5
6 7 8 9 10
11 12 13 14 15

Depois da seleção:

Falta — Bola 10

+10 pontos

Botão:

Confirmar falta

BOLA FORA DA MESA

Uma bola numerada que sair da mesa deve ser tratada como falta.

O usuário deve poder registrar:

FALTA

e escolher:

7 pontos;

valor da bola envolvida.

A interface não precisa ter uma categoria separada para bola fora da mesa nesta primeira versão.

QUEM RECEBE OS PONTOS DA FALTA

A penalidade deve ser adicionada à pontuação do jogador beneficiado pela falta.

A interface deve deixar claro quem receberá os pontos antes da confirmação.

Exemplo:

⚠️ Falta de João

Carlos recebe:

+7 pontos

ou:

+10 pontos

VERIFICAÇÃO DE VITÓRIA

Depois de cada evento que altera pontuação, verificar automaticamente se existe vencedor.

Eventos:

bolas encaçapadas;

falta de 7 pontos;

falta pelo valor de uma bola.

Individual

2 jogadores:

pontuação >= 60

3 jogadores:

pontuação >= 40

4 jogadores:

pontuação >= 30

Duplas

soma dos dois jogadores >= 60.

Quando a condição for atingida:

encerrar imediatamente a partida;

impedir novos lançamentos;

mostrar vencedor;

salvar a partida;

registrar horário de encerramento.

TELA DE RESULTADO

Ao finalizar:

🏆

JOÃO VENCEU!

63 pontos

Mostrar:

vencedor;

jogadores;

placar;

bolas encaçapadas;

faltas;

duração da partida;

modalidade;

data.

Para duplas:

🏆

JOÃO + MARCOS VENCERAM

João: 33
Marcos: 28

TOTAL: 61

HISTÓRICO

Salvar todas as partidas no IndexedDB.

A tela de histórico deve mostrar:

data;

horário;

modalidade;

jogadores;

placar;

vencedor.

Permitir abrir uma partida e visualizar seus detalhes.

O histórico deve preservar os eventos da partida.

Exemplo:

Turno 1
João
Bolas: 10, 7
+17

Turno 2
Carlos
Bola: 5
+5

Turno 3
João
Falta
+7 para Carlos

RANKINGS

Criar uma tela de rankings.

Possuir duas categorias:

Individual

Duplas

Rankings:

Pontos

Total de pontos acumulados.

Bolas

Quantidade total de bolas encaçapadas.

Partidas

Mostrar:

partidas disputadas;

vitórias;

derrotas;

aproveitamento.

Ordenar automaticamente do melhor para o pior.

ESTATÍSTICAS DO JOGADOR

Ao abrir um jogador, mostrar:

partidas;

vitórias;

derrotas;

aproveitamento;

pontos acumulados;

média de pontos por partida;

bolas encaçapadas;

média de bolas por partida;

maior pontuação em uma partida.

Para duplas, oferecer estatísticas equivalentes.

INDEXEDDB

Utilizar IndexedDB como banco de dados local.

Pode utilizar Dexie para facilitar a implementação.

Criar entidades/conceitos para:

players;

teams;

matches;

match_players;

match_turns;

match_events;

settings.

Cada ação importante da partida deve gerar um evento.

Exemplos:

match_started

ball_potted

turn_confirmed

miss

foul

foul_7_points

foul_ball_value

turn_changed

match_finished

OFFLINE FIRST

O aplicativo deve funcionar completamente sem internet.

Todas as funções essenciais devem funcionar offline:

criar jogadores;

criar duplas;

iniciar partida;

registrar bolas;

registrar faltas;

finalizar partida;

salvar histórico;

calcular rankings.

Não depender de servidor.

PWA

Transformar o aplicativo em PWA.

Implementar:

manifest;

service worker;

cache dos assets;

ícones;

instalação;

funcionamento offline.

O usuário deve poder instalar no celular e no desktop.

ARQUITETURA PARA FUTURA SINCRONIZAÇÃO

Não criar backend agora.

Porém, separar a persistência dos dados da interface.

Criar uma camada de acesso aos dados:

UI

↓

Game Engine

↓

Repository

↓

IndexedDB

No futuro será possível adicionar:

IndexedDB

↓

Sync Service

↓

API

↓

Banco online

Não implementar sincronização agora.

ARQUITETURA DO MOTOR DE JOGO

Não colocar toda a lógica diretamente nos componentes React.

Criar uma camada independente para as regras da modalidade.

Ela deve ser responsável por:

calcular pontos;

registrar bolas;

verificar bolas disponíveis;

registrar faltas;

calcular penalidades;

controlar turnos;

verificar vitória;

determinar meta da partida;

calcular pontuação de duplas.

Isso permitirá adicionar novas modalidades no futuro sem reescrever a aplicação.

DESIGN

O visual deve ser moderno, elegante e divertido.

Tema inspirado em sinuca:

verde de mesa de sinuca;

bolas coloridas;

madeira;

iluminação suave;

sombras;

profundidade;

placar grande.

Não exagerar no uso de texturas.

Priorizar uma interface limpa.

A tela da partida deve parecer um marcador eletrônico moderno de sinuca.

MOBILE FIRST

A principal utilização será em smartphones.

Os controles precisam ser grandes.

As bolas precisam ser fáceis de tocar.

Evitar menus complexos.

Evitar tabelas difíceis de usar no celular.

O fluxo principal deve ser:

Abrir

→ Nova partida

→ Escolher jogadores

→ Escolher individual ou dupla

→ Começar

→ Tocar nas bolas

→ Confirmar jogada

→ Placar atualizado

→ Vitória

→ Resultado salvo

TELA PRINCIPAL DA PARTIDA

Priorizar esta composição:

Placar dos jogadores

↓

Jogador atual

↓

Bola branca/tacadeira

↓

Bolas disponíveis

↓

Resumo da jogada atual

↓

Confirmar jogada

↓

Não encaçapou

↓

Falta

A informação mais importante da tela deve ser:

quem está jogando e quantos pontos possui.

CONFIGURAÇÕES

Criar configurações simples:

nome do aplicativo;

preferências visuais;

som ligado/desligado;

animações ligadas/desligadas;

confirmação antes de encerrar partida.

Não criar configurações complexas.

IMPORTANTE

Esta primeira versão deve implementar SOMENTE:

Sinuca por Pontos — 1 a 15

Regras:

bolas 1–15 possuem valor igual ao número;

total das bolas = 120 pontos;

bola branca é a tacadeira e não pontua;

2 jogadores → meta 60;

3 jogadores → meta 40;

4 jogadores → meta 30;

primeiro jogador que atingir ou ultrapassar a meta vence;

em duplas, soma dos dois jogadores >= 60 vence;

falta padrão = 7 pontos;

falta pode utilizar o valor de uma bola escolhida;

bola fora da mesa é falta;

salvar tudo localmente;

funcionamento offline;

PWA instalável.

Não adicionar outras regras ou modalidades nesta versão.

O aplicativo deve ser simples o suficiente para que qualquer pessoa consiga iniciar uma partida sem precisar ler um manual.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b6493406-77fb-4154-9344-bd8da2148a0b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
