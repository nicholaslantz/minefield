import { connect } from 'react-redux';
import { revealTile, decorateTile } from '../actions';
import ChunkField from '../components/ChunkField';

const calcSideLength = (tiles) => Math.sqrt(tiles.length);

// FIXME: I'd prefer this not run every time a chunk is modified,
// cache result somehow.
const processTiles = (tiles, neighbors, chunks) => tiles.map((t, ind) => {
    const s = calcSideLength(tiles);
    const count = (inds, arr) => inds.reduce((acc, j) => {
	return acc + (arr[j].isMine ? 1 : 0);
    }, 0);
    
    const cornersHandler = i => {
	const [nw, ne, sw, se] = [0, s - 1, s*s - s, s*s - 1];
        const m = {
            [nw]: () => {
		if (['north', 'northwest', 'west'].some(dir => neighbors[dir] === undefined))
		    return [];
		const [north, northwest, west] = [chunks[neighbors.north].tiles,
						  chunks[neighbors.northwest].tiles,
						  chunks[neighbors.west].tiles];
		return [tiles[1], tiles[s], tiles[s + 1], north[sw],
			north[sw + 1], northwest[se], west[ne], west[ne + s]];
	    },
            [ne]: () => {
		if (['north', 'northeast', 'east'].some(dir => neighbors[dir] === undefined))
		    return [];
		const [north, northeast, east] = [chunks[neighbors.north].tiles,
						  chunks[neighbors.northeast].tiles,
						  chunks[neighbors.east].tiles];
		return [tiles[ne - 1], tiles[s + s - 1], tiles[ne + s], north[se],
			north[se - 1], northeast[sw], east[nw], east[nw + s]];
	    },
            [sw]: () => {
		if (['south', 'southwest', 'west'].some(dir => neighbors[dir] === undefined))
		    return [];
		const [south, southwest, west] = [chunks[neighbors.south].tiles,
						  chunks[neighbors.southwest].tiles,
						  chunks[neighbors.west].tiles];
		return [tiles[sw - s], tiles[sw - s + 1], tiles[sw + 1], south[nw],
			south[nw + 1], southwest[ne], west[se], west[se - s]];
	    },
            [se]: () => {
		if (['south', 'southeast', 'east'].some(dir => neighbors[dir] === undefined))
		    return [];
		const [south, southeast, east] = [chunks[neighbors.south].tiles,
						  chunks[neighbors.southeast].tiles,
						  chunks[neighbors.east].tiles];
		return [tiles[se - s - 1], tiles[se - s], tiles[se - 1], south[ne],
			south[ne - 1], southeast[nw], east[sw], east[sw - s]];
	    }
        };
        return m[i] ? m[i]().reduce((acc, tile) => acc + (tile.isMine ? 1 : 0), 0) : null;
    };
    const sidesHandler = i => {
        // North
	let [inChunk, dir, rest] = [null, null, null];
        if (i < s) {
            inChunk = [i - 1, i + 1, i + s - 1, i + s, i + s + 1];
	    dir = 'north';
	    const b = s*s - s + i
	    rest = [b - 1, b, b + 1]
	}
        // West
        if (i % s === 0) {
            inChunk = [i - s, i - s + 1, i + 1, i + s, i + s + 1];
	    dir = 'west';
	    const b = i + s - 1
	    rest = [b - s, b, b + s];
        }
        // East
        if ((i + 1) % s === 0) {
            inChunk = [i - s - 1, i - s, i - 1, i + s - 1, i + s];
	    dir = 'east';
	    const b = i - s + 1;
	    rest = [b - s, b, b + s];
        }
        // South
        if (i > (s*s - s - 1)) {		
	    inChunk = [i - s - 1, i - s, i - s + 1, i - 1, i + 1];
	    dir = 'south';
	    const b = i % s;
	    rest = [b - 1, b, b + 1];
        }
	if (inChunk === null) return null;
	if (! neighbors.hasOwnProperty(dir)) return 0; // FIXME

	return count(inChunk, tiles) + count(rest, chunks[neighbors[dir]].tiles);
    };
    const middleHandler = (i) => 
          count([i - s - 1, i - s, i - s + 1,
		 i - 1,            i + 1,
		 i + s - 1, i + s, i + s + 1], tiles);
    
    let numNeighbors = cornersHandler(ind);
    if (numNeighbors === null) numNeighbors = sidesHandler(ind);
    if (numNeighbors === null) numNeighbors = middleHandler(ind);
    
    return {
        ...t,
        numNeighbors,
    };
});

const processChunks = chunks => {
    const chunkSize = 150;
    const offsets = {
	northwest: { x: -chunkSize, y: -chunkSize },
	north:     { x: 0, y: -chunkSize },
	northeast: { x: chunkSize, y: -chunkSize },
	east:      { x: chunkSize, y: 0 },
        west:      { x: -chunkSize, y: 0 },
	southwest: { x: -chunkSize, y: chunkSize },
	south:     { x: 0, y: chunkSize },
	southeast: { x: chunkSize, y: chunkSize },
    };
    
    const start = Object.keys(chunks)[0];
    const positions = { [start]: { x: 0, y: 0} };
    const stk = [start];
    
    while (stk.length > 0) {
	const next = stk.pop();
	
	Object.entries(chunks[next].neighbors).forEach(n => {
	    const [dir, id] = n;
	    if (positions.hasOwnProperty(id)) return;

	    positions[id] = {
		x: positions[next].x + offsets[dir].x,
		y: positions[next].y + offsets[dir].y,
	    }
	    stk.push(id)
	})
    }

    return Object.keys(chunks).map(id => ({
	id,
	tiles: processTiles(chunks[id].tiles, chunks[id].neighbors, chunks),
	sideLength: calcSideLength(chunks[id].tiles),
	...positions[id]
    }));
};

const mapStateToProps = state => ({
    chunks: processChunks(state.chunks)
})					     

const mapDispatchToProps = dispatch => ({
    onClickTile: (e, chunkId, tileId) => {
        e.preventDefault();
        const user = 0; // TODO: store.getState().user;

        switch (e.nativeEvent.button) {
        case 0:
            dispatch(revealTile(user, chunkId, tileId));
            break;
        case 2:
            dispatch(decorateTile(user, chunkId, tileId));
            break;
        default:
            break;
        }
    },
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ChunkField);
