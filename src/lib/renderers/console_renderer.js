var _ = require('lodash'),

    colors = require('colors');

    BaseRenderer = require('./base_renderer');


colors.setTheme({
  '♠': 'bold',
  '♣': 'bold',
  '♦': 'red',
  '♥': 'red'
});

var ConsoleRenderer = function(game, console) {
  BaseRenderer.call(this, game);

  this.console = console;

  game.subscribe('game.change', _.bind(this.onModelChange, this));

  this.render();
};

ConsoleRenderer.prototype = Object.create(BaseRenderer.prototype, {
  constructor: { value: ConsoleRenderer }
});

ConsoleRenderer.prototype.render = function(e) {
  var cs, c, output;

  console.log(Array(60).join("-"));
  console.log('CURRENT GAMESTATE');
  console.log(Array(60).join("-"));

  for (cs in this.game.cardStacks) {
    output = _.map(this.game.cardStacks[cs].cards.slice(0), function(card) { return (card.rank + card.suit + ' ')[card.suit]; });
    output.unshift(cs + Array(20 - cs.length).join(' ') + ':');
    this.console.log.apply(this.console, output);
  }
  console.log(Array(60).join("-"));
};

ConsoleRenderer.prototype.onModelChange = function() {
  this.render();
};

module.exports = ConsoleRenderer;
