# Mouse Guard Conflicts App

## What is it? 

This repo is the source for an implementation of the Mouse Guard RPG conflict card rules.

very simply it allows a team of players and the dm to select 3 cards in secret and reveal them one by one.

## how to use it

if you are a GM and you want to run a conflict you need to load the app using 
https://tygerkrash.github.io/?apikey=XXXXXXX
where XXXXXXX is the json.io api key ( see next section)

once the app is loaded you will see the 2 rows of three cards,  
the top 3 are the player team cards and bottom three are the 
GM team cards.

You can click on the GM cards and select an action from the cards presented. 
Cards selected are stored but the player user cannot  see their value until you click the _reveal_ action
under the column, doing so also reveals the player selections for that round to you.

On the top left, there's a 'hamburger' menu icon. the _Share_ and _Clear_ options are there.

_share_ creates a link that you can share with your players so they can see the game state and make selections.
_clear_ wipes all cards in preparation for a new round.

the _reveal_, _share_ and _clear_ options are not available to non GM players.



## how is it implemented 
it's all vanilla js , css and html right now.  the JSON api that provides a shared data is
provided by [Jsonbin.io] , access to Jsonbin.io requires an api key and there isn't one built 
into this app, anyone can sign up for an account though and you can provide your own apikey in the url as 
indicated in the 'how to use it' section.

## TODO
- Provide indication of user 'logged in'
- GM assign conflict captain
- allow conflict captain assign other player users to rounds.
- provide game prompts as each action resolves, perhaps capture conflict types and offer appropriate modifiers.
- move to a subscription model for updates
- possibly support multiple teams.
- increase 'secrecy' - card actions are sent in plaintext right now, just hidden in the UI until reveal is clicked.
