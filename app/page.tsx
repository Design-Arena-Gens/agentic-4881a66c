'use client';

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    // Game variables
    let animationId: number;
    let localScore = 0;
    let localLives = 3;

    // Player
    const player = {
      x: 100,
      y: 400,
      width: 32,
      height: 32,
      velocityY: 0,
      velocityX: 0,
      jumping: false,
      grounded: false,
      speed: 5,
      jumpPower: 12,
      gravity: 0.5,
    };

    // Platforms
    const platforms = [
      { x: 0, y: 550, width: 800, height: 50 }, // Ground
      { x: 200, y: 450, width: 150, height: 20 },
      { x: 400, y: 350, width: 150, height: 20 },
      { x: 600, y: 250, width: 150, height: 20 },
      { x: 100, y: 200, width: 100, height: 20 },
      { x: 500, y: 150, width: 100, height: 20 },
    ];

    // Coins
    let coins = [
      { x: 250, y: 400, width: 20, height: 20, collected: false },
      { x: 450, y: 300, width: 20, height: 20, collected: false },
      { x: 650, y: 200, width: 20, height: 20, collected: false },
      { x: 150, y: 150, width: 20, height: 20, collected: false },
      { x: 550, y: 100, width: 20, height: 20, collected: false },
      { x: 300, y: 500, width: 20, height: 20, collected: false },
      { x: 700, y: 500, width: 20, height: 20, collected: false },
    ];

    // Enemies
    let enemies = [
      { x: 400, y: 518, width: 30, height: 30, velocityX: 2, minX: 300, maxX: 500 },
      { x: 600, y: 220, width: 30, height: 30, velocityX: 1.5, minX: 600, maxX: 750 },
    ];

    // Input handling
    const keys: { [key: string]: boolean } = {};

    window.addEventListener('keydown', (e) => {
      keys[e.key] = true;
      if (e.key === ' ' && player.grounded) {
        player.velocityY = -player.jumpPower;
        player.jumping = true;
        player.grounded = false;
      }
    });

    window.addEventListener('keyup', (e) => {
      keys[e.key] = false;
    });

    // Collision detection
    function checkCollision(rect1: any, rect2: any) {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
    }

    // Draw player (Mario-like character)
    function drawPlayer() {
      if (!ctx) return;

      // Body (red)
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(player.x + 4, player.y + 12, 24, 20);

      // Head (skin color)
      ctx.fillStyle = '#ffcc99';
      ctx.fillRect(player.x + 8, player.y + 4, 16, 12);

      // Hat (red)
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(player.x + 6, player.y, 20, 6);

      // Eyes
      ctx.fillStyle = '#000000';
      ctx.fillRect(player.x + 10, player.y + 8, 4, 2);
      ctx.fillRect(player.x + 18, player.y + 8, 4, 2);

      // Overalls (blue)
      ctx.fillStyle = '#0000ff';
      ctx.fillRect(player.x + 10, player.y + 18, 12, 6);

      // Buttons
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(player.x + 12, player.y + 20, 2, 2);
      ctx.fillRect(player.x + 18, player.y + 20, 2, 2);
    }

    // Draw platforms
    function drawPlatforms() {
      if (!ctx) return;
      platforms.forEach((platform) => {
        // Brick pattern
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;

        // Draw brick lines
        for (let x = platform.x; x < platform.x + platform.width; x += 30) {
          ctx.strokeRect(x, platform.y, 30, platform.height);
        }
      });
    }

    // Draw coins
    function drawCoins() {
      if (!ctx) return;
      coins.forEach((coin) => {
        if (!coin.collected) {
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
          ctx.fill();

          // Inner circle
          ctx.fillStyle = '#ffed4e';
          ctx.beginPath();
          ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // Draw enemies (Goomba-like)
    function drawEnemies() {
      if (!ctx) return;
      enemies.forEach((enemy) => {
        // Body (brown)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(enemy.x, enemy.y + 10, enemy.width, 20);

        // Head (darker brown)
        ctx.fillStyle = '#654321';
        ctx.fillRect(enemy.x + 5, enemy.y, 20, 15);

        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(enemy.x + 8, enemy.y + 5, 5, 5);
        ctx.fillRect(enemy.x + 17, enemy.y + 5, 5, 5);

        ctx.fillStyle = '#000000';
        ctx.fillRect(enemy.x + 10, enemy.y + 6, 2, 3);
        ctx.fillRect(enemy.x + 19, enemy.y + 6, 2, 3);
      });
    }

    // Update game state
    function update() {
      // Horizontal movement
      if (keys['ArrowLeft'] || keys['a']) {
        player.velocityX = -player.speed;
      } else if (keys['ArrowRight'] || keys['d']) {
        player.velocityX = player.speed;
      } else {
        player.velocityX = 0;
      }

      player.x += player.velocityX;

      // Keep player in bounds
      if (player.x < 0) player.x = 0;
      if (player.x + player.width > canvas!.width) player.x = canvas!.width - player.width;

      // Apply gravity
      player.velocityY += player.gravity;
      player.y += player.velocityY;

      // Platform collision
      player.grounded = false;
      platforms.forEach((platform) => {
        if (checkCollision(player, platform)) {
          if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.grounded = true;
            player.jumping = false;
          }
        }
      });

      // Coin collection
      coins.forEach((coin) => {
        if (!coin.collected && checkCollision(player, coin)) {
          coin.collected = true;
          localScore += 100;
          setScore(localScore);
        }
      });

      // Enemy movement
      enemies.forEach((enemy) => {
        enemy.x += enemy.velocityX;
        if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) {
          enemy.velocityX *= -1;
        }
      });

      // Enemy collision
      enemies = enemies.filter((enemy) => {
        if (checkCollision(player, enemy)) {
          // Check if player jumped on enemy
          if (player.velocityY > 0 && player.y + player.height - 10 < enemy.y) {
            localScore += 200;
            setScore(localScore);
            player.velocityY = -8;
            return false; // Remove enemy
          } else {
            // Player hit enemy from side
            localLives -= 1;
            setLives(localLives);
            player.x = 100;
            player.y = 400;
            player.velocityY = 0;

            if (localLives <= 0) {
              setGameOver(true);
              cancelAnimationFrame(animationId);
              return true;
            }
          }
        }
        return true;
      });

      // Fall off screen
      if (player.y > canvas!.height) {
        localLives -= 1;
        setLives(localLives);
        player.x = 100;
        player.y = 400;
        player.velocityY = 0;

        if (localLives <= 0) {
          setGameOver(true);
          cancelAnimationFrame(animationId);
        }
      }

      // Win condition
      if (coins.every(coin => coin.collected) && enemies.length === 0) {
        localScore += 1000;
        setScore(localScore);
        // Respawn coins and enemies
        coins.forEach(coin => coin.collected = false);
        enemies = [
          { x: 400, y: 518, width: 30, height: 30, velocityX: 2, minX: 300, maxX: 500 },
          { x: 600, y: 220, width: 30, height: 30, velocityX: 1.5, minX: 600, maxX: 750 },
        ];
      }
    }

    // Draw game
    function draw() {
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = '#5c94fc';
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);

      // Draw clouds
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(100, 80, 25, 0, Math.PI * 2);
      ctx.arc(130, 80, 30, 0, Math.PI * 2);
      ctx.arc(160, 80, 25, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(500, 120, 25, 0, Math.PI * 2);
      ctx.arc(530, 120, 30, 0, Math.PI * 2);
      ctx.arc(560, 120, 25, 0, Math.PI * 2);
      ctx.fill();

      drawPlatforms();
      drawCoins();
      drawEnemies();
      drawPlayer();
    }

    // Game loop
    function gameLoop() {
      update();
      draw();
      animationId = requestAnimationFrame(gameLoop);
    }

    gameLoop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', () => {});
      window.removeEventListener('keyup', () => {});
    };
  }, [gameOver]);

  const resetGame = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
  };

  return (
    <div className="game-container">
      <div className="game-info">
        <div>Score: {score}</div>
        <div>Lives: {lives}</div>
      </div>
      <canvas ref={canvasRef} />
      <div className="instructions">
        Arrow Keys or A/D to move | Space to jump | Jump on enemies to defeat them | Collect all coins!
      </div>
      {gameOver && (
        <div className="game-over">
          <div>GAME OVER</div>
          <div style={{ fontSize: '16px', marginTop: '10px' }}>Final Score: {score}</div>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}
    </div>
  );
}
