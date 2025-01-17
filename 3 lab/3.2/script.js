import { TrackballControls } from 'https://unpkg.com/three@0.123.0/examples/jsm/controls/TrackballControls.js';

var renderer;
var scene;
var camera, c1, c2, c2h, c3;

var dollyPosition = -50;

var queen2;

var cameraObj;

var options;

var trackballControls;
var eyeTargetScale;

function main() {
	scene = new THREE.Scene();
	c1 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
	c1.position.set(-100, 40, 60);
	c1.lookAt(scene.position);

	c2 = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 150);
	c2h = new THREE.CameraHelper(c2);
	scene.add(c2h);

	c3 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
	c3.position.set(4.6, 35, 0);

	cameraObj = createCamera();
	cameraObj.position.set(c3.position.x, c3.position.y+10, c3.position.z);
	scene.add(cameraObj);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor(0xEEEEEE);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	var spotLight = new THREE.SpotLight({ intensity: 1 });
	spotLight.position.set(-50, 40, -80);
	spotLight.angle = Math.PI / 3.5;
	spotLight.castShadow = true;

	scene.add(spotLight);

	const ambientLight = new THREE.AmbientLight(0x202020, 2);
	scene.add(ambientLight);

	document.body.appendChild(renderer.domElement);

	var controls = new function() {
		this.FOV = 45;
		this.Camera = 1;
		this.Dolly = 0;
		this.dollyWireframe = false;

		this.asGeom = function() {
			options = {
				FOV: controls.FOV,
				Camera: controls.Camera,
				Dolly: controls.Dolly,
				dollyWireframe: controls.dollyWireframe
			};

			c1.fov = options.FOV;
			c1.updateProjectionMatrix();
			changeCamera(options.Camera);
			zoomInDoly(options.Dolly - 73);
			c2h.visible = options.dollyWireframe;
		};
	}

	var gui = new dat.GUI();
	gui.add(controls, 'FOV', 2, 80).step(1).onChange(controls.asGeom);
	gui.add(controls, 'Camera', 1, 3).step(1).onChange(controls.asGeom);
	gui.add(controls, 'Dolly', -100, 100).step(0.01).onChange(controls.asGeom);
	addFloor();

	const queen1 = createQueen();
	queen1.position.x = 5.2;
	queen1.position.z = 40;
	queen1.name = "queen1";

	queen2 = createQueen();
	queen2.position.x = -5.5;
	queen2.position.z = -5.5;
	queen2.name = "queen2";

	c2.position.x = dollyPosition;
	c2.position.z = dollyPosition;
	c2.position.y = 13;
	target = new THREE.Vector3();
	target.set(queen2.position.x, queen2.position.y + 10, queen2.position.z)
	c2.lookAt(target);
	c2.updateMatrixWorld();

	c2.far = target;

	let startdir = new THREE.Vector3();
	startdir.subVectors(c2.position, target);
	eyeTargetScale = Math.tan(c2.fov * (Math.PI / 180) / 2) * startdir.length();

	scene.add(queen1);
	scene.add(queen2);

	trackballControls = new TrackballControls(c1, renderer.domElement);
	controls.asGeom();
	render();
}


let direction;
let target;

function zoomInDoly(level)
{
	c2.position.x = dollyPosition - dollyPosition * level / 50;
	c2.position.z = dollyPosition - dollyPosition * level / 50;

	target = new THREE.Vector3();
	target.set(queen2.position.x, queen2.position.y + 10, queen2.position.z)

	direction = new THREE.Vector3();
	direction.subVectors(c2.position, target);

	c2.near = direction.length() / 100;
	c2.far = direction.length() + 100;
	c2.fov = (180 / Math.PI) * 2 * Math.atan(eyeTargetScale / direction.length());
	c2.lookAt(target);

	c2.updateProjectionMatrix();
	c2.updateMatrixWorld();
	c2h.update();
}

function changeCamera(cameraNo) 
{
	switch (cameraNo) {
		case 1:
			camera = c1;
			break;
		case 2:
			camera = c2;
			break;
		case 3:
			camera = c3;
			break;
		default:
			camera = c1;
			break;
	}
}

function createCamera() 
{
	const cameraMesh = new THREE.Object3D();
	var rollGeometry = new THREE.CylinderGeometry(2, 2, 0.8, 32);
	var frontGeometry = new THREE.CylinderGeometry(0.5, 0.1, 1.5, 32);
	var bodyGeometry = new THREE.CubeGeometry(2.5, 2.5, 5);
	var material = new THREE.MeshLambertMaterial({color: 0xcccccc});
	var roll = new THREE.Mesh(rollGeometry, material);
	roll.rotation.z = Math.PI / 2;
	roll.position.x = 0;
	roll.position.y = 2;
	roll.position.z = 1;
	cameraMesh.add(roll);

	var body = new THREE.Mesh(bodyGeometry, material);
	cameraMesh.add(body);

	var front = new THREE.Mesh(frontGeometry, material);
	front.position.z = 2.5;
	front.rotation.x = Math.PI / 2;
	cameraMesh.add(front)

	var roll2 = new THREE.Mesh(rollGeometry, material);
	roll2.rotation.z = Math.PI / 2;
	roll2.scale.x = roll2.scale.x * 0.5
	roll2.scale.y = roll2.scale.y * 0.5
	roll2.scale.z = roll2.scale.z * 0.5
	roll2.position.x = 0;
	roll2.position.y = 1.5;
	roll2.position.z = -1.75;
	cameraMesh.add(roll2);

	cameraMesh.position.y = 15
	cameraMesh.position.z = 15

	return cameraMesh
}

function createQueen() 
{
    var points = [];
    points.push(new THREE.Vector2(0, 10.2)); 
    points.push(new THREE.Vector2(0.5, 9.9));

    var numPoints = 16; 
    var radius = 1.5; 
    var waveAmplitude = 0.2; 
    var height = 0.5; 

    for (var i = 0; i < numPoints; i++) {
        var angle = (i / (numPoints - 1)) * Math.PI * 2; 
        var x = radius * Math.cos(angle) + waveAmplitude * Math.sin(4 * angle); 
        var y = height * Math.cos(2 * angle) + 9.7; 
        
        points.push(new THREE.Vector2(x, y)); 
    }


    points.push(new THREE.Vector2(1.2, 9.18));
    points.push(new THREE.Vector2(1.1, 9.0));
    points.push(new THREE.Vector2(0.8, 7.8));
    points.push(new THREE.Vector2(1, 7.8));
    points.push(new THREE.Vector2(1.2, 7.6));
    points.push(new THREE.Vector2(1, 7.4));
    points.push(new THREE.Vector2(0.8, 7.4));
    points.push(new THREE.Vector2(0.8, 7.0));
    points.push(new THREE.Vector2(1, 7.0));
    points.push(new THREE.Vector2(1.4, 6.8));
    points.push(new THREE.Vector2(1, 6.6));
    points.push(new THREE.Vector2(1, 6.5));
    points.push(new THREE.Vector2(1.6, 6.5));
    points.push(new THREE.Vector2(2, 6.3));
    points.push(new THREE.Vector2(1.6, 6.1));
    points.push(new THREE.Vector2(0.7, 6.1));
    points.push(new THREE.Vector2(0.7, 5.0));
    points.push(new THREE.Vector2(0.9, 3.2));
    points.push(new THREE.Vector2(1.5, 3.2));
    points.push(new THREE.Vector2(2.2, 3.0));
    points.push(new THREE.Vector2(2, 2.5));
    points.push(new THREE.Vector2(2, 2.3));
    points.push(new THREE.Vector2(3.4, 1.3));
    points.push(new THREE.Vector2(3.7, 1.0));
    points.push(new THREE.Vector2(4.1, 0));
    points.push(new THREE.Vector2(0, 0));
    
	var queenpoint = [];
	for (var i = 0; i < points.length; i++) {
		queenpoint.push(points[i]);
	}

	var latheGeometry = new THREE.LatheGeometry(queenpoint, 32);
	var material = new THREE.MeshLambertMaterial({ color: 0xfffff0, transparent: false, side: THREE.DoubleSide });
	material.flipY = true;
	var queenBody = new THREE.Mesh(latheGeometry, material);

	var sphereGeometry = new THREE.SphereGeometry(0.58, 32, 32); 
	var sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xfffff0 });
	var crownSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

	crownSphere.position.set(0, 9.9, 0); 

	var queen = new THREE.Group();
	queen.add(queenBody);
	queen.add(crownSphere);

	return queen;

}

function addFloor() 
{
	var floorGeometry = new THREE.BoxGeometry(100, 100, 7); 

	var floorMaterial = new THREE.MeshPhongMaterial({ shininess: 40 });
	floorMaterial.map = new THREE.TextureLoader().load("chessBoard.png");

	var floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
	floorMesh.rotation.x = -0.5 * Math.PI;
	floorMesh.receiveShadow = true;
	floorMesh.position.y = -2.5; 

	scene.add(floorMesh);
}

let step = 0;
let rotation;
const delta = 35;
let diff;

function render() 
{
	renderer.render(scene, camera);
	if (camera == c1) {
		trackballControls.update();
		if (options.dollyWireframe) {
			c2h.visible = true;
		}
	} else c2h.visible = false;

	var queen1 = scene.getObjectByName('queen1');

	step += 0.01;
	queen1.position.z = 27 * Math.cos(step);

	c3.lookAt(queen1.position);
	cameraObj.lookAt(queen1.position);

	if (Math.abs(queen1.position.z) - delta < c3.position.z) {
		diff = Math.sin((-Math.PI / (2 * delta)) * queen1.position.z);
		rotation = diff * Math.PI / 2 - Math.PI / 2
		c3.rotation.z = rotation;
		cameraObj.rotation.z = rotation + Math.PI;
	}

	requestAnimationFrame(render);
}

window.onload = main;