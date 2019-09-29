const CoordsHandlers = {
    SCROLL_WINDOW: (state, { dx, dy }) => {
	return {
	    x: state.x + dx,
	    y: state.y + dy,
	};
    }
}

const coords = (state = { x: 0, y: 0 }, action) => {
    return CoordsHandlers[action.type] ? CoordsHandlers[action.type](state, action.payload) : state;
}

const ChunksHandlers = {
    // TODO: Merge changes iff user modified
    ADD_CHUNK: (state, { id, x, y, tiles }) => ({
	...state,
	id: { x, y, tiles },
    }),
    REVEAL_TILE: (state, { userId, chunkId, tileId }) => {
	const chunk = state[chunkId];
	const tile = chunk.tiles[tileId];

	// FIXME: I want a tiles handler.
	if (tile.revealed || (tile.owner !== null)) return state;
	return {
	    ...state, chunkId: {
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
	const tile = chunk[tileId];

	if (tile.revealed) return state;
	return {
	    ...state, chunkId: {
		...chunk, tiles: [
		    ...chunk.tiles.slice(0, tileId),
		    { ...tile, owner: tile.owner === null ? userId : null },
		    ...chunk.tiles.slice(tileId+1),
		]
	    }
	};
    },
}

const chunks = (state = {}, action) => {
    return ChunksHandlers[action.type] ? ChunksHandlers[action.type](state, action.payload) : state;
}

const UserHandler = {)

const user = (state = 0, action) => {
    return UserHandler[action.type] ? UserHandler[action.type](state, action.payload) : state;
}
