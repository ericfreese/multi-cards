var BaseRenderer = require('../../lib/renderers/base_renderer');

var ClientRenderer = function(game, el) {
  BaseRenderer.call(this, game);

  this.el = el;
};

ClientRenderer.prototype = Object.create(BaseRenderer.prototype, {
  constructor: { value: ClientRenderer }
});

module.exports = ClientRenderer;
