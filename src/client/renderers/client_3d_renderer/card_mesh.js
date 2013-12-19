var _ = require('lodash'),
    THREE = require('../../vendor/threejs/build/three'),
    TWEEN = require('../../vendor/tweenjs/build/tween.min');

var CardMesh = function(card) {
  this.card = card;
  this.tweens = [];

  var faceGeometry = new THREE.PlaneGeometry(50, 75),
      backGeometry = new THREE.PlaneGeometry(50, 75);

  backGeometry.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI));

  THREE.Object3D.call(this);

  var faceMesh = new THREE.Mesh(faceGeometry, this.getCardFaceMaterial()),
      backMesh = new THREE.Mesh(backGeometry, this.cardBackMaterial);

  this.add(faceMesh);
  this.add(backMesh);

  this.position.x = 0;
  this.position.y = 0;
  this.position.z = 500;

  // this.castShadow = true;
  // this.receiveShadow = true;
};

CardMesh.prototype = Object.create(THREE.Object3D.prototype, {
  constructor: { value: CardMesh }
});

CardMesh.prototype.updatePosition = function() {
  for (var i = 0; i < this.tweens.length; i++) {
    TWEEN.remove(this.tweens[i]);
  }

  this.tweens.push(new TWEEN.Tween(this.rotation).to({
    y: this.card.flipped ? Math.PI : 0
  }, 300).easing(TWEEN.Easing.Quadratic.InOut).start());

  this.tweens.push(new TWEEN.Tween(this.position).to({
    x: this.card.cardStack.x + this.card.cardStack.offsetX * this.card.cardStack.cards.indexOf(this.card),
    y: this.card.cardStack.y + this.card.cardStack.offsetY * this.card.cardStack.cards.indexOf(this.card),
    z: 0.2 + 0.1 * this.card.cardStack.cards.indexOf(this.card)
  }, 300).easing(TWEEN.Easing.Quadratic.InOut).start());
};

CardMesh.prototype.cardFaceMaterials = {};

CardMesh.prototype.getCardFaceMaterial = function() {
  if (this.cardFaceMaterials[this.card.rank + this.card.suit]) {
    return this.cardFaceMaterials[this.card.rank + this.card.suit];
  }

  var canvas = document.createElement("canvas"),
      context = canvas.getContext("2d"),
      texture, material;
  
  canvas.width = 100;
  canvas.height = 150;

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "#333333";
  context.lineWidth = canvas.width / 40;
  context.strokeRect(0, 0, canvas.width, canvas.height);

  context.textAlign = "left";
  context.textBaseline = "top";
  context.font = (canvas.width / 6) + "pt Arial";
  context.fillStyle = ['♦', '♥'].indexOf(this.card.suit) !== -1 ? 'rgb(255, 0, 0)' : 'rgb(0, 0, 0)';
  context.fillText(this.card.rank + ' ' + this.card.suit, canvas.width / 15, canvas.height / 30);

  texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  material = new THREE.MeshLambertMaterial({
    map: texture
  });

  this.cardFaceMaterials[this.card.rank + this.card.suit] = material;

  return material;
};

CardMesh.prototype.cardBackMaterial = (function() {
  var canvas = document.createElement("canvas"),
      context = canvas.getContext("2d"),
      texture;
  
  canvas.width = 100;
  canvas.height = 150;

  context.fillStyle = '#9999CC';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "#333333";
  context.lineWidth = canvas.width / 40;
  context.strokeRect(0, 0, canvas.width, canvas.height);

  texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  return new THREE.MeshLambertMaterial({
    map: texture
  });
})();

module.exports = CardMesh;
