import { connect } from 'react-redux';
import { revealTile, decorateTile } from '../actions';
import ChunkField from '../components/ChunkField';

const calcSideLength = (tiles) => Math.sqrt(tiles.length);

// FIXME: I'd prefer this not run every time a chunk is modified,
// cache result somehow.
const processTiles = (tiles) => tiles.map((t, i) => {
    const s = calcSideLength(tiles);
    const cornersHandler = (i) => {
        const m = {
            0: [1, s, s + 1],
            [s - 1]: [i - 1, i + s - 1, i + s],
            [s * s - s]: [i - s, i - s + 1, i + 1],
            [s * s - 1]: [i - s - 1, i - s, i - 1],
        };
        return m[i] ? m[i] : null;
    };
    const sidesHandler = (i) => {
        // North
        if (i < s) {
            return [i - 1, i + 1, i + s - 1, i + s, i + s + 1];
        }
        // West
        if (i % s === 0) {
            return [i - s, i - s + 1, i + 1, i + s, i + s + 1];
        }
        // East
        if ((i + 1) % s === 0) {
            return [i - s - 1, i - s, i - 1, i + s - 1, i + s];
        }
        // South
        if (i > (s*s - s - 1)) {
            return [i - s - 1, i - s, i - s + 1, i - 1, i + 1];
        }

        return null;
    };
    const middleHandler = (i) => 
        [i - s - 1, i - s, i - s + 1,
         i - 1,            i + 1,
         i + s - 1, i + s, i + s + 1];

    // FIXME: There's probably a cleaner way to do this
    const indices = cornersHandler(i) ? cornersHandler(i) :
          sidesHandler(i) ? sidesHandler(i) :
          middleHandler(i);

    const numNeighbors = indices.reduce(
	(acc, i) => acc + (tiles[i].isMine ? 1 : 0), 0);
    
    return {
        ...t,
        numNeighbors,
    };
});

const processChunks = chunks => {
    // Compute pixel coordinates of each chunk.
    const chunkSize = 150;
    const offsets = {
	northwest: { x: -chunkSize, y: -chunkSize },
	north:     { x: 0, y: -chunkSize },
	northeast: { x: chunkSize, y: -chunkSize },
	east:      { x: -chunkSize, y: 0 },
        west:      { x: chunkSize, y: 0 },
	southwest: { x: -chunkSize, y: chunkSize },
	south:     { x: 0, y: chunkSize },
	soucheast: { x: chunkSize, y: chunkSize },
    };
    
    const start = Object.keys(chunks)[0];
    const positions = { [start]: { x: 0, y: 0} };
    const stk = [start];
    
    while (stk.length > 0) {
	const next = stk.pop();
	
	Object.entries(chunks[next].neighbors).forEach(n => {
	    const [dir, id] = n;
	    if (positions.hasOwnProperty(id)) return;

	    console.log(dir, id);
	    positions[id] = {
		x: positions[next].x + offsets[dir].x,
		y: positions[next].y + offsets[dir].y,
	    }
	    stk.push(id)
	})
    }

    return Object.keys(chunks).map(id => ({
	id,
	tiles: processTiles(chunks[id].tiles),
	sideLength: calcSideLength(chunks[id].tiles),
	...positions[id]
    }));
};

// In order to place chunks in a table structure I need to determine
// the number of rows, columns, and the relative locations of each of
// the chunks...  At the same time I can place them absolutely given
// an anchor...

// TODO: Take chunk boundaries into account for processTiles
// calculation.
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
