var _ = require('lodash'),
    THREE = require('./vendor/threejs/build/three'),
    TWEEN = require('./vendor/tweenjs/build/tween.min'),

    CardGame = require('../lib/models/card_game'),
    GameAction = require('../lib/models/game_action'),

    Client3dRenderer = require('./renderers/client_3d_renderer'),

    socket = io.connect();

exports.start = function() {
  var game, renderer, gameActionSubscription;

  // Load the game from the server
  socket.on('game.create', function(gameData) {
    // Don't allow multiple game creation for now
    if (!!game) throw 'Game already initialized. Reload page.';

    if (!!renderer) renderer.destroy();

    // Create the new game and initialize the renderer
    game = new CardGame();
    renderer = new Client3dRenderer(game, document.getElementById('cards-container'));
    game.deserialize(gameData);

    // Send local game actions to the server
    if (!!gameActionSubscription) game.unsubscribe(gameActionSubscription);
    gameActionSubscription = game.subscribe('game.action', function(eventType, gameAction) {
      socket.emit('game.action', gameAction.serialize());
    });

    window.game = game;
  });

  // Subscribe to game actions from the server
  socket.on('game.action', function(gameActionData) {
    game.recordAction(new GameAction(gameActionData));
  });
};
