import React from 'react';
import PropTypes from 'prop-types';

function tileRepresentation({ isMine, owner, revealed, numNeighbors }) {
    if ((! revealed) && (owner !== -1)) return "F";
    if ((! revealed) && (owner === -1)) return " ";
    if (revealed && isMine) return "●";
    if (revealed && (! isMine)) return numNeighbors === 0 ? " " : numNeighbors;
    return "tileRepresentation Error";
}

function classes({ isMine, owner, revealed, numNeighbors }) {
    if ((! revealed) && (owner !== -1)) return ['tile', 'tile-outset', 'tile-decorated'];
    if ((! revealed) && (owner === -1)) return ['tile', 'tile-outset'];
    if (revealed && isMine) return ['tile', 'tile-none', 'tile-mine'];
    if (revealed && (! isMine)) return ['tile', 'tile-none', `tile-${numNeighbors}`];

    return [];
}

const Tile = ({ onClick, onContextMenu, isMine, owner, revealed, numNeighbors }) => (
    <td className="tile-container">
      <button
        onContextMenu={onContextMenu}
        onMouseUpCapture={onClick}
        className={classes({ isMine, owner, revealed, numNeighbors }).join(' ')}
      >
        {tileRepresentation({ isMine, owner, revealed, numNeighbors })}
      </button>
    </td>
);

Tile.propTypes = {
    onClick: PropTypes.func.isRequired,
    onContextMenu: PropTypes.func.isRequired,
    isMine: PropTypes.bool.isRequired,
    owner: PropTypes.number.isRequired,
    revealed: PropTypes.bool.isRequired,
    numNeighbors: PropTypes.number.isRequired,
};

export default Tile;
