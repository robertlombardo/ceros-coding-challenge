import EventEmitter from 'events';

const ActionDispatcher = Object.assign({}, EventEmitter.prototype, {
    // action handles
    WINDOW_ONLOAD    : 'WINDOW_ONLOAD',
    SKIER_MOVE       : 'SKIER_MOVE',

    dispatch: (action_handle, data) => {
        ActionDispatcher.emit(action_handle, data);
    },
})
export default ActionDispatcher;
