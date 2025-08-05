/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  codeSourceUrl: string;
  order: number;
  moduleId: string;
  createdAt: string;
  updatedAt: string;
}



// WebSocket event types
export type NotificationEvent =
  | { type: 'notification:new'; notification: AdminNotification }
  | { type: 'notification:read'; id: string }
  | { type: 'notification:delete'; id: string };
