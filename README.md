#SOLITAIRE
Author: Mae-mae Zhou
Version: 0.0

#Description
A simple solitaire project.

This app will be an implimentation of the popular card game solitaire in its standard form, using the deckofcards API and various animal picture APIs to generate face card images.

#Libraries

#Usage

#API Endpoints
##Deck of Cards API
https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1 : creates and shuffles a new, single deck of cards

https://deckofcardsapi.com/api/deck/<<deck_id>>/draw/?count=52 : will deal the deck in its entirety.

Deck of Cards API has its own built in card images, but for the purposes of this project we will be disregarding those and styling our own cards in css. We will also disregard its pile functionality, as it will be easier to manipulate game data if this is done on our own server.

##PlaceGoat
https://placegoat.com/200/200 - returns a goat image of dimensions 200x200 (no json)

#RandomCat
https://aws.random.cat/meow - returns a random cat image encapsulated in a json.

#RandomDog
https://random.dog/woof.json - returns a random dog image encapsulated in a json.

#RandomFox
https://randomfox.ca/floof/ - returns a random fox image encapsulated in a json.

#Database Schemas
[sql schema](./assets/schema.sql)
