import React from 'react';
import PropTypes from 'prop-types';
import Tile from 'Tile';

const Chunk = ({ onClickTile, id, tiles, sideLength }) => (
    // Could be written better with partition function
    <table>
      {[...Array(sideLength).keys()].map(i => (
          <tr>
            {tiles.slice(i * sideLength, (i+1) * sideLength).map((t, j) => (
                <Tile
                  key={`${id}-${i*sideLength + j}`}
                  {...t}
                  onClick={(e) => onClickTile(e, id, i * sideLength + j)}
                />  
            ))}
          </tr>
      ))}
    </table>
);

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

export default Chunk;
