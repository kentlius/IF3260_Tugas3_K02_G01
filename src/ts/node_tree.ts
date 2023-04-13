import { Renderable, RenderData } from "./camera.js";
import { Perspective, Quat, Transform, Vector3 } from "./primitive.js";

export interface HasTransform {
    translation: Vector3;
    rotation: Quat;
    scale: Vector3;

    get transform(): Transform;
    set transform(transform: Transform);
}

export class Node3D implements Renderable, HasTransform {
    private _parent?: Node3D;
    private _children: Node3D[];
    private _child_id?: number;

    readonly gl: WebGL2RenderingContext;
    translation: Vector3 = Vector3.ZERO;
    rotation: Quat = Quat.IDENTITY;
    scale: Vector3 = Vector3.ONE;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;

        this._children = [];
    }

    *[Symbol.iterator](): IterableIterator<Node3D> {
        yield* this._children;
    }

    get transform(): Transform {
        const { x, y, z } = this.rotation.to_transform();
        return new Transform(
            x.mul(this.scale),
            y.mul(this.scale),
            z.mul(this.scale),
            this.translation,
        );
    }

    set transform(v: Transform) {
        this.translation = v.position;
        this.rotation = v.rotation;
        this.scale = v.scale;
    }

    get parent(): Node3D | undefined {
        return this._parent;
    }

    get node_id(): number | undefined {
        return (this._parent === undefined) ? undefined : this._child_id;
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
        node._child_id = this._children.length;
        return this._children.push(node);
    }

    remove_node(i: number) {
        if (i >= this._children.length) {
            throw new Error("Index out of bound");
        }
        this._children[i]._parent = undefined;
        for (let j = i + 1; j < this._children.length; j++) {
            this._children[j]._child_id = j - 1;
        }
        this._children.splice(i, 1);
    }

    render(data: RenderData): void {
        const prev = data.transform;
        data.transform = data.transform.mul(this.transform);
        for (const child of this._children) {
            child.render(data);
        }
        data.transform = prev;
    }
}
