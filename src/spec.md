# Specification

## Summary
**Goal:** Simplify authentication by removing passwords and implementing username-only login with admin display name support.

**Planned changes:**
- Remove password field from login page - users authenticate with username only
- Allow guests to login with any username except 'Alaie' (reserved for admin)
- Restrict admin access to username 'Alaie' only
- Add Display Name input field on login page that appears only when username is 'Alaie'
- Display admin's chosen Display Name (instead of 'Alaie') in chat messages, profile, and conversation list

**User-visible outcome:** Users can log in with just a username. Guests use any name except 'Alaie'. Admins login as 'Alaie' and can optionally set a display name during login, which appears throughout the chat interface instead of their username.
