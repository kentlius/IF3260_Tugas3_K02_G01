class UniformData {
    readonly loc: WebGLUniformLocation;
    readonly type: number;

    constructor(loc: WebGLUniformLocation, type: number) {
        this.loc = loc;
        this.type = type;
    }

    set_uniformv(gl: WebGL2RenderingContext, value: number[]) {
        switch (this.type) {
            case 0x1406: // FLOAT
                gl.uniform1fv(this.loc, value);
                break;

            case 0x1404: // INT
            case 0x8B56: // BOOL
            case 0x8B5E: // SAMPLER_2D
            case 0x8B60: // SAMPLER_CUBE
                gl.uniform1iv(this.loc, value);
                break;

            case 0x1405: // UNSIGNED_INT
                gl.uniform1uiv(this.loc, value);
                break;

            case 0x8B50: // FLOAT_VEC2
                gl.uniform2fv(this.loc, value);
                break;

            case 0x8B51: // FLOAT_VEC3
                gl.uniform3fv(this.loc, value);
                break;

            case 0x8B52: // FLOAT_VEC4
                gl.uniform4fv(this.loc, value);
                break;

            case 0x8B53: // INT_VEC2
            case 0x8B57: // BOOL_VEC2
                gl.uniform2iv(this.loc, value);
                break;

            case 0x8B54: // INT_VEC3
            case 0x8B58: // BOOL_VEC3
                gl.uniform3iv(this.loc, value);
                break;

            case 0x8B55: // INT_VEC4
            case 0x8B59: // BOOL_VEC4
                gl.uniform4iv(this.loc, value);
                break;

            case 0x8DC6: // UNSIGNED_INT_VEC2
                gl.uniform2uiv(this.loc, value);
                break;

            case 0x8DC7: // UNSIGNED_INT_VEC3
                gl.uniform3uiv(this.loc, value);
                break;

            case 0x8DC8: // UNSIGNED_INT_VEC4
                gl.uniform4uiv(this.loc, value);
                break;

            case 0x8B5A: // FLOAT_MAT2
                gl.uniformMatrix2fv(this.loc, false, value);
                break;

            case 0x8B5B: // FLOAT_MAT3
                gl.uniformMatrix3fv(this.loc, false, value);
                break;

            case 0x8B5C: // FLOAT_MAT4
                gl.uniformMatrix4fv(this.loc, false, value);
                break;

            case 0x8B65: // FLOAT_MAT2x3
                gl.uniformMatrix2x3fv(this.loc, false, value);
                break;

            case 0x8B66: // FLOAT_MAT2x4
                gl.uniformMatrix2x4fv(this.loc, false, value);
                break;

            case 0x8B67: // FLOAT_MAT3x2
                gl.uniformMatrix3x2fv(this.loc, false, value);
                break;

            case 0x8B68: // FLOAT_MAT3x4
                gl.uniformMatrix3x4fv(this.loc, false, value);
                break;

            case 0x8B69: // FLOAT_MAT4x2
                gl.uniformMatrix4x2fv(this.loc, false, value);
                break;

            case 0x8B6A: // FLOAT_MAT4x3
                gl.uniformMatrix4x3fv(this.loc, false, value);
                break;
        }
    }

    get_uniform(gl: WebGL2RenderingContext, program: WebGLProgram): number[] {
        const ret = gl.getUniform(program, this.loc);
        switch (typeof ret) {
            case "boolean":
                return [ret ? 1 : 0];

            case "number":
                return [ret];

            default:
                return [...ret];
        }
    }
}

class AttributeData {
    readonly loc: number;
    readonly type: number;

    constructor(loc: number, type: number) {
        this.loc = loc;
        this.type = type;
    }

    set_attribv(gl: WebGL2RenderingContext, value: number[]) {
        switch (this.type) {
            case 0x1406: // FLOAT
                gl.disableVertexAttribArray(this.loc);
                gl.vertexAttrib1fv(this.loc, value);
                break;

            case 0x1404: // INT
            case 0x8B56: // BOOL
                gl.disableVertexAttribArray(this.loc);
                gl.vertexAttribI4iv(this.loc, value);
                break;

            case 0x1405: // UNSIGNED_INT
                gl.disableVertexAttribArray(this.loc);
                gl.vertexAttribI4uiv(this.loc, value);
                break;

            case 0x8B50: // FLOAT_VEC2
                gl.disableVertexAttribArray(this.loc);
                gl.vertexAttrib2fv(this.loc, value);
                break;

            case 0x8B51: // FLOAT_VEC3
                gl.disableVertexAttribArray(this.loc);
                gl.vertexAttrib3fv(this.loc, value);
                break;

            case 0x8B52: // FLOAT_VEC4
                gl.disableVertexAttribArray(this.loc);
                gl.vertexAttrib4fv(this.loc, value);
                break;

            case 0x8B53: // INT_VEC2
            case 0x8B57: // BOOL_VEC2
                gl.disableVertexAttribArray(this.loc);
                gl.vertexAttribI4iv(this.loc, value);
                break;

            case 0x8B54: // INT_VEC3
            case 0x8B58: // BOOL_VEC3
                gl.disableVertexAttribArray(this.loc);
                gl.vertexAttribI4iv(this.loc, value);
                break;

            case 0x8B55: // INT_VEC4
            case 0x8B59: // BOOL_VEC4
                gl.disableVertexAttribArray(this.loc);
                gl.vertexAttribI4iv(this.loc, value);
                break;

            case 0x8DC6: // UNSIGNED_INT_VEC2
                gl.disableVertexAttribArray(this.loc);
                gl.vertexAttribI4uiv(this.loc, value);
                break;

            case 0x8DC7: // UNSIGNED_INT_VEC3
                gl.disableVertexAttribArray(this.loc);
                gl.vertexAttribI4uiv(this.loc, value);
                break;

            case 0x8DC8: // UNSIGNED_INT_VEC4
                gl.disableVertexAttribArray(this.loc);
                gl.vertexAttribI4uiv(this.loc, value);
                break;
        }
    }

    set_attrib_buffer(gl: WebGL2RenderingContext, type: number, normalized: boolean, stride: number, offset: number) {
        switch (this.type) {
            case 0x1406: // FLOAT
                gl.enableVertexAttribArray(this.loc);
                gl.vertexAttribPointer(this.loc, 1, type, normalized, stride, offset);
                break;

            case 0x1404: // INT
            case 0x8B56: // BOOL
            case 0x1405: // UNSIGNED_INT
                gl.enableVertexAttribArray(this.loc);
                gl.vertexAttribIPointer(this.loc, 1, type, stride, offset);
                break;

            case 0x8B50: // FLOAT_VEC2
                gl.enableVertexAttribArray(this.loc);
                gl.vertexAttribPointer(this.loc, 2, type, normalized, stride, offset);
                break;

            case 0x8B53: // INT_VEC2
            case 0x8B57: // BOOL_VEC2
            case 0x8DC6: // UNSIGNED_INT_VEC2
                gl.enableVertexAttribArray(this.loc);
                gl.vertexAttribIPointer(this.loc, 2, type, stride, offset);
                break;

            case 0x8B51: // FLOAT_VEC3
                gl.enableVertexAttribArray(this.loc);
                gl.vertexAttribPointer(this.loc, 3, type, normalized, stride, offset);
                break;

            case 0x8B54: // INT_VEC3
            case 0x8B58: // BOOL_VEC3
            case 0x8DC7: // UNSIGNED_INT_VEC3
                gl.enableVertexAttribArray(this.loc);
                gl.vertexAttribIPointer(this.loc, 3, type, stride, offset);
                break;

            case 0x8B52: // FLOAT_VEC4
                gl.enableVertexAttribArray(this.loc);
                gl.vertexAttribPointer(this.loc, 4, type, normalized, stride, offset);
                break;

            case 0x8B55: // INT_VEC4
            case 0x8B59: // BOOL_VEC4
            case 0x8DC8: // UNSIGNED_INT_VEC4
                gl.enableVertexAttribArray(this.loc);
                gl.vertexAttribIPointer(this.loc, 4, type, stride, offset);
                break;
        }
    }
}

export interface HasShader {
    get shader(): Shader;
}

export class Shader implements HasShader {
    private program: WebGLProgram;
    private uniform_loc: Map<string, UniformData>;
    private attribute_loc: Map<string, AttributeData>;

    readonly gl: WebGL2RenderingContext;

    constructor(gl: WebGL2RenderingContext, vertex_shader: WebGLShader, fragment_shader: WebGLShader) {
        this.gl = gl;

        const program = gl.createProgram();
        if (program === null) {
            throw new Error("Cannot create program");
        }
        this.program = program;

        gl.attachShader(program, vertex_shader);
        gl.attachShader(program, fragment_shader);
        gl.linkProgram(program);
        gl.validateProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(program);
            throw new Error("Linking error: " + info);
        }

        this.uniform_loc = new Map();
        const uniform_len: number = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniform_len; i++) {
            const info = gl.getActiveUniform(program, i);
            if (info === null) {
                continue;
            }
            const loc = gl.getUniformLocation(program, info.name);
            if (loc === null) {
                continue;
            }

            this.uniform_loc.set(info.name, new UniformData(loc, info.type));
        }

        this.attribute_loc = new Map();
        const attribute_len: number = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < attribute_len; i++) {
            const info = gl.getActiveAttrib(program, i);
            if (info === null) {
                continue;
            }

            this.attribute_loc.set(info.name, new AttributeData(i, info.type));
        }
    }

    get shader(): Shader {
        return this;
    }

    set_uniform(name: string, ...args: number[]) {
        this.gl.useProgram(this.program);
        this.uniform_loc.get(name)?.set_uniformv(this.gl, args);
        this.gl.useProgram(null);
    }

    set_uniformv(name: string, arr: number[]) {
        this.gl.useProgram(this.program);
        this.uniform_loc.get(name)?.set_uniformv(this.gl, arr);
        this.gl.useProgram(null);
    }

    set_attrib(name: string, ...args: number[]) {
        this.attribute_loc.get(name)?.set_attribv(this.gl, args);
    }

    set_attribv(name: string, arr: number[]) {
        this.attribute_loc.get(name)?.set_attribv(this.gl, arr);
    }

    set_attrib_buffer(name: string, buffer: WebGLBuffer | null, type: number, normalized: boolean, stride: number, offset: number) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.attribute_loc.get(name)?.set_attrib_buffer(this.gl, type, normalized, stride, offset);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    uniforms(): IterableIterator<string> {
        return this.uniform_loc.keys();
    }

    attributes(): IterableIterator<string> {
        return this.attribute_loc.keys();
    }

    render(count: number, indexed: boolean = false) {
        this.gl.useProgram(this.program);
        if (indexed) {
            this.gl.drawElements(this.gl.TRIANGLES, count, this.gl.UNSIGNED_SHORT, 0);
        } else {
            this.gl.drawArrays(this.gl.TRIANGLES, 0, count);
        }
        this.gl.useProgram(null);
    }

    resetGL(): void {
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);
        this.gl.depthMask(true);

        this.gl.enable(this.gl.CULL_FACE);
        this.gl.frontFace(this.gl.CCW);
        this.gl.cullFace(this.gl.BACK);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    }
}

export class ShaderRegistry {
    private vertex_cache: Map<string, Promise<WebGLShader>>;
    private fragment_cache: Map<string, Promise<WebGLShader>>;

    readonly gl: WebGL2RenderingContext;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.vertex_cache = new Map();
        this.fragment_cache = new Map();
    }

    make_shader(vertex_path: string, fragment_path: string): Promise<Shader>;
    make_shader<T extends HasShader>(vertex_path: string, fragment_path: string, wrapper: new (shader: Shader) => T): Promise<T>;
    async make_shader(vertex_path: string, fragment_path: string, wrapper?: new (shader: Shader) => HasShader): Promise<HasShader> {
        let vertex = this.vertex_cache.get(vertex_path);
        let fragment = this.fragment_cache.get(fragment_path);

        const to_shader = async (resp: Response, type: number): Promise<WebGLShader> => {
            const data = await resp.text();

            const shader = this.gl.createShader(type);
            if (shader === null) {
                throw new Error("Cannot create shader");
            }

            this.gl.shaderSource(shader, data);
            this.gl.compileShader(shader);
            if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                const log = this.gl.getShaderInfoLog(shader);

                throw new Error("Shader compilation error: " + log);
            }

            return shader;
        };

        if (vertex === undefined) {
            vertex = fetch(vertex_path).then(resp => to_shader(resp, this.gl.VERTEX_SHADER));
            if (vertex === undefined) {
                throw new Error("Cannot create vertex shader");
            }
            this.vertex_cache.set(vertex_path, vertex);
        }
        if (fragment === undefined) {
            fragment = fetch(fragment_path).then(resp => to_shader(resp, this.gl.FRAGMENT_SHADER));
            if (fragment === undefined) {
                throw new Error("Cannot create fragment shader");
            }
            this.fragment_cache.set(fragment_path, fragment);
        }

        const ret = new Shader(this.gl, await vertex, await fragment);
        return (wrapper === undefined) ? ret : new wrapper(ret);
    }
}
