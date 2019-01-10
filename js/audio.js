import {GameStateStore} from 'stores';
import {Howl}           from 'howler';

let sounds;

GameStateStore.on(GameStateStore.FIRST_SKIER_MOVE, () => {
	sounds = {
		bgm       : new Howl({src:['assets/audio/BGM.mp3'], loop: true}),
		whoosh    : new Howl({src:['assets/audio/SFX_whoosh.wav']}),
		feet_dirt : new Howl({src:['assets/audio/SFX_feet_dirt.wav']}),
		score     : new Howl({src:['assets/audio/SFX_score.wav']}),
		body_fall : new Howl({src:['assets/audio/SFX_body_fall.wav']}),
		fail      : new Howl({src:['assets/audio/SFX_fail.wav'], volume: 0.5})
	};

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
