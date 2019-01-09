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

	getSkierAsset: (skier_direction) => {
	    const {NULL, WEST, SOUTHWEST, SOUTH, SOUTHEAST, EAST} = Constants.get().SKIER_DIRECTIONS

	    switch(skier_direction) {
	        case NULL      : return loadedAssets.skier_crash;
	        case WEST      : return loadedAssets.skier_left;
	        case SOUTHWEST : return loadedAssets.skier_left_down;
	        case SOUTH     : return loadedAssets.skier_down;
	        case SOUTHEAST : return loadedAssets.skier_right_down;
	        case EAST      : return loadedAssets.skier_right;

	        default        : throw `Invalid skier_direction (${skier_direction}) in LoadedAssetStore.getSkierAsset()`;
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
        
        assetImage.width /= 2;
        assetImage.height /= 2;
        
        loadedAssets[img_key] = assetImage;
    };
};
