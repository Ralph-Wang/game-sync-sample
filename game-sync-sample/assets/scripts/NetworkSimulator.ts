import { Component, _decorator } from "cc";
import { Message } from "./Message";
const { ccclass, property } = _decorator;

@ccclass("NetworkSimulator")
export class NetworkSimulator extends Component {
    msgs: Array<Message> = [];
    lag: number = 0;

    send(data: Message) {
        setTimeout(() => {
            this.msgs.push(data);
        }, this.lag)
    }

    receive() {
        return this.msgs.shift();
    }

    isEmpty() {
        return this.msgs.length === 0;
    }
}
