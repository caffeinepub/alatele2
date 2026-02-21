# Specification

## Summary
**Goal:** Add image and video sending capabilities to the Alatele messenger application.

**Planned changes:**
- Extend backend Message type to support optional image and video file data fields
- Update send message API to accept and store image and video uploads
- Add file upload controls to MessageInput component for selecting images and videos
- Display embedded images and videos with playback controls in MessageList component
- Update useMessages hooks to handle image and video data in all operations

**User-visible outcome:** Users can attach and send images and videos in their messages, see media content inline in conversations, and play videos directly in the chat interface.
