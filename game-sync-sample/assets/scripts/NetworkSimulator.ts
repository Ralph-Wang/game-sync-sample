import { Component, _decorator } from "cc";
import { Message } from "./Message";
const { ccclass, property } = _decorator;

@ccclass("NetworkSimulator")
export class NetworkSimulator extends Component {
    msgs: Array<Message> = [];

    send(data: Message, lag: number) {
        setTimeout(() => {
            this.msgs.push(data);
        }, lag)
    }

    receive() {
        return this.msgs.shift();
    }

    isEmpty() {
        return this.msgs.length === 0;
    }
}
