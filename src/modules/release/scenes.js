game.module(
    'modules.release.scenes'
)
.require(
    'engine.scene'
)
.body(function() {

    App.Release.Intro = game.Scene.extend({

        backgroundColor: 0x143559,

        init: function(){

            // List of Levels
            App.LevelList = App.getLevelList();
            
            // Get level
            this.level = game.storage.get("CurrentLevel");
            
            var assets = 0, i;

            // Aquire game assets
            assets += App.requireAsset("Roboto-export.png");
            assets += App.requireAsset("Roboto-export.fnt");
            assets += App.requireAsset("pause.png");
            assets += App.requireAsset("pause_sound.png");
            assets += App.requireAsset("pause_vibrate.png");
            assets += App.requireAsset("pause_quit.png");
            assets += App.requireAsset("pause_resume.png");
            assets += App.requireAsset("release/icon.png");
            assets += App.requireAsset("release/shape.png");
            assets += App.requireAsset("release/level_3_intro_1.png");
            assets += App.requireSound("audio/launch_fire.wav", "launch_fire");
            assets += App.requireSound("audio/launch_bg.wav", "launch_bg");

            // Add icon assets
            for(i = 1; i <= 25; i += 1) {
                assets += App.requireAsset("release/"+i+".png");
            }

            // Colours
            switch (this.level) {

                //sequence is: spark, nucleus, cog, background
                case 0:
                    App.currentPalette = [0xf5c908, 0x52b6b0, 0xe59828, 0x394551];
                    break;
                case 1:
                    App.currentPalette = [0xfddc8a, 0x87c666, 0x37ced1, 0x2e5a39];
                    break;
                case 2:
                    App.currentPalette = [0xffde8b, 0xcb257d, 0xff8f57, 0x511844];
                    break;

            }

            // Set bg colour
            game.system.stage.setBackgroundColor(App.currentPalette[3]);

            // Container
            this.loading = new game.Container();
            this.loading.scale.set(App.deviceScale(), App.deviceScale());

            // If assets to load
            if(assets) {

                // Create loader
                this.loader = new game.Loader();

                // Set dynamic
                this.loader.dynamic = true;

                // Objects
                this.loadingText = new game.Text( "Loading...".toUpperCase(), { fill: "white", font: 'bold 72px sans-serif' } );
                this.loadingText.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.loadingText.width / 2);
                this.loadingText.position.y = ((game.system.height / App.deviceScale()) / 2) - (this.loadingText.height / 2);
                this.bar = new game.Graphics();
                this.bar.beginFill(App.currentPalette[1]); 
                this.bar.drawRect(0, 0, (game.system.width / App.deviceScale()), (game.system.height / App.deviceScale()));
                this.bar.position.y = 0;
                this.bar.position.x = -(game.system.width / App.deviceScale());
                this.bar.endFill();

                // Add to sprite
                this.loading.addChild(this.bar);
                this.loading.addChild(this.loadingText);

                // Add to scene
                this.stage.addChild(this.loading);

                // Start loading
                this.loader.start();

            } else {

                // Skip preloading
                this.loaded();         

            }

        },

        loaded: function(){

            var text1, text2, text3, GameIntro;

            // Get level
            this.level = game.storage.get("CurrentLevel");

            App.sendPageView('Release Challenge - Level ' + (this.level+1));

            // Set intro text
            switch (this.level) {
                case 0:
                    text1 = "Launch while the hype is hot.";
                    text2 = "Tap “Launch” when your hype is at its highest.";
                    text3 = "For the best launch, hit it when your rivals’ hype is low.";
                    break;
                case 1:
                    text1 = "Time to release your app into the wild.";
                    text2 = "Tap “Launch” when your hype is at its highest.";
                    text3 = "For the best launch, hit it when your rivals’ hype is low.";
                    break;
                case 2:
                    text1 = "It’s time for app lift off!";
                    text2 = "Tap “Launch” when your hype is at its highest.";
                    text3 = "For the best launch, hit it when your rivals’ hype is low.";
                    break;
            }

            // Create level object
            GameIntro = App.GameIntro.extend({ 
                icon: "media/release/icon.png",
                title: text1,
                text1: text2,
                text2: text3,
                img1: ["media/release/level_3_intro_1.png", 568, 160],
                img2: [""],
                link: App.Release.Game
            });

            // Create
            this.gameIntro = new GameIntro();

        },

        update: function(){

            this._super();

            // Check loader is available
            if(this.loader) {

                // Check loader started
                if(this.loader.started) {

                    // Move the bar
                    this.bar.position.x += (2500 * game.system.delta);

                    // Check bar is not overrun
                    if(this.bar.position.x > (-(game.system.width / App.deviceScale()) + ( (game.system.width / App.deviceScale()) / 100) * this.loader.percent)) {

                        // Reset bar position
                        this.bar.position.x = -(game.system.width / App.deviceScale()) + (((game.system.width / App.deviceScale()) / 100) * this.loader.percent);

                    }

                    // If bar is finished
                    if(this.bar.position.x >= 0) {

                        // Remove the loading screen
                        this.stage.removeChild(this.loading);

                        // Reset loader
                        this.loader.started = false;

                        // Fire callback
                        this.loaded();

                    }
                }
            }

        }

    });

    App.Release.Game = game.Scene.extend({

        backgroundColor: 0xaee8d0,
        meters: [],
        score:0,

        init: function(){

            var i, Hype;

            // Set bg colour
            game.system.stage.setBackgroundColor(App.currentPalette[3]);

            // Get level
            this.level = game.storage.get("CurrentLevel");

            // Container
            this.container = new game.Container();
            this.container.scale.set(App.deviceScale(), App.deviceScale());

            // Screenfill
            this.screenFill = new game.Graphics();
            this.screenFill.beginFill(App.currentPalette[1]);
            this.screenFill.drawCircle(0, 0, game.system.width * 1.5);
            this.screenFill.endFill();
            this.screenFill.position.x = (game.system.width / App.deviceScale()) / 2;
            this.screenFill.position.y = (game.system.height / App.deviceScale()) / 1.7;
            this.screenFill.scale = { x: 0, y: 0 };

            // Capture position
            this.positions = [];

            // Check level 1
            if(this.level === 0) {

                // Set hypmeter position
                this.positions[0] = ((game.system.width / App.deviceScale()) / 12) * 3;
                this.positions[1] = ((game.system.width / App.deviceScale()) / 12) * 9;

                // Set player id
                this.playerId = 0;

                // Difficulty
                this.difficulty = 1;

            }
            
            // Check level 2
            if(this.level === 1) {

                // Set hypmeter position
                this.positions[0] = ((game.system.width / App.deviceScale()) / 12) * 3;
                this.positions[1] = ((game.system.width / App.deviceScale()) / 12) * 9;

                // Set player id
                this.playerId = 0;

                // Difficulty
                this.difficulty = 2;

            }
            
            // Check level 3
            if(this.level === 2) {

                // Set hypmeter position
                this.positions[0] = ((game.system.width / App.deviceScale()) / 12) * 2;
                this.positions[1] = ((game.system.width / App.deviceScale()) / 12) * 6;
                this.positions[2] = ((game.system.width / App.deviceScale()) / 12) * 10;

                // Set player id
                this.playerId = 1;

                // Difficulty
                this.difficulty = 2;

            }

            // Hype-o-meter
            for(i = 0; i < this.positions.length; i += 1) {

                // Create level object
                Hype = App.Release.Hype.extend({ 
                    id: i,
                    difficulty: this.difficulty,
                    isPlayer: (this.playerId === i) ? true : false
                });

                // Store hype meter
                this.meters.push(new Hype());

            }           

            // Countdown
            this.deltaMultiplier = 1;
            this.countdown = new App.Release.Countdown();

            // Sounds
            App.playMusic("launch_bg", 0.5);

            // Pause
            this.stage.addChild(this.container);
            this.pauseButton = new App.Pause.PauseButton();

        },

        update: function() {

            if(App.developer) {
                App.stats.begin();
            }

            if(!App.paused) {
                this._super();
            }

            if(App.developer) {
                App.stats.end();
            }

        },

        endGame: function(){

            var self = this, i, fillTween;

            // Reset score
            this.score = 0;

            // Loop through hypometers
            for(i = 0; i < this.positions.length; i += 1) {

                // Check if the item is player
                if(this.meters[i].isPlayer) {

                    // Add player score
                    this.score += this.meters[i].score;
                } else {

                    // subtract other scores
                    this.score += (100 - this.meters[i].score);
                }

            }

            // Play sound
            App.playSound("launch_fire");

            // Calculate overall score
            this.overallScore = Math.floor(this.score/this.positions.length);

            // Add screenfill outro graphic
            this.container.addChild(this.screenFill);

            // Create tweens
            fillTween = new game.Tween(this.screenFill.scale);
            fillTween.to({ x: 1, y: 1 }, 1500);
            fillTween.onComplete(function(){
                game.audio.stopMusic();
                game.storage.set("game_3_score", self.overallScore);
                game.system.setScene(App.Release.Outro);
            });

            // Start tweens
            fillTween.start();

        }

    });

    App.Release.Outro = game.Scene.extend({

        backgroundColor: 0xaee8d0,

        init: function(){

            // Get/Set app name
            if(!game.storage.get("CurrentAppName")) {
                game.storage.set("CurrentAppName", App.generateName());
            }

            // Get score
            this.score = Math.floor(game.storage.get("game_3_score")) || 0;

            // Create level object
            var GameOutro = App.GameOutro.extend({ 

                icon: "media/release/icon.png",
                title: "You launched",
                shape: "media/release/shape.png",
                score: this.score + "%"

            });

            // Create
            this.gameOutro = new GameOutro();

        }

    });

});
