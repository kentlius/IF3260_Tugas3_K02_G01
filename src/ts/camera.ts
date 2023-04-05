import { Perspective, Transform, Vector2, Vector3 } from "./primitive.js";

export interface Renderable {
    render(transform: Transform, camera: Perspective, camera_position: Vector3): void;
}

export interface Renderer {
    render(renders: Iterable<Renderable>): void;
    transform: Transform;
}

export class PerspectiveCamera implements Renderer {
    readonly gl: WebGL2RenderingContext;
    readonly canvas: HTMLCanvasElement;

    transform: Transform;
    fov: number;
    near: number;
    far: number;

    constructor(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement, fov: number = Math.PI / 2, near: number = 0.05, far: number = 100) {
        this.gl = gl;
        this.canvas = canvas;

        this.transform = Transform.IDENTITY;
        this.fov = fov;
        this.near = near;
        this.far = far;
    }

    render(renders: Iterable<Renderable>) {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const aspect = width / height;

        this.gl.viewport(0, 0, width, height);
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const persp = Perspective
            .perspective(this.fov, aspect, this.near, this.far);
        const mview = this.transform.inverse().post_scale(new Vector3(1, 1, -1));

        for (let r of renders) {
            r.render(mview, persp, this.transform.origin);
        }

        this.gl.flush();
    }
}

export class OrthographicCamera implements Renderer {
    readonly gl: WebGL2RenderingContext;
    readonly canvas: HTMLCanvasElement;

    transform: Transform;
    size: number;
    near: number;
    far: number;

    constructor(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement, size: number = 20, near: number = 0, far: number = 100) {
        this.gl = gl;
        this.canvas = canvas;

        this.transform = Transform.IDENTITY;
        this.size = size;
        this.near = near;
        this.far = far;
    }

    render(renders: Iterable<Renderable>) {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const aspect = width / height;

        this.gl.viewport(0, 0, width, height);
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const top = this.size / 2;
        const bottom = -top;
        const right = top * aspect;
        const left = -right;

        const ortho = Perspective.orthogonal(top, bottom, left, right, this.near, this.far);
        const mview = this.transform.inverse().post_scale(new Vector3(1, 1, -1));

        for (let r of renders) {
            r.render(mview, ortho, this.transform.origin);
        }

        this.gl.flush();
    }
}
