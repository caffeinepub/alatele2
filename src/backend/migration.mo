import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";

module {
  type OldMessage = {
    content : Text;
    id : Nat;
    image : ?Storage.ExternalBlob;
    video : ?Storage.ExternalBlob;
    sender : Text;
    timestamp : Int;
  };

  type OldActor = {
    messagesStore : Map.Map<Nat, OldMessage>;
    nextMessageId : Nat;
  };

  type NewMessage = {
    content : Text;
    id : Nat;
    image : ?Storage.ExternalBlob;
    video : ?Storage.ExternalBlob;
    audio : ?Storage.ExternalBlob;
    sender : Text;
    timestamp : Int;
  };

  type NewActor = {
    messagesStore : Map.Map<Nat, NewMessage>;
    nextMessageId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newMessagesStore = old.messagesStore.map<Nat, OldMessage, NewMessage>(
      func(_id, oldMessage) {
        {
          oldMessage with
          audio = null
        };
      }
    );
    {
      old with
      messagesStore = newMessagesStore : Map.Map<Nat, NewMessage>;
    };
  };
};
