
const endpoint = "https://jsonbox.io/box_d19452d79b225319086b"

fetch(endpoint, (response) => {

    if(response.status = "200") {
        response.JSON().then( (data)=> console.log(data));
    }
}, (err) => console.log(err));
