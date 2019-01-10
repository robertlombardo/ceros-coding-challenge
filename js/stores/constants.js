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
                NORTH     : 'DIR_NORTH',
                EAST      : 'DIR_EAST',
                SOUTHEAST : 'DIR_SOUTHEAST',
                SOUTH     : 'DIR_SOUTH',
                SOUTHWEST : 'DIR_SOUTHWEST',
                WEST      : 'DIR_WEST',
                NULL      : 'DIR_NULL'
            },

            BASE_SKIER_SPEED : 8,    // px/second
            ACCELLERATION    : 1.0004,
            JUMP_AIR_TIME    : 1.16, // seconds
            MAX_JUMP_HEIGHT  : 2.3   // arbitrary - used for scaling the skier img
        });
    }
};
