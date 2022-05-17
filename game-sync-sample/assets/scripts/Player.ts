import { _decorator, Component, Node, EditBox, Vec3, Label, tween, Toggle} from 'cc';
import { Message } from './Message';
import { NetworkSimulator } from './NetworkSimulator';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    step: number = 1;
    unsubmitMsgs: Array<Message> = [];

    @property(Toggle)
    interpolation: Toggle = null;

    @property(Label)
    unsubmitMsgsCount: Label = null;

    @property(NetworkSimulator)
    net: NetworkSimulator = null;

    @property(Node)
    ball: Node = null;

    @property(EditBox)
    lagBox: EditBox = null;
    lag: number = 0;

    fps: number = 15;
    updateDt: number = 1 / this.fps;
    currentDt: number = 0;

    @property(Node)
    left: Node = null;

    @property(Node)
    right: Node = null;

    @property(NetworkSimulator)
    server: NetworkSimulator = null;

    moveIndex = 0;
    state = "stop";

    start() {
        this.updateLag();
        this.updateDt = 1 / this.fps;
        this.moveIndex = 0;
        if (this.left !== null) {
            this.left.on(Node.EventType.TOUCH_START, () => {
                this.state = "move_left"
            })
            this.left.on(Node.EventType.TOUCH_END, () => {
                this.state = "stop"
            })
            this.left.on(Node.EventType.TOUCH_CANCEL, () => {
                this.state = "stop"
            })
        }
        if (this.right !== null) {
            this.right.on(Node.EventType.TOUCH_START, () => {
                this.state = "move_right"
            })
            this.right.on(Node.EventType.TOUCH_END, () => {
                this.state = "stop"
            })
            this.right.on(Node.EventType.TOUCH_CANCEL, () => {
                this.state = "stop"
            })
        }
    }

    update(dt: number) {
        if (this.currentDt >= this.updateDt) {
            while (this.unsubmitMsgs.length !== 0) {
                this.server.send(this.unsubmitMsgs.shift(), this.lag);
            }
            this.currentDt = 0;
            this.updateUnsubmitMsgsCount();
        } else {
            this.currentDt += dt;
        }
        let lastPos: Vec3 = this.ball.getPosition();
        if (this.interpolation.isChecked) {
            if (!this.net.isEmpty()) {
                let msg: Message = this.net.receive();
                lastPos = msg.apply(lastPos)
                this.ball.setPosition(lastPos);
            }
        } else {
            while (!this.net.isEmpty()) {
                let msg: Message = this.net.receive();
                lastPos = msg.apply(lastPos)
                this.ball.setPosition(lastPos);
            }
        }
        switch (this.state) {
            case "move_left":
                this.moveLeft()
                break;
            case "move_right":
                this.moveRight()
                break;
        }
    }

    updateLag() {
        this.lag = parseInt(this.lagBox.string)
    }

    updateUnsubmitMsgsCount() {
        if (this.unsubmitMsgsCount === null) {
            return;
        }
        this.unsubmitMsgsCount.string = this.unsubmitMsgs.length.toString();
    }

    moveLeft() {
        this.sendMove(-this.step);
    }

    moveRight() {
        this.sendMove(this.step);
    }

    sendMove(move: number) {
        let msg = new Message();
        msg.id = "#" + this.moveIndex;
        msg.move = move;
        this.unsubmitMsgs.push(msg)
        this.updateUnsubmitMsgsCount();
        this.moveIndex++;
    }
}

