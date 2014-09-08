game.module(
    'modules.concept.scenes'
)
.require(
    'engine.camera',
    'engine.core',
    'engine.loader',
    'engine.scene',
    'engine.renderer',
    'engine.particle',
    'engine.timer',
    'engine.tween',
    'engine.scene',
    'engine.system'
    
)
.body(function() {
    
    App.Concept.Intro = game.Scene.extend({

        backgroundColor: 0x143559,

        init: function(){
            // List of Levels
            App.LevelList = App.getLevelList();
            
            // Get level
            this.level = game.storage.get("CurrentLevel");
            
            var levelString = (1 + this.level);
            
            var assets = 0;

            // Aquire game assets
            assets += App.requireAsset("font.fnt");
            assets += App.requireAsset("Roboto-export.png");
            assets += App.requireAsset("Roboto-export.fnt");
            assets += App.requireAsset("concept/level_"+levelString+"_background_tile_01.png");
            assets += App.requireAsset("concept/character_body.png");
            assets += App.requireAsset("concept/character_arms.png");
            assets += App.requireAsset("concept/character_legs.png");
            assets += App.requireAsset("concept/character_face_01_default.png");
            assets += App.requireAsset("concept/character_face_02_smile.png");
            assets += App.requireAsset("concept/character_face_03_wired.png");
            assets += App.requireAsset("concept/character_face_04_content.png");
            assets += App.requireAsset("concept/character_face_05_hypnotised.png");
            assets += App.requireAsset("concept/character_face_06_squint.png");
            assets += App.requireAsset("concept/character_face_07_asleep.png");
            assets += App.requireAsset("concept/glow_01.png");
            assets += App.requireAsset("concept/particle.png");
            assets += App.requireAsset("concept/level_"+levelString+"_distraction_cat_01.png");
            assets += App.requireAsset("concept/level_"+levelString+"_distraction_noodles_01.png");
            assets += App.requireAsset("concept/level_"+levelString+"_distraction_pillow_01.png");
            assets += App.requireAsset("concept/level_"+levelString+"_powerup_clock_01.png");
            assets += App.requireAsset("concept/level_"+levelString+"_powerup_coffee_01.png");
            assets += App.requireAsset("concept/level_"+levelString+"_powerup_drink_01.png");
            assets += App.requireAsset("concept/level_"+levelString+"_powerup_sushi_01.png");
            assets += App.requireAsset("concept/level_"+levelString+"_powerup_unicorn_01.png");
            assets += App.requireAsset("concept/level_"+levelString+"_collectable_atom_01.png");
            assets += App.requireAsset("concept/level_"+levelString+"_collectable_cog_01.png");
            assets += App.requireAsset("concept/level_"+levelString+"_collectable_star_01.png");
            assets += App.requireAsset("concept/level_"+levelString+"_collectable_star_tail_01.png");
            assets += App.requireAsset("concept/cat.png");
            assets += App.requireAsset("concept/unicorn.png");
            assets += App.requireSound("audio/concept_bg_level_0"+levelString+".wav", "music"+levelString);
            assets += App.requireSound("audio/concept_reverse_level_0"+levelString+".wav", "reverse"+levelString);
            assets += App.requireSound("audio/concept_bg_end.wav", "end");
            assets += App.requireSound("audio/concept_idea_spark_01.wav", "spark");
            assets += App.requireSound("audio/concept_idea_nucleus_01.wav", "nucleus");
            assets += App.requireSound("audio/concept_idea_cog_03.wav", "cog");
            assets += App.requireSound("audio/concept_power_coffee_01.wav", "coffee");
            assets += App.requireSound("audio/concept_power_unicorn_01.wav", "unicorn");
            assets += App.requireSound("audio/concept_distract_cat_01.wav", "cat");
            assets += App.requireSound("audio/concept_distract_sleep_01.wav", "sleep");
            assets += App.requireSound("audio/concept_distract_noodle_01.wav", "noodle");
            assets += App.requireAsset("pause.png");
            assets += App.requireAsset("pause_sound.png");
            assets += App.requireAsset("pause_vibrate.png");
            assets += App.requireAsset("pause_quit.png");
            assets += App.requireAsset("pause_resume.png");
            assets += App.requireAsset("concept/icon.png");
            assets += App.requireAsset("concept/shape.png");
            assets += App.requireAsset("concept/level_"+levelString+"_intro_1.png");
            assets += App.requireAsset("concept/level_"+levelString+"_intro_2.png");
            
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

            var text1, text2, text3;

            // Get level
            this.level = game.storage.get("CurrentLevel");

            App.sendPageView('Concept Challenge - Level ' + (this.level+1));

            // Set intro text
            switch (this.level) {
                case 0:
                    text1 = "Great apps begin with awesome ideas.";
                    text2 = "To unleash your genius, grab as many idea sparks as you can.";
                    text3 = "Just be sure to avoid the notorious distraction demons.";
                    break;
                case 1:
                    text1 = "Churning out ideas is hard work...";
                    text2 = "To unleash your genius, grab as many idea sparks as you can.";
                    text3 = "Just be sure to avoid the notorious distraction demons.";
                    break;
                case 2:
                    text1 = "It’s time to build the next big thing.";
                    text2 = "To unleash your genius, grab as many idea sparks as you can.";
                    text3 = "Just be sure to avoid the notorious distraction demons.";
                    break;
            }

            // Create level object
            var GameIntro = App.GameIntro.extend({ 
                icon: "media/concept/icon.png",
                title: text1,
                text1: text2,
                text2: text3,
                img1: ["media/concept/level_"+(this.level+1)+"_intro_1.png", 600, 80],
                img2: ["media/concept/level_"+(this.level+1)+"_intro_2.png", 400, 80],
                link: App.Concept.Game
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

    App.Concept.Game = game.Scene.extend({
        
        backgroundColor: 0x000000,

        init: function() {
            
            // Retrieve current level
            this.level = game.storage.get("CurrentLevel");
            var levelString = (1 + this.level);
            
            // Initialise game specific palette
            this.palette = new App.Concept.Palette();
            
            // Used to control simulation speed
            this.deltaMultiplier = 1;
            
            this.mousePos = new game.Vector();
            
            
            this.ending = false;
            
            // Containers used to ensure sprites sit in appropriate z-order
            this.gameLayer = new App.Concept.GameLayer();
            this.playerLayer = new App.Concept.PlayerLayer();
            this.reverseTimeLayer = new App.Concept.ReverseTimeLayer();
            
            this.background = new App.Concept.Background();
            
            switch(this.level){
                case 0:
                    // Seekers are penalties that will follow the player if he gets too near
                    this.seeker1Count = 1;//cat
                    this.seeker2Count = 1;//pillow
                    this.seeker3Count = 0;//noodles

                    // Evaders are the ideas the player is trying to collect
                    this.evader1Count = 6;//spark
                    this.evader2Count = 5;//nucleus
                    this.evader3Count = 8;//cog

                    // Power-ups provide various bonuses
                    this.powerUp1Count = 1;//unicorn
                    this.powerUp2Count = 1;//clock
                    this.powerUp3Count = 0;//coffee
                    break;
                    
                case 1:
                    this.seeker1Count = 1;//cat
                    this.seeker2Count = 2;//pillow
                    this.seeker3Count = 1;//noodles
                    
                    this.evader1Count = 10;//spark
                    this.evader2Count = 5;//nucleus
                    this.evader3Count = 6;//cog

                    this.powerUp1Count = 0;//unicorn
                    this.powerUp2Count = 1;//clock
                    this.powerUp3Count = 1;//coffee
                    break;
                    
                case 2:
                    this.seeker1Count = 2;//cat
                    this.seeker2Count = 2;//pillow
                    this.seeker3Count = 2;//noodles

                    this.evader1Count = 14;//spark
                    this.evader2Count = 5;//nucleus
                    this.evader3Count = 4;//cog

                    this.powerUp1Count = 1;//unicorn
                    this.powerUp2Count = 0;//clock
                    this.powerUp3Count = 1;//coffee
                    break;
            }

            this.catCount = 9;//cat sprites that appear during penalty
            
            this.seekers1 = [];
            this.seekers2 = [];
            this.seekers3 = [];
            
            this.evaders1 = [];
            this.evaders2 = [];
            this.evaders3 = [];
            
            this.powerUps1 = [];
            this.powerUps2 = [];
            this.powerUps3 = [];
            
            this.cats = [];
            

            //Seekers
            for (var i=0; i< this.seeker1Count; i++){
                this.seekers1[i] = new App.Concept.Distraction1();
            }
            
            for (var i=0; i< this.seeker2Count; i++){
                this.seekers2[i] = new App.Concept.Distraction2();
            }
            
            for (var i=0; i< this.seeker3Count; i++){
                this.seekers3[i] = new App.Concept.Distraction3();
            }
            
            //Evaders
            for (var i=0; i< this.evader1Count; i++){
                this.evaders1[i] = new App.Concept.Spark();
            }
            
            for (var i=0; i< this.evader2Count; i++){
                this.evaders2[i] = new App.Concept.Nucleus();
            }
            
            for (var i=0; i< this.evader3Count; i++){
                this.evaders3[i] = new App.Concept.Cog();
            }
            
            //PowerUps
            for (var i=0; i< this.powerUp1Count; i++){
                this.powerUps1[i] = new App.Concept.PowerUp1();
            }
            
            for (var i=0; i< this.powerUp2Count; i++){
                this.powerUps2[i] = new App.Concept.PowerUp2();
            }
            
            for (var i=0; i< this.powerUp3Count; i++){
                this.powerUps3[i] = new App.Concept.PowerUp3();
            }  
            
            //Cats
            for (var i=0; i< this.catCount; i++){
                this.cats[i] = new App.Concept.Cat();
            }  
            
            this.player = new App.Concept.Player();
            
            //Cameras
            this.gameCamera = new App.Concept.GameCamera();
            this.playerCamera = new App.Concept.PlayerCamera();
            
            //HUD elements
            this.hud = new App.Concept.HUD();
            this.inputControl = new App.Concept.InputControl();
            this.pause = new App.Pause.PauseButton();
            this.energyBar1 = new App.Concept.EnergyBar1();
            this.energyBar2 = new App.Concept.EnergyBar2();
            this.energyBar3 = new App.Concept.EnergyBar3();
            this.countdown = new App.Concept.Countdown();
            
            //Post-processing shader effects
            this.grayFilter = new game.PIXI.GrayFilter();
            this.blurFilter = new game.PIXI.BlurFilter();
            this.noiseFilter = new App.NoiseFilter();
            this.colorFilter = new game.PIXI.ColorMatrixFilter();
            this.colorCycle = new App.Concept.ColorCycle();
            this.timeReverse = new App.Concept.TimeReverse();
            
            App.playMusic("music"+levelString, 1);
        },
        
        
        update: function(){
            
            if(App.developer) {
                App.stats.begin();
            }
            
            if(!App.paused){
                // Increment the noise shader seed
                game.scene.noiseFilter.seed += 0.1;

                // Iterate through all game objects applying their behaviours
                var i=this.seekers1.length;
                while (i--){
                    this.seekers1[i].applyBehaviours(this.seekers1);
                }

                var i=this.seekers2.length;
                while (i--){
                    this.seekers2[i].applyBehaviours(this.seekers2);
                }

                var i=this.seekers3.length;
                while (i--){
                    this.seekers3[i].applyBehaviours(this.seekers3);
                }


                var i=this.evaders1.length;
                while (i--){
                    this.evaders1[i].applyBehaviours(this.evaders1);
                }

                var i=this.evaders2.length;
                while (i--){
                    this.evaders2[i].applyBehaviours(this.evaders2);
                }

                var i=this.evaders3.length;
                while (i--){
                    this.evaders3[i].applyBehaviours(this.evaders3);   
                }


                var i=this.powerUps1.length;
                while (i--){
                    this.powerUps1[i].applyBehaviours(this.powerUps1);
                }

                var i=this.powerUps2.length;
                while (i--){
                    this.powerUps2[i].applyBehaviours(this.powerUps2);
                }

                var i=this.powerUps3.length;
                while (i--){
                    this.powerUps3[i].applyBehaviours(this.powerUps3);   
                }

                this.player.applyBehaviours();

                // Call the update function of any objects registered in the scene
                this._super();

                // Check to see if the game has finished
                if (this.countdown.ended()){
                    if(!this.ending){
                        this.ending = true;
                        this.endGameTween = new game.Tween(this.stage);
                        this.endGameTween.to({alpha:0}, 2000);
                        this.endGameTween.onComplete(this.endLevel.bind(this));
                        this.endGameTween.start();

                        game.audio.stopMusic();
                        App.playSound("end", false, 0.5);
                    }
                }
            }
            
            if(App.developer) {
                App.stats.end();
            }
            
        },
        
        mousedown: function(event_) {
            // Store the mouse position and initialise the steering control
            var tMousePos = event_.getLocalPosition(this.stage);
            this.mousePos = new game.Vector(tMousePos.x, tMousePos.y);
            
            this.inputControl.steering = true;
            this.inputControl.origin.set(this.mousePos.x, this.mousePos.y);
        },
        
        mouseup: function(event_) {
            // Pause the steering control
            this.inputControl.steering = false;
        },
        
        mousemove: function(event_){
            var tMousePos = event_.getLocalPosition(this.stage);
            this.mousePos.set(tMousePos.x, tMousePos.y);
        },

        endLevel: function(){
            // Sum the energy levels of the 3 bars and combine to calculate the score for the level
            var score = (this.energyBar1.getScore() + this.energyBar2.getScore() + this.energyBar3.getScore())/3;
            game.storage.set("game_1_score", score);
            game.system.setScene(App.Concept.Outro); 
        }
    });

    App.Concept.Outro = game.Scene.extend({

        backgroundColor: 0x000000,

        init: function(){

            // set app name
            game.storage.set("CurrentAppName", App.generateName());
            
            // Get score
            this.score = Math.floor(game.storage.get("game_1_score")) || 0;

            // Create level object
            var GameOutro = App.GameOutro.extend({ 

                icon: "media/concept/icon.png",
                title: "You called your app",
                shape: "media/concept/shape.png",
                score: this.score + "%"

            });

            // Create
            this.gameOutro = new GameOutro();

        }
    });

});

