import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { lazy, Suspense } from 'react';
import { I18nProvider } from './i18n';

const Game2048 = lazy(() => import('./games/game2048/Game2048'));
const Tetris = lazy(() => import('./games/tetris/Tetris'));
const Snake = lazy(() => import('./games/snake/Snake'));
const Pacman = lazy(() => import('./games/pacman/Pacman'));
const Minesweeper = lazy(() => import('./games/minesweeper/Minesweeper'));
const Gomoku = lazy(() => import('./games/gomoku/Gomoku'));
const Sudoku = lazy(() => import('./games/sudoku/Sudoku'));
const Memory = lazy(() => import('./games/memory/Memory'));
const Flappy = lazy(() => import('./games/flappy/Flappy'));
const ColorFind = lazy(() => import('./games/color-find/ColorFind'));
const Breakout = lazy(() => import('./games/breakout/Breakout'));
const Invaders = lazy(() => import('./games/invaders/Invaders'));
const BubbleShooter = lazy(() => import('./games/bubble-shooter/BubbleShooter'));
const Wordle = lazy(() => import('./games/wordle/Wordle'));
const Match3 = lazy(() => import('./games/match3/Match3'));
const Solitaire = lazy(() => import('./games/solitaire/Solitaire'));
const Sokoban = lazy(() => import('./games/sokoban/Sokoban'));
const Connect = lazy(() => import('./games/connect/Connect'));
const Nonogram = lazy(() => import('./games/nonogram/Nonogram'));
const MicroEmpire = lazy(() => import('./games/micro-empire/MicroEmpire'));

function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="loader" />
      <div className="text-sm text-gray-500 tracking-wider">LOADING</div>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/game/2048" element={<Game2048 />} />
            <Route path="/game/tetris" element={<Tetris />} />
            <Route path="/game/snake" element={<Snake />} />
            <Route path="/game/pacman" element={<Pacman />} />
            <Route path="/game/minesweeper" element={<Minesweeper />} />
            <Route path="/game/gomoku" element={<Gomoku />} />
            <Route path="/game/sudoku" element={<Sudoku />} />
            <Route path="/game/memory" element={<Memory />} />
            <Route path="/game/flappy" element={<Flappy />} />
            <Route path="/game/color-find" element={<ColorFind />} />
            <Route path="/game/breakout" element={<Breakout />} />
            <Route path="/game/invaders" element={<Invaders />} />
            <Route path="/game/bubble-shooter" element={<BubbleShooter />} />
            <Route path="/game/wordle" element={<Wordle />} />
            <Route path="/game/match3" element={<Match3 />} />
            <Route path="/game/solitaire" element={<Solitaire />} />
            <Route path="/game/sokoban" element={<Sokoban />} />
            <Route path="/game/connect" element={<Connect />} />
            <Route path="/game/nonogram" element={<Nonogram />} />
            <Route path="/game/micro-empire" element={<MicroEmpire />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
    </I18nProvider>
  );
}
