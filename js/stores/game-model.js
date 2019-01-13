import _                from 'lodash';
import EventEmitter     from 'events';
import ActionDispatcher from 'action-dispatcher';
import AssetStore       from './asset-store';
import Constants        from './constants';
import {TweenMax, Expo} from 'gsap';

const {
    SKIER_DIRECTIONS,
    BASE_SKIER_SPEED,
    ACCELLERATION,
    SKIER_STEP_DIST,
    JUMP_AIR_TIME,
    MAX_JUMP_HEIGHT,
    OBSTACLE_TYPES,
    OBSTACLE_MARGIN,
    LOCAL_STORAGE_KEY
} = Constants.get();

let game_width, game_height;

const skier_model = {
    x           : 0, 
    y           : 0,
    direction   : SKIER_DIRECTIONS.EAST,
    speed       : BASE_SKIER_SPEED,
    jump_height : 1,
    can_jump    : true,
    has_moved   : false
};

let all_obstacles = [];

let score      = 0;
let best_score = parseInt(localStorage.getItem(LOCAL_STORAGE_KEY), 10) || 0;

let jump_tween;

const GameModel = Object.assign({}, EventEmitter.prototype, {
    // messages
    FIRST_SKIER_MOVE : 'FIRST_SKIER_MOVE',
    SKIER_JUMP       : 'SKIER_JUMP',
    JUMP_COMPLETE    : 'JUMP_COMPLETE',
    SKIER_COLLISION  : 'SKIER_COLLISION',
    NEW_BEST_SCORE   : 'NEW_BEST_SCORE',

    update: () => {
        moveSkier();
        if(skier_model.direction != SKIER_DIRECTIONS.NULL) checkIfSkierHitObstacle();
    },

    get: () => {
        return Object.assign({}, {
            game_width,
            game_height,
            skier_model,
            all_obstacles,
            score,
            best_score
        });
    }
})
export default GameModel;

ActionDispatcher.once(ActionDispatcher.ASSETS_LOADED, () => {
    setGameDimensions(window.innerWidth, window.innerHeight)

    all_obstacles = getInitialObstacles();

    ActionDispatcher.dispatch(ActionDispatcher.GAME_READY);
});

const setGameDimensions = (w, h) => {
    game_width  = w;
    game_height = h;
}

const calculateOpenPosition = (minX, maxX, minY, maxY) => {
    const x = _.random(minX, maxX);
    const y = _.random(minY, maxY);

    const foundCollision = _.find(all_obstacles, obstacle => {
        return (
               x > (obstacle.x - OBSTACLE_MARGIN) 
            && x < (obstacle.x + OBSTACLE_MARGIN)
            && y > (obstacle.y - OBSTACLE_MARGIN)
            && y < (obstacle.y + OBSTACLE_MARGIN)
        );
    });

    if(foundCollision) {
        return calculateOpenPosition(minX, maxX, minY, maxY);
    }
    else return {x, y}
};

const createRandomObstacle = (minX, maxX, minY, maxY) => {
    const obstacleIndex = _.random(0, OBSTACLE_TYPES.length - 1);
    const position      = calculateOpenPosition(minX, maxX, minY, maxY);

    return {
        type : OBSTACLE_TYPES[obstacleIndex],
        x    : position.x,
        y    : position.y
    };
};

const getInitialObstacles = () => {
    const {innerWidth, innerHeight} = window;
    const numberObstacles = Math.ceil(_.random(5, 7) * (innerWidth/800) * (innerHeight/500));

    const minX = -50;
    const maxX = innerWidth + 50;
    const minY = innerHeight / 2 + 100;
    const maxY = innerHeight + 50;

    const initial_obstacles = [];

    for(let i = 0; i < numberObstacles; i++) {
        initial_obstacles.push(createRandomObstacle(minX, maxX, minY, maxY));
    }

    return initial_obstacles;
};

const placeNewObstacle = (direction, force) => {
    var shouldPlaceObstacle = _.random(1, 8);
    if(shouldPlaceObstacle !== 8 && !force) return;

    var leftEdge   = skier_model.x;
    var rightEdge  = skier_model.x + game_width;
    var topEdge    = skier_model.y;
    var bottomEdge = skier_model.y + game_height;

    switch(direction) {
        case SKIER_DIRECTIONS.WEST:
            all_obstacles.push(createRandomObstacle(leftEdge - 50, leftEdge, topEdge, bottomEdge));
            break;

        case SKIER_DIRECTIONS.SOUTHWEST:
            all_obstacles.push(createRandomObstacle(leftEdge - 50, leftEdge, topEdge, bottomEdge));
            all_obstacles.push(createRandomObstacle(leftEdge, rightEdge, bottomEdge, bottomEdge + 50));
            break;

        case SKIER_DIRECTIONS.SOUTH:
            all_obstacles.push(createRandomObstacle(leftEdge, rightEdge, bottomEdge, bottomEdge + 50));
            break;

        case SKIER_DIRECTIONS.SOUTHEAST:
            all_obstacles.push(createRandomObstacle(rightEdge, rightEdge + 50, topEdge, bottomEdge));
            all_obstacles.push(createRandomObstacle(leftEdge, rightEdge, bottomEdge, bottomEdge + 50));
            break;

        case SKIER_DIRECTIONS.EAST:
            all_obstacles.push(createRandomObstacle(rightEdge, rightEdge + 50, topEdge, bottomEdge));
            break;

        case SKIER_DIRECTIONS.NORTH:
            all_obstacles.push(createRandomObstacle(leftEdge, rightEdge, topEdge - 50, topEdge));
            break;
    }
};

const addToScore = (val) => {
    score += val;

    if(score > best_score) {
        best_score = score;
        GameModel.emit(GameModel.NEW_BEST_SCORE, best_score);
        localStorage.setItem(LOCAL_STORAGE_KEY, best_score)
    }
};

const intersectRect = (r1, r2) => {
    return !(r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top);
};

const onJumpComplete = () => {
    const jump_score = Math.pow(skier_model.speed/60, 1.7);
    addToScore(jump_score);
    GameModel.emit(GameModel.JUMP_COMPLETE, jump_score)
};

const doJump = () => {
    if(!skier_model.can_jump) return

    skier_model.last_takeoff = new Date().getTime();
    skier_model.can_jump = false
    setTimeout(() => {skier_model.can_jump = true}, JUMP_AIR_TIME * 1000)

    if(jump_tween) jump_tween.kill();

    jump_tween = TweenMax.to(
        skier_model, 
        JUMP_AIR_TIME/2, // divide by 2 because of yoyo
        {
            jump_height : MAX_JUMP_HEIGHT,
            yoyo        : true,
            repeat      : 1,
            ease        : Expo.easeOut,
            onComplete  : onJumpComplete
        }
    );

    GameModel.emit(GameModel.SKIER_JUMP);
};

const checkIfSkierHitObstacle = () => {
    if(skier_model.jump_height > 1) return

    const skierImage   = AssetStore.getSkierAsset(skier_model);
    const {img_assets} = AssetStore.get();

    const skierRect = {
        left   : skier_model.x + game_width / 2,
        right  : skier_model.x + skierImage.width + game_width / 2,
        top    : skier_model.y + skierImage.height - 5 + game_height / 2,
        bottom : skier_model.y + skierImage.height + game_height / 2
    };

    const {SOUTHWEST, SOUTH, SOUTHEAST} = SKIER_DIRECTIONS;

    for (let obstacle of all_obstacles) {
        const obstacleImage = img_assets[obstacle.type];
        const obstacleRect = {
            left   : obstacle.x,
            right  : obstacle.x + obstacleImage.width,
            top    : obstacle.y + obstacleImage.height - 5,
            bottom : obstacle.y + obstacleImage.height
        };

        if(intersectRect(skierRect, obstacleRect)) {
            // we have a collision
            if(obstacle.type == 'jump_ramp' && [SOUTHWEST, SOUTH, SOUTHEAST].includes(skier_model.direction)) {
                doJump();
            } else {
                // wipe out
                skier_model.direction = SKIER_DIRECTIONS.NULL;
                skier_model.speed = BASE_SKIER_SPEED;
                score = 0;
                if (jump_tween) jump_tween.kill();
                GameModel.emit(GameModel.SKIER_COLLISION, obstacle)
            }

            return
        }
    }
};

let last_update = new Date().getTime();
let now, delta, dist;
const moveSkier = () => {
    const {direction, speed} = skier_model;

    now                  = new Date().getTime();
    delta                = (now - last_update) / 1000;
    dist                 = speed * delta;
    const DIAGONAL_DIST  = Math.round(dist / 1.4142);
    last_update          = now;

    switch(direction) {
        case SKIER_DIRECTIONS.SOUTHWEST:
            skier_model.x -= DIAGONAL_DIST;
            skier_model.y += DIAGONAL_DIST;
            break;

        case SKIER_DIRECTIONS.SOUTH:
            skier_model.y += dist;
            break;

        case SKIER_DIRECTIONS.SOUTHEAST:
            skier_model.x += DIAGONAL_DIST;
            skier_model.y += DIAGONAL_DIST;
            break;
    }

    const {SOUTHWEST, SOUTH, SOUTHEAST} = SKIER_DIRECTIONS
    if([SOUTHWEST, SOUTH, SOUTHEAST].includes(direction)) {
        skier_model.speed *= 1 + ACCELLERATION * delta;
        placeNewObstacle(direction);
        addToScore(dist/100);
    }
};

const onSkierMoveInput = (new_direction) => {
    if(skier_model.jump_height > 1) return // can't control the skier's direction in mid-air

    const {NORTH, EAST, SOUTHEAST, SOUTH, SOUTHWEST, WEST} = SKIER_DIRECTIONS;
    const {speed} = skier_model;
    const current_direction = skier_model.direction;

    switch(new_direction) {
        case WEST:
            if([WEST, SOUTHWEST].includes(current_direction)) {
                // step west
                skier_model.speed = BASE_SKIER_SPEED;
                skier_model.direction = WEST;
                skier_model.x -= SKIER_STEP_DIST;
                placeNewObstacle(new_direction);
            }
            else skier_model.direction = SOUTHWEST;
            break;

        case EAST:
            if([EAST, SOUTHEAST].includes(current_direction)) {
                // step east
                skier_model.speed = BASE_SKIER_SPEED;
                skier_model.direction = EAST;
                skier_model.x += SKIER_STEP_DIST;
                placeNewObstacle(new_direction);
            }
            else skier_model.direction = SOUTHEAST;
            break;

        case NORTH:
            if([EAST, WEST].includes(current_direction)) {
                // step up
                skier_model.speed = BASE_SKIER_SPEED;
                skier_model.y -= SKIER_STEP_DIST;
                placeNewObstacle(NORTH);
            }
            break;

        case SOUTH:
            skier_model.direction = SOUTH;
            break;
    };

    if(!skier_model.has_moved) {
        GameModel.emit(GameModel.FIRST_SKIER_MOVE);
        skier_model.has_moved = true;
    }
};
ActionDispatcher.on(ActionDispatcher.SKIER_MOVE, onSkierMoveInput);

GameModel.test_private = {
    setGameDimensions,
    calculateOpenPosition,
    createRandomObstacle,
    getInitialObstacles,
    placeNewObstacle,
    addToScore,
    // intersectRect,
    // onJumpComplete,
    // doJump,
    // checkIfSkierHitObstacle,
    // moveSkier,
    // onSkierMoveInput,
};
