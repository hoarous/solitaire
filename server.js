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


function Suit(name, endpoint){
  this.endpoint = endpoint;
  this.name = name;
  this.foundation = new Foundation(name);
  this.faceCards = [];
  // suits.push(this);
}

const suits = {
  hearts: new Suit('HEARTS', `https://some-random-api.ml/img/cat`),
  clubs: new Suit('CLUBS', `https://some-random-api.ml/img/koala`),
  spades: new Suit('SPADES', `https://some-random-api.ml/img/birb`),
  diamonds: new Suit('DIAMONDS', `https://some-random-api.ml/img/dog`)
}

//TOPLEVEL FUNCTION CALLS: these are the functions called directly by express.

//starts a new game
//TODO: api call, initialize game
function startGame(req,res){
  assignFaceCards()
    .then(result =>{
      console.log(result);
      return getDeck()
    },handleError)
    .then(result => {
      return dealDeck(result);
    }, handleError)
    .then( result =>{
      res.send(new GameState(result));
    }, handleError);
}

//loads a saved game
//TODO: sql query, handler to redirect to new game
function resumeGame(req,res){
  res.send(null);
}

//renders error page
function sendError(req,res){
  res.render('pages/error.ejs')
}



// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!=============================================== CORPSE CODE CORPSE CODE CORPSE CODE CORPSE CODE ===========================================================!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// DELETE THIS BEFORE FINAL VERSION!!!!!!!
// this is just for testing.
function test(req,res){
  let promise = assignFaceCards();
  console.log(promise);
  promise.then(result => {
    console.log(result);
    res.send(suits);
  }, handleError);
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
  return superagent.get(url)
    .then(res =>{
      let shuffledDeck = res.body.cards.map(card => new Card(card));
      console.log(shuffledDeck);
      return shuffledDeck;
    });
}

//assigns all face cards. takes in nothing. returns promise.
function assignFaceCards(){
  let promises = [];
  Object.values(suits).forEach( suit => {
    for(let i = 0; i < 3; i++){
      promises.push(getFaceImage(suit)
        .then(image => {
          suit.faceCards.push(image);
          console.log(suit.faceCards);
        }, handleError));
    }
  });
  console.log(promises);
  return Promise.all(promises);
}

//calls the image placeholder APIs. takes in the card face object and returns an image url.
function getFaceImage(suit){
  return superagent.get(suit.endpoint)
    .then(res => res.body.link);
}


//CONSTRUCTORS AND DATA STRUCTURES

//object constructor for a single card. takes in a card from Deck of Cards API, and processes it into a form useable by our app. API FORMAT:
// {
//   "image": "https://deckofcardsapi.com/static/img/8C.png",
//   "value": "8",
//   "suit": "CLUBS",
//   "code": "8C"
// }
function Card(data){
  this.image = data.image; //placeholder
  if (data.value==='JACK'){
    this.value = 11;
  }
  else if (data.value==='QUEEN'){
    this.value = 12;
  }
  else if (data.value==='KING'){
    this.value = 13;
  }
  else if (data.value==='ACE'){
    this.value = 1;
  }
  else this.value = parseInt(data.value);
  this.red = (data.suit==='HEARTS'||data.suite==='DIAMONDS'); //this will make playing solitaire easier.
  this.suit = data.suit;
}

//object constructor for game state data. takes in a shuffled, dealt deck of cards and arranges it into appropriate respective fans and stock.
//TODO: make this thing!! determine what other sub-structures are required to make this as parsimonious as possible.
function GameState(deck){
  this.deck = deck;
}

//the goal of klondike solitaire is to place the cards into the foundations, in order from ace to king with aces low.
function Foundation(suit){
  this.value = 0;
  this.suit = suit;
  this.topCard = null;
}

//checks if a card is eligible to be placed in a foundation and places it if so. returns true on success, false on falure.
Foundation.prototype.pushCard = function(card){
  if(card.suit===this.suit&&card.value===this.value+1){
    this.value++;
    this.topCard = card;
    return true;
  } else return false;
}

// these are the staggered, starting piles of cards. Initially only one card is visible in each fan. Cards or stacks of cards can be placed onto fans if the previous lowest card is one greater value and opposite color to the top card that is being placed onto it. the constructor takes in the shuffled deck and the size of the fan to be built, and initializes the fan with the appropriate number of cards.
function Fan(deck, size){
  this.cards = []; //array to hold the cards. index 0 is the deepest card; index total is the shallowest.
  this.total = size;
  this.visible = 1; //how many cards are actually visible. therefore, total-visible is the index of the deepest visible card.
  for (let i = 0; i < size; i++)this.cards.push(deck.pop());
}

//checks if a stack of cards is eligible to be placed onto a fan and places it if so. returns true on success, false on failure. takes in an array of cards.
Fan.prototype.addCards = function(cards){
  if(this.total===0||(cards[0].red!==this.cards[this.total-1].red&&cards[0].value==this.cards[this.total-1].value+1)){
    this.total+=cards.length;
    this.visible+=cards.length;
    for(let i = 0; i<cards.length; i++){
      this.cards.push(cards.shift());
    }
  }
}

//takes the number of cards to be removed and checks if allowed. returns null if ineligible, else the sub-array containing the removed stack of cards.
Fan.prototype.removeCards = function(num){
  if(num < this.visible)return null;
  else{
    this.visible -= num;
    this.total -= num;
    return this.cards.splice()
  }
}

// ERROR HANDLERS
function handleError(err){
  console.log(`${err.response} error: ${err.message}`);
}
