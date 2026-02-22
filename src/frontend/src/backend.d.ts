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
    file?: ExternalBlob;
    recipient?: Principal;
    sender: Principal;
    timestamp: Time;
    image?: ExternalBlob;
}
export interface MessageInput {
    content: string;
    audio?: ExternalBlob;
    video?: ExternalBlob;
    file?: ExternalBlob;
    image?: ExternalBlob;
}
export interface UserProfile {
    displayName?: string;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addContact(newContact: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    authenticateAdmin(username: string): Promise<boolean>;
    authenticateGuest(username: string): Promise<boolean>;
    deleteMessageFile(messageId: bigint): Promise<void>;
    editMessageFile(messageId: bigint, newFile: ExternalBlob | null): Promise<void>;
    getAllMessagesForCaller(): Promise<Array<Message>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContacts(): Promise<Array<Principal>>;
    getPrivateMessages(withUser: Principal): Promise<Array<Message>>;
    getPublicMessages(): Promise<Array<Message>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(content: string, recipient: Principal | null): Promise<bigint>;
    sendMessageWithMedia(input: MessageInput, recipient: Principal | null): Promise<bigint>;
}
