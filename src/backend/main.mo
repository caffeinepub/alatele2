import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

(with migration = Migration.run)
actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type UserProfile = {
    displayName : Text;
    profilePicture : ?Storage.ExternalBlob;
  };

  type Message = {
    id : Nat;
    sender : Principal;
    recipient : ?Principal; // null means public message
    content : Text;
    timestamp : Time.Time;
  };

  var nextMessageId = 0;
  let messages = Map.empty<Nat, Message>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  module Message {
    public func compareByTimestamp(message1 : Message, message2 : Message) : Order.Order {
      Int.compare(message1.timestamp, message2.timestamp);
    };
  };

  //////////////////////////
  // PROFILE MANAGEMENT
  //////////////////////////

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  //////////////////////////
  // MESSAGING
  //////////////////////////
  public shared ({ caller }) func sendMessage(content : Text, recipient : ?Principal) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    let message : Message = {
      id = nextMessageId;
      content;
      sender = caller;
      recipient;
      timestamp = Time.now();
    };
    messages.add(nextMessageId, message);
    nextMessageId += 1;
    message.id;
  };

  public query ({ caller }) func getPublicMessages() : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    let filtered = messages.filter(
      func(_id, message) {
        switch (message.recipient) {
          case (null) { true };
          case (_) { false };
        };
      }
    );
    filtered.values().toArray().sort(Message.compareByTimestamp);
  };

  public query ({ caller }) func getPrivateMessages(withUser : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    let filtered = messages.filter(
      func(_id, message) {
        switch (message.recipient) {
          case (?recipient) {
            (message.sender == caller and recipient == withUser) or
            (message.sender == withUser and recipient == caller)
          };
          case (null) { false };
        };
      }
    );
    filtered.values().toArray().sort(Message.compareByTimestamp);
  };

  public query ({ caller }) func getAllMessagesForCaller() : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    let filtered = messages.filter(
      func(_id, message) {
        message.sender == caller or message.recipient == ?caller or message.recipient == null
      }
    );
    filtered.values().toArray().sort(Message.compareByTimestamp);
  };
};
