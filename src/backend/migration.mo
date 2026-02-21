import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {
  type OldMessage = {
    sender : Text;
    content : Text;
    timestamp : Time.Time;
  };

  type OldActor = {
    messagesStore : Map.Map<Text, OldMessage>;
  };

  type NewMessage = {
    id : Nat;
    sender : Text;
    content : Text;
    timestamp : Time.Time;
  };

  type NewActor = {
    nextMessageId : Nat;
    messagesStore : Map.Map<Nat, NewMessage>;
  };

  public func run(old : OldActor) : NewActor {
    let newMessagesStore = Map.empty<Nat, NewMessage>();
    var currentId = 0;

    for ((timestamp, oldMessage) in old.messagesStore.entries()) {
      let newMessage : NewMessage = {
        id = currentId;
        sender = oldMessage.sender;
        content = oldMessage.content;
        timestamp = oldMessage.timestamp;
      };

      newMessagesStore.add(currentId, newMessage);
      currentId += 1;
    };

    { nextMessageId = currentId; messagesStore = newMessagesStore };
  };
};
