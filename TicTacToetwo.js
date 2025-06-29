/* Mason Haines 6/26/2025 */

/**
 * anonymous immediately invoked function that will execute immediately after being called
 * https://www.youtube.com/watch?v=SMUHorBkVsY
 */


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
const playerDiceRollGuessInput = document.querySelector("#diceInputContainer"); // query select the input for the dice roll guess
const rollDiceButton = document.querySelector("#RollDice"); // query select the button for rolling the dice

let emptyGameState = {
    board: ["", "", "", "", "", "", "", "", "" ],
    currentPlayer: "",
    playerOneGuess: null, // Player 1's guess (1–6)
    playerTwoGuess: null, // Player 2's guess (1–6)
    diceRoll: null,        // Final die roll (1–6)
    isPlayerOne: [false, ""], // used to determine if the player is player one or two
    isPlayerTwo: [false, ""], // used to determine if the player is player one or two
}

let currentGameState = {
    board: ["", "", "", "", "", "", "", "", "" ],
    currentPlayer: "", 
    playerOneGuess: null,   // Player 1's guess (1–6)
    playerTwoGuess: null,   // Player 2's guess (1–6)
    diceRoll: null,         // Final die roll (1–6)
    isPlayerOne: [false, ""],  // used to determine if the player is player one or two
    isPlayerTwo: [false, ""],  // used to determine if the player is player one or two
}

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

// let options = ["", "", "", "", "", "", "", "", "" ];
// let currentPlayer = "O";
let running = false;
let firstGame = true; // used to determine if the game is being played for the first time
let playerOne = false; // used to determine if the player is player one or two
let playerTwo = false; // used to determine if the player is player one or two
let bothPlayersHaveGuessed = false; // used to determine if both players have guessed

let syncInterval; // global
let fileHandle, contents;


displayStartMessage(); // display the player message to enter a number and roll dice

// doesnt work unless outside of function call for some reason? maybe button is not yet in the DOM?
startButton.addEventListener("click", async () => {
    await createGameStateWithinFilePicker(); // this will create the game state within the file picker
    await updateLocalGameStateWithFilePicker(); // this will update the local game state with the file picker
    await reinitGameState(); // this will reinitialize the game state with the file picker
    await assignPlayerIdFromFile(); // this will assign the player if they are from a file
    await initGame(); // proceed only after file selected
    
});

setInterval(async () => {
    await updateLocalGameStateWithFilePicker(); // fetch latest board
    await updateFileGameStateWithFilePicker(); // update the file game state with the file picker

}, 2000);

async function reinitGameState() {

    await updateLocalGameStateWithFilePicker(); // this will update the local game state with the file picker
    // alert(currentGameState.isPlayerOne[0] + " this is the player one state");
    // alert(currentGameState.isPlayerTwo[0] + " this is the player two state");

    if (firstGame && (currentGameState.isPlayerOne[0] === false && currentGameState.isPlayerTwo[0] === false)) {
        // statusText.textContent = `this is the first game, reinitializing game state...`;
        // sleep(2000); // wait for 1 second to allow the user to see the message
        // firstGame = false; // set first game to false so that the handicap can be used
        await initGameStateToFile(); // initialize the game state to the file system
        await updateLocalGameStateWithFilePicker(); // update the local game state with the file picker
        return;
    }

    if (firstGame && (currentGameState.isPlayerOne[0] && currentGameState.isPlayerTwo[0])) {
        // statusText.textContent = `this is the first game, reinitializing game state...`;
        // sleep(2000); // wait for 1 second to allow the user to see the message
        // firstGame = false; // set first game to false so that the handicap can be used
        await initGameStateToFile(); // reinitialize the game state to the file system
        await updateLocalGameStateWithFilePicker(); // update the local game state with the file picker
        return;

    }
}        


diceInputValue.addEventListener("keydown", async (event) => {
    
    if (event.key === "Enter") {
        await ChooseStartingPlayerByRollingDice();
    
    }

});



async function createGameStateWithinFilePicker() {
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker?utm_source=chatgpt.com
    // Here we set the options object for passing into the method. We'll allow a selection of image file types, 
    // with no option to allow for all files types, or multiple file selection.
    const pickerOptions = {
        types: [{       
            description: 'JSON Files',
            accept : {'application/json': ['.json']} // this will accept only json files
        }],
        excludeAcceptAllOption: true,
    };

    [fileHandle] = await window.showOpenFilePicker(pickerOptions); // this will open the file picker dialog to select a file

    const errorBool = await catchErrorWithFilePicker(fileHandle); // this will catch any errors with the file picker
    if (errorBool !== false) {
        let fileData = await fileHandle.getFile(); // this will get the file data from the file handle, 
        // Returns a Promise which resolves to a File object representing the state on disk of the entry represented by the handle.
        // contents = await fileData.text(); // this will read the file data as text
        // alert(contents);
        // alert("File selected: " + fileData.name); // this will alert the user that the file has been selected
    }
    else {
        alert("No file selected or an error occurred. Please refresh the page and try again.");
        return; // if there was an error with the file picker, we will return and not proceed
    }
    
    // initGameStateToFile(); // this will initialize the game state to the file system on a fresh game
}

/**
 * Updates the local game state with the file picker.
 * If the current game state has player one or player two assigned, it will set the respective player to true.
 * If both players are already assigned, it will alert the user and close the window.
 * @returns  {void} - this will return void if the player ID is already set to 1 or 2
 */
async function assignPlayerIdFromFile() {
    // update the local game state with the file picker
    if (firstGame) {
        await updateLocalGameStateWithFilePicker(); // this will update the local game state with the file picker

        // check if the current game state has player one or player two assigned
        if (!currentGameState.isPlayerOne[0]) {
            currentGameState.isPlayerOne[0] = true;
            playerOne = true; // set player one to true
            // alert("You are Player One.");
            // alert(currentGameState.isPlayerOne[0]);
            await updateFileGameStateWithFilePicker(); // this will update the file game state with the file picker

        } else if (!currentGameState.isPlayerTwo[0]) {
            // alert("Player One is already assigned. Assigning Player Two.");
            currentGameState.isPlayerTwo[0] = true;
            playerTwo = true; // set player two to true
            // alert("You are Player Two.");
            // alert(currentGameState.isPlayerTwo[0]);
            await updateFileGameStateWithFilePicker(); // this will update the file game state with the file picker

        } else {
            alert("Both players are already assigned. Please refresh the page to start a new game.");
            window.location.reload(); // close the window if both players are already assigned
            return;
        }

        // update the current game state with the file picker
        firstGame = false; // set first game to false so that the handicap can be used

        await updateFileGameStateWithFilePicker(); // this will update the file game state with the file picker
    }
}


/**
 * Creates a unique player ID for each player.  
 * If the player ID is already set to 1 or 2, it will alert the user and not proceed.
 * If the player ID is not set, it will check localStorage for playerOne and playerTwo.
 * If playerOne is not set, it will set the player ID to 1 and store it in sessionStorage.
 * If playerTwo is not set, it will set the player ID to 2 and store it in sessionStorage.
 * If both playerOne and playerTwo are already set, it will alert the user and close the window.
 * this function is used as its own form of state management to determine which player is which inside of the browser tab
 * @returns {void} - this will return void if the player ID is already set to 1 or 2
 */


// localStorage is partitioned by browser tabs and by origin. The main document, and all embedded browsing contexts (iframes), 
// are grouped by their origin and each origin has access to its own separate storage area. 
// Closing the browser tab destroys all localStorage data associated with that tab.
// async function createPlayerId() {
//     // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API

//     const storedID = sessionStorage.getItem("playerID");
//     alert("session storedID: " + storedID);

//     // Check if the player ID is already set in sessionStorage
//     // If it is set to 1 or 2, we will alert the user and not proceed
//     if (storedID === "1") {
//         alert("Restoring Player 1 from sessionStorage");
//     } else if (storedID === "2") {
//         alert("Restoring Player 2 from sessionStorage");
//     } 
//     else { // If the player ID is not set, we will check localStorage for playerOne and playerTwo
//         // check if playerOne and playerTwo are already set in localStorage
//         // local storage is used to store data that is accessible across browser tabs and windows
//         // session storage is used to store data that is only accessible within the current browser tab
//         const existingPlayerOne = localStorage.getItem("playerOne") ; // should be null if not set
//         const existingPlayerTwo = localStorage.getItem("playerTwo") ; // should be null if not set

//         alert("existingPlayerOne: " + existingPlayerOne);
//         alert("existingPlayerTwo: " + existingPlayerTwo);

//         if (!existingPlayerOne) {
//             alert("Assigning Player 1");
//             localStorage.setItem("playerOne", "true"); // tracks global player one state
//             sessionStorage.setItem("playerID", "1"); // tracks current player ID in session storage which is local to the tab
//         } else if (!existingPlayerTwo) {
//             alert("Assigning Player 2");
//             localStorage.setItem("playerTwo", "true"); // tracks global player two state
//             sessionStorage.setItem("playerID", "2"); // tracks current player ID in session storage which is local to the tab
//         } else { // If both playerOne and playerTwo are already set, we will alert the user and close the window
//             alert("Two players already connected.");
//             window.close();
//             return;
//         }
//     }

//     await updateFileGameStateWithFilePicker();
//     console.log("You are currently set to player:", currentGameState.playerID);
//     alert("You are currently set to player: " + sessionStorage.getItem("playerID")); // alert the user of their player ID
// }

/**
 * Initializes the selected file with the initial game state.
 * Overwrites the contents of the chosen gameState.json file with an empty board and starting player.
 * this is called when the game is first started or when a new game is created.
 */

async function initGameStateToFile() {
    // this is to initialize the game state to the file system
    const gameStateFile = await fileHandle.createWritable();    
    contents = JSON.stringify(emptyGameState); // this is just a placeholder for the game state, it will be replaced with the actual game state
    await gameStateFile.write(contents);
    await gameStateFile.close();
    // alert("Game state initialized to file system.");
}

/**
 * in a nut shell this function will update the local game state with the file picker
 * it is reading the file via the text method and then parsing the contents as JSON
 */

async function updateLocalGameStateWithFilePicker() {
    // this is to update the game state with the file picker
    // alert("Updating local game state with file picker...");
    const currentFile = await fileHandle.getFile(); // this will read the file data as text
    contents = await currentFile.text();
    currentGameState = JSON.parse(contents); // Converts a JavaScript Object Notation (JSON) string into an object. function definition
}

async function updateFileGameStateWithFilePicker() {
    // this is to update the game state with the file picker
    // alert("Updating file game state with file picker...");
    const permission = await fileHandle.requestPermission({ mode: 'readwrite' });
    if (permission !== 'granted') {
        alert("Write permission denied.");
        return;
    }
    const currentFile = await fileHandle.createWritable(); // this will create a writable stream to the file
    console.log("Current board before write:", currentGameState.board);

    contents = JSON.stringify(currentGameState); // this will convert the current game state to a JSON string
    await currentFile.write(contents); // this will write the contents to the file
    await currentFile.close(); // this will close the file handle
    // alert("Game state updated to file system.");


    // alert("Writing contents:\n" + JSON.stringify(currentGameState, null, 2));

}

async function catchErrorWithFilePicker(fileHandle) {
    // this is to catch any errors with the file picker
    if (!fileHandle) {
        alert("No file selected or an error occurred.");
        let leave = (event) => {
            if (event.keyCode === 27) {
                // document.removeEventListener("keydown", leave);
                return;
            }
        };
        document.addEventListener("keydown", leave);
        createGameStateWithinFilePicker(); // recursively call the function to prompt the user again
        return false;
    }

    const fileData = await fileHandle.getFile();
    if (fileData.name !== "gameState.json") {
        alert("Wrong file selected. Please choose gameState.json.");
                    alert("Please select a file named gamestate.json to save the game state.");
        let leave = (event) => {
            if (event.keyCode === 27) {
                // document.removeEventListener("keydown", leave);
                return;
            }
        };
        document.addEventListener("keydown", leave);
        createGameStateWithinFilePicker(); // recursively call the function to prompt the user again
        return false;
    }

    return fileData;
}

function displayPlayerInformation() {

    if ((currentGameState.playerOneGuess !== null && currentGameState.playerTwoGuess !== null) && !running) {
        running = true;
        changeBoardVisibility(); // show the game board
    }

    if ((currentGameState.isPlayerOne[1] === currentGameState.currentPlayer) && playerOne) {
        statusText.textContent = `Player One you are ${currentGameState.isPlayerOne[1]} your turn to move!`;
    } else if ((currentGameState.isPlayerTwo[1] === currentGameState.currentPlayer) && playerTwo) {
        statusText.textContent = `Player Two you are ${currentGameState.isPlayerTwo[1]} your turn to move!`;
    } else {
        statusText.textContent = `waiting for opponent's turn...`;
    }

    // console.log("Current Game State:", currentGameState);

}


async function getPlayerUserInputFromDiceInputValue() {
    const diceInputValue = document.getElementById("diceInputValue").value;
    // await updateFileGameStateWithFilePicker(); // update the file game state with the file picker
    // statusText.textContent = `Please Wait....`;



    //     syncInterval = setInterval(() => {
    //     try {
    //         updateLocalGameStateWithFilePicker();
    //         if (playerOne && currentGameState.playerTwoGuess !== null) {
    //             ChooseStartingPlayerByRollingDice(); // call the function to choose the starting player
    //             bothPlayersHaveGuessed = true; // set both players have guessed to true
    //         }
    //         if (playerTwo && currentGameState.playerOneGuess !== null) {
    //             ChooseStartingPlayerByRollingDice(); // call the function to choose the starting player
    //             bothPlayersHaveGuessed = true;
    //         }
    //     } catch (error) {
    //         // console.error("Error updating local game state:", error);
    //     }
    // }, 3000);
    return parseInt(diceInputValue);
}

 /**
 * 
 */
async function ChooseStartingPlayerByRollingDice() {

    await updateLocalGameStateWithFilePicker(); // update the local game state with the file picker

    const guess = await getPlayerUserInputFromDiceInputValue(); // get the player input from the dice input value
    // const guess = document.getElementById("diceInputValue").value; // get the player input from the dice input value

    if (isNaN(guess) || guess < 1 || guess > 6) {
        alert("Please enter a valid number between 1 and 6.");
        return;
    }

    if (playerOne === true) {
        currentGameState.playerOneGuess = guess;
        // alert("Player 1's guess is: " + guess);
        await updateFileGameStateWithFilePicker();
    } else if (playerTwo === true) {
        currentGameState.playerTwoGuess = guess;
        // alert("Player 2's guess is: " + guess);
        await updateFileGameStateWithFilePicker();
    }

    if (
        currentGameState.playerOneGuess === null ||
        currentGameState.playerTwoGuess === null
    ) {
        // alert("Waiting for both players to enter their guesses.");
        statusText.textContent = `Waiting for both players to enter their guesses...`;

        return;
    }
    bothPlayersHaveGuessed = true; // set both players have guessed to true
    currentGameState.diceRoll = Math.floor(Math.random() * 6) + 1;
    // alert('Value of rolled dice: ' + currentGameState.diceRoll);

    const diff1 = Math.abs(currentGameState.diceRoll - currentGameState.playerOneGuess);
    const diff2 = Math.abs(currentGameState.diceRoll - currentGameState.playerTwoGuess);

    if (bothPlayersHaveGuessed && (diff1 < diff2)) {
        currentGameState.currentPlayer = "O";
        currentGameState.isPlayerOne[1] = "O"; // set player one to O
        currentGameState.isPlayerTwo[1] = "X"; // set player two to X
        // alert("Player 1 starts with O");
        await updateFileGameStateWithFilePicker();
        // playerOne = true;
    } else if (diff1 === diff2) {
        // alert("Both players guessed the same, rolling again...");
        currentGameState.diceRollValue = "null";
        await updateFileGameStateWithFilePicker();
        return;
    } else {
        currentGameState.currentPlayer = "O";
        currentGameState.isPlayerTwo[1] = "O"; // set player two to O
        currentGameState.isPlayerOne[1] = "X"; // set player one to X
        // alert("Player 2 starts with O");
        // playerTwo = true;
    }

    if (bothPlayersHaveGuessed) {       
        clearInterval(syncInterval); // clear the interval to stop updating the local game state
    }
    await updateFileGameStateWithFilePicker();
    await updateLocalGameStateWithFilePicker(); 
    // diceInputValue.removeEventListener("keydown", onDiceInputKeydown);

    syncInterval = setInterval(() => {
        // console.log("displayPlayerInformation called");
        displayPlayerInformation(); // display the player information in the status text
        
        updateUsersChoiceCell(); // update the user's choice cell
    }, 3000);

    removePlayerGuessingBox(); // remove the player guessing box if both players have guessed
    initCells();


    // console.log("syncInterval set:", syncInterval);

}

function removePlayerGuessingBox() {
    if (bothPlayersHaveGuessed) {
        document.getElementById("diceInputSection").style.display = "none";
    }
}

/**
 * makes game playable setting running to now true
 * gives functionality to start a game and removes the event listener from the start button
 * and creates and event listener for the clear button which calls restart game on click
 */

async function initGame() {

    await updateLocalGameStateWithFilePicker(); // update the local game state with the file picker

    if (!running) {
        running = true;
        changeBoardVisibility(); // show the game board
    }

    document.getElementById("diceInputSection").style.display = "block"; // show the input box
    statusText.textContent = `Please enter your guess!`;
    if (playerOne) {
        statusText.textContent = `You are player 1 - Please enter your guess!`;
    } else if (playerTwo) {
        statusText.textContent = `You are player 2 - Please enter your guess!`;
    }
    
    // displayCurrentPlayerForStatusText();
    // initCells();
    enableClearButton();
    // startButton.removeEventListener("click", handleStartClick);
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


    alert ("initCells called, current player: " + currentGameState.currentPlayer);

    if (currentGameState.currentPlayer === "X") {
        cells.forEach(cell => cell.addEventListener("click", cellClicked)); // addEventListener(type, listener) 
    }
    else if (currentGameState.currentPlayer === "O") {
        cells.forEach(cell => cell.addEventListener("click", cellClicked)); // addEventListener(type, listener)
    }
    
    // else if (currentPlayer === "O") {
    //     computerSelection();
    // }
    
    cells.forEach(color => color.style.color = "black"); // reset color for all cell text content

}

/**
 * event handler for when a cell is clicked during gameplay
 * gets the clicked cell index, prevents moves if cell is taken or game is not running
 * updates the cell with user's choice and checks for a win condition
 * @param {MouseEvent} event - web browser provided object that gives us feedback when mouse action is provided
 * for this instance we are looking for a cellindex to be clicked
 */

async function cellClicked(event) {

    const cellIndex = event.target.getAttribute("cellIndex"); // this refers to what ever cell is clicked on screen by user

    if (currentGameState.board[cellIndex] != "" || !running ) {
        return;
    }

    await updateUsersChoiceCell(event.target, cellIndex);
    await checkWinner();
}

/**
 * updates game state and UI for the selected cell that was passed by cellClicked
 * @param {number} index - The index of the cell in the currentGameState.board array
 * @param {html} cell - the cell element that was clicked during the event that was stored from cellClicked
 */

async function updateUsersChoiceCell (cellClicked, index) {

    
    // await updateLocalGameStateWithFilePicker(); // update the local game state with the file picker
    // alert(index + " is the index of the cell clicked");
    // options at the current index of cell clicked is being set to the current player either "X" or "O"
    currentGameState.board[index] = currentGameState.currentPlayer;
    // console.log("Current board before write:", currentGameState.board);
    // alert("Current board before write: " + currentGameState.board);

    // if (cellClicked) {
    //     cellClicked.textContent = currentGameState.currentPlayer;
    // }

    cells[index].textContent = currentGameState.currentPlayer; // update the cell with the current player's choice
    
    await updateFileGameStateWithFilePicker(); // update the file game state with the file picker
    // alert("Current board after write: " + currentGameState.board);

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

async function changePlayer() {
    // console.trace();
    
    await updateLocalGameStateWithFilePicker(); // update the local game state with the file picker

    if (running) {
        initCells();
    }

    if (currentGameState.currentPlayer === "O") {
        currentGameState.currentPlayer = "X";
    } else {
        currentGameState.currentPlayer = "O";
    }


    // displayFirstPlayerMessage();

    
    // displayCurrentPlayerForStatusText();
    await updateFileGameStateWithFilePicker(); // update the file game state with the file picker
    initCells();
}


function displayStartMessage() {
    if (firstGame) {
        document.querySelector(".tooltiptext").style.visibility = "visible";
        statusText.textContent = `Please press start to play!`;
    }
    // else should be the player that won the last game
}

/**
 * display the current player whos turn it is to move 
 * current player will display within the html element with statustext id 
 */

function displayCurrentPlayerForStatusText() {

    statusText.textContent = `${currentGameState.currentPlayer}'s turn`;
    document.querySelector(".tooltiptext").style.visibility = "hidden";
    if (syncInterval) {
        clearInterval(syncInterval); // clear the interval to stop updating the local game state
    }
}

function displayFirstPlayerMessage() {

    statusText.textContent = `First Player: ${currentGameState.currentPlayer} - Press Start to Play!`;
    document.querySelector(".tooltiptext").style.visibility = "visible";
}

/**
 * Checks for winner by calling function to check for three in a row
 * return from three in a row is set to boolean for round won
 * if no win but the board is full, declares a draw
 * otherwise calls changePlayer to continue the game
 */

async function checkWinner () {
    let roundWon = false;

    roundWon = checkForThreeInARow(currentGameState.board);

    if (roundWon) {

        statusText.textContent = `${currentGameState.currentPlayer} wins! Press Clear to restart game`;
        running = false;
    }
    else if (!currentGameState.board.includes("")) {

        statusText.textContent = `Draw! Press Clear to restart game`;
        running = false;
    }
    else {
        await changePlayer();
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
 * changes the visibility of the game board based on the running state
 * if running is true, the game board is visible, otherwise it is hidden    
 */

function changeBoardVisibility() {
    if (running) {
        document.getElementById("cellContainer").style.visibility = "visible"; // show the game board
    } else {
        document.getElementById("cellContainer").style.visibility = "hidden"; // hide the game board
    }
}

/**
 * resets the game state to its initial configuration for a new match
 * sets currentPlayer to "X", clears the currentGameState.board array and all cell text content
 * sets running and the handicap to false and calls startGame
 */

function restartGame () {
    
    changeBoardVisibility(); // hide the game board
    displayCurrentPlayerForStatusText();
    cells.forEach(cell => cell.textContent = "");
    // startGame();
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

function checkForThreeInARow(thisOptions) {

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

            returnValue = 1;
            
        } 
    }

    return returnValue;
}


    /**
 * creates a delay used to pause logic for a set amount of milli seconds
 * @param {number} ms - the number of milli seconds to delay
 * @returns {Promise} 
 */

function sleep(ms) {
    return new Promise(resolve =>setTimeout(resolve, ms)); // https://youtu.be/pw_abLxr4PI?si=Tlfw1HBU92o0wX3B
}