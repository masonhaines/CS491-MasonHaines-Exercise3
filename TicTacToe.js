/* Mason Haines 6/6/2025 */

/**
 * anonymous immediately invoked function that will execute immediately after being called
 * https://www.youtube.com/watch?v=SMUHorBkVsY
 */

(function(){

    /*****************************************************************************************
    * *****************************************************************************************
    * *****************************************************************************************
    *                                    UI and DOM               
    * *****************************************************************************************
    * *****************************************************************************************                           
    *****************************************************************************************/



    /**
 * @param {string} currentPlayer - the current players character will be X or O
 * @param {string[]} options - array that holds the current state of the array 
 * @param {boolean} running - the current state of the game, whether it is running or not 
 * @param {number[][]} winConditions - 2d array of possible win conditions with in the gam e
 * @param {html} cells - query all cells on the tic tac toe board
 * @param {html} clearButton - query select the h3 header with id statusText
 * @param {html} startButton - query select the button with id clearButton
 * @param {html} statusText - query select the button with id startButton
 */

    const cells = document.querySelectorAll(".cell"); // query all cells on the tic tac toe board
    const statusText = document.querySelector("#statusText");  // query select the h3 header with id statusText
    const clearButton = document.querySelector("#clearButton"); // query select the button with id clearButton
    const startButton = document.querySelector("#startButton"); // query select the button with id startButton
    const changePlayerButton = document.querySelector("#changePlayerButton"); // query select the button with id ChangePlayerButton


    const winConditions = [

        [0,1,2], 
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]

    ];

    let options = ["", "", "", "", "", "", "", "", "" ];
    let currentPlayer = "X";
    let running = false;
    let handicapUsed = false;
    let computerIsFirstPlayer = false;

    startGame();
    
    /**
     * prompts user to start a new game and initializes the start button to have an event listener for click
     * on click calls initGame to make game playable 
     */

    function startGame() {

        displayFirstPlayerMessage();
        startButton.addEventListener("click", initGame);
        ChooseStartingPlayer();
    }

    /**
     * chnages the first player that can move 
     */
    function ChooseStartingPlayer() {

        changePlayerButton.addEventListener("click", changePlayer);
    }

    /**
     * makes game playable setting running to now true
     * gives functionality to start a game and removes the event listener from the start button
     * and creates and event listener for the clear button which calls restart game on click
     */

    function initGame() {

        if(!running) {
            running = true;
        }
        
        displayCurrentPlayerForStatusText();
        initCells();
        enableClearButton();
        startButton.removeEventListener("click", initGame);  // create event listener for start button to begin a new game 
        changePlayerButton.removeEventListener("click", changePlayer);
    }

    /**
     * adds event listener to clear button, is used if game is running 
     * is called in init game and computer selection
     */

    function enableClearButton() {

        if(running){
            // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
            clearButton.addEventListener("click", restartGame);
        }
    }

    /**
     * function essentially alows either the player or computer to make a move depending on the currentplayer string 
     * helper function to re init the cells object adding the event listern for clicked 
     * additonally resetting the color of the text content color of the cells 
     */

    function initCells() {

        if (currentPlayer === "X") {
            cells.forEach(cell => cell.addEventListener("click", cellClicked)); // addEventListener(type, listener) 
        }
        else if (currentPlayer === "O") {
            computerSelection();
        }
        
        cells.forEach(color => color.style.color = "black"); // reset color for all cell text content
    }

    /**
     * event handler for when a cell is clicked during gameplay
     * gets the clicked cell index, prevents moves if cell is taken or game is not running
     * updates the cell with user's choice and checks for a win condition
     * @param {MouseEvent} event - web browser provided object that gives us feedback when mouse action is provided
     * for this instance we are looking for a cellindex to be clicked
     */

    function cellClicked(event) {

        const cellIndex = event.target.getAttribute("cellIndex"); // this refers to what ever cell is clicked on screen by user

        if (options[cellIndex] != "" || !running ) {
            return;
        }

        updateUsersChoiceCell(event.target, cellIndex);
        checkWinner();
    }

    /**
     * updates game state and UI for the selected cell that was passed by cellClicked
     * @param {number} index - The index of the cell in the options array
     * @param {html} cell - the cell element that was clicked during the event that was stored from cellClicked
     */

    function updateUsersChoiceCell (cell, index) {

        // options at the current index of cell clicked is being set to the current player either "X" or "O"
        options[index] = currentPlayer;
        if (cell) {
            cell.textContent = currentPlayer;
        }
    }

    /**
     * when this is called if the gamne is running and the handicap has not been use yet...
     * it will call the init cells again and that player will get a secoind move 
     * is called after a move is made by a player and toggles the current player between "x" and "O"
     * if the current player is "O", the function calls the computer selection function
     * at the end it updates the current player to the statusText tect content
     * @sideEffects - updates global game state (currentPlayer), calls UI update functions,
     * and may trigger the computer's move.
     */

    function changePlayer() {
        // console.trace();

        if (!handicapUsed && running) {
            handicapUsed = true;
            initCells();
            return;
        }

        if (currentPlayer == "X") {
            currentPlayer = "O";
        } else {
            currentPlayer = "X";
        }

        if (!running){
            displayFirstPlayerMessage();
            computerIsFirstPlayer = !computerIsFirstPlayer;
            return;
        }
     
        displayCurrentPlayerForStatusText();
        initCells();
    }

    /**
     * display the current player whos turn it is to move 
     * current player will display within the html element with statustext id 
     */

    function displayCurrentPlayerForStatusText() {

        statusText.textContent = `${currentPlayer}'s turn`;
        document.querySelector(".tooltiptext").style.visibility = "hidden";
    }

    function displayFirstPlayerMessage() {

        statusText.textContent = `First Player: ${currentPlayer} - Press Start to Play!`;
        document.querySelector(".tooltiptext").style.visibility = "visible";
    }

    /**
     * Checks for winner by calling function to check for three in a row
     * return from three in a row is set to boolean for round won
     * if no win but the board is full, declares a draw
     * otherwise calls changePlayer to continue the game
     */

    function checkWinner () {
        let roundWon = false;

        roundWon = checkForThreeInARow(false, options);

        if (roundWon) {

            statusText.textContent = `${currentPlayer} wins! Press Clear to restart game`;
            running = false;
        }
        else if (!options.includes("")) {

            statusText.textContent = `Draw! Press Clear to restart game`;
            running = false;
        }
        else {
            changePlayer();
        }
    }

    /**
     * gets specific elements that were verified for win and then changes the text content color of those cells
     * @param {number[]} condition - array of win elements that were the condition for winning 
     */

    function changeWinnerColors(condition) {
                
        cells[condition[0]].style.color = "red";
        cells[condition[1]].style.color = "red";
        cells[condition[2]].style.color = "red";
    }

    /**
     * remove event listeners for cells clicked as well,
     * for the restart game so the player has to wait their turn 
     * 
     */

    function removePlayerEventHandlers() {
        cells.forEach(cell => cell.removeEventListener("click", cellClicked));
        clearButton.removeEventListener("click", restartGame);
    }

    /**
     * resets the game state to its initial configuration for a new match
     * sets currentPlayer to "X", clears the options array and all cell text content
     * sets running and the handicap to false and calls startGame 
     */

    function restartGame () {
        
        resetGameState();
        displayCurrentPlayerForStatusText();
        cells.forEach(cell => cell.textContent = "");
        startGame();
    }

    /*****************************************************************************************
    * *****************************************************************************************
    * *****************************************************************************************
    *                                         LOGIC           
    * *****************************************************************************************
    * *****************************************************************************************                          
    *****************************************************************************************/


    /**
     * checks if a win condition is met by compring all combinations in winConditions
     * if a win is found, highlights the winning cells and returns true to checkwinner ends the game
     * @param {boolean} isComputer 
     * @param {number[]} tempOptions
     * @returns {number|boolean} - returns a best option vaie for machine move or returns true for a win condition
     * if no win condition returnvalue is init to zero so binary false 
     * @sideEffects - If isComputer is false and a win is found, modifies cell text color to red.
     */

    function checkForThreeInARow(isComputer, thisOptions) {

        let returnValue = 0;

        for(let i = 0; i < winConditions.length/*8*/; i++) {

            // so if condition is winConditions at index [0] it would be [0,1,2]
            // lets just say the options are all still empty " "
            // that would mean the new 3 element array, conditions, is empty at all indexes
            // that would mean that cellA cellb and cellC are empty as well because they are initialized to the value of the option array at ....
            // the value of the 3 element condition array and in this examplew would be [0,1,2] but could be [0,4,8] etc

            const condition = winConditions[i];
            const cellA = thisOptions[condition[0]];
            const cellB = thisOptions[condition[1]];
            const cellC = thisOptions[condition[2]];

            if (cellA == cellB && cellB == cellC ) {

                if (cellA == "" || cellB == "" || cellC == "") { continue; } // double final check

                if (!isComputer) {
                    changeWinnerColors(condition);
                    return true;
                } 
                else {
                    returnValue = 1;
                }
            } 
        }

        if (!isComputer) {
            return false;
        }

        return returnValue;
    }

    /**
     * Resets the internal game state to its initial values. this is passed to restart game
   
     */

    function resetGameState() {
        currentPlayer = "X";
        options = ["", "", "", "", "", "", "", "", ""];
        running = false;
        handicapUsed = false;
    }

    /**
     * removes event listeners for the player as well as the clear game button
     * If the computer is has the computer is frst player boolean as true then it will run the random location picker 
     * it will run this twice and after it has ran it twice it toggle that boolean to false and use
     * for loop that goes through simplified minimax algorithm to create best choice for computer
     * then function will place move check for a winner and if none re add event listeners
     */

    async function computerSelection() {

        let computerChoice; 
        let bestOption = -1;
        let bestOptionIndex = -1;

        removePlayerEventHandlers();

        if (computerIsFirstPlayer) {
            var randomNumber = Math.floor(Math.random() * 9);
            var randomOffset = Math.floor(Math.random() * 5);

            await sleep(2000); // dwell computer decision for x seconds
            for (let i = 0; i < options.length; i ++) {

                if (options[i] == "") {

                    if (randomNumber === i) {
                        computerChoice = i;
                        break;
                    }
                    else if (randomNumber - i >= randomOffset && randomNumber - i >= computerChoice) {
                        computerChoice = i;
                    }
                    else {
                        computerChoice = i;
                    }
                }
            }
        }

        if (!computerIsFirstPlayer) {

            await sleep(2000); // dwell computer decision for x seconds

            for (let i = 0; i < options.length; i++) {
                if (options[i] == "") {

                    let tempOptions = [...options]; // https://www.geeksforgeeks.org/javascript/how-to-clone-an-array-in-javascript/
                    tempOptions[i] = "X";
                    let gradeOfX = checkForThreeInARow(true, tempOptions); // grade is the value that is being stored for the best move

                    tempOptions = [...options]; 
                    tempOptions[i] = "O";
                    let gradeOfO = checkForThreeInARow(true, tempOptions); 

                    let gradeMAX = Math.max(gradeOfO, gradeOfX); // get the best grade from both O and X

                    // grade ius then compared here and the best grade will decide the best location to move. 
                    // if multiple locations have have the same grade moving to either will stillm create the same result
                    if (gradeMAX > bestOption) {
                        bestOption = gradeMAX;
                        bestOptionIndex = i;
                    }
                }
            }

            computerChoice = bestOptionIndex;
        }

        if (handicapUsed) {
            computerIsFirstPlayer = false;
        }

        enableClearButton();// return event listern for clear button
        options[computerChoice] = currentPlayer;
        cells[computerChoice].textContent = currentPlayer;
        checkWinner();
    }

       /**
     * creates a delay used to pause logic for a set amount of milli seconds
     * @param {number} ms - the number of milli seconds to delay
     * @returns {Promise} 
     */

    function sleep(ms) {
        return new Promise(resolve =>setTimeout(resolve, ms)); // https://youtu.be/pw_abLxr4PI?si=Tlfw1HBU92o0wX3B
    }

}());