
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
    GET_PUBLIC: (userIdentifier: string) => `/api/user/get/public/${userIdentifier}`,
    SEARCH: "/api/user/get/search",
    REMOVE: "/api/user/remove/friend"
  },
  MESSAGE: {
    SEND: "/api/message/send",
    GET_MESSAGES_WITH_USER: "/api/message/get/all",
    HUB: "/api/hub/message"
  },
  NOTIFICATION: {
    GET_ALL_PAGINATED: "/api/notification/get/all/paginated",
    GET_UNREAD_COUNT: "/api/notification/get/unread/count",
    MASK_AS_READ: "/api/notification/mark-as-read",
    HUB: "/api/hub/notification"
  },
  FRIEND_REQUEST: {
    SEND: "/api/friend-request/send",
    ACCEPT: "/api/friend-request/accept",
    REMOVE: "/api/friend-request/remove",
    CHECK_REQUEST: "/api/friend-request/check/request",
    GET: (id: string) => `/api/friend-request/get/${id}`,
  },
} as const;