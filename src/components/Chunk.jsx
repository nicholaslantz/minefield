import React from 'react';
import PropTypes from 'prop-types';
import Tile from 'Tile';

const Chunk = ({ onClickTile, id, tiles, sideLength }) => (
    // Could be written better with partition function
    <table>
    {
        [...Array(sideLength).keys()].map(i => (
            <tr>
              {
                  tiles.slice(i * sideLength, (i+1) * sideLength).map((t, j) => (
                      <Tile
                        key={`${id}-${i*sideLength + j}`}
                        {...t}
                        onClick={() => onClickTile(id, i * sideLength + j)}
                      />  
                  ))
              }
            </tr>
        ))
    }
    </table>
);

export default Chunk;
