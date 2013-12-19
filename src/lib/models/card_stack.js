var CardStack = function(opts) {
  this.x = opts.x;
  this.y = opts.y;
  this.offsetX = opts.offsetX;
  this.offsetY = opts.offsetY;

  this.cards = [];
};

CardStack.prototype.serialize = function() {
  var i, json = {
    x: this.x,
    y: this.y,
    offsetX: this.offsetX,
    offsetY: this.offsetY,
    cards: []
  };

  for (i = 0; i < this.cards.length; i++) {
    json.cards.push(this.cards[i].serialize());
  }

  return json;
};

CardStack.prototype.addCard = function(card) {
  this.cards.push(card);
  card.cardStack = this;
};

CardStack.prototype.removeCard = function(card) {
  this.cards.splice(this.cards.indexOf(card), 1);
  card.cardStack = null;
};

module.exports = CardStack;
