import Tiles from './tiles';

const Directions = ['north', 'northwest', 'west', 'southwest',
		    'south', 'southeast', 'east', 'northeast'];

const ChunksHandlers = {
    // TODO: Merge changes iff user modified
    ADD_CHUNK: (state, { id, neighbors, tiles}) => ({
	...state,
	[id]: { neighbors, tiles },
    }),
    REVEAL_TILE: (state, { userId, chunkId, tileId }, action) => {
	const chunk = state[chunkId];
        
	return {
	    ...state, [chunkId]: {
		...chunk,
		tiles: Tiles(chunk.tiles, action)
	    }
	};
    },
    DECORATE_TILE: (state, { userId, chunkId, tileId }, action) => {
	const chunk = state[chunkId];
	
	return {
	    ...state, [action.payload.chunkId]: {
		...chunk,
		tiles: Tiles(chunk.tiles, action),
	    }
	};
    },
};

const chunks = (state = {}, action) => {
    return ChunksHandlers[action.type] ? ChunksHandlers[action.type](state, action.payload, action) : state;
}

// TODO:  Do utility functions belong here, or somewhere else?

const sideLength = (state) => {
    const ids = Object.keys(state)

    if (ids.length === 0) return undefined;

    return Math.sqrt(state[ids[0]].tiles.length);
}

export { sideLength };

const tileNeighbors = (state, chunkId, tileId) => {
    const s = sideLength(state);

    if (state[chunkId] === undefined) return [];
    if (tileId < 0 || tileId >= state[chunkId].tiles.length) return [];

    const chunk = state[chunkId] ;
    const cornersHandler = ({ neighbors, tiles }, i) => {
	const [nw, ne, sw, se] = [0, s - 1, s*s - s, s*s - 1];
        const m = {
            [nw]: () => {
		if (['north', 'northwest', 'west'].some(dir => state[neighbors[dir]] === undefined))
		    return {};
		const [north, northwest, west] = [neighbors.north,
						  neighbors.northwest,
						  neighbors.west];
		return {
		    [chunkId]: [1, s, s + 1],
		    [north]: [sw, sw + 1],
		    [northwest]: [se],
		    [west]: [ne + s],
		};
	    },
            [ne]: () => {
		if (['north', 'northeast', 'east'].some(dir => state[neighbors[dir]] === undefined))
		    return {};
		const [north, northeast, east] = [neighbors.north,
						  neighbors.northeast,
						  neighbors.east];
		return {
		    [chunkId]: [ne - 1, ne + s - 1, ne + s],
		    [north]: [se, se - 1],
		    [northeast]: [sw],
		    [east]: [nw, nw + s],
		};
	    },
            [sw]: () => {
		if (['south', 'southwest', 'west'].some(dir => state[neighbors[dir]] === undefined))
		    return {};
		const [south, southwest, west] = [neighbors.south,
						  neighbors.southwest,
						  neighbors.west];
		return {
		    [chunkId]: [sw - s, sw - s + 1, sw + 1],
		    [south]: [nw, nw + 1],
		    [southwest]: [ne],
		    [west]: [se, se - s],
		};
	    },
            [se]: () => {
		if (['south', 'southeast', 'east'].some(dir => state[neighbors[dir]] === undefined))
		    return {};
		const [south, southeast, east] = [neighbors.south,
						  neighbors.southeast,
						  neighbors.east];
		return {
		    [chunkId]: [se - s - 1, se - s, se - 1],
		    [south]: [ne, ne - 1],
		    [southeast]: [nw],
		    [east]: [sw, sw - s],
		};
	    }
        };
        return m[i] ? m[i]() : null;
    };
    
    const sidesHandler = ({ neighbors, tiles }, i) => {
        // North
	let [inChunk, dir, rest] = [null, null, null];
        if (i < s) {
            inChunk = [i - 1, i + 1, i + s - 1, i + s, i + s + 1];
	    dir = 'north';
	    const b = s*s - s + i
	    rest = [b - 1, b, b + 1]
	}
        // West
        else if (i % s === 0) {
            inChunk = [i - s, i - s + 1, i + 1, i + s, i + s + 1];
	    dir = 'west';
	    const b = i + s - 1
	    rest = [b - s, b, b + s];
        }
        // East
        else if ((i + 1) % s === 0) {
            inChunk = [i - s - 1, i - s, i - 1, i + s - 1, i + s];
	    dir = 'east';
	    const b = i - s + 1;
	    rest = [b - s, b, b + s];
        }
        // South
        else if (i > (s*s - s - 1)) {		
	    inChunk = [i - s - 1, i - s, i - s + 1, i - 1, i + 1];
	    dir = 'south';
	    const b = i % s;
	    rest = [b - 1, b, b + 1];
        }
	else {
	    return null;
	}

	if (state[neighbors[dir]] === undefined) return {};

	return {
	    [chunkId]: inChunk,
	    [neighbors[dir]]: rest,
	};
    };
    
    const middleHandler = ({ neighbors, tiles }, i) => ({
	[chunkId]: [i - s - 1, i - s, i - s + 1,
		    i - 1,            i + 1,
		    i + s - 1, i + s, i + s + 1]
    });
    
    return cornersHandler(chunk, tileId) ||
	sidesHandler(chunk, tileId) || middleHandler(chunk, tileId);
}

export { tileNeighbors };

const onBoundary = (state, chunkId) => {
    if (state[chunkId] === undefined) return true;

    const neighbors = state[chunkId].neighbors;
    return Object.keys(neighbors).some(dir => state[neighbors[dir]] === undefined);
}

export { onBoundary };

export default chunks;
