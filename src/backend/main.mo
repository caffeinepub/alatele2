import Map "mo:core/Map";
import Set "mo:core/Set";
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
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinStorage();
  include MixinAuthorization(accessControlState);

  // Types
  public type UserProfile = {
    displayName : ?Text;
    name : Text;
  };

  type Message = {
    id : Nat;
    sender : Principal;
    recipient : ?Principal; // null means public message
    content : Text;
    timestamp : Time.Time;
    image : ?Storage.ExternalBlob;
    video : ?Storage.ExternalBlob;
    audio : ?Storage.ExternalBlob;
    file : ?Storage.ExternalBlob;
  };

  type MessageInput = {
    content : Text;
    image : ?Storage.ExternalBlob;
    video : ?Storage.ExternalBlob;
    audio : ?Storage.ExternalBlob;
    file : ?Storage.ExternalBlob;
  };

  // State
  var nextMessageId = 0;
  let messages = Map.empty<Nat, Message>();
  let adminContacts = Map.empty<Principal, Set.Set<Principal>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let usernames = Map.empty<Principal, Text>();
  var adminPrincipal : ?Principal = null;

  module Message {
    public func compareByTimestamp(message1 : Message, message2 : Message) : Order.Order {
      Int.compare(message1.timestamp, message2.timestamp);
    };
  };

  func isContact(admin : Principal, contact : Principal) : Bool {
    switch (adminContacts.get(admin)) {
      case (?contacts) { contacts.contains(contact) };
      case (null) { false };
    };
  };

  func hasContactRelationship(user1 : Principal, user2 : Principal) : Bool {
    isContact(user1, user2) or isContact(user2, user1);
  };

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

  public shared ({ caller }) func authenticateAdmin(username : Text) : async Bool {
    // Only allow 'Alaie' username for admin authentication
    if (username != "Alaie") {
      return false;
    };

    // Check if admin is already registered
    switch (adminPrincipal) {
      case (?existingAdmin) {
        // Admin already exists - only that principal can authenticate as admin
        if (caller != existingAdmin) {
          Runtime.trap("Unauthorized: Admin username 'Alaie' is reserved");
        };
        AccessControl.assignRole(accessControlState, caller, caller, #admin);
        usernames.add(caller, username);
        return true;
      };
      case (null) {
        // First time admin registration - register this principal as the admin
        adminPrincipal := ?caller;
        AccessControl.assignRole(accessControlState, caller, caller, #admin);
        usernames.add(caller, username);
        return true;
      };
    };
  };

  public shared ({ caller }) func authenticateGuest(username : Text) : async Bool {
    // Prevent guests from using the reserved admin username
    if (username == "Alaie") {
      Runtime.trap("Unauthorized: Username 'Alaie' is reserved for admin only");
    };

    // Check if username is already taken by another principal
    for ((principal, existingUsername) in usernames.entries()) {
      if (existingUsername == username and principal != caller) {
        Runtime.trap("Username already taken");
      };
    };

    // Assign user role (guests get user role to interact with the system)
    AccessControl.assignRole(accessControlState, caller, caller, #user);
    usernames.add(caller, username);
    true;
  };

  public query ({ caller }) func getContacts() : async [Principal] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view contacts");
    };
    switch (adminContacts.get(caller)) {
      case (?contacts) { contacts.toArray() };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func sendMessage(content : Text, recipient : ?Principal) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be a registered user");
    };

    switch (recipient) {
      case (?recipientPrincipal) {
        let callerIsAdmin = AccessControl.isAdmin(accessControlState, caller);
        let recipientRole = AccessControl.getUserRole(accessControlState, recipientPrincipal);
        
        if (callerIsAdmin) {
          if (not isContact(caller, recipientPrincipal)) {
            Runtime.trap("Unauthorized: Recipient is not in your contacts");
          };
        } else {
          if (recipientRole != #admin) {
            Runtime.trap("Unauthorized: Guests can only message admins");
          };
          if (not isContact(recipientPrincipal, caller)) {
            Runtime.trap("Unauthorized: You can only message admins who added you as a contact");
          };
        };
      };
      case (null) { };
    };

    let message : Message = {
      id = nextMessageId;
      content;
      sender = caller;
      recipient;
      timestamp = Time.now();
      image = null;
      video = null;
      audio = null;
      file = null;
    };
    messages.add(nextMessageId, message);
    nextMessageId += 1;
    message.id;
  };

  public shared ({ caller }) func sendMessageWithMedia(input : MessageInput, recipient : ?Principal) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be a registered user");
    };

    switch (recipient) {
      case (?recipientPrincipal) {
        let callerIsAdmin = AccessControl.isAdmin(accessControlState, caller);
        let recipientRole = AccessControl.getUserRole(accessControlState, recipientPrincipal);
        
        if (callerIsAdmin) {
          if (not isContact(caller, recipientPrincipal)) {
            Runtime.trap("Unauthorized: Recipient is not in your contacts");
          };
        } else {
          if (recipientRole != #admin) {
            Runtime.trap("Unauthorized: Guests can only message admins");
          };
          if (not isContact(recipientPrincipal, caller)) {
            Runtime.trap("Unauthorized: You can only message admins who added you as a contact");
          };
        };
      };
      case (null) { };
    };

    let message : Message = {
      id = nextMessageId;
      content = input.content;
      sender = caller;
      recipient;
      timestamp = Time.now();
      image = input.image;
      video = input.video;
      audio = input.audio;
      file = input.file;
    };
    messages.add(message.id, message);
    nextMessageId += 1;
    message.id;
  };

  public shared ({ caller }) func editMessageFile(messageId : Nat, newFile : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can edit message files");
    };

    switch (messages.get(messageId)) {
      case (?message) {
        let updatedMessage = {
          message with file = newFile
        };
        messages.add(messageId, updatedMessage);
      };
      case (null) {
        Runtime.trap("Message not found");
      };
    };
  };

  public shared ({ caller }) func deleteMessageFile(messageId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete message files");
    };

    switch (messages.get(messageId)) {
      case (?message) {
        let updatedMessage = { message with file = null };
        messages.add(messageId, updatedMessage);
      };
      case (null) {
        Runtime.trap("Message not found");
      };
    };
  };

  public query ({ caller }) func getPublicMessages() : async [Message] {
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
      Runtime.trap("Unauthorized: You must be authenticated");
    };

    if (not hasContactRelationship(caller, withUser)) {
      Runtime.trap("Unauthorized: No contact relationship exists with this user");
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
      Runtime.trap("Unauthorized: You must be authenticated");
    };

    let filtered = messages.filter(
      func(_id, message) {
        message.sender == caller or message.recipient == ?caller or message.recipient == null
      }
    );
    filtered.values().toArray().sort(Message.compareByTimestamp);
  };

  public shared ({ caller }) func addContact(newContact : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add contacts");
    };

    let contactRole = AccessControl.getUserRole(accessControlState, newContact);
    if (contactRole == #admin) {
      Runtime.trap("Cannot add admins as contacts");
    };

    switch (adminContacts.get(caller)) {
      case (?contacts) {
        contacts.add(newContact);
      };
      case (null) {
        let newSet = Set.singleton(newContact);
        adminContacts.add(caller, newSet);
      };
    };
  };
};
