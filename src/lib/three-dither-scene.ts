import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface DitherSceneOptions {
  canvas: HTMLCanvasElement;
  modelPath: string;
  steps?: number;
  scale?: number;
  speed?: number;
  useOriginalColor?: boolean; // keep color from model
}

export class DitherScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private material: THREE.ShaderMaterial;
  private clock = new THREE.Clock();
  private model?: THREE.Object3D;

  constructor(private opts: DitherSceneOptions) {
    const { canvas } = opts;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    const { clientWidth, clientHeight } = canvas;
    this.renderer.setSize(clientWidth, clientHeight);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.z = 2;

    this.material = this.createShaderMaterial();

    const observer = new ResizeObserver(() => this.handleResize());
    observer.observe(canvas.parentElement!); 
  }

  private createShaderMaterial(): THREE.ShaderMaterial {
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vColor;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        #ifdef USE_COLOR
          vColor = color;
        #else
          vColor = vec3(1.0);
        #endif
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float time;
      uniform float steps;
      uniform float scale;
      uniform float speed;
      uniform float contrast;
      uniform float brightness;
      uniform float useOriginalColor;

      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vColor;

      float bayer(vec2 p) {
        int x = int(mod(p.x, 4.0));
        int y = int(mod(p.y, 4.0));
        int i = x + y * 4;
        float m[16];
        m[0]=0.0;m[1]=8.0;m[2]=2.0;m[3]=10.0;
        m[4]=12.0;m[5]=4.0;m[6]=14.0;m[7]=6.0;
        m[8]=3.0;m[9]=11.0;m[10]=1.0;m[11]=9.0;
        m[12]=15.0;m[13]=7.0;m[14]=13.0;m[15]=5.0;
        return m[i]/16.0;
      }

      void main() {
        float shade = abs(vNormal.z);
        float brightnessAdj = pow(clamp(shade * brightness, 0.0, 1.0), contrast);

        vec2 grid = floor(vPosition.xy * scale);
        float threshold = bayer(grid);
        float d = step(threshold, brightnessAdj);

        vec3 baseColor = vColor;
        if (useOriginalColor > 0.5) {
          baseColor *= d;
        } else {
          baseColor = vec3(d);
        }

        gl_FragColor = vec4(baseColor, 1.0);
      }
    `;

    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      vertexColors: true,
      uniforms: {
        time: { value: 0 },
        steps: { value: this.opts.steps ?? 2 },
        scale: { value: this.opts.scale ?? 0.05 },
        speed: { value: this.opts.speed ?? 0.0 },
        contrast: { value: 1.2 },
        brightness: { value: 1.0 },
        useOriginalColor: { value: this.opts.useOriginalColor ? 1 : 0 },
      },
    });
  }

  async loadModel() {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(this.opts.modelPath);
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = this.material;
        mesh.material.vertexColors = true;
        mesh.material.needsUpdate = true;
      }
    });
    this.model = gltf.scene;
    this.scene.add(gltf.scene);
  }

  private handleResize = () => {
    const { clientWidth, clientHeight } = this.renderer.domElement;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
  };

  start() {
    const loop = () => {
      requestAnimationFrame(loop);
      const elapsed = this.clock.getElapsedTime();
      this.material.uniforms.time.value = elapsed;
      if (this.model) this.model.rotation.y += 0.005;
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }
}
