import React from 'react';
import PropTypes from 'prop-types';

function tileRepresentation({ isMine, owner, revealed, numNeighbors }) {
    if ((! revealed) && (owner !== null)) return "F";
    if ((! revealed) && (owner === null)) return " ";
    if (revealed && isMine) return ".";
    if (revealed && (! isMine)) return numNeighbors === 0 ? " " : numNeighbors;
    return "tileRepresentation Error";
}

const Tile = ({ isMine, owner, revealed, numNeighbors }) => (
    <td>
      {tileRepresentation({ isMine, owner, revealed, numNeighbors })}
    </td>
);

Tile.propTypes = {
    isMine: PropTypes.bool.isRequired,
    owner: PropTypes.number.isRequired,
    revealed: PropTypes.bool.isRequired,
    numNeighbors: PropTypes.number.isRequired,
};

export default Tile;
