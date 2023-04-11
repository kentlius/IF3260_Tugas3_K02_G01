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
        camera.rotation = camera.rotation.mul(Quat.from_axis_angle(Vector3.RIGHT, rotateRate * delta));
    }
    if (keystate.lookDown) {
        camera.rotation = camera.rotation.mul(Quat.from_axis_angle(Vector3.LEFT, rotateRate * delta));
    }
    if (keystate.lookLeft) {
        camera.rotation = camera.rotation.mul(Quat.from_axis_angle(Vector3.UP, rotateRate * delta));
    }
    if (keystate.lookRight) {
        camera.rotation = camera.rotation.mul(Quat.from_axis_angle(Vector3.DOWN, rotateRate * delta));
    }
    if (keystate.rotateLeft) {
        camera.rotation = camera.rotation.mul(Quat.from_axis_angle(Vector3.FRONT, rotateRate * delta));
    }
    if (keystate.rotateRight) {
        camera.rotation = camera.rotation.mul(Quat.from_axis_angle(Vector3.BACK, rotateRate * delta));
    }
}
