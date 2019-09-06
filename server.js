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


// set the view engine to ejs
app.set('view engine', 'ejs');


//connect to client
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// tell our express server to start listening on port PORT
app.listen(PORT, () => console.log(`listening on port ${PORT}`));

app.get('/newgame', startGame);
app.get('/loadgame', resumeGame);
app.get('/test', test)
app.get('*', sendError);


//GLOBAL VARIABLES

const cardFaces = [];

function CardFace(name, endpoint, path){
  this.endpoint = endpoint;
  this.path = path;
  this.name = name;
  this.faceCards = [];
  cardFaces.push(this);
}


new CardFace('HEARTS', `https://aws.random.cat/meow`, 'file');
new CardFace('CLUBS', `https://random-d.uk/api/quack?type=jpg`, 'url');
new CardFace('SPADES', `https://random.dog/woof.json `, 'url');
new CardFace('DIAMONDS', `https://randomfox.ca/floof/ `, 'image');

console.log(cardFaces);

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
  res.render('pages/error.ejs')
}



// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!=============================================== CORPSE CODE CORPSE CODE CORPSE CODE CORPSE CODE ===========================================================!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// DELETE THIS BEFORE FINAL VERSION!!!!!!!
// this is just for testing.
function test(req,res){
  getDeck()
    .then(result => {
      dealDeck(result);
    })
    .then( result =>{
      res.send(result);
    })
    .catch(err => (err));
}



//API CALLS & API HELPER FUNCTIONS

//calls deck of cards API. takes in nothing, returns the API ID of a deck of cards.
//TODO: code this.
function getDeck(){
  let url = `https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`;
  return superagent.get(url)
    .then(res => {
      return res.body.deck_id;
    });
}

//calls deck of cards API. takes in API ID of deck of cards and returns the entire deck, dealt, as an array of Cards.
function dealDeck(id){
  let url = `https://deckofcardsapi.com/api/deck/${id}/draw/?count=52`;
  superagent.get(url)
    .then(res =>{
      let shuffledDeck = res.body.cards.map(card => new Card(card));
      console.log(shuffledDeck);
      return shuffledDeck;
    });
}

//assigns all face cards. call getFaceImage for each suit within each iteration of the loop as promises oh god this is so ugly i'm so sorry. takes in nothing. returns nothing.
function assignFaceCards(){
  for(let i = 0; i < 3; i++){

  }
}

//calls the image placeholder APIs. takes in the API path and a string (the respective api's name for the toplevel data structure holding the image url, or 0 if none) and returns an image.
//TODO: code this.
function getFaceImage(endpoint, path){
  return superagent.get(endpoint)
    .then(res => res.body[path]);
}


//CONSTRUCTORS

//object constructor for game state data. takes in a shuffled, dealt deck of cards and arranges it into appropriate respective wells and piles. FORMAT: array of cards.
//TODO: make this thing!! determine what other sub-structures are required to make this as parsimonious as possible.
function GameState(deck){
  this.deck = deck;
}

//object constructor for a single card. takes in a card from Deck of Cards API, and processes it into a form useable by our app. API FORMAT:
// {
//   "image": "https://deckofcardsapi.com/static/img/8C.png",
//   "value": "8",
//   "suit": "CLUBS",
//   "code": "8C"
// }
function Card(data){
  if (data.value==='JACK')this.value = 11;
  else if (data.value==='QUEEN')this.value = 12;
  else if (data.value==='KING') this.value = 13;
  else if (data.value==='ACE') this.value = 1;
  else this.value = parseInt(data.value);
  this.red = (data.suit==='HEARTS'||data.suite==='DIAMONDS'); //this will make playing solitaire easier.
  this.suit = data.suit;
  this.image = `./assets/images/${this.suit}.jpg`; //POPULATE THIS
}

// ERROR HANDLER
function handleError(err){
  console.log(`${err.response} error: ${err.message}`);
}

