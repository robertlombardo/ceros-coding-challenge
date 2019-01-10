import '../css/game.css';
import ActionDispatcher from './action-dispatcher'
import GameStateStore   from './stores/game-state-store'
import LoadedAssetStore from './stores/loaded-asset-store'

let ctx; // will store our canvas context
let gameWidth, gameHeight;

const View = {
	update: () => {
		ctx.save();

        // Retina support
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        clearCanvas();
        drawObstacles();
        drawSkier();

        ctx.restore();
	},

	test_private: {
		clearCanvas,
		drawSkier,
		drawObstacles
	}
}
export default View;

ActionDispatcher.once(ActionDispatcher.DOCUMENT_READY, () => {
	gameWidth  = window.innerWidth;
    gameHeight = window.innerHeight;
    
    const canvas = $('#game_canvas')
        .attr('width', gameWidth * window.devicePixelRatio)
        .attr('height', gameHeight * window.devicePixelRatio)
        .css({
            width: gameWidth + 'px',
            height: gameHeight + 'px'
        });

    ctx = canvas[0].getContext('2d');
})

const clearCanvas = () => {
    ctx.clearRect(0, 0, gameWidth, gameHeight);
};

const drawSkier = () => {
    const {skier_model} = GameStateStore.get();
    const skierImage    = LoadedAssetStore.getSkierAsset(skier_model);

    const x = (gameWidth - skierImage.width) / 2;
    const y = (gameHeight - skierImage.height) / 2;

    ctx.drawImage(skierImage, x, y, skierImage.width * skier_model.jump_height, skierImage.height * skier_model.jump_height);
};

const drawObstacles = () => {
    const {skier_model, all_obstacles} = GameStateStore.get();
    const {loadedAssets} = LoadedAssetStore.get();

    _.each(all_obstacles, obstacle => {
        const obstacleImage = loadedAssets[obstacle.type];
        const x = obstacle.x - skier_model.x - obstacleImage.width / 2;
        const y = obstacle.y - skier_model.y - obstacleImage.height / 2;

        if(x < -100 || x > gameWidth + 50 || y < -100 || y > gameHeight + 50) {
            return;
        }

        ctx.drawImage(obstacleImage, x, y, obstacleImage.width, obstacleImage.height);
    });
};
