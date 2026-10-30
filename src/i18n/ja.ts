import type { Translations } from './en';

const ja: Translations = {
  common: {
    newGame: 'ニューゲーム', restart: 'リスタート', continue: '続ける', pause: 'ポーズ', paused: '一時停止中', resume: '再開',
    score: 'スコア', highScore: 'ベスト', gameOver: 'ゲームオーバー', victory: '勝利', back: '戻る', backHome: '← ホーム',
    play: 'プレイ', enter: 'プレイ →', loading: '読込中', clickToStart: 'クリックで開始',
    easy: 'イージー', medium: 'ノーマル', hard: 'ハード', beginner: '初級', intermediate: '中級', advanced: '上級',
    level: 'レベル', lines: 'ライン', time: '時間', steps: 'ステップ', moves: '手数', next: '次へ',
    hint: 'ヒント', shuffle: 'シャッフル', rules: 'ルール', closeRules: 'ルールを閉じる',
    flagMode: 'フラグ', flagging: 'フラグ中', fill: '塗る', marking: 'マーク中',
    seconds: '秒', undo: '戻す', nextLevel: '次へ', timeSeconds: '時間(秒)',
  },
  cat: {
    all: 'すべて', puzzle: 'パズル', arcade: 'アーケード', strategy: 'ストラテジー', casual: 'カジュアル',
    puzzleDesc: '頭脳パズル＆ロジック', arcadeDesc: '反射神経＆アクション',
    strategyDesc: '思考＆戦略', casualDesc: 'リラックス＆楽しい', count: '{n}ゲーム',
  },
  home: { subtitle: '厳選ブラウザゲーム{n}本 · すぐプレイ', clickToStart: 'クリックで開始', enter: 'プレイ →' },
  lb: {
    title: '🏆 ランキング', btn: '🏆 ランキング', player: 'プレイヤー', enterName: '名前を入力...', submit: '{score}を送信',
    rank: '🎉 {rank}位/{total}人', loading: '読み込み中...', noRecords: 'まだ記録がありません — 最初の一人に！', refresh: '🔄 更新',
  },
  game2048: { title: '2048', desc: 'スライドして数字を合体', energyLevel: 'エネルギーレベル', coreUnlocked: 'コア解放', systemOverload: 'オーバーロード', keepPlaying: '続ける', systemReboot: 'リブート', finalEnergy: '最終エネルギー: {score}', touch: 'WASD / スワイプ' },
  tetris: { title: 'テトリス', desc: 'ブロックを積もう — 速いほど高得点', drop: '⏬ 落下', controls: '← → 移動 | ↑ 回転 | ↓ 加速 | Space 落下 | P ポーズ', startTip: '矢印キー / タッチ操作' },
  snake: { title: 'スネーク', desc: 'ヘビを操り、エサを食べて成長', dataLost: '接続が切れました', startHint: '矢印キー / スワイプ', controls: '矢印キー / WASD' },
  pacman: { title: 'パックマン', desc: 'ゴーストを避けてドットを食べよう', levelN: 'レベル {n}', pelletsLeft: '残りドット', levelComplete: 'レベルクリア！', nextLevelSoon: '次のレベルへ...', lives: '残機', controls: '← → ↑ ↓ / WASD / スワイプ', ruleTarget: '全ドットを食べてクリア', rulePowerup: 'パワーエサ：ゴーストが青くなる', ruleGhosts: '4匹のゴーストが追いかけてくる', ruleFruit: 'フルーツ：ボーナスポイント', ruleSpeed: 'レベルごとにゴーストが速くなる' },
  minesweeper: { title: 'マインスイーパー', desc: 'タイルを開いて地雷を見つけよう', mineHit: '地雷！', cleared: 'クリア！', again: 'もう一度', flagBtn: '⚠ フラグ', desktopHint: '左クリックで開く | 右クリックでフラグ', mobileHint: 'タップで開く · 長押しでフラグ' },
  gomoku: { title: '五目並べ', desc: 'AIと対局 — 五目揃えたら勝ち', again: 'もう一度', undoMove: '戻す', thinking: '相手が考え中...', youBlack: '黒（あなた）', wins: '勝利', winMsg: '勝利！', loseMsg: '惜敗…', drawMsg: '引き分け', hint: '黒番先手 · クリックで配置 · 五目並べ' },
  sudoku: { title: '数独', desc: '9×9マスを埋めよう', complete: 'クリア！', again: 'もう一度', check: 'チェック', hint: '9×9を1〜9で埋めよう', erase: '消す', noteMode: 'メモ', notesOn: 'メモ ON', notesOff: 'メモ OFF' },
  memory: { title: '神経衰弱', desc: 'カードをめくってペアを見つけよう', steps: '手数', complete: '全ペア発見！', result: '{moves}手、{time}秒でクリア', reset: 'リセット', hint: 'カードをめくってペアを探そう' },
  flappy: { title: 'フラッピーバード', desc: 'タップで飛んで障害物を避けよう', scoreN: 'スコア: {n}', tapToStart: 'タップで開始', restartHint: 'クリックかスペースで再スタート', deepsea: 'ディープダイブ', swimHint: '上へ泳いでサンゴを避けよう', controls: 'スペース / タップで上昇' },
  colorFind: { title: 'カラーテスト', desc: '違う色を見つけよう', challengeOver: 'チャレンジ終了', timeUp: '時間切れ！', reachedLevel: 'レベル{n}到達', finalScore: '最終スコア: {n}', again: 'もう一度', levelLabel: 'レベル', hint: '違う色のタイルを見つけよう' },
  breakout: { title: 'ブロック崩し', desc: 'パドルを操ってブロックを壊そう', missionComplete: 'ミッションクリア！', shipDown: '撃墜', scoreN: 'スコア: {n}', launch: '発射！', again: 'もう一度', controls: 'マウス / タッチで移動', hint: '船を操ってブロックを壊そう' },
  invaders: { title: 'スペースインベーダー', desc: 'レトロシューティングで地球を守れ', scoreN: 'スコア: {n}', start: 'スタート', waveCleared: 'ウェーブ{n}クリア！', nextWave: '次のウェーブ', nextWaveFaster: '次はもっと速い！', controls: '移動 | スペースで射撃', ruleAliens: 'エイリアン: 5×8編隊', ruleShooting: '射撃: スペースかタップ', ruleLives: 'ライフ: 3つ', ruleGoal: '目標: 全インベーダーを撃破', ruleTip: 'コツ: 端のエイリアンから倒そう', ruleUFO: 'ランダムに赤UFO出現 — 100ポイント' },
  bubbleShooter: { title: 'バブルシューター', desc: '狙って撃って同じ色3つを消そう', caveCleared: '洞窟クリア！', defenseDown: '防御崩壊！', restartHint: 'クリックで再スタート', hint: '狙って撃とう · 同色3つ以上 · 5ミスで押し下げ' },
  wordle: { title: 'Wordle', desc: '5文字の単語を6回で当てよう', won: '🎉 おめでとう！', lost: '正解は: {word}', again: 'もう一度', notInList: '単語リストにありません', tooShort: '5文字必要です', hint: '5文字の単語を6回以内に当てよう' },
  match3: { title: 'ジェムマッチ', desc: '宝石を入れ替えて3つ揃えよう', movesLeft: '残り手数', gameOverTitle: 'ゲーム終了', finalScore: '最終エネルギー: {n}', again: 'もう一度', hint: '隣の宝石と入れ替え · 3つ並べよう' },
  solitaire: { title: 'ソリティア', desc: 'クラシックカードゲーム', won: 'クリア！', again: 'もう一度', autoComplete: 'オートコンプリート' },
  connect: { title: 'タイルコネクト', desc: '同じタイルを線で繋ごう', timeUp: '時間切れ！', allCleared: '全クリア！', again: 'もう一度', finalScore: '最終スコア {n}', scoreTime: 'スコア {score} · 時間 {time}秒', ruleTitle: 'タイルコネクト', ruleGoal: '120秒以内に全消し', ruleConnect: '同じタイルを最大2回曲がりで繋ぐ', ruleTime: '消すたびに+3秒', ruleShuffle: 'シャッフル: タイルを並べ替え', ruleHint: 'ヒント: ペアをハイライト', hint: '同じタイルをタップ · 最大2回曲がり' },
  sokoban: { title: '倉庫番', desc: '箱を目標へ押そう — 50ステージ', stageN: 'ステージ {n}', complete: 'ステージクリア！', allComplete: '全ステージクリア！', next: '次へ', prev: '前へ', undoMove: '戻す', resetLevel: 'リセット', stepsLabel: 'ステップ', hint: '箱を押そう · 矢印キー / スワイプ' },
  nonogram: { title: 'ノノグラム', desc: 'ヒントからドット絵を完成させよう', solved: '回路接続！', newRecord: '新記録！', bestTime: 'ベスト: {t}秒', nextPuzzle: '次へ', ruleTitle: 'ノノグラムのルール', ruleGoal: '隠されたパターンを明らかにしよう', ruleNumbers: '数字は連続する塗りマスの長さを示す', ruleFill: '左クリックで塗る', ruleMark: '右クリックで空きマスをマーク', ruleMode: '塗りとマークを切り替え', ruleTip: '大きい数字の行/列から始めよう', ruleRecord: 'パズルごとのベストタイムを記録', hintText: 'クリックで塗る · 右クリックでX', cellLabel: '行{r} 列{c}' },
  microEmpire: { title: "Micro Empire", desc: "Build a kingdom, manage resources, grow from wilderness to empire" },
};

export default ja;
