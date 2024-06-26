import ThreeGlobe from "three-globe";
import { WebGLRenderer, Scene } from "three";
import {
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Color,
  Fog,
  AxesHelper,
  DirectionalLightHelper,
  CameraHelper,
  PointLight,
  SphereGeometry,
} from "three";
import { OrbitControls } from "orbital";
import countries from "./files/globe-data-min.json" assert { type: "json" };
import travelHistory from "./files/my-flights.json" assert { type: "json" };
import airportHistory from "./files/my-airports.json" assert { type: "json" };

var renderer, camera, scene, controls;
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
var Globe;

init();
initGlobe();
onWindowResize();
animate();

// SECTION Initializing core ThreeJS elements
function init() {
  // Initialize renderer
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement);

  // Initialize scene, light
  scene = new Scene();
  scene.add(new AmbientLight("#cae9ff", 0.6));
  scene.background = new Color("#fff");

  // Initialize camera, light
  camera = new PerspectiveCamera();
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  var dLight = new DirectionalLight("#ffffff", 0.4);
  dLight.position.set(-800, 2000, 400);
  // camera.add(dLight);

  var dLight1 = new DirectionalLight("#faf3dd", 1);
  dLight1.position.set(-200, 500, 200);
  // camera.add(dLight1);

  var dLight2 = new PointLight("#faf3dd", 0.7);
  dLight2.position.set(-200, 100, 100);
  camera.add(dLight2);

  var dLight3 = new DirectionalLight("#ffffff", 0.6);
  dLight3.position.set(-0, 2000, 0);
  camera.add(dLight3);

  camera.position.z = 400;
  camera.position.x = 0;
  camera.position.y = 0;

  scene.add(camera);

  // Additional effects
  scene.fog = new Fog("#00A651", 400, 2000);

  // Helpers
  // const axesHelper = new AxesHelper(800);
  // scene.add(axesHelper);
  // var helper = new DirectionalLightHelper(dLight);
  // scene.add(helper);
  // var helperCamera = new CameraHelper(dLight.shadow.camera);
  // scene.add(helperCamera);

  // Initialize controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dynamicDampingFactor = 0.01;
  controls.enablePan = false;
  controls.minDistance = 200;
  controls.maxDistance = 500;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 1;
  controls.autoRotate = false;

  controls.minPolarAngle = Math.PI / 3.5;
  controls.maxPolarAngle = Math.PI - Math.PI / 3;

  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", onMouseMove);
}

// SECTION Globe
function initGlobe() {
  // Initialize the Globe
  Globe = new ThreeGlobe({
    waitForGlobeReady: true,
    animateIn: true,
  })
    .hexPolygonsData(countries.features)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.7)
    .showAtmosphere(true)
    .atmosphereColor("#004251")
    .atmosphereAltitude(0.25)
    .hexPolygonColor((e) => {
      if (
        ["LOS", "ABV", "THA", "RUS", "UZB", "IDN", "KAZ", "MYS"].includes(
          e.properties.ISO_A3
        )
      ) {
        return "#00A651";
      } else return "#00A651";
    });
  const arr = ["#8ecae6", "#219ebc"];
  // NOTE Arc animations are followed after the globe enters the scene
  setTimeout(() => {
    Globe.arcsData(
      travelHistory.flights.map((a) => ({
        ...a,
        color: arr[Math.round(Math.random() * 3) % 3],
      }))
    )
      .arcColor((e, i) => {
        let c = arr[Math.round(Math.random() * 3) % 2];
        console.log({ c });
        return c;
      })
      .arcAltitude((e) => {
        return e.arcAlt;
      })
      .arcStroke((e) => {
        return e.status ? 0.5 : 0.3;
      })
      .arcDashLength(0.9)
      .arcDashGap(4)
      .arcDashAnimateTime(1400)
      .arcsTransitionDuration(2000)
      .arcDashInitialGap((e) => e.order * 1)
      .pointsData(airportHistory.airports)
      .pointColor(() => "#219ebc")
      .pointsMerge(true)
      .pointAltitude(0.02)
      .pointRadius(0.1);
  }, 1000);

  // Globe.rotateY(-Math.PI * (5 / 9));
  // Globe.rotateZ(-Math.PI / 6);
  const globeMaterial = Globe.globeMaterial();
  globeMaterial.color = new Color("#fff");
  globeMaterial.emissive = new Color("#00A651");
  globeMaterial.emissiveIntensity = 0.1;
  globeMaterial.shininess = 0.5;

  // NOTE Cool stuff
  // globeMaterial.wireframe = true;

  scene.add(Globe);
}

function onMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
  // console.log("x: " + mouseX + " y: " + mouseY);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  windowHalfX = window.innerWidth / 1.5;
  windowHalfY = window.innerHeight / 1.5;
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  camera.position.x +=
    Math.abs(mouseX) <= windowHalfX / 2
      ? (mouseX / 2 - camera.position.x) * 0.005
      : 0;
  camera.position.y += (-mouseY / 2 - camera.position.y) * 0.005;
  camera.lookAt(scene.position);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
