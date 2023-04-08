import { Mesh, MeshInstance } from "./mesh.js";
import { Node3D } from "./node_tree.js";
import { Quat, Transform, Vector3 } from "./primitive.js";
import { HasShader, Shader } from "./shader.js";

export async function loadGlb(gl: WebGL2RenderingContext, url: RequestInfo | URL, shader: HasShader): Promise<Node3D[]> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Response error (code ${response.status} ${response.statusText})`);
    }
    const body = response.body;
    if (body === null) {
        throw new Error("Response has no body");
    }
    return await loadGlbStream(gl, body, shader);
}

const bufSize = 1024;

async function loadGlbStream(gl: WebGL2RenderingContext, stream: ReadableStream<Uint8Array>, shader: HasShader): Promise<Node3D[]> {
    let getNextData: (bytes: number) => Promise<{ value: Uint8Array, done: boolean }>;
    {
        const reader = stream.getReader();
        let buf = new Uint8Array(0);
        let start = 0;
        let promise: Promise<ReadableStreamReadResult<Uint8Array>> | null = reader.read();
        let lock: Promise<void> | null = null;

        getNextData = async (bytes: number): Promise<{ value: Uint8Array, done: boolean }> => {
            if ((promise === null) && (start === buf.length)) {
                return {
                    value: new Uint8Array(0),
                    done: true,
                };
            }
            if (bytes <= 0) {
                return {
                    value: new Uint8Array(0),
                    done: false,
                };
            }

            while (lock !== null) {
                await lock;
            }
            let resolver: undefined | (() => void);
            lock = new Promise((resolve, reject) => {
                resolver = resolve;
            });

            try {
                const ret = new Uint8Array(bytes);
                let offset = 0;
                while (bytes > 0) {
                    if (start === buf.length) {
                        if (promise === null) {
                            return {
                                value: ret.slice(0, offset),
                                done: true,
                            };
                        }
                        const { value, done } = await promise;
                        promise = done ? null : reader.read();
                        buf = value ?? new Uint8Array(0);
                        start = 0;
                    }

                    if ((buf.length - start) >= bytes) {
                        ret.set(buf.subarray(start, start + bytes), offset);
                        start += offset;
                        bytes = 0;
                    } else {
                        const b = buf.subarray(start);
                        ret.set(b, offset);
                        start += b.length;
                        bytes -= b.length;
                    }
                }

                return {
                    value: ret,
                    done: false,
                };
            } finally {
                if (resolver !== undefined) {
                    resolver();
                    lock = null;
                }
            }
        };
    }

    function parseU32(arr: ArrayLike<number>): number {
        return arr[0] | (arr[1] << 8) | (arr[2] << 16) | (arr[3] << 24);
    }

    {
        let { value, done } = await getNextData(4);
        if (done || (parseU32(value) != 0x46546C67))
            throw new Error('Invalid magic');
        ({ value, done } = await getNextData(4));
        if (done || (parseU32(value) != 2))
            throw new Error('Invalid version ' + parseU32(value));
        await getNextData(4); // File length
    }

    const readChunk = async (): Promise<[number, Uint8Array]> => {
        let { value, done } = await getNextData(4);
        if (done)
            throw new Error('File truncated');
        const length = parseU32(value);
        ({ value, done } = await getNextData(4));
        if (done)
            throw new Error('File truncated');
        const type = parseU32(value);
        ({ value, done } = await getNextData(length));
        if (done)
            throw new Error('File truncated (expected ' + length + ', got ' + (value ?? []).length + ')');
        return [type, value];
    };

    // Chunk 0 (JSON)
    let [type, data] = await readChunk();
    if (type !== 0x4E4F534A)
        throw new Error('Unexpected chunk type ' + type);
    let gltfData = JSON.parse((new TextDecoder("utf-8")).decode(data)) as GltfData;

    // Chunk 1 (BIN)
    if (!(await getNextData(0)).done) {
        let [type, buf] = await readChunk();
        if (type !== 0x004E4942)
            throw new Error('Unexpected chunk type ' + type);
        return await processGltf(gl, gltfData, shader, buf);
    } else
        return await processGltf(gl, gltfData, shader);
}

export type TextureInfo = {
    index: number,
    texCoord?: number,
};

export type GltfData = {
    buffers?: Array<{
        uri?: string,
        byteLength: number,
        name?: string,
    }>,
    bufferViews?: Array<{
        buffer: number,
        byteLength: number,
        byteOffset?: number,
        byteStride?: number,
        name?: string,
    }>,
    accessors?: Array<{
        type: string,
        componentType: number,
        count: number,
        bufferView?: number,
        byteOffset?: number,
        normalized?: boolean,
        sparse?: boolean,
        name?: string,
    }>,
    images?: Array<{
        uri?: string,
        mimeType?: string,
        bufferView?: number,
        name?: string,
    }>,
    textures?: Array<{
        sampler?: number,
        source?: number,
        name?: string,
    }>,
    samplers?: Array<{
        magFilter?: number,
        minFilter?: number,
        wrapS?: number,
        wrapT?: number,
    }>,
    materials?: Array<{
        pbrMetallicRoughness?: {
            baseColorFactor?: [number, number, number, number],
            baseColorTexture?: TextureInfo,
            metallicFactor?: number,
            roughnessFactor?: number,
            metallicRoughnessTexture?: TextureInfo,
        },
        normalTexture?: TextureInfo & {
            scale?: number,
        },
        alphaMode?: string,
        alphaCutoff?: number,
        doubleSided?: boolean,
        name?: string,
    }>,
    meshes?: Array<{
        primitives: Array<{
            attributes: {
                [key: string]: number | undefined,
            },
            indices?: number,
            material?: number,
        }>,
        name?: string,
    }>,
    nodes?: Array<{
        children?: number[],
        matrix?: number[],
        translation?: number[],
        rotation?: number[],
        scale?: number[],
        mesh?: number,
        skin?: number,
        name?: string,
    }>,
    scenes?: Array<{
        nodes?: number[],
        name?: string,
    }>,
    scene?: number,
};

class CachedArray<T, U> {
    private readonly f: (v: U, i: number) => Promise<T> | T;
    private readonly a: Array<Promise<T> | T>;
    private readonly a_: ArrayLike<U>;

    constructor(a: ArrayLike<U>, f: (v: U, i: number) => Promise<T> | T) {
        this.a_ = a;
        this.f = f;
        this.a = [];
    }

    ["get"](ix: number): Promise<T> | T | undefined {
        let v = this.a[ix];
        if (v === undefined) {
            const t = this.a_[ix];
            if (t !== undefined) {
                this.a[ix] = v = this.f(t, ix);
            }
        }
        return v;
    }
}

async function processGltf(gl: WebGL2RenderingContext, data: GltfData, shader: HasShader, buf?: Uint8Array): Promise<Node3D[]> {
    const buffers = data.buffers === undefined ? (buf === undefined ? undefined : new CachedArray([buf], (v) => v)) : new CachedArray(
        data.buffers,
        async ({ uri, byteLength, name }, i) => {
            const ret = new Uint8Array(byteLength);

            if (uri !== undefined) {
                const res = await fetch(uri);
                if (!res.ok) {
                    throw new Error(`Response error (code ${res.status} ${res.statusText})`);
                }
                const body = res.body;
                if (body === null) {
                    throw new Error("Response has no body");
                }

                const reader = body.getReader();
                let c = 0;
                while (c < byteLength) {
                    let { value } = await reader.read();
                    if (value === undefined) {
                        throw new Error(`Buffer ${name ?? i} truncated (expected ${byteLength}, got ${c})`);
                    }
                    ret.set(value, c);
                    c += value.length;
                }
            } else {
                console.warn(`Buffer ${i} has no data`);
            }

            return ret;
        }
    );

    const bufferViews = data.bufferViews === undefined ? undefined : new CachedArray(
        data.bufferViews,
        async ({
            buffer,
            byteLength,
            byteOffset,
            byteStride,
        }) => {
            return {
                buffer: await buffers?.get(buffer),
                byteLength: byteLength,
                byteOffset: byteOffset ?? 0,
                byteStride: byteStride ?? 0,
            }
        }
    );

    const accessors = data.accessors === undefined ? undefined : new CachedArray(
        data.accessors,
        async ({
            type,
            componentType,
            count,
            bufferView,
            byteOffset,
            normalized,
            sparse,
        }) => {
            let ret: TypedArray;

            let n: number;
            switch (type) {
                case "SCALAR":
                    n = 1;
                    break;

                case "VEC2":
                    n = 2;
                    break;

                case "VEC3":
                    n = 3;
                    break;

                case "VEC4":
                    n = 4;
                    break;

                case "MAT2":
                    n = 4;
                    break;

                case "MAT3":
                    n = 9;
                    break;

                case "MAT4":
                    n = 16;
                    break;

                default:
                    throw new Error(`Unknown type ${type}`);
            }

            let f: (data: DataView, i: number) => number = (i) => 0;
            let sz: number;
            switch (componentType) {
                case gl.BYTE:
                    sz = 1;
                    f = (data, i) => data.getInt8(i);
                    ret = new Int8Array(count * n);
                    break;

                case gl.UNSIGNED_BYTE:
                    sz = 1;
                    f = (data, i) => data.getUint8(i);
                    ret = new Uint8Array(count * n);
                    break;

                case gl.SHORT:
                    sz = 2;
                    f = (data, i) => data.getInt16(i);
                    ret = new Int16Array(count * n);
                    break;

                case gl.UNSIGNED_SHORT:
                    sz = 2;
                    f = (data, i) => data.getUint16(i);
                    ret = new Uint16Array(count * n);
                    break;

                case gl.INT:
                    sz = 4;
                    f = (data, i) => data.getInt32(i);
                    ret = new Int32Array(count * n);
                    break;

                case gl.UNSIGNED_INT:
                    sz = 4;
                    f = (data, i) => data.getUint32(i);
                    ret = new Uint32Array(count * n);
                    break;

                case gl.FLOAT:
                    sz = 4;
                    f = (data, i) => data.getFloat32(i);
                    ret = new Float32Array(count * n);
                    break;

                default:
                    throw new Error(`Unknown component type ${componentType}`);
            }

            const view = bufferView === undefined ?
                undefined :
                await bufferViews?.get(bufferView);

            let data;
            let stride = 0;
            if (view !== undefined) {
                if (view.buffer !== undefined) {
                    data = new DataView(
                        view.buffer.buffer,
                        (byteOffset ?? 0) + view.byteOffset,
                        view.byteLength,
                    );
                }
                stride = view.byteStride;
            }
            if (stride === 0) {
                stride = sz * n;
                if (stride & 3) {
                    stride = (stride & -4) + 4;
                }
            }

            if (data !== undefined) {
                for (let i = 0; i < count; i++) {
                    const j = i * n;
                    for (let k = 0; k < n; k++) {
                        ret[j + k] = f(data, j * stride + k * sz);
                    }
                }
            }

            if (sparse) {
                throw new Error("Sparse accessor is unsupported");
            }

            return new AccessorData(
                ret,
                normalized ?? false,
                componentType,
                type,
            );
        }
    );

    const images = data.images === undefined ? undefined : new CachedArray(
        data.images,
        async ({
            uri,
            bufferView,
            name,
        }, i) => {
            let ret = new Image();
            ret.decoding = "async";

            if (uri !== undefined) {
                ret.src = uri;
            } else if (bufferView !== undefined) {
                const view = await bufferViews?.get(bufferView);
                if ((view === undefined) || (view.buffer === undefined)) {
                    throw new Error("Cannot load buffer view");
                }
                if (view.byteStride !== 0) {
                    throw new Error("Buffer view has stride");
                }

                const buf = view.buffer.subarray(view.byteOffset, view.byteOffset + view.byteLength);

                ret.src = uri = URL.createObjectURL(new Blob([buf]));
                try {
                    await new Promise((resolve, reject) => {
                        ret.addEventListener("load", resolve);
                        ret.addEventListener("error", (e) => reject(new Error(`Cannot load image ${name ?? i}`)));
                    });
                } finally {
                    URL.revokeObjectURL(uri);
                }
            } else {
                throw new Error(`No URL or buffer set in image ${name ?? i}`);
            }

            return ret;
        }
    );

    let defaultTexture: () => WebGLTexture;
    {
        let tex: WebGLTexture | null = null;
        defaultTexture = () => {
            if (tex === null) {
                tex = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, 0x2601);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 0x2702);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, 0x2901);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, 0x2901);
                gl.texImage2D(
                    gl.TEXTURE_2D,
                    0,
                    gl.RGBA,
                    1,
                    1,
                    0,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    new Uint8Array([255, 255, 255, 255]),
                );
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
            return tex as WebGLTexture;
        };
    }

    let defaultNormTexture: () => WebGLTexture;
    {
        let tex: WebGLTexture | null = null;
        defaultNormTexture = () => {
            if (tex === null) {
                tex = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, 0x2601);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 0x2702);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, 0x2901);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, 0x2901);
                gl.texImage2D(
                    gl.TEXTURE_2D,
                    0,
                    gl.RGBA,
                    1,
                    1,
                    0,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    new Uint8Array([0, 0, 255, 255]),
                );
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
            return tex as WebGLTexture;
        };
    }

    const textures = data.textures === undefined ? undefined : new CachedArray(
        data.textures,
        async ({
            sampler,
            source,
        }) => {
            let magFilter = gl.LINEAR;
            let minFilter = gl.NEAREST_MIPMAP_LINEAR;
            let wrapS = gl.REPEAT;
            let wrapT = gl.REPEAT;
            if (sampler !== undefined) {
                let s = data.samplers![sampler];
                if (s.magFilter !== undefined) {
                    magFilter = s.magFilter;
                }
                if (s.minFilter !== undefined) {
                    minFilter = s.minFilter;
                }
                if (s.wrapS !== undefined) {
                    wrapS = s.wrapS;
                }
                if (s.wrapT !== undefined) {
                    wrapT = s.wrapT;
                }
            }

            let image: any;
            if (source !== undefined) {
                image = await images?.get(source);
            }
            if (image === undefined) {
                image = defaultTexture();
            }

            const ret = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, ret);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                image,
            );
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);

            return ret as WebGLTexture;
        }
    );

    const materials = data.materials === undefined ? undefined : new CachedArray(
        data.materials,
        async ({
            pbrMetallicRoughness,
            normalTexture,
            alphaMode,
            alphaCutoff,
            doubleSided,
        }) => {
            const ret = new PBRShader(shader);

            let tex_: Array<WebGLTexture | Promise<WebGLTexture> | undefined> = [
                undefined,
                undefined,
                undefined,
            ];

            if (pbrMetallicRoughness !== undefined) {
                const {
                    baseColorFactor,
                    baseColorTexture,
                    metallicFactor,
                    metallicRoughnessTexture,
                    roughnessFactor,
                } = pbrMetallicRoughness;

                if (baseColorTexture !== undefined) {
                    tex_[0] = textures?.get(baseColorTexture.index);
                }
                ret.baseTextureFactor = baseColorFactor;
                if (metallicRoughnessTexture !== undefined) {
                    tex_[1] = textures?.get(metallicRoughnessTexture.index);
                }
                ret.metallicFactor = metallicFactor;
                ret.roughnessFactor = roughnessFactor;
            }

            if (tex_[0] === undefined) {
                tex_[0] = defaultTexture();
            }
            if (tex_[1] === undefined) {
                tex_[1] = defaultTexture();
            }

            if (normalTexture !== undefined) {
                tex_[2] = textures?.get(normalTexture.index);
                ret.normalScale = normalTexture.scale;
            } else {
                tex_[2] = defaultNormTexture();
            }

            switch (alphaMode) {
                case "OPAQUE":
                    ret.alphaCutoff = 0;
                    break;

                case "MASK":
                    ret.alphaCutoff = alphaCutoff ?? 0.9;
                    break;

                case "BLEND":
                    throw new Error("Unsupported transparency mode");

                default:
                    throw new Error(`Unknown alpha mode ${alphaMode}`);
            }

            ret.doubleSided = doubleSided ?? false;

            [
                ret.baseTexture,
                ret.metallicRoughnessTexture,
                ret.normalTexture,
            ] = await Promise.all(tex_);

            return ret;
        }
    );

    let defaultMaterial;
    {
        let defaultMat: PBRShader | null = null;
        defaultMaterial = () => {
            if (defaultMat === null) {
                defaultMat = new PBRShader(shader);
                defaultMat.metallicRoughnessTexture = defaultMat.baseTexture = defaultTexture();
                defaultMat.normalTexture = defaultNormTexture();
            }
            return defaultMat;
        };
    }

    const meshes = data.meshes === undefined ? undefined : new CachedArray(
        data.meshes,
        async ({
            primitives,
        }) => {
            const ret = [];
            for (const p of primitives) {
                let {
                    POSITION,
                    NORMAL,
                    TANGENT,
                    TEXCOORD_0,
                    COLOR_0,
                    JOINTS_0,
                    WEIGHTS_0,
                } = p.attributes;

                let indices: AccessorData | undefined;
                if (p.indices !== undefined) {
                    indices = await accessors?.get(p.indices);
                }

                let vertex: Float32Array | undefined;
                if (POSITION !== undefined) {
                    vertex = (await accessors?.get(POSITION))?.toFloatArray();
                }
                if (vertex === undefined) {
                    throw new Error("Invalid mesh");
                }

                let normal: Float32Array | undefined;
                if (NORMAL !== undefined) {
                    normal = (await accessors?.get(NORMAL))?.toFloatArray();
                }

                let tangent: Float32Array | undefined;
                if (TANGENT !== undefined) {
                    tangent = (await accessors?.get(TANGENT))?.toFloatArray();
                }

                let uv: Float32Array | undefined;
                if (TEXCOORD_0 !== undefined) {
                    uv = (await accessors?.get(TEXCOORD_0))?.toFloatArray();
                }

                let color: Float32Array | undefined;
                if (COLOR_0 !== undefined) {
                    const v = await accessors?.get(COLOR_0);
                    color = v?.toFloatArray();
                    if (v?.type === "VEC3") {
                        const r = new Float32Array(((color!.length / 3) | 0) * 4);
                        for (let i = 0; i < r.length; i++) {
                            const m = i % 4;
                            if (m === 3) {
                                r[i] = 1;
                            } else {
                                r[i] = color![((i / 4) | 0) * 3 + m];
                            }
                        }
                        color = r;
                    }
                }

                let joints: Uint16Array | undefined;
                if (JOINTS_0 !== undefined) {
                    const v = await accessors?.get(JOINTS_0);
                    if (v !== undefined) {
                        joints = new Uint16Array(v.array.length);
                        joints.set(v.array);
                    }
                }

                let weights: Float32Array | undefined;
                if (WEIGHTS_0 !== undefined) {
                    weights = (await accessors?.get(WEIGHTS_0))?.toFloatArray();
                }

                function unindex() {
                    if (indices === undefined) {
                        return;
                    }
                    const a = indices.array;
                    indices = undefined;
                    if (vertex !== undefined) {
                        vertex = indicesExpand(vertex, 3, a);
                    }
                    if (normal !== undefined) {
                        normal = indicesExpand(normal, 3, a);
                    }
                    if (tangent !== undefined) {
                        tangent = indicesExpand(tangent, 4, a);
                    }
                    if (uv !== undefined) {
                        uv = indicesExpand(uv, 2, a);
                    }
                    if (color !== undefined) {
                        color = indicesExpand(color, 4, a);
                    }
                    if (joints !== undefined) {
                        joints = indicesExpandUShort(joints, 4, a);
                    }
                    if (weights !== undefined) {
                        weights = indicesExpand(weights, 4, a);
                    }
                }

                if ((normal === undefined)) {
                    unindex();
                    normal = generateNormals(vertex);
                }
                if ((tangent === undefined) && (uv !== undefined)) {
                    unindex();
                    tangent = generateTangents(vertex, normal, uv);
                }

                const mesh = new Mesh(gl, {
                    vertex: vertex,
                    normal: normal,
                    uv: uv,
                    color: color,
                    joints: joints,
                    weights: weights,
                    tangent: tangent,
                    index: indices?.array,
                });
                if (p.material !== undefined) {
                    mesh.shader = await materials?.get(p.material);
                }
                ret.push(mesh);
            }

            return ret;
        }
    );

    const nodes = data.nodes === undefined ? undefined : new CachedArray(
        data.nodes,
        async ({
            children,
            matrix,
            translation,
            rotation,
            scale,
            mesh,
            skin,
        }): Promise<Node3D> => {
            const ret = mesh === undefined ? new Node3D(gl) : new MeshInstance(gl);

            if (children !== undefined) {
                for (const i of children) {
                    const c = await nodes?.get(i);
                    if (c !== undefined) {
                        ret.add_node(c);
                    }
                }
            }

            if (matrix !== undefined) {
                ret.transform = new Transform(
                    new Vector3(matrix[0], matrix[1], matrix[2]),
                    new Vector3(matrix[4], matrix[5], matrix[6]),
                    new Vector3(matrix[8], matrix[9], matrix[10]),
                    new Vector3(matrix[12], matrix[13], matrix[14]),
                );
            } else {
                let t = Transform.IDENTITY;
                if (scale !== undefined) {
                    t = t.pre_scale(new Vector3(scale));
                }
                if (rotation !== undefined) {
                    t = t.pre_rotate(new Quat(rotation));
                }
                if (translation !== undefined) {
                    t = t.pre_translate(new Vector3(translation));
                }
                ret.transform = t;
            }

            if (mesh !== undefined) {
                (ret as MeshInstance).meshes = await meshes?.get(mesh) ?? [];
            }

            return ret;
        }
    );

    const scenes = data.scenes === undefined ? undefined : new CachedArray(
        data.scenes,
        (scene) => {
            Promise.all((scene.nodes ?? []).map((v) => nodes?.get(v)))
        }
    );

    return data.scene === undefined ? [] : await scenes?.get(data.scene) ?? [];
}

export class PBRShader implements HasShader {
    private readonly parent: HasShader;

    baseTextureFactor?: number[];
    baseTexture?: WebGLTexture;
    metallicFactor?: number;
    roughnessFactor?: number;
    metallicRoughnessTexture?: WebGLTexture;
    normalTexture?: WebGLTexture;
    normalScale?: number;
    alphaCutoff?: number;
    doubleSided?: boolean;

    constructor(parent: HasShader) {
        this.parent = parent;
    }

    get shader(): Shader {
        const shader = this.parent.shader;
        const gl = shader.gl;

        shader.set_uniform("alphaCutoff", this.alphaCutoff ?? 0);
        if (this.baseTexture !== undefined) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.baseTexture);
            shader.set_uniform("baseTexture", 0);
        }
        shader.set_uniformv("baseTextureFactor", this.baseTextureFactor ?? [1, 1, 1, 1]);
        if (this.metallicRoughnessTexture !== undefined) {
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, this.metallicRoughnessTexture);
            shader.set_uniform("metallicRoughnessTexture", 2);
        }
        shader.set_uniform("metallicFactor", this.metallicFactor ?? 1);
        shader.set_uniform("roughnessFactor", this.roughnessFactor ?? 1);
        if (this.normalTexture !== undefined) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.normalTexture);
            shader.set_uniform("normalTexture", 1);
        }
        shader.set_uniform("normalScale", this.normalScale ?? 1);

        if (this.doubleSided) {
            gl.disable(gl.CULL_FACE);
        }

        return shader;
    }
}

type TypedArray = Uint8Array | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array | Float32Array | Float64Array;
class AccessorData {
    array: TypedArray;
    normalized: boolean;
    componentType: number;
    type: string;

    constructor(
        array: TypedArray,
        normalized: boolean,
        componentType: number,
        type: string,
    ) {
        this.array = array;
        this.normalized = normalized;
        this.componentType = componentType;
        this.type = type;
    }

    get_value(ix: number): number {
        let ret = this.array[ix];
        if (this.normalized) {
            switch (this.componentType) {
                case 0x1400: // BYTE
                    ret = ret / 128;
                    break;

                case 0x1401: // UNSIGNED_BYTE
                    ret = ret / 255;
                    break;

                case 0x1402: // SHORT
                    ret = ret / 32768;
                    break;

                case 0x1403: // UNSIGNED_SHORT
                    ret = ret / 65535;
                    break;

                case 0x1404: // INT
                    ret = ret / 2147483648;
                    break;

                case 0x1405: // UNSIGNED_INT
                    ret = ret / 4294967295;
                    break;
            }
        }
        return ret;
    }

    toFloatArray(): Float32Array {
        const ret = new Float32Array(this.array.length);
        ret.set(this.array);
        if (this.normalized) {
            switch (this.componentType) {
                case 0x1400: // BYTE
                    for (let i = 0; i < ret.length; i++) {
                        ret[i] = ret[i] / 128;
                    }
                    break;

                case 0x1401: // UNSIGNED_BYTE
                    for (let i = 0; i < ret.length; i++) {
                        ret[i] = ret[i] / 255;
                    }
                    break;

                case 0x1402: // SHORT
                    for (let i = 0; i < ret.length; i++) {
                        ret[i] = ret[i] / 32768;
                    }
                    break;

                case 0x1403: // UNSIGNED_SHORT
                    for (let i = 0; i < ret.length; i++) {
                        ret[i] = ret[i] / 65535;
                    }
                    break;

                case 0x1404: // INT
                    for (let i = 0; i < ret.length; i++) {
                        ret[i] = ret[i] / 2147483648;
                    }
                    break;

                case 0x1405: // UNSIGNED_INT
                    for (let i = 0; i < ret.length; i++) {
                        ret[i] = ret[i] / 4294967295;
                    }
                    break;
            }
        }
        return ret;
    }
}

function indicesExpand(v: Float32Array, n: number, ind: ArrayLike<number>): Float32Array {
    const ret = new Float32Array(ind.length * n);
    for (let i = 0; i < ind.length; i++) {
        const j = ind[i];
        ret.set(v.subarray(j, j + n), i);
    }
    return ret;
}

function indicesExpandUShort(v: Uint16Array, n: number, ind: ArrayLike<number>): Uint16Array {
    const ret = new Uint16Array(ind.length * n);
    for (let i = 0; i < ind.length; i++) {
        const j = ind[i];
        ret.set(v.subarray(j, j + n), i);
    }
    return ret;
}

function generateNormals(vertex: Float32Array): Float32Array {
    const normal = new Float32Array(vertex.length);

    for (let i = 0, j = 0; i < vertex.length; i += 9, j += 6) {
        const v1x = vertex[i];
        const v1y = vertex[i + 1];
        const v1z = vertex[i + 2];
        const v2x = vertex[i + 3];
        const v2y = vertex[i + 4];
        const v2z = vertex[i + 5];
        const v3x = vertex[i + 6];
        const v3y = vertex[i + 7];
        const v3z = vertex[i + 8];

        const dv1x = v2x - v1x;
        const dv1y = v2y - v1y;
        const dv1z = v2z - v1z;
        const dv2x = v3x - v1x;
        const dv2y = v3y - v1y;
        const dv2z = v3z - v1z;

        const nx = dv1y * dv2z - dv1z * dv2y;
        const ny = dv1z * dv2x - dv1x * dv2z;
        const nz = dv1x * dv2y - dv1y * dv2x;
        const d = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);

        normal[i + 6] = normal[i + 3] = normal[i] = nx * d;
        normal[i + 7] = normal[i + 4] = normal[i + 1] = ny * d;
        normal[i + 8] = normal[i + 5] = normal[i + 2] = nz * d;
    }

    return normal;
}

function generateTangents(vertex: Float32Array, normal: Float32Array, uv: Float32Array): Float32Array {
    const tangent = new Float32Array(((vertex.length / 3) | 0) * 4);

    for (let i = 0, j = 0, k = 0; i < vertex.length; i += 9, j += 6, k += 12) {
        const v1x = vertex[i];
        const v1y = vertex[i + 1];
        const v1z = vertex[i + 2];
        const v2x = vertex[i + 3];
        const v2y = vertex[i + 4];
        const v2z = vertex[i + 5];
        const v3x = vertex[i + 6];
        const v3y = vertex[i + 7];
        const v3z = vertex[i + 8];

        const dv1x = v2x - v1x;
        const dv1y = v2y - v1y;
        const dv1z = v2z - v1z;
        const dv2x = v3x - v1x;
        const dv2y = v3y - v1y;
        const dv2z = v3z - v1z;

        const nx = (normal[i] + normal[i + 3] + normal[i + 6]) / 3;
        const ny = (normal[i + 1] + normal[i + 4] + normal[i + 7]) / 3;
        const nz = (normal[i + 2] + normal[i + 5] + normal[i + 8]) / 3;

        const uv1x = uv[j];
        const uv1y = uv[j + 1];
        const uv2x = uv[j + 2];
        const uv2y = uv[j + 3];
        const uv3x = uv[j + 4];
        const uv3y = uv[j + 5];

        let fx = uv2x - uv1x;
        let fy = uv2y - uv1y;
        let gx = uv3x - uv1x;
        let gy = uv3y - uv1y;

        let d = 1 / (fx * gy - fy * gx);
        fx *= d;
        gx *= d;
        fy *= d;
        gy *= d;

        let tx = gy * dv1x - fy * dv2x;
        let ty = gy * dv1y - fy * dv2y;
        let tz = gy * dv1z - fy * dv2z;
        let ux = fx * dv2x - gx * dv1x;
        let uy = fx * dv2y - gx * dv1y;
        let uz = fx * dv2z - gx * dv1z;

        d = nx * tx + ny * ty + nz * tz;
        tx -= d * tx;
        ty -= d * ty;
        tz -= d * tz;
        d = nx * ux + ny * uy + nz * uz;
        ux -= d * ux;
        uy -= d * uy;
        uz -= d * uz;
        d = tx * ux + ty * uy + tz * uz;
        ux -= d * ux;
        uy -= d * uy;
        uz -= d * uz;

        d = nx * ty * uz +
            ny * tz * ux +
            nz * tx * uy -
            nx * tz * uy -
            ny * tx * uz -
            nz * ty * ux;
        const b = d >= 0 ? 1 : 0;

        d = 1 / Math.sqrt(tx * tx + ty * ty + tz * tz);
        tx *= d;
        ty *= d;
        tz *= d;

        tangent[k + 8] = tangent[k + 4] = tangent[k] = tx;
        tangent[k + 9] = tangent[k + 5] = tangent[k + 1] = ty;
        tangent[k + 10] = tangent[k + 6] = tangent[k + 2] = tz;
        tangent[k + 11] = tangent[k + 7] = tangent[k + 3] = b;
    }

    return tangent;
}
