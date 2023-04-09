const x = [];
const o = [];

const xColor = "green";
const oColor = "blue";
const originColor = "yellow";

$("document").ready(function() {
    resetGame();
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
        x.push(btnId)
        $("#statusBox > h1").html("O");
        $("#" + btnId).css("background-color", xColor);
    }
    else if(turn == 'O') {
        $("#" + btnId).html("O") 
        o.push(btnId)
        $("#statusBox > h1").html("X");
        $("#" + btnId).css("background-color", oColor);
    }
    else {
        console.log("Who's turn is it? Button has not turn value");
    }
}

async function resetGame() {
    const art = "|=|";
    $( ".tile" ).attr("data-claimed",false);  
    $( ".tile" ).html(art);
    $( ".tile" ).css("background-color", originColor);
    whoGoesFirst();
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