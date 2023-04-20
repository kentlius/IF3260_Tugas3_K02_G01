import { subtractVectors, normalize, cross } from "./utility.js";

export class M4 {
  constructor(matrix) {
    this.elements = new Array(16);
    if (matrix != null && matrix.length == 16) {
      this.elements = matrix;
    }
  }

  set(row, col, value) {
    this.elements[row * 4 + col] = value;
  }

  setMatrix(matrix) {
    this.elements = matrix;
  }

  get(row, col) {
    return this.elements[row * 4 + col];
  }

  getMatrix() {
    return this.elements;
  }

  clone = () => {
    let result = new M4();

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        result.set(row, col, this.get(row, col));
      }
    }

    return result;
  }

  static identity = () => {
    let identity_matrix = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]
    let matrix = new M4(identity_matrix);
    return matrix;
  }

  transpose = () => {
    const transpose_matrix = [
        this.elements[0], this.elements[4], this.elements[8], this.elements[12],
        this.elements[1], this.elements[5], this.elements[9], this.elements[13],
        this.elements[2], this.elements[6], this.elements[10], this.elements[14],
        this.elements[3], this.elements[7], this.elements[11], this.elements[15],
    ]

    this.setMatrix(transpose_matrix);
  }

  multiply = (matrix) => {
    const a = this.getMatrix();
    const b = matrix.getMatrix();
    const a00 = a[0 * 4 + 0];
    const a01 = a[0 * 4 + 1];
    const a02 = a[0 * 4 + 2];
    const a03 = a[0 * 4 + 3];
    const a10 = a[1 * 4 + 0];
    const a11 = a[1 * 4 + 1];
    const a12 = a[1 * 4 + 2];
    const a13 = a[1 * 4 + 3];
    const a20 = a[2 * 4 + 0];
    const a21 = a[2 * 4 + 1];
    const a22 = a[2 * 4 + 2];
    const a23 = a[2 * 4 + 3];
    const a30 = a[3 * 4 + 0];
    const a31 = a[3 * 4 + 1];
    const a32 = a[3 * 4 + 2];
    const a33 = a[3 * 4 + 3];
    const b00 = b[0 * 4 + 0];
    const b01 = b[0 * 4 + 1];
    const b02 = b[0 * 4 + 2];
    const b03 = b[0 * 4 + 3];
    const b10 = b[1 * 4 + 0];
    const b11 = b[1 * 4 + 1];
    const b12 = b[1 * 4 + 2];
    const b13 = b[1 * 4 + 3];
    const b20 = b[2 * 4 + 0];
    const b21 = b[2 * 4 + 1];
    const b22 = b[2 * 4 + 2];
    const b23 = b[2 * 4 + 3];
    const b30 = b[3 * 4 + 0];
    const b31 = b[3 * 4 + 1];
    const b32 = b[3 * 4 + 2];
    const b33 = b[3 * 4 + 3];
    const result_matrix = [
        b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
        b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
        b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
        b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
        b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
        b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
        b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
        b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
        b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
        b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
        b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
        b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
        b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
        b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
        b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
        b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];

    this.setMatrix(result_matrix);
  }

  static multiply = (matrix_a, matrix_b) => {
    let result = new M4();

    const a = matrix_a.getMatrix();
    const b = matrix_b.getMatrix();
    const a00 = a[0 * 4 + 0];
    const a01 = a[0 * 4 + 1];
    const a02 = a[0 * 4 + 2];
    const a03 = a[0 * 4 + 3];
    const a10 = a[1 * 4 + 0];
    const a11 = a[1 * 4 + 1];
    const a12 = a[1 * 4 + 2];
    const a13 = a[1 * 4 + 3];
    const a20 = a[2 * 4 + 0];
    const a21 = a[2 * 4 + 1];
    const a22 = a[2 * 4 + 2];
    const a23 = a[2 * 4 + 3];
    const a30 = a[3 * 4 + 0];
    const a31 = a[3 * 4 + 1];
    const a32 = a[3 * 4 + 2];
    const a33 = a[3 * 4 + 3];
    const b00 = b[0 * 4 + 0];
    const b01 = b[0 * 4 + 1];
    const b02 = b[0 * 4 + 2];
    const b03 = b[0 * 4 + 3];
    const b10 = b[1 * 4 + 0];
    const b11 = b[1 * 4 + 1];
    const b12 = b[1 * 4 + 2];
    const b13 = b[1 * 4 + 3];
    const b20 = b[2 * 4 + 0];
    const b21 = b[2 * 4 + 1];
    const b22 = b[2 * 4 + 2];
    const b23 = b[2 * 4 + 3];
    const b30 = b[3 * 4 + 0];
    const b31 = b[3 * 4 + 1];
    const b32 = b[3 * 4 + 2];
    const b33 = b[3 * 4 + 3];
    const result_matrix = [
        b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
        b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
        b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
        b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
        b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
        b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
        b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
        b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
        b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
        b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
        b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
        b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
        b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
        b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
        b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
        b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];

    result.setMatrix(result_matrix);
    return result;
  }

  inverse = () => {
    const a00 = this.elements[0 * 4 + 0];
    const a01 = this.elements[0 * 4 + 1];
    const a02 = this.elements[0 * 4 + 2];
    const a03 = this.elements[0 * 4 + 3];
    const a10 = this.elements[1 * 4 + 0];
    const a11 = this.elements[1 * 4 + 1];
    const a12 = this.elements[1 * 4 + 2];
    const a13 = this.elements[1 * 4 + 3];
    const a20 = this.elements[2 * 4 + 0];
    const a21 = this.elements[2 * 4 + 1];
    const a22 = this.elements[2 * 4 + 2];
    const a23 = this.elements[2 * 4 + 3];
    const a30 = this.elements[3 * 4 + 0];
    const a31 = this.elements[3 * 4 + 1];
    const a32 = this.elements[3 * 4 + 2];
    const a33 = this.elements[3 * 4 + 3];

    const b00 = a00 * a11 - a01 * a10;
    const b01 = a00 * a12 - a02 * a10;
    const b02 = a00 * a13 - a03 * a10;
    const b03 = a01 * a12 - a02 * a11;
    const b04 = a01 * a13 - a03 * a11;
    const b05 = a02 * a13 - a03 * a12;
    const b06 = a20 * a31 - a21 * a30;
    const b07 = a20 * a32 - a22 * a30;
    const b08 = a20 * a33 - a23 * a30;
    const b09 = a21 * a32 - a22 * a31;
    const b10 = a21 * a33 - a23 * a31;
    const b11 = a22 * a33 - a23 * a32;

    const invDet = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);

    const inv_matrix = [
      (a11 * b11 - a12 * b10 + a13 * b09) * invDet,
      (a02 * b10 - a01 * b11 - a03 * b09) * invDet,
      (a31 * b05 - a32 * b04 + a33 * b03) * invDet,
      (a22 * b04 - a21 * b05 - a23 * b03) * invDet,
      (a12 * b08 - a10 * b11 - a13 * b07) * invDet,
      (a00 * b11 - a02 * b08 + a03 * b07) * invDet,
      (a32 * b02 - a30 * b05 - a33 * b01) * invDet,
      (a20 * b05 - a22 * b02 + a23 * b01) * invDet,
      (a10 * b10 - a11 * b08 + a13 * b06) * invDet,
      (a01 * b08 - a00 * b10 - a03 * b06) * invDet,
      (a30 * b04 - a31 * b02 + a33 * b00) * invDet,
      (a21 * b02 - a20 * b04 - a23 * b00) * invDet,
      (a11 * b07 - a10 * b09 - a12 * b06) * invDet,
      (a00 * b09 - a01 * b07 + a02 * b06) * invDet,
      (a31 * b01 - a30 * b03 - a32 * b00) * invDet,
      (a20 * b03 - a21 * b01 + a22 * b00) * invDet,
    ]

    this.setMatrix(inv_matrix);

    return this;
  }

  static inverseTranspose(matrix) {
    const outMatrix = matrix.clone();
    outMatrix.inverse();
    outMatrix.transpose();
    return outMatrix;
  }


  static lookAt(cameraPosition, target, up) {
    const zAxis = normalize(
        subtractVectors(cameraPosition, target));
    const xAxis = normalize(cross(up, zAxis));
    const yAxis = normalize(cross(zAxis, xAxis));

    return new M4([
        xAxis[0], xAxis[1], xAxis[2], 0,
        yAxis[0], yAxis[1], yAxis[2], 0,
        zAxis[0], zAxis[1], zAxis[2], 0,
        cameraPosition[0],
        cameraPosition[1],
        cameraPosition[2],
        1,
      ])
  }

  static orthographic = (left, right, bottom, top, near, far) => {
    let width = right - left;
    let height = top - bottom;
    let depth = far - near;

    return new M4([
      2 / width, 0, 0, 0,
      0, 2 / height, 0, 0,
      0, 0, 2 / depth, 0,
      0, 0, 0, 1,
    ]);
  }

  static perspective = (fov, aspect, near, far) => {
    let f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
    let rangeInv = 1.0 / (near - far);

    return new M4([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ]);
  }

  static oblique = (theta, phi) => {
    let t = theta * Math.PI / 180;
    let p = phi * Math.PI / 180;

    let cotT = -1 / Math.tan(t);
    let cotP = -1 / Math.tan(p);

    const matrix = new M4([
      1, 0, cotT, 0,
      0, 1, cotP, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);

    matrix.transpose();

    return matrix;
  }

  static projection(width, height, depth) {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return new M4([
        2 / width, 0, 0, 0,
        0, -2 / height, 0, 0,
        0, 0, 2 / depth, 0,
      -1, 1, 0, 1,
    ]);
  }

  rotateX = (angle) => {
    let matrix = new M4();
    let s = Math.sin(angle);
    let c = Math.cos(angle);

    matrix.setMatrix([
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ]);

    this.multiply(matrix);
  }
 
  rotateY = (angle) => {
    let matrix = new M4();
    let s = Math.sin(angle);
    let c = Math.cos(angle);

    matrix.setMatrix([
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ]);

    this.multiply(matrix);
  }

  rotateZ = (angle) => {
    let matrix = new M4();
    let s = Math.sin(angle);
    let c = Math.cos(angle);

    matrix.setMatrix([
      c, s, 0, 0,
      -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);

    this.multiply(matrix);
  }

  translate = (tx, ty, tz) => {
    let matrix = new M4();
    matrix.setMatrix([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      tx, ty, tz, 1
    ]);

    this.multiply(matrix);
    return this;
  }

  rotate = (angleX, angleY, angleZ) => {
    let matrix = M4.identity();
    matrix.rotateX(angleX);
    matrix.rotateY(angleY);
    matrix.rotateZ(angleZ);

    this.multiply(matrix);
    return this;
  }

  scale = (sx, sy, sz) => {
    let matrix = new M4();
    matrix.setMatrix([
      sx, 0, 0, 0,
      0, sy, 0, 0,
      0, 0, sz, 0,
      0, 0, 0, 1,
    ]);

    this.multiply(matrix);
    return this;
  } 

  transform = (translation, rotation, scale) => {
    this.translate(translation[0], translation[1], translation[2]);
    this.rotate(rotation[0], rotation[1], rotation[2]);
    this.scale(scale[0], scale[1], scale[2]);
    return this;
  }
};