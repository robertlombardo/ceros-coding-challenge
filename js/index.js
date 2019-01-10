import ActionDispatcher from 'action-dispatcher';
import {GameStateStore} from 'stores';
import View             from 'view';
import InputHandler     from 'input-handler';

window.onload = () => {
    const gameLoop = () => {
        GameStateStore.update();
        View.update();
        requestAnimationFrame(gameLoop);
    };

    ActionDispatcher.once(ActionDispatcher.GAME_READY, () => {
        requestAnimationFrame(gameLoop);
    });

    ActionDispatcher.dispatch(ActionDispatcher.WINDOW_ONLOAD);
};
