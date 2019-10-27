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
		    return [];
		const [north, northwest, west] = [state[neighbors.north].tiles,
						  state[neighbors.northwest].tiles,
						  state[neighbors.west].tiles];
		return [tiles[1], tiles[s], tiles[s + 1], north[sw],
			north[sw + 1], northwest[se], west[ne], west[ne + s]];
	    },
            [ne]: () => {
		if (['north', 'northeast', 'east'].some(dir => state[neighbors[dir]] === undefined))
		    return [];
		const [north, northeast, east] = [state[neighbors.north].tiles,
						  state[neighbors.northeast].tiles,
						  state[neighbors.east].tiles];
		return [tiles[ne - 1], tiles[ne + s - 1], tiles[ne + s], north[se],
			north[se - 1], northeast[sw], east[nw], east[nw + s]];
	    },
            [sw]: () => {
		if (['south', 'southwest', 'west'].some(dir => state[neighbors[dir]] === undefined))
		    return [];
		const [south, southwest, west] = [state[neighbors.south].tiles,
						  state[neighbors.southwest].tiles,
						  state[neighbors.west].tiles];
		return [tiles[sw - s], tiles[sw - s + 1], tiles[sw + 1], south[nw],
			south[nw + 1], southwest[ne], west[se], west[se - s]];
	    },
            [se]: () => {
		if (['south', 'southeast', 'east'].some(dir => state[neighbors[dir]] === undefined))
		    return [];
		const [south, southeast, east] = [state[neighbors.south].tiles,
						  state[neighbors.southeast].tiles,
						  state[neighbors.east].tiles];
		return [tiles[se - s - 1], tiles[se - s], tiles[se - 1], south[ne],
			south[ne - 1], southeast[nw], east[sw], east[sw - s]];
	    }
        };
        return m[i] ? m[i]() : null
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

	if (state[neighbors[dir]] === undefined) return [];
	
	const chunkTiles = inChunk.map(ind => tiles[ind]);
	const restTiles = rest.map(ind => state[neighbors[dir]].tiles[ind]);
	return chunkTiles.concat(restTiles)
    };
    
    const middleHandler = ({ neighbors, tiles }, i) => 
          [i - s - 1, i - s, i - s + 1,
	   i - 1,            i + 1,
	   i + s - 1, i + s, i + s + 1].map(ind => tiles[ind]);
    
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
