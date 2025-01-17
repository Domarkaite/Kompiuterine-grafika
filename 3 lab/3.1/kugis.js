$(function () {

	var scene = new THREE.Scene();
	var renderer = createRenderer();
	var camera = addCamera();
    var R1 = 20;
    var R2 = 10;
    var H = 30;
    var dots = 10000;
	var cone;
	var spGroup;
	let meshes = [];
	var settings = {
        "Tasku kiekis": 2000,
      };
	var gui = new dat.GUI();
	gui.add(settings, 'Tasku kiekis', 2000, 10000).step(1).onChange((value) => {
		dots = value; 
		scene.remove(cone); 
		createCone(); 
	});
    camera.lookAt(scene.position);
    dots = settings["Tasku kiekis"];
    createCone();

	scene.add(addAmbientLight());
	scene.add(addSpotLight());
	$("#WebGL-output").append(renderer.domElement);
	var cameraControls = new THREE.TrackballControls(camera, renderer.domElement);
	render();
	
	function render() {
		renderer.render(scene, camera);
		requestAnimationFrame(render);
		cameraControls.update();	
	}
	function createRenderer()
	{
		var renderer = new THREE.WebGLRenderer();
		renderer.setClearColor(0xEEEEEE);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.shadowMapEnabled = true;
		return renderer;
    }
    
	function addSpotLight()
	{
		var spotLight = new THREE.SpotLight( 0xffffff );
		spotLight.position.set( -40, 60, -10 );
		spotLight.castShadow = true;
		return spotLight;
	}

	function addAmbientLight()
	{
		var ambiColor = "#0C0C0C";
		var ambientLight = new THREE.AmbientLight(ambiColor);
		return ambientLight;
	}
	function addCamera()
	{
		var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.x = 50;
		camera.position.y = 50;
		camera.position.z = 60;
		return camera;
	}

    function createCone() {
		if (cone) {
			cleanupObject(cone);
			cone = null;
		}
		if (spGroup) {
			cleanupObject(spGroup);
			spGroup = null;
		}
	
		meshes.forEach((mesh) => cleanupObject(mesh));
		meshes = []; 
	
		let count = 0;
		var points = []; 
	
		spGroup = new THREE.Object3D();
		cone = new THREE.Object3D();
		const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: false });

		while (dots > count)
		{
			const randomNumbers = generateRandomNumbers(R1, R1, H);
			let m = (Math.pow(R1 - R2, 2)) / (Math.pow(H, 2));
			let d = ((H / 2) * (R1 + R2)) / (R1 - R2);
			
			let iq = Math.pow(randomNumbers.x, 2) - (m * Math.pow((randomNumbers.y - d), 2)) + Math.pow(randomNumbers.z, 2);

			if (iq <= 0)
			{
				count++;
				points.push(new THREE.Vector3(randomNumbers.x, randomNumbers.y, randomNumbers.z));
				var spGeom = new THREE.SphereGeometry(0.1);
				const spMesh = new THREE.Mesh(spGeom, pointMaterial);
				spMesh.position.set(randomNumbers.x, randomNumbers.y, randomNumbers.z);
        		spGroup.add(spMesh);
			}

		}

		scene.add(spGroup);
		const hullGeometry = new THREE.ConvexGeometry(points);

    const twoPI = 2 * Math.PI;
    hullGeometry.faces.forEach((val, index) => {
      var uvPoints = [];
      var verticeX = hullGeometry.vertices[val.a];
      var verticeY = hullGeometry.vertices[val.b];
      var verticeZ = hullGeometry.vertices[val.c];

      var u1 = 0.5 +((Math.atan2(verticeX.x, verticeX.z)) / twoPI);
      var v1 = 0.5 + (verticeX.y / H);

      var u2 = 0.5 + ((Math.atan2(verticeY.x, verticeY.z)) / twoPI);
      var v2 = 0.5 + (verticeY.y / H);

      var u3 = 0.5+ ((Math.atan2(verticeZ.x, verticeZ.z)) / twoPI);
      var v3 = 0.5 + (verticeZ.y / H);
      var dif = 0.5;
      if (Math.abs(u1 - u2) > dif || Math.abs(u2 - u2) > dif || Math.abs(u3 - u1) > dif)
        {
          if (u1 > dif) 
          {
            u1 = u1 - 1;
          }
          if (u2 > dif)
          {
            u2 = u2 - 1;
          }
          if (u3 > dif)
          {
            u3 = u3 - 1;
          }
        }	

      uvPoints.push(new THREE.Vector2(u1, v1));
      uvPoints.push(new THREE.Vector2(u2, v2));
      uvPoints.push(new THREE.Vector2(u3, v3));
      hullGeometry.faceVertexUvs[0][index] = uvPoints;
    });

    hullGeometry.uvsNeedUpdate = true;

	mesh = createMesh(hullGeometry);
	cone.add(mesh);
	scene.add(cone);
	points = [];
    }


    function createMesh(geom) {
		const textureLoader = new THREE.TextureLoader();
		textureLoader.load("checkers.png", (texture) => {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set(5, 2);
	
			const meshMaterial = new THREE.MeshBasicMaterial({ map: texture });
			meshMaterial.side = THREE.DoubleSide;
	
			const wireFrameMat = new THREE.MeshBasicMaterial({ color: 0x228B22 });
			wireFrameMat.wireframe = true;
	
			const mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [meshMaterial, wireFrameMat]);
	
			cone.add(mesh);
		});
	}
	
    
	
	function generateRandomNumbers(maxX, maxZ, maxY) {
		const randomX = (Math.random() * 2 - 1) * maxX;
		const randomY = (Math.random() - 0.5) * maxY;
		const randomZ = (Math.random() * 2 - 1) * maxZ; 
	
		return {
			x: randomX,
			y: randomY,
			z: randomZ
		};
	}

	function cleanupObject(obj) {
		if (!obj) return;
	
		while (obj.children.length > 0) {
			const child = obj.children[0];
			cleanupObject(child);
			obj.remove(child);
		}
	
		if (obj.geometry) {
			obj.geometry.dispose();
		}
	
		if (obj.material) {
			if (Array.isArray(obj.material)) {
				obj.material.forEach((material) => {
					disposeMaterial(material);
				});
			} else {
				disposeMaterial(obj.material);
			}
		}
		scene.remove(obj);
	}
	
	function disposeMaterial(material) {
		material.dispose();
		for (const key in material) {
			if (material[key] && material[key].isTexture) {

				material[key].dispose();
			}
		}
	}
	
});