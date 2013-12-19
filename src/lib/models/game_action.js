var CardStack = require('./card_stack'),
    Card = require('./card');

var GameAction = function(gameActionData) {
  this.actionName = gameActionData.actionName;
  this.args = gameActionData.args || [];
  this.time = gameActionData.time || new Date().getTime();
  this.id = gameActionData.id;
};

GameAction.prototype.serialize = function() {
  var gameActionData = {
    actionName: this.actionName,
    args: [],
    time: this.time,
    id: this.id
  };

  // Convert cards and cardstacks into their string ids when serializing
  for (var i = 0; i < this.args.length; i++) {
    if ((this.args[i] instanceof CardStack || this.args[i] instanceof Card) && this.args[i].id !== undefined) {
      gameActionData.args.push(this.args[i].id);
    } else {
      gameActionData.args.push(this.args[i]);
    }
  }

  return gameActionData;
};

module.exports = GameAction;
