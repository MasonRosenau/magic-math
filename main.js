/**********************************************************************************
    ** Description: This object is used to keep track of the game's state. It holds
    things like the number of wins and losses, aspects of the current equation, and
    booleans like whether the game is over or cheat mode is enabled.
**********************************************************************************/
const gameStatus = {
    numWins: 0,
    numLosses: 0,
    cheat: false,
    firstButton: undefined,
    operation: undefined,
    secondButton: undefined,
    result: undefined,
    goal: undefined,
    over: false,
};

//call initial function once the DOM has been loaded
window.addEventListener("DOMContentLoaded", domLoaded);

/**********************************************************************************
    ** Description: This function is called once the DOM is loaded (see above). It
    adds event listeners for all the buttons/checkboxes in the game, and calls the
    newGame function to start the game.
**********************************************************************************/
function domLoaded() {
    //add event listener to new game button
    const newGameBtn = document.getElementById("new-game-btn");
    newGameBtn.addEventListener("click", newGame);

    //add event listeners to number buttons
    const numbers = document.querySelectorAll(".number-btn");
    for(let i = 0; i < numbers.length; i++){
        numbers[i].addEventListener("click", numberClicked);
    }

    //add even listeners to operation buttons
    const operations = document.querySelectorAll(".operator-btn");
    for(let i = 0; i < operations.length; i++){
        operations[i].addEventListener("click", operationClicked);
    }

    //add event listener to cheat check box
    const cheat = document.getElementById("cheat-box");
    cheat.addEventListener("change", checkCheat);

    //begin the game
    newGame();
}

/**********************************************************************************
    ** Description: This function is called upon when the DOM is loaded and when
    the New Game button is clicked. It resets all of the game objects variables and
    clears necessary fields on the page. It also checks if the cheat checkbox is
    enabled and generates new numbers and a new goal to being the new game.
**********************************************************************************/
function newGame() {
    //set game object to default state
    gameStatus.firstButton = undefined;
    gameStatus.operation = undefined;
    gameStatus.secondButton = undefined;
    gameStatus.result = undefined;
    gameStatus.goal = undefined;
    gameStatus.over = false;

    //display lets play message
    const statusMsg = document.getElementById("status-msg");
    statusMsg.textContent = "Lets Play!";
    
    //clear any equations work area
    const workArea = document.getElementById("work-area");
    workArea.innerHTML = "<h2>Work Area</h2>";

    //clear any paragraphs in cheat section
    const cheatParagraphs = document.querySelectorAll(".cheat-paragraph");
    for(let i = 0; i < cheatParagraphs.length; i++){
      cheatParagraphs[i].parentNode.removeChild(cheatParagraphs[i]);
    }
    
    //check if the user has enabled the cheat mode upon new game
    checkCheat();

    //generate new numbers and attainable goal number
    generateNumbers();
}

/**********************************************************************************
    ** Description: This function generates all the numbers associated with a new 
    game. It first generates four random numbers between 1 and 10 for the buttons.
    Then it generates a random number between 1 and 100 to determine how many
    operations it should use to form the goal. Theres a 15% chance the goal can be
    attained in 1 operation, a 35% chance it can be attained in 2 operations, and a
    50% chance it can be attained in 3 operations. It then calls the operate function
    with the corresponding number of operations to execute to create the goal number.
**********************************************************************************/
function generateNumbers() {
    //generate four random numbers between 1 and 10. store in array
    let buttonNums = [];
    for(let i = 0; i < 4; i++){
        const num = Math.floor(Math.random() * 10) + 1;
        buttonNums.push(num);
    }
    //add those numbers to the four buttons in DOM
    const buttons = document.querySelectorAll(".number-btn");
    for(let i = 0; i < buttons.length; i++){
        buttons[i].textContent = buttonNums[i];
    }

    //generate random number between 1 and 100 to choose how many operations the goal can be reached in
    let chance = Math.floor(Math.random() * 100) + 1;
    let goalNum = -1;

    //10% chance goal can be attained in 1 operation
    if(chance >= 1 && chance <= 10){
        goalNum = operate(buttonNums, 1);
    }
    //30% chance goal can be attained in 2 operations
    else if(chance >= 10 && chance <= 40){
        goalNum = operate(buttonNums, 2);
    }
    //50% chance goal can be attained in 3 operations
    else{
        goalNum = operate(buttonNums, 3);
    }

    //add goal number to DOM and game object
    let goal = document.getElementById("goal");
    goal.textContent = goalNum;
    gameStatus.goal = goalNum;
}

/**********************************************************************************
    ** Description: This function makes a copy of the number array passed in and 
    executes a certain number of operations (+, -, or *) on it to create a goal 
    number. It then returns said goal.
    ** Parameters: Number array, number of operations to execute
**********************************************************************************/
function operate(buttonNums, numOperations) {
    //create copy of buttonNums that we can manipulate when "reverse engineering" the goal
    let nums = buttonNums; 
    let result;
    let operation = "";

    //grab cheat section to append operations to if needed
    const cheatSection = document.getElementById("cheat");

    //execute a specific number of operations (numOperations passed in as parameter)
    for(let i = 0; i < numOperations; i++){
        //pick two random indices from array of nums
        let idx1 = Math.floor(Math.random() * nums.length);
        let idx2 = Math.floor(Math.random() * nums.length);
        while(idx1 == idx2){
            idx2 = Math.floor(Math.random() * nums.length);
        }

        //pick a random operation to perform on two numbers at those indices and store result
        switch (Math.floor(Math.random() * 3)){
            case 0:
                operation = "+";
                result = nums[idx1] + nums[idx2];
                break;
            case 1:
                operation = "-";
                result = nums[idx1] - nums[idx2];
                break;
            case 2:
                operation = "*";
                result = nums[idx1] * nums[idx2];
                break;
        }

        //if cheat checkbox is enabled upon newgame, append operations to cheat section
        if(gameStatus.cheat){
            const cheatParagraph = document.createElement("p");
            cheatParagraph.classList.add("cheat-paragraph");
            cheatParagraph.textContent = nums[idx1] + " " + operation + " " + nums[idx2] + " = " + result;
            cheatSection.appendChild(cheatParagraph);
        }

        //overwrite second operand with result of operation
        nums[idx2] = result;
        //remove first operand from array
        nums.splice(idx1, 1);
    }

    //return the final goal number for the user to reach
    return result;
}

/**********************************************************************************
    ** Description: This function is called when a number button is clicked. It 
    determines appropriate actions based on whether the game is already over, or if
    it was the first or second number to be clicked. If it was the second number, it
    executes the operation and checks if the game is over yet.
    ** Parameters: The corresponding event so the button can be obtained.
**********************************************************************************/
function numberClicked(event) {
    //if the game is over, don't do anything. player must hit new game
    if(gameStatus.over){
        return;
    }

    //obtain button that was clicked
    const button = event.target;

    //FIRST NUMBER
    //if operation isn't defined yet, this is first number and we can continue clicking on them
    if(gameStatus.operation == undefined){
        //go thru every number button and remove the clicked class
        //this is so only the most recently clicked button is "clicked"
        const numberButtons = document.querySelectorAll(".number-btn");
        for(let i = 0; i < numberButtons.length; i++){
            numberButtons[i].classList.remove("clicked");
        }

        //click the button and add it to the game object
        button.classList.add("clicked");
        gameStatus.firstButton = button;

        //tell user to click an operator now
        const statusMsg = document.getElementById("status-msg");
        statusMsg.textContent = "Select an operator.";
    }

    //SECOND NUMBER
    //if operation is defined, we need to execute operation with this second number
    else{
        //do nothing if they are clicking the same button as the first button
        if(button == gameStatus.firstButton){
            return;
        }

        //update the second button in the game object
        gameStatus.secondButton = button;
        
        //execute operation and update result in game object
        let firstNum = parseInt(gameStatus.firstButton.textContent);
        let secondNum = parseInt(gameStatus.secondButton.textContent);
        switch(gameStatus.operation){
            case "+":
                gameStatus.result = firstNum + secondNum;
                break;
            case "-":
                gameStatus.result = firstNum - secondNum;
                break;
            case "*":
                gameStatus.result = firstNum * secondNum;
                break;
        }

        //print out user's complete equation to work area
        const workArea = document.getElementById("work-area");
        const paragraph = document.createElement("p");
        paragraph.textContent = firstNum + " " + gameStatus.operation + " " + secondNum + " = " + gameStatus.result;
        workArea.appendChild(paragraph);
    
        //remove text from firstButton
        gameStatus.firstButton.textContent = "";

        //update second clicked button with result of operation
        gameStatus.secondButton.textContent = gameStatus.result;
        
        //reset status message to tell user to click an number now
        const statusMsg = document.getElementById("status-msg");
        statusMsg.textContent = "Select a number.";

        //check if game is over
        checkEndgame();

        //go thru every button and remove the clicked class
        const buttons = document.querySelectorAll("button");
        for(let i = 0; i < buttons.length; i++){
            buttons[i].classList.remove("clicked");
        }
        
        //reset operation-specific game object variables
        gameStatus.firstButton = undefined;
        gameStatus.operation = undefined;
        gameStatus.secondButton = undefined;
        gameStatus.result = undefined;
    }
}

/**********************************************************************************
    ** Description: This funciton is called when an operation button is clicked. It
    determines what action to take, based on whether or not the first number has even
    been clicked yet. If it has, it updates the game object with the operation so
    that the second number can be clicked and the operation can be executed.
    ** Parameters: The corresponding event so the button can be obtained.
**********************************************************************************/
function operationClicked(event) {
    const button = event.target;
    
    //if first number is undefined, don't do anything as it first operand hasn't been chosen
    if(gameStatus.firstButton == undefined){
        return;
    }
    //first number is defined, so we can select an operation
    else{
        //go thru every operator button and remove the clicked class
        //this is so only them most recently clicked operation is "clicked"
        const operatorButtons = document.querySelectorAll(".operator-btn");
        for(let i = 0; i < operatorButtons.length; i++){
            operatorButtons[i].classList.remove("clicked");
        }
        
        //click the operator and add it to the game object
        button.classList.add("clicked");
        gameStatus.operation = button.textContent;

        //tell user to click another number now
        const statusMsg = document.getElementById("status-msg");
        statusMsg.textContent = "Select a second number.";
    }    
}

/**********************************************************************************
    ** Description: This function checks if the game is over. It does so by checking
    if the most recent result of an equation is equal to the goal number. It also
    checks if there is one button left on the game board, and if so, checks if it's
    equal to the goal number.
**********************************************************************************/
function checkEndgame() {

    //check if most recent result is equal to goal
    if(gameStatus.result == gameStatus.goal){
        //end the game
        gameStatus.over = true;

        //add victory message to DOM
        const statusMsg = document.getElementById("status-msg");
        statusMsg.textContent = "Congratulations! You win! Click above to play again!";

        //update number of wins and display on DOM
        gameStatus.numWins++;
        const wins = document.getElementById("wins");
        wins.textContent = gameStatus.numWins;
    }

    //if only one of the buttons has a number, check if it's equal to the goal
    else{
        //obtain all four buttons
        const buttons = document.querySelectorAll(".number-btn");
        let numButtons = 0;
        let num = 0;

        //count how many buttons have a number
        for(let i = 0; i < buttons.length; i++){
            if(buttons[i].textContent != ""){
                numButtons++;
                num = buttons[i].textContent;
            }
        }

        //if only one button has a number and it DOESN'T equal the goal, the game is over
        if(numButtons == 1 && num != gameStatus.goal){
            //end the game
            gameStatus.over = true;

            //add defeat message to DOM
            const statusMsg = document.getElementById("status-msg");
            statusMsg.textContent = "Sorry, you lost! Click above to play again!";

            //update number of wins and display on DOM
            gameStatus.numLosses++;
            const losses = document.getElementById("losses");
            losses.textContent = gameStatus.numLosses;
        }
    }
}

/**********************************************************************************
    ** Description: This function checks if the cheat box is checked, and is called
    by its event listener.
**********************************************************************************/
function checkCheat() {
    const cheatBox = document.getElementById("cheat-box");

    //check if the cheat box is checked
    if(cheatBox.checked){
        gameStatus.cheat = true;
    }
    else{
        gameStatus.cheat = false;
    }
}