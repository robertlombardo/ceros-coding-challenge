import ActionDispatcher from 'action-dispatcher';
import {GameModel}      from 'stores';
import View             from 'view';
import InputHandler     from 'input-handler';
import 'audio'

window.onload = () => {
	const gameLoop = () => {
        GameModel.update();
        View.update();
        requestAnimationFrame(gameLoop);
    };

    ActionDispatcher.once(ActionDispatcher.GAME_READY, () => {
        requestAnimationFrame(gameLoop);
    });

    ActionDispatcher.dispatch(ActionDispatcher.WINDOW_ONLOAD);
};
