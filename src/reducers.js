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
