
const endpoint = "https://jsonbox.io/box_d19452d79b225319086b"

fetch(endpoint).then( function(response) {

    if(response.status = "200") {
        response.json().then( (data)=> console.log(data));
    }else{
        console.log(response);
    }
}, function(err) { console.log(err);});
