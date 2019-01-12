import {
	GameStateStore,
	AssetStore,
} from 'stores';
import {Howl} from 'howler';

const sounds = {};

GameStateStore.on(GameStateStore.FIRST_SKIER_MOVE, () => {
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

GameStateStore.on(GameStateStore.SKIER_JUMP, () => {
	sounds.whoosh.play();
});

GameStateStore.on(GameStateStore.JUMP_COMPLETE, () => {
	sounds.feet_dirt.play();
	setTimeout(() => {sounds.score.play();}, 250);
});

GameStateStore.on(GameStateStore.SKIER_COLLISION, () => {
	sounds.body_fall.play();
	setTimeout(() => {sounds.fail.play();}, 250);
});
