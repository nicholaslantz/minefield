import React from 'react';
import Chunk from './Chunk';

const ChunkField = ({ onClickTile, onContextMenuTile, chunks }) => (
    <div className="chunk-field">
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
