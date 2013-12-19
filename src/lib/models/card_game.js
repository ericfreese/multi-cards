var _ = require('lodash'),
    pubsub = require('pubsub-js'),

    GameAction = require('./game_action'),
    CardStack = require('./card_stack'),
    Card = require('./card');

var CardGame = function(gameData) {
  this.isServer = typeof window === 'undefined';

  this.cardStacks = {};
  this.cards = {};

  this.gameActions = [];

  if (gameData && gameData.cardStacks && gameData.gameActions) {
    this.deserialize(gameData);
  }
};

_.extend(CardGame.prototype, pubsub);

CardGame.prototype.serialize = function() {
  var gameData = {
    cardStacks: {},
    cards: {},
    gameActions: []
  }, i;

  for (i in this.cardStacks) {
    gameData.cardStacks[i] = this.cardStacks[i].serialize();
  }

  for (i in this.cards) {
    gameData.cards[i] = this.cards[i].serialize();
  }

  for (i = 0; i < this.gameActions.length; i++) {
    gameData.gameActions.push(this.gameActions[i].serialize());
  }

  return gameData;
};

// Deserialize and create game state from data if passed in
CardGame.prototype.deserialize = function(gameData) {
  for (var a in gameData.gameActions) {
    this.recordAction(new GameAction(gameData.gameActions[a]));
  }

  // TODO: Check to make sure game state created by actions matches supplied game state
};

CardGame.prototype.getCardId = function() {
  return 'card-' + _.size(this.cards);
};

CardGame.prototype.countCardsInCardStack = function(cardStackId) {
  var cardStack = this.getCardStackById(cardStackId);

  return cardStack.cards.length;
};

CardGame.prototype.getTopCardInCardStack = function(cardStackId) {
  var cardStack = this.getCardStackById(cardStackId);

  if (cardStack.cards.length === 0) throw 'CardStack with id: ' + cardStackId + ' has no cards.';

  return cardStack.cards[cardStack.cards.length - 1];
};

CardGame.prototype.getCardStackById = function(cardStackId) {
  // cardStackId param can be either string cardStackId or full CardStack object with id property
  if (cardStackId instanceof CardStack) cardStackId = cardStackId.id;

  if (!this.cardStacks[cardStackId]) throw 'CardStack with id: ' + cardStackId + ' does not exist.';

  return this.cardStacks[cardStackId];
};

CardGame.prototype.getCardById = function(cardId) {
  // cardId param can be either string cardId or full Card object with id property
  if (cardId instanceof Card) cardId = cardId.id;

  if (!this.cards[cardId]) throw 'Card with id: ' + cardId + ' does not exist.';

  return this.cards[cardId];
};

CardGame.prototype.actions = {
  createCardStack: function(cardStackId, cardStackData) {
    if (!!this.cardStacks[cardStackId]) throw 'CardStack with id: ' + cardStackId + ' already defined.';
    
    var cardStack = new CardStack(cardStackData);

    this.cardStacks[cardStackId] = cardStack;
    
    return [ cardStack ];
  },
  
  createCard: function(cardStackId, cardData) {
    if (cardData.id === undefined) cardData.id = this.getCardId();

    var cardStack = this.getCardStackById(cardStackId),
        card = new Card(cardData);

    this.cards[card.id] = card;
    cardStack.addCard(card);

    return [ card, cardStack ];
  },

  moveCardToCardStack: function(cardId, cardStackId) {
    var card = this.getCardById(cardId),
        cardStackFrom = card.cardStack,
        cardStackTo = this.getCardStackById(cardStackId);

    if (!!card.cardStack) card.cardStack.removeCard(card);
    this.cardStacks[cardStackId].addCard(card);

    return [ card, cardStackFrom, cardStackTo ];
  },

  flipCard: function(cardId, flippedValue) {
    var card = this.getCardById(cardId),
        flippedValue = (flippedValue !== undefined ? flippedValue : !card.flipped);

    card.flipped = flippedValue;

    return [ card ];
  }
};

CardGame.prototype.recordAction = function(gameAction, publish) {
  if (!gameAction instanceof GameAction || !this.actions[gameAction.actionName]) return;

  if (arguments.length < 2) publish = true;

  // Check if action's already been recorded, if so ignore it.
  // If id is set, the action originated elsewhere, check if it's already been executed here
  // TODO: Make this actually reliable
  if (gameAction.id !== undefined) {
    if (this.gameActions.length > gameAction.id) {
      return; // Action has already been executed
    }

    // If id is set and we're running as client, don't need to publish
    if (!this.isServer) publish = false;
  }

  // Check if action is valid, if so record it and propagate to clients.

  // If action isn't valid, don't propagate to clients, and if running as server,
  // tell sending client to undo the move.

  var changeArgs = this.actions[gameAction.actionName].apply(this, gameAction.args);

  gameAction.id = this.gameActions.length;

  this.gameActions.push(gameAction);

  // Publish change event for renderers
  if (changeArgs instanceof Array) {
    changeArgs.unshift('game.change.' + gameAction.actionName);
    this.publish.apply(this, changeArgs);
  }

  // Publish action event for network
  if (publish) {
    this.publish('game.action.' + gameAction.actionName, gameAction);
  }
};

module.exports = CardGame;
