export class Vector2 {
    readonly x: number;
    readonly y: number;

    static readonly ZERO: Vector2 = new Vector2();
    static readonly ONE: Vector2 = new Vector2(1, 1);
    static readonly UP: Vector2 = new Vector2(0, 1);
    static readonly DOWN: Vector2 = new Vector2(0, -1);
    static readonly LEFT: Vector2 = new Vector2(-1, 0);
    static readonly RIGHT: Vector2 = new Vector2(1, 0);

    constructor();
    constructor(vector: number[] | Vector2);
    constructor(x: number, y: number);
    constructor(arg0?: number | number[] | Vector2, arg1?: number) {
        if (arg0 === undefined) {
            this.x = this.y = 0;
        } else if (typeof arg0 === "number") {
            this.x = arg0;
            this.y = arg1 ?? 0;
        } else {
            [this.x, this.y] = arg0;
        }
    }

    get [0](): number {
        return this.x;
    }

    get [1](): number {
        return this.x;
    }

    *[Symbol.iterator](): IterableIterator<number> {
        yield this.x;
        yield this.y;
    }

    neg(): Vector2 {
        return new Vector2(-this.x, -this.y);
    }

    add(other: number | Vector2): Vector2 {
        if (typeof other === "number") {
            return new Vector2(this.x + other, this.y + other);
        } else {
            return new Vector2(this.x + other.x, this.y + other.y);
        }
    }

    sub(other: number | Vector2): Vector2 {
        if (typeof other === "number") {
            return new Vector2(this.x - other, this.y - other);
        } else {
            return new Vector2(this.x - other.x, this.y - other.y);
        }
    }

    mul(other: number | Vector2): Vector2 {
        if (typeof other === "number") {
            return new Vector2(this.x * other, this.y * other);
        } else {
            return new Vector2(this.x * other.x, this.y * other.y);
        }
    }

    div(other: number | Vector2): Vector2 {
        if (typeof other === "number") {
            return new Vector2(this.x / other, this.y / other);
        } else {
            return new Vector2(this.x / other.x, this.y / other.y);
        }
    }

    dot(other: Vector2): number {
        return this.x * other.x + this.y * other.y;
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize(): Vector2 {
        return this.div(this.length())
    }

    cross(other: Vector2): number {
        return this.x * other.y - this.y * other.x;
    }
}

export class Vector3 {
    readonly x: number;
    readonly y: number;
    readonly z: number;

    static readonly ZERO: Vector3 = new Vector3();
    static readonly ONE: Vector3 = new Vector3(1, 1, 1);
    static readonly UP: Vector3 = new Vector3(0, 1, 0);
    static readonly DOWN: Vector3 = new Vector3(0, -1, 0);
    static readonly LEFT: Vector3 = new Vector3(-1, 0, 0);
    static readonly RIGHT: Vector3 = new Vector3(1, 0, 0);
    static readonly FRONT: Vector3 = new Vector3(0, 0, 1);
    static readonly BACK: Vector3 = new Vector3(0, 0, -1);

    constructor();
    constructor(vector: number[] | Vector3);
    constructor(x: number, y: number, z: number);
    constructor(arg0?: number | number[] | Vector3, arg1?: number, arg2?: number) {
        if (arg0 === undefined) {
            this.x = this.y = this.z = 0;
        } else if (typeof arg0 === "number") {
            this.x = arg0;
            this.y = arg1 ?? 0;
            this.z = arg2 ?? 0;
        } else {
            [this.x, this.y, this.z] = arg0;
        }
    }

    get [0](): number {
        return this.x;
    }

    get [1](): number {
        return this.x;
    }

    get [2](): number {
        return this.x;
    }

    *[Symbol.iterator](): IterableIterator<number> {
        yield this.x;
        yield this.y;
        yield this.z;
    }

    neg(): Vector3 {
        return new Vector3(-this.x, -this.y, -this.z);
    }

    add(other: number | Vector3): Vector3 {
        if (typeof other === "number") {
            return new Vector3(this.x + other, this.y + other, this.z + other);
        } else {
            return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
        }
    }

    sub(other: number | Vector3): Vector3 {
        if (typeof other === "number") {
            return new Vector3(this.x - other, this.y - other, this.z - other);
        } else {
            return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
        }
    }

    mul(other: number | Vector3): Vector3 {
        if (typeof other === "number") {
            return new Vector3(this.x * other, this.y * other, this.z * other);
        } else {
            return new Vector3(this.x * other.x, this.y * other.y, this.z * other.z);
        }
    }

    div(other: number | Vector3): Vector3 {
        if (typeof other === "number") {
            return new Vector3(this.x / other, this.y / other, this.z / other);
        } else {
            return new Vector3(this.x / other.x, this.y / other.y, this.z / other.z);
        }
    }

    dot(other: Vector3): number {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize(): Vector3 {
        return this.div(this.length())
    }

    cross(other: Vector3): Vector3 {
        return new Vector3(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x,
        );
    }
}

export class Quat {
    readonly w: number;
    readonly x: number;
    readonly y: number;
    readonly z: number;

    static readonly IDENTITY = new Quat();

    constructor();
    constructor(quat: number[] | Quat);
    constructor(w: number, x: number, y: number, z: number);
    constructor(arg0?: number | number[] | Quat, arg1?: number, arg2?: number, arg3?: number) {
        if (arg0 === undefined) {
            this.x = this.y = this.z = 0;
            this.w = 1;
        } else if (typeof arg0 === "number") {
            this.w = arg0;
            this.x = arg1 ?? 0;
            this.y = arg2 ?? 0;
            this.z = arg3 ?? 0;
        } else {
            [this.w, this.x, this.y, this.z] = arg0;
        }
    }

    static from_axis_angle(axis: Vector3, angle: number): Quat {
        axis = axis.normalize();
        angle *= 0.5;
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        return new Quat(c, axis.x * s, axis.y * s, axis.z * s);
    }

    get r(): number {
        return this.w;
    }

    get i(): number {
        return this.x;
    }

    get j(): number {
        return this.y;
    }

    get k(): number {
        return this.z;
    }

    get [0](): number {
        return this.w;
    }

    get [1](): number {
        return this.x;
    }

    get [2](): number {
        return this.y;
    }

    get [3](): number {
        return this.z;
    }

    *[Symbol.iterator](): IterableIterator<number> {
        yield this.w;
        yield this.x;
        yield this.y;
        yield this.z;
    }

    mul(other: Quat): Quat;
    mul(other: Vector3): Vector3;
    mul(other: Quat | Vector3): Quat | Vector3 {
        if (other instanceof Quat) {
            return new Quat(
                this.w * other.w - this.x * other.x - this.y * other.y - this.z * other.z,
                this.w * other.x + this.x * other.w + this.y * other.z - this.z * other.y,
                this.w * other.y - this.x * other.z + this.y * other.w + this.z * other.x,
                this.w * other.z + this.x * other.y - this.y * other.x + this.z * other.w,
            );
        } else {
            if (Math.abs(1 - this.length_squared()) > 1e-6) {
                console.warn("Quaternion is not normalized, rotation may be incorrect");
            }

            const x = this.y * other.z - this.z * other.y + this.w * other.x;
            const y = this.z * other.x - this.x * other.z + this.w * other.y;
            const z = this.x * other.y - this.y * other.x + this.w * other.z;

            const x_ = this.y * z - this.z * y;
            const y_ = this.z * x - this.x * z;
            const z_ = this.x * y - this.y * x;

            return new Vector3(
                other.x + x_ + x_,
                other.y + y_ + y_,
                other.z + z_ + z_,
            );
        }
    }

    length_squared(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }

    length(): number {
        return Math.sqrt(this.length_squared());
    }

    normalize(): Quat {
        const linv = 1 / this.length();
        return new Quat(this.w * linv, this.x * linv, this.y * linv, this.z * linv);
    }

    inverse(): Quat {
        let linv = this.length_squared();
        return new Quat(this.w * linv, -this.x * linv, -this.y * linv, -this.z * linv);
    }

    conjugate(): Quat {
        return new Quat(this.w, -this.x, -this.y, -this.z);
    }

    to_transform(): Transform {
        const ww = this.w * this.w;
        const xx = this.x * this.x;
        const yy = this.y * this.y;
        const zz = this.z * this.z;
        if (Math.abs(1 - ww - xx - yy - zz) > 1e-6) {
            console.warn("Quaternion is not normalized, rotation may be incorrect");
        }

        const xw2 = this.x * this.w * 2;
        const xy2 = this.x * this.y * 2;
        const xz2 = this.x * this.z * 2;
        const yw2 = this.y * this.w * 2;
        const yz2 = this.y * this.z * 2;
        const zw2 = this.z * this.w * 2;

        return new Transform(
            new Vector3(
                1 - 2 * (yy + zz),
                xy2 + zw2,
                xz2 - yw2,
            ),
            new Vector3(
                xy2 - zw2,
                1 - 2 * (xx + zz),
                yz2 + xw2,
            ),
            new Vector3(
                xz2 + yw2,
                yz2 - xw2,
                1 - 2 * (xx + yy),
            ),
            Vector3.ZERO,
        );
    }
}

export class Transform2D {
    readonly x: Vector2;
    readonly y: Vector2;
    readonly origin: Vector2;

    static readonly IDENTITY: Transform2D = new Transform2D();

    constructor();
    constructor(transform: Vector2[] | Transform2D);
    constructor(x: Vector2, y: Vector2, origin: Vector2);
    constructor(arg0?: Vector2 | Vector2[] | Transform2D, arg1?: Vector2, arg2?: Vector2) {
        if (arg0 === undefined) {
            this.x = Vector2.RIGHT;
            this.y = Vector2.UP;
            this.origin = Vector2.ZERO;
        } else if (arg0 instanceof Vector2) {
            this.x = arg0;
            this.y = arg1 ?? Vector2.UP;
            this.origin = arg2 ?? Vector2.ZERO;
        } else {
            [this.x, this.y, this.origin] = arg0;
        }
    }

    get [0](): Vector2 {
        return this.x;
    }

    get [1](): Vector2 {
        return this.y;
    }

    get [2](): Vector2 {
        return this.origin;
    }

    *[Symbol.iterator](): IterableIterator<Vector2> {
        yield this.x;
        yield this.y;
        yield this.origin;
    }

    to_matrix3x3(): number[] {
        return [
            ...this.x, 0,
            ...this.y, 0,
            ...this.origin, 1,
        ];
    }

    mul(other: Vector2): Vector2;
    mul(other: Transform2D): Transform2D;
    mul(other: Vector2 | Transform2D): Vector2 | Transform2D {
        if (other instanceof Vector2) {
            return new Vector2(
                this.x.x * other.x + this.y.x * other.y + this.origin.x,
                this.x.y * other.x + this.y.y * other.y + this.origin.y,
            );
        } else {
            return new Transform2D(
                new Vector2(
                    this.x.x * other.x.x + this.y.x * other.x.y,
                    this.x.y * other.x.x + this.y.y * other.x.y,
                ),
                new Vector2(
                    this.x.x * other.y.x + this.y.x * other.y.y,
                    this.x.y * other.y.x + this.y.y * other.y.y,
                ),
                new Vector2(
                    this.x.x * other.origin.x + this.y.x * other.origin.y + this.origin.x,
                    this.x.y * other.origin.x + this.y.y * other.origin.y + this.origin.y,
                ),
            );
        }
    }

    post_translate(pos: Vector2): Transform2D {
        return new Transform2D(this.x, this.y, this.origin.add(pos));
    }

    pre_translate(pos: Vector2): Transform2D {
        return new Transform2D(
            this.x,
            this.y,
            new Vector2(
                this.x.x * pos.x + this.y.x * pos.y + this.origin.x,
                this.x.y * pos.x + this.y.y * pos.y + this.origin.y,
            ),
        );
    }

    post_rotate(angle: number): Transform2D {
        const sx = Math.sin(angle);
        const cx = Math.cos(angle);
        return new Transform2D(
            new Vector2(this.x.x * cx - this.x.y * sx, this.x.x * sx + this.x.y * cx),
            new Vector2(this.y.x * cx - this.y.y * sx, this.y.x * sx + this.y.y * cx),
            new Vector2(this.origin.x * cx - this.origin.y * sx, this.origin.x * sx + this.origin.y * sx),
        );
    }

    pre_rotate(angle: number): Transform2D {
        const sx = Math.sin(angle);
        const cx = Math.cos(angle);
        return new Transform2D(
            new Vector2(this.x.x * cx + this.y.x * sx, this.x.x * sx + this.y.y * sx),
            new Vector2(this.y.x * cx - this.x.x * sx, this.y.y * cx - this.x.y * sx),
            this.origin,
        );
    }

    post_scale(pos: number | Vector2): Transform2D {
        const [sx, sy] = (typeof pos === "number") ? [pos, pos] : pos;

        return new Transform2D(
            new Vector2(this.x.x * sx, this.x.y * sy),
            new Vector2(this.y.x * sx, this.y.y * sy),
            new Vector2(this.origin.x * sx, this.origin.y * sy),
        );
    }

    pre_scale(pos: number | Vector2): Transform2D {
        const [sx, sy] = (typeof pos === "number") ? [pos, pos] : pos;

        return new Transform2D(
            this.x.mul(sx),
            this.y.mul(sy),
            this.origin,
        );
    }

    inverse(): Transform2D {
        const idet = 1 / (this.x.x * this.y.y - this.x.y * this.y.x);
        const v00 = this.y.y * idet;
        const v01 = -this.x.y * idet;
        const v10 = -this.y.x * idet;
        const v11 = this.x.x * idet;

        return new Transform2D(
            new Vector2(v00, v10),
            new Vector2(v10, v11),
            new Vector2(
                -(v00 * this.origin.x + v01 * this.origin.y),
                -(v10 * this.origin.x + v11 * this.origin.y),
            ),
        )
    }
}

export class Transform {
    readonly x: Vector3;
    readonly y: Vector3;
    readonly z: Vector3;
    readonly origin: Vector3;

    static readonly IDENTITY: Transform = new Transform();

    constructor();
    constructor(transform: Vector3[] | Transform);
    constructor(x: Vector3, y: Vector3, z: Vector3, origin: Vector3);
    constructor(arg0?: Vector3 | Vector3[] | Transform, arg1?: Vector3, arg2?: Vector3, arg3?: Vector3) {
        if (arg0 === undefined) {
            this.x = Vector3.RIGHT;
            this.y = Vector3.UP;
            this.z = Vector3.FRONT;
            this.origin = Vector3.ZERO;
        } else if (arg0 instanceof Vector3) {
            this.x = arg0;
            this.y = arg1 ?? Vector3.UP;
            this.z = arg2 ?? Vector3.FRONT;
            this.origin = arg3 ?? Vector3.ZERO;
        } else {
            [this.x, this.y, this.z, this.origin] = arg0;
        }
    }

    get [0](): Vector3 {
        return this.x;
    }

    get [1](): Vector3 {
        return this.y;
    }

    get [2](): Vector3 {
        return this.z;
    }

    get [3](): Vector3 {
        return this.origin;
    }

    *[Symbol.iterator](): IterableIterator<Vector3> {
        yield this.x;
        yield this.y;
        yield this.z;
        yield this.origin;
    }

    to_matrix4x4(): number[] {
        return [
            ...this.x, 0,
            ...this.y, 0,
            ...this.z, 0,
            ...this.origin, 1,
        ];
    }

    to_matrix4x3(): number[] {
        return [
            ...this.x,
            ...this.y,
            ...this.z,
            ...this.origin,
        ];
    }

    get determinant(): number {
        return (
            this.x.x * this.y.y * this.z.z +
            this.x.y * this.y.z * this.z.x +
            this.x.z * this.y.x * this.z.y -
            this.x.x * this.y.z * this.z.y -
            this.x.y * this.y.x * this.z.z -
            this.x.z * this.y.y * this.z.x
        );
    }

    get position(): Vector3 {
        return this.origin;
    }

    get rotation(): Quat {
        let x = this.x;
        let y = this.y;
        let z = this.z;

        y = y.sub(x.mul(x.dot(y)));
        z = z.sub(x.mul(x.dot(z)));
        z = z.sub(y.mul(y.dot(z)));
        x = x.normalize();
        y = y.normalize();
        z = z.normalize();

        const det =
            x.x * y.y * z.z +
            x.y * y.z * z.x +
            x.z * y.x * z.y -
            x.x * y.z * z.y -
            x.y * y.x * z.z -
            x.z * y.y * z.x;
        if (det < 0) {
            x = x.mul(-1);
            y = y.mul(-1);
            z = z.mul(-1);
        }

        const tr = x.x + y.y + z.z;
        if (Math.abs(tr) >= 1e-3) {
            const r = Math.sqrt(1 + tr);
            const s = 0.5 / r;
            return new Quat(0.5 * r, (z.y - y.z) * s, (x.z - z.x) * s, (y.x - x.y) * s);
        } else {
            let q: number[] = [];
            const d = [[...x], [...y], [...z]];
            const i: number = (x.x >= y.y) ? (x.x >= z.z ? 0 : 2) : (y.y >= z.z ? 1 : 2);
            const j: number = (i + 1) % 3;
            const k: number = (j + 1) % 3;
            const r = Math.sqrt(d[i][i] - d[j][j] - d[k][k] + 1);
            const s = 0.5 / r;
            q[0] = (d[k][j] - d[j][k]) * s;
            q[i + 1] = 0.5 * r;
            q[j + 1] = (d[j][i] + d[i][j]) * s;
            q[k + 1] = (d[k][i] + d[i][k]) * s;
            return new Quat(q);
        }
    }

    get scale(): Vector3 {
        const d = Math.sign(this.determinant);
        return new Vector3(
            Math.sqrt(this.x.x * this.x.x + this.y.x * this.y.x + this.z.x + this.z.x) * d,
            Math.sqrt(this.x.y * this.x.y + this.y.y * this.y.y + this.z.y + this.z.y) * d,
            Math.sqrt(this.x.z * this.x.z + this.y.z * this.y.z + this.z.z + this.z.z) * d,
        );
    }

    mul(other: Vector3): Vector3;
    mul(other: Transform): Transform;
    mul(other: Vector3 | Transform): Vector3 | Transform {
        if (other instanceof Vector3) {
            return new Vector3(
                this.x.x * other.x + this.y.x * other.y + this.z.x * other.z + this.origin.x,
                this.x.y * other.x + this.y.y * other.y + this.z.y * other.z + this.origin.y,
                this.x.z * other.x + this.y.z * other.y + this.z.z * other.z + this.origin.z,
            );
        } else {
            return new Transform(
                new Vector3(
                    this.x.x * other.x.x + this.y.x * other.x.y + this.z.x * other.x.z,
                    this.x.y * other.x.x + this.y.y * other.x.y + this.z.y * other.x.z,
                    this.x.z * other.x.x + this.y.z * other.x.y + this.z.z * other.x.z,
                ),
                new Vector3(
                    this.x.x * other.y.x + this.y.x * other.y.y + this.z.x * other.y.z,
                    this.x.y * other.y.x + this.y.y * other.y.y + this.z.y * other.y.z,
                    this.x.z * other.y.x + this.y.z * other.y.y + this.z.z * other.y.z,
                ),
                new Vector3(
                    this.x.x * other.z.x + this.y.x * other.z.y + this.z.x * other.z.z,
                    this.x.y * other.z.x + this.y.y * other.z.y + this.z.y * other.z.z,
                    this.x.z * other.z.x + this.y.z * other.z.y + this.z.z * other.z.z,
                ),
                new Vector3(
                    this.x.x * other.origin.x + this.y.x * other.origin.y + this.z.x * other.origin.z + this.origin.x,
                    this.x.y * other.origin.x + this.y.y * other.origin.y + this.z.y * other.origin.z + this.origin.y,
                    this.x.z * other.origin.x + this.y.z * other.origin.y + this.z.z * other.origin.z + this.origin.z,
                ),
            );
        }
    }

    mul_basis(other: Vector3): Vector3 {
        return new Vector3(
            this.x.x * other.x + this.y.x * other.y + this.z.x * other.z,
            this.x.y * other.x + this.y.y * other.y + this.z.y * other.z,
            this.x.z * other.x + this.y.z * other.y + this.z.z * other.z,
        );
    }

    post_translate(pos: Vector3): Transform {
        return new Transform(this.x, this.y, this.z, this.origin.add(pos));
    }

    pre_translate(pos: Vector3): Transform {
        return new Transform(
            this.x,
            this.y,
            this.z,
            new Vector3(
                this.x.x * pos.x + this.y.x * pos.y + this.origin.x,
                this.x.y * pos.x + this.y.y * pos.y + this.origin.y,
                this.x.z * pos.x + this.y.z * pos.z + this.origin.z,
            ),
        );
    }

    post_rotate(quat: Quat): Transform {
        return quat.to_transform().mul(this);
    }

    pre_rotate(quat: Quat): Transform {
        return this.mul(quat.to_transform());
    }

    post_scale(pos: number | Vector3): Transform {
        const [sx, sy, sz] = (typeof pos === "number") ? [pos, pos, pos] : pos;

        return new Transform(
            new Vector3(this.x.x * sx, this.x.y * sy, this.x.z * sz),
            new Vector3(this.y.x * sx, this.y.y * sy, this.y.z * sz),
            new Vector3(this.z.x * sx, this.z.y * sy, this.z.z * sz),
            new Vector3(this.origin.x * sx, this.origin.y * sy, this.origin.z * sz),
        );
    }

    pre_scale(pos: number | Vector3): Transform {
        const [sx, sy, sz] = (typeof pos === "number") ? [pos, pos, pos] : pos;

        return new Transform(
            this.x.mul(sx),
            this.y.mul(sy),
            this.z.mul(sz),
            this.origin,
        );
    }

    inverse(): Transform {
        let v00 = this.y.y * this.z.z - this.z.y * this.y.z;
        let v01 = this.y.z * this.z.x - this.z.z * this.y.x;
        let v02 = this.y.x * this.z.y - this.z.x * this.y.y;
        let v10 = this.z.y * this.x.z - this.x.y * this.z.z;
        let v11 = this.z.z * this.x.x - this.x.z * this.z.x;
        let v12 = this.z.x * this.x.y - this.x.x * this.z.y;
        let v20 = this.x.y * this.y.z - this.y.y * this.x.z;
        let v21 = this.x.z * this.y.x - this.y.z * this.x.x;
        let v22 = this.x.x * this.y.y - this.y.x * this.x.y;

        const idet = 1 / (this.x.x * v00 + this.y.x * v10 + this.z.x * v20);

        v00 *= idet;
        v01 *= idet;
        v02 *= idet;
        v10 *= idet;
        v11 *= idet;
        v12 *= idet;
        v20 *= idet;
        v21 *= idet;
        v22 *= idet;
        v00 *= idet;
        v01 *= idet;
        v02 *= idet;
        v10 *= idet;
        v11 *= idet;
        v12 *= idet;
        v20 *= idet;
        v21 *= idet;
        v22 *= idet;

        return new Transform(
            new Vector3(v00, v10, v20),
            new Vector3(v01, v11, v21),
            new Vector3(v02, v12, v22),
            new Vector3(
                -(v00 * this.origin.x + v01 * this.origin.y + v02 * this.origin.z),
                -(v10 * this.origin.x + v11 * this.origin.y + v12 * this.origin.z),
                -(v20 * this.origin.x + v21 * this.origin.y + v22 * this.origin.z),
            ),
        );
    }

    orthonormalize(): Transform {
        let x = this.x;
        let y = this.y;
        let z = this.z;

        y = y.sub(x.mul(x.dot(y)));
        z = z.sub(x.mul(x.dot(z)));
        z = z.sub(y.mul(y.dot(z)));
        x = x.normalize();
        y = y.normalize();
        z = z.normalize();

        return new Transform(x, y, z, this.origin);
    }
}

export class Perspective {
    readonly v: Float64Array;

    static readonly IDENTITY: Perspective = new Perspective();

    constructor(v?: ArrayLike<number> | Transform2D | Transform) {
        if (v === undefined) {
            this.v = new Float64Array(16);
            this.v[0] = this.v[5] = this.v[10] = this.v[15] = 1;
        } else if (v instanceof Transform) {
            this.v = new Float64Array([
                ...v.x, 0,
                ...v.y, 0,
                ...v.z, 0,
                ...v.origin, 1,
            ]);
        } else if (v instanceof Transform2D) {
            this.v = new Float64Array([
                ...v.x, 0, 0,
                ...v.y, 0, 0,
                ...v.origin, 1, 0,
                0, 0, 0, 1,
            ]);
        } else {
            this.v = new Float64Array(16);
            this.v.set(v, 0);
        }
    }

    static orthogonal(up: number, down: number, left: number, right: number, near: number, far: number): Perspective {
        const idx = 1 / (right - left);
        const idy = 1 / (up - down);
        const idz = 1 / (far - near);

        return new Perspective([
            2 * idx, 0, 0, 0,
            0, 2 * idy, 0, 0,
            0, 0, -2 * idz, 0,
            -(left + right) * idx, -(up + down) * idy, -(near + far) * idz, 1,
        ]);
    }

    static perspective(fov: number, aspect: number, near: number, far: number): Perspective {
        const f = Math.tan(fov * 0.5);
        const rangeInv = 1 / (near - far);

        return new Perspective([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0,
        ]);
    }

    *[Symbol.iterator](): IterableIterator<number> {
        yield* this.v;
    }

    to_matrix4x4(): number[] {
        return [...this.v];
    }

    mul(other: Transform | Perspective | Transform2D): Perspective;
    mul(other: Vector3): Vector3;
    mul(other: Transform | Perspective | Transform2D | Vector3): Perspective | Vector3 {
        const [v00, v10, v20, v30, v01, v11, v21, v31, v02, v12, v22, v32, v03, v13, v23, v33] = this.v;

        let o00, o01, o02, o03, o10, o11, o12, o13, o20, o21, o22, o23, o30, o31, o32, o33;
        if (other instanceof Vector3) {
            const iw = 1 / (v30 * other.x + v31 * other.y + v32 * other.z + v33);
            return new Vector3(
                (v00 * other.x + v01 * other.y + v02 * other.z + v03) * iw,
                (v10 * other.x + v11 * other.y + v12 * other.z + v13) * iw,
                (v20 * other.x + v21 * other.y + v22 * other.z + v23) * iw,
            );
        } else if (other instanceof Transform) {
            [[o00, o10, o20], [o01, o11, o21], [o02, o12, o22], [o03, o13, o23]] = other;
            o30 = o31 = o32 = 0;
            o33 = 1;
        } else if (other instanceof Transform2D) {
            [[o00, o10], [o01, o11], [o02, o12], [o03, o13]] = other;
            o20 = o21 = o23 = o30 = o31 = o32 = 0;
            o22 = o33 = 1;
        } else {
            [o00, o10, o20, o30, o01, o11, o21, o31, o02, o12, o22, o32, o03, o13, o23, o33] = other.v;
        }

        return new Perspective([
            v00 * o00 + v01 * o10 + v02 * o20 + v03 * o30,
            v10 * o00 + v11 * o10 + v12 * o20 + v13 * o30,
            v20 * o00 + v21 * o10 + v22 * o20 + v23 * o30,
            v30 * o00 + v31 * o10 + v32 * o20 + v33 * o30,
            v00 * o01 + v01 * o11 + v02 * o21 + v03 * o31,
            v10 * o01 + v11 * o11 + v12 * o21 + v13 * o31,
            v20 * o01 + v21 * o11 + v22 * o21 + v23 * o31,
            v30 * o01 + v31 * o11 + v32 * o21 + v33 * o31,
            v00 * o02 + v01 * o12 + v02 * o22 + v03 * o32,
            v10 * o02 + v11 * o12 + v12 * o22 + v13 * o32,
            v20 * o02 + v21 * o12 + v22 * o22 + v23 * o32,
            v30 * o02 + v31 * o12 + v32 * o22 + v33 * o32,
            v00 * o03 + v01 * o13 + v02 * o23 + v03 * o33,
            v10 * o03 + v11 * o13 + v12 * o23 + v13 * o33,
            v20 * o03 + v21 * o13 + v22 * o23 + v23 * o33,
            v30 * o03 + v31 * o13 + v32 * o23 + v33 * o33,
        ]);
    }

    transpose(): Perspective {
        const [v00, v10, v20, v30, v01, v11, v21, v31, v02, v12, v22, v32, v03, v13, v23, v33] = this.v;

        return new Perspective([
            v00, v01, v02, v03,
            v10, v11, v12, v13,
            v20, v21, v22, v23,
            v30, v31, v32, v33,
        ]);
    }
}
