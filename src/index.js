import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './reducers';
import App from './App';

import { addChunk } from './actions';

const store = createStore(rootReducer);

store.dispatch(addChunk(0, [{ isMine: true, owner: -1, revealed: false },
                            { isMine: false, owner: -1, revealed: false },
                            { isMine: false, owner: -1, revealed: false },
                            { isMine: false, owner: -1, revealed: false },
                            { isMine: true, owner: -1, revealed: false },
                            { isMine: false, owner: -1, revealed: false },
                            { isMine: false, owner: -1, revealed: false },
                            { isMine: false, owner: -1, revealed: false },
                            { isMine: true, owner: -1, revealed: false },
                           ],
                        0, 0));
console.log(store.getState());

render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
);
