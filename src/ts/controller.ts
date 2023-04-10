import { HasTransform } from "./node_tree.js";
import { Quat, Vector3 } from "./primitive.js";

let keystate: { [key: string]: boolean } = {
    "up": false,
    "down": false,
    "left": false,
    "right": false,
    "front": false,
    "back": false,
    "lookUp": false,
    "lookDown": false,
    "lookLeft": false,
    "lookRight": false,
    "rotateLeft": false,
    "rotateRight": false,
}

const keybind: { [key: string]: string } = {
    "ArrowUp": "lookUp",
    "ArrowDown": "lookDown",
    "ArrowLeft": "lookLeft",
    "ArrowRight": "lookRight",
    "ShiftLeft": "front",
    "ControlLeft": "back",
    "KeyW": "up",
    "KeyS": "down",
    "KeyA": "left",
    "KeyD": "right",
    "KeyQ": "rotateLeft",
    "KeyE": "rotateRight",
};

document.addEventListener("keydown", (ev) => {
    const state = keybind[ev.code];
    if (state !== undefined) {
        keystate[state] = true;
    }
});
document.addEventListener("keyup", (ev) => {
    const state = keybind[ev.code];
    if (state !== undefined) {
        keystate[state] = false;
    }
});

const moveRate = 1.0;
const rotateRate = 1.0;

export function processKey(delta: number, camera: HasTransform) {
    const quat = camera.rotation;
    if (keystate.up) {
        camera.translation = camera.translation.add(quat.mul(new Vector3(0, moveRate * delta, 0)));
    }
    if (keystate.down) {
        camera.translation = camera.translation.add(quat.mul(new Vector3(0, -moveRate * delta, 0)));
    }
    if (keystate.left) {
        camera.translation = camera.translation.add(quat.mul(new Vector3(-moveRate * delta, 0, 0)));
    }
    if (keystate.right) {
        camera.translation = camera.translation.add(quat.mul(new Vector3(moveRate * delta, 0, 0)));
    }
    if (keystate.front) {
        camera.translation = camera.translation.add(quat.mul(new Vector3(0, 0, moveRate * delta)));
    }
    if (keystate.back) {
        camera.translation = camera.translation.add(quat.mul(new Vector3(0, 0, -moveRate * delta)));
    }
    if (keystate.lookUp) {
        camera.rotation = Quat.from_axis_angle(Vector3.RIGHT, rotateRate * delta).mul(camera.rotation);
    }
    if (keystate.lookDown) {
        camera.rotation = Quat.from_axis_angle(Vector3.LEFT, rotateRate * delta).mul(camera.rotation);
    }
    if (keystate.lookLeft) {
        camera.rotation = Quat.from_axis_angle(Vector3.UP, rotateRate * delta).mul(camera.rotation);
    }
    if (keystate.lookRight) {
        camera.rotation = Quat.from_axis_angle(Vector3.DOWN, rotateRate * delta).mul(camera.rotation);
    }
    if (keystate.rotateLeft) {
        camera.rotation = Quat.from_axis_angle(Vector3.FRONT, rotateRate * delta).mul(camera.rotation);
    }
    if (keystate.rotateRight) {
        camera.rotation = Quat.from_axis_angle(Vector3.BACK, rotateRate * delta).mul(camera.rotation);
    }
}
