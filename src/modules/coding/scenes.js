game.module(
    'modules.coding.scenes'
)
.require(
    'engine.scene'
)
.body(function() {

    App.Coding.Intro = game.Scene.extend({

        backgroundColor: 0x143559,

        init: function(){

            // List of Levels
            App.LevelList = App.getLevelList();
            
            // Get level
            this.level = game.storage.get("CurrentLevel");
            
            var assets = 0;

            // Aquire generic assets
            assets += App.requireAsset("Roboto-export.png");
            assets += App.requireAsset("Roboto-export.fnt");
            assets += App.requireAsset("pause.png");
            assets += App.requireAsset("pause_sound.png");
            assets += App.requireAsset("pause_vibrate.png");
            assets += App.requireAsset("pause_quit.png");
            assets += App.requireAsset("pause_resume.png");

            // Aquire game assets
            assets += App.requireAsset("coding/icon.png");
            assets += App.requireAsset("coding/shape.png");
            assets += App.requireAsset("coding/code.png");
            assets += App.requireAsset("coding/cord.png");
            assets += App.requireAsset("coding/squish.png");
            assets += App.requireAsset("coding/mouse_"+(this.level+1)+".png");
            assets += App.requireAsset("coding/bug.png");
            assets += App.requireAsset("coding/keyboard.png");
            assets += App.requireAsset("coding/level_2_intro_1.png");
            assets += App.requireAsset("coding/level_2_intro_2.png");

            // Sound
            assets += App.requireSound("audio/coding_click.wav", "coding_click"); 
            assets += App.requireSound("audio/coding_bg.wav", "coding_bg");
            assets += App.requireSound("audio/coding_debug.wav", "coding_debug");

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

                // Add items to sprite
                this.loading.addChild(this.bar);
                this.loading.addChild(this.loadingText);

                // Add item to stage
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

            // Analytics 
            App.sendPageView('Coding Challenge - Level ' + (this.level+1));

            // Set intro text
            switch (this.level) {
                case 0:
                    text1 = "Demo your sweet coding skills.";
                    text2 = "Tap the symbols as they hit the mouse to avoid creating bugs.";
                    text3 = "Fix the bugs by tapping on them as fast as you can.";
                    break;
                case 1:
                    text1 = "Let’s get coding.";
                    text2 = "Tap the symbols as they hit the mouse to avoid creating bugs.";
                    text3 = "Fix the bugs by tapping on them as fast as you can.";
                    break;
                case 2:
                    text1 = "Let the coding begin!";
                    text2 = "Tap the symbols as they hit the mouse to avoid creating bugs.";
                    text3 = "Fix the bugs by tapping on them as fast as you can.";
                    break;
            }

            // Create level object
            GameIntro = App.GameIntro.extend({ 
                icon: "media/coding/icon.png",
                title: text1,
                text1: text2,
                text2: text3,
                img1: ["media/coding/level_2_intro_1.png", 320, 80],
                img2: ["media/coding/level_2_intro_2.png", 320, 80],
                link: App.Coding.Game
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

    App.Coding.Game = game.Scene.extend({

        backgroundColor: 0x3c495b,
        score: 0,
        rows: [],
        counter:0,
        timeleft:30,
        positions: [],
        difficulty: [
            ["e", 5],
            ["m", 5],
            ["h", 5],
            ["h", 5],
            ["h", 5],
            ["h", 5]
        ],

        init: function(){

            // Set bg colour
            game.system.stage.setBackgroundColor(App.currentPalette[3]);

            // Get level
            this.level = game.storage.get("CurrentLevel") || 0;

            var mouse_ratio, cord_ratio, keyboard_ratio;

            // Start the music
            App.playMusic("coding_bg", 0.5);

            // Container
            this.container = new game.Container();
            this.container.scale.set(App.deviceScale(), App.deviceScale());

            // Screenflash
            this.flash = new game.Graphics();
            this.flash.beginFill(0xFFFFFF);
            this.flash.drawRect(0, 0, (game.system.width / App.deviceScale()), (game.system.height / App.deviceScale()));
            this.flash.endFill();
            this.flash.alpha = 0;

            // Death field
            this.deathField = new game.Graphics();
            this.deathField.beginFill(0xFFFFFF);
            this.deathField.drawRect(0, 0, (game.system.width / App.deviceScale()), (game.system.height / App.deviceScale()));
            this.deathField.endFill();
            this.deathField.position.x = (game.system.width / App.deviceScale());
            this.deathField.position.y = 0;
            this.deathField.alpha = 0.5;
            this.deathField.tint = 0xFF0000;

            // Capture position
            this.positions[0] = ((game.system.height / App.deviceScale()) / 2) + 32 - 144;
            this.positions[1] = ((game.system.height / App.deviceScale()) / 2) + 32;
            this.positions[2] = ((game.system.height / App.deviceScale()) / 2) + 32 + 144;

            // Movement guides
            this.guides = new game.Graphics();
            this.guides.beginFill(App.currentPalette[1]); // GREEN
            this.guides.drawRect(0, this.positions[0] - 72, (game.system.width / App.deviceScale()), 144);
            this.guides.beginFill(App.currentPalette[2]); // RED
            this.guides.drawRect(0, this.positions[1] - 72, (game.system.width / App.deviceScale()), 144);
            this.guides.beginFill(App.currentPalette[0]); // BLUE
            this.guides.drawRect(0, this.positions[2] - 72, (game.system.width / App.deviceScale()), 144);
            this.guides.endFill();
            this.guides.alpha = 0.25;

            this.mouse = new game.PIXI.Sprite.fromImage('media/coding/mouse_'+ (this.level+1) +'.png', 0, 0);
            mouse_ratio = this.mouse.width / this.mouse.height;
            this.mouse.height = 456;
            this.mouse.width = this.mouse.height * mouse_ratio;
            this.mouse.position.x = (game.system.width / App.deviceScale()) - this.mouse.width;
            this.mouse.position.y = this.positions[1] - (this.mouse.height / 2);

            this.cord = new game.PIXI.Sprite.fromImage('media/coding/cord.png', 0, 0);
            cord_ratio = this.cord.width / this.cord.height;
            this.cord.height = 600;
            this.cord.width = this.cord.height * cord_ratio;
            this.cord.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.cord.width / 2) - (this.mouse.width / 2);
            this.cord.position.y = this.positions[1] - (this.cord.height / 2);

            this.keyboard = new game.PIXI.Sprite.fromImage('media/coding/keyboard.png', 0, 0);
            keyboard_ratio = this.keyboard.width / this.keyboard.height;
            this.keyboard.height = 504;
            this.keyboard.width = this.keyboard.height * keyboard_ratio;
            this.keyboard.position.x = 0;
            this.keyboard.position.y = this.positions[1] - (this.keyboard.height / 2);

            // Set the point where the items can start scoring
            this.mouseZoneStart = (game.system.width / App.deviceScale()) - this.mouse.width;

            // Text box
            this.textBox = new game.Text("Text Box!", { fill: "white", font: 'bold 64px sans-serif' } );
            this.textBox.position.y = 64;
            this.textBox.alpha = 0;

            this.difficulty = App.shuffleArray(this.difficulty);

            // Speed difficulty
            this.speed = 100 + ((this.level+1) * 100);

            // Bugs mode
            if(this.level === 0) {
                this.bugsCount = 3;
                this.total = 78;
            }
            if(this.level === 1) {
                this.bugsCount = 4;
                this.total = 92;
            }
            if(this.level === 2) {
                this.bugsCount = 5;
                this.total = 104;
            } 

            // Create container
            this.codeLayer = new game.Container();
            this.container.addChild(this.guides);
            this.container.addChild(this.deathField);
            this.container.addChild(this.cord);
            this.container.addChild(this.mouse);
            this.container.addChild(this.codeLayer);
            this.container.addChild(this.keyboard);
            this.container.addChild(this.textBox);

            // Controls layer
            this.controlsLayer = new App.Coding.Controls();

            this.deltaMultiplier = 1;
            this.countdown = new App.Coding.Countdown();
            this.timeIndex = 0;

            // Pause
            this.pauseButton = new App.Pause.PauseButton();
            
            this.container.addChild(this.flash);
            this.stage.addChild(this.container);

        },

        update: function() {

            if(App.developer) {
                App.stats.begin();
            }


            if(!App.paused) {

                // Add to time index
                this.timeIndex += game.system.delta;

                /** 
                    XDK_PARAMS
                    This section deals with the game difficulty
                    It checks the current difficulty then checks the time index before firing a code row
                    What changes could you make to improve the gameplay here?
                */

                // Get the difficulty
                switch (this.getDifficulty()) {
                    case "h":

                        // Check time
                        if(this.timeIndex >= 0.5) {

                            // Reset time index
                            this.timeIndex = 0;

                            // Fire code
                            this.addCodeRow();

                        }

                        break;

                    case "m":

                        // Check time
                        if(this.timeIndex >= 0.75) {

                            // Reset time index
                            this.timeIndex = 0;

                            // Fire code
                            this.addCodeRow();

                        }

                        break;

                    case "e":

                        // Check time
                        if(this.timeIndex >= 1) {

                            // Reset time index
                            this.timeIndex = 0;

                            // Fire code
                            this.addCodeRow();

                        }

                        break;

                }
                
                this._super();

            }

            if(App.developer) {
                App.stats.end();
            }

        },

        getDifficulty: function(){

            var i, j = 0;

            // Loop through the list
            for(i = 0; i < this.difficulty.length; i += 1) {

                // Add to index
                j += this.difficulty[i][1];

                // Check index
                if(this.timeleft-5 <= j) {

                    // Return difficulty
                    return this.difficulty[i][0];

                }
            }

        },

        addCodeRow: function(){

            // Add code
            if(!this.pauseObjects && this.timeleft >= 0) {
                
                // Create row
                var new_row = new App.Coding.Row();

                // Add to scene
                this.addObject(new_row);

                // Add to rows array
                this.rows.push(new_row);

            }

        },

        addGoodScore: function() {

            // Add score
            this.score += 1;

            // Screenflash
            this.screenFlash(0x0000FF, "Great!");

        },

        addPerfectScore: function() {

            // Add score
            this.score += 2;

            // Screenflash
            this.screenFlash(0x00FF00, "Perfect!");

        },

        resetCombo: function(){

            // vibration
            App.vibrate(250);

            // Screen wobble
            this.rgbFilter(30, 500);

        },

        enterBugsMode: function(){

            var mouseTween, cordTween, keyboardTween, i, count = 0;

            // vibration
            App.vibrate(250);
            
            // Play music
            App.playMusic("coding_debug", 0.2);

            // loop through the code items
            for(i = 0; i < this.codeLayer.children.length; i += 1) {

                // If this is a code item
                if(this.codeLayer.children[i].hasOwnProperty("row")) {

                    //Check item has not failed or scored
                    if(!this.codeLayer.children[i].failed && !this.codeLayer.children[i].scored && !this.codeLayer.children[i].isBug) {

                        // Check this can be made a bug
                        if(count < this.bugsCount) {

                            // Make this item into a bug
                            this.codeLayer.children[i].isBug = true;

                            // Add to bug count
                            count += 1;

                        }
                    }
                }
            }

            // Pull deathfield into view
            this.deathField.position.x = 0;

            // Set the readout text
            this.textBox.setText("Debug!");

            // Set the textbox position
            this.textBox.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.textBox.width / 2);

            // Set the readout text alpha
            this.textBox.alpha = 1;

            // Pause the game objects
            this.pauseObjects = true;

            // Move the mouse right
            mouseTween = new game.Tween(this.mouse.position);
            mouseTween.to({ x: (game.system.width / App.deviceScale()) }, 500);
            mouseTween.start();

            // Move the cord right
            cordTween = new game.Tween(this.cord.position);
            cordTween.to({ x: this.cord.position.x + this.mouse.width }, 500);
            cordTween.start();

            // Move the keyboard left
            keyboardTween = new game.Tween(this.keyboard.position);
            keyboardTween.to({ x: -this.keyboard.width }, 500);
            keyboardTween.start();

            // Screen wobble
            this.rgbFilter(50, 500);

        },

        leaveBugsMode: function(){

            var mouseTween, cordTween, keyboardTween;

            // Move the deathfield out of view
            this.deathField.position.x = game.system.width / App.deviceScale();

            // Screen flash
            this.screenFlash(0x00FF00, "");

            // If there is still time left
            if(!this.ended) {

                // Play the normal music
                App.playMusic("coding_bg", 0.5);

            } else {

                // Stop the music
                game.audio.stopMusic();

            }

            // Resume the game objects
            this.pauseObjects = false;

            // Move the mouse back in
            mouseTween = new game.Tween(this.mouse.position);
            mouseTween.to({ x: (game.system.width / App.deviceScale()) - this.mouse.width }, 500);
            mouseTween.start();

            // move the cord back in
            cordTween = new game.Tween(this.cord.position);
            cordTween.to({ x: this.cord.position.x - this.mouse.width }, 500);
            cordTween.start();

            // Move the keyboard back in
            keyboardTween = new game.Tween(this.keyboard.position);
            keyboardTween.to({ x: 0 }, 500);
            keyboardTween.start();

        },

        rgbFilter: function(size, duration){

            // Create the filter
            this.blur = new game.PIXI.RGBSplitFilter();
            this.blur.uniforms.blue.value = { x: size * ((Math.random() < 0.5) ? -1 : 1), y: size * ((Math.random() < 0.5) ? -1 : 1) };
            this.blur.uniforms.green.value = { x: size * ((Math.random() < 0.5) ? -1 : 1), y: size * ((Math.random() < 0.5) ? -1 : 1) };
            this.blur.uniforms.red.value = { x: size * ((Math.random() < 0.5) ? -1 : 1), y: size * ((Math.random() < 0.5) ? -1 : 1) };

            // Set the container filter
            this.container.filters = [this.blur];
            
            // Create the blur tweens
            this.blurTween1 = new game.Tween(this.blur.uniforms.blue.value);
            this.blurTween2 = new game.Tween(this.blur.uniforms.green.value);
            this.blurTween3 = new game.Tween(this.blur.uniforms.red.value);

            // Set blur tween properties
            this.blurTween1.to({ x: 0, y: 0 }, duration);
            this.blurTween2.to({ x: 0, y: 0 }, duration);
            this.blurTween3.to({ x: 0, y: 0 }, duration);

            // Set thhe blur tween complete function
            this.blurTween1.onComplete(function(){
                game.scene.container.filters = null;
            });

            // Start the tween
            this.blurTween1.start();
            this.blurTween2.start();
            this.blurTween3.start();

        },

        endGame: function(){

            var self = this, flashTween;

            // Set the game ended flag
            this.ended = true;

            // If the game is in debug mode
            if(this.pauseObjects) {

                // Leave debug mode
                this.leaveBugsMode();
            }

            // Set the flash tint to green
            this.flash.tint = App.currentPalette[1];

            // Set the flash position
            this.flash.position.x = 0;

            // Set the flash alpha
            this.flash.alpha = 0;

            // Calculate the final score
            this.finalScore = Math.floor((this.score / this.total) * 100);

            // Create the flash tween
            flashTween = new game.Tween(this.flash);
            flashTween.to({ alpha: 1 }, 1000);
            flashTween.start();
            flashTween.onComplete(function(){
                game.storage.set("game_2_score", Math.min(self.finalScore, 100));
                game.system.setScene(App.Coding.Outro);
            });

        },

        screenFlash: function(colour, text){

            var textBoxTween, flashTween;

            // Set the flash colour
            this.flash.tint = colour;

            // Set the flash alpha
            this.flash.alpha = 0.25;

            // Set the textbox text
            this.textBox.setText(text);

            // Set the textbox alpha
            this.textBox.alpha = 1;

            // Set the textbox position
            this.textBox.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.textBox.width / 2);

            // Create the tweens
            textBoxTween = new game.Tween(this.textBox);
            textBoxTween.to({ alpha:0 }, 500);
            flashTween = new game.Tween(this.flash);
            flashTween.to({ alpha:0 }, 500);

            // Start the tweens
            textBoxTween.start();
            flashTween.start();

        }
    });

    App.Coding.Outro = game.Scene.extend({

        backgroundColor: 0x3c495b,

        init: function(){

            // Get/Set app name
            if(!game.storage.get("CurrentAppName")) {
                game.storage.set("CurrentAppName", App.generateName());
            }

            // Get score
            this.score = Math.floor(game.storage.get("game_2_score")) || 0;

            // Create level object
            var GameOutro = App.GameOutro.extend({ 

                icon: "media/coding/icon.png",
                title: "You built",
                shape: "media/coding/shape.png",
                score: this.score + "%"

            });

            // Create
            this.gameOutro = new GameOutro();
            
        }

    });

});
