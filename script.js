"use strict"
const endpoint = "https://api.jsonbin.io/v3/b/";
const urlParams = new URLSearchParams(window.location.search);
const sessionParam = urlParams.get("sessionId");
const apiKey = urlParams.get('apikey');
const isDM = sessionParam  == null;
const ATTACK = "attack";
const DEFEND = "defend";
const FEINT = "defend";
const MANEUVER = "maneuver";
const BACK = "back";
const LOCALSTORAGEKEY ="mouseGuardConflict";


const playerColors = [
    "a9294f",
    "6f9eaf",
    "c7753d",
    "f6d887"
];


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
        {  visible: false, selected : "" }],
    players: [

    ],
    localMouse: undefined
};


setInterval( () => {
    if(!gameState.isSelecting && gameState.initialLoadComplete) {
        setLoader(true);
        getLatest().then(()=>  setLoader(false));
    }
},9000);



window.onload = () => {

    if(sessionParam == null &&  apiKey == null) {
        showModal(`Hi, You'll need an jsonbin.io apikey to use the app as GM. load the site using  ${window.location.origin}?apiKey=JSONBINAPIKEY once you have one.`)
        return;
    }
    let  storedGame = localStorage.getItem(LOCALSTORAGEKEY,gameState);
    if (isDM) {
      gmOnLoad(storedGame);
    } else if(!isDM) {
      playerOnLoad(storedGame)
    }
};


function gmOnLoad(storedGame) {
    gameState.localMouse ='DM';
    if (storedGame == null) {
        setLoader(true);
        sendData().then( () => {
            gameState.initialLoadComplete =true;
            setLoader(false);
        });
    } else {
        gameState = JSON.parse(storedGame);
        
        gameState.initialLoadComplete =true;
        renderCards();
    }
}

function playerOnLoad( storedGame) {
    document.querySelector(".burgerMenu").style.display='none';
    document.querySelector(".revealButtons").style.display='none';
    getLatest().then( () => { gameState.initialLoadComplete = true;} );
    if(storedGame !== null) {
        gameState = JSON.parse(storedGame);
    }
    if(gameState.localMouse == undefined) {
       setCharacterName();
    }
}

function setCharacterName( ) {
    let captureForm = document.querySelector("#mouseCapture")
    captureForm.showModal();
    captureForm.addEventListener('close', function onClose() {
      gameState.localMouse = captureForm.returnValue;
      if ( gameState.players.some( (item) => item == gameState.localMouse)) {
          showModal(`Mouse ${gameState.localMouse} already exists`);
          captureForm.showModal();
      }else {
          gameState.players.push(gameState.localMouse);
          localStorage.setItem(LOCALSTORAGEKEY,JSON.stringify(gameState));
          sendData();
      }
    });
    document.querySelector("#mouseName").addEventListener('change', function onSelect(e) {
      confirmBtn.value = e.target.value;
    });
}

function showModal(content) {
    let modal =  document.querySelector("#modalMessage");
    let modalContent=  document.querySelector(".modalContent");
    modalContent.textContent = content;
    modal.showModal();
}

function mapStateToJson() {
    return {
        conflictLeader: "",
        action: gameState.slots.map( e => { 
            return {
                visible: e.visible,
                action: e.selected
            };
        }),
        players: gameState.players
    }
}

function setLoader(on) {
    if(on) { 
        document.querySelector(".loader").style.display = "inline-block";
    }else {
        document.querySelector(".loader").style.display = "none";
    }
}

function updateStateFromFetch(data) {
    data.record.action.forEach( (item, index) => {
        let shouldUpdate = (isDM && index <3) || (!isDM) 
        if(shouldUpdate){ 
            gameState.slots[index].selected = item.action;
            gameState.slots[index].visible = item.visible;
        }
    });
    gameState.players = data.record.players ?? [];
    if(gameState.localMouse && !gameState.players.includes(gameState.localMouse)) {
        gameState.players.push(gameState.localMouse);
    }
}

function getLatest() {
    if( gameState.sessionId) {
        return fetch(`${endpoint}${gameState.sessionId}/latest`).then( function(response) {
            if(response.status == "200") {
                return response.json().then( (data)=> {
                        updateStateFromFetch(data);
                        localStorage.setItem(LOCALSTORAGEKEY,JSON.stringify(gameState));
                        renderCards(); 
                        renderPlayers();
                });
            } else {
                console.log(response);
            }
        }, function(err) { console.log(err);});
    }
}


function renderCards() {

    gameState.slots.forEach( (item, index) => {
       renderCard(item,`#card${index+1}`,index > 2)
    });
};

function renderCard(round,card,dmCard){
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
    document.querySelector(".sideMenu").classList.toggle("showNav");
    document.querySelector(".burgerMenu").classList.toggle("cancelIcon");
}

function renderPlayers() {
    let players = document.querySelector(".players");
    while (players.firstChild) {
        players.lastChild.remove()
    }
    
    gameState.players.forEach( (e,i) =>  {

        let container = document.createElement("div"); 
        players.appendChild(container);
        let element = document.createElement("span");
        element.setAttribute("style", `background-color : ${playerColors[i]}`);
        container.appendChild(element );
        let label = document.createElement("label");
        label.textContent = e;
        label.setAttribute("style", `color : ${playerColors[i]}`);
        container.appendChild(label );
    });
}

function clearActions() {
    gameState.slots.forEach(e => { e.selected =""; e.visible =false;});
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
    renderCards();
    sendData();
    gameState.isSelecting = false;
}

function reveal(row) {
    gameState.slots[row-1].visible = true;
    gameState.slots[row+2].visible = true;
    renderCards();
    sendData();
}

function resolve(row) {
    const playerSlot =gameState.slots[row-1];
    const gmSlot = gameState.slots[row+2];
    const playerAction = playerSlot.selected
    const gmAction  = gmSlot.selected;

    if(playerAction == "" || gmAction == "" || gmSlot.reveal == false) {
        showModal("Action isn't ready to resolve, both parties must select an action to proceed!");
        return;
    }

    const yourAction = isDM ? gmAction : playerAction;
    const theirAction  = isDM ? playerAction : gmAction; 
    showModal(resolveActionGrid(yourAction,theirAction))
}



function resolveActionGrid(yourAction, opponentAction) {

    const grid = [
        {yourAction: "attack", opponentAction: "attack", message: " Roll your 'attack' skill in VS Test. If you roll more successes, opponents disposition reduced by net difference and vice versa"},
        {yourAction: "attack", opponentAction: "defend", message: " Roll your 'attack' skill in VS Test. If you roll more successes, opponents disposition reduced by the net difference ,if  opponent rolls more they gain disposition equal to the net difference "},
        {yourAction: "attack",  opponentAction: "feint", message: " Roll your 'attack' skill reduce opponents disposition by successes. Opponent rolls nothing."},
        {yourAction: "attack",  opponentAction: "maneuver", message: " Roll your 'attack' skill in VS Test. If you roll more successes reduce opponents disposition by net successes. Opponent gains maneuver benefits based on net success"},

        {yourAction: "defend", opponentAction: "attack", message: " Roll your 'defend' skill in VS Test. If you roll more successes, increase your disposition  by net difference if opponent rolls more you lose disposition equal to net difference. "},
        {yourAction: "defend", opponentAction: "defend", message: " Roll your 'defend' skill in Ob(3) test. increase disposition by net successes. Opponent does same"},
        {yourAction: "defend",  opponentAction: "feint", message: " You roll nothing, opponent rolls to reduce your disposition"},
        {yourAction: "defend",  opponentAction: "maneuver", message: " Roll your 'defend' skill in VS Test. If you roll more successes,increase your disposition by net successes. Opponent gains maneuver benefits based on net success"},

        {yourAction: "feint", opponentAction: "attack", message: " you roll nothing, opponent rolls to reduce your disposition"},
        {yourAction: "feint", opponentAction: "defend", message: " roll 'feint' skill vs Ob(0) test, decrese opponent disposition by net success. Opponent does nothing" },
        {yourAction: "feint",  opponentAction: "feint", message: " Roll you 'feint' skill in a VS test,if you roll more successes opponents disposition decreased by net success and vice versa"},
        {yourAction: "feint",  opponentAction: "maneuver", message: " roll 'feint' skill vs Ob(0) test, decrese opponent disposition by net success.  opponent makes independant maneuver roll"},

        {yourAction: "maneuver", opponentAction: "attack", message: " Roll your 'maneuver' skill in VS test. If you roll more succcesses you may gain : 1 Net success : Impede -1D to opponents next roll, 2 net success: Gain Position +2D to your next roll, 3 net success Disarm -remove an opponent's weapon or disable a trait for this combat OR take both Impede and Gain position."},
        {yourAction: "maneuver", opponentAction: "defend", message: " Roll your 'maneuver' skill in VS test. If you roll more succcesses you may gain : 1 Net success : Impede -1D to opponents next roll, 2 net success: Gain Position +2D to your next roll, 3 net success Disarm -remove an opponent's weapon or disable a trait for this combat OR take both Impede and Gain position."},
        {yourAction: "maneuver",  opponentAction: "feint", message: " Roll your 'maneuver' skill in Ob(0) test. your successes can be used as follows:   1 success : Impede -1D to opponents next roll, 2 success: Gain Position +2D to your next roll, 3  success Disarm -remove an opponent's weapon or disable a trait for this combat OR take both Impede and Gain position."},
        {yourAction: "maneuver",  opponentAction: "maneuver", message: " Roll your 'maneuver' skill in Ob(0) test. your successes can be used as follows:   1 success : Impede -1D to opponents next roll, 2 success: Gain Position +2D to your next roll, 3  success Disarm -remove an opponent's weapon or disable a trait for this combat OR take both Impede and Gain position."},

    ]


    return grid.filter( (e) => e.yourAction == yourAction && e.opponentAction == opponentAction)[0].message;


}

function sendData() {

    var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Bin-Private': 'false',
        'versioning': 'false'
    };
    if(!gameState.sessionId) { 
        headers['X-Master-Key']= apiKey;
    }

    return fetch(`${endpoint}${ gameState.sessionId  ?? ""}`,
        { 
            method: gameState.sessionId != null ? 'PUT' : 'POST', 
            body: JSON.stringify(mapStateToJson()),
            headers: headers
        }).then( function(response) {

            if(response.status == "200") {
                return response.json().then( (data)=> { 
                    gameState.sessionId = data.metadata.id ?? data.metadata.parentId;
                    localStorage.setItem(LOCALSTORAGEKEY,JSON.stringify(gameState));
                    renderCards(data); 
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