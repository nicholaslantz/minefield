import { store, connect } from 'react-redux';
import { revealTile, decorateTile } from '../actions';
import Chunk from '../components/Chunk.jsx';

const calcSideLength = (tiles) => Math.sqrt(tiles.length);

// FIXME: I'd prefer this not run every time a chunk is modified,
// cache result somehow.
const processTiles = (tiles) => tiles.map((t, i) => {
    const sideLength = calcSideLength(tiles);
    const indices = [-sideLength - 1, -sideLength, -sideLength + 1,
                     -1,                            +1,
                     sideLength - 1,  sideLength,  sideLength + 1].map(offset => offset + i);
    const numNeighbors = indices.filter(i => {
        return -1 < i && i < tiles.length;
    }).filter(i => tiles[i].isMine).length;
    return {
        ...t,
        numNeighbors,
    };
});

Chunk.propTypes = {
    onClickTile: PropTypes.func.isRequired,
    id: PropTypes.number.isRequired,
    tiles: PropTypes.arrayOf(
        PropTypes.shape({
            isMine: PropTypes.bool.isRequired,
            owner: PropTypes.number.isRequired,
            revealed: PropTypes.bool.isRequired,
            numNeighbors: PropTypes.number.isRequired,
        }).isRequired
    ).isRequired,
    sideLength: PropTypes.number.isRequired,
};

// TODO: Adapt for multiple chunks + check for chunks that don't
// have neighbors.
const mapStateToProps = state => ({
    tiles: processTiles(state.tiles),
    sideLength: calcSideLength(state.tiles)
});

const onClickTile = (e, chunkId, tileId) => {
    const user = store.getState().user;
    
    switch (e.button) {
    case 0:
        return revealTile(user, chunkId, tileId);
    case 2:
        return decorateTile(user, chunkId, tileId);
    }

    return null;
};

const mapDispatchToProps = dispatch => ({
    onClickTile,
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Chunk);
