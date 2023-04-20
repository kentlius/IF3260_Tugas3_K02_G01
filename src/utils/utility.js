function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function subtractVectors(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function normalize(v) {
  const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);

  if (length > 0.00001) {
    return [v[0] / length, v[1] / length, v[2] / length];
  } else {
    return [0, 0, 0];
  }
}

function getVectors(vertices) {
  const n = vertices.length;
  let vertexNormals = [];
  let vertexTangents = [];
  let vertexBitangents = [];
  for (let i = 0; i < n; i += 18) {
    const p1 = [vertices[i], vertices[i + 1], vertices[i + 2]];
    const p2 = [vertices[i + 3], vertices[i + 4], vertices[i + 5]];
    const p3 = [vertices[i + 6], vertices[i + 7], vertices[i + 8]];

    const vec1 = subtractVectors(p2, p1);
    const vec2 = subtractVectors(p3, p1);
    const normalDirection = cross(vec1, vec2);

    const vecNormal = normalize(normalDirection);
    const vecTangent = normalize(vec1);
    const vecBitangent = normalize(vec2);

    for (let j = 0; j < 6; j++) {
      vertexNormals = vertexNormals.concat(vecNormal);
      vertexTangents = vertexTangents.concat(vecTangent);
      vertexBitangents = vertexBitangents.concat(vecBitangent);
    }
  }
  return {
    normals: vertexNormals,
    tangents: vertexTangents,
    bitangents: vertexBitangents,
  };
}

function interpolateRotation(
  prevRotation,
  nextRotation,
  prevTime,
  nextTime,
  currentTime
) {
  if (prevRotation === null) {
    return nextRotation;
  } else if (nextRotation === null) {
    return prevRotation;
  } else {
    const t = (currentTime - prevTime) / (nextTime - prevTime);
    return [
      prevRotation[0] * (1 - t) + nextRotation[0] * t,
      prevRotation[1] * (1 - t) + nextRotation[1] * t,
      prevRotation[2] * (1 - t) + nextRotation[2] * t,
    ];
  }
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function resizeCanvasToDisplaySize(canvas, multiplier) {
  multiplier = multiplier || 1;
  const width = (canvas.clientWidth * multiplier) | 0;
  const height = (canvas.clientHeight * multiplier) | 0;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}

export {
  subtractVectors,
  normalize,
  cross,
  getVectors,
  interpolateRotation,
  createProgram,
  createShader,
  resizeCanvasToDisplaySize,
};
