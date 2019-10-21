import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './reducers';
import App from './App';

import { addChunk } from './actions';

const store = createStore(rootReducer);

const world = [[0,  1,  2,  3],
               [4,  5,  6,  7],
               [8,  9,  10, 11],
               [12, 13, 14, 15]];
const genChunk = (genTile, n) => [...Array(n).keys()].map(genTile);

world.forEach((r, rc) => r.forEach((cid, cc) => {
    let directions = ['northwest', 'north', 'northeast', 'west',
                      'east', 'southwest', 'south', 'soucheast'];
    let offsets = [[-1, -1], [-1,  0], [-1, 1], [0, -1],
                   [ 0,  1], [ 1, -1], [ 1, 0], [1,  1]];

    let neighbors = {};
    for (let i = 0; i < directions.length; i++) {
        const row = world[rc + offsets[i][0]];
        if (row === undefined) continue;
        const col = row[cc + offsets[i][1]];
        if (col === undefined) continue;

        neighbors[directions[i]] = col;
    }
    
    store.dispatch(addChunk(cid, neighbors, genChunk(() => ({
        isMine: Math.random() < 0.2,
        owner: -1,
        revealed: true,
    }), 16)));
}));

console.log(store.getState());
// I need a way to easily compute the top, left, bottom, and right
// chunks.  I can do a linear search, or I can rely on the server
// to do that for me.  I can't assume that the chunk ids are ordered
// client-side as I don't know how the chunks are stored.  I can
// make that optimization server-side.  So I can treat those as givens,
// then the problem becomes easier over here.  Also, if I do it this
// way I don't need to provide x, y coordinates.

// Next I need to positon these chunks in the world.  A solution that
// comes to mind is to pick a chunk as an anchor, deteamine the render
// size of a chunk, then offset their coordinates appropriately.
// However, that feels like I'm reinventing the table.  If I map them
// onto a table I lose the ability to grow the world in arbitrary
// directions, but I get resizing for free, I don't need to mess around
// with exact pixel coordinates.  Even with a table I can add more colums,
// rows... The td just won't have data.  This is workable...  I just need
// to convert my pointer data into a grid... Hmm, is there an easier way?

render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
);
