import type { Translations } from './en';

const pt: Translations = {
  common: {
    newGame: 'Novo jogo', restart: 'Reiniciar', continue: 'Continuar', pause: 'Pausa', paused: 'Em pausa', resume: 'Retomar',
    score: 'Pontos', highScore: 'Recorde', gameOver: 'Fim de jogo', victory: 'Vitória', back: 'Voltar', backHome: '← Início',
    play: 'Jogar', enter: 'Jogar →', loading: 'CARREGANDO', clickToStart: 'Clique para iniciar',
    easy: 'Fácil', medium: 'Médio', hard: 'Difícil', beginner: 'Iniciante', intermediate: 'Intermediário', advanced: 'Avançado',
    level: 'Nível', lines: 'Linhas', time: 'Tempo', steps: 'Passos', moves: 'Jogadas', next: 'Próximo',
    hint: 'Dica', shuffle: 'Embaralhar', rules: 'Regras', closeRules: 'Fechar regras',
    flagMode: 'Bandeira', flagging: 'Marcando', fill: 'Preencher', marking: 'Marcando',
    seconds: 's', undo: 'Desfazer', nextLevel: 'Próximo', timeSeconds: 'Tempo(s)',
  },
  cat: {
    all: 'Todos', puzzle: 'Puzzle', arcade: 'Arcade', strategy: 'Estratégia', casual: 'Casual',
    puzzleDesc: 'Quebra-cabeças e lógica', arcadeDesc: 'Reflexos e ação',
    strategyDesc: 'Pensamento e planejamento', casualDesc: 'Relaxamento e diversão', count: '{n} jogos',
  },
  home: { subtitle: '{n} jogos de navegador · Jogue instantaneamente', clickToStart: 'Clique para iniciar', enter: 'Jogar →' },
  lb: {
    title: '🏆 Ranking', btn: '🏆 Ranking', player: 'Jogador', enterName: 'Seu nome...', submit: 'Enviar {score}',
    rank: '🎉 #{rank}/{total}', loading: 'Carregando...', noRecords: 'Seja o primeiro no ranking!', refresh: '🔄 Atualizar',
  },
  game2048: { title: '2048', desc: 'Deslize e combine números', energyLevel: 'NÍVEL DE ENERGIA', coreUnlocked: 'Núcleo desbloqueado', systemOverload: 'Sobrecarga', keepPlaying: 'Continuar', systemReboot: 'Reiniciar', finalEnergy: 'Energia final: {score}', touch: 'WASD / Deslizar' },
  tetris: { title: 'Tetris', desc: 'Empilhe blocos — quanto mais rápido, melhor', drop: '⏬ Soltar', controls: '← → Mover | ↑ Girar | ↓ Acelerar | Espaço Soltar | P Pausa', startTip: 'Setas / Controles táteis' },
  snake: { title: 'Cobra', desc: 'Guie a cobra, coma e cresça', dataLost: 'Conexão perdida', startHint: 'Setas / Deslizar', controls: 'Setas / WASD' },
  pacman: { title: 'Pac-Man', desc: 'Desvie dos fantasmas, coma todas as pastilhas', levelN: 'Nível {n}', pelletsLeft: 'Pastilhas restantes', levelComplete: 'Nível completo!', nextLevelSoon: 'Próximo nível...', lives: 'Vidas', controls: '← → ↑ ↓ / WASD / Deslizar', ruleTarget: 'Coma todas as pastilhas', rulePowerup: 'Super pastilha: Fantasmas ficam azuis', ruleGhosts: '4 fantasmas com comportamentos diferentes', ruleFruit: 'Frutas: Bônus surgem', ruleSpeed: 'Fantasmas aceleram a cada nível' },
  minesweeper: { title: 'Campo minado', desc: 'Descubra casas, encontre as minas', mineHit: 'Mina!', cleared: 'Área limpa!', again: 'Jogar de novo', flagBtn: '⚠ Bandeira', desktopHint: 'Clique esq. revelar | Clique dir. bandeira', mobileHint: 'Toque para revelar · Segure para marcar' },
  gomoku: { title: 'Gomoku', desc: 'Jogue contra a IA — cinco em linha vence', again: 'Jogar de novo', undoMove: 'Desfazer', thinking: 'Oponente pensando...', youBlack: 'Preto (Você)', wins: 'Vitórias', winMsg: 'Vitória!', loseMsg: 'Derrota', drawMsg: 'Empate', hint: 'Pretas primeiro · Clique para colocar' },
  sudoku: { title: 'Sudoku', desc: 'Preencha a grade 9×9', complete: 'Resolvido!', again: 'Jogar de novo', check: 'Verificar', hint: 'Preencha 9×9 com dígitos 1–9', erase: 'Apagar', noteMode: 'Notas', notesOn: 'Notas ON', notesOff: 'Notas OFF' },
  memory: { title: 'Memória', desc: 'Vire cartas e encontre os pares', steps: 'Jogadas', complete: 'Todos encontrados!', result: 'Resolvido em {moves} jogadas, {time}s', reset: 'Reiniciar', hint: 'Vire cartas para encontrar os pares' },
  flappy: { title: 'Flappy Bird', desc: 'Toque para voar, desvie dos canos', scoreN: 'Pontos: {n}', tapToStart: 'Toque para começar', restartHint: 'Clique ou Espaço para reiniciar', deepsea: 'Mergulho profundo', swimHint: 'Nade para cima, desvie dos corais', controls: 'Espaço / Toque para subir' },
  colorFind: { title: 'Teste de cores', desc: 'Encontre o tom diferente', challengeOver: 'Desafio encerrado', timeUp: 'Tempo esgotado!', reachedLevel: 'Nível {n} alcançado', finalScore: 'Pontuação: {n}', again: 'Jogar de novo', levelLabel: 'Nível', hint: 'Encontre a casa de cor diferente' },
  breakout: { title: 'Breakout', desc: 'Controle a raquete, quebre os blocos', missionComplete: 'Missão cumprida!', shipDown: 'Nave destruída', scoreN: 'Pontos: {n}', launch: 'Lançar!', again: 'Jogar de novo', controls: 'Mouse / Toque para mover', hint: 'Controle a nave, destrua os blocos' },
  invaders: { title: 'Space Invaders', desc: 'Shooter retrô — defenda a Terra', scoreN: 'Pontos: {n}', start: 'Iniciar', waveCleared: 'Onda {n} eliminada!', nextWave: 'Próxima onda', nextWaveFaster: 'A próxima é mais rápida!', controls: 'Mover | Espaço Atirar', ruleAliens: 'Aliens: formação 5×8', ruleShooting: 'Tiro: Espaço ou toque', ruleLives: 'Vidas: 3 vidas', ruleGoal: 'Objetivo: Destruir todos os invasores', ruleTip: 'Dica: Mire nas bordas primeiro', ruleUFO: 'OVNI vermelho aleatório — 100 pontos bônus' },
  bubbleShooter: { title: 'Bolhas', desc: 'Mire e atire — 3 cores iguais', caveCleared: 'Caverna limpa!', defenseDown: 'Defesa caiu!', restartHint: 'Clique para reiniciar', hint: 'Mire e atire · 3+ mesma cor · 5 erros = empurrar' },
  wordle: { title: 'Wordle', desc: 'Adivinhe a palavra de 5 letras em 6 tentativas', won: '🎉 Parabéns!', lost: 'A palavra era: {word}', again: 'Jogar de novo', notInList: 'Não está na lista', tooShort: 'Precisa de 5 letras', hint: 'Adivinhe a palavra de 5 letras em 6 tentativas' },
  match3: { title: 'Gemas', desc: 'Troque gemas — combine 3 para pontuar', movesLeft: 'Jogadas restantes', gameOverTitle: 'Fim de jogo', finalScore: 'Energia final: {n}', again: 'Jogar de novo', hint: 'Troque gemas adjacentes · 3 em linha' },
  solitaire: { title: 'Paciência', desc: 'Jogo de cartas clássico', won: 'Você venceu!', again: 'Jogar de novo', autoComplete: 'Auto-completar' },
  connect: { title: 'Conectar', desc: 'Conecte peças iguais — limpe o tabuleiro', timeUp: 'Tempo esgotado!', allCleared: 'Tudo limpo!', again: 'Jogar de novo', finalScore: 'Pontuação final {n}', scoreTime: 'Pontos {score} · Tempo {time}s', ruleTitle: 'Conectar peças', ruleGoal: 'Elimine tudo em 120 segundos', ruleConnect: 'Conecte peças iguais (máx. 2 curvas)', ruleTime: 'Cada par +3 segundos', ruleShuffle: 'Embaralhar: Reorganiza as peças', ruleHint: 'Dica: Destaca um par possível', hint: 'Toque duas peças iguais · Máx. 2 curvas' },
  sokoban: { title: 'Sokoban', desc: 'Empurre caixas para os alvos — 50 fases', stageN: 'Fase {n}', complete: 'Fase completa!', allComplete: 'Todas completas!', next: 'Próxima', prev: 'Anterior', undoMove: 'Desfazer', resetLevel: 'Reiniciar', stepsLabel: 'Passos', hint: 'Empurre caixas · Setas / Deslizar' },
  nonogram: { title: 'Nonograma', desc: 'Use as dicas para revelar pixel art', solved: 'Circuito conectado!', newRecord: 'Novo recorde!', bestTime: 'Melhor: {t}s', nextPuzzle: 'Próximo', ruleTitle: 'Regras do Nonograma', ruleGoal: 'Revele o padrão oculto', ruleNumbers: 'Os números indicam blocos consecutivos', ruleFill: 'Clique esq. para preencher', ruleMark: 'Clique dir. para marcar vazio', ruleMode: 'Alterne entre preencher e marcar', ruleTip: 'Comece pelas linhas com números maiores', ruleRecord: 'Seu melhor tempo é registrado', hintText: 'Clique para preencher · Clique dir. para marcar X', cellLabel: 'Linha {r} Col {c}' },
  microEmpire: { title: "Micro Empire", desc: "Build a kingdom, manage resources, grow from wilderness to empire" },
};

export default pt;
