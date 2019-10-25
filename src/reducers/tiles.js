const TilesHandlers = {
    REVEAL_TILE: (state, { userId, tileId }) => {
	const tile = state[tileId];

	if (tile.revealed || (tile.owner !== -1)) return state;

	return [
	    ...state.slice(0, tileId),
	    { ...tile, revealed: true, owner: userId },
	    ...state.slice(tileId+1),
	];
    },
    DECORATE_TILE: (state, { userId, tileId }) => {
	const tile = state[tileId];

	if (tile.revealed) return state;

	return [
	    ...state.slice(0, tileId),
	    { ...tile,owner: tile.owner === -1 ? userId : -1 },
	    ...state.slice(tileId+1),
	];
    },
};

const Tiles = (state = [], action) => {
    return TilesHandlers[action.type] ? TilesHandlers[action.type](state, action.payload) : state;
}

export default Tiles;
