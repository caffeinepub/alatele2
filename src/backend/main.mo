import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  type Message = {
    content : Text;
    id : Nat;
    image : ?Storage.ExternalBlob;
    video : ?Storage.ExternalBlob;
    audio : ?Storage.ExternalBlob;
    sender : Text;
    timestamp : Time.Time;
  };

  type MessageInput = {
    content : Text;
    image : ?Storage.ExternalBlob;
    video : ?Storage.ExternalBlob;
    audio : ?Storage.ExternalBlob;
    sender : Text;
  };

  type Role = {
    #admin;
    #guest;
  };

  module Message {
    public func compareByTimestamp(message1 : Message, message2 : Message) : Order.Order {
      Int.compare(message1.timestamp, message2.timestamp);
    };
  };

  var nextMessageId = 0;
  let messagesStore = Map.empty<Nat, Message>();

  public shared ({ caller }) func sendMessage(data : MessageInput) : async Nat {
    let timestamp = Time.now();
    let message : Message = {
      id = nextMessageId;
      timestamp;
      sender = data.sender;
      content = data.content;
      image = data.image;
      video = data.video;
      audio = data.audio;
    };
    messagesStore.add(nextMessageId, message);
    let currentId = nextMessageId;
    nextMessageId += 1;
    currentId;
  };

  // Internal role check function
  func checkAdminRole(role : Role) : () {
    switch (role) {
      case (#guest) { Runtime.trap("Unauthorized: Only admin can perform this action") };
      case (#admin) { () };
    };
  };

  public shared ({ caller }) func editMessage(id : Nat, newContent : Text, role : Role) : async () {
    checkAdminRole(role);
    switch (messagesStore.get(id)) {
      case (null) { Runtime.trap("Message not found") };
      case (?message) {
        let updatedMessage = {
          message with content = newContent;
        };
        messagesStore.add(id, updatedMessage);
      };
    };
  };

  public shared ({ caller }) func deleteMessage(id : Nat, role : Role) : async () {
    checkAdminRole(role);
    if (not messagesStore.containsKey(id)) {
      Runtime.trap("Message not found");
    };
    messagesStore.remove(id);
  };

  public query ({ caller }) func getMessagesBySender(sender : Text) : async [Message] {
    let filtered = messagesStore.filter(
      func(_id, message) { message.sender == sender }
    );
    filtered.values().toArray();
  };

  public query ({ caller }) func getAllMessages() : async [Message] {
    messagesStore.values().toArray().sort(Message.compareByTimestamp);
  };

  public query ({ caller }) func getMessageById(id : Nat) : async Message {
    switch (messagesStore.get(id)) {
      case (?message) { message };
      case (null) { Runtime.trap("Message not found") };
    };
  };

  // Admin authentication function
  public shared ({ caller }) func authenticateAdmin(username : Text, password : Text) : async Bool {
    username == "Negin" and password == "Negin-Kish";
  };
};
