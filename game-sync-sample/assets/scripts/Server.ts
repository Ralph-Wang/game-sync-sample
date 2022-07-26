import { _decorator, Component, Node, EditBox, Label, Vec3 } from 'cc';
import { Message } from './Message';
import { NetworkSimulator } from './NetworkSimulator';
const { ccclass, property } = _decorator;

@ccclass('Server')
export class Server extends Component {
    @property(NetworkSimulator)
    net: NetworkSimulator = null;
    fps: number = 0;
    updateDt: number = 0;
    currentDt: number = 0;

    @property(EditBox)
    fpsBox: EditBox = null;

    @property(EditBox)
    lagBox: EditBox = null;

    @property(Node)
    ball: Node = null;

    @property(Label)
    inputN: Label = null;

    @property([NetworkSimulator])
    clients: Array<NetworkSimulator> = [];

    start() {
        this.updateFps();
        this.currentDt = 0;
    }

    update(dt: number) {
        if (this.currentDt >= this.updateDt) {
            let lastId:number = parseInt(this.inputN.string);
            let lastPos:Vec3 = this.ball.getPosition();
            while (!this.net.isEmpty()) {
                let msg: Message = this.net.receive();
                lastId = msg.id;
                msg.from = lastPos.clone();
                lastPos = msg.apply(lastPos);
                this.clients.forEach(client => {
                    client.send(msg);
                });
            }
            this.inputN.string = lastId.toString();
            this.ball.setPosition(lastPos);
            this.currentDt = 0;
        } else {
            this.currentDt += dt;
        }
    }

    updateFps() {
        this.fps = parseInt(this.fpsBox.string);
        this.updateDt = 1 / this.fps;
    }

    updateLag() {
        this.net.lag = parseInt(this.lagBox.string);
    }

    reset() {
        this.ball.setPosition(0, 0)
    }
}

