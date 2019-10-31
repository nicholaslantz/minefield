import { combineReducers } from 'redux';
import chunks from './chunks';

const CoordsHandlers = {
    SCROLL_WINDOW: (state, { dx, dy }) => {
	return {
	    x: state.x + dx,
	    y: state.y + dy,
	};
    }
};

const coords = (state = { x: 0, y: 0 }, action) => {
    return CoordsHandlers[action.type] ? CoordsHandlers[action.type](state, action.payload) : state;
};

const UserHandler = {};

const user = (state = 0, action) => {
    return UserHandler[action.type] ? UserHandler[action.type](state, action.payload) : state;
};

export default combineReducers({
    coords,
    chunks,
    user,
});
