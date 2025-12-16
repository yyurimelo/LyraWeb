
export const API_ENDPOINTS = {
  AUTH: {
    AUTHENTICATE: "/api/auth",
    GOOGLE_AUTHENTICATE: "/api/auth/google",
    GET_LOGGED_USER: "/api/auth/me",
  },
  USER: {
    CREATE: "/api/user/create",
    GET_ALL_FRIENDS: "/api/user/get/all/friends",
    UPDATE: "/api/user/update",
    GET: (id: string) => `/api/user/get/${id}`,
  },
  MESSAGE: {
    SEND: "/api/message/send",
    GET_MESSAGES_WITH_USER: "/api/message/get/all",
    HUB: "/api/hub/message"
  },
} as const;