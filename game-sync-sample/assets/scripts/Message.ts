import {Label, Node, Vec3} from "cc";

export class Message {
    from: Vec3 = null;
    id:number = 0;
    move:number = 0;

    apply(pos: Vec3) {
        pos.x = Math.max(Math.min(pos.x + this.move, 400), -400);
        return pos
    }
}

