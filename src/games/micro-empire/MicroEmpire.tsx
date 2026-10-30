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
import { autoSave, loadAutoSave, saveGame, loadGame } from './utils/save';
import { cloudSave, isCloudLoggedIn } from './utils/cloudApi';
import type { TileType } from './world/Tile';

const CANVAS_STYLE: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
  imageRendering: 'pixelated',
};

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

  const pausedByPanel = useRef(false);
  const anyPanelOpen = showPopulation || showTech || showTrade || showSave || showStats || showLeaderboard;

  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;
    if (anyPanelOpen && !game.paused) {
      pausedByPanel.current = true;
      game.paused = true;
      game['emitSnapshot']();
    } else if (!anyPanelOpen && pausedByPanel.current) {
      pausedByPanel.current = false;
      game.paused = false;
      game['emitSnapshot']();
    }
  }, [anyPanelOpen]);

  const updateSnap = useCallback((s: GameSnapshot) => {
    setSnap({ ...s });
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

    resize();
    game.start();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    autoSaveTimer.current = window.setInterval(() => {
      autoSave(game.serialize());
    }, 120000);

    return () => {
      game.dispose();
      ro.disconnect();
      clearInterval(autoSaveTimer.current);
    };
  }, [updateSnap]);

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

  const game = gameRef.current;

  const handleSave = (slot: string) => {
    if (game) saveGame(slot, game.serialize());
  };

  const handleLoad = (slot: string) => {
    const data = loadGame(slot);
    if (data && game) {
      game.deserialize(data);
      setShowSave(false);
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
    }
  };

  const selectedBuilding = snap?.selectedTile
    ? snap.buildings.find(b => b.x === snap.selectedTile!.x && b.y === snap.selectedTile!.y)
    : null;

  const selectedTileType: TileType | null = snap?.selectedTile
    ? (snap.map[snap.selectedTile.y]?.[snap.selectedTile.x] ?? null)
    : null;

  const totalDefense = snap
    ? snap.buildings
        .filter(b => b.constructionLeft === 0)
        .reduce((sum, b) => sum + (b.level * 3), 0) + (snap.population.workers.soldier ?? 0) * 3
    : 0;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: 'calc(100vh - 60px)',
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
          <div style={{
            position: 'absolute',
            top: 8,
            left: 8,
            right: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
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
              tradeAvailable={snap.tradeAvailable}
              nextInvasion={snap.military.nextInvasion}
            />
          </div>

          <BuildMenu
            placing={snap.placingBuilding}
            onSelect={(type) => game?.setPlacingBuilding(type)}
            resources={snap.resources}
            researchedTechs={snap.tech.researched}
          />

          <InfoPanel
            selectedTile={snap.selectedTile}
            tileType={selectedTileType}
            building={selectedBuilding ?? null}
            onUpgrade={(x, y) => game?.upgradeBuilding(x, y)}
            onRemove={(x, y) => game?.removeBuilding(x, y)}
            onClose={() => { if (game) { game.selectedTile = null; game['emitSnapshot'](); } }}
          />

          <MiniMap
            mapData={snap.map}
            camera={game?.camera ?? { x: 0, y: 0, zoom: 1, viewW: 800, viewH: 600 } as any}
            buildings={snap.buildings.map(b => ({ x: b.x, y: b.y }))}
            onJump={(wx, wy) => game?.camera.moveTo(wx, wy)}
          />

          <AchievementToast unlockedIds={snap.achievements.unlocked} />

          {snap.activeEvent && !snap.activeEvent.resolved && (
            <EventDialog
              event={snap.activeEvent}
              onResolve={(i) => game?.resolveEvent(i)}
            />
          )}

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

          {showTutorial && (
            <TutorialOverlay onClose={() => {
              setShowTutorial(false);
              try { localStorage.setItem('micro_empire_tutorial_done', '1'); } catch {}
            }} />
          )}

          {snap.paused && !snap.activeEvent && !showPopulation && !showTech && !showTrade && !showSave && !showLeaderboard && (
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
        </>
      )}

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
  );
}
