import { Renderable } from "./camera.js";
import { Perspective, Transform, Vector3 } from "./primitive.js";

export class Node3D implements Renderable {
    private _parent?: Node3D;
    private _children: Node3D[];

    readonly gl: WebGL2RenderingContext;
    transform: Transform;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.transform = Transform.IDENTITY;

        this._children = [];
    }

    *[Symbol.iterator](): IterableIterator<Node3D> {
        yield* this._children;
    }

    get parent(): Node3D | undefined {
        return this._parent;
    }

    get children_length(): number {
        return this._children.length;
    }

    get_child(i: number): Node3D {
        if (i >= this._children.length) {
            throw new Error("Index out of bound");
        }
        return this._children[i];
    }

    get children(): Node3D[] {
        return [...this._children];
    }

    add_node(node: Node3D): number {
        if (node.parent !== undefined) {
            throw new Error("Node already has parent");
        }

        node._parent = this;
        return this._children.push(node);
    }

    remove_node(i: number) {
        if (i >= this._children.length) {
            throw new Error("Index out of bound");
        }
        this._children[i]._parent = undefined;
        this._children.splice(i, 1);
    }

    render(transform: Transform, camera: Perspective, camera_position: Vector3): void {
        for (const child of this._children) {
            child.render(transform.mul(this.transform), camera, camera_position);
        }
    }
}
