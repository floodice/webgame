import type { Translations } from './en';

const es: Translations = {
  common: {
    newGame: 'Nueva partida', restart: 'Reiniciar', continue: 'Continuar', pause: 'Pausa', paused: 'En pausa', resume: 'Reanudar',
    score: 'Puntos', highScore: 'Récord', gameOver: 'Fin del juego', victory: 'Victoria', back: 'Atrás', backHome: '← Inicio',
    play: 'Jugar', enter: 'Jugar →', loading: 'CARGANDO', clickToStart: 'Haz clic para empezar',
    easy: 'Fácil', medium: 'Medio', hard: 'Difícil', beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado',
    level: 'Nivel', lines: 'Líneas', time: 'Tiempo', steps: 'Pasos', moves: 'Movimientos', next: 'Siguiente',
    hint: 'Pista', shuffle: 'Mezclar', rules: 'Reglas', closeRules: 'Cerrar reglas',
    flagMode: 'Bandera', flagging: 'Marcando', fill: 'Rellenar', marking: 'Marcando',
    seconds: 's', undo: 'Deshacer', nextLevel: 'Siguiente', timeSeconds: 'Tiempo(s)',
  },
  cat: {
    all: 'Todos', puzzle: 'Puzle', arcade: 'Arcade', strategy: 'Estrategia', casual: 'Casual',
    puzzleDesc: 'Rompecabezas y lógica', arcadeDesc: 'Reflejos rápidos y acción',
    strategyDesc: 'Pensamiento y planificación', casualDesc: 'Relajación y diversión', count: '{n} juegos',
  },
  home: { subtitle: '{n} juegos de navegador · Juega al instante', clickToStart: 'Haz clic para empezar', enter: 'Jugar →' },
  lb: {
    title: '🏆 Ranking', btn: '🏆 Ranking', player: 'Jugador', enterName: 'Tu nombre...', submit: 'Enviar {score}',
    rank: '🎉 Puesto #{rank}/{total}', loading: 'Cargando...', noRecords: '¡Sé el primero en el ranking!', refresh: '🔄 Actualizar',
  },
  game2048: { title: '2048', desc: 'Desliza y combina números', energyLevel: 'NIVEL ENERGÍA', coreUnlocked: 'Núcleo desbloqueado', systemOverload: 'Sobrecarga', keepPlaying: 'Continuar', systemReboot: 'Reiniciar', finalEnergy: 'Energía final: {score}', touch: 'WASD / Deslizar' },
  tetris: { title: 'Tetris', desc: 'Apila bloques — cuanto más rápido, mejor', drop: '⏬ Caer', controls: '← → Mover | ↑ Rotar | ↓ Acelerar | Espacio Caer | P Pausa', startTip: 'Flechas / Controles táctiles' },
  snake: { title: 'Serpiente', desc: 'Guía la serpiente, come y crece', dataLost: 'Conexión perdida', startHint: 'Flechas / Deslizar', controls: 'Flechas / WASD' },
  pacman: { title: 'Pac-Man', desc: 'Esquiva fantasmas, come todos los puntos', levelN: 'Nivel {n}', pelletsLeft: 'Puntos restantes', levelComplete: '¡Nivel completado!', nextLevelSoon: 'Siguiente nivel...', lives: 'Vidas', controls: '← → ↑ ↓ / WASD / Deslizar', ruleTarget: 'Come todos los puntos esquivando fantasmas', rulePowerup: 'Píldora: Los fantasmas se vuelven azules', ruleGhosts: '4 fantasmas con diferentes comportamientos', ruleFruit: 'Fruta: Aparecen bonificaciones', ruleSpeed: 'Velocidad: Los fantasmas aceleran cada nivel' },
  minesweeper: { title: 'Buscaminas', desc: 'Descubre casillas, encuentra las minas', mineHit: '¡Mina!', cleared: '¡Zona despejada!', again: 'Otra vez', flagBtn: '⚠ Bandera', desktopHint: 'Clic izq. revelar | Clic der. bandera', mobileHint: 'Toca para revelar · Mantén para marcar' },
  gomoku: { title: 'Gomoku', desc: 'Juega contra la IA — cinco en línea gana', again: 'Otra vez', undoMove: 'Deshacer', thinking: 'Oponente pensando...', youBlack: 'Negro (Tú)', wins: 'Victorias', winMsg: '¡Victoria!', loseMsg: 'Derrota', drawMsg: 'Empate', hint: 'Negras primero · Clic para colocar · Cinco en línea' },
  sudoku: { title: 'Sudoku', desc: 'Rellena la cuadrícula 9×9', complete: '¡Resuelto!', again: 'Otra vez', check: 'Comprobar', hint: 'Rellena 9×9 con dígitos 1–9', erase: 'Borrar', noteMode: 'Notas', notesOn: 'Notas ON', notesOff: 'Notas OFF' },
  memory: { title: 'Memoria', desc: 'Voltea cartas y encuentra parejas', steps: 'Pasos', complete: '¡Todo emparejado!', result: 'Resuelto en {moves} movimientos, {time}s', reset: 'Reiniciar', hint: 'Voltea cartas para encontrar parejas' },
  flappy: { title: 'Flappy Bird', desc: 'Toca para volar, esquiva tubos', scoreN: 'Puntos: {n}', tapToStart: 'Toca para empezar', restartHint: 'Clic o Espacio para reiniciar', deepsea: 'Inmersión profunda', swimHint: 'Nada arriba, esquiva corales', controls: 'Espacio / Toque para subir' },
  colorFind: { title: 'Test de color', desc: 'Encuentra el tono diferente', challengeOver: 'Reto terminado', timeUp: '¡Tiempo!', reachedLevel: 'Nivel {n} alcanzado', finalScore: 'Puntuación: {n}', again: 'Otra vez', levelLabel: 'Nivel', hint: 'Encuentra la casilla de color diferente' },
  breakout: { title: 'Breakout', desc: 'Controla la paleta, rompe bloques', missionComplete: '¡Misión cumplida!', shipDown: 'Nave destruida', scoreN: 'Puntos: {n}', launch: '¡Lanzar!', again: 'Otra vez', controls: 'Ratón / Toque para mover', hint: 'Controla la nave, destruye bloques' },
  invaders: { title: 'Space Invaders', desc: 'Shooter retro — defiende la Tierra', scoreN: 'Puntos: {n}', start: 'Iniciar', waveCleared: '¡Oleada {n} superada!', nextWave: 'Siguiente oleada', nextWaveFaster: '¡La siguiente es más rápida!', controls: 'Mover | Espacio Disparar', ruleAliens: 'Alienígenas: formación 5×8', ruleShooting: 'Disparo: Espacio o toque', ruleLives: 'Vidas: 3 vidas', ruleGoal: 'Objetivo: Destruir todos los invasores', ruleTip: 'Consejo: Elimina los de los bordes primero', ruleUFO: 'OVNI rojo aleatorio — 100 puntos extra' },
  bubbleShooter: { title: 'Burbujas', desc: 'Apunta y dispara — 3 del mismo color', caveCleared: '¡Cueva despejada!', defenseDown: '¡Defensa caída!', restartHint: 'Clic para reiniciar', hint: 'Apunta y dispara · 3+ del mismo color · 5 fallos = empujar' },
  wordle: { title: 'Wordle', desc: 'Adivina la palabra de 5 letras en 6 intentos', won: '🎉 ¡Felicidades!', lost: 'La palabra era: {word}', again: 'Otra vez', notInList: 'No está en la lista', tooShort: 'Faltan letras', hint: 'Adivina la palabra de 5 letras en 6 intentos' },
  match3: { title: 'Gemas', desc: 'Intercambia gemas — combina 3 para puntuar', movesLeft: 'Movimientos', gameOverTitle: 'Fin de la partida', finalScore: 'Energía final: {n}', again: 'Otra vez', hint: 'Intercambia gemas adyacentes · 3 en línea' },
  solitaire: { title: 'Solitario', desc: 'Juego de cartas clásico', won: '¡Has ganado!', again: 'Otra vez', autoComplete: 'Auto-completar' },
  connect: { title: 'Conectar', desc: 'Conecta fichas iguales — limpia el tablero', timeUp: '¡Tiempo!', allCleared: '¡Todo limpio!', again: 'Otra vez', finalScore: 'Puntuación final {n}', scoreTime: 'Puntos {score} · Tiempo {time}s', ruleTitle: 'Conectar fichas', ruleGoal: 'Elimina todas en 120 segundos', ruleConnect: 'Conecta fichas iguales con máximo 2 giros', ruleTime: 'Cada eliminación +3 segundos', ruleShuffle: 'Mezclar: Reordena las fichas', ruleHint: 'Pista: Resalta una pareja posible', hint: 'Toca dos fichas iguales · Máximo 2 giros' },
  sokoban: { title: 'Sokoban', desc: 'Empuja cajas a los objetivos — 50 niveles', stageN: 'Nivel {n}', complete: '¡Nivel completado!', allComplete: '¡Todos completados!', next: 'Siguiente', prev: 'Anterior', undoMove: 'Deshacer', resetLevel: 'Reiniciar', stepsLabel: 'Pasos', hint: 'Empuja cajas · Flechas / Deslizar' },
  nonogram: { title: 'Nonograma', desc: 'Descubre el dibujo con las pistas', solved: '¡Circuito conectado!', newRecord: '¡Nuevo récord!', bestTime: 'Mejor: {t}s', nextPuzzle: 'Siguiente', ruleTitle: 'Reglas del Nonograma', ruleGoal: 'Revela el patrón oculto', ruleNumbers: 'Los números indican bloques consecutivos', ruleFill: 'Clic izq. para rellenar', ruleMark: 'Clic der. para marcar vacías', ruleMode: 'Alterna entre rellenar y marcar', ruleTip: 'Empieza por las filas con números más grandes', ruleRecord: 'Se registra tu mejor tiempo', hintText: 'Clic para rellenar · Clic der. para marcar X', cellLabel: 'Fila {r} Col {c}' },
  microEmpire: { title: "Micro Empire", desc: "Build a kingdom, manage resources, grow from wilderness to empire" },
};

export default es;
