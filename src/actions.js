
// actions are events in the simulation.  User / server input.
export const scrollWindow = (dx, dy, units = 'px') => ({
    type: 'SCROLL_WINDOW', payload: { dx, dy }
})

export const revealTile = (userId, chunkId, tileId) => ({
    type: 'REVEAL_TILE', payload: { userId, chunkId, tileId }
})

export const decorateTile = (userId, chunkId, tileId) => ({
    type: 'DECORATE_TILE', payload: { userId, chunkId, tileId }
})

export const addChunk = (id, neighbors, tiles) => ({
    type: 'ADD_CHUNK', payload: { id, neighbors, tiles }
})
