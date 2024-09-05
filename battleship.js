//Making Query and Id selectors for different HTML elements
const optionContainer = document.querySelector('.option-container')
const flipButton = document.getElementById('flip-button')
const gamesBoardContainer = document.getElementById("gameboard-container")
const startButton = document.getElementById("start-button")
const infoDisplay = document.getElementById("info")
const turnDisplay = document.getElementById("turn-display")

let angle = 0

//flips ships
const flip = () => {
    const optionShips = Array.from(optionContainer.children) //Creates an array of all the ships under the .option-container class
    angle = angle === 0 ? 90 : 0; // angle = angle truly equals 0 then return(?) 90, otherwise return(:) 0 
    optionShips.forEach(optionShip => optionShip.style.transform = `rotate(${angle}deg)` ) /* Rotates Ships 90 degrees */
}

//flips the buttons on click
flipButton.addEventListener('click', flip)

//Creating boards
const width = 10 //how many squares you want for the game board

const createBoard = (color, user) => {
    const gameBoardContainer = document.createElement('div') //creates an empty div
    gameBoardContainer.classList.add('game-board') // adds the class "game-board" to the div
    gameBoardContainer.style.backgroundColor = color //goes into the style sheet and makes the background color depending on the input
    gameBoardContainer.id = user //Create an ID for the board based on the "user" input
    for(let i=0; i < width * width; i++){
        const block = document.createElement('div') //creates an empty div
        block.classList.add('block') //gives the div the class of block
        block.id = i //sets the id equal to the index
        gameBoardContainer.append(block) //adds the block div to the game board
    }
    gamesBoardContainer.append(gameBoardContainer) //adds the div to the div in HTML with the id = "gameboard-container"
}
createBoard('yellow', "player") //Creates Player Board
createBoard('pink', "computer") //Creates Computer Board

//Creating Ships

//creates a class Ship with the inputs "name" and "length" so they can easily be edited
class Ship {
    constructor(name, length){
        this.name = name
        this.length = length
    }
}

//Creates all the ships based on the class Ship
const destroyer = new Ship('destroyer', 2)
const submarine = new Ship('submarine', 3)
const cruiser = new Ship('cruiser', 3)
const battleship = new Ship('battleship', 4)
const carrier = new Ship('carrier', 5)

const ships = [destroyer, submarine, cruiser, battleship, carrier] //makes an array of the ships
let notDropped = false //adds an empty variable for when a ship is not dropped

const getValidity = (allBoardBlocks, isHorizontal, startIndex, ship) =>{
    //Checks if random index is smaller or equal to 100 - ship length. As long as this is true then return the index
    let validStart = isHorizontal ? 
        (startIndex <= width * width - ship.length ? startIndex : width * width - ship.length) :
        (startIndex <= width*width - width * ship.length ? startIndex : startIndex - ship.length * width + width)//If vertical then the random index is less than or equal to 100 - 10 - ship length then return random index - ship length * 10 + 10 which moves it

    let shipBlocks = [] //Will store the values of where the ships will be

    for(let i=0; i < ship.length; i++){
        //If the ship is horizontal, we will look at all the board blocks and return the value of the random index plus the length of the ship
        if(isHorizontal){
            shipBlocks.push(allBoardBlocks[Number(validStart) + i])
        }else{
            shipBlocks.push(allBoardBlocks[Number(validStart) + i * width]) //this means if vertical, then get the div right below the random index
        }
    }

    let valid = true

    //Makes it so that the horizontal ships can't get split up by the borders of the grid
    if(isHorizontal){
        valid = shipBlocks.every((_shipBlock, index) => 
            shipBlocks[0].id % width !== width - (shipBlocks.length - (index + 1)))
    }else{
        valid = shipBlocks.every((_shipBlock, index) =>
            shipBlocks[0].id < 90 + (width * index + 1)) //Checks in a way that when a ship is vertical, all the blocks around it are not valid
    }

    const notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken')) //Checks if the ship block already contains a ship by checking if it has the "taken" class

    return{shipBlocks, valid, notTaken}
}


const addShipPiece = (user, ship, startId) => {
    const allBoardBlocks = document.querySelectorAll(`#${user} div`) //Selects all the blocks in the game board and makes them into an array
    let randomBoolean = Math.random() < 0.5 //checks if a random integer between 0 - almost 1 is less than half and returns true or false
    let isHorizontal = user === 'player' ? angle === 0 : randomBoolean //Checks if the user is player and if it is check if the angle is 0 meaning it is horizontal
    let randomStartIndex = Math.floor(Math.random() * width * width) //randomly gets a number between 0 and 99 

    let startIndex = startId ? startId : randomStartIndex //if a startId exists then use that, if not then use a random start index

    const {shipBlocks, valid, notTaken} = getValidity(allBoardBlocks, isHorizontal, startIndex, ship) //Calls the function for all the checks for ships so it can be reused

    //If the above checks out then draw a ship
    if(valid && notTaken){
        shipBlocks.forEach(shipBlock => {
            shipBlock.classList.add(ship.name)
            shipBlock.classList.add("taken")  
        })
    }else{
        if(user === 'computer') addShipPiece(user, ship) //If all the checks fail, run the function again only if they are a computer
        if(user === 'player') notDropped = true
    }

  
}
ships.forEach(ship => addShipPiece('computer', ship)) //Draws all the ships to the computer board

//Drag player ships
let draggedShip = null //Saves the target ship that was dragged
const optionShips = Array.from(optionContainer.children) //Creates an array from the option container's children

//goes through the option ships and makes them draggable
optionShips.forEach((optionShip, index) =>{
    optionShip.setAttribute('draggable', true) //makes the ship draggable
    optionShip.id = index
    optionShip.addEventListener('dragstart', dragStart)//Adds an event listener to see if a drag has been initiated
})


const allPlayerBlocks = document.querySelectorAll('#player div') //selects all player blocks

allPlayerBlocks.forEach(playerBlock =>{
    playerBlock.addEventListener('dragover', dragOver) //Adds an event listener for dragging over a block
    playerBlock.addEventListener('drop', dropShip) //Adds an even listener for dropping on to a block
})

function dragStart(e){
    notDropped = false //says that the ship is not dropped
    draggedShip = ships[e.target.id] //gets the target of the ship that was dragged and store it in the variable draggedShip
    draggedShipElement = e.target //sets it to the element that will be removed later
} 

function dragOver(e){
    e.preventDefault() //Prevents default drag behavior
    const startId = e.target.id //gets the starting Id of the ship
    if(startId){ //if the id is there then highlight the area under the ship
        const ship = draggedShip
        highlightArea(startId, ship)
    }
}

function dropShip(e){
    const startId = e.target.id //gets the id of the ship
    addShipPiece('player', draggedShip, startId) //Adds a piece with these parameters
    if (!notDropped){
        draggedShipElement.remove() //if the ship is dropped, remove piece
        draggedShipElement.setAttribute('draggable', false) //Disables dragging the piece after it has been places
    }
}

//Add highlight
const highlightArea = (startIndex, ship) => {
    const allBoardBlocks = document.querySelectorAll('#player div') //Gets the player div for the board
    let isHorizontal = angle === 0 //Checks if the ships are horizontal

    const {shipBlocks, valid, notTaken} = getValidity(allBoardBlocks, isHorizontal, startIndex, ship) //checks the validity of the area before


    allBoardBlocks.forEach(block => block.classList.remove('hover')) //removes previous highlights
    //this checks the validity of the blocks and adds the hover
    if(valid && notTaken){
        shipBlocks.forEach(shipBlock =>{
            shipBlock.classList.add('hover') //this adds the class hover to the point under the ship
            setTimeout(() => shipBlock.classList.remove('hover'), 500) //removes the hover class after a select amount of time
        })
    }
}

//game logic

let gameOver = false //sets game over to false
let playerTurn

//Start Game
const startGame = () => {
    if (playerTurn === undefined){
        if(optionContainer.children.length != 0){
            infoDisplay.textContent = "Please place all your pieces first!" //If you press the start button before placing all the pieces it displays this message
        }else{
            const allBoardBlocks = document.querySelectorAll("#computer div") //selects all the computer board tiles
            allBoardBlocks.forEach(block => block.addEventListener('click', handleClick)) //adds a click event listener so you can click the ships
            playerTurn = true
            turnDisplay.textContent = 'Your turn!'
            infoDisplay.textContent = 'The game has started!'
        }
    }
}
startButton.addEventListener('click', startGame) //adds an event listener to the "START" button to start the game on click

let playerHits = [] //empty array to later store the player's hits
let computerHits = []//empty array to later store the computer's hits
const playerSunkShips = [] //empty array to later store the player's sunk ships
const computerSunkShips = [] //empty array to later store the computer's sunk ships

function handleClick(e){
    //Checks if the game is not over, and if the class list contains taken
    if(!gameOver){
        if(e.target.classList.contains('boom') || e.target.classList.contains('empty')){ //checks if the square has already been clicked
            infoDisplay.textContent = 'You already clicked here!' //display that it has already been clicked
            return //return to the top
        }
        //check if the target ship is there
        if(e.target.classList.contains('taken')){
            e.target.classList.add('boom') //adds the class boom to the cell
            infoDisplay.textContent = "You hit the computer's ship!" //Displays that you hit the ship
            let classes = Array.from(e.target.classList) //Sets an array to equal the class list
            classes = classes.filter(className => className !== 'block' && className !== 'boom' && className !== 'taken') //filters out everything except the ship name
            playerHits.push(...classes) //pushes the remaining ship class name into the array playerHits
            checkScore('player', playerHits, playerSunkShips) //check the player hists and ships sunk to change score
        }else{   //if the class does no contain 'taken'
            infoDisplay.textContent = 'Miss!' //display that you missed
            e.target.classList.add('empty') //add the class empty to style it
        }

        playerTurn = false //sets the player's turn to false
        const allBoardBlocks = document.querySelectorAll('#computer div') //select all the computer board blocks
        allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true))) //removes the event listener after the player's turn
        setTimeout(computerGo, 3000) //takes 3 seconds for computer turn
    }
}

//Handle computer turn
function computerGo(){
    if(!gameOver){
        turnDisplay.textContent = 'Computer\'s Turn!' //displays that it is the computer's turn
        infoDisplay.textContent = 'The computer is thinking...' //displays that the computer is thinking

        setTimeout(() => {
            let randomGo //sets a blank variable random go
            const allBoardBlocks = document.querySelectorAll('#player div') //gets all the player board positions
            //gets a random number from 0-99 while player board contains boom or empty
            do {
                randomGo = Math.floor(Math.random() * width * width)
            } while(allBoardBlocks[randomGo].classList.contains('boom') || allBoardBlocks[randomGo].classList.contains('empty'))
            
            //If there is a ship then hit the ship
            if(allBoardBlocks[randomGo].classList.contains('taken')){
                infoDisplay.textContent = 'The Computer hit your ship!' //display that the ship was hit
                allBoardBlocks[randomGo].classList.add('boom') //Marks the square as a hit
                let classes = Array.from(allBoardBlocks[randomGo.classList]) //creates an array of the classes under the board div
                classes = classes.filter(className => className !== 'block' && className !== 'boom' && className !== 'taken') //filters out everything other than the ships
                computerHits.push(...classes)
            }else{
                infoDisplay.textContent = 'The Computer missed!'; //Display that the computer missed
                allBoardBlocks[randomGo].classList.add('empty'); // Mark the square as missed
            }

            checkScore('computer', computerHits, computerSunkShips) //updates the score array
            
        }, 1500)

        setTimeout(() => {
            playerTurn = true
            turnDisplay.textContent = 'Player\'s Turn!'
            infoDisplay.textContent = 'Please Take your Turn'
            const allBoardBlocks = document.querySelectorAll('#computer div')
            allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
        }, 3000)
    }
}

function checkScore(user, userHits, userSunkShips){

    function checkShip(shipName, shipLength){
        if(userHits.filter(storedShipName => storedShipName === shipName).length === shipLength){
            
            if(user === 'player'){
                infoDisplay.textContent = `You sunk the computer's ${shipName}`
                playerHits = userHits.filter(storedShipName => storedShipName !== shipName) //filters out if the stored ship name is not equal to the ship name
            }
            if(user === 'computer'){
                infoDisplay.textContent = `The computer sunk your ${shipName}`
                computerHits = userHits.filter(storedShipName => storedShipName !== shipName) //filters out if the stored ship name is not equal to the ship name
            }
            userSunkShips.push(shipName) //pushes the ship name in the array
        }
    }

    checkShip('destroyer', 2)
    checkShip('submarine', 3)
    checkShip('cruiser', 3)
    checkShip('battleship', 4)
    checkShip('carrier', 5)

    if(playerSunkShips.length === 5){
        infoDisplay.textContent = 'You sunk all the computers ships! YOU WON!'
        gameOver = true 
    }
    if(computerSunkShips.length === 5){
        infoDisplay.textContent = 'The computer has sunk all your ships! YOU LOSE!' 
        gameOver = true
    }
}