module.exports = require('http').createServer(require('./app'));

var io = require('./io'),
    CardGame = require('../lib/models/card_game'),
    GameAction = require('../lib/models/game_action'),
    CardStack = require('../lib/models/card_stack'),
    Card = require('../lib/models/card'),
    game = new CardGame();

var i, j;

// Initialize the game
for (i = 0; i < 7; i++) {
  game.recordAction(new GameAction({
    actionName: 'createCardStack',
    args: [ 'tableau-' + i, {
      x: -300 + 75 * i,
      y: 200,
      offsetX: 0,
      offsetY: -20
    } ]
  }));
}

game.recordAction(new GameAction({
  actionName: 'createCardStack',
  args: [ 'stock', {
    x: -300,
    y: 300,
    offsetX: 0.1,
    offsetY: -0.1
  } ]
}));

game.recordAction(new GameAction({
  actionName: 'createCardStack',
  args: [ 'discard', {
    x: -225,
    y: 300,
    offsetX: 0.1,
    offsetY: -0.1
  } ]
}));

for (i = 0; i < 4; i++) {
  game.recordAction(new GameAction({
    actionName: 'createCardStack',
    args: [ 'foundation-' + i, {
      x: -75 + 75 * i,
      y: 300,
      offsetX: 0.1,
      offsetY: -0.1
    } ]
  }));
}

for (i = 0; i < 4; i++) {
  for (j = 0; j < 13; j++) {
    game.recordAction(new GameAction({
      actionName: 'createCard',
      args: [ 'stock', {
        suit: ['♠', '♣', '♦', '♥'][i],
        rank: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][j],
        flipped: true
      } ]
    }));
  }
}

var card;

for (i = 0; i < 7; i++) {
  for (j = i; j < 7; j++) {
    card = game.getTopCardInCardStack('stock');
    
    game.recordAction(new GameAction({
      actionName: 'moveCardToCardStack',
      args: [ card, 'tableau-' + j ]
    }));

    if (j === i) game.recordAction(new GameAction({ actionName: 'flipCard', args: [ card ] }));
  }
}

game.subscribe('game.action', function(eventType, gameAction) {
  io.sockets.emit('game.action', gameAction.serialize());
});

io.sockets.on('connection', function(socket) {
  socket.emit('game.create', game.serialize());

  socket.on('game.action', function(gameActionData) {
    console.log('game.action', gameActionData);
    game.recordAction(new GameAction(gameActionData));
  });
});
