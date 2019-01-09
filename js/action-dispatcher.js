import EventEmitter from 'events';

const ActionDispatcher = Object.assign(EventEmitter.prototype, {
    // action handles
    DOCUMENT_READY : 'DOCUMENT_READY',
    ASSETS_LOADED  : 'ASSETS_LOADED',
    GAME_READY     : 'GAME_READY',
    SKIER_MOVE     : 'SKIER_MOVE',

    dispatch: (action_handle, data) => {
        ActionDispatcher.emit(action_handle, data);
    },
})
export default ActionDispatcher;
