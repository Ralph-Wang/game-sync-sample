import { _decorator, Component, Node, EditBox, Vec3, Label, tween, Toggle} from 'cc';
import { Message } from './Message';
import { NetworkSimulator } from './NetworkSimulator';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    step: number = 2;
    unsubmitMsgs: Array<Message> = [];
    executedUnauthMsgs: Array<Message> = [];

    @property(Toggle)
    interpolation: Toggle = null;

    @property(Toggle)
    reconcile: Toggle = null;

    @property(Toggle)
    prediction: Toggle = null;

    @property(Label)
    unsubmitMsgsCount: Label = null;

    @property(NetworkSimulator)
    net: NetworkSimulator = null;

    @property(Node)
    ball: Node = null;

    @property(EditBox)
    lagBox: EditBox = null;

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

    onLoad() {
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
        // 逻辑层
        if (this.currentDt >= this.updateDt) {
            while (this.unsubmitMsgs.length !== 0) {
                this.server.send(this.unsubmitMsgs.shift());
            }
            this.currentDt = 0;
            this.updateUnsubmitMsgsCount();
        } else {
            this.currentDt += dt;
        }

        // 表现层
        if (this.interpolation.isChecked) {
            if (!this.net.isEmpty()) {
                let msg: Message = this.net.receive();
                this.executeMsg(msg);
            }
        } else {
            while (!this.net.isEmpty()) {
                let msg: Message = this.net.receive();
                this.executeMsg(msg);
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
        this.net.lag = parseInt(this.lagBox.string)
        if (this.server != null) {
            this.server.lag = parseInt(this.lagBox.string)
        }
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
        msg.id = this.moveIndex;
        msg.move = move;
        this.unsubmitMsgs.push(msg)
        this.updateUnsubmitMsgsCount();
        if (this.prediction.isChecked) {
            this.executeMsg(msg);
            if (this.reconcile.isChecked) {
                this.executedUnauthMsgs.push(msg);
            }
        }
        this.moveIndex++;
    }

    executeMsg(msg: Message) {
        if (this.reconcile.isChecked && this.executedUnauthMsgs.length > 0) {
            // 因为这个 demo 没有冲突情况，所以这里可以直接舍弃已执行的消息即可
            // 真实的多人游戏还要解决预测和权威冲突的问题
            if (msg.id < this.executedUnauthMsgs[0].id) {
                return;
            } else if (msg.id === this.executedUnauthMsgs[0].id) {
                this.executedUnauthMsgs.shift();
                return;
            }
        }
        let lastPos = this.ball.getPosition();
        // reset server position
        if (msg.from !== null) {
            if (msg.from.x !== lastPos.x) {
                lastPos = msg.from;
            }
        }
        lastPos = msg.apply(lastPos)
        this.ball.setPosition(lastPos);
    }

    reset() {
        this.ball.setPosition(0, 0)
    }
}

