import ActionDispatcher from './action-dispatcher';
import Constants        from './stores/constants';

const InputHandler = {
	onKeydownEvent: event => {
		const {KEY_CODES, SKIER_DIRECTIONS} = Constants.get();
	    const {LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW} = KEY_CODES;
	    const {NORTH, SOUTH, EAST, WEST} = SKIER_DIRECTIONS;

	    let new_direction;

	    switch(event.which) {
	        case LEFT_ARROW  : new_direction = WEST;  break;
	        case RIGHT_ARROW : new_direction = EAST;  break;
	        case UP_ARROW    : new_direction = NORTH; break;
	        case DOWN_ARROW  : new_direction = SOUTH; break;
	    };

	    ActionDispatcher.dispatch(ActionDispatcher.SKIER_MOVE, new_direction);

	    if(Object.values(KEY_CODES).includes(event.which)) event.preventDefault();
	}
}
export default InputHandler

ActionDispatcher.once(ActionDispatcher.DOCUMENT_READY, () => {
	$(window).keydown(InputHandler.onKeydownEvent);
});
