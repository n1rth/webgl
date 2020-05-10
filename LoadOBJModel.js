var LoadOBJModel = (function() {

    var manager = new THREE.LoadingManager();
    var mat;
    var scene;

    var clusterNames = [
        'body', 'floor', 'roof',
        'box1', 'box2', 'box3', 
        'box4', 'box5', 'box6', 
        'box7','box8', 'box9', 
        'box10', 'box11', 'box12', 
        'box13', 'box14','tube1', 
        'tube2', 'tube3', 'tube4', 'tube5'
    ];

    const cluster = [
        { path: 'models/body/',  cluster: clusterNames[0] },
        { path: 'models/body/',  cluster: clusterNames[1] },
        { path: 'models/body/',  cluster: clusterNames[2] },
        { path: 'models/boxes/',  cluster: clusterNames[3] },
        { path: 'models/boxes/',  cluster: clusterNames[4] },
        { path: 'models/boxes/',  cluster: clusterNames[5] },
        { path: 'models/boxes/',  cluster: clusterNames[6] },
        { path: 'models/boxes/',  cluster: clusterNames[7] },
        { path: 'models/boxes/',  cluster: clusterNames[8] },
        { path: 'models/boxes/',  cluster: clusterNames[9] },
        { path: 'models/boxes/',  cluster: clusterNames[10] },
        { path: 'models/boxes/',  cluster: clusterNames[11] },
        { path: 'models/boxes/',  cluster: clusterNames[12] },
        { path: 'models/boxes/',  cluster: clusterNames[13] },
        { path: 'models/boxes/',  cluster: clusterNames[14] },
        { path: 'models/boxes/',  cluster: clusterNames[15] },
        { path: 'models/boxes/',  cluster: clusterNames[16] },
        { path: 'models/tubes/',  cluster: clusterNames[17] },
        { path: 'models/tubes/',  cluster: clusterNames[18] },
        { path: 'models/tubes/',  cluster: clusterNames[19] },
        { path: 'models/tubes/',  cluster: clusterNames[20] },
        { path: 'models/tubes/',  cluster: clusterNames[21] },
    ];

    function loadToMyCluster({ path ,cluster}, scene) {
        var onProgress = function ( xhr ) {
    
            if ( xhr.lengthComputable ) {
        
                var percentComplete = xhr.loaded / xhr.total * 100;
                console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
        
            }
            };
        
            var onError = function () { };

            THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
            new THREE.MTLLoader( manager )
            .setPath( `${path}` )
            .load( `${cluster}.mtl`, function ( materials) {
        
                materials.preload();
                new THREE.OBJLoader( manager )
                    .setMaterials( materials )
                    .setPath( `${path}` )
                    .load( `${cluster}.obj`, function ( object) {
                        for ( var i = 0, l = object.children.length; i < l; i ++ ) {
                            var obj = object.children[ i ];
                            obj.geometry.doubleSided = true;                            
                            obj.position.sub((new THREE.Box3()).setFromObject(obj).getCenter());///позиция каждого объекта по центру
                            //var geo = new THREE.EdgesGeometry(object.children[0].geometry, 0);
                            //var mat = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 1});
                            var opa = 0.8;
                            if (cluster == 'roof'){
                                opa = 0.2;
                                }
                            mat = new THREE.MeshStandardMaterial( {
                                opacity: opa,
                                transparent: true
                            } );
                            var mesh = new THREE.Mesh( obj.geometry, mat );
                            if (cluster != 'floor'){
                                mesh.name = "object";
                                }
                                scene.add( mesh );
                            }
    
                        //object.name = "object";
                        //scene.add(object);
                        //objList.push(object);
                }, onProgress, onError );
        
            } );
    };


    return {

        loadCluster: function(scene_){
            scene = scene_;
            cluster.forEach((cls) => loadToMyCluster(cls,scene));
        }

    }

});