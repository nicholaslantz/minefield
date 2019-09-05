// actions are events in the simulation.  User / server input.

export const scrollWindow = (dx, dy, units = 'px') => ({
    type: 'SCROLL_WINDOW', payload: { dx, dy }
})

export const revealTile = (x, y) => ({
    type: 'REVEAL_TILE', payload: { x, y }
})

