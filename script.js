
const endpoint = "https://api.jsonbin.io/v3/b/";
const urlParams = new URLSearchParams(window.location.search);
const sessionParam = urlParams.get("sessionId");
const isDM = sessionParam  == null;
const ATTACK = "attack";
const DEFEND = "defend";
const FEINT = "defend";
const MANEUVER = "maneuver";
const BACK = "back";
let gameState = {
    selectedCard:0,
    isSelecting: false,
    isDM :isDM,
    sessionId: isDM ? null: sessionParam,
    slots : [
        {  visible: false, selected : "" },
        {  visible: false, selected : "" },
        {  visible: false, selected : "" },
        {  visible: false, selected : "" },
        {  visible: false, selected : "" },
        {  visible: false, selected : "" }]
};


setInterval( () => {
    if(!gameState.isSelecting && gameState.initialLoadComplete) {
        toggleLoader();
        getLatest();
    }
},7000);

window.onload = () => {
    storedGame = localStorage.getItem("mouseGuardConflict",gameState);
    if (isDM) {
        if (storedGame == null) {
            sendData().then( () => {
                localStorage.setItem("mouseGuardConflict",JSON.stringify(gameState));
                gameState.initialLoadComplete =true;
            });
        } else {
            gameState = JSON.parse(storedGame);
        }
    } else if(!isDM) {
        document.querySelector(".burgerMenu").style.display='none';
        document.querySelector(".revealButtons").style.display='none';
        getLatest().then( () => gameState.initialLoadComplete = true );
    }
};


function generateLink() {
    let modal =  document.querySelector(".Modal");
    let modalContent=  document.querySelector(".modalContent");
    modal.style.display = "block";
    modalContent.textContent = `Share link:  ${window.location.origin}?sessionId=${gameState.sessionId}`;

}


function mapStateToJson() {
    return {
        conflictLeader: "",
        action: gameState.slots.map( e => { return {
            visible: e.visible,
            action: e.selected
        };
        })
    }
}

function toggleLoader() {
    if(document.querySelector(".loader").style.display == "none")
     {
        document.querySelector(".loader").style.display = "inline-block";
     }else{
        document.querySelector(".loader").style.display = "none";
     }
}

function updateStateFromFetch(data) {
    data.record.action.forEach( (item, index) => {
        let shouldUpdate = (isDM && index >2) || (!isDM && index <3) 
        if(shouldUpdate){ 
            gameState.slots[index].selected = item.action;
            gameState.slots[index].visible = item.visible;
        }
    });
}

function getLatest() {
    if( gameState.sessionId) {
        return fetch(`${endpoint}${gameState.sessionId}/latest`).then( function(response) {
            if(response.status = "200") {
                return response.json().then( (data)=> { 

                        updateStateFromFetch(data);
                        drawCards(); 
                        toggleLoader();
                });
            } else {
                console.log(response);
            }
        }, function(err) { console.log(err);});
    }
}


function drawCards() {

    gameState.slots.forEach( (item, index) => {
       drawCard(item,`#card${index+1}`,dmCard = index > 2)
    });
};

function drawCard(round,card,dmCard){
    const action = round.selected;
    const cardElement = document.querySelector(card);
    cardElement.className ="";
    const showHidden = (!isDM && !dmCard) || (isDM && dmCard) ;
    if(action == "") {
        cardElement.classList.add(`unselectedCard`);
    }else if (round.visible == false && showHidden) {
        cardElement.classList.add(`${action}Card`);
        cardElement.classList.add(`fuzzy`);
    }
    else if(round.visible == true ) {
        cardElement.classList.add(`${action}Card`);
    } else {
        cardElement.classList.add(`backCard`);
    }
}

function toggleSideMenu() {
    let style = document.querySelector(".sideMenu").style;
    if( style.display == "none") {
        style.display = "inline-block";
    }else {
        style.display = "none";
    }
}

function clearActions() {
    gameState.slots.forEach(e => e.selected ="");
    sendData();
}

function selectCard(index) {
    if(!isDM && index > 3) {
        return;
    }
    gameState.isSelecting =true;
    gameState.selectedCard = index-1;
    document.querySelector(".selectionPanel").style.display="inline-block";
}

function cardSelected(action) {
    gameState.slots[gameState.selectedCard].selected = action;
    document.querySelector(".selectionPanel").style.display="none";
    drawCards();
    sendData();
    gameState.isSelecting = false;
}

function reveal(row) {
    gameState.slots[row-1].visible = true;
    gameState.slots[row+2].visible = true;
    drawCards();
    sendData();
}

function sendData() {
    toggleLoader();

    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Bin-Private': 'false'
    };
    if(!gameState.sessionId) { 
        headers['X-Master-Key']= urlParams.get('apikey');
    }

   
    return fetch(`${endpoint}${ gameState.sessionId  ?? ""}`,
        { 
            method: gameState.sessionId != null ? 'PUT' : 'POST', 
            body: JSON.stringify(mapStateToJson()),
            headers: headers
        }).then( function(response) {

        if(response.status = "200") {
            return response.json().then( (data)=> { 
                    toggleLoader();
                    gameState.sessionId = data.metadata.id ?? data.metadata.parentId;
                    drawCards(data); 
                    document.querySelector(".loader").style.display = "none";
            });
        } else {
            console.log(response);
        }
    }, function(err) { console.log(err);});
}

function dismissModal () {
    document.querySelector('.Modal').style.display='none';
}