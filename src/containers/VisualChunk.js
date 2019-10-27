import { connect } from 'react-redux';
import { revealTile, decorateTile, scrollWindow } from '../actions';
import ChunkField from '../components/ChunkField';

import { sideLength, tileNeighbors, onBoundary } from '../reducers/chunks';

// FIXME: I'd prefer this not run every time a chunk is modified,
// cache result somehow.
const processTiles = (state, chunkId) => state[chunkId].tiles.map((t, i) => ({
    ...t,
    numNeighbors: tileNeighbors(state, chunkId, i).reduce((acc, tile) => {
	return acc + (tile.isMine ? 1 : 0);
    }, 0),
}));

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
	    if (positions[id] !== undefined) return;
	    if (chunks[id] === undefined) return;

	    positions[id] = {
		x: positions[next].x + offsets[dir].x,
		y: positions[next].y + offsets[dir].y,
	    }

	    if (! onBoundary(chunks, id)) stk.push(id)
	})
    }

    return Object.keys(chunks).map(id => ({
	id,
	tiles: processTiles(chunks, id),
	sideLength: sideLength(chunks),
	isFunctional: Object.keys(chunks[id].neighbors).length === 8,
	...positions[id]
    }));
};

const mapStateToProps = state => ({
    chunks: processChunks(state.chunks),
    x: state.coords.x,
    y: state.coords.y,
})					     

const mapDispatchToProps = dispatch => ({
    onClickTile: (e, chunkId, tileId) => {
        e.preventDefault();

        const user = 0; // TODO: store.getState().user;
	if (e.button === 0) {
            dispatch(revealTile(user, chunkId, tileId));
	}
    },
    onContextMenuTile: (e, chunkId, tileId) => {
	e.preventDefault();

	const user = 0; // FIXME
	dispatch(decorateTile(user, chunkId, tileId));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ChunkField);
