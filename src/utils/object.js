import { M4 } from "./matrix.js";
import { getVectors, normalize } from "./utility.js";
import { TEXTURE_MAP, toTextureMode } from "./texture.js";

export default class Object {
  textureMode = -1;

  translation = [0, 0, 0];
  rotation = [0, 0, 0];
  scale = [1, 1, 1];

  constructor(gl, program, model) {
    this.gl = gl;
    this.program = program;
    this.model = model;

    this.positionBuffer = this.gl.createBuffer();
    this.colorBuffer = this.gl.createBuffer();
    this.textureCoordBuffer = this.gl.createBuffer();
    this.normalBuffer = this.gl.createBuffer();
    this.tangentBuffer = this.gl.createBuffer();
    this.bitangentBuffer = this.gl.createBuffer();

    this.generateObject();
  }

  generateObject() {
    let vertexPositions = [];
    let vertexColors = [];
    let vertexTextureCoordinates = [];

    let component = {
      vertices: [
        [100, 100, 100],
        [-100, 100, 100],
        [-100, -100, 100],
        [100, -100, 100],
        [100, 100, -100],
        [-100, 100, -100],
        [-100, -100, -100],
        [100, -100, -100],
      ],
      faces: [
        [0, 1, 2, 3],
        [5, 4, 7, 6],
        [4, 0, 3, 7],
        [1, 5, 6, 2],
        [0, 4, 5, 1],
        [2, 6, 7, 3],
      ],
      colors: [
        [255, 0, 0, 255],
        [255, 0, 0, 255],
        [255, 0, 0, 255],
        [255, 0, 0, 255],
        [255, 0, 0, 255],
        [255, 0, 0, 255],
      ],
    };

    for (let j = 0; j < 6; j++) {
      let face = component.faces[j];

      vertexPositions = vertexPositions.concat(component.vertices[face[1]]);
      vertexPositions = vertexPositions.concat(component.vertices[face[2]]);
      vertexPositions = vertexPositions.concat(component.vertices[face[3]]);
      vertexPositions = vertexPositions.concat(component.vertices[face[0]]);
      vertexPositions = vertexPositions.concat(component.vertices[face[1]]);
      vertexPositions = vertexPositions.concat(component.vertices[face[3]]);

      vertexTextureCoordinates = vertexTextureCoordinates.concat([
        0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1,
      ]);

      for (let k = 0; k < 6; k++) {
        vertexColors = vertexColors.concat(component.colors[j]);
      }
    }

    let vector = getVectors(vertexPositions);
    this.numVertices = 36;
    this.position = vertexPositions;
    this.color = vertexColors;
    this.textureCoord = vertexTextureCoordinates;
    this.normal = vector.normals;
    this.tangent = vector.tangents;
    this.bitangent = vector.bitangents;

    let imageTexture = TEXTURE_MAP.image(this.gl);
    let environmentTexture = TEXTURE_MAP.environment(this.gl);
    let bumpTexture = TEXTURE_MAP.bump(this.gl);
    let defaultTexture = TEXTURE_MAP.default(this.gl, this.color);

    this.textures = [
      imageTexture,
      environmentTexture,
      bumpTexture,
      defaultTexture,
    ];
  }

  setTexture(texture) {
    this.textureMode = toTextureMode(texture);
  }

  bind() {
    const gl = this.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.position),
      gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(this.color), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.textureCoord),
      gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.normal),
      gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, this.tangentBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.tangent),
      gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bitangentBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.bitangent),
      gl.STATIC_DRAW
    );
  }

  setBuffers() {
    const gl = this.gl;

    gl.enableVertexAttribArray(
      this.gl.getAttribLocation(this.program, "a_position")
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    var size = 3;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(
      this.gl.getAttribLocation(this.program, "a_position"),
      size,
      type,
      normalize,
      stride,
      offset
    );

    gl.enableVertexAttribArray(
      this.gl.getAttribLocation(this.program, "a_color")
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    var size = 4;
    var type = gl.UNSIGNED_BYTE;
    var normalize = true;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(
      this.gl.getAttribLocation(this.program, "a_color"),
      size,
      type,
      normalize,
      stride,
      offset
    );

    gl.enableVertexAttribArray(
      this.gl.getAttribLocation(this.program, "a_textureCoord")
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(
      this.gl.getAttribLocation(this.program, "a_textureCoord"),
      size,
      type,
      normalize,
      stride,
      offset
    );

    gl.enableVertexAttribArray(
      this.gl.getAttribLocation(this.program, "a_normal")
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    var size = 3;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(
      this.gl.getAttribLocation(this.program, "a_normal"),
      size,
      type,
      normalize,
      stride,
      offset
    );

    gl.enableVertexAttribArray(
      this.gl.getAttribLocation(this.program, "a_tangent")
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tangentBuffer);
    var size = 3;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(
      this.gl.getAttribLocation(this.program, "a_tangent"),
      size,
      type,
      normalize,
      stride,
      offset
    );

    gl.enableVertexAttribArray(
      this.gl.getAttribLocation(this.program, "a_bitangent")
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bitangentBuffer);
    var size = 3;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(
      this.gl.getAttribLocation(this.program, "a_bitangent"),
      size,
      type,
      normalize,
      stride,
      offset
    );
  }

  setUniforms(projection, view, model, cameraPosition, shadingMode) {
    this.gl.uniformMatrix4fv(
      this.gl.getUniformLocation(this.program, "u_projectionMatrix"),
      false,
      projection.getMatrix()
    );

    this.gl.uniformMatrix4fv(
      this.gl.getUniformLocation(this.program, "u_viewMatrix"),
      false,
      view.getMatrix()
    );

    this.gl.uniformMatrix4fv(
      this.gl.getUniformLocation(this.program, "u_modelMatrix"),
      false,
      model.getMatrix()
    );

    this.gl.uniform3fv(
      this.gl.getUniformLocation(this.program, "u_reverseLightDirection"),
      normalize([0.2, 0.4, 1])
    );

    const viewModelMatrix = M4.multiply(view, model);
    const normalMatrix = M4.inverseTranspose(viewModelMatrix);
    this.gl.uniformMatrix4fv(
      this.gl.getUniformLocation(this.program, "u_normalMatrix"),
      false,
      normalMatrix.getMatrix()
    );

    this.gl.uniform3fv(
      this.gl.getUniformLocation(this.program, "u_worldCameraPosition"),
      cameraPosition
    );

    this.gl.uniform1i(
      this.gl.getUniformLocation(this.program, "u_shadingOn"),
      Number(shadingMode)
    );
    this.gl.uniform1i(
      this.gl.getUniformLocation(this.program, "u_textureMode"),
      Number(this.textureMode)
    );

    this.gl.uniform1i(
      this.gl.getUniformLocation(this.program, "u_texture_image"),
      0
    );
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0]);

    this.gl.uniform1i(
      this.gl.getUniformLocation(this.program, "u_texture_environment"),
      1
    );
    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.textures[1]);

    this.gl.uniform1i(
      this.gl.getUniformLocation(this.program, "u_texture_bump"),
      2
    );
    this.gl.activeTexture(this.gl.TEXTURE2);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[2]);

    this.gl.uniform1i(
      this.gl.getUniformLocation(this.program, "u_texture_default"),
      3
    );
    this.gl.activeTexture(this.gl.TEXTURE3);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[3]);
  }

  draw(projection, view, model, cameraPosition, shadingMode) {
    this.gl.useProgram(this.program);
    this.bind();
    this.setBuffers();

    let newModel = model.clone();
    newModel.transform(this.translation, this.rotation, this.scale);
    this.setUniforms(projection, view, newModel, cameraPosition, shadingMode);

    var primitiveType = this.gl.TRIANGLES;
    var offset = 0;
    var count = this.numVertices;
    this.gl.drawArrays(primitiveType, offset, count);
  }
}
