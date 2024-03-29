import {
	GameModel,
	AssetStore,
} from 'stores';
import {Howl} from 'howler';

const sounds = {};

GameModel.on(GameModel.FIRST_SKIER_MOVE, () => {
	// instantiate audio objects (must be in response to user input)
	const {sound_paths} = AssetStore.get();
	for(let key in sound_paths) {
		const src = [sound_paths[key]]

		switch(key) {
			case 'fail' : sounds[key] = new Howl({src, volume: 0.5}); break;
			case 'bgm'  : sounds[key] = new Howl({src, html5: true, loop: true}); break; // html5 flag allows playback to start before download completes
			default     : sounds[key] = new Howl({src});
		}

	}

	sounds.bgm.play();
});

GameModel.on(GameModel.SKIER_JUMP, () => {
	sounds.whoosh.play();
});

GameModel.on(GameModel.JUMP_COMPLETE, () => {
	sounds.feet_dirt.play();
	setTimeout(() => {sounds.score.play();}, 250);
});

GameModel.on(GameModel.SKIER_COLLISION, () => {
	sounds.body_fall.play();
	setTimeout(() => {sounds.fail.play();}, 250);
});
