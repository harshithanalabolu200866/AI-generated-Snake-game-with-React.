/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useState, useEffect, useCallback, useRef} from 'react';
import {Play, Pause, SkipForward, Music} from 'lucide-react';
import {motion} from 'motion/react';

const TRACKS = [
  {title: 'NEON_PULSE.mp3', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'},
  {title: 'CYBER_DRIFT.mp3', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'},
  {title: 'GLITCH_VOID.mp3', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'},
];

const GRID_SIZE = 22;

export default function App() {
  const [snake, setSnake] = useState([{x: 10, y: 10}]);
  const [direction, setDirection] = useState({x: 0, y: -1});
  const [food, setFood] = useState({x: 5, y: 5});
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const moveSnake = useCallback(() => {
    if (gameOver) return;
    setSnake(prev => {
      const head = prev[0];
      const newHead = {x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE, y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE};
      
      if (prev.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prev;
      }

      const newSnake = [newHead, ...prev];
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 100);
        setFood({x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE)});
      } else {
        newSnake.pop();
      }
      return newSnake;
    });
  }, [direction, food, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && direction.y !== 1) setDirection({x: 0, y: -1});
      if (e.key === 'ArrowDown' && direction.y !== -1) setDirection({x: 0, y: 1});
      if (e.key === 'ArrowLeft' && direction.x !== 1) setDirection({x: -1, y: 0});
      if (e.key === 'ArrowRight' && direction.x !== -1) setDirection({x: 1, y: 0});
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    const interval = setInterval(moveSnake, 150);
    return () => clearInterval(interval);
  }, [moveSnake]);

  useEffect(() => {
    if (audioRef.current) isPlaying ? audioRef.current.play() : audioRef.current.pause();
  }, [isPlaying, trackIndex]);

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center gap-4 text-cyan-400">
      <div className="scanline"></div>
      
      <header className="terminal-border p-4 w-full max-w-2xl text-center">
        <motion.h1 
          animate={{opacity: [1, 0.5, 1]}}
          transition={{repeat: Infinity, duration: 0.1}}
          className="text-2xl uppercase tracking-widest glitch-text"
        >
          [SYSTEM_INIT: SNAKE_OS_V1.0]
        </motion.h1>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
        <div className="md:col-span-2 terminal-border p-2 relative bg-black" style={{aspectRatio: '1/1'}}>
          {Array.from({length: GRID_SIZE * GRID_SIZE}).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isSnake = snake.some(s => s.x === x && s.y === y);
            const isFood = food.x === x && food.y === y;
            return (
              <div key={i} className={`absolute ${isSnake ? 'bg-magenta-500' : isFood ? 'bg-cyan-400 animate-pulse' : ''}`} style={{width: `${100/GRID_SIZE}%`, height: `${100/GRID_SIZE}%`, left: `${(x/GRID_SIZE)*100}%`, top: `${(y/GRID_SIZE)*100}%`}} />
            );
          })}
          {gameOver && <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-2xl font-bold glitch-text">!FATAL_ERROR!</div>}
        </div>

        <aside className="terminal-border p-4 flex flex-col justify-between">
          <div>
            <div className="text-sm">MEM_ADDR: {score}</div>
            <div className="text-xs uppercase mt-2 text-magenta-500">Audio_Stream:</div>
            <div className="text-xs truncate">{TRACKS[trackIndex].title}</div>
          </div>
          
          <div className="flex gap-2">
            <button className="border border-cyan-400 p-2 hover:bg-cyan-900" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? <Pause size={16}/> : <Play size={16}/>}</button>
            <button className="border border-cyan-400 p-2 hover:bg-cyan-900" onClick={() => setTrackIndex((trackIndex + 1) % TRACKS.length)}><SkipForward size={16}/></button>
          </div>
          <audio ref={audioRef} src={TRACKS[trackIndex].src} loop />
        </aside>
      </main>
    </div>
  );
}

