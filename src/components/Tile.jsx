import React from 'react';
import PropTypes from 'prop-types';

function tileRepresentation({ isMine, owner, revealed, numNeighbors }) {
    if ((! revealed) && (owner !== -1)) return "F";
    if ((! revealed) && (owner === -1)) return ".";
    if (revealed && isMine) return "X";
    if (revealed && (! isMine)) return numNeighbors === 0 ? "Y" : numNeighbors;
    return "tileRepresentation Error";
}

const Tile = ({ onClick, isMine, owner, revealed, numNeighbors }) => (
    <td>
      <button onClick={onClick} className="tile">
        {tileRepresentation({ isMine, owner, revealed, numNeighbors })}
      </button>
    </td>
);

Tile.propTypes = {
    onClick: PropTypes.func.isRequired,
    isMine: PropTypes.bool.isRequired,
    owner: PropTypes.number.isRequired,
    revealed: PropTypes.bool.isRequired,
    numNeighbors: PropTypes.number.isRequired,
};

export default Tile;
