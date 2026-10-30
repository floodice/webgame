import type { Translations } from './en';

const fr: Translations = {
  common: {
    newGame: 'Nouvelle partie', restart: 'Recommencer', continue: 'Continuer', pause: 'Pause', paused: 'En pause', resume: 'Reprendre',
    score: 'Score', highScore: 'Record', gameOver: 'Partie terminée', victory: 'Victoire', back: 'Retour', backHome: '← Accueil',
    play: 'Jouer', enter: 'Jouer →', loading: 'CHARGEMENT', clickToStart: 'Cliquez pour commencer',
    easy: 'Facile', medium: 'Moyen', hard: 'Difficile', beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé',
    level: 'Niveau', lines: 'Lignes', time: 'Temps', steps: 'Pas', moves: 'Coups', next: 'Suivant',
    hint: 'Indice', shuffle: 'Mélanger', rules: 'Règles', closeRules: 'Fermer les règles',
    flagMode: 'Drapeau', flagging: 'Marquage', fill: 'Remplir', marking: 'Marquage',
    seconds: 's', undo: 'Annuler', nextLevel: 'Suivant', timeSeconds: 'Temps(s)',
  },
  cat: {
    all: 'Tous', puzzle: 'Réflexion', arcade: 'Arcade', strategy: 'Stratégie', casual: 'Détente',
    puzzleDesc: 'Casse-têtes et logique', arcadeDesc: 'Réflexes et action',
    strategyDesc: 'Réflexion et planification', casualDesc: 'Détente et plaisir', count: '{n} jeux',
  },
  home: { subtitle: '{n} jeux de navigateur · Jouez instantanément', clickToStart: 'Cliquez pour commencer', enter: 'Jouer →' },
  lb: {
    title: '🏆 Classement', btn: '🏆 Classement', player: 'Joueur', enterName: 'Votre nom...', submit: 'Soumettre {score}',
    rank: '🎉 #{rank}/{total}', loading: 'Chargement...', noRecords: 'Soyez le premier au classement !', refresh: '🔄 Rafraîchir',
  },
  game2048: { title: '2048', desc: 'Glissez et fusionnez les nombres', energyLevel: 'NIVEAU ÉNERGIE', coreUnlocked: 'Noyau déverrouillé', systemOverload: 'Surcharge', keepPlaying: 'Continuer', systemReboot: 'Redémarrer', finalEnergy: 'Énergie finale : {score}', touch: 'WASD / Glisser' },
  tetris: { title: 'Tetris', desc: 'Empilez les blocs — plus vite, mieux', drop: '⏬ Chute', controls: '← → Déplacer | ↑ Tourner | ↓ Accélérer | Espace Chute | P Pause', startTip: 'Flèches / Contrôles tactiles' },
  snake: { title: 'Serpent', desc: 'Guidez le serpent, mangez et grandissez', dataLost: 'Connexion perdue', startHint: 'Flèches / Glisser', controls: 'Flèches / WASD' },
  pacman: { title: 'Pac-Man', desc: 'Esquivez les fantômes, mangez les pastilles', levelN: 'Niveau {n}', pelletsLeft: 'Pastilles restantes', levelComplete: 'Niveau terminé !', nextLevelSoon: 'Niveau suivant...', lives: 'Vies', controls: '← → ↑ ↓ / WASD / Glisser', ruleTarget: 'Mangez toutes les pastilles', rulePowerup: 'Super pastille : Les fantômes deviennent bleus', ruleGhosts: '4 fantômes aux comportements différents', ruleFruit: 'Fruits : Des bonus apparaissent', ruleSpeed: 'Les fantômes accélèrent à chaque niveau' },
  minesweeper: { title: 'Démineur', desc: 'Découvrez les cases, trouvez les mines', mineHit: 'Mine !', cleared: 'Zone dégagée !', again: 'Rejouer', flagBtn: '⚠ Drapeau', desktopHint: 'Clic gauche révéler | Clic droit drapeau', mobileHint: 'Touchez pour révéler · Maintenez pour marquer' },
  gomoku: { title: 'Gomoku', desc: 'Jouez contre l\'IA — cinq alignés gagne', again: 'Rejouer', undoMove: 'Annuler', thinking: 'L\'adversaire réfléchit...', youBlack: 'Noir (Vous)', wins: 'Victoires', winMsg: 'Victoire !', loseMsg: 'Défaite', drawMsg: 'Match nul', hint: 'Noirs en premier · Cliquez pour placer' },
  sudoku: { title: 'Sudoku', desc: 'Remplissez la grille 9×9', complete: 'Résolu !', again: 'Rejouer', check: 'Vérifier', hint: 'Remplissez 9×9 avec les chiffres 1–9', erase: 'Effacer', noteMode: 'Notes', notesOn: 'Notes ON', notesOff: 'Notes OFF' },
  memory: { title: 'Mémoire', desc: 'Retournez les cartes et trouvez les paires', steps: 'Coups', complete: 'Tout trouvé !', result: 'Résolu en {moves} coups, {time}s', reset: 'Réinitialiser', hint: 'Retournez les cartes pour trouver les paires' },
  flappy: { title: 'Flappy Bird', desc: 'Touchez pour voler, esquivez les tuyaux', scoreN: 'Score : {n}', tapToStart: 'Touchez pour commencer', restartHint: 'Cliquez ou Espace pour recommencer', deepsea: 'Plongée profonde', swimHint: 'Nagez vers le haut, esquivez les coraux', controls: 'Espace / Toucher pour monter' },
  colorFind: { title: 'Test de couleurs', desc: 'Trouvez la nuance différente', challengeOver: 'Défi terminé', timeUp: 'Temps écoulé !', reachedLevel: 'Niveau {n} atteint', finalScore: 'Score final : {n}', again: 'Rejouer', levelLabel: 'Niveau', hint: 'Trouvez la case de couleur différente' },
  breakout: { title: 'Casse-briques', desc: 'Contrôlez la raquette, cassez les briques', missionComplete: 'Mission accomplie !', shipDown: 'Vaisseau détruit', scoreN: 'Score : {n}', launch: 'Lancer !', again: 'Rejouer', controls: 'Souris / Toucher pour déplacer', hint: 'Contrôlez le vaisseau, détruisez les blocs' },
  invaders: { title: 'Space Invaders', desc: 'Shooter rétro — défendez la Terre', scoreN: 'Score : {n}', start: 'Commencer', waveCleared: 'Vague {n} éliminée !', nextWave: 'Vague suivante', nextWaveFaster: 'La prochaine est plus rapide !', controls: 'Déplacer | Espace Tirer', ruleAliens: 'Aliens : formation 5×8', ruleShooting: 'Tir : Espace ou toucher', ruleLives: 'Vies : 3 vies', ruleGoal: 'Objectif : Détruire tous les envahisseurs', ruleTip: 'Astuce : Visez les bords en premier', ruleUFO: 'OVNI rouge aléatoire — 100 points bonus' },
  bubbleShooter: { title: 'Bulles', desc: 'Visez et tirez — 3 mêmes couleurs', caveCleared: 'Grotte nettoyée !', defenseDown: 'Défense tombée !', restartHint: 'Cliquez pour recommencer', hint: 'Visez et tirez · 3+ mêmes couleurs · 5 ratés = recul' },
  wordle: { title: 'Wordle', desc: 'Devinez le mot de 5 lettres en 6 essais', won: '🎉 Félicitations !', lost: 'Le mot était : {word}', again: 'Rejouer', notInList: 'Mot non reconnu', tooShort: 'Il faut 5 lettres', hint: 'Devinez le mot de 5 lettres en 6 essais' },
  match3: { title: 'Gemmes', desc: 'Échangez les gemmes — combinez 3 pour marquer', movesLeft: 'Coups restants', gameOverTitle: 'Partie terminée', finalScore: 'Énergie finale : {n}', again: 'Rejouer', hint: 'Échangez les gemmes adjacentes · 3 en ligne' },
  solitaire: { title: 'Solitaire', desc: 'Jeu de cartes classique', won: 'Vous avez gagné !', again: 'Rejouer', autoComplete: 'Auto-compléter' },
  connect: { title: 'Connexion', desc: 'Reliez les tuiles identiques', timeUp: 'Temps écoulé !', allCleared: 'Tout nettoyé !', again: 'Rejouer', finalScore: 'Score final {n}', scoreTime: 'Score {score} · Temps {time}s', ruleTitle: 'Connexion de tuiles', ruleGoal: 'Éliminez tout en 120 secondes', ruleConnect: 'Reliez 2 tuiles identiques (max 2 virages)', ruleTime: 'Chaque paire +3 secondes', ruleShuffle: 'Mélanger : Réorganise les tuiles', ruleHint: 'Indice : Met en surbrillance une paire', hint: 'Touchez deux tuiles identiques · Max 2 virages' },
  sokoban: { title: 'Sokoban', desc: 'Poussez les caisses vers les cibles — 50 niveaux', stageN: 'Niveau {n}', complete: 'Niveau terminé !', allComplete: 'Tous terminés !', next: 'Suivant', prev: 'Précédent', undoMove: 'Annuler', resetLevel: 'Réinitialiser', stepsLabel: 'Pas', hint: 'Poussez les caisses · Flèches / Glisser' },
  nonogram: { title: 'Nonogramme', desc: 'Révélez le dessin grâce aux indices', solved: 'Circuit connecté !', newRecord: 'Nouveau record !', bestTime: 'Meilleur : {t}s', nextPuzzle: 'Suivant', ruleTitle: 'Règles du Nonogramme', ruleGoal: 'Révélez le motif caché', ruleNumbers: 'Les nombres indiquent les blocs consécutifs', ruleFill: 'Clic gauche pour remplir', ruleMark: 'Clic droit pour marquer les cases vides', ruleMode: 'Alternez entre remplir et marquer', ruleTip: 'Commencez par les lignes avec les plus grands nombres', ruleRecord: 'Votre meilleur temps est enregistré', hintText: 'Cliquez pour remplir · Clic droit pour marquer X', cellLabel: 'Ligne {r} Col {c}' },
  microEmpire: { title: "Micro Empire", desc: "Build a kingdom, manage resources, grow from wilderness to empire" },
};

export default fr;
