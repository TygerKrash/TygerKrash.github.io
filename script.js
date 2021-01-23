
const endpoint = "https://jsonbox.io/box_d19452d79b225319086b";
const recordId = "600b6b3b92d72b0015b0b3e2";

fetch(`${endpoint}/${recordId}`).then( function(response) {

    if(response.status = "200") {
        response.json().then( (data)=> drawCards(data));
    }else{
        console.log(response);
    }
}, function(err) { console.log(err);});


function drawCards(data){
   const action = data.action[0].action;
   if(action == "attack") {
     document.querySelector("card1").classList.add("attackCard");
   }
   if(action == "defend") {
    document.querySelector("card1").classList.add("defendCard");
   }
   if(action == "maneuver") {
    document.querySelector("card1").classList.add("maneuverCard");
   }
   if(action == "feint") {
    document.querySelector("card1").classList.add("feintCard");
   }
}