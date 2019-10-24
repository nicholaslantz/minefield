const ChunksHandlers = {
    // TODO: Merge changes iff user modified
    ADD_CHUNK: (state, { id, neighbors, tiles }) => ({
	...state,
	[id]: { neighbors, tiles },
    }),
    REVEAL_TILE: (state, { userId, chunkId, tileId }) => {
	const chunk = state[chunkId];
	const tile = chunk.tiles[tileId];

	// FIXME: I want a tiles handler.
	if (tile.revealed || (tile.owner !== -1)) return state;
        
	return {
	    ...state, [chunkId]: {
		...chunk, tiles: [
		    ...chunk.tiles.slice(0, tileId),
		    { ...tile, revealed: true, owner: userId },
		    ...chunk.tiles.slice(tileId+1),
		]
	    }
	};
    },
    DECORATE_TILE: (state, { userId, chunkId, tileId }) => {
	const chunk = state[chunkId];
	const tile = chunk.tiles[tileId];

	if (tile.revealed) return state;
	return {
	    ...state, [chunkId]: {
		...chunk, tiles: [
		    ...chunk.tiles.slice(0, tileId),
		    { ...tile, owner: tile.owner === -1 ? userId : -1 },
		    ...chunk.tiles.slice(tileId+1),
		]
	    }
	};
    },
};

const chunks = (state = {}, action) => {
    return ChunksHandlers[action.type] ? ChunksHandlers[action.type](state, action.payload) : state;
}

export default chunks;
