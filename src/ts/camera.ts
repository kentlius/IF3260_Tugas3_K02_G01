import { Perspective, Quat, Transform, Vector2, Vector3 } from "./primitive.js";

export interface Renderable {
    render(transform: Transform, camera: Perspective, camera_position: Vector3): void;
}

export interface Renderer {
    render(renders: Iterable<Renderable>): void;
    get transform(): Transform;
}

abstract class CameraBase implements Renderer {
    readonly gl: WebGL2RenderingContext;
    readonly canvas: HTMLCanvasElement;
    translation: Vector3 = Vector3.ZERO;
    rotation: Quat = Quat.IDENTITY;
    scale: Vector3 = Vector3.ONE;

    constructor(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
        this.gl = gl;
        this.canvas = canvas;
    }

    get transform(): Transform {
        const { x, y, z } = this.rotation.to_transform();
        return new Transform(
            x.mul(this.scale),
            y.mul(this.scale),
            z.mul(this.scale),
            this.translation,
        );
    }

    set transform(v: Transform) {
        this.translation = v.position;
        this.rotation = v.rotation;
        this.scale = v.scale;
    }

    abstract render(renders: Iterable<Renderable>): void;

    protected setupGLContext(): number {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const aspect = width / height;

        this.gl.viewport(0, 0, width, height);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);
        this.gl.depthMask(true);

        this.gl.enable(this.gl.CULL_FACE);
        this.gl.frontFace(this.gl.CCW);
        this.gl.cullFace(this.gl.BACK);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);

        return aspect;
    }
}

export class PerspectiveCamera extends CameraBase {
    fov: number;
    near: number;
    far: number;

    constructor(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement, fov: number = Math.PI / 2, near: number = 0.05, far: number = 100) {
        super(gl, canvas);

        this.fov = fov;
        this.near = near;
        this.far = far;
    }

    render(renders: Iterable<Renderable>) {
        const aspect = this.setupGLContext();

        const persp = Perspective
            .perspective(this.fov, aspect, this.near, this.far)
            .mul(this.transform.inverse().post_scale(new Vector3(1, 1, -1)));

        for (let r of renders) {
            r.render(Transform.IDENTITY, persp, this.translation);
        }

        this.gl.flush();
    }
}

export class OrthographicCamera extends CameraBase {
    size: number;
    near: number;
    far: number;

    constructor(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement, size: number = 20, near: number = 0, far: number = 100) {
        super(gl, canvas);

        this.size = size;
        this.near = near;
        this.far = far;
    }

    render(renders: Iterable<Renderable>) {
        const aspect = this.setupGLContext();

        const top = this.size / 2;
        const bottom = -top;
        const right = top * aspect;
        const left = -right;

        const ortho = Perspective
            .orthogonal(top, bottom, left, right, this.near, this.far)
            .mul(this.transform.inverse().post_scale(new Vector3(1, 1, -1)));

        for (let r of renders) {
            r.render(Transform.IDENTITY, ortho, this.translation);
        }

        this.gl.flush();
    }
}
