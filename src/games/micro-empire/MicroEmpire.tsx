import { useRef, useEffect, useState, useCallback } from 'react';
import { Game, type GameSnapshot } from './engine/Game';
import ResourceBar from './ui/ResourceBar';
import HUD from './ui/HUD';
import BuildMenu from './ui/BuildMenu';
import InfoPanel from './ui/InfoPanel';
import EventDialog from './ui/EventDialog';
import MiniMap from './ui/MiniMap';
import PopulationPanel from './ui/PopulationPanel';
import TechTreePanel from './ui/TechTreePanel';
import TradePanel from './ui/TradePanel';
import AchievementToast from './ui/AchievementToast';
import SaveLoadPanel from './ui/SaveLoadPanel';
import LeaderboardPanel from './ui/LeaderboardPanel';
import TutorialOverlay from './ui/TutorialOverlay';
import StatsPanel from './ui/StatsPanel';
import GameToast from './ui/GameToast';
import SettingsPanel from './ui/SettingsPanel';
import VictoryScreen from './ui/VictoryScreen';
import { autoSave, loadAutoSave, saveGame, loadGame } from './utils/save';
import { cloudSave, isCloudLoggedIn } from './utils/cloudApi';
import { loadSettings, saveSettings, type GameSettings } from './utils/settings';
import { BUILDING_DEFS } from './data/buildings';
import { RESOURCE_DEFS } from './data/resources';
import { TECH_DEFS } from './data/technologies';
import type { TileType } from './world/Tile';

const CANVAS_STYLE: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
  imageRendering: 'pixelated',
};

const MAX_GAME_WIDTH = 1200;

export default function MicroEmpire() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const autoSaveTimer = useRef<number>(0);

  const [snap, setSnap] = useState<GameSnapshot | null>(null);
  const [showPopulation, setShowPopulation] = useState(false);
  const [showTech, setShowTech] = useState(false);
  const [showTrade, setShowTrade] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTutorial, setShowTutorial] = useState(() => {
    try { return !localStorage.getItem('micro_empire_tutorial_done'); } catch { return true; }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const victoryShownRef = useRef(false);
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());

  // Toast notification system
  const [toasts, setToasts] = useState<{ id: number; text: string; type: 'info' | 'warn' | 'error' | 'success' }[]>([]);
  const toastIdRef = useRef(0);
  const addToast = useCallback((text: string, type: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev.slice(-4), { id, text, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const pausedByPanel = useRef(false);
  const hasActiveResearch = !!snap?.tech.currentResearch;
  // Tech tree: pause only when no research in progress; save/settings always pause
  const pausingPanelOpen = showSave || showSettings || (showTech && !hasActiveResearch);
  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;
    if (pausingPanelOpen && !game.paused) {
      pausedByPanel.current = true;
      game.paused = true;
      game['emitSnapshot']();
    } else if (!pausingPanelOpen && pausedByPanel.current) {
      pausedByPanel.current = false;
      game.paused = false;
      game['emitSnapshot']();
    }
  }, [pausingPanelOpen]);

  const updateSnap = useCallback((s: GameSnapshot) => {
    setSnap({ ...s });
    if (s.victory && !victoryShownRef.current) {
      victoryShownRef.current = true;
      setShowVictory(true);
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      if (w === 0 || h === 0) return;
      canvas.width = w;
      canvas.height = h;
      gameRef.current?.resizeCanvas(w, h);
    };

    const game = new Game();
    gameRef.current = game;
    game.setOnUpdate(updateSnap);
    game.attachCanvas(canvas);

    const saved = loadAutoSave();
    if (saved) {
      try { game.deserialize(saved); } catch {}
    }

    const initialSettings = loadSettings();
    game.applySettings(initialSettings);

    resize();
    game.start();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    return () => {
      game.dispose();
      ro.disconnect();
      clearInterval(autoSaveTimer.current);
    };
  }, [updateSnap]);

  // Auto-save timer reacts to settings changes
  useEffect(() => {
    clearInterval(autoSaveTimer.current);
    const intervalSec = settings.autoSaveInterval;
    if (intervalSec > 0 && gameRef.current) {
      autoSaveTimer.current = window.setInterval(() => {
        if (gameRef.current) autoSave(gameRef.current.serialize());
      }, intervalSec * 1000);
    }
    return () => clearInterval(autoSaveTimer.current);
  }, [settings.autoSaveInterval]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ') { e.preventDefault(); game.togglePause(); }
      if (e.key === '1') game.setSpeed(1);
      if (e.key === '2') game.setSpeed(2);
      if (e.key === '3') game.setSpeed(3);
      if (e.key === 'Escape') {
        game.setPlacingBuilding(null);
        setShowPopulation(false);
        setShowTech(false);
        setShowTrade(false);
        setShowSave(false);
        setShowLeaderboard(false);
        setShowSettings(false);
      }
      if (e.key === 'b' || e.key === 'B') {
        setShowPopulation(false); setShowTech(false); setShowTrade(false); setShowSave(false);
      }
      if (e.key === 'p' || e.key === 'P') setShowPopulation(p => !p);
      if (e.key === 't' || e.key === 'T') setShowTech(p => !p);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Listen for game events to show toasts
  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;
    const unsubs: (() => void)[] = [];
    const on = (evt: string, cb: (...args: any[]) => void) => { unsubs.push(game.bus.on(evt, cb)); };

    const bName = (type: string) => BUILDING_DEFS[type]?.label ?? type;
    const rName = (r: string) => RESOURCE_DEFS[r as keyof typeof RESOURCE_DEFS]?.label ?? r;

    on('building:placed', (type: string) => addToast(`✅ ${bName(type)} 建造中...`, 'success'));
    on('building:placeFail', (reason: string) => addToast(`❌ 无法放置: ${reason}`, 'error'));
    on('building:completed', (type: string) => addToast(`🏗️ ${bName(type)} 建造完成！`, 'success'));
    on('building:upgraded', (type: string, _x: number, _y: number, level: number) => addToast(`⬆️ ${bName(type)} 升级到 ${level} 级`, 'success'));
    on('building:removed', (type: string) => addToast(`🗑️ ${bName(type)} 已拆除`, 'info'));
    on('building:damaged', (type: string) => addToast(`💥 ${bName(type)} 被损坏降级！`, 'error'));
    const depletedCooldown: Record<string, number> = {};
    on('resource:depleted', (r: string) => {
      const now = Date.now();
      if (depletedCooldown[r] && now - depletedCooldown[r] < 15000) return;
      depletedCooldown[r] = now;
      addToast(`⚠️ ${rName(r)} 已耗尽！注意补充`, 'warn');
    });
    on('season:changed', (season: number) => {
      const names = ['🌸 春天', '☀️ 夏天', '🍂 秋天', '❄️ 冬天'];
      addToast(`${names[season] ?? '新季节'}来了`, 'info');
    });
    on('tech:researched', (id: string) => addToast(`🔬 科技研发完成: ${TECH_DEFS[id]?.label ?? id}`, 'success'));
    on('trade:merchant_arrived', () => addToast(`🏪 商人到来，可以进行贸易！`, 'info'));
    on('military:victory', () => addToast(`⚔️ 入侵已击退！`, 'success'));
    on('military:defeat', () => addToast(`💀 防御失败，遭受了损失！`, 'error'));
    let lastPopWarning = 0;
    on('population:changed', (total: number) => {
      const now = Date.now();
      if (total <= 0 && now - lastPopWarning > 30000) {
        lastPopWarning = now;
        addToast(`⚠️ 人口为零！需要建造住房`, 'error');
      }
    });

    return () => { unsubs.forEach(u => u()); };
  }, [addToast]);

  const game = gameRef.current;

  const handleSave = (slot: string) => {
    if (game) {
      saveGame(slot, game.serialize());
      addToast('💾 本地存档已保存', 'success');
    }
  };

  const handleLoad = (slot: string) => {
    const data = loadGame(slot);
    if (data && game) {
      game.deserialize(data);
      setShowSave(false);
      addToast('📂 存档已加载', 'success');
    }
  };

  const handleCloudSave = async (slot: string): Promise<boolean> => {
    if (!game || !isCloudLoggedIn()) return false;
    const s = game.snapshot();
    const data = game.serialize();
    return cloudSave(slot, data, {
      year: s.time.year,
      population: s.population.total,
      buildings: s.buildings.filter(b => b.constructionLeft === 0).length,
      achievements: s.achievements.unlocked.length,
    });
  };

  const handleCloudLoad = (data: string) => {
    if (game) {
      game.deserialize(data);
      setShowSave(false);
      addToast('☁️ 云存档已加载', 'success');
    }
  };

  const handleSettingsChange = useCallback((newSettings: GameSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    gameRef.current?.applySettings(newSettings);
  }, []);

  const handleResetTutorial = useCallback(() => {
    try { localStorage.removeItem('micro_empire_tutorial_done'); } catch {}
    setShowSettings(false);
    setShowTutorial(true);
    addToast('📖 教程已重置', 'info');
  }, [addToast]);

  const handleClearSave = useCallback(() => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('micro_empire_save_')) {
          keysToRemove.push(key);
        }
      }
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
    } catch {}
    setShowSettings(false);
    addToast('🗑️ 所有本地存档已清除', 'warn');
  }, [addToast]);

  const selectedBuilding = snap?.selectedTile
    ? snap.buildings.find(b => b.x === snap.selectedTile!.x && b.y === snap.selectedTile!.y)
    : null;

  const selectedTileType: TileType | null = snap?.selectedTile
    ? (snap.map[snap.selectedTile.y]?.[snap.selectedTile.x] ?? null)
    : null;

  const totalDefense = snap
    ? snap.buildings
        .filter(b => b.constructionLeft === 0)
        .reduce((sum, b) => {
          const def = BUILDING_DEFS[b.type];
          return sum + (def ? def.defenseBonus * b.level : 0);
        }, 0) + (snap.population.workers.soldier ?? 0) * 3
    : 0;

  return (
    <div style={{
      width: '100%',
      height: 'calc(100vh - 60px)',
      display: 'flex',
      justifyContent: 'center',
      background: '#06060f',
    }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          maxWidth: MAX_GAME_WIDTH,
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          background: '#0a0a1a',
        }}
      >
        <canvas ref={canvasRef} style={CANVAS_STYLE} />

        {!snap && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0a1a',
            color: '#888',
            fontSize: 16,
            zIndex: 100,
          }}>
            正在加载微观帝国...
          </div>
        )}

        {snap && (
          <>
            {/* Top UI: Resource Bar + HUD */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              zIndex: 10,
              pointerEvents: 'auto',
            }}>
              <ResourceBar resources={snap.resources} />
              <HUD
                dayInSeason={snap.time.dayInSeason}
                season={snap.time.season}
                year={snap.time.year}
                seasonProgress={snap.time.seasonProgress}
                paused={snap.paused}
                speed={snap.speed}
                population={snap.population}
                defense={totalDefense}
                achievementCount={snap.achievements.unlocked.length}
                achievementTotal={snap.achievements.total}
                onTogglePause={() => game?.togglePause()}
                onSetSpeed={(s) => game?.setSpeed(s)}
                onOpenPopulation={() => setShowPopulation(true)}
                onOpenTech={() => setShowTech(true)}
                onOpenSave={() => setShowSave(true)}
                onOpenTrade={() => setShowTrade(true)}
                onOpenStats={() => setShowStats(true)}
                onOpenLeaderboard={() => setShowLeaderboard(true)}
                onOpenSettings={() => setShowSettings(true)}
                tradeAvailable={snap.tradeAvailable}
                nextInvasion={snap.military.nextInvasion}
                currentResearch={snap.tech.currentResearch ? {
                  label: TECH_DEFS[snap.tech.currentResearch]?.label ?? snap.tech.currentResearch,
                  icon: TECH_DEFS[snap.tech.currentResearch]?.icon ?? '🔬',
                  progress: snap.tech.researchProgress,
                  total: snap.tech.researchTotal,
                } : null}
              />
            </div>

            {/* Build Menu */}
            <BuildMenu
              placing={snap.placingBuilding}
              onSelect={(type) => game?.setPlacingBuilding(type)}
              resources={snap.resources}
              researchedTechs={snap.tech.researched}
            />

            {/* Tile Info Panel */}
            <InfoPanel
              selectedTile={snap.selectedTile}
              tileType={selectedTileType}
              building={selectedBuilding ?? null}
              onUpgrade={(x, y) => game?.upgradeBuilding(x, y)}
              onRemove={(x, y) => game?.removeBuilding(x, y)}
              onClose={() => { if (game) { game.selectedTile = null; game['emitSnapshot'](); } }}
            />

            {/* Mini Map */}
            {settings.showMinimap && (
              <MiniMap
                mapData={snap.map}
                camera={game?.camera ?? { x: 0, y: 0, zoom: 1, viewW: 800, viewH: 600 } as any}
                buildings={snap.buildings.map(b => ({ x: b.x, y: b.y }))}
                onJump={(wx, wy) => game?.camera.moveTo(wx, wy)}
              />
            )}

            {/* Achievement Toast */}
            <AchievementToast unlockedIds={snap.achievements.unlocked} />

            {/* Event Dialog */}
            {snap.activeEvent && !snap.activeEvent.resolved && (
              <EventDialog
                event={snap.activeEvent}
                onResolve={(i) => game?.resolveEvent(i)}
              />
            )}

            {/* Panels */}
            {showPopulation && (
              <PopulationPanel
                population={snap.population}
                onAssign={(job, delta) => game?.assignWorkers(job, delta)}
                onClose={() => setShowPopulation(false)}
              />
            )}

            {showTech && (
              <TechTreePanel
                researched={snap.tech.researched}
                currentResearch={snap.tech.currentResearch}
                researchProgress={snap.tech.researchProgress}
                researchTotal={snap.tech.researchTotal}
                resources={snap.resources}
                onResearch={(id) => game?.researchTech(id)}
                onClose={() => setShowTech(false)}
                time={{ year: snap.time.year, season: snap.time.season, dayInSeason: snap.time.dayInSeason }}
              />
            )}

            {showTrade && snap.tradeAvailable && (
              <TradePanel
                offers={snap.tradeOffers}
                resources={snap.resources}
                onTrade={(i) => game?.executeTrade(i)}
                onClose={() => setShowTrade(false)}
              />
            )}

            {showSave && (
              <SaveLoadPanel
                onSave={handleSave}
                onLoad={handleLoad}
                onCloudSave={handleCloudSave}
                onCloudLoad={handleCloudLoad}
                onClose={() => setShowSave(false)}
              />
            )}

            {showLeaderboard && (
              <LeaderboardPanel
                snap={snap}
                onClose={() => setShowLeaderboard(false)}
              />
            )}

            {showStats && (
              <StatsPanel snap={snap} onClose={() => setShowStats(false)} />
            )}

            {showSettings && (
              <SettingsPanel
                settings={settings}
                onChange={handleSettingsChange}
                onResetTutorial={handleResetTutorial}
                onClearSave={handleClearSave}
                onClose={() => setShowSettings(false)}
              />
            )}

            {showTutorial && (
              <TutorialOverlay onClose={() => {
                setShowTutorial(false);
                try { localStorage.setItem('micro_empire_tutorial_done', '1'); } catch {}
              }} />
            )}

            {showVictory && (
              <VictoryScreen
                snap={snap}
                onContinue={() => {
                  setShowVictory(false);
                  game?.togglePause();
                }}
                onNewGame={() => {
                  setShowVictory(false);
                  victoryShownRef.current = false;
                  try {
                    localStorage.removeItem('micro_empire_autosave');
                  } catch {}
                  window.location.reload();
                }}
              />
            )}

            {/* Pause overlay */}
            {snap.paused && !snap.activeEvent && !showPopulation && !showTech && !showTrade && !showSave && !showLeaderboard && !showSettings && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 28,
                fontWeight: 900,
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: 4,
                pointerEvents: 'none',
                zIndex: 5,
              }}>
                ⏸ 已暂停
              </div>
            )}

            {/* Placing hint bar */}
            {snap.placingBuilding && (
              <div style={{
                position: 'absolute',
                bottom: 56,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.85)',
                color: '#ffe93e',
                padding: '8px 20px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                zIndex: 20,
                pointerEvents: 'none',
                border: '1px solid rgba(255,233,62,0.3)',
                whiteSpace: 'nowrap',
              }}>
                🔨 点击绿色地块放置建筑 · 右键或 ESC 取消
              </div>
            )}
          </>
        )}

        {/* Toast notifications */}
        {settings.showToasts && <GameToast toasts={toasts} />}

        <style>{`
          @keyframes popIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes slideDown {
            from { transform: translate(-50%, -20px); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
          }
          @keyframes fadeOut {
            to { opacity: 0; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    </div>
  );
}
