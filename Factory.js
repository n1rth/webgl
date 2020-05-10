window.onload = function () {

	if (WEBGL.isWebGLAvailable() === false) {

		document.body.appendChild(WEBGL.getWebGLErrorMessage());

	}

	// Global variables
	var container; 
	//var camera, controls, scene, renderer;
	var mouse = { x: 0, y: 0 }, INTERSECTED;
	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2(), INTERSECTED;
	var mouseClick = new THREE.Vector2();
    var params = { opacity: 0.25 }; // for gui

	// Number

	var canvas = document.getElementById("number");
	var ctx = canvas.getContext("2d");
	var x = 32;
	var y = 32;
	var radius = 30;
	var startAngle = 0;
	var endAngle = Math.PI * 2;

	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.beginPath();
	ctx.arc(x, y, radius, startAngle, endAngle);
	ctx.fill();

	ctx.strokeStyle = "rgb(255, 255, 255)";
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.arc(x, y, radius, startAngle, endAngle);
	ctx.stroke();

	ctx.fillStyle = "rgb(255, 255, 255)";
	ctx.font = "32px sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("1", x, y);

	// three.js

	var camera = void 0;
	var controls = void 0;
	var scene = void 0;
	var renderer = void 0;
	var sprite = void 0;
	var mesh = void 0;
	var spriteBehindObject = void 0;
	var annotation = document.querySelector(".annotation");

	init();
	animate();

	function init() {

		camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1e10);
		camera.position.set(100, 170, -100);

		controls = new THREE.OrbitControls(camera);

		scene = new THREE.Scene();
		scene.background = new THREE.Color(0xbfe3dd);
		scene.add(camera);

		// light
		//scene.add( new THREE.AmbientLight( 0x404040 ) );
		//pointLight = new THREE.PointLight( 0xffffff, 1 );
		//pointLight.position.copy( camera.position );
		//scene.add( pointLight );

		scene.add( new THREE.AmbientLight( 0x404040 ) );
		var dirLight = new THREE.DirectionalLight(0xffffff);
		dirLight.position.set(200, 200, 1000).normalize();

		camera.add(dirLight);
		camera.add(dirLight.target);

		// renderer
		renderer = new THREE.WebGLRenderer({ precision: 'highp', antialias: true, alpha: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0x666666);
		renderer.gammaOutput = true;
		renderer.gammaFactor = 1.2;

		container = document.createElement('div');
		document.body.appendChild(container);
		container.appendChild(renderer.domElement);

		// Load objects

		LoadGLTFModel().loadCluster(scene);

		// Mesh

		var cubeGeometry = new THREE.BoxGeometry(10, 10, 10);

		mesh = new THREE.Mesh(
			cubeGeometry,
			new THREE.MeshPhongMaterial({
				color: 0x156289,
				emissive: 0x072534,
				side: THREE.DoubleSide,
				shading: THREE.FlatShading
			}));

		// Sprite

		var numberTexture = new THREE.CanvasTexture(
			document.querySelector("#number"));


		var spriteMaterial = new THREE.SpriteMaterial({
			map: numberTexture,
			alphaTest: 0.5,
			transparent: true,
			depthTest: false,
			depthWrite: false
		});


		sprite = new THREE.Sprite(spriteMaterial);
		sprite.position.set(120, 170, -100);
		sprite.scale.set(60, 60, 1);

		scene.add(sprite);

		window.addEventListener('resize', onWindowResize, false);
		window.addEventListener('mousemove', onMouseMove, false);
		window.addEventListener('mousedown', downMouse, false);
		window.addEventListener('mouseup', upMouse, false);
		
		/*var gui = new dat.GUI();
			gui.add( params, 'opacity', 0, 1 ).onChange( function () {
			mat.opacity = params.opacity;
		} );
		gui.open();*/
		
	}

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);

	}

	function animate() {
		TWEEN.update();
		requestAnimationFrame(animate);
		controls.update();
		render();
		//renderer.render( scene, camera );
	}

	function render() {
		
		camera.updateMatrixWorld();
		// find intersections
		raycaster.setFromCamera(mouse, camera);
		var intersects = raycaster.intersectObjects(scene.children);
		if (intersects.length > 0) {
			if (intersects[0].object.name == "object") {
				if (INTERSECTED != intersects[0].object) {

					if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
					INTERSECTED = intersects[0].object;
					INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
					INTERSECTED.material.color.setHex(0xff0000);
					console.log(INTERSECTED.position.x,INTERSECTED.position.y,INTERSECTED.position.z);
				}
			}

		} else {
			if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
			INTERSECTED = null;
		}


		renderer.render(scene, camera);
		updateAnnotationOpacity();
		updateScreenPosition();
	}

	function updateAnnotationOpacity() {
		var meshDistance = camera.position.distanceTo(mesh.position);
		var spriteDistance = camera.position.distanceTo(sprite.position);
		spriteBehindObject = spriteDistance > meshDistance;
		sprite.material.opacity = spriteBehindObject ? 0.25 : 1;

		// Do you want a number that changes size according to its position?
		// Comment out the following line and the `::before` pseudo-element.
		sprite.material.opacity = 0;
	}

	function updateScreenPosition() {
		var vector = new THREE.Vector3(30, 10, -30);
		var canvas = renderer.domElement;

		vector.project(camera);

		vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
		vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));

		annotation.style.top = vector.y + "px";
		annotation.style.left = vector.x + "px";
		annotation.style.opacity = spriteBehindObject ? 0.25 : 1;
	}


	function downMouse(event) {
		mouseClick.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouseClick.y = - (event.clientY / window.innerHeight) * 2 + 1;
	}

	function upMouse(event) {
		if (mouseClick.x == mouse.x && mouseClick.y == mouse.y) {
			moveToObject();
		}
	}

	function moveToObject() {

		if (INTERSECTED != null) {
			console.log(INTERSECTED.position.x,INTERSECTED.position.y,INTERSECTED.position.z);

			var from = {
				x: camera.position.x,
				y: camera.position.y,
				z: camera.position.z
			};

			var to = {
				x: INTERSECTED.position.x,
				y: INTERSECTED.position.y,
				z: INTERSECTED.position.z
			};
			var tween = new TWEEN.Tween(camera.position)
				.to(to, 1000)//плавность движения
				.easing(TWEEN.Easing.Linear.None)
				.onUpdate(function () {
					camera.position.set(this.x + 150, this.y + 100, this.z );//угол,высота,дистанция
					camera.lookAt(new THREE.Vector3(to.x+150, to.y+100, to.z));// объект                            
				})
				.onComplete(function () {
					camera.position.set(to.x + 150, to.y + 100, to.z);
					controls.target.set(to.x, to.y, to.z);
				})
				.start();
		}

	}

	function onMouseMove(event) {
		event.preventDefault();
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
	}
}