import ActionDispatcher from 'action-dispatcher'
import Constants        from './constants'

const img_paths = {
	jump_ramp    	 : 'assets/img/jump_ramp.png',
	rock_1  	 	 : 'assets/img/rock_1.png',
	rock_2 		 	 : 'assets/img/rock_2.png',
	skier_crash  	 : 'assets/img/skier_crash.png',
	skier_down   	 : 'assets/img/skier_down.png',
	skier_jump_1 	 : 'assets/img/skier_jump_1.png',
	skier_jump_2 	 : 'assets/img/skier_jump_2.png',
	skier_jump_3 	 : 'assets/img/skier_jump_3.png',
	skier_jump_4 	 : 'assets/img/skier_jump_4.png',
	skier_jump_5 	 : 'assets/img/skier_jump_5.png',
	skier_left 	     : 'assets/img/skier_left.png',
	skier_left_down  : 'assets/img/skier_left_down.png',
	skier_right 	 : 'assets/img/skier_right.png',
	skier_right_down : 'assets/img/skier_right_down.png',
	tree_1 			 : 'assets/img/tree_1.png',
	tree_cluster 	 : 'assets/img/tree_cluster.png',
};

const sound_paths = {
	whoosh    : 'assets/audio/SFX_whoosh.wav',
	feet_dirt : 'assets/audio/SFX_feet_dirt.wav',
	score     : 'assets/audio/SFX_score.wav',
	body_fall : 'assets/audio/SFX_body_fall.wav',
	fail      : 'assets/audio/SFX_fail.wav',
	bgm       : 'assets/audio/BGM.mp3'
};

let loading_progress = 0;
const img_assets     = {};

const AssetStore = {
	get: () => {
		return Object.assign({}, {
			loading_progress,
			img_assets,
			sound_paths,
		});
	},

	getSkierAsset: (skier_model) => {
		const {jump_height} = skier_model;
		if(jump_height > 1) {
			const air_time_delta  = (new Date().getTime() - skier_model.last_takeoff) / 1000;
			const {JUMP_AIR_TIME} = Constants.get();
			
			if (air_time_delta > JUMP_AIR_TIME*0.85) return img_assets.skier_jump_5;
			if (air_time_delta > JUMP_AIR_TIME*0.60) return img_assets.skier_jump_4;
			if (air_time_delta > JUMP_AIR_TIME*0.35) return img_assets.skier_jump_3;
			if (air_time_delta > JUMP_AIR_TIME*0.15) return img_assets.skier_jump_2;
			return img_assets.skier_jump_1;
		} else {
		    const {NULL, WEST, SOUTHWEST, SOUTH, SOUTHEAST, EAST} = Constants.get().SKIER_DIRECTIONS

		    switch(skier_model.direction) {
		        case NULL      : return img_assets.skier_crash;
		        case WEST      : return img_assets.skier_left;
		        case SOUTHWEST : return img_assets.skier_left_down;
		        case SOUTH     : return img_assets.skier_down;
		        case SOUTHEAST : return img_assets.skier_right_down;
		        case EAST      : return img_assets.skier_right;

		        default        : throw `Invalid skier_model.direction (${skier_direction}) in AssetStore.getSkierAsset()`;
		    }
		}
	},

	test_private: {
		onAssetsLoaded
	}
};
export default AssetStore;

ActionDispatcher.once(ActionDispatcher.WINDOW_ONLOAD, () => {
 	const queue = new createjs.LoadQueue();
	
	queue.on('progress', (event) => {
		loading_progress = event.progress;
		ActionDispatcher.dispatch(ActionDispatcher.LOADING_PROGRESS, loading_progress)
	})
	
	queue.on('complete', onAssetsLoaded);

	// track image file loading
	for(let key in img_paths) queue.loadFile({id: key, src: img_paths[key]});

	// track sound file loading
	queue.installPlugin(createjs.Sound);
	for(let key in sound_paths) queue.loadFile({id: key, src: sound_paths[key]});
});

const onAssetsLoaded = () => {
	for (let img_key in img_paths) {
        const assetImage = new Image();
        assetImage.src = img_paths[img_key];
       
       	if (img_key !== 'jump_ramp') { 
	        assetImage.onload = function() {
		        this.width /= 2;
		        this.height /= 2;
		    }
	    }
        
        img_assets[img_key] = assetImage;
    };

    ActionDispatcher.dispatch(ActionDispatcher.ASSETS_LOADED, img_assets);
};
