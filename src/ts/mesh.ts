import { Renderable } from "./camera.js";
import { Node3D } from "./node_tree.js";
import { Perspective, Transform, Vector3 } from "./primitive.js";
import { HasShader } from "./shader.js";

export type MeshData = {
    vertex: ArrayLike<number>,
    normal: ArrayLike<number>,
    uv?: ArrayLike<number>,
    color?: ArrayLike<number>,
    joints?: ArrayLike<number>,
    weights?: ArrayLike<number>,
    tangent?: ArrayLike<number>,
    index?: ArrayLike<number>,
};

export class Mesh implements Renderable {
    private data_buffer: WebGLBuffer;
    private index_buffer?: WebGLBuffer;
    private vertex_count: number;
    private index_count?: number;

    private vertex_offset: number;
    private normal_offset: number;
    private uv_offset?: number;
    private color_offset?: number;
    private joints_offset?: number;
    private weights_offset?: number;
    private tangent_offset?: number;
    private bitangent_offset?: number;

    readonly gl: WebGL2RenderingContext;
    shader?: HasShader;

    constructor(
        gl: WebGL2RenderingContext,
        data: MeshData,
    ) {
        this.gl = gl;

        const {
            vertex,
            normal,
            uv,
            color,
            joints,
            weights,
            tangent,
            index,
        } = data;

        if ((vertex.length % 3) !== 0) {
            throw new Error("Vertex size is not multiple of 3");
        }
        this.vertex_count = (vertex.length / 3) | 0;

        if ((index !== undefined) && ((index.length % 3) !== 0)) {
            throw new Error("Index length is not multiple of 3");
        }

        if (normal.length !== vertex.length) {
            throw new Error("Normal array length mismatch");
        }
        if ((tangent !== undefined) && (tangent.length !== (this.vertex_count * 4))) {
            throw new Error("Tangent array length mismatch");
        }
        if ((uv !== undefined) && (uv.length !== (this.vertex_count * 2))) {
            throw new Error("UV array length mismatch");
        }
        if ((color !== undefined) && (color.length !== (this.vertex_count * 4))) {
            throw new Error("Color array length mismatch");
        }
        if ((joints !== undefined) && (joints.length !== (this.vertex_count * 4))) {
            throw new Error("Joint array length mismatch");
        }
        if ((weights !== undefined) && (weights.length !== (this.vertex_count * 4))) {
            throw new Error("Weight array length mismatch");
        }

        let n = 0;
        this.vertex_offset = 0;
        n += this.vertex_count * 12;
        this.normal_offset = n;
        n += this.vertex_count * 12;
        if (uv !== undefined) {
            this.uv_offset = n;
            n += this.vertex_count * 8;
        }
        if (color !== undefined) {
            this.color_offset = n;
            n += this.vertex_count * 4;
        }
        if (joints !== undefined) {
            this.joints_offset = n;
            n += this.vertex_count * 8;
        }
        if (weights !== undefined) {
            this.weights_offset = n;
            n += this.vertex_count * 16;
        }
        if (tangent !== undefined) {
            this.tangent_offset = n;
            n += this.vertex_count * 12;
            this.bitangent_offset = n;
            n += this.vertex_count;
            if ((n % 4) !== 0) {
                n += 4 - (n % 3);
            }
        }
        let buf = new ArrayBuffer(n);

        new Float32Array(buf, this.vertex_offset, this.vertex_count * 3).set(vertex);
        new Float32Array(buf, this.normal_offset, this.vertex_count * 3).set(normal);
        if (uv !== undefined) {
            new Float32Array(buf, this.uv_offset, this.vertex_count * 2).set(uv);
        }
        if (color !== undefined) {
            const a = new Uint8Array(buf, this.color_offset, this.vertex_count * 4);
            for (let i = 0; i < a.length; i++) {
                a[i] = Math.min(Math.max((color[i] * 255) | 0, 0), 255);
            }
        }
        if (joints !== undefined) {
            new Uint16Array(buf, this.joints_offset, this.vertex_count * 4).set(joints);
        }
        if (weights !== undefined) {
            new Float32Array(buf, this.weights_offset, this.vertex_count * 4).set(weights);
        }
        if (tangent !== undefined) {
            const a = new Float32Array(buf, this.tangent_offset, this.vertex_count * 3);
            for (let i = 0, j = 0; i < tangent.length; i += 4, j += 3) {
                a[j] = tangent[i];
                a[j + 1] = tangent[i + 1];
                a[j + 2] = tangent[i + 2];
            }
            const b = new Uint8Array(buf, this.bitangent_offset, this.vertex_count);
            for (let i = 0, j = 0; i < tangent.length; i += 4, j++) {
                b[j] = tangent[i] >= 0 ? 1 : 0;
            }
        }

        this.data_buffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.data_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, buf, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        if (index !== undefined) {
            this.index_count = index.length;
            buf = new ArrayBuffer(this.index_count * 2);
            new Uint16Array(buf).set(index);

            this.index_buffer = gl.createBuffer() as WebGLBuffer;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buf, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
    }

    render(transform: Transform, camera: Perspective, camera_position: Vector3): void {
        if (this.shader === undefined) {
            return;
        }
        const shader = this.shader.shader;

        shader.set_uniformv("modelMatrix", transform.to_matrix4x3());
        shader.set_uniformv("cameraMatrix", camera.to_matrix4x4());
        shader.set_uniform("cameraPosition", ...camera_position);
        shader.set_attrib_buffer("position", this.data_buffer, this.gl.FLOAT, false, 12, this.vertex_offset);
        shader.set_attrib_buffer("normal", this.data_buffer, this.gl.FLOAT, false, 12, this.normal_offset);
        if (this.uv_offset !== undefined) {
            shader.set_attrib_buffer("uv", this.data_buffer, this.gl.FLOAT, false, 8, this.uv_offset);
        } else {
            shader.set_attrib("uv", 0, 0);
        }
        if (this.color_offset !== undefined) {
            shader.set_attrib_buffer("color", this.data_buffer, this.gl.UNSIGNED_BYTE, true, 4, this.color_offset);
        } else {
            shader.set_attrib("color", 1, 1, 1, 1);
        }
        if (this.joints_offset !== undefined) {
            shader.set_attrib_buffer("joint", this.data_buffer, this.gl.UNSIGNED_SHORT, false, 8, this.joints_offset);
        } else {
            shader.set_attrib("joint", 0, 0, 0, 0);
        }
        if (this.weights_offset !== undefined) {
            shader.set_attrib_buffer("weight", this.data_buffer, this.gl.FLOAT, false, 16, this.weights_offset);
        } else {
            shader.set_attrib("weight", 0, 0, 0, 0);
        }
        if (this.tangent_offset !== undefined) {
            shader.set_attrib_buffer("tangent", this.data_buffer, this.gl.FLOAT, false, 12, this.tangent_offset);
        } else {
            shader.set_attrib("tangent", 0, 1, 0);
        }
        if (this.bitangent_offset !== undefined) {
            shader.set_attrib_buffer("bitangent", this.data_buffer, this.gl.UNSIGNED_BYTE, false, 1, this.bitangent_offset);
        } else {
            shader.set_attrib("bitangent", 0);
        }

        if (this.index_count === undefined) {
            shader.render(this.vertex_count);
        } else {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.index_buffer as WebGLBuffer);
            shader.render(this.index_count, true);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        }

        shader.resetGL();
    }
}

export class MeshInstance extends Node3D {
    meshes: Mesh[] = [];

    constructor(gl: WebGL2RenderingContext) {
        super(gl);
    }

    render(transform: Transform, camera: Perspective, camera_position: Vector3): void {
        const tr = transform.mul(this.transform);
        for (const mesh of this.meshes) {
            mesh.render(tr, camera, camera_position);
        }

        super.render(transform, camera, camera_position);
    }
}
