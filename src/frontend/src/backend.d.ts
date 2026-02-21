import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Message {
    id: bigint;
    content: string;
    audio?: ExternalBlob;
    video?: ExternalBlob;
    sender: string;
    timestamp: Time;
    image?: ExternalBlob;
}
export interface MessageInput {
    content: string;
    audio?: ExternalBlob;
    video?: ExternalBlob;
    sender: string;
    image?: ExternalBlob;
}
export enum Role {
    admin = "admin",
    guest = "guest"
}
export interface backendInterface {
    authenticateAdmin(username: string, password: string): Promise<boolean>;
    deleteMessage(id: bigint, role: Role): Promise<void>;
    editMessage(id: bigint, newContent: string, role: Role): Promise<void>;
    getAllMessages(): Promise<Array<Message>>;
    getMessageById(id: bigint): Promise<Message>;
    getMessagesBySender(sender: string): Promise<Array<Message>>;
    sendMessage(data: MessageInput): Promise<bigint>;
}
