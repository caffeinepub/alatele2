import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    id: bigint;
    content: string;
    sender: string;
    timestamp: Time;
}
export type Time = bigint;
export interface backendInterface {
    deleteMessage(id: bigint): Promise<void>;
    editMessage(id: bigint, newContent: string): Promise<void>;
    getAllMessages(): Promise<Array<Message>>;
    getMessageById(id: bigint): Promise<Message>;
    getMessagesBySender(sender: string): Promise<Array<Message>>;
    sendMessage(sender: string, content: string): Promise<void>;
}
