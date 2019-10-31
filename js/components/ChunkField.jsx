import React from 'react';
import Chunk from './Chunk';

const ChunkField = ({ onClickTile, onContextMenuTile, chunks, x, y }) => (
    <div
      className="chunk-field"
      style={{
          top: `${y}px`,
          left: `${x}px`,
      }}
    >
      {chunks.map((c) => (
          <Chunk
            key={`${c.id}`}
            onClickTile={onClickTile}
            onContextMenuTile={onContextMenuTile}
            {...c}
          />
      ))}
    </div>
);

export default ChunkField;
