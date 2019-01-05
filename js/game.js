import GameStateStore from './stores/game-state-store';
import Images from 'img';
import '../css/game.css';

$(document).ready(() => {
    var loadedAssets = {};

    var gameWidth = window.innerWidth;
    var gameHeight = window.innerHeight;
    var canvas = $('<canvas></canvas>')
        .attr('width', gameWidth * window.devicePixelRatio)
        .attr('height', gameHeight * window.devicePixelRatio)
        .css({
            width: gameWidth + 'px',
            height: gameHeight + 'px'
        });
    $('body').append(canvas);
    var ctx = canvas[0].getContext('2d');

    const clearCanvas = () => {
        ctx.clearRect(0, 0, gameWidth, gameHeight);
    };

    const getSkierAsset = () => {
        const {NULL, WEST, SOUTHWEST, SOUTH, SOUTHEAST, EAST} = GameStateStore.SKIER_DIRECTIONS
        const {direction} = GameStateStore.get().skier_model

        switch(direction) {
            case NULL      : return 'skier_crash';
            case WEST      : return 'skier_left';
            case SOUTHWEST : return 'skier_left_down';
            case SOUTH     : return 'skier_down';
            case SOUTHEAST : return 'skier_right_down';
            case EAST      : return 'skier_right';

            default        : throw `Invalid skier_model.direction (${direction}) in getSkierAsset()`;
        }
    };

    const drawSkier = () => {
        var skierAssetName = getSkierAsset();
        var skierImage     = loadedAssets[skierAssetName];

        var x = (gameWidth - skierImage.width) / 2;
        var y = (gameHeight - skierImage.height) / 2;

        ctx.drawImage(skierImage, x, y, skierImage.width, skierImage.height);
    };

    const drawObstacles = () => {
        const {skier_model, all_obstacles} = GameStateStore.get()

        _.each(all_obstacles, obstacle => {
            var obstacleImage = loadedAssets[obstacle.type];
            var x = obstacle.x - skier_model.x - obstacleImage.width / 2;
            var y = obstacle.y - skier_model.y - obstacleImage.height / 2;

            if(x < -100 || x > gameWidth + 50 || y < -100 || y > gameHeight + 50) {
                return;
            }

            ctx.drawImage(obstacleImage, x, y, obstacleImage.width, obstacleImage.height);
        });
    };

    const gameLoop = () => {
        GameStateStore.update()

        ctx.save();

        // Retina support
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        clearCanvas();
        drawSkier();
        drawObstacles();

        ctx.restore();

        requestAnimationFrame(gameLoop);
    };

    const loadAssets = () => {
        for (let img_key in Images) {
            var assetImage = new Image();
            assetImage.src = Images[img_key];
            
            assetImage.width /= 2;
            assetImage.height /= 2;
            
            loadedAssets[img_key] = assetImage;
        };
    };

    const initGame = () => {
        loadAssets()
        GameStateStore.init(gameWidth, gameHeight, loadedAssets, getSkierAsset)
        requestAnimationFrame(gameLoop);
    };

    initGame(gameLoop);
});
