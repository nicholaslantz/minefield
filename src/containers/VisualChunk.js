import { connect } from 'react-redux';
import { revealTile, decorateTile } from '../actions';
import Chunk from '../components/Chunk.jsx';

const calcSideLength = (tiles) => Math.sqrt(tiles.length);

// FIXME: I'd prefer this not run every time a chunk is modified,
// cache result somehow.
const processTiles = (tiles) => tiles.map((t, i) => {
    const s = calcSideLength(tiles);
    const cornersHandler = (i) => {
        const m = {
            0: [1, s, s + 1],
            [s - 1]: [s - 2, 2*s - 2, 2*s - 1],
            [s * s - s]: [s*s - 2*s, s*s - 2*s + 1],
            [s * s - 1]: [s*s - s - 2, s*s - s - 1, s*s - 1],
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

    const numNeighbors = indices.filter(i => {
        return -1 < i && i < tiles.length;
    }).reduce((acc, i) => acc + (tiles[i].isMine ? 1 : 0), 0);
    
    return {
        ...t,
        numNeighbors,
    };
});

// TODO: Adapt for multiple chunks + check for chunks that don't
// have neighbors.
const mapStateToProps = state => ({
    tiles: processTiles(state.chunks[0].tiles),
    sideLength: calcSideLength(state.chunks[0].tiles)
});

const mapDispatchToProps = dispatch => ({
    onClickTile: (e, chunkId, tileId) => {
        e.preventDefault();
        const user = 0;// store.getState().user;

        console.log(e.nativeEvent);
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
)(Chunk);
