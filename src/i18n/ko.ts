import type { Translations } from './en';

const ko: Translations = {
  common: {
    newGame: '새 게임', restart: '다시 시작', continue: '계속', pause: '일시정지', paused: '일시정지됨', resume: '재개',
    score: '점수', highScore: '최고', gameOver: '게임 오버', victory: '승리', back: '뒤로', backHome: '← 홈',
    play: '플레이', enter: '플레이 →', loading: '로딩 중', clickToStart: '클릭하여 시작',
    easy: '쉬움', medium: '보통', hard: '어려움', beginner: '초급', intermediate: '중급', advanced: '고급',
    level: '레벨', lines: '줄', time: '시간', steps: '걸음', moves: '수', next: '다음',
    hint: '힌트', shuffle: '섞기', rules: '규칙', closeRules: '규칙 닫기',
    flagMode: '깃발', flagging: '깃발 모드', fill: '채우기', marking: '표시 중',
    seconds: '초', undo: '되돌리기', nextLevel: '다음', timeSeconds: '시간(초)',
  },
  cat: {
    all: '전체', puzzle: '퍼즐', arcade: '아케이드', strategy: '전략', casual: '캐주얼',
    puzzleDesc: '두뇌 퍼즐 & 논리', arcadeDesc: '빠른 반사신경 & 액션',
    strategyDesc: '깊은 사고 & 전략', casualDesc: '편안한 & 재미', count: '{n}개 게임',
  },
  home: { subtitle: '엄선된 브라우저 게임 {n}개 · 바로 플레이', clickToStart: '클릭하여 시작', enter: '플레이 →' },
  lb: {
    title: '🏆 랭킹', btn: '🏆 랭킹', player: '플레이어', enterName: '이름 입력...', submit: '{score} 제출',
    rank: '🎉 {rank}위/{total}명', loading: '로딩 중...', noRecords: '아직 기록이 없습니다 — 첫 번째가 되세요!', refresh: '🔄 새로고침',
  },
  game2048: { title: '2048', desc: '숫자를 밀어 합치세요', energyLevel: '에너지 레벨', coreUnlocked: '코어 해제', systemOverload: '과부하', keepPlaying: '계속하기', systemReboot: '재시작', finalEnergy: '최종 에너지: {score}', touch: 'WASD / 스와이프' },
  tetris: { title: '테트리스', desc: '블록 쌓기 — 빠를수록 높은 점수', drop: '⏬ 떨어뜨리기', controls: '← → 이동 | ↑ 회전 | ↓ 가속 | Space 낙하 | P 일시정지', startTip: '방향키 / 터치 조작' },
  snake: { title: '스네이크', desc: '뱀을 조종하고 먹이를 먹어 성장', dataLost: '연결 끊김', startHint: '방향키 / 스와이프', controls: '방향키 / WASD' },
  pacman: { title: '팩맨', desc: '유령을 피하고 모든 점을 먹자', levelN: '레벨 {n}', pelletsLeft: '남은 점', levelComplete: '레벨 클리어!', nextLevelSoon: '다음 레벨...', lives: '목숨', controls: '← → ↑ ↓ / WASD / 스와이프', ruleTarget: '모든 점을 먹어 클리어', rulePowerup: '파워 펠릿: 유령이 파란색으로', ruleGhosts: '4마리 유령이 다른 패턴으로 추적', ruleFruit: '과일: 보너스 포인트', ruleSpeed: '레벨마다 유령이 빨라짐' },
  minesweeper: { title: '지뢰찾기', desc: '타일을 열어 지뢰를 찾자', mineHit: '지뢰!', cleared: '클리어!', again: '다시', flagBtn: '⚠ 깃발', desktopHint: '좌클릭 열기 | 우클릭 깃발', mobileHint: '탭으로 열기 · 길게 눌러 표시' },
  gomoku: { title: '오목', desc: 'AI와 대결 — 다섯 개 연속 승리', again: '다시', undoMove: '되돌리기', thinking: '상대 생각 중...', youBlack: '흑(당신)', wins: '승리', winMsg: '승리!', loseMsg: '패배', drawMsg: '무승부', hint: '흑 선공 · 클릭으로 착수 · 오목' },
  sudoku: { title: '스도쿠', desc: '9×9 격자를 채우세요', complete: '클리어!', again: '다시', check: '검사', hint: '9×9를 1~9로 채우기', erase: '지우기', noteMode: '메모', notesOn: '메모 ON', notesOff: '메모 OFF' },
  memory: { title: '메모리 매치', desc: '카드를 뒤집어 같은 짝을 찾자', steps: '수', complete: '모두 찾았습니다!', result: '{moves}수, {time}초에 클리어', reset: '리셋', hint: '카드를 뒤집어 짝을 찾으세요' },
  flappy: { title: '플래피 버드', desc: '탭하여 날고 장애물을 피하자', scoreN: '점수: {n}', tapToStart: '탭하여 시작', restartHint: '클릭 또는 스페이스로 재시작', deepsea: '딥 다이브', swimHint: '위로 헤엄쳐 산호를 피하자', controls: '스페이스 / 탭으로 상승' },
  colorFind: { title: '색상 테스트', desc: '다른 색조를 찾아보세요', challengeOver: '챌린지 종료', timeUp: '시간 초과!', reachedLevel: '레벨 {n} 도달', finalScore: '최종 점수: {n}', again: '다시', levelLabel: '레벨', hint: '다른 색의 타일을 찾으세요' },
  breakout: { title: '벽돌깨기', desc: '패들을 조종해 벽돌을 부수자', missionComplete: '미션 완료!', shipDown: '파괴됨', scoreN: '점수: {n}', launch: '발사!', again: '다시', controls: '마우스 / 터치로 이동', hint: '우주선을 조종해 블록을 부수자' },
  invaders: { title: '스페이스 인베이더', desc: '레트로 슈팅 — 지구를 지키자', scoreN: '점수: {n}', start: '시작', waveCleared: '웨이브 {n} 클리어!', nextWave: '다음 웨이브', nextWaveFaster: '다음은 더 빠릅니다!', controls: '이동 | 스페이스 발사', ruleAliens: '외계인: 5×8 대형', ruleShooting: '발사: 스페이스 또는 탭', ruleLives: '목숨: 3개', ruleGoal: '목표: 모든 침략자 격파', ruleTip: '팁: 가장자리 외계인부터', ruleUFO: '랜덤 빨간 UFO — 100 보너스' },
  bubbleShooter: { title: '버블 슈터', desc: '조준하고 발사 — 같은 색 3개', caveCleared: '동굴 클리어!', defenseDown: '방어 붕괴!', restartHint: '클릭으로 재시작', hint: '조준 & 발사 · 같은 색 3개 이상 · 5번 실패 = 밀림' },
  wordle: { title: 'Wordle', desc: '5글자 단어를 6번 안에 맞히세요', won: '🎉 축하합니다!', lost: '정답은: {word}', again: '다시', notInList: '단어 목록에 없습니다', tooShort: '5글자가 필요합니다', hint: '5글자 단어를 6번 안에 맞히세요' },
  match3: { title: '보석 매치', desc: '보석을 바꿔 3개를 맞추세요', movesLeft: '남은 수', gameOverTitle: '게임 종료', finalScore: '최종 에너지: {n}', again: '다시', hint: '인접한 보석 교환 · 3개 연속' },
  solitaire: { title: '솔리테어', desc: '클래식 카드 게임', won: '승리!', again: '다시', autoComplete: '자동 완성' },
  connect: { title: '타일 연결', desc: '같은 타일을 선으로 연결', timeUp: '시간 초과!', allCleared: '모두 클리어!', again: '다시', finalScore: '최종 점수 {n}', scoreTime: '점수 {score} · 시간 {time}초', ruleTitle: '타일 연결', ruleGoal: '120초 안에 모두 제거', ruleConnect: '같은 타일을 최대 2번 꺾어 연결', ruleTime: '제거할 때마다 +3초', ruleShuffle: '섞기: 타일 재배치', ruleHint: '힌트: 가능한 쌍 표시', hint: '같은 타일 두 개 탭 · 최대 2번 꺾기' },
  sokoban: { title: '창고지기', desc: '상자를 목표로 밀기 — 50스테이지', stageN: '스테이지 {n}', complete: '스테이지 클리어!', allComplete: '모든 스테이지 클리어!', next: '다음', prev: '이전', undoMove: '되돌리기', resetLevel: '리셋', stepsLabel: '걸음', hint: '상자 밀기 · 방향키 / 스와이프' },
  nonogram: { title: '네모로직', desc: '단서로 픽셀 아트를 완성하세요', solved: '회로 연결!', newRecord: '신기록!', bestTime: '최고: {t}초', nextPuzzle: '다음', ruleTitle: '네모로직 규칙', ruleGoal: '숨겨진 패턴을 밝히세요', ruleNumbers: '숫자는 연속 칠할 칸의 길이', ruleFill: '좌클릭으로 칠하기', ruleMark: '우클릭으로 빈칸 표시', ruleMode: '칠하기와 표시 전환', ruleTip: '큰 숫자가 있는 행/열부터', ruleRecord: '퍼즐별 최고 기록 저장', hintText: '클릭으로 칠하기 · 우클릭으로 X 표시', cellLabel: '행 {r} 열 {c}' },
  microEmpire: { title: "Micro Empire", desc: "Build a kingdom, manage resources, grow from wilderness to empire" },
};

export default ko;
