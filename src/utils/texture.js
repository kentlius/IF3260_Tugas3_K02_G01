export function toTextureMode(texture) {
  switch (texture) {
    case "CUSTOM":
      return 0;
    case "REFLECTIVE":
      return 1;
    case "BUMP":
      return 2;
    case "DEFAULT":
      return 3;
    default:
      return -1;
  }
}

export class TEXTURE_MAP {
  static environment(gl) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    const faceInfos = [
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        url: "./textures/x+.jpg",
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        url: "./textures/x-.jpg",
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        url: "./textures/y+.jpg",
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        url: "./textures/y-.jpg",
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        url: "./textures/z+.jpg",
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        url: "./textures/z-.jpg",
      },
    ];
    faceInfos.forEach((faceInfo) => {
      const { target, url } = faceInfo;

      const level = 0;
      const internalFormat = gl.RGBA;
      const width = 512;
      const height = 512;
      const format = gl.RGBA;
      const type = gl.UNSIGNED_BYTE;

      gl.texImage2D(
        target,
        level,
        internalFormat,
        width,
        height,
        0,
        format,
        type,
        null
      );

      // Asynchronously load an image
      const image = new Image();
      image.src = url;
      image.addEventListener("load", function () {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.texImage2D(target, level, internalFormat, format, type, image);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      });
    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(
      gl.TEXTURE_CUBE_MAP,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    );

    return texture;
  }

  static image(gl) {
    const url = "./textures/amogus.gif";
    return TEXTURE_MAP.loadTexture(gl, url);
  }

  static bump(gl) {
    const url = "./textures/bump.png";
    return TEXTURE_MAP.loadTexture(gl, url);
  }

  static default(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([255, 255, 255, 255])
    );
    return texture;
  }

  static loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 0, 255]);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      width,
      height,
      border,
      srcFormat,
      srcType,
      pixel
    );

    // Asynchronously load an image
    const image = new Image();
    image.src = url;
    image.addEventListener("load", function () {
      // Now that the image has loaded make copy it to the texture.
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );

      // Check if the image is a power of 2 in both dimensions.
      if (
        (image.width & (image.width - 1)) === 0 &&
        (image.height & (image.height - 1)) === 0
      ) {
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_2D);
      } else {
        // No, it's not a power of 2. Turn of mips and set wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
    });

    return texture;
  }
}
