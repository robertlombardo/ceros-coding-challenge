import ActionDispatcher from './action-dispatcher';
import GameStateStore   from './stores/game-state-store';
import View             from './view';
import InputHandler     from './input-handler';

$(document).ready(() => {
    const gameLoop = () => {
        GameStateStore.update();
        View.update();
        requestAnimationFrame(gameLoop);
    };

    ActionDispatcher.once(ActionDispatcher.GAME_READY, () => {
        requestAnimationFrame(gameLoop);
    });

    ActionDispatcher.dispatch(ActionDispatcher.DOCUMENT_READY);
});
