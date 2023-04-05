import { Renderable } from "./camera";
import { Node3D } from "./node_tree";
import { Perspective, Transform, Vector3 } from "./primitive";
import { HasShader } from "./shader.js";

export class Mesh implements Renderable {
    private data_buffer: WebGLBuffer;
    private index_buffer?: WebGLBuffer;
    private vertex_count: number;
    private index_count?: number;

    private vertex_offset: number;
    private normal_offset: number;
    private tangent_offset: number;
    private bitangent_offset: number;

    readonly gl: WebGL2RenderingContext;
    shader?: HasShader;

    constructor(
        gl: WebGL2RenderingContext,
        vertex: number[],
        normal: number[],
        tangent: number[],
        index?: number[],
    ) {
        this.gl = gl;

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
        if ((tangent.length / 4) !== this.vertex_count) {
            throw new Error("Tangent array length mismatch");
        }

        this.vertex_offset = 0;
        this.normal_offset = this.vertex_offset + this.vertex_count * 12;
        this.tangent_offset = this.normal_offset + this.vertex_count * 12;
        this.bitangent_offset = this.tangent_offset + this.vertex_count * 12;
        let buf = new ArrayBuffer(this.bitangent_offset + this.vertex_count);

        {
            const a = new Float32Array(buf, this.vertex_offset, this.vertex_count * 3);
            a.set(vertex);
        }
        {
            const a = new Float32Array(buf, this.normal_offset, this.vertex_count * 3);
            a.set(normal);
        }
        {
            const a = new Float32Array(buf, this.tangent_offset, this.vertex_count * 3);
            for (let i = 0, j = 0; i < tangent.length; i += 4, j += 3) {
                a.set(tangent.slice(i, i + 3), j);
            }
        }
        {
            const a = new Uint8Array(buf, this.bitangent_offset, this.vertex_count);
            for (let i = 0, j = 0; i < tangent.length; i += 4, j++) {
                a[j] = tangent[i] ? 1 : 0;
            }
        }

        this.data_buffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.data_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, buf, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        if (index !== undefined) {
            this.index_count = index.length;
            buf = new ArrayBuffer(this.index_count * 2);
            {
                const a = new Uint16Array(buf);
                a.set(index);
            }

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

        shader.set_uniformv("model_matrix", transform.to_matrix4x3());
        shader.set_uniformv("camera_matrix", camera.to_matrix4x4());
        shader.set_attrib_buffer("position", this.data_buffer, this.gl.FLOAT, false, 12, this.vertex_offset);
        shader.set_attrib_buffer("normal", this.data_buffer, this.gl.FLOAT, false, 12, this.normal_offset);
        shader.set_attrib_buffer("tangent", this.data_buffer, this.gl.FLOAT, false, 12, this.tangent_offset);
        shader.set_attrib_buffer("bitangent", this.data_buffer, this.gl.BYTE, false, 1, this.bitangent_offset);

        if (this.index_count === undefined) {
            shader.render(this.vertex_count);
        } else {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.index_buffer as WebGLBuffer);
            shader.render(this.index_count, true);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        }
    }
}

export class MeshInstance extends Node3D {
    meshes: Mesh[];

    constructor(gl: WebGL2RenderingContext) {
        super(gl);

        this.meshes = [];
    }

    render(transform: Transform, camera: Perspective, camera_position: Vector3): void {
        for (const mesh of this.meshes) {
            mesh.render(transform, camera, camera_position);
        }

        super.render(transform, camera, camera_position);
    }
}
