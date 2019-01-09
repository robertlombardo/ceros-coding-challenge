import ActionDispatcher   from '../action-dispatcher'
import Images             from 'img'
import Constants          from './constants'

const loadedAssets = {};

const LoadedAssetStore = {
	get: () => {
		return Object.assign({}, {
			loadedAssets
		});
	},

	getSkierAsset: (skier_model) => {
		const {jump_height} = skier_model;
		if(jump_height > 1) {
			const air_time_delta  = (new Date().getTime() - skier_model.last_takeoff) / 1000;
			const {JUMP_AIR_TIME} = Constants.get();
			
			if (air_time_delta > JUMP_AIR_TIME*0.85) return loadedAssets.skier_jump_5;
			if (air_time_delta > JUMP_AIR_TIME*0.60) return loadedAssets.skier_jump_4;
			if (air_time_delta > JUMP_AIR_TIME*0.35) return loadedAssets.skier_jump_3;
			if (air_time_delta > JUMP_AIR_TIME*0.15) return loadedAssets.skier_jump_2;
			return loadedAssets.skier_jump_1;
		} else {
		    const {NULL, WEST, SOUTHWEST, SOUTH, SOUTHEAST, EAST} = Constants.get().SKIER_DIRECTIONS

		    switch(skier_model.direction) {
		        case NULL      : return loadedAssets.skier_crash;
		        case WEST      : return loadedAssets.skier_left;
		        case SOUTHWEST : return loadedAssets.skier_left_down;
		        case SOUTH     : return loadedAssets.skier_down;
		        case SOUTHEAST : return loadedAssets.skier_right_down;
		        case EAST      : return loadedAssets.skier_right;

		        default        : throw `Invalid skier_model.direction (${skier_direction}) in LoadedAssetStore.getSkierAsset()`;
		    }
		}
	},

	test_private: {
		loadAssets
	}
};
export default LoadedAssetStore;

ActionDispatcher.once(ActionDispatcher.DOCUMENT_READY, () => {
    loadAssets();
    ActionDispatcher.dispatch(ActionDispatcher.ASSETS_LOADED, loadedAssets)
});

const loadAssets = () => {
	for (let img_key in Images) {
        const assetImage = new Image();
        assetImage.src = Images[img_key];
       
       	if (img_key !== 'jump_ramp') { 
	        assetImage.width /= 2;
	        assetImage.height /= 2;
	    }
        
        loadedAssets[img_key] = assetImage;
    };
};
