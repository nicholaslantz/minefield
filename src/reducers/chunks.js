import Tiles from './tiles';

const ChunksHandlers = {
    // TODO: Merge changes iff user modified
    ADD_CHUNK: (state, { type, payload }) => ({
	...state,
	[payload.id]: { neighbors: payload.neighbors, tiles: payload.tiles },
    }),
    REVEAL_TILE: (state, action) => {
	const chunk = state[action.payload.chunkId];
        
	return {
	    ...state, [action.payload.chunkId]: {
		...chunk,
		tiles: Tiles(chunk.tiles, action)
	    }
	};
    },
    DECORATE_TILE: (state, action) => {
	const chunk = state[action.payload.chunkId];
	
	return {
	    ...state, [action.payload.chunkId]: {
		...chunk,
		tiles: Tiles(chunk.tiles, action),
	    }
	};
    },
};

const chunks = (state = {}, action) => {
    return ChunksHandlers[action.type] ? ChunksHandlers[action.type](state, action) : state;
}

export default chunks;
