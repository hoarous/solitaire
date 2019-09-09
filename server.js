'use strict';

//application dependencies
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const superagent = require('superagent');
const pg = require('pg');

// configure environment variables
require('dotenv').config();
const PORT = process.env.PORT || 3000;


//connect to client
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// tell our express server to start listening on port PORT
app.listen(PORT, () => console.log(`listening on port ${PORT}`));

app.get('/newgame', startGame);
app.get('/loadgame', resumeGame);
app.get('*', sendError);


//TOPLEVEL FUNCTION CALLS: these are the functions called directly by express.

//starts a new game
//TODO: api call, initialize game
function startGame(req,res){
  res.send(new GameState(getDeck()));
}

//loads a saved game
//TODO: sql query, handler to redirect to new game
function resumeGame(req,res){
  res.send(null);
}

function sendError(req,res){
  res.render()
}

//CONSTRUCTORS

//object constructor for game state data. takes in a shuffled, dealt deck of cards and arranges it into appropriate respective wells and piles. FORMAT: array of cards.
//TODO: make this thing!!
function GameState(deck){
  this.deck = deck;
}

//object constructor for a single card. takes in a card from Deck of Cards API, and processes it into a form useable by our app. FORMAT:
// {
//   "image": "https://deckofcardsapi.com/static/img/8C.png",
//   "value": "8",
//   "suit": "CLUBS",
//   "code": "8C"
// }
function Card(data){
  if(Number.isInteger(data.value))this.value = data.value;
  else if (data.value==='JACK')this.value = 11;
  else if (data.value==='QUEEN')this.value = 12;
  else this.value = 13;
  this.red = (data.suit==='HEARTS'||data.suite==='DIAMONDS'); //this will make playing solitaire easier.
  this.suite = data.suit;
  if(this.value>10){
    this.image = assignFaceCard(this.suite);
  }
}

// calls animal image APIs and assigns an image to each face card. takes in a suite. returns an image url. hearts are cats, diamonds are foxes, spades are dogs, clubs are goats.
function assignFaceCard(suite){

}


//API CALLS

//calls deck of cards API. takes in nothing, returns a shuffled and dealt deck of cards.
//TODO: code this.
function getDeck(){

}

//calls the image placeholder APIs. takes in the API name and returns an image.
//TODO: code this.
function getFaceImage(api){

}
