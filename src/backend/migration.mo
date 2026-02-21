import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";
import Time "mo:core/Time";

module {
  type OldMessage = {
    id : Nat;
    sender : Text;
    content : Text;
    timestamp : Time.Time;
  };

  type OldActor = {
    nextMessageId : Nat;
    messagesStore : Map.Map<Nat, OldMessage>;
  };

  type NewMessage = {
    id : Nat;
    sender : Text;
    content : Text;
    image : ?Storage.ExternalBlob;
    video : ?Storage.ExternalBlob;
    timestamp : Time.Time;
  };

  type NewActor = {
    nextMessageId : Nat;
    messagesStore : Map.Map<Nat, NewMessage>;
  };

  public func run(old : OldActor) : NewActor {
    let messagesStore = old.messagesStore.map<Nat, OldMessage, NewMessage>(
      func(_id, old) {
        { old with image = null; video = null };
      }
    );
    { old with messagesStore };
  };
};
