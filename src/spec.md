# Specification

## Summary
**Goal:** Add dual login system with admin/guest authentication and audio messaging capability.

**Planned changes:**
- Create dual-section login page with Admin Login (username/password/optional display name) and Guest Login sections
- Implement admin authentication in backend that validates only username 'Negin' and password 'Negin-Kish'
- Add guest authentication flow that redirects to username selection without password requirement
- Store user role (admin or guest) in session to control UI permissions
- Add audio message recording capability with microphone access for all users
- Extend backend message storage to support audio blob type alongside existing image and video types
- Display audio messages with playback controls in message list
- Restrict edit and delete functionality for all message types to admin users only
- Update App.tsx to replace simple username check with dual login page as entry point

**User-visible outcome:** Users can log in as either admin (with credentials) or guest (username only), send text/image/video/audio messages, and admins can edit/delete any message while guests can only send messages.
