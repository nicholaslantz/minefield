import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './reducers';
import App from './App';

import { addChunk } from './actions';

const store = createStore(rootReducer);

const genChunk = (genTile, n) => [...Array(n).keys()].map(genTile);
store.dispatch(addChunk(0, genChunk(() => ({
    isMine: Math.random() < 0.5,
    owner: -1,
    revealed: false
}), 64)));

render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
);
