var _ = require('lodash'),
    THREE = require('../../vendor/threejs/build/three'),
    TWEEN = require('../../vendor/tweenjs/build/tween.min');

var CardStackMesh = function(cardStack) {
  var geometry = new THREE.PlaneGeometry(60, 85);

  this.cardStack = cardStack;

  THREE.Mesh.call(this, geometry, this.cardStackMaterial);

  this.position.x = cardStack.x;
  this.position.y = cardStack.y;
  this.position.z = 0.1;
  this.receiveShadow = true;
};

CardStackMesh.prototype = Object.create(THREE.Mesh.prototype, {
  constructor: { value: CardStackMesh }
});

CardStackMesh.prototype.updatePosition = function() {
  TWEEN.remove(this.tween);

  this.tween = new TWEEN.Tween(this.position).to({
    x: this.cardStack.x,
    y: this.cardStack.y
  }, 300).easing(TWEEN.Easing.Quadratic.InOut).start();
};

CardStackMesh.prototype.cardStackMaterial = (function() {
  var canvas = document.createElement("canvas"),
      context = canvas.getContext("2d"),
      texture;
  
  canvas.width = 120;
  canvas.height = 170;

  context.fillStyle = '#FAF7EF';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "#EDEAE3";
  context.lineWidth = canvas.width / 6;
  context.strokeRect(0, 0, canvas.width, canvas.height);

  texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  return new THREE.MeshLambertMaterial({
    map: texture
  });
})();

module.exports = CardStackMesh;
