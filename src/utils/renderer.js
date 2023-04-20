import { M4 } from "./matrix.js";
import { interpolateRotation, resizeCanvasToDisplaySize } from "./utility.js";

export class Renderer {
  constructor(gl, program) {
    this._gl = gl;
    this._program = program;
    this.setProjection("ORTHOGRAPHIC");
  }
  
  setObject(object) {
    this.object = object;
    this.cameraAngle = (0 * Math.PI) / 180;
    this.cameraRadius = 500;
    this.shadingMode = false;
  }

  setAnimation(animation) {
    this.animation = animation;
    this.currentTime = 0;
    this.animate = false;
  }

  setProjection(projection) {
    const left = 0;
    const right = this._gl.canvas.clientWidth;
    const bottom = 0;
    const top = this._gl.canvas.clientHeight;
    const near = 850;
    const far = -850;

    const fov = (60 * Math.PI) / 180;
    const aspect = this._gl.canvas.clientWidth / this._gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 2000;
    
    const theta = 45;
    const phi = 45;

    switch (projection) {
      case "ORTHOGRAPHIC":
        this.projectionMatrix = M4.orthographic(
          left,
          right,
          bottom,
          top,
          near,
          far
        );
        break;
      case "PERSPECTIVE":
        this.projectionMatrix = M4.perspective(
          fov, 
          aspect, 
          zNear, 
          zFar
        );
        break;
      default:
        const ortho = M4.orthographic(
          left, 
          right, 
          bottom, 
          top, 
          near, 
          far
        );
        const oblique = M4.oblique(
          -theta, 
          -phi
        );

        oblique.multiply(ortho);
        oblique.translate(0, 0, 500);
        this.projectionMatrix = oblique;
        break;
    }
  }

  drawScene() {
    resizeCanvasToDisplaySize(this._gl.canvas);
    this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);
    this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
    this._gl.enable(this._gl.CULL_FACE);
    this._gl.enable(this._gl.DEPTH_TEST);

    if (!this.object) {
      return;
    }

    const projectionMatrix = this.projectionMatrix.clone();
    let cameraMatrix = M4.identity();
    cameraMatrix.rotateY(this.cameraAngle);
    cameraMatrix.translate(0, 0, this.cameraRadius);
    var cameraPosition = [
      cameraMatrix.get(3, 0),
      cameraMatrix.get(3, 1),
      cameraMatrix.get(3, 2),
    ];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    cameraMatrix = M4.lookAt(cameraPosition, target, up);

    const viewMatrix = cameraMatrix.clone().inverse();

    if (this.animation !== undefined && this.animate) {
      this.currentTime += 1 / 60;

      // loop to the start of animation
      if (this.currentTime > this.animation.duration) {
        this.currentTime = 0;
      }

      // load keyframes
      let prevKeyframe = null;
      let nextKeyframe = null;
      for (let keyframe of this.animation.keyframes) {
        if (keyframe.time <= this.currentTime) {
          prevKeyframe = keyframe;
        } else if (nextKeyframe === null || keyframe.time < nextKeyframe.time) {
          nextKeyframe = keyframe;
        }
      }

      // load transformations
      for (let transform of prevKeyframe.transforms) {
        const component = this.object.getArticulatedObjectByName(
          transform.component
        );
        const prevRotation = transform.rotation;
        let nextRotation = null;
        if (nextKeyframe !== null) {
          const nextTransform = nextKeyframe.transforms.find(
            (t) => t.component === transform.component
          );
          if (nextTransform !== undefined) {
            nextRotation = nextTransform.rotation;
          }
        }
        const rotation = interpolateRotation(
          prevRotation,
          nextRotation,
          prevKeyframe.time,
          nextKeyframe.time,
          this.currentTime
        );
        component.rotation = rotation;
      }
    }

    this.object.draw(
      projectionMatrix,
      viewMatrix,
      M4.identity(),
      cameraPosition,
      this.shadingMode
    );

    requestAnimationFrame(this.drawScene.bind(this));
  }
}
