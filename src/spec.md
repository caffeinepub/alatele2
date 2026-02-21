# Specification

## Summary
**Goal:** Rename the application to "Alatele" and add message editing and deletion capabilities for users.

**Planned changes:**
- Update application name from "Alatele2" to "Alatele" in the header and all UI references
- Add delete button to messages allowing users to remove their own messages
- Add edit button to messages allowing users to modify their own message content
- Extend backend message model to include unique message IDs
- Implement backend functions for deleting and editing messages by ID with sender validation
- Create React Query hooks for delete and edit operations with automatic cache refresh

**User-visible outcome:** Users can edit or delete their own messages in the chat, and the application displays "Alatele" as its name throughout the interface.
