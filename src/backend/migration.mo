import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type OldUserProfile = {
    name : Text;
    profilePicture : ?Storage.ExternalBlob;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewUserProfile = {
    displayName : Text;
    profilePicture : ?Storage.ExternalBlob;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_id, oldUserProfile) {
        { oldUserProfile with displayName = oldUserProfile.name };
      }
    );
    { userProfiles = newUserProfiles };
  };
};
