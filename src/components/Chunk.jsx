import React from 'react';
import PropTypes from 'prop-types';
import Tile from './Tile';

const Chunk = ({ onClickTile, id, tiles, sideLength, x, y, isFunctional }) => (
    // Could be written better with partition function
    <table
      className="chunk"
      style={{
          top: y,
          left: x
      }}
    >
      <tbody>
        {[...Array(sideLength).keys()].map(i => (
            <tr key={`${id}-${i}`}>
              {tiles.slice(i * sideLength, (i+1) * sideLength).map((t, j) => (
                  <Tile
                    key={`${id}-${i*sideLength + j}`}
                    {...t}
                    onClick={(e) => isFunctional ?
                             onClickTile(e, id, i * sideLength + j) :
                             e.preventDefault()}
                  />  
              ))}
            </tr>
        ))}
      </tbody>
    </table>
);

Chunk.propTypes = {
    onClickTile: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
    tiles: PropTypes.arrayOf(
        PropTypes.shape({
            isMine: PropTypes.bool.isRequired,
            owner: PropTypes.number.isRequired,
            revealed: PropTypes.bool.isRequired,
            numNeighbors: PropTypes.number.isRequired,
        }).isRequired
    ).isRequired,
    sideLength: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    isFunctional: PropTypes.bool.isRequired
};

export default Chunk;
