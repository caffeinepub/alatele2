# Specification

## Summary
**Goal:** Remove profile picture upload requirement from the login flow.

**Planned changes:**
- Remove ProfilePictureUpload component from LoginPage.tsx
- Update backend createProfile method to accept profiles without profile pictures
- Modify frontend profile creation mutation to omit profilePicture data

**User-visible outcome:** Users can complete login by entering only their display name, without needing to upload a profile picture.
