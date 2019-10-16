
// actions are events in the simulation.  User / server input.
export const scrollWindow = (dx, dy, units = 'px') => ({
    type: 'SCROLL_WINDOW', payload: { dx, dy }
})

export const revealTile = (userId, chunkId, tileId) => ({
    type: 'REVEAL_TILE', payload: { chunkId, tileId }
})

export const decorateTile = (userId, chunkId, tileId) => ({
    type: 'DECORATE_TILE', payload: { chunkId, tileId }
})

export const addChunk = (id, tiles, x, y) => ({
    type: 'ADD_CHUNK', payload: { id, tiles, x, y }
})
