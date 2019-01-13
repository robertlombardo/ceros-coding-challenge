import {
	AssetStore,
	GameStateStore,
	Constants,
} from 'stores';
import assert from 'assert';

describe('GameStateStore', function() {
	before(function() {
		// mock up some things that normally rely on a browser window
		global.window = {innerWidth: 500 + Math.random()*2000, innerHeight: 500 + Math.random()*2000};
		global.Image = () => {return {width: 32, height: 32}};

		// mock up loaded img assets
		AssetStore.get = () => {
			return {
				img_assets: {
					jump_ramp    	 : new Image(),
					rock_1  	 	 : new Image(),
					rock_2 		 	 : new Image(),
					skier_crash  	 : new Image(),
					skier_down   	 : new Image(),
					skier_jump_1 	 : new Image(),
					skier_jump_2 	 : new Image(),
					skier_jump_3 	 : new Image(),
					skier_jump_4 	 : new Image(),
					skier_jump_5 	 : new Image(),
					skier_left 	     : new Image(),
					skier_left_down  : new Image(),
					skier_right 	 : new Image(),
					skier_right_down : new Image(),
					tree_1 			 : new Image(),
					tree_cluster 	 : new Image()
				}
			};
		}	
	});

	describe('#calculateOpenPosition()', function() {
		it('should return the specified position if there are no other obstacles', function() {
			assert(GameStateStore.get().all_obstacles.length == 0);
			const pos = GameStateStore.test_private.calculateOpenPosition(1, 1, 2, 2)
			assert(pos.x === 1 && pos.y === 2);
		});

		it('should never return a position within OBSTACLE_MARGIN of an existing obstacle', function() {
			const {OBSTACLE_MARGIN} = Constants.get();
			const mock_obstacle     = {x: 500, y: 500, width: 10, height: 10};
			GameStateStore.get().all_obstacles.push(mock_obstacle);

			for(let i = 0; i < 100; ++i) {
				const pos = GameStateStore.test_private.calculateOpenPosition(0, 1000, 0, 1000);
				assert(
		               pos.x >= (mock_obstacle.x + OBSTACLE_MARGIN) 
		            || pos.x <= (mock_obstacle.x - OBSTACLE_MARGIN)
		            || pos.y >= (mock_obstacle.y + OBSTACLE_MARGIN) 
		            || pos.y <= (mock_obstacle.y - OBSTACLE_MARGIN)
		        );
			}
		});
	});

	describe('#createRandomObstacle()', function() {
		it('should have a valid obstacle type', function() {
			const obstacle = GameStateStore.test_private.createRandomObstacle(0, window.innerWidth, 0, window.innerHeight);
			assert(Constants.get().OBSTACLE_TYPES.includes(obstacle.type))
		});
	});

	describe('#getInitialObstacles()', function() {
	    let initial_obstacles;

	    before(function() {
			initial_obstacles = GameStateStore.test_private.getInitialObstacles();
		});

	    it('should create Math.ceil(_.random(5, 7) * (window.innerWidth / 800) * (window.innerHeight / 500)); number of obstacles', function() {
	    	const {innerWidth, innerHeight} = window;
	    	const seed = (innerWidth/800) * (innerHeight/500);
	    	const min  = Math.ceil(5 * seed);
	    	const max  = Math.ceil(7 * seed);
	    	
	    	assert(initial_obstacles.length >= min && initial_obstacles.length <= max);
	    });

	    it('should x-position all initial obstacles between -50 and window.innerWidth + 50', function() {
	    	for(let obstacle of initial_obstacles) assert(obstacle.x >= -50 && obstacle.x <= window.innerWidth+50);
	    });

	    it('should y-position all initial obstacles between window.innerHeight/2 + 100 and window.innerHeight + 50', function() {
	    	for(let obstacle of initial_obstacles) assert(obstacle.y >= window.innerHeight/2 + 100 && obstacle.y <= window.innerHeight+50);
	    });
  	});

  	describe('#placeNewObstacle()', function() {
  		const {setGameDimensions, placeNewObstacle} = GameStateStore.test_private;
  		const {WEST, SOUTHWEST, SOUTH, SOUTHEAST, EAST, NORTH} = Constants.get().SKIER_DIRECTIONS;
  		let leftEdge, rightEdge, topEdge, bottomEdge;

  		before(function() {
  			setGameDimensions(100000, 100000);
  		});

  		beforeEach(function() {
  			const {skier_model, game_width, game_height} = GameStateStore.get();
  			skier_model.x = Math.random()*game_width;
  			skier_model.y = Math.random()*game_height;

  			leftEdge   = skier_model.x;
			rightEdge  = skier_model.x + game_width;
			topEdge    = skier_model.y;
			bottomEdge = skier_model.y + game_height;
  		});

		it('should only add an obstacle 1 out of every 8 calls', function() {
			const {all_obstacles}      = GameStateStore.get();
			const num_obstacles_before = all_obstacles.length;
			const num_calls            = 3000;

			for(let i = 0; i < num_calls; ++i) placeNewObstacle(SOUTH);

			const num_added    = all_obstacles.length - num_obstacles_before;
			const expected_num = num_calls / 8;
			const deviation    = expected_num * 0.15;

			assert(num_added >= expected_num-deviation && num_added <= expected_num+deviation);
		});

		it('direction:WEST - should place 1 obstacle 50px beyond the left edge', function() {
			placeNewObstacle(WEST, true);
			const {x, y} = GameStateStore.get().all_obstacles.pop();
			
			assert(
				   x >= leftEdge - 50
				&& x <= leftEdge
				&& y >= topEdge
				&& y <= bottomEdge
			);
		});

		it('direction:SOUTHWEST - should place 1 obstacle 50px beyond the left edge & 1 obstacle 50px beyond the bottom edge', function() {
			placeNewObstacle(SOUTHWEST, true);

			const {all_obstacles} = GameStateStore.get();
			const bottom_obstacle = all_obstacles.pop();	
			const left_obstacle   = all_obstacles.pop();

			assert(
				   left_obstacle.x >= leftEdge - 50
				&& left_obstacle.x <= leftEdge
				&& left_obstacle.y >= topEdge
				&& left_obstacle.y <= bottomEdge
			);
			assert(
				   bottom_obstacle.x >= leftEdge
				&& bottom_obstacle.x <= rightEdge
				&& bottom_obstacle.y >= bottomEdge
				&& bottom_obstacle.y <= bottomEdge + 50
			);
		});

		it('direction:SOUTH - should place 1 obstacle 50px beyond the bottom edge', function() {
			placeNewObstacle(SOUTH, true);
			const {x, y} = GameStateStore.get().all_obstacles.pop();
			
			assert(
				   x >= leftEdge
				&& x <= rightEdge
				&& y >= bottomEdge
				&& y <= bottomEdge + 50
			);
		});

		it('direction:SOUTHEAST - should place 1 obstacle 50px beyond the right edge & 1 obstacle 50px beyond the bottom edge', function() {
			placeNewObstacle(SOUTHEAST, true);

			const {all_obstacles} = GameStateStore.get();
			const bottom_obstacle = all_obstacles.pop();	
			const right_obstacle  = all_obstacles.pop();

			assert(
				   right_obstacle.x >= rightEdge
				&& right_obstacle.x <= rightEdge + 50
				&& right_obstacle.y >= topEdge
				&& right_obstacle.y <= bottomEdge
			);
			assert(
				   bottom_obstacle.x >= leftEdge
				&& bottom_obstacle.x <= rightEdge
				&& bottom_obstacle.y >= bottomEdge
				&& bottom_obstacle.y <= bottomEdge + 50
			);
		});

		it('direction:EAST - should place 1 obstacle 50px beyond the left edge', function() {
			placeNewObstacle(EAST, true);
			const {x, y} = GameStateStore.get().all_obstacles.pop();
			
			assert(
				   x >= rightEdge
				&& x <= rightEdge + 50
				&& y >= topEdge
				&& y <= bottomEdge
			);
		});

		it('direction:NORTH - should place 1 obstacle 50px beyond the bottom edge', function() {
			placeNewObstacle(NORTH, true);
			const {x, y} = GameStateStore.get().all_obstacles.pop();
			
			assert(
				   x >= leftEdge
				&& x <= rightEdge
				&& y >= topEdge - 50
				&& y <= topEdge
			);
		});
	});

  	describe('#addToScore()', function() {
  		const {addToScore} = GameStateStore.test_private;

		it('should add the given value to the score', function() {
			const score_before = GameStateStore.get().score;
			let num_to_add     = Math.random() * 1000;
			
			addToScore(num_to_add);
			
			assert(GameStateStore.get().score - num_to_add === score_before);
		});

		it('should replace best_score if the new value is higher', function() {
			const best_before = GameStateStore.get().best_score;
			addToScore(best_before + 1);
			assert(GameStateStore.get().best_score > best_before);
		});

		it('should NOT replace best_score if the new value is not higher', function() {
			const best_before = GameStateStore.get().best_score;
			addToScore(-500);
			assert(GameStateStore.get().best_score === best_before);
			addToScore(499);
			assert(GameStateStore.get().best_score === best_before);
		});

		it('should add best_score to localStorage whenever updated', function() {
			const best_before = GameStateStore.get().best_score;
			addToScore(best_before + 1);
			const new_best = GameStateStore.get().best_score;
			const from_local_storage = parseInt(localStorage.getItem(Constants.get().LOCAL_STORAGE_KEY), 10)
			assert(Math.floor(new_best) === from_local_storage);
		});
	});
});
