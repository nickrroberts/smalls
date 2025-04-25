    function GameBoard () {
        let board = [[0,0,0], 
                     [0,0,0],
                     [0,0,0]
                ];
        function playToken (move, player) {
            if (!determineValidMove(move)) {
                console.log("Invalid move, please try again.");
                return false;
            }
            const [row, col] = move;
            board[row][col] = player.token;
            
            return true;
        }

        function determineValidMove(move) {
            const [row, col] = move;
            return board[row][col] === 0;
        }

        function showGameBoard () {
            console.table(board);

        }
        
        function checkWin() {
            const winningLines = [];

            winningLines.push(...board);

            for (let col = 0; col < 3; col++) {
                winningLines.push([board[0][col], board[1][col], board[2][col]]);
            }

            winningLines.push([board[0][0], board[1][1], board[2][2]]);
            winningLines.push([board[0][2], board[1][1], board[2][0]]);

            for (let line of winningLines) {
                if (line.every(cell => cell === 1)) {
                    launchConfetti();
                    return "Winner: Player One!";
                }
                if (line.every(cell => cell === 2)) {
                    launchConfetti();
                    return "Winner: Player Two!";
                } 
            }

            if (board.flat().every(cell => cell !== 0)) return "Tie!";

            return false;


        }

        function launchConfetti() {
            const duration = 3000; // Confetti duration (3 seconds)
            const animationEnd = Date.now() + duration;
            const colors = ["#ff0000", "#00ff00", "#ffff00"]; // Red, Green, Yellow
        
            function randomInRange(min, max) {
                return Math.random() * (max - min) + min;
            }
        
            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();
        
                if (timeLeft <= 0) {
                    clearInterval(interval);
                    return;
                }
        
                // Fire confetti from multiple positions across the screen
                confetti({
                    particleCount: 50,
                    startVelocity: 30,
                    spread: 360, // Spread in all directions
                    origin: {
                        x: randomInRange(0, 1), // Random horizontal position
                        y: randomInRange(0, 1), // Random vertical position
                    },
                    colors: colors,
                });
            }, 300);
        }

        return {playToken, determineValidMove, showGameBoard, checkWin}

    }

    function GameController (playerOneName = "Player 1", playerTwoName = "Player 2") {
        let board = GameBoard();
        let playerMove;
        const article = document.querySelector("article");
        const moveMessage = document.getElementById("moveMessage");
        const notices = document.getElementById("notices");
        const resetBtn = document.querySelector("button"); 
        const players = [
            {
                name: playerOneName,
                token: 1,
                symbol: "x-token"
            },
            {
                name: playerTwoName,
                token: 2,
                symbol: "o-token"
            }
        ]

        let activePlayer = players[0];

        function switchActivePlayer(player) {
            if (player == players[0]) {
                activePlayer = players[1]
            } else {activePlayer = players[0]}
        }
        
        article.addEventListener("click", (event) => {
            
            let target = event.target;
        
            if (target.hasAttribute("data-id") || (target.parentElement && target.parentElement.hasAttribute("data-id"))) {
                if (target.parentElement.hasAttribute("data-id")) target = target.parentElement;
                playerMove = target.getAttribute("data-id").split(",").map(Number);
                
                let moveValid = board.playToken(playerMove, activePlayer);
               
                if (!moveValid) {
                    notices.style.color = "red";
                    notices.textContent = "Can't move there! Try again";
                    return;  
                }
        
                notices.textContent = "";
        
                let token = document.createElement("img");
                token.setAttribute("src", `${activePlayer.symbol}.svg`);
                token.classList.add("token");
                event.target.appendChild(token);
        
                let result = board.checkWin();
                if (result !== false) {
                
                    moveMessage.style.color = "#0f0";
                    moveMessage.textContent = result;
                    return;
                }
        
                switchActivePlayer(activePlayer);
                playRound();
            }
        }); 

        resetBtn.addEventListener('click', () => {
            board = GameBoard();
            notices.textContent = "";
            document.querySelectorAll("div.cell").forEach(div => {
                div.innerHTML = "";
            });
            activePlayer = players[0];
            moveMessage.style.color = "white";
            moveMessage.textContent = "New game! Player 1 starts again.";
            
        })

        function playRound () {
            moveMessage.textContent = `Alright, ${activePlayer.name}. What's your move?`;   
        }

        playRound();
        


    }

    let game = GameController();