let leaderboard = [];
let playerName = '';
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const menuOptions = [
  { text: 'JOGAR', x: canvas.width / 2 - 50, y: canvas.height / 2 - 40, width: 100, height: 30 },
  { text: 'Configurações', x: canvas.width / 2 - 50, y: canvas.height / 2, width: 150, height: 30 },
  { text: 'Como Jogar', x: canvas.width / 2 - 50, y: canvas.height / 2 + 40, width: 150, height: 30 },
];
const spaceshipWidth = 50;
const spaceshipHeight = 50;
const obstacleWidth = 100;
const obstacleHeight = 20;
const gravity = 0.25;
let obstacleFrequency = 100;
let obstacleTimer = 0;

const backgroundImage = new Image();
backgroundImage.src = 'c1.jpg';
backgroundImage.onload = function () {
  game()
};

const spaceshipImageNoWings = new Image();
spaceshipImageNoWings.src = 'pBIRDN.png';


const smallObstacleImage = new Image();
smallObstacleImage.src = 'MEDo.png';


const spaceshipImage = new Image();
spaceshipImage.src = 'pBIRD.png';
const obstacleImage = new Image();
obstacleImage.src = 'BIGo.png';

let spaceship = {
  x: 50,
  y: canvas.height / 2 - spaceshipHeight / 2,
  dy: 0,
};
let obstacles = [];
let score = 0;
let bullets = [];
const bulletSpeed = 10;
let gameState = 'menu';

function showMenu() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '40px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText('Magic Race', canvas.width / 2 - 100, canvas.height / 2 - 100);
  ctx.font = '20px Arial';
  menuOptions.forEach(option => {
    ctx.fillStyle = option.hover ? 'yellow' : 'white';
    ctx.fillText(option.text, option.x, option.y);
  });
  ctx.fillStyle = 'white';
  ctx.fillText('Top 5 Players:', 10, 100);
  if (gameState === 'menu') {
    leaderboard.slice(0, 5).forEach((entry, index) => {
      ctx.fillText(`${index + 1}. ${entry.name}: ${entry.score}`, 10, 130 + index * 30);
    });
  }
}


function showNameInputScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '40px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText('Digite seu nome:', canvas.width / 2 - 100, canvas.height / 2 - 100);
}
function drawPaused() {
  ctx.font = '40px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText('Jogo Pausado', canvas.width / 2 - 100, canvas.height / 2 - 40);
  ctx.font = '20px Arial';
  ctx.fillText('Pressione P para continuar', canvas.width / 2 - 100, canvas.height / 2);
  ctx.fillText('Pressione R para reiniciar', canvas.width / 2 - 100, canvas.height / 2 + 40);
}
function drawMenuButton() {
  const button = { x: canvas.width - 100, y: 10, width: 80, height: 30 };

  ctx.strokeStyle = 'white';
  ctx.strokeRect(button.x, button.y, button.width, button.height);
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText('Menu', button.x + 20, button.y + 20);
}
function saveLeaderboard() {
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}
function loadLeaderboard() {
  const storedLeaderboard = localStorage.getItem('leaderboard');
  if (storedLeaderboard) {
    leaderboard = JSON.parse(storedLeaderboard);
  }
}

function drawBullets() {
  ctx.fillStyle = 'yellow';
  for (const bullet of bullets) {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }
}
function drawScore() {
  ctx.font = '20px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`Pontuação: ${score}`, 10, 30);
}

function drawSpaceship() {
  if (spaceship.dy > 0) {
    ctx.drawImage(spaceshipImageNoWings, spaceship.x, spaceship.y, spaceshipWidth, spaceshipHeight);
  } else {
    ctx.drawImage(spaceshipImage, spaceship.x, spaceship.y, spaceshipWidth, spaceshipHeight);
  }
}

function updateSpaceship() {

  spaceship.dy += gravity;
  spaceship.y += spaceship.dy;

  if (spaceship.y < 0) {
    spaceship.y = 0;
    spaceship.dy = 0;
  }

  if (spaceship.y + spaceshipHeight > canvas.height) {
    spaceship.y = canvas.height - spaceshipHeight;
    spaceship.dy = 0;
  }
}
function updateBullets() {
  for (let i = 0; i < bullets.length; i++) {
    const bullet = bullets[i];
    bullet.x += bulletSpeed;

    if (bullet.x > canvas.width) {
      bullets.splice(i, 1);
      i--;
      continue;
    }

    for (let j = 0; j < obstacles.length; j++) {
      const obstacle = obstacles[j];
      if (
        bullet.x + bullet.width > obstacle.x &&
        bullet.x < obstacle.x + obstacle.width &&
        bullet.y + bullet.height > obstacle.y &&
        bullet.y < obstacle.y + obstacle.height
      ) {
        if (obstacle.isSmall) {
          bullets.splice(i, 1);
          i--;
          obstacles.splice(j, 1);
          j--;
          score += 5; // Adiciona 5 pontos ao destruir um obstáculo
        }
        break;
      }
    }
  }
}
function updateObstacles() {
  obstacleTimer++;

  if (obstacleTimer > obstacleFrequency) {
    obstacleTimer = 0;
    obstacleFrequency *= 0.99; // Diminua a frequência dos obstáculos para aumentar a dificuldade

    const gapSize = 150;
    const minGapY = 50;
    const maxGapY = canvas.height - minGapY - gapSize;
    const gapY = Math.random() * (maxGapY - minGapY) + minGapY;

    const topObstacleHeight = gapY - minGapY;
    const bottomObstacleHeight = canvas.height - (gapY + gapSize);

    // Obstáculo superior
    obstacles.push({
      x: canvas.width,
      y: 0,
      width: obstacleWidth,
      height: topObstacleHeight,
    });

    // Obstáculo inferior
    obstacles.push({
      x: canvas.width,
      y: gapY + gapSize,
      width: obstacleWidth,
      height: bottomObstacleHeight,
    });

    // Obstáculos do meio
    if (Math.random() < 0.5) {
      const minHeight = 40; // Altura mínima dos obstáculos menores
      const maxHeight = 60; // Altura máxima dos obstáculos menores
      const randomHeight = Math.random() * (maxHeight - minHeight) + minHeight;

      const safeMargin = 20; // Margem para garantir que o obstáculo menor não toque nos obstáculos maiores

      const minY = topObstacleHeight + safeMargin;
      const maxY = (gapY + gapSize) - safeMargin - randomHeight;

      const randomY = Math.random() * (maxY - minY) + minY;

      obstacles.push({ x: canvas.width, y: randomY, width: obstacleWidth, height: randomHeight, isSmall: true });
    }
  }

  for (let i = 0; i < obstacles.length; i++) {
    const obstacle = obstacles[i];
    obstacle.x -= 5;

    if (obstacle.x + obstacleWidth < 0) {
      obstacles.splice(i, 1);
      i--;
    } else {
      // Verifica se a nave está dentro dos limites do obstáculo
      const withinX = spaceship.x + spaceshipWidth > obstacle.x && spaceship.x < obstacle.x + obstacle.width;
      const withinY = spaceship.y + spaceshipHeight > obstacle.y && spaceship.y < obstacle.y + obstacle.height;

      if (withinX && withinY) {
        gameOver();
        return;
      }
    }
  }
}


function gameOver() {
  gameState = 'gameOver';

  // Verifica se o jogador já está no leaderboard
  const existingPlayerIndex = leaderboard.findIndex(entry => entry.name === playerName);

  if (existingPlayerIndex !== -1) {
    // Se o jogador já está no leaderboard, atualize sua pontuação se for maior que a anterior
    if (score > leaderboard[existingPlayerIndex].score) {
      leaderboard[existingPlayerIndex].score = score;
    }
  } else {
    // Se o jogador não está no leaderboard, adicione-o
    leaderboard.push({ name: playerName, score });
  }

  // Ordena o leaderboard
  leaderboard.sort((a, b) => b.score - a.score);

  saveLeaderboard();

  showMessage('Game Over!', [
    { text: 'Pressione R para reiniciar' },
  ]);
}


function pauseGame() {
  drawBackground();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (gameState === 'playing') {
    gameState = 'paused';
    showMessage('Jogo Pausado', [
      { text: 'Pressione P para continuar' },
      { text: 'Pressione R para reiniciar' },
    ]);
  } else if (gameState === 'paused') {
    gameState = 'playing';
  } else if (gameState === 'gameOver') {
    showMessage('Game Over!', [
      { text: 'Pressione R para reiniciar' },
    ]);
  }
}

function resetGame() {
  spaceship = {
    x: 50,
    y: canvas.height / 2 - spaceshipHeight / 2,
    dy: 0,
  };
  obstacles = [];
  bullets = [];
  score = 0;
  gameState = 'playing';
  obstacleFrequency = 100; // Redefinir a frequência dos obstáculos
}


function showMessage(message, options) {
  ctx.font = '40px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(message, canvas.width / 2 - 100, canvas.height / 2);

  ctx.font = '20px Arial';
  options.forEach((option, index) => {
    ctx.fillText(option.text, canvas.width / 2 - 100, canvas.height / 2 + 40 + index * 30);
  });
}

function drawObstacles() {
  obstacles.forEach(obstacle => {
    if (obstacle.isSmall) {
      ctx.drawImage(smallObstacleImage, 0, 0, smallObstacleImage.width, smallObstacleImage.height, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    } else {
      ctx.drawImage(obstacleImage, 0, 0, obstacleImage.width, obstacleImage.height, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
  });
}

function game() {
  drawBackground();
  if (gameState === 'menu') {
    showMenu();
  } else {
    drawMenuButton();
    if (gameState === 'settings') {
      showSettings();
    } else if (gameState === 'howToPlay') {
      showHowToPlay();
    } else {
      drawSpaceship();
      drawObstacles();
      drawBullets();
      drawScore();
      if (gameState === 'playing') {
        updateSpaceship();
        updateObstacles();
        updateBullets();
        checkSpaceshipPassedObstacles();
      } else if (gameState === 'paused') {
        drawPaused();
      } else if (gameState === 'gameOver') {
        showMessage('Game Over!', [
          { text: 'Pressione R para reiniciar' },
        ]);
      }
      checkSpaceshipCollision();
    }
  }
  requestAnimationFrame(game);
}




function drawBackground() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function handleKeyPress(e) {
  if (e.key === 'Enter') {
    if (gameState === 'nameInput') {
      handleEnterPress(); // Adicione esta linha
    } else {
      const bullet = {
        x: spaceship.x + spaceshipWidth,
        y: spaceship.y + spaceshipHeight / 2 - 5,
        width: 10,
        height: 10,
      };
      bullets.push(bullet);
    }
  }
}

function handleEnterPress() {
  playerName = nameInput.value;
  nameInput.value = '';
  nameInput.style.display = 'none';
  gameState = 'menu'; 
}

function drawBackButton() {
  const button = {
    x: 10,
    y: canvas.height - 40,
    width: 80,
    height: 30
  };
  ctx.strokeStyle = 'white';
  ctx.strokeRect(button.x, button.y, button.width, button.height);
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText('Voltar', button.x + 20, button.y + 20);
}

function checkMenuButtonClick(mouseX, mouseY) {
  const button = { x: canvas.width - 100, y: 10, width: 80, height: 30 };

  if (
    mouseX > button.x &&
    mouseX < button.x + button.width &&
    mouseY > button.y &&
    mouseY < button.y + button.height
  ) {
    gameState = 'menu';
  }
}


function checkSpaceshipPassedObstacles() {
  for (const obstacle of obstacles) {
    if (!obstacle.passed && spaceship.x > obstacle.x + obstacle.width) {
      obstacle.passed = true;
      score += 10; // Adiciona 10 pontos ao passar pelo meio dos obstáculos
    }
  }
}

function showSettings() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '40px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText('Configurações', canvas.width / 2, canvas.height / 2 - 100);
  drawBackButton();
}

function showHowToPlay() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '40px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText('Como Jogar', canvas.width / 2 - 100, canvas.height / 2 - 100);
  ctx.font = '20px Arial';
  ctx.fillText('Use a barra de espaço para pular.', canvas.width / 2 - 150, canvas.height / 2 - 40);
  ctx.fillText('Pressione Enter para atirar.', canvas.width / 2 - 150, canvas.height / 2);
  ctx.fillText('Pressione P para pausar e R para reiniciar.', canvas.width / 2 - 150, canvas.height / 2 + 40);
  drawBackButton();
}

function checkBackButtonClick(mouseX, mouseY) {
  const button = { x: 10, y: canvas.height - 40, width: 80, height: 30 };

  if (
    mouseX > button.x &&
    mouseX < button.x + button.width &&
    mouseY > button.y &&
    mouseY < button.y + button.height
  ) {
    gameState = 'menu';
  }
}


function updateScore() {
  score++;
}
let imagesToLoad = 3; // Atualize esse valor com o número total de imagens que você está carregando

function imageLoaded() {
  imagesToLoad--;

  if (imagesToLoad === 0) {
    game();
  }
}

backgroundImage.onload = imageLoaded;
smallObstacleImage.onload = imageLoaded;
spaceshipImage.onload = imageLoaded;
obstacleImage.onload = imageLoaded;

canvas.addEventListener('click', handleCanvasClick);

document.addEventListener('keydown', event => {
  if (event.code === 'Enter' && gameState === 'menu') {
    gameState = 'playing';
  } else if (event.code === 'Space') {
    spaceship.dy = -6;
  } else if (event.code === 'Enter') {
    bullets.push({
      x: spaceship.x + spaceshipWidth,
      y: spaceship.y + spaceshipHeight / 2,
      width: 10,
      height: 5,
    });
  } else if (event.code === 'KeyP') {
    pauseGame();
  } else if (event.code === 'KeyR') {
    resetGame();
  }
});



canvas.addEventListener('click', event => {
  const mouseX = event.clientX - canvas.getBoundingClientRect().left;
  const mouseY = event.clientY - canvas.getBoundingClientRect().top;

  if (gameState === 'menu') {
    menuOptions.forEach(option => {
      if (
        mouseX > option.x &&
        mouseX < option.x + option.width &&
        mouseY > option.y - option.height &&
        mouseY < option.y
      ) {

      }
    });
  } else if (gameState === 'playing' || gameState === 'gameOver') {
    checkMenuButtonClick(mouseX, mouseY);
  } else if (gameState === 'settings' || gameState === 'howToPlay') {
    checkBackButtonClick(mouseX, mouseY);
  }
});
document.addEventListener('DOMContentLoaded', function () {
  const nameModal = document.getElementById('nameModal');
  const submitName = document.getElementById('submitName');
  let playerName = '';

  nameModal.style.display = 'block';

  submitName.onclick = function () {
    playerName = document.getElementById('playerName').value;
    if (playerName.trim() !== '') {
      nameModal.style.display = 'none';
      // Inicie o jogo aqui
    } else {
      alert('Por favor, insira um nome válido.');
    }
  };
});


function handleCanvasClick(event) {
  const mouseX = event.clientX - canvas.getBoundingClientRect().left;
  const mouseY = event.clientY - canvas.getBoundingClientRect().top;

  if (gameState === 'menu') {
      menuOptions.forEach(option => {
          if (mouseX > option.x && mouseX < option.x + option.width && mouseY > option.y - option.height && mouseY < option.y) {
              if (option.text === 'JOGAR') {
                  gameState = 'playing';
              } else if (option.text === 'Configurações') {
                  gameState = 'settings';
              } else if (option.text === 'Como Jogar') {
                  gameState = 'howToPlay';
              }
          }
      });
  } else if (gameState === 'settings' || gameState === 'howToPlay') {
      if (mouseX > 10 && mouseX < 10 + 150 && mouseY > 420 - 50 && mouseY < 420) {
          gameState = 'menu';
      }
  }
}

const gameLoop = setInterval(game, 1000 / 60);
const nameModal = document.getElementById("nameModal");
const playerNameInput = document.getElementById("playerName");
const submitNameBtn = document.getElementById("submitName");

submitNameBtn.addEventListener("click", () => {
  if (playerNameInput.value.trim() !== "") {
    playerName = playerNameInput.value.trim();
    nameModal.style.display = "none";
    gameState = "menu";
  }
});
function handleCanvasMouseMove(event) {
  const mouseX = event.clientX - canvas.getBoundingClientRect().left;
  const mouseY = event.clientY - canvas.getBoundingClientRect().top;

  if (gameState === 'menu') {
    menuOptions.forEach(option => {
      if (
        mouseX > option.x &&
        mouseX < option.x + option.width &&
        mouseY > option.y - option.height &&
        mouseY < option.y
      ) {
        option.hover = true;
      } else {
        option.hover = false;
      }
    });
  }
}

canvas.addEventListener('click', handleCanvasClick);
canvas.addEventListener('mousemove', handleCanvasMouseMove);


loadLeaderboard();
game();