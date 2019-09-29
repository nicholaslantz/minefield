import React from 'react';
import PropTypes from 'prop-types';

function tileRepresentation({ isMine, owner, revealed, numNeighbors }) {
    if ((! revealed) && (owner !== null)) return "F";
    if ((! revealed) && (owner === null)) return " ";
    if (revealed && isMine) return ".";
    if (revealed && (! isMine)) return numNeighbors === 0 ? " " : numNeighbors;
    return "tileRepresentation Error";
}

const Tile = ({ onClick, isMine, owner, revealed, numNeighbors }) => (
    <td
      onClick={onClick}
    >
      {tileRepresentation({ isMine, owner, revealed, numNeighbors })}
    </td>
);

export default Tile;
