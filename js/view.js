import '../css/game.css';
import _                from 'lodash';
import ActionDispatcher from 'action-dispatcher';
import {
    GameModel,
    AssetStore
} from 'stores';
import {
    TweenMax,
    Back,
    Bounce,
    Linear,
    Power1,
    Power3
} from 'gsap';

let ctx; // stores our canvas drawing context
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

        // update score display
        const {score, best_score} = GameModel.get()
        $('#score_val').html(Math.floor(score));
        $('#best_score_val').html(Math.floor(best_score));
	},

	test_private: {
		clearCanvas,
		drawSkier,
		drawObstacles,
        onJumpComplete,
	}
}
export default View;

ActionDispatcher.once(ActionDispatcher.WINDOW_ONLOAD, () => {
	gameWidth  = window.innerWidth;
    gameHeight = window.innerHeight;
    
    // set canvas dimensions
    const canvas = $('#game_canvas')
        .attr('width', gameWidth * window.devicePixelRatio)
        .attr('height', gameHeight * window.devicePixelRatio)
        .css({
            width: gameWidth + 'px',
            height: gameHeight + 'px'
        });

    // create drawing context
    ctx = canvas[0].getContext('2d');    
});

ActionDispatcher.on(ActionDispatcher.LOADING_PROGRESS, () => {
    // update loading progress bar
    $('#progress_bar').attr('value', AssetStore.get().loading_progress);
})

ActionDispatcher.on(ActionDispatcher.ASSETS_LOADED, () => {
    // progress bar extro
    TweenMax.to('#progress_bar', 0.75, {
        left: '-70%',
        ease: Back.easeIn
    })

    // score panel intro
    TweenMax.to('#score_panel', 0.9, {
        left: '10px',
        ease : Bounce.easeOut,
        delay: 1.2
    });
    TweenMax.to('#score_panel', 0.9, {
        alpha: 1,
        ease: Linear.easeIn,
        delay: 1.2,
    });
});

const onJumpComplete = (jump_score) => {
    TweenMax.killTweensOf('#jump_score_view');

    // reset the jump score popup
    $('#jump_score_view').css({
        top: gameHeight/2 - 50, 
        left: gameWidth/2 - 20 + Math.random()*40,
        opacity: 1,
        fontSize: 0
    });

    // set the text & tween it out
    $('#jump_score_view').html(Math.floor(jump_score));
    TweenMax.to('#jump_score_view', 1.8, {
        alpha : 0,
        top   : `${gameHeight/2 - 150}px`,
        ease  : Power1.easeOut
    });
    TweenMax.to('#jump_score_view', 0.15, {fontSize: 32, ease: Power3.easeOut})
};
GameModel.on(GameModel.JUMP_COMPLETE, onJumpComplete)

const clearCanvas = () => {
    ctx.clearRect(0, 0, gameWidth, gameHeight);
};

const drawSkier = () => {
    const {skier_model} = GameModel.get();
    const skierImage    = AssetStore.getSkierAsset(skier_model);

    const x = (gameWidth - skierImage.width) / 2;
    const y = (gameHeight - skierImage.height) / 2;

    ctx.drawImage(skierImage, x, y, skierImage.width*skier_model.jump_height, skierImage.height*skier_model.jump_height);
};

const drawObstacles = () => {
    const {skier_model, all_obstacles} = GameModel.get();
    const {img_assets} = AssetStore.get();

    _.each(all_obstacles, obstacle => {
        const obstacleImage = img_assets[obstacle.type];
        const x = obstacle.x - skier_model.x - obstacleImage.width / 2;
        const y = obstacle.y - skier_model.y - obstacleImage.height / 2;

        if(x < -100 || x > gameWidth + 50 || y < -100 || y > gameHeight + 50) {
            return;
        }

        ctx.drawImage(obstacleImage, x, y, obstacleImage.width, obstacleImage.height);
    });
};
