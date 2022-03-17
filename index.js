// Settings
const itemSize = 25;
const colorSnake = false;
const randomSpawn = false;
const headColor = "#FF0000";
const foodColor = "#00FF00";
const snakeColor = "#FFFFFF";
const passThrough = false;
let fps = 4;
const difficulty = {
    "easy": 4,
    "medium": 6,
    "hard": 10
};

class Food {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = foodColor;
    }

    draw(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, itemSize, itemSize);
    }
}

class SnakePart {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        if (colorSnake) {
            this.color = "#" + genRanHex(6);
        } else {
            this.color = snakeColor;
        }
    }
    draw(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, itemSize, itemSize);
    }

}
const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

function getRandomMappedCoordinates(canvas) {
    var divisableCanvasX = canvas.width - (canvas.width % itemSize);
    var divisableCanvasY = canvas.height - (canvas.height % itemSize);
    var x = Math.floor((Math.random() * divisableCanvasX));
    var y = Math.floor((Math.random() * divisableCanvasY));
    x = x - (x % itemSize);
    y = y - (y % itemSize);
    return [x, y];
}

class Snake {
    constructor(canvas) {
        this.parts = [];
        if (randomSpawn)
            var coords = getRandomMappedCoordinates(canvas);
        else
            var coords = [100, 100]
        this.head = new SnakePart(coords[0], coords[1]);
        this.head.color = headColor;
        this.parts.push(this.head);
        this.direction = [1, 0];
        this.speed = itemSize * 1;
    }

    draw(context) {
        var canvas = document.querySelector('.game-canvas').getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.parts.forEach(function (currentValue) {
            currentValue.draw(context);
        })
    }

    eat() {
        var newPartCoords = [this.parts[this.parts.length - 1].x + itemSize * this.direction[0], this.parts[this.parts.length - 1].y] + itemSize * this.direction[1];
        var newPart = new SnakePart(newPartCoords[0], newPartCoords[1]);
        this.parts.push(newPart);
    }

    update() {
        let partsCopy = JSON.parse(JSON.stringify(this.parts));
        for (var i = 1; i < this.parts.length; i++) {
            var currentPart = this.parts[i];
            currentPart.x = partsCopy[i - 1].x;
            currentPart.y = partsCopy[i - 1].y;
        }
        this.parts[0].x += this.direction[0] * this.speed;
        this.parts[0].y += this.direction[1] * this.speed;
    }

}

class Game {
    constructor() {
        this.canvas = document.querySelector('.game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.snake = new Snake(this.canvas);
        this.foods = [];
        this.waitForRestart = false;
        this.generateFoods(3, this.canvas);
    }

    update() {

        var snake = this.snake;
        var ctx = this.ctx;
        var canvas = this.canvas;
        var foodToDelete = -1;
        this.foods.forEach(function (currentValue, index) {
            if (currentValue.x == snake.head.x && currentValue.y == snake.head.y) {
                snake.eat();
                foodToDelete = index;
            } else {
                currentValue.draw(ctx);
            }
        });
        if (foodToDelete != -1) {
            delete this.foods[foodToDelete];
            this.generateFoods(1, canvas);

        }
        this.snake.update();

        if (this.checkDeath())
            return;
        this.snake.draw(this.ctx);

    }

    checkDeath() {
        if (this.snake.head.x > this.canvas.width || this.snake.head.x < 0) {
            return true;
        } else if (this.snake.head.y > this.canvas.height || this.snake.head.y < 0) {
            return true;
        }

        var snake = this.snake;
        var collision = false;

        if (passThrough == false) {
            this.snake.parts.forEach(function (currentValue) {
                if (currentValue.x == snake.head.x && currentValue.y == snake.head.y && currentValue != snake.head) {
                    collision = true;
                    return;
                }
            });
        }

        return collision;
    }

    generateFoods(count, canvas) {
        for (var i = 0; i < count; i++) {
            var coords = getRandomMappedCoordinates(canvas);
            var x = coords[0];
            var y = coords[1];
            var collision = false;
            // Dirty way to check the food doesn't spawn within another food
            this.foods.forEach(function (currentValue) {
                if (currentValue.x == x && currentValue.y == y) {
                    collision = true;
                }
            });
            if (collision) {
                i--;
                continue;
            }
            // Dirty way to check the food doesn't spawn within the snake
            this.snake.parts.forEach(function (currentValue) {
                if (currentValue.x == x && currentValue.y == y) {
                    collision = true;
                }
            });
            if (collision) {
                i--;
                continue;
            }
            this.foods.push(new Food(x, y));
        }
    }

    gameover() {
        this.clear();
        this.ctx.fillStyle = snakeColor;

        this.ctx.font = '48px serif';
        this.ctx.fillText('Game Over! Score: ' + this.snake.parts.length, 10, 50);
        this.ctx.fillText('Press to restart', 10, 50 + 48);

        this.waitForRestart = true;



    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}





// Controls
document.addEventListener('keydown', function (event) {
    if (event.code == "ArrowUp" && game.snake.direction.toString() != [0, 1].toString()) {
        game.snake.direction = [0, -1];
    } else if (event.code == "ArrowDown" && game.snake.direction.toString() != [0, -1].toString()) {
        game.snake.direction = [0, 1];
    } else if (event.code == "ArrowLeft" && game.snake.direction.toString() != [1, 0].toString()) {
        game.snake.direction = [-1, 0];
    } else if (event.code == "ArrowRight" && game.snake.direction.toString() != [-1, 0].toString()) {
        game.snake.direction = [1, 0];
    }
});
document.addEventListener("click", function (event) {
    if (game.waitForRestart) {
        game = new Game();
        game.waitForRestart = false;
        runGame();
    }
});

var difficultyGroup = document.querySelector(".game-difficulty-wrapper");
difficultyGroup.addEventListener("click", function (e) {
    if (!e.target || e.target.matches(".game-difficulty-button") == false)
        return;

    var difficultyButton = e.target;
    var difficultyChosen = difficultyButton.dataset.difficulty;
    fps = difficulty[difficultyChosen];
    var difficultyLabel = document.querySelector('.game-difficulty-label');
    difficultyLabel.innerHTML = difficultyChosen;

});


// Game loop
var game = new Game();
async function runGame() {
    while (game.waitForRestart == false) {
        game.clear();
        game.update();
        if (game.checkDeath()) {
            game.gameover()
        }
        await new Promise(r => setTimeout(r, 1000 / fps));
    }
}

runGame();