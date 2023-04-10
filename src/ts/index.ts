import { PerspectiveCamera, Renderable } from "./camera.js";
import { processKey } from "./controller.js";
import { loadGlb } from "./load_gltf.js";
import { Node3D } from "./node_tree.js";
import { Transform, Vector3 } from "./primitive.js";
import { ShaderRegistry } from "./shader.js";

async function main(): Promise<void> {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    const gl = canvas.getContext("webgl2");
    if (gl == null) {
        throw new Error("WebGL is not supported!");
    }

    const registry = new ShaderRegistry(gl);

    let objects: Node3D[] = [];
    const camera = new PerspectiveCamera(gl, canvas);

    loadGlb(gl, "model/RobotArmPacked.glb", await registry.make_shader("shader/vertex.vert", "shader/fragmentLambert.frag")).then((v) => {
        objects = v;
    });

    const frametime = 1 / 60;
    let lag = 0;
    let prev = 0;

    function process(now: number): void {
        now *= 0.001;
        const delta = now - prev;
        const deltaLag = now - lag;
        if (deltaLag < frametime * 0.9) {
            window.setTimeout(() => window.requestAnimationFrame(process), (frametime - deltaLag) * 1000);
            return;
        }
        prev = now;

        processKey(delta, camera);
        camera.render(objects);

        if (deltaLag < frametime * 2) {
            lag += frametime;
            window.setTimeout(() => window.requestAnimationFrame(process), (frametime * 2 - deltaLag) * 1000);
            return;
        } else if (deltaLag < frametime * 3) {
            lag += frametime;
        } else {
            lag = now;
        }
        window.requestAnimationFrame(process);
    }

    window.requestAnimationFrame(process);
}

main();
