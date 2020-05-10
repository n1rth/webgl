var LoadGLTFModel = (function() {

    var manager = new THREE.LoadingManager();
    var mat;
    var scene;

    const cluster = [
        { path: 'models/flat1/',  cluster: 'flat1' }
    ];

    function loadToMyCluster({ path ,cluster}, scene) {
            var loader = new THREE.GLTFLoader();
				loader.load( `${path}${cluster}.glb`, gltf => {
                    gltf.scene.traverse(function (child) {
                        if (child.isMesh) {
                            child.receiveShadow = true;
                            child.castShadow = true;
							child.material.normalScale = new THREE.Vector2( 0.7, 0.7 );
							child.material.polygonOffset = true;
							child.material.polygonOffsetFactor = 1;
                            child.material.polygonOffsetUnits = 1;
					        //child.material.opacity = 0.35;
                            //child.material.transparent = true;
                            /*
                            var edgeHelper = new THREE.EdgesHelper( child, 0xffffff, 1000 );
                            edgeHelper.material.linewidth = 1;
                            edgeHelper.material.depthTest = false;
					        edgeHelper.material.opacity = 0.25;
                            edgeHelper.material.transparent = true;
							scene.add( child );
                            scene.add( edgeHelper );
                            */
                        }
                    });
                    scene.add(gltf.scene);
				} );
    };


    return {

        loadCluster: function(scene_){
            scene = scene_;
            cluster.forEach((cls) => loadToMyCluster(cls,scene));
        }

    }

});