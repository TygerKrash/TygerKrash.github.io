
const endpoint = "https://jsonbox.io/box_d19452d79b225319086b";
const recordId = "600c1e4a92d72b0015b0c10f";

https://jsonbox.io/box_d19452d79b225319086b/600b6b3b92d72b0015b0b3e2

const ATTACK = "attack";
const DEFEND = "defend";
const FEINT = "defend";
const MANEUVER = "maneuver";

fetch(`${endpoint}/${recordId}`).then( function(response) {

    if(response.status = "200") {
        response.json().then( (data)=> drawCards(data));
    }else{
        console.log(response);
    }
}, function(err) { console.log(err);});


function drawCards(data){
   const action = data.action[0].action;
   if(action == ATTACK) {
     document.querySelector("#card1").classList.add("attackCard");
   }
   if(action == DEFEND) {
    document.querySelector("#card1").classList.add("defendCard");
   }
   if(action == FEINT) {
    document.querySelector("#card1").classList.add("maneuverCard");
   }
   if(action == MANEUVER) {
    document.querySelector("#card1").classList.add("feintCard");
   }
}