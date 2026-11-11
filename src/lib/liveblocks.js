'use client';
import { createClient } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';

const client = createClient({ authEndpoint: '/api/liveblocks-auth' });

// presence: { dir: string|null, taskId: string|null } — foydalanuvchi hozir qaysi
// yo'nalish/vazifa ustida turganini bildiradi (Google Sheets'dagi tanlangan katak kabi)
export const {
  RoomProvider,
  useOthers,
  useUpdateMyPresence,
  useStatus,
} = createRoomContext(client);

export const ROOM_ID = 'transformatsiya-mindmap';

export const PRESENCE_COLORS = ['#2F6FD6', '#E0A526', '#2E9E5B', '#D64545', '#8E5FD6', '#19A3A3'];
export const colorFor = connectionId => PRESENCE_COLORS[connectionId % PRESENCE_COLORS.length];
