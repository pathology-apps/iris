const uniqueCategories = ['bin', 'binChild', 'dashboard', 'location', 'session']

const rooms = {
    userId: null,
    activeRoom: '',
    prevActiveRoom: '',
    rooms: [],
    open: false,
}

const CreateRoom = (
    name = '',
    members = [],
    messages = [],
    active = false,
    initialized = false,
    streamPosition = null,
) => ({
    name,
    members,
    messages,
    active,
    initialized,
    streamPosition,
})

const keywordsToPreserveMessages = ['location_chat:', 'room:', 'dialog:']

const updateMessages = (room) => {
    if (
        keywordsToPreserveMessages.some((keyword) =>
            room.name.includes(keyword),
        )
    ) {
        return room.messages
    }
    return []
}

const InitializeRoom = (room, members) => ({
    ...room,
    members,
    active: true,
    initialized: true,
})

const RehydrateRooms = (state) => ({
    ...state,
    rooms: state.rooms.map((room) => ({
        ...room,
        members: [],
        messages: updateMessages(room),
        active: false,
        initialized: false,
        streamPosition: room.streamPosition,
    })),
})

const JoinRoom = (state, name) => {
    const room = state.rooms.find((r) => r.name === name)
    if (room) {
        return {
            ...state,
            rooms: state.rooms.map((r) => {
                if (r.name === name) {
                    return {
                        ...r,
                        active: true,
                    }
                }
                return r
            }),
        }
    }
    return {...state, rooms: [...state.rooms, CreateRoom(name)]}
}

const JoinRoomTopic = (state, category, topic) => {
    const roomName = `${category}:${topic}`
    return {
        ...state,
        rooms: state.rooms.map((r) => {
            const req = r.name.split(':')
            if (category === req[0]) {
                return {
                    ...r,
                    name: roomName,
                    active: true,
                }
            }
            return r
        }),
    }
}

export default (state = rooms, action) => {
    switch (action.type) {
        case 'FIRST_LOGIN':
            return {
                userId: action.payload.details.sub,
                rooms: [],
                activeRoom: '',
                prevActiveRoom: '',
            }
        case 'HISTORY/PUSH':
            if (action.payload.pathname === '/login') {
                return rooms
            }
            return state
        case 'SET_SOCKET_STATUS':
            if (action.payload.status !== 'connected') {
                return RehydrateRooms(state)
            }
            return state
        case 'persist/REHYDRATE':
            if (!action.payload?.rooms) {
                return rooms
            }
            return RehydrateRooms(action.payload?.rooms)
        case 'MEMBER_JOINED': {
            const roomName = `${action.payload.category}:${action.payload.topic}`
            const room = state.rooms.find((c) => c.name === roomName)
            if (!room) {
                return state
            }
            return room.active && room.initialized
                ? {
                      ...state,
                      rooms: state.rooms.map((c) => {
                          if (c.name === roomName) {
                              return {
                                  ...c,
                                  members: [
                                      ...c.members,
                                      action.payload.clientInfo,
                                  ],
                              }
                          }
                          return c
                      }),
                  }
                : state
        }
        case 'MEMBER_LEFT': {
            const roomName = `${action.payload.category}:${action.payload.topic}`
            const room = state.rooms.find((r) => r.name === roomName)

            // Check if the room exists and is both active and initialized
            if (room && room.active && room.initialized) {
                return {
                    ...state,
                    rooms: state.rooms.map((r) =>
                        r.name === roomName
                            ? {
                                  ...r,
                                  members: r.members.filter(
                                      (m) =>
                                          m.user !==
                                          action.payload.clientInfo.user,
                                  ),
                              }
                            : r,
                    ),
                }
            }
            // Return the current state if the room doesn't exist or is not active/initialized
            return state
        }
        case 'MEMBER_LIST': {
            const roomName = `${action.payload.category}:${action.payload.topic}`
            const room = state.rooms.find((c) => c.name === roomName)

            if (!room) {
                return {
                    ...state,
                    rooms: [
                        CreateRoom(
                            roomName,
                            action.payload.clientList,
                            true,
                            true,
                        ),
                    ],
                }
            }

            return {
                ...state,
                rooms: state.rooms.map((c) => {
                    if (c.name === roomName) {
                        return InitializeRoom(c, action.payload.clientList)
                    }
                    return c
                }),
            }
        }
        case 'server/LEFT_ROOM': {
            const roomName = `${action.payload.category}:${action.payload.topic}`
            return {
                ...state,
                rooms: state.rooms.filter((r) => r.name !== roomName),
            }
        }
        case 'server/JOINED_ROOM': {
            const {category, topic} = action.payload
            const roomName = `${category}:${topic}`
            const uniqueRoomExists = state.rooms.find((r) => {
                const req = r.name.split(':')
                if (
                    category === req[0] &&
                    uniqueCategories.includes(category)
                ) {
                    return true
                }
                return false
            })
            if (uniqueRoomExists) {
                return JoinRoomTopic(state, category, topic)
            }
            return JoinRoom(state, roomName)
        }
        case 'oracle/refresh:binChild':
            return {
                ...state,
                rooms: state.rooms.map((r) => {
                    if (r.name.includes('binChild:')) {
                        return {
                            ...r,
                            active: true,
                        }
                    }
                    return r
                }),
            }
        case 'oracle/refresh:bin':
            return {
                ...state,
                rooms: state.rooms.map((r) => {
                    if (r.name.includes('bin:')) {
                        return {
                            ...r,
                            active: true,
                        }
                    }
                    return r
                }),
            }
        case 'CLOSE_PANE':
            return {
                ...state,
                rooms: state.rooms.map((r) => {
                    if (r.name.includes('bin:')) {
                        return {
                            ...r,
                            active: false,
                            initialized: false,
                        }
                    }
                    return r
                }),
            }
        case 'oracle/refresh:location':
            return {
                ...state,
                rooms: state.rooms.map((r) => {
                    if (r.name.includes('location:')) {
                        return {
                            ...r,
                            active: true,
                        }
                    }
                    return r
                }),
            }
        case 'STORE_BIN_SEARCH':
            return {
                ...state,
                rooms: state.rooms.map((r) => {
                    if (r.name.includes('location:')) {
                        return {
                            ...r,
                            active: true,
                        }
                    }
                    return r
                }),
            }
        case 'client/NEW_MESSAGE':
            return {
                ...state,
                rooms: state.rooms.map((r) => {
                    if (r.name === action.room) {
                        return {
                            ...r,
                            messages: [...r.messages, action.payload],
                            hasNewMessages:
                                action.payload.info.session_id.toString() !==
                                    state.userId.toString() &&
                                action.room.name !== state.activeRoom &&
                                !state.open,
                        }
                    }
                    return r
                }),
            }
        case 'ADD_HISTORY_MESSAGES': {
            const roomName = action.room
            const historyMessages = action.messages
            return {
                ...state,
                rooms: state.rooms.map((r) => {
                    if (r.name === roomName) {
                        return {
                            ...r,
                            // Prepend the history messages to the existing messages in the room
                            messages: [...historyMessages, ...r.messages],
                        }
                    }
                    return r
                }),
            }
        }
        case 'SET_STREAM_POSITION': {
            return {
                ...state,
                rooms: state.rooms.map((room) => {
                    if (room.name === action.room) {
                        return {...room, streamPosition: action.streamPosition}
                    }
                    return room
                }),
            }
        }
        case 'FOCUS_ROOM':
            return {
                ...state,
                rooms: state.rooms.map((room) => {
                    if (room.name === action.room) {
                        return {
                            ...room,
                            hasNewMessages: false,
                        }
                    }
                    return room
                }),
                activeRoom: action.room,
                prevActiveRoom: state.activeRoom,
            }
        case 'FOCUS_PREV_ROOM':
            return {
                ...state,
                activeRoom: state.prevActiveRoom || 'room:lobby',
            }
        case 'TOGGLE_OPEN_CHAT':
            return {
                ...state,
                open: !state.open,
            }
        case 'server/logout':
        case 'oracle/logout':
        case 'EXPIRE_SESSION':
            return rooms
        default:
            return state
    }
}
