import Map "mo:core/Map";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import Text "mo:core/Text";

module {
  type UserProfile = {
    displayName : ?Text;
    name : Text;
  };

  type Message = {
    id : Nat;
    sender : Principal;
    recipient : ?Principal;
    content : Text;
    timestamp : Time.Time;
    image : ?Storage.ExternalBlob;
    video : ?Storage.ExternalBlob;
    audio : ?Storage.ExternalBlob;
    file : ?Storage.ExternalBlob;
  };

  type OldActor = {
    nextMessageId : Nat;
    messages : Map.Map<Nat, Message>;
    adminContacts : Map.Map<Principal, Set.Set<Principal>>;
    userProfiles : Map.Map<Principal, UserProfile>;
    accessControlState : AccessControl.AccessControlState;
  };

  type NewActor = {
    nextMessageId : Nat;
    messages : Map.Map<Nat, Message>;
    adminContacts : Map.Map<Principal, Set.Set<Principal>>;
    userProfiles : Map.Map<Principal, UserProfile>;
    accessControlState : AccessControl.AccessControlState;
    usernames : Map.Map<Principal, Text>;
    adminPrincipal : ?Principal;
  };

  public func run(old : OldActor) : NewActor {
    {
      nextMessageId = old.nextMessageId;
      messages = old.messages;
      adminContacts = old.adminContacts;
      userProfiles = old.userProfiles;
      accessControlState = old.accessControlState;
      usernames = Map.empty<Principal, Text>();
      adminPrincipal = null;
    };
  };
};
