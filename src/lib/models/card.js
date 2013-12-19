var _ = require('lodash');

var Card = function(opts) {
  this.id = opts.id;
  this.rank = opts.rank;
  this.suit = opts.suit;
  this.flipped = opts.flipped || false;
};

Card.prototype.serialize = function() {
  var json = {
    id: this.id,
    rank: this.rank,
    suit: this.suit,
    flipped: this.flipped
  };

  return json;
};

module.exports = Card;
