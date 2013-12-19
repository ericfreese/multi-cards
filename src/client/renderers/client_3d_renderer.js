var _ = require('lodash'),
    ClientRenderer = require('./client_renderer'),
    
    GameAction = require('../../lib/models/game_action'),

    CardMesh = require('./client_3d_renderer/card_mesh'),
    CardStackMesh = require('./client_3d_renderer/card_stack_mesh'),
    THREE = require('../vendor/threejs/build/three'),
    TWEEN = require('../vendor/tweenjs/build/tween.min');

var Client3dRenderer = function(game, el) {
  ClientRenderer.call(this, game, el);

  // Create camera
  this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
  this.camera.position.set(0, 0, 600);

  // Create scene
  this.scene = new THREE.Scene();

  // Create projector
  this.projector = new THREE.Projector();

  // Create renderer
  this.renderer = this.supportsWebGL ? new THREE.WebGLRenderer({ antialias: true }) : new THREE.CanvasRenderer({ antialias: true });
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.renderer.shadowMapEnabled = true;
  // this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
  // this.renderer.shadowMapDarkness = 0.5;

  // Create overhead light
  this.light = new THREE.SpotLight(0xffffff);
  this.light.position.set(0, 0, 2000);
  this.light.castShadow = true;
  this.light.shadowMapWidth = 1024;
  this.light.shadowMapHeight = 1024;
  this.light.shadowCameraNear = 500;
  this.light.shadowCameraFar = 4000;
  this.light.shadowCameraFov = 30;
  this.scene.add(this.light);

  // Create background
  // this.table = new THREE.Mesh(
  //   new THREE.PlaneGeometry(2000, 2000),
  //   new THREE.MeshBasicMaterial({ color: 0xeeeeee })
  // );
  // this.scene.add(this.table);

  // Keep track of card and card stack meshes
  this.cardStackMeshes = [];
  this.cardMeshes = [];

  // Update camera and renderer when window is resized
  window.addEventListener('resize', _.bind(function(e) {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }, this), false);

  // Keep track of where the mouse is
  this.mouse = new THREE.Vector2();

  // Set up event listeners
  document.addEventListener('click', _.bind(this.onClick, this), false);
  document.addEventListener('touchend', _.bind(this.onClick, this), false);
  document.addEventListener('mousemove', _.bind(this.onMouseMove, this), false);

  // Listen to game model change events
  game.subscribe('game.change.createCardStack', _.bind(this.onModelChangeCreateCardStack, this));
  game.subscribe('game.change.createCard', _.bind(this.onModelChangeCreateCard, this));
  game.subscribe('game.change.moveCardToCardStack', _.bind(this.onModelChangeMoveCardToCardStack, this));
  game.subscribe('game.change.flipCard', _.bind(this.onModelChangeFlipCard, this));

  // Put the renderer element on screen and start the render loop
  this.el.appendChild(this.renderer.domElement);
  this.animate();
};

Client3dRenderer.prototype = Object.create(ClientRenderer.prototype, {
  constructor: { value: Client3dRenderer }
});

Client3dRenderer.prototype.supportsWebGL = (function() {
  try {
    return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
  } catch(e) {
    return false;
  }
})();

Client3dRenderer.prototype.animate = function() {
  requestAnimationFrame(_.bind(this.animate, this));
  TWEEN.update();
  this.render();
};

Client3dRenderer.prototype.render = function() {
  this.renderer.render(this.scene, this.camera);
};

Client3dRenderer.prototype.destroy = function() {
  while (this.el.hasChildNodes()) {
    this.el.removeChild(this.el.lastChild);
  }

  document.removeEventListener('click', this.onClick);
  document.removeEventListener('touchend', this.onClick);
};

Client3dRenderer.prototype.onClick = function(e) {
  e.preventDefault();

  var vector = new THREE.Vector3((e.clientX / window.innerWidth) * 2 - 1, - (e.clientY / window.innerHeight) * 2 + 1, 0.5);
  this.projector.unprojectVector(vector, this.camera);

  var raycaster = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize()),
      intersects = raycaster.intersectObjects(this.cardMeshes, true);

  if (intersects.length > 0) {
    var clickedMesh = intersects[0].object;

    // Find the parent CardMesh
    while(!(clickedMesh instanceof CardMesh) && clickedMesh.parent !== undefined) {
      clickedMesh = clickedMesh.parent;
    }
    
    game.recordAction(new GameAction({
      actionName: 'flipCard',
      args: [ clickedMesh.card ]
    }));

    game.recordAction(new GameAction({
      actionName: 'moveCardToCardStack',
      args: [ clickedMesh.card, 'discard' ]
    }));
  }
};

Client3dRenderer.prototype.onMouseMove = function(e) {
  e.preventDefault();

  this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;

  var vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
  this.projector.unprojectVector(vector, this.camera);

  var raycaster = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize() ),
      intersects = raycaster.intersectObjects(this.cardMeshes, true);


  // if ( SELECTED ) {

  //   var intersects = raycaster.intersectObject( plane );
  //   SELECTED.position.copy( intersects[ 0 ].point.sub( offset ) );
  //   return;

  // }



  if (intersects.length > 0) {
    // var clickedMesh = intersects[0].object;

    // // Find the parent CardMesh
    // while(!(clickedMesh instanceof CardMesh) && clickedMesh.parent !== undefined) {
    //   clickedMesh = clickedMesh.parent;
    // }

    this.el.style.cursor = 'pointer';
  } else {
    this.el.style.cursor = '';
  }

  // if ( intersects.length > 0 ) {

  //   if ( INTERSECTED != intersects[ 0 ].object ) {

  //     if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

  //     INTERSECTED = intersects[ 0 ].object;
  //     INTERSECTED.currentHex = INTERSECTED.material.color.getHex();

  //     plane.position.copy( INTERSECTED.position );
  //     plane.lookAt( camera.position );

  //   }

  //   this.el.style.cursor = 'pointer';

  // } else {

  //   if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

  //   INTERSECTED = null;

  //   container.style.cursor = 'auto';

  // }
}

Client3dRenderer.prototype.onModelChangeMoveCardToCardStack = function(e, card, cardStackFrom, cardStackTo) {
  // TODO: Index card/cardStack meshes by card/cardStack ID
  for (var i = 0; i < this.cardMeshes.length; i++) {
    // if (this.cardMeshes[i].card.id === card.id || this.cardMeshes[i].card.cardStack === cardStackFrom) {
    this.cardMeshes[i].updatePosition();
  }
};

Client3dRenderer.prototype.onModelChangeFlipCard = function(e, card) {
  // TODO: Index card/cardStack meshes by card/cardStack ID
  for (var i = 0; i < this.cardMeshes.length; i++) {
    if (this.cardMeshes[i].card.id === card.id) {
      this.cardMeshes[i].updatePosition();
    }
  }
};

Client3dRenderer.prototype.onModelChangeCreateCardStack = function(e, cardStack) {
  var mesh = new CardStackMesh(cardStack);

  this.cardStackMeshes.push(mesh);
  this.scene.add(mesh);
};

Client3dRenderer.prototype.onModelChangeCreateCard = function(e, card) {
  var mesh = new CardMesh(card);

  this.cardMeshes.push(mesh);
  this.scene.add(mesh);

  mesh.updatePosition();
};

module.exports = Client3dRenderer;
