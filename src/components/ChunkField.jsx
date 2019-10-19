import React from 'react';
import Chunk from './Chunk';

const ChunkField = ({ onClickTile, chunks }) => (
    <div>
      {chunks.map((c) => (
          <Chunk
            key={`${c.id}`}
            onClickTile={onClickTile}
            {...c}
          />
      ))}
    </div>
);

export default ChunkField;
