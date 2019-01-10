import ActionDispatcher  from '../action-dispatcher';
import LoadedAssetStore  from './loaded-asset-store';
import Constants         from './constants';
import {TweenMax, Expo}  from 'gsap';

const {
    SKIER_DIRECTIONS,
    BASE_SKIER_SPEED,
    ACCELLERATION,
    JUMP_AIR_TIME,
    MAX_JUMP_HEIGHT
} = Constants.get();

let game_width, game_height;

const skier_model = {
    x           : 0, 
    y           : 0,
    direction   : SKIER_DIRECTIONS.EAST,
    speed       : BASE_SKIER_SPEED,
    jump_height : 1
};

let all_obstacles    = [];
const OBSTACLE_TYPES = [
    'jump_ramp',
    'tree_1',
    'tree_cluster',
    'rock_1',
    'rock_2'
];

const GameStateStore = {
    update: () => {
        moveSkier();
        checkIfSkierHitObstacle();
    },

    get: () => {
        return Object.assign({}, {
            skier_model,
            all_obstacles
        });
    },

    test_private: {
        placeInitialObstacles,
        onSkierMoveInput,
        moveSkier,
        placeNewObstacle,
        placeRandomObstacle,
        calculateOpenPosition,
        checkIfSkierHitObstacle,
        intersectRect,
        doJump
    }
}
export default GameStateStore;

ActionDispatcher.once(ActionDispatcher.ASSETS_LOADED, () => {
    game_width  = window.innerWidth;
    game_height = window.innerHeight;

    placeInitialObstacles();

    ActionDispatcher.dispatch(ActionDispatcher.GAME_READY)
})

const onSkierMoveInput = (new_direction) => {
    if (skier_model.jump_height > 1) return // can't control the skier's direction in midair

    const {NORTH, EAST, SOUTHEAST, SOUTH, SOUTHWEST, WEST} = SKIER_DIRECTIONS;
    const {speed} = skier_model;
    const current_direction = skier_model.direction;

    switch(new_direction) {
        case WEST:
            if([WEST, SOUTHWEST].includes(current_direction)) {
                // step west
                skier_model.speed = BASE_SKIER_SPEED;
                skier_model.direction = WEST;
                skier_model.x -= speed;
                placeNewObstacle(new_direction);
            }
            else skier_model.direction = SOUTHWEST;
            break;

        case EAST:
            if([EAST, SOUTHEAST].includes(current_direction)) {
                // step east
                skier_model.speed = BASE_SKIER_SPEED;
                skier_model.direction = EAST;
                skier_model.x += speed;
                placeNewObstacle(new_direction);
            }
            else skier_model.direction = SOUTHEAST;
            break;

        case NORTH:
            if([EAST, WEST].includes(current_direction)) {
                // step up
                skier_model.speed = BASE_SKIER_SPEED;
                skier_model.y -= speed;
                placeNewObstacle(NORTH);
            }
            break;

        case SOUTH:
            skier_model.direction = SOUTH;
            break;
    };
};
ActionDispatcher.on(ActionDispatcher.SKIER_MOVE, onSkierMoveInput);

const placeInitialObstacles = () => {
    const numberObstacles = Math.ceil(_.random(5, 7) * (game_width / 800) * (game_height / 500));

    const minX = -50;
    const maxX = game_width + 50;
    const minY = game_height / 2 + 100;
    const maxY = game_height + 50;

    for(let i = 0; i < numberObstacles; i++) {
        placeRandomObstacle(minX, maxX, minY, maxY);
    }

    const {loadedAssets} = LoadedAssetStore.get();

    all_obstacles = _.sortBy(all_obstacles, obstacle => {
        const obstacleImage = loadedAssets[obstacle.type];
        return obstacle.y + obstacleImage.height;
    });
};

const moveSkier = () => {
    const {direction, speed} = skier_model
    const DIAGONAL_SPEED = Math.round(speed / 1.4142)

    switch(direction) {
        case SKIER_DIRECTIONS.SOUTHWEST:
            skier_model.x -= DIAGONAL_SPEED;
            skier_model.y += DIAGONAL_SPEED;
            break;

        case SKIER_DIRECTIONS.SOUTH:
            skier_model.y += speed;
            break;

        case SKIER_DIRECTIONS.SOUTHEAST:
            skier_model.x += DIAGONAL_SPEED;
            skier_model.y += DIAGONAL_SPEED;
            break;
    }

    const {SOUTHWEST, SOUTH, SOUTHEAST} = SKIER_DIRECTIONS
    if([SOUTHWEST, SOUTH, SOUTHEAST].includes(direction)) {
        skier_model.speed *= ACCELLERATION;
        placeNewObstacle(direction);
    }
};

const placeNewObstacle = direction => {
    var shouldPlaceObstacle = _.random(1, 8);
    if(shouldPlaceObstacle !== 8) return;

    var leftEdge   = skier_model.x;
    var rightEdge  = skier_model.x + game_width;
    var topEdge    = skier_model.y;
    var bottomEdge = skier_model.y + game_height;

    switch(direction) {
        case SKIER_DIRECTIONS.WEST:
            placeRandomObstacle(leftEdge - 50, leftEdge, topEdge, bottomEdge);
            break;

        case SKIER_DIRECTIONS.SOUTHWEST:
            placeRandomObstacle(leftEdge - 50, leftEdge, topEdge, bottomEdge);
            placeRandomObstacle(leftEdge, rightEdge, bottomEdge, bottomEdge + 50);
            break;

        case SKIER_DIRECTIONS.SOUTH:
            placeRandomObstacle(leftEdge, rightEdge, bottomEdge, bottomEdge + 50);
            break;

        case SKIER_DIRECTIONS.SOUTHEAST:
            placeRandomObstacle(rightEdge, rightEdge + 50, topEdge, bottomEdge);
            placeRandomObstacle(leftEdge, rightEdge, bottomEdge, bottomEdge + 50);
            break;

        case SKIER_DIRECTIONS.EAST:
            placeRandomObstacle(rightEdge, rightEdge + 50, topEdge, bottomEdge);
            break;

        case SKIER_DIRECTIONS.NORTH:
            placeRandomObstacle(leftEdge, rightEdge, topEdge - 50, topEdge);
            break;
    }
};

const placeRandomObstacle = (minX, maxX, minY, maxY) => {
    const obstacleIndex = _.random(0, OBSTACLE_TYPES.length - 1);

    const position = calculateOpenPosition(minX, maxX, minY, maxY);

    all_obstacles.push({
        type : OBSTACLE_TYPES[obstacleIndex],
        x    : position.x,
        y    : position.y
    });
};

const calculateOpenPosition = (minX, maxX, minY, maxY) => {
    var x = _.random(minX, maxX);
    var y = _.random(minY, maxY);

    var foundCollision = _.find(all_obstacles, obstacle => {
        return x > (obstacle.x - 50) && x < (obstacle.x + 50) && y > (obstacle.y - 50) && y < (obstacle.y + 50);
    });

    if(foundCollision) {
        return calculateOpenPosition(minX, maxX, minY, maxY);
    }
    else {
        return {
            x: x,
            y: y
        }
    }
};

const checkIfSkierHitObstacle = () => {
    if(skier_model.jump_height > 1) return

    const skierImage     = LoadedAssetStore.getSkierAsset(skier_model);
    const {loadedAssets} = LoadedAssetStore.get();

    const skierRect = {
        left   : skier_model.x + game_width / 2,
        right  : skier_model.x + skierImage.width + game_width / 2,
        top    : skier_model.y + skierImage.height - 5 + game_height / 2,
        bottom : skier_model.y + skierImage.height + game_height / 2
    };

    let collided_obstacle_type;

    const collision = _.find(all_obstacles, obstacle => {
        const obstacleImage = loadedAssets[obstacle.type];
        const obstacleRect = {
            left   : obstacle.x,
            right  : obstacle.x + obstacleImage.width,
            top    : obstacle.y + obstacleImage.height - 5,
            bottom : obstacle.y + obstacleImage.height
        };

        if(intersectRect(skierRect, obstacleRect)) {
            collided_obstacle_type = obstacle.type;
            return true;
        }
        return false;
    });

    if(collision) {
        if (collided_obstacle_type == 'jump_ramp') doJump();
        else {
            skier_model.direction = SKIER_DIRECTIONS.NULL;
            skier_model.speed = BASE_SKIER_SPEED;
        }
    }
};

const intersectRect = (r1, r2) => {
    return !(r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top);
};

const doJump = () => {
    skier_model.last_takeoff = new Date().getTime();

    TweenMax.to(
        skier_model, 
        JUMP_AIR_TIME/2, // divide by 2 because of yoyo
        {
            jump_height : MAX_JUMP_HEIGHT,
            yoyo        : true,
            repeat      : 1,
            ease        : Expo.easeOut
        }
    );
}
