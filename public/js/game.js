const x = [];
const o = [];

const xColor = "green";
const oColor = "blue";
const originColor = "yellow";
const winCombos = [
    [1,2,3],
    [4,5,6],
    [7,8,9],
    [1,4,7],
    [2,5,8],
    [3,6,9],
    [1,5,9],
    [3,5,7]
];
let xCombos = []
let oCombos = []

$("document").ready(function() {
    resetGame();
    console.log($("#banner").css("height"))
});

function btnClick(btnObject) {
    const btnId = btnObject.id
    if( $("#" + btnId).attr("data-claimed") == 'true') {
        alert('This has already been claimed. Pick a different one!')
        return false;
    }
    $("#" + btnId).attr("data-claimed",true);  
    const turn = $("#statusBox > h1").html();
    if(turn == 'X') {
        $("#" + btnId).html("X") 
        x.push(parseInt(btnId))
        $("#" + btnId).css("background-color", xColor);
    }
    else if(turn == 'O') {
        $("#" + btnId).html("O") 
        o.push(parseInt(btnId))
        $("#" + btnId).css("background-color", oColor);
    }
    else {
        console.log("Who's turn is it? Button has not turn value");
    }

    logPlay(turn,btnId);

    const win = checkWinner(turn)
    if( win == true) {
        lockBoard(true)
        alert("Winner!")
    }
    else if(win == "Draw") {
        lockBoard(true)
        alert("Draw!")
    }

    if(turn == "O"){
        $("#statusBox > h1").html("X");
    }
    else if(turn == "X") {
        $("#statusBox > h1").html("O");
    }
    else {
        console.log("Something isnt right in btnClick turn change")
    }
}

async function resetGame() {
    const art = "|=|";
    $( ".tile" ).attr("data-claimed",false);  
    $( ".tile" ).html(art);
    $( ".tile" ).css("background-color", originColor);
    whoGoesFirst();

    xCombos = winCombos.map((x) => x)
    oCombos = winCombos.map((o) => o)
    lockBoard(false)
}

async function whoGoesFirst() {
    const randomNumber = Math.floor(Math.random() * 100);

    console.log(randomNumber)
    if(randomNumber % 2 == 0){
        $("#statusBox > h1").html('X');
    }
    else {
        
        $("#statusBox > h1").html("O");
    }
}

function logPlay(currentPlayer, currentPlay) {
    const play = parseInt(currentPlay)
    let playerArray = []
    let tempArray = []

    if(currentPlayer == "X") {
        playerArray = oCombos
    }
    else {
        playerArray = xCombos
    }

    playerArray.forEach(combo => {
        if(combo.includes(play)) {
            tempArray.push(combo)
        }
    });

    tempArray.forEach(combo => {
        const n = playerArray.indexOf(combo)
        playerArray.splice(n,1)
    })
    
    // console.log("Possible Winning Combos")
    // console.log("X: " + JSON.stringify(xCombos))
    // console.log("O: " + JSON.stringify(oCombos))
}

function checkWinner(player) {
    let winner = false

    if(x.length + o.length < 5) {
        return false
    }
    else if(xCombos.length + oCombos.length == 0) {
        return "Draw"
    }

    if(player == "X") {
        playerCombos = xCombos
        plays = x
    }
    else {
        playerCombos = oCombos
        plays = o
    }

    playerCombos.forEach(set => {
        let win = 0
        set.forEach(tile => {
            if(plays.includes(tile)) {
                win++
            }
        });

        if(win == 3) {
            winner = true
        }
    });

    return winner
}

function lockBoard(locked) {
    if(locked == true) {
        for (let btnId = 1; btnId <= 9; btnId++) {
            $("#" + btnId).attr("disabled", true)
        }
    }
    else if(locked == false) {
        for (let btnId = 1; btnId <= 9; btnId++) {
            $("#" + btnId).attr("disabled", false)
        }
    }
    else {
        console.log("Invalid option for lockBoard")
    }
}

function hideOverlay() {
    $("div#overlay").css("display","none")
}