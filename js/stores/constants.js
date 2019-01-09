export default {
    get: () => {
        return Object.assign({}, {
            KEY_CODES: {
                LEFT_ARROW  : 37,
                UP_ARROW    : 38,
                RIGHT_ARROW : 39,
                DOWN_ARROW  : 40
            },

            SKIER_DIRECTIONS: {
                NULL      : 0,
                WEST      : 1,
                SOUTHWEST : 2,
                SOUTH     : 3,
                SOUTHEAST : 4,
                EAST      : 5,
                NORTH     : 6 
            }
        });
    }
};
