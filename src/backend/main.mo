import Time "mo:core/Time";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Migration "migration";

(with migration = Migration.run)
actor {
  type Message = {
    id : Nat;
    sender : Text;
    content : Text;
    timestamp : Time.Time;
  };

  module Message {
    public func compareByTimestamp(message1 : Message, message2 : Message) : Order.Order {
      Int.compare(message1.timestamp, message2.timestamp);
    };
  };

  var nextMessageId = 0;
  let messagesStore = Map.empty<Nat, Message>();

  public shared ({ caller }) func sendMessage(sender : Text, content : Text) : async () {
    let timestamp = Time.now();
    let message : Message = {
      id = nextMessageId;
      sender;
      content;
      timestamp;
    };
    messagesStore.add(nextMessageId, message);
    nextMessageId += 1;
  };

  public shared ({ caller }) func editMessage(id : Nat, newContent : Text) : async () {
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

  public shared ({ caller }) func deleteMessage(id : Nat) : async () {
    if (not messagesStore.containsKey(id)) {
      Runtime.trap("Message not found");
    };
    messagesStore.remove(id);
  };

  public query ({ caller }) func getMessagesBySender(sender : Text) : async [Message] {
    messagesStore.values().toArray().filter(
      func(msg) { msg.sender == sender }
    );
  };

  public query ({ caller }) func getAllMessages() : async [Message] {
    messagesStore.values().toArray().sort(Message.compareByTimestamp);
  };

  public query ({ caller }) func getMessageById(id : Nat) : async Message {
    switch (messagesStore.get(id)) {
      case (null) { Runtime.trap("Message not found") };
      case (?message) { message };
    };
  };
};
