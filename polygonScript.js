let world, observer, visualizer, base, points = [], activePolygon, floatingPolygon = null;
let gridHelper;

initialize();
render();

function initialize() {
    // Set up world and observer
    world = new THREE.Scene();
    observer = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    observer.position.z = 10;

    // Set up visualizer
    visualizer = new THREE.WebGLRenderer({ antialias: true });
    visualizer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(visualizer.domElement);

    // Base with grid
    gridHelper = new THREE.GridHelper(10, 10);
    world.add(gridHelper);

    const baseGeometry = new THREE.PlaneGeometry(10, 10);
    const baseMaterial = new THREE.MeshBasicMaterial({ color: 0xf0f0f0, side: THREE.DoubleSide });
    base = new THREE.Mesh(baseGeometry, baseMaterial);
    world.add(base);

    // Event listeners
    window.addEventListener('resize', handleResize, false);
    window.addEventListener('click', handleMouseClick, false);

    document.getElementById('finalizeBtn').addEventListener('click', finalizePolygon);
    document.getElementById('cloneBtn').addEventListener('click', clonePolygon);
    document.getElementById('clearBtn').addEventListener('click', clearWorld);
}

function render() {
    requestAnimationFrame(render);
    visualizer.render(world, observer);
}

function handleResize() {
    observer.aspect = window.innerWidth / window.innerHeight;
    observer.updateProjectionMatrix();
    visualizer.setSize(window.innerWidth, window.innerHeight);
}

function handleMouseClick(event) {
    const cursor = new THREE.Vector2();
    cursor.x = (event.clientX / window.innerWidth) * 2 - 1;
    cursor.y = - (event.clientY / window.innerHeight) * 2 + 1;

    const pointer = new THREE.Raycaster();
    pointer.setFromCamera(cursor, observer);
    const hits = pointer.intersectObject(base);

    if (hits.length > 0) {
        const location = hits[0].point;
        points.push(new THREE.Vector3(location.x, location.y, 0));
        createVertexMarker(location.x, location.y);
    }
}

function createVertexMarker(x, y) {
    const markerGeometry = new THREE.CircleGeometry(0.1, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(x, y, 0);
    world.add(marker);
}

function finalizePolygon() {
    if (points.length > 2) {
        const shape = new THREE.Shape(points);
        const polygonGeometry = new THREE.ShapeGeometry(shape);
        const polygonMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
        activePolygon = new THREE.Mesh(polygonGeometry, polygonMaterial);
        world.add(activePolygon);

        points = []; // Reset for the next polygon
    }
}

function clonePolygon() {
    if (activePolygon) {
        const cloneGeometry = activePolygon.geometry.clone();
        const cloneMaterial = activePolygon.material.clone();
        floatingPolygon = new THREE.Mesh(cloneGeometry, cloneMaterial);

        const cursor = new THREE.Vector2();
        window.addEventListener('mousemove', movePolygon);
        window.addEventListener('click', placePolygon);
    }
}

function movePolygon(event) {
    if (floatingPolygon) {
        const cursor = new THREE.Vector2();
        cursor.x = (event.clientX / window.innerWidth) * 2 - 1;
        cursor.y = - (event.clientY / window.innerHeight) * 2 + 1;

        const pointer = new THREE.Raycaster();
        pointer.setFromCamera(cursor, observer);
        const hits = pointer.intersectObject(base);

        if (hits.length > 0) {
            const location = hits[0].point;
            floatingPolygon.position.set(location.x, location.y, 0);
        }
    }
}

function placePolygon() {
    if (floatingPolygon) {
        world.add(floatingPolygon);
        floatingPolygon = null;
        window.removeEventListener('mousemove', movePolygon);
        window.removeEventListener('click', placePolygon);
    }
}

function clearWorld() {
    while (world.children.length > 0) { 
        world.remove(world.children[0]); 
    }
    world.add(gridHelper);
    world.add(base);
    points = [];
    activePolygon = null;
    floatingPolygon = null;
}
