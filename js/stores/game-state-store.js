let game_width, game_height;
let loadedAssets; // TODO - keep in view layer
let getSkierAsset; // TODO - keep in view layer

const KEY_CODES = { // TODO - separate to input handler
    LEFT_ARROW  : 37,
    UP_ARROW    : 38,
    RIGHT_ARROW : 39,
    DOWN_ARROW  : 40
};

const SKIER_DIRECTIONS = {
    NULL      : 0,
    WEST      : 1,
    SOUTHWEST : 2,
    SOUTH     : 3,
    SOUTHEAST : 4,
    EAST      : 5,
    NORTH     : 6 
};   

const skier_model = {
    x         : 0, 
    y         : 0,
    direction : 5,
    speed     : 8
};

let all_obstacles    = [];
const OBSTACLE_TYPES = [
    'tree_1',
    'tree_cluster',
    'rock_1',
    'rock_2'
];

const GameStateStore = {
    SKIER_DIRECTIONS,

    init: (width, height, assets, getSkierAssetFunc) => {
        game_width  = width;
        game_height = height;
        loadedAssets = assets;
        getSkierAsset = getSkierAssetFunc;

        setupKeyhandler();
        placeInitialObstacles();
    },

    update: () => {
        moveSkier();
        checkIfSkierHitObstacle();
    },

    get: () => {
        return Object.assign({}, {
            skier_model,
            all_obstacles
        });
    }
}
module.exports = GameStateStore

const setupKeyhandler = () => {
    $(window).keydown(event => {
        const {direction, speed} = skier_model;
        const {NORTH, EAST, SOUTHEAST, SOUTH, SOUTHWEST, WEST} = SKIER_DIRECTIONS;

        switch(event.which) {
            case KEY_CODES.LEFT_ARROW:
                if([WEST, SOUTHWEST].includes(direction)) {
                    // step west
                    skier_model.direction = WEST;
                    skier_model.x -= speed;
                    placeNewObstacle(direction);
                }
                else skier_model.direction = SOUTHWEST;
                break;

            case KEY_CODES.RIGHT_ARROW:
                if([EAST, SOUTHEAST].includes(direction)) {
                    // step east
                    skier_model.direction = SKIER_DIRECTIONS.EAST;
                    skier_model.x += speed;
                    placeNewObstacle(direction);
                }
                else skier_model.direction = SOUTHEAST;
                break;

            case KEY_CODES.UP_ARROW:
                if([EAST, WEST].includes(direction)) {
                    // step up
                    skier_model.y -= speed;
                    placeNewObstacle(NORTH);
                }
                break;

            case KEY_CODES.DOWN_ARROW:
                skier_model.direction = SOUTH;
                break;
        }

        if(Object.values(KEY_CODES).includes(event.which)) event.preventDefault();
    });
};

const placeInitialObstacles = () => {
    const numberObstacles = Math.ceil(_.random(5, 7) * (game_width / 800) * (game_height / 500));

    const minX = -50;
    const maxX = game_width + 50;
    const minY = game_height / 2 + 100;
    const maxY = game_height + 50;

    for(let i = 0; i < numberObstacles; i++) {
        placeRandomObstacle(minX, maxX, minY, maxY);
    }

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
    if([SOUTHWEST, SOUTH, SOUTHEAST].includes(direction)) placeNewObstacle(direction);
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
    })
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
    var skierAssetName = getSkierAsset();
    var skierImage = loadedAssets[skierAssetName];
    var skierRect = {
        left   : skier_model.x + game_width / 2,
        right  : skier_model.x + skierImage.width + game_width / 2,
        top    : skier_model.y + skierImage.height - 5 + game_height / 2,
        bottom : skier_model.y + skierImage.height + game_height / 2
    };

    var collision = _.find(all_obstacles, function(obstacle) {
        var obstacleImage = loadedAssets[obstacle.type];
        var obstacleRect = {
            left   : obstacle.x,
            right  : obstacle.x + obstacleImage.width,
            top    : obstacle.y + obstacleImage.height - 5,
            bottom : obstacle.y + obstacleImage.height
        };

        return intersectRect(skierRect, obstacleRect);
    });

    if(collision) {
        skier_model.direction = SKIER_DIRECTIONS.NULL;
    }
};

const intersectRect = (r1, r2) => {
    return !(r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top);
};
