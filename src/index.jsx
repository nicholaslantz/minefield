import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './reducers/';
import App from './App';

import { addChunk, scrollWindow } from './actions';

const store = createStore(rootReducer);

const world = [[0,  1,  2,  3],
               [4,  5,  6,  7],
               [8,  9,  10, 11],
               [12, 13, 14, 15]];
const genChunk = (genTile, n) => [...Array(n).keys()].map(genTile);

world.forEach((r, rc) => r.forEach((cid, cc) => {
    let directions = ['northwest', 'north', 'northeast', 'west',
                      'east', 'southwest', 'south', 'southeast'];
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
        isMine: Math.random() < 0.5,
        owner: -1,
        revealed: true,
    }), 16)));
}));

render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
);
