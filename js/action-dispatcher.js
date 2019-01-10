import EventEmitter from 'events';

const ActionDispatcher = Object.assign({}, EventEmitter.prototype, {
    // action handles
    WINDOW_ONLOAD  : 'WINDOW_ONLOAD',
    ASSETS_LOADED  : 'ASSETS_LOADED',
    GAME_READY     : 'GAME_READY',
    SKIER_MOVE     : 'SKIER_MOVE',

    dispatch: (action_handle, data) => {
        ActionDispatcher.emit(action_handle, data);
    },
})
export default ActionDispatcher;
