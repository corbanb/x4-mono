export type CursorPosition = { x: number; y: number };
export type UserMeta = { id: string; info: { name: string; avatar: string; color: string } };
export type Presence = { cursor: CursorPosition | null };
