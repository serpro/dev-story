game.module(
    'modules.home.scenes'
)
.require(
    'engine.scene'
)
.body(function() {

    App.Home.Main = game.Scene.extend({

        backgroundColor: 0x143559,
        buttons: [],

        init: function(){

            var assets = 0;

            // Aquire game assets
            assets += App.requireAsset("pause.png");
            assets += App.requireAsset("pause_sound.png");
            assets += App.requireAsset("pause_vibrate.png");
            assets += App.requireAsset("pause_quit.png");
            assets += App.requireAsset("pause_resume.png");

            // Home
            assets += App.requireAsset("home/code.png");
            assets += App.requireAsset("home/hero.png");
            assets += App.requireAsset("home/title.png");

            // About
            assets += App.requireAsset("home/facebook.png");
            assets += App.requireAsset("home/twitter.png");
            assets += App.requireAsset("home/about_hero.png");
            assets += App.requireAsset("home/arrow_right.png");
            assets += App.requireAsset("home/arrow_left.png");
            assets += App.requireAsset("home/level_4_hero.png");

            // Credits
            assets += App.requireAsset("home/ant_b.png");
            assets += App.requireAsset("home/matt_g.png");
            assets += App.requireAsset("home/jon_w.png");

            // Levels
            assets += App.requireAsset("home/star_0.png");
            assets += App.requireAsset("home/star_1.png");
            assets += App.requireAsset("home/star_2.png");
            assets += App.requireAsset("home/star_3.png");
            assets += App.requireAsset("home/levels_level_1.png");
            assets += App.requireAsset("home/levels_level_2.png");
            assets += App.requireAsset("home/levels_level_3.png");
            assets += App.requireAsset("home/levels_level_4.png");

            // Level Intro
            assets += App.requireAsset("home/level_1_hero_fg.png");
            assets += App.requireAsset("home/level_2_hero_fg.png");
            assets += App.requireAsset("home/level_3_hero_fg.png");
            assets += App.requireAsset("home/level_1_hero_bg.png");
            assets += App.requireAsset("home/level_2_hero_bg.png");
            assets += App.requireAsset("home/level_3_hero_bg.png");
            assets += App.requireAsset("home/level_1_games.png");
            assets += App.requireAsset("home/level_2_games.png");
            assets += App.requireAsset("home/level_3_games.png");

             // Level Outro
            assets += App.requireAsset("home/level_1_outro.png");
            assets += App.requireAsset("home/level_2_outro.png");
            assets += App.requireAsset("home/level_3_outro.png");
            assets += App.requireAsset("home/quote.png");
            assets += App.requireAsset("home/stars_0.png");
            assets += App.requireAsset("home/stars_1.png");
            assets += App.requireAsset("home/stars_2.png");
            assets += App.requireAsset("home/stars_3.png");

            // Container
            this.loading = new game.Container();
            this.loading.scale.set(App.deviceScale(), App.deviceScale());

            // If assets to load
            if(assets) {

                // Create loader
                this.loader = new game.Loader();

                // Set dynamic
                this.loader.dynamic = true;
                this.loadingText = new game.Text( "Loading...".toUpperCase(), { fill: "white", font: 'bold 72px sans-serif' } );
                this.loadingText.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.loadingText.width / 2);
                this.loadingText.position.y = ((game.system.height / App.deviceScale()) / 2) - (this.loadingText.height / 2);

                // Objects
                this.bar = new game.Graphics();
                this.bar.beginFill(0xce5064); 
                this.bar.drawRect(0, 0, (game.system.width / App.deviceScale()), (game.system.height / App.deviceScale()));
                this.bar.position.y = 0;
                this.bar.position.x = -(game.system.width / App.deviceScale());
                this.bar.endFill();

                // Add to scene
                this.loading.addChild(this.bar);
                this.loading.addChild(this.loadingText);
                this.stage.addChild(this.loading);

                // Start loading
                this.loader.start();

            } else {

                // Skip preloader
                this.loaded();           

            }
        },

        loaded: function(){

            var code_ratio, titleTween, wipeTween, heroTween, 
                i, menuItems = [
                    "Play", 
                    "Get involved", 
                    "About", 
                    "Credits"
                ], NewButton;

            // Analytics event
            App.sendPageView('Home Screen');

            // Container
            this.container = new game.Container();
            this.container.scale.set(App.deviceScale(), App.deviceScale());

            // Objects
            this.code = new game.PIXI.Sprite.fromImage('media/home/code.png', 0, 0);
            code_ratio = this.code.width / this.code.height;
            this.code.height = (game.system.height / App.deviceScale());
            this.code.width = this.code.height * code_ratio;
            this.code.position.x = 0;
            this.code.position.y = 0;

            this.title = new game.PIXI.Sprite.fromImage('media/home/title.png', 0, 0);
            this.title.height = 745;
            this.title.width = 224;
            this.title.anchor.set(0.5, 0.5);
            this.title.position.x = 550;
            this.title.position.y = 200;
            this.title.scale = { x:0, y: 0 };

            titleTween = new game.Tween(this.title.scale)
                .to({ x: 1, y: 1 }, 250)
                .easing(game.Tween.Easing.Back.Out);

            this.hero = new game.PIXI.Sprite.fromImage('media/home/hero.png', 0, 0);
            this.hero.height = 600;
            this.hero.width = 600;
            this.hero.anchor.set(0.5, 0.5);
            this.hero.position.x = (game.system.width / App.deviceScale()) - (this.hero.width / 2);
            this.hero.position.y = (game.system.height / App.deviceScale()) - (this.hero.height / 2);
            this.hero.scale = { x:0, y: 0 };

            heroTween = new game.Tween(this.hero.scale)
                .to({ x: 1, y: 1 }, 500)
                .delay(125)
                .easing(game.Tween.Easing.Back.Out);

            // Loop through levels
            for(i = 0; i < menuItems.length; i += 1) {

                // Create level object
                NewButton = App.Home.HomeButton.extend({ 
                    id: i,
                    name: menuItems[i] 
                });

                // Store
                this.buttons.push(new NewButton());

            }

            this.wipe = new game.Graphics();
            this.wipe.beginFill(0xce5064); 
            this.wipe.drawRect(0, 0, (game.system.width / App.deviceScale()), (game.system.height / App.deviceScale()) * 5);
            this.wipe.position.x = 0;
            this.wipe.position.y = 0;
            wipeTween = new game.Tween(this.wipe).to({ alpha: 0 }, 500);

            this.container.addChild(this.code);
            this.container.addChild(this.hero);
            this.container.addChild(this.title);
            this.container.addChild(this.wipe);

            this.stage.addChild(this.container);
            heroTween.start();
            titleTween.start();
            wipeTween.start();

        },

        update: function() {

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

    App.Home.Levels = game.Scene.extend({

        backgroundColor: 0x143559,
        targetPosition: 0,
        buttons: [],

        init: function(){

            var i, k = 0, NewButton, wipeTween;

            // Analytics event
            App.sendPageView('Level Select');

            // Container
            this.container = new game.Container();
            this.container.scale.set(App.deviceScale(), App.deviceScale());

            // Swipes
            this.swipeDist = 300;

            // List of Levels
            App.LevelList = App.getLevelList();

            // Create buttons
            this.stages = new App.Home.Stages();

            // Loop through levels
            for(i = 0; i < App.LevelList.length; i += 1) {

                // Create level object
                NewButton = App.Home.StageButton.extend({ 
                    id: i,
                    idx: k, 
                    name: App.LevelList[i].name, 
                    title: App.LevelList[i].title, 
                    games: App.LevelList[i].games, 
                    rating: App.LevelList[i].rating,
                    unlocked: App.LevelList[i].unlocked 
                });

                // New column
                k += 1;

                // Store
                this.buttons.push(new NewButton());

            }

            this.back = new game.PIXI.Sprite.fromImage("media/home/back.png");
            this.back.width = 48;
            this.back.height = 48;
            this.back.position.x = 24;
            this.back.position.y = 24;
            this.back.setInteractive(true);
            this.back.hitArea = new game.PIXI.Rectangle(0,0,96,96);
            this.back.tap = this.back.click = function(){
                App.buttonClick(game.scene.wipe, "wipe", "goHome");
            };

            this.wipe = new game.Graphics();
            this.wipe.beginFill(0xce5064); 
            this.wipe.drawRect(0, 0, (game.system.width / App.deviceScale()), (game.system.height / App.deviceScale()) * 5);
            this.wipe.position.x = 0;
            this.wipe.position.y = 0;
            wipeTween = new game.Tween(this.wipe)
                .to({ alpha: 0 }, 500);

            this.container.addChild(this.back);
            this.container.addChild(this.wipe);
            this.stage.addChild(this.container);
            wipeTween.start();

        },

        update: function() {

            this._super();

        },

        swipe: function(direction){

            // Check for movement
            if(!this.movement) {

                // Set direction
                this.direction = direction;

            }

        }
    });

    App.Home.About = game.Scene.extend({

        backgroundColor: 0x143559,
        startPosition:0,

        init: function(){

            // Analytics event
            App.sendPageView('About');

            // Container
            this.container = new game.Container();
            this.container.scale.set(App.deviceScale(), App.deviceScale());

            this.back = new game.PIXI.Sprite.fromImage("media/home/back.png");
            this.back.width = 48;
            this.back.height = 48;
            this.back.position.x = 24;
            this.back.position.y = 24;
            this.back.setInteractive(true);
            this.back.hitArea = new game.PIXI.Rectangle(0,0,96,96);
            this.back.tint = 0xFFFFFF;
            this.back.tap = this.back.click = function(){
                App.buttonClick(game.scene.wipe, "wipe", "setScene", App.Home.Main);
            };

            this.text1 = new game.Text("About the app".toUpperCase(), { fill: "white", font: 'bold 64px sans-serif' } );
            this.text1.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.text1.width / 2);
            this.text1.position.y = 48;

            this.carousel_position = 0;

            this.text2 = new game.Text("Intel challenged a small team of developers to build an open source app. They created Dev Story/*HACK THE CODE*/, a set of mini-challenges about the development cycle of an app. But it’s not finished yet.\n\nYou’ve downloaded the app. Now it’s over to you...\n\nWe’re bringing developers together from around the world to build something special and unique. So whether you’re honing your skills or flexing your coding muscles, you can modify and shape the open source code however you choose.\n\nIf your code makes the cut, you’ll see it in the next update. And you’ll take the credit.\n\nTo get involved, head to the Intel® Developer Zone where the code is available to download. You’ll also find free tools, tutorials and support from a network of Android developers.\n\nWe can’t wait to see what you create.", { fill: "white", font: '32px sans-serif', wordWrap: true, wordWrapWidth: ((game.system.width / App.deviceScale()) / 1.5) } );
            this.text2.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.text2.width / 2);
            this.text2.position.y = this.text1.position.y + this.text1.height + 48;

            this.text3 = new game.Text( "Let’s go".toUpperCase(), { fill: "white", font: 'bold 64px sans-serif' } );
            this.text3.tint = 0xce5064;
            this.text3.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.text3.width / 2);
            this.text3.position.y = this.text2.position.y + this.text2.height + 48;
       
            this.button = new game.Graphics();
            this.button.beginFill(this.colour4); 
            this.button.drawRect(0, 0, this.text3.width + 48, this.text3.height + 24);
            this.button.position.x = this.text3.position.x - 24;
            this.button.position.y = this.text3.position.y - 12;
            this.button.setInteractive(true);
            this.button.hitArea = new game.PIXI.Rectangle(0, 0, this.text3.width + 48, this.text3.height + 24);
            this.button.tap = this.button.click = function() {
                // Play level
                App.transition(game.scene.wipe, "setScene", App.Home.Levels);
                
            };
            this.button.alpha = 0;           

            this.facebook = new game.PIXI.Sprite.fromImage("media/home/facebook.png");
            this.facebook.anchor.set(0.5,0.5);
            this.facebook.width = 80;
            this.facebook.height = 80;
            this.facebook.position.x = (game.system.width / App.deviceScale()) - 128;
            this.facebook.position.y = this.text2.position.y + this.text2.height + 80;
            this.facebook.setInteractive(true);
            this.facebook.hitArea = new game.PIXI.Rectangle(-40, -40, 80, 80);
            this.facebook.tap = this.facebook.click = this.share_facebook.bind(this);

            this.twitter = new game.PIXI.Sprite.fromImage("media/home/twitter.png");
            this.twitter.anchor.set(0.5,0.5);
            this.twitter.width = 80;
            this.twitter.height = 80;
            this.twitter.position.x = this.facebook.position.x - this.twitter.width - 32;
            this.twitter.position.y = this.text2.position.y + this.text2.height + 80;
            this.twitter.setInteractive(true);
            this.twitter.hitArea = new game.PIXI.Rectangle(-40, -40, 80, 80);
            this.twitter.tap = this.twitter.click = this.share_twitter.bind(this);

            this.scrollbar = new game.Graphics();
            this.scrollbar.beginFill(0xFFFFFF);
            this.scrollbar.drawRect(0, 0, 12, 200);
            this.scrollbar.endFill();
            this.scrollbar.position.x = (game.system.width / App.deviceScale()) - 12;
            this.scrollbar.position.y = 0;
            this.scrollbar.alpha = 0.5;

            this.wipe = new game.Graphics();
            this.wipe.beginFill(0xce5064); 
            this.wipe.drawRect(0, 0, (game.system.width / App.deviceScale()), (game.system.height / App.deviceScale()) * 5);
            this.wipe.position.x = 0;
            this.wipe.position.y = 0;
            var wipeTween = new game.Tween(this.wipe).to({ alpha: 0 }, 500);

            this.container.addChild(this.text1);
            this.container.addChild(this.text2);
            this.container.addChild(this.text3);

            this.container.addChild(this.facebook);
            this.container.addChild(this.twitter);

            this.container.addChild(this.scrollbar);
            this.container.addChild(this.button);
            this.container.addChild(this.back);
            this.container.addChild(this.wipe);
            this.stage.addChild(this.container);
            this.stageHeight = this.text2.position.y + this.text2.height + 180 - (game.system.height / App.deviceScale());
            this.remainingHeight = (game.system.height / App.deviceScale()) - this.scrollbar.height;
            wipeTween.start();

        },

        share_twitter: function(){
            
            var shareUrl = "https://twitter.com/share?";
                shareUrl += "url=http://intel.ly/1pRAKWA";
                shareUrl += "&text="+encodeURIComponent("I'm playing Dev Story/*HACK THE CODE*/, it's open source! Play it, hack it, help build v2! #IntelAndroid");

            window.open(shareUrl, '_system');

        },

        share_facebook: function(){

            // Get involved
            var shareUrl = "https://www.facebook.com/dialog/feed?";
                shareUrl += "app_id=692903567464031";
                shareUrl += "&display=popup";
                shareUrl += "&picture=http://int-android.mrmpweb.co.uk/share.png";
                shareUrl += "&actions={ name: 'Dev Story/*HACK THE CODE*/', link: 'http://www.google.com' }";
                shareUrl += "&link=https://software.intel.com/";
                shareUrl += "&description="+ encodeURIComponent("I’ve just been playing Dev Story/*HACK THE CODE*/ the open-source app led by the dev community! To get involved, head to the Intel® Developer Zone, download the code and start building your own levels and mini-challenges! #IntelAndroid");
                shareUrl += "&redirect_uri=https://software.intel.com/";

            // Open share
            window.open(shareUrl, '_system');

        },

        update: function(){

            this._super();

            // Check for movement
            if(this.movement) {

                // Move container
                this.container.position.y = -this.movementY * App.deviceScale();
                this.scrollbar.position.y = this.movementY + (this.remainingHeight * (this.movementY / this.stageHeight));

            }

        },

        mousedown: function(data){

            // Set movement flag
            this.movement = true;

            // Save initial position
            this.initialY = this.startPosition + data.global.y;

            // Set movement flag position
            this.movementY = this.startPosition;

        },

        mousemove: function(data){

            // Update movement flag
            this.movementY = this.initialY - data.global.y;

            // Prevent movment up
            if(this.movementY < 0) {
                this.movementY = 0;
            }

            // Prevemtn movement down
            if(this.movementY > this.stageHeight) {
                this.movementY = this.stageHeight;
            }

        },

        mouseup: function(data){

            // Set movement to false
            this.movement = false;

            // Save start position
            this.startPosition = this.movementY;

        }

    });

    App.Home.GameIntro = game.Scene.extend({

        backgroundColor: 0x143559,

        init: function(){

            var self = this, heroTween, wipeTween;
            
            // Get current level
            this.level = game.storage.get("CurrentLevel");

            // Analytics event
            App.sendPageView('Overall Intro Screen');

            // Container
            this.container = new game.Container();
            this.container.scale.set(App.deviceScale(), App.deviceScale());

            this.games = App.LevelList[this.level].games;

            // Set colours
            this.colour1 = App.LevelList[this.level].palette[0]; // Dark
            this.colour2 = App.LevelList[this.level].palette[1]; // Med
            this.colour3 = App.LevelList[this.level].palette[2]; // Primary
            this.colour4 = App.LevelList[this.level].palette[3]; // Text

            // Set bg colour
            game.system.stage.setBackgroundColor(this.colour1);
            
            this.back = new game.PIXI.Sprite.fromImage("media/home/back.png");
            this.back.width = 48;
            this.back.height = 48;
            this.back.position.x = 24;
            this.back.position.y = 24;
            this.back.setInteractive(true);
            this.back.hitArea = new game.PIXI.Rectangle(0,0,96,96);
            this.back.tint = 0xFFFFFF;
            this.back.tap = this.back.click = function(){
                App.buttonClick(game.scene.wipe, "wipe", "setScene", App.Home.Main);
            };

            this.text2 = new game.Text("You’re a kick ass developer. The rest of the world just doesn’t know it yet. It’s time to get your killer app out there. But you’ve got to build it from scratch and that’s easier said than done. Have you got what it takes to make it a worldwide success? It’s all down to you.", { fill: "white", font: '32px sans-serif', align: "center", wordWrap: true, wordWrapWidth: ((game.system.width / App.deviceScale()) / 1.5) } );
            this.text2.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.text2.width / 2);
            this.text2.position.y = ((game.system.height / App.deviceScale()) / 2) - (this.text2.height / 2) - 128;

            this.text3 = new game.Text( "Continue".toUpperCase(), { fill: "white", font: 'bold 64px sans-serif' } );
            this.text3.tint = 0xce5064;
            this.text3.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.text3.width / 2);
            this.text3.position.y = this.text2.position.y + this.text2.height + 48;
       
            this.button = new game.Graphics();
            this.button.beginFill(this.colour4); 
            this.button.drawRect(0, 0, this.text3.width + 48, this.text3.height + 24);
            this.button.position.x = this.text3.position.x - 24;
            this.button.position.y = this.text3.position.y - 12;
            this.button.setInteractive(true);
            this.button.hitArea = new game.PIXI.Rectangle(0, 0, this.text3.width + 48, this.text3.height + 24);
            this.button.tap = this.button.click = function() {
                
                // Analytics event
                App.sendEvent('Game Intro', 'click', 'Continue');

                // Play level
                App.playGame(self.games[0]);

            };
            this.button.alpha = 0;

            this.hero = new game.PIXI.Sprite.fromImage("media/home/about_hero.png");
            this.hero.width = 320;
            this.hero.height = 320;
            this.hero.anchor.set(0.5, 1);
            this.hero.position.x = (game.system.width / App.deviceScale()) / 2;
            this.hero.position.y = (game.system.height / App.deviceScale());
            this.hero.scale = { x: 0, y: 0 };
            heroTween = new game.Tween(this.hero.scale)
                .to({ x: 1, y: 1 }, 250)
                .easing(game.Tween.Easing.Back.Out);

            this.wipe = new game.Graphics();
            this.wipe.beginFill(0xce5064); 
            this.wipe.drawRect(0, 0, (game.system.width / App.deviceScale()), (game.system.height / App.deviceScale()) * 5);
            this.wipe.position.x = 0;
            this.wipe.position.y = 0;
            wipeTween = new game.Tween(this.wipe).to({ alpha: 0 }, 500);

            this.container.addChild(this.text2);
            this.container.addChild(this.text3);
            this.container.addChild(this.button);
            this.container.addChild(this.hero);
            this.container.addChild(this.back);
            this.container.addChild(this.wipe);
            this.stage.addChild(this.container);
            wipeTween.chain(heroTween).start();
        }
    });

    App.Home.Credits = game.Scene.extend({

        backgroundColor: 0xf5f3e4,
        startPosition:0,
        stageHeight: 0,

        init: function(){

            var wipeTween, i, j, superstars = [
                ["Levels 1-3", [
                    ["Anthony Brooks", "Developer", "ant_b"],
                    ["Matthew Greenhalgh", "Developer", "matt_g"],
                    ["Jon Wells", "Art Director", "jon_w"]
                ]]/*,
                ["Level 4", [
                    ["Anthony Brooks", "Developer", "ant_b"],
                    ["Matthew Greenhalgh", "Developer", "matt_g"],
                    ["Jonny Wells", "Art Director", "ant_b"],
                    ["Oliver Easthope", "Copywriter", "ant_b"]
                ]],
                ["Level 4", [
                    ["Anthony Brooks", "Developer", "ant_b"],
                    ["Matthew Greenhalgh", "Developer", "matt_g"],
                    ["Jonny Wells", "Art Director", "ant_b"],
                    ["Oliver Easthope", "Copywriter", "ant_b"]
                ]]*/
            ];

            // Analytics event
            App.sendPageView('Credits');

            // Container
            this.container = new game.Container();
            this.container.scale.set(App.deviceScale(), App.deviceScale());

            this.back = new game.PIXI.Sprite.fromImage("media/home/back.png");
            this.back.width = 48;
            this.back.height = 48;
            this.back.position.x = 24;
            this.back.position.y = 24;
            this.back.setInteractive(true);
            this.back.hitArea = new game.PIXI.Rectangle(0,0,96,96);
            this.back.tint = 0x143559;
            this.back.tap = this.back.click = function(){
                App.buttonClick(game.scene.wipe, "wipe", "setScene", App.Home.Main);
            };

            this.text1 = new game.Text("Meet the team".toUpperCase(), { fill: "white", font: 'bold 64px sans-serif', align: "center", wordWrap: true, wordWrapWidth: ((game.system.width / App.deviceScale()) / 1.2) } );
            this.text1.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.text1.width / 2);
            this.text1.position.y = 48;
            this.text1.tint = 0xce5064;

            var person, name, role, row = 0, section_title, section_keyline;

            // Loop through credits
            for(j = 0; j < superstars.length; j += 1) {
                
                row = 0;

                // Set name
                section_title = new game.Text(superstars[j][0], { fill: "white", font: 'bold 36px sans-serif' } );
                section_title.position.x = 64;
                section_title.position.y = this.text1.position.y + this.text1.height + 48 + this.stageHeight;
                section_title.tint = 0x143559;

                // Set line
                section_keyline = new game.Graphics();
                section_keyline.beginFill(0x143559);
                section_keyline.drawRect(0, 0, (game.system.width / App.deviceScale()) - 256, 3);
                section_keyline.endFill();
                section_keyline.position.x = 64;
                section_keyline.position.y = section_title.position.y + section_title.height + 24;
                
                // Add to container
                this.container.addChild(section_title);
                this.container.addChild(section_keyline);

                // Loop through names
                for(i = 0; i < superstars[j][1].length; i += 1) {

                    // Set row number
                    if(i % 2 === 0) {
                        row += 1;
                    }

                    // Set person avatar
                    person = new game.PIXI.Sprite.fromImage("media/home/"+ superstars[j][1][i][2] +".png");
                    person.position.x = 128 + (((game.system.width / App.deviceScale()) / 2 - 64) * (i % 2));
                    person.position.y = section_keyline.position.y - 48 + ((person.height + 48) * row);
                    person.anchor.set(0.5, 0.5);

                    // Set person name
                    name = new game.Text(superstars[j][1][i][0], { align: "left", fill: "white", font: '32px sans-serif' });
                    name.position.x = (person.width / 2) + 12;
                    name.position.y = -(person.height / 2) + 24;
                    name.tint = 0x143559;

                    // Set person role
                    role = new game.Text(superstars[j][1][i][1], { align: "left", fill: "white", font: '32px sans-serif' });
                    role.position.x = (person.width / 2) + 12;
                    role.position.y = name.position.y + 48;
                    role.tint = 0xce5064;
            
                    // Calculate stage height for later
                    this.stageHeight = person.position.y;

                    // Add person
                    person.addChild(name);
                    person.addChild(role);

                    // Add to stage
                    this.container.addChild(person);

                }


            }

            // Create scrollbar
            this.scrollbar = new game.Graphics();
            this.scrollbar.beginFill(0x143559);
            this.scrollbar.drawRect(0, 0, 12, 300);
            this.scrollbar.endFill();
            this.scrollbar.position.x = (game.system.width / App.deviceScale()) - 12;
            this.scrollbar.position.y = 0;

            // Create screen wipe
            this.wipe = new game.Graphics();
            this.wipe.beginFill(0xce5064); 
            this.wipe.drawRect(0, 0, (game.system.width / App.deviceScale()), (game.system.height / App.deviceScale()) * 5);
            this.wipe.position.x = 0;
            this.wipe.position.y = 0;
            wipeTween = new game.Tween(this.wipe).to({ alpha: 0 }, 500);

            // Add to stage
            this.container.addChild(this.text1);
            this.container.addChild(this.back);
            this.container.addChild(this.scrollbar);
            this.container.addChild(this.wipe);
            this.stage.addChild(this.container);

            // Recaclculate stage height
            if(this.stageHeight >= (game.system.height / App.deviceScale()) / 1.5) {
                this.stageHeight -= (game.system.height / App.deviceScale()) / 1.5;
            }

            // Calculate remaining height
            this.remainingHeight = (game.system.height / App.deviceScale()) - this.scrollbar.height;

            // Start wipe animation
            wipeTween.start();

        },

        update: function(){

            this._super();

            // Check for movement
            if(this.movement) {

                // Move stage container
                this.container.position.y = -this.movementY * App.deviceScale();
                this.scrollbar.position.y = this.movementY + (this.remainingHeight * (this.movementY / this.stageHeight));

            }

        },

        mousedown: function(data){

            // Flag movement
            this.movement = true;

            // Save initial position
            this.initialY = this.startPosition + data.global.y;

            // Set movement flag
            this.movementY = this.startPosition;

        },

        mousemove: function(data){

            // Update movement flag
            this.movementY = this.initialY - data.global.y;

            // Stop movement up
            if(this.movementY < 0) {
                this.movementY = 0;
            }

            // Stop movement down
            if(this.movementY > this.stageHeight) {
                this.movementY = this.stageHeight;
            }

        },

        mouseup: function(data){

            // Flag movement
            this.movement = false;

            // Set initial start position
            this.startPosition = this.movementY;

        }

    });

    App.Home.GetInvolved = game.Scene.extend({

        backgroundColor: 0x143559,

        init: function(){

            var heroTween, wipeTween;

            // Analytics event
            App.sendPageView('Get Involved');

            // Container
            this.container = new game.Container();
            this.container.scale.set(App.deviceScale(), App.deviceScale());

            // Set colours
            this.colour1 = 0x143559; // Dark
            this.colour2 = 0x143559; // Med
            this.colour3 = 0xce5064; // Primary
            this.colour4 = 0xFFFFFF; // Text

            // Set bg colour
            game.system.stage.setBackgroundColor(this.colour1);

            this.text1 = new game.Text("It's your turn".toUpperCase(), { fill: "white", font: 'bold 64px sans-serif' } );
            this.text1.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.text1.width / 2);
            this.text1.position.y = 48;
            this.text1.tint = this.colour4;

            this.text2 = new game.Text("Want to be part of Dev Story/*HACK THE CODE*/? We want you to take the reins (and the credit). Here's how.", { fill: "white", font: '28px sans-serif', align: "center", wordWrap: true, wordWrapWidth: ((game.system.width / App.deviceScale()) / 2) } );
            this.text2.position.x = ((game.system.width / App.deviceScale()) / 3) - (this.text2.width / 2);
            this.text2.position.y = this.text1.position.y + this.text1.height + 48;
            this.text2.tint = this.colour4;

            this.hero = new game.PIXI.Sprite.fromImage("media/home/level_4_hero.png");
            this.hero.width = 720;
            this.hero.height = 720;
            this.hero.anchor.set(0.5, 1);
            this.hero.position.x = (game.system.width / App.deviceScale()) - this.hero.width / 2;
            this.hero.position.y = (game.system.height / App.deviceScale());
            this.hero.scale = { x: 0, y: 0 };

            heroTween = new game.Tween(this.hero.scale)
                .to({ x: 1, y: 1 }, 250)
                .easing(game.Tween.Easing.Back.Out);

            this.back = new game.PIXI.Sprite.fromImage("media/home/back.png");
            this.back.width = 48;
            this.back.height = 48;
            this.back.position.x = 24;
            this.back.position.y = 24;
            this.back.setInteractive(true);
            this.back.hitArea = new game.PIXI.Rectangle(0,0,96,96);
            this.back.tint = this.colour4;
            this.back.tap = this.back.click = function(){
                App.buttonClick(game.scene.wipe, "wipe", "setScene", App.Home.Main);
            };

            /* Carousel */
            this.carousel_position = 0;

            this.step1 = new game.Text("Visit the Intel® Developer Zone and download the code.", { 
                fill: "white",  font: '32px sans-serif',  align: "center", wordWrap: true, 
                wordWrapWidth: ((game.system.width / App.deviceScale()) / 3) 
            });
            this.step1.position.x = (game.system.width / App.deviceScale()) / 3 - (this.step1.width / 2);
            this.step1.position.y = this.text2.position.y + this.text2.height + 128 - (this.step1.height / 2);

            this.step2 = new game.Text("Build your new levels, mini challenges and mods.", { 
                fill: "white",  font: '32px sans-serif',  align: "center", wordWrap: true, 
                wordWrapWidth: ((game.system.width / App.deviceScale()) / 3) 
            });
            this.step2.position.x = (game.system.width / App.deviceScale()) / 3 - (this.step2.width / 2);
            this.step2.position.y = this.text2.position.y + this.text2.height + 128 - (this.step2.height / 2);
            this.step2.alpha = 0;

            this.step3 = new game.Text("Share your ideas with us. If any of them make it into version 2.0, you’ll get the credit!", { 
                fill: "white",  font: '32px sans-serif',  align: "center", wordWrap: true, 
                wordWrapWidth: ((game.system.width / App.deviceScale()) / 3) 
            });
            this.step3.position.x = (game.system.width / App.deviceScale()) / 3 - (this.step3.width / 2);
            this.step3.position.y = this.text2.position.y + this.text2.height + 128 - (this.step3.height / 2);
            this.step3.alpha = 0;

            this.pip1 = new game.PIXI.Graphics();
            this.pip1.beginFill(this.colour4); 
            this.pip1.drawCircle(0, 0, 12);
            this.pip1.endFill();
            this.pip1.position.x = (game.system.width / App.deviceScale()) / 3 - 50;
            this.pip1.position.y = this.step3.position.y + this.step3.height + 48;

            this.pip2 = new game.PIXI.Graphics();
            this.pip2.beginFill(this.colour4); 
            this.pip2.drawCircle(0, 0, 12);
            this.pip2.endFill();
            this.pip2.position.x = (game.system.width / App.deviceScale()) / 3;
            this.pip2.position.y = this.step3.position.y + this.step3.height + 48;
            this.pip2.alpha = 0.25;

            this.pip3 = new game.PIXI.Graphics();
            this.pip3.beginFill(this.colour4); 
            this.pip3.drawCircle(0, 0, 12);
            this.pip3.endFill();
            this.pip3.position.x = (game.system.width / App.deviceScale()) / 3 + 50;
            this.pip3.position.y = this.step3.position.y + this.step3.height + 48;
            this.pip3.alpha = 0.25;

            this.arrow_right = new game.PIXI.Sprite.fromImage("media/home/arrow_right.png");
            this.arrow_right.anchor.set(0.5,0.5);
            this.arrow_right.width = 60;
            this.arrow_right.height = 60;
            this.arrow_right.position.x = (game.system.width / App.deviceScale()) / 3 + 260;
            this.arrow_right.position.y = this.step2.position.y + (this.step2.height / 2);
            this.arrow_right.setInteractive(true);
            this.arrow_right.alpha = 1;
            this.arrow_right.hitArea = new game.PIXI.Rectangle(-30,-30,60,60);
            this.arrow_right.tap = this.arrow_right.click = this.carousel_right.bind(this);

            this.arrow_left = new game.PIXI.Sprite.fromImage("media/home/arrow_left.png");
            this.arrow_left.anchor.set(0.5,0.5);
            this.arrow_left.width = 60;
            this.arrow_left.height = 60;
            this.arrow_left.position.x = (game.system.width / App.deviceScale()) / 3 - 260;
            this.arrow_left.position.y = this.step2.position.y + (this.step2.height / 2);
            this.arrow_left.setInteractive(true);
            this.arrow_left.alpha = 0.25;
            this.arrow_left.hitArea = new game.PIXI.Rectangle(-30,-30,60,60);
            this.arrow_left.tap = this.arrow_left.click = this.carousel_left.bind(this);

            this.text3 = new game.Text( "Let’s go".toUpperCase(), { fill: "white", font: 'bold 48px sans-serif' } );
            this.text3.tint = this.colour3;
            this.text3.position.x = ((game.system.width / App.deviceScale()) / 3) - (this.text3.width / 2);
            this.text3.position.y = this.pip1.position.y + this.pip1.height;

            this.button = new game.Graphics();
            this.button.beginFill(this.colour4); 
            App.roundRect(this.button, 0, 0, this.text3.width + 64, this.text3.height + 24, 24, 24, 24, 24);
            this.button.position.x = this.text3.position.x - 32;
            this.button.position.y = this.text3.position.y - 12;
            this.button.setInteractive(true);
            this.button.hitArea = new game.PIXI.Rectangle(0, 0, this.text3.width + 48, this.text3.height + 24);
            this.button.tap = this.button.click = function() {

                // Play level
                App.sendEvent('Get Involved', 'click', 'Lets go');
                App.buttonClick(this, "flash", "goTo", "http://intel.ly/1pRAKWA");
                
            };
            this.button.alpha = 0;

            this.wipe = new game.Graphics();
            this.wipe.beginFill(0xce5064); 
            this.wipe.drawRect(0, 0, (game.system.width / App.deviceScale()), (game.system.height / App.deviceScale()) * 5);
            this.wipe.position.x = 0;
            this.wipe.position.y = 0;
            wipeTween = new game.Tween(this.wipe).to({ alpha: 0 }, 500);

            this.container.addChild(this.hero);
            this.container.addChild(this.text1);
            this.container.addChild(this.text2);
            this.container.addChild(this.button);
            this.container.addChild(this.text3);
            this.container.addChild(this.back);
            this.container.addChild(this.step1);
            this.container.addChild(this.step2);
            this.container.addChild(this.step3);
            this.container.addChild(this.pip1);
            this.container.addChild(this.pip2);
            this.container.addChild(this.pip3);
            this.container.addChild(this.arrow_right);
            this.container.addChild(this.arrow_left);
            this.container.addChild(this.wipe);

            this.stage.addChild(this.container);
            wipeTween.chain(heroTween).start();

        },

        carousel_left: function(){

            // If there is a place to move to
            if(this.carousel_position > 0) {

                // set carousel position
                this.carousel_position -= 1;
            }

            // If position 0
            if(this.carousel_position === 0) {

                // Set visibility settings
                this.arrow_left.alpha = 0.25;
                this.arrow_right.alpha = 1;
                this.step1.alpha = 1;
                this.step2.alpha = 0;
                this.step3.alpha = 0;
                this.pip1.alpha = 1;
                this.pip2.alpha = 0.25;
                this.pip3.alpha = 0.25;

            } 

            // If position 1
            if(this.carousel_position === 1) {
               
                // Set visibility settings
                this.arrow_left.alpha = 1;
                this.arrow_right.alpha = 1;
                this.step1.alpha = 0;
                this.step2.alpha = 1;
                this.step3.alpha = 0;
                this.pip1.alpha = 0.25;
                this.pip2.alpha = 1;
                this.pip3.alpha = 0.25;

            }

        },

        carousel_right: function(){

            // If there is room to move into
            if(this.carousel_position < 2) {

                // Add to carousel position
                this.carousel_position += 1;

            }

            // If position 1
            if(this.carousel_position === 1) {

                // Set visibility settings
                this.arrow_left.alpha = 1;
                this.arrow_right.alpha = 1;
                this.step1.alpha = 0;
                this.step2.alpha = 1;
                this.step3.alpha = 0;
                this.pip1.alpha = 0.25;
                this.pip2.alpha = 1;
                this.pip3.alpha = 0.25;
            }

            // If position 2
            if(this.carousel_position === 2) {

                // Set position settings
                this.arrow_right.alpha = 0.25;
                this.arrow_left.alpha = 1;
                this.step1.alpha = 0;
                this.step2.alpha = 0;
                this.step3.alpha = 1;
                this.pip1.alpha = 0.25;
                this.pip2.alpha = 0.25;
                this.pip3.alpha = 1;

            }

        },

        swipe: function(direction){

            // If there isnt any movement
            if(!this.movement) {

                // Flag movement
                this.movement = true;

                // Set direction
                this.direction = direction;

            }

        },

        update: function(){

            this._super();

            // Check for movement
            if(this.movement) {

                // Check direction
                if(this.direction === "right") {

                    // move carousel
                    this.carousel_left();
                }

                // Check direction
                if(this.direction === "left") {

                    // move carousel
                    this.carousel_right();
                }

                // unflag movement
                this.movement = false;

            }
        }

    });

    App.Home.LevelIntro = game.Scene.extend({

        backgroundColor: 0x143559,

        init: function(){

            var self = this, heroBgTween, heroFgTween, wipeTween;

            // Get level list
            App.LevelList = App.getLevelList();

            // Container
            this.container = new game.Container();
            this.container.scale.set(App.deviceScale(), App.deviceScale());

            // Get Data
            this.level = game.storage.get("CurrentLevel");
            this.games = App.LevelList[this.level].games;
            this.name = App.LevelList[this.level].name;
            this.rating = App.LevelList[this.level].rating;
            this.title = App.LevelList[this.level].title;
            this.description = App.LevelList[this.level].description;

            // Analytics event
            App.sendPageView('Level '+ (this.level+1) +' Intro Screen');

            // Set colours
            this.colour1 = App.LevelList[this.level].palette[0]; // Dark
            this.colour2 = App.LevelList[this.level].palette[1]; // Med
            this.colour3 = App.LevelList[this.level].palette[2]; // Primary
            this.colour4 = App.LevelList[this.level].palette[3]; // Text

            // Set bg colour
            game.system.stage.setBackgroundColor(this.colour1);

            this.bottom = new game.Graphics();
            this.bottom.beginFill(this.colour2); 
            this.bottom.drawRect(0, (game.system.height / App.deviceScale()) - 60, (game.system.width / App.deviceScale()), 60);
            this.bottom.endFill();

            this.text4 = new game.Text( "High Score: " + this.rating + "%", { fill: "white", font: '32px sans-serif' } );
            this.text4.position.x = (game.system.width / App.deviceScale()) - this.text4.width - 48;
            this.text4.position.y = 48;
            this.text4.tint = this.colour4;

            if(this.rating > 70) {
                this.wreath = new game.PIXI.Sprite.fromImage("media/home/star_3.png");
            } else if(this.rating > 60) {
                this.wreath = new game.PIXI.Sprite.fromImage("media/home/star_2.png");
            } else if(this.rating > 50) {
                this.wreath = new game.PIXI.Sprite.fromImage("media/home/star_1.png");
            } else {
                this.wreath = new game.PIXI.Sprite.fromImage("media/home/star_0.png");
            }

            this.wreath.width = 120;
            this.wreath.height = 120;
            this.wreath.position.x = ((game.system.width / App.deviceScale()) / 4) - (this.wreath.width / 2);
            this.wreath.position.y = 48;
            this.wreath.tint = this.colour4;

            this.text1 = new game.Text( this.name, { fill: "white", font: 'bold 48px sans-serif' } );
            this.text1.position.x = ((game.system.width / App.deviceScale()) / 4) - (this.text1.width / 2);
            this.text1.position.y = this.wreath.position.y + this.wreath.height  + 16;
            this.text1.tint = this.colour4;

            this.text2 = new game.Text( this.title, { fill: "white", font: '48px sans-serif' } );
            this.text2.position.x = ((game.system.width / App.deviceScale()) / 4) - (this.text2.width / 2);
            this.text2.position.y = this.text1.position.y + this.text1.height  + 16;
            this.text2.tint = this.colour4;

            this.text5 = new game.Text( this.description, { fill: "white", align: "center", font: '28px sans-serif', wordWrap: true, wordWrapWidth: ((game.system.width / App.deviceScale()) / 2.5) } );
            this.text5.position.x = ((game.system.width / App.deviceScale()) / 4) - (this.text5.width / 2);
            this.text5.position.y = this.text2.position.y + this.text2.height  + 48;
            this.text5.tint = this.colour4;

            this.keyline = new game.Graphics();
            this.keyline.beginFill(this.colour4); 
            this.keyline.drawRect(
                ((game.system.width / App.deviceScale()) / 4) - (this.text5.width / 2), 
                this.text2.position.y + this.text2.height  + 32, 
                this.text5.width, 
                1.5
            );

            this.keyline.endFill();

            this.icons = new game.PIXI.Sprite.fromImage("media/home/level_"+(this.level+1)+"_games.png");
            this.icons.width = 300;
            this.icons.height = 300;
            this.icons.position.x = ((game.system.width / App.deviceScale()) / 4) - (this.icons.width / 2);
            this.icons.position.y = this.text5.position.y + this.text5.height + 64 - (this.icons.height / 2);

            this.text3 = new game.Text( "Play".toUpperCase(), { fill: "white", font: 'bold 48px sans-serif' } );
            this.text3.tint = this.colour3;
            this.text3.position.x = ((game.system.width / App.deviceScale()) / 4) - (this.text3.width / 2);
            this.text3.position.y = this.icons.position.y + (this.icons.height / 2) + 64;

            this.button = new game.Graphics();
            this.button.beginFill(this.colour2); 
            this.button.drawRect(0, 0, this.text3.width + 48, this.text3.height + 24);
            this.button.position.x = this.text3.position.x - 24;
            this.button.position.y = this.text3.position.y - 12;
            this.button.setInteractive(true);
            this.button.hitArea = new game.PIXI.Rectangle(0, 0, this.text3.width + 48, this.text3.height + 24);
            this.button.tap = this.button.click = function() {

                // Play level
                App.sendEvent('Level '+ (self.level + 1) +' Intro', 'click', 'Play');

                if(self.level === 0) {
                    App.buttonClick(game.scene.wipe, "wipe", "setScene", App.Home.GameIntro);
                } else {
                    App.playGame(self.games[0]);
                }

            };

            this.button.alpha = 0;

            this.heroBg = new game.PIXI.Sprite.fromImage("media/home/level_"+(this.level+1)+"_hero_bg.png");
            this.heroBg.height = (game.system.height / App.deviceScale()) - 60;
            this.heroBg.width = (game.system.height / App.deviceScale()) - 60;
            this.heroBg.position.x = (game.system.width / App.deviceScale());
            this.heroBg.position.y = 0;

            heroBgTween = new game.Tween(this.heroBg.position);
            heroBgTween.to({ x: (game.system.width / App.deviceScale()) - (this.heroBg.width * 0.9) }, 1500).easing(game.Tween.Easing.Quartic.Out);

            this.heroFg = new game.PIXI.Sprite.fromImage("media/home/level_"+(this.level+1)+"_hero_fg.png");
            this.heroFg.height = (game.system.height / App.deviceScale());
            this.heroFg.width = (game.system.height / App.deviceScale());
            this.heroFg.position.x = (game.system.width / App.deviceScale()) * 1.3;
            this.heroFg.position.y = 0;

            heroFgTween = new game.Tween(this.heroFg.position);
            heroFgTween.to({ x: (game.system.width / App.deviceScale()) - this.heroFg.width }, 1500).easing(game.Tween.Easing.Quartic.Out);

            this.back = new game.PIXI.Sprite.fromImage("media/home/back.png");
            this.back.width = 48;
            this.back.height = 48;
            this.back.position.x = 24;
            this.back.position.y = 24;
            this.back.setInteractive(true);
            this.back.hitArea = new game.PIXI.Rectangle(0,0,96,96);
            this.back.tint = this.colour4;
            this.back.tap = this.back.click = function(){
                App.buttonClick(game.scene.wipe, "wipe", "setScene", App.Home.Levels);
            };

            this.wipe = new game.Graphics();
            this.wipe.beginFill(0xce5064); 
            this.wipe.drawRect(0, 0, (game.system.width / App.deviceScale()), (game.system.height / App.deviceScale()) * 5);
            this.wipe.position.x = 0;
            this.wipe.position.y = 0;
            wipeTween = new game.Tween(this.wipe).to({ alpha: 0 }, 500);

            this.container.addChild(this.bottom);
            this.container.addChild(this.wreath);
            this.container.addChild(this.text1);
            this.container.addChild(this.icons);
            this.container.addChild(this.text2);
            this.container.addChild(this.button);
            this.container.addChild(this.text3);
            this.container.addChild(this.text4);
            this.container.addChild(this.text5);
            this.container.addChild(this.keyline);
            this.container.addChild(this.heroBg);
            this.container.addChild(this.heroFg);
            this.container.addChild(this.back);
            this.container.addChild(this.wipe);

            this.stage.addChild(this.container);
            wipeTween.start();
            heroBgTween.start();
            heroFgTween.start();

        }

    });
    
    App.Home.LevelOutro = game.Scene.extend({

        backgroundColor: 0x143559,

        init: function(){

            var score = 0, i, feedback, rand, wipeTween, self = this;
            
            // Get level list
            App.LevelList = App.getLevelList();

            // Container
            this.container = new game.Container();
            this.container.scale.set(App.deviceScale(), App.deviceScale());

            // Get Data
            this.level = game.storage.get("CurrentLevel");

            // Analytics event
            App.sendPageView('Level '+ (this.level+1) +' Outro Screen');

            this.games = App.LevelList[this.level].games;
            for(i = 0; i < this.games.length; i += 1) {
                score += game.storage.get("game_"+this.games[i]+"_score") || 0;
            }

            // Get percentage score
            this.overallScore = Math.ceil((score/300) * 100);
            //this.overallScore = 100;

            // Save score
            game.storage.set("level_"+ (this.level+1) +"_rating", this.overallScore);

            // Unlock level
            if(this.overallScore > 50) {

                // Unlock next level
                game.storage.set("level_"+ (this.level+1) +"_complete", true);

            }

            // Get feedback
            if(this.overallScore > 70) {

                // 3 stars
                rand = Math.floor(Math.random() * App.LevelList[this.level].feedback[2].length);
                feedback = App.LevelList[this.level].feedback[2][rand];

            } else if(this.overallScore > 60) {

                // 2 stars
                rand = Math.floor(Math.random() * App.LevelList[this.level].feedback[2].length);
                feedback = App.LevelList[this.level].feedback[1][rand];

            } else {

                // 1 star
                rand = Math.floor(Math.random() * App.LevelList[this.level].feedback[2].length);
                feedback = App.LevelList[this.level].feedback[0][rand];

            }

            this.name = App.LevelList[this.level].name;
            this.title = App.LevelList[this.level].title;
            this.description = App.LevelList[this.level].description;

            // Set colours
            this.colour1 = App.LevelList[this.level].palette[0]; // Dark
            this.colour2 = App.LevelList[this.level].palette[1]; // Med
            this.colour3 = App.LevelList[this.level].palette[2]; // Primary
            this.colour4 = App.LevelList[this.level].palette[3]; // Text

            // Set bg colour
            game.system.stage.setBackgroundColor(this.colour1);

            this.bottom = new game.Graphics();
            this.bottom.beginFill(this.colour2); 
            this.bottom.drawRect(0, (game.system.height / App.deviceScale()) - 48, (game.system.width / App.deviceScale()), 48);
            this.bottom.endFill();

            this.hero = new game.PIXI.Sprite.fromImage("media/home/level_"+(this.level+1)+"_outro.png");
            this.hero.height = 720;
            this.hero.width = 720;
            this.hero.position.x = (game.system.width / App.deviceScale()) - this.hero.width;
            this.hero.position.y = (game.system.height / App.deviceScale()) - this.hero.height;

            this.appName = new game.Text(game.storage.get("CurrentAppName"), { fill: "white", font: '60px sans-serif' } );
            this.appName.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.appName.width / 2);
            this.appName.position.y = 48;
            this.appName.tint = this.colour3;

            this.nextText = new game.Text( "Next".toUpperCase(), { fill: "white", font: 'bold 64px sans-serif' } );
            this.nextText.tint = this.colour3;
            this.nextText.position.x = (game.system.width / App.deviceScale()) - this.nextText.width - 48;
            this.nextText.position.y = ((game.system.height / App.deviceScale()) / 2) + 220;

            if(this.overallScore > 70) {
                this.stars = new game.PIXI.Sprite.fromImage("media/home/stars_3.png");
            } else if(this.overallScore > 60) {
                this.stars = new game.PIXI.Sprite.fromImage("media/home/stars_2.png");
            } else if(this.overallScore > 50) {
                this.stars = new game.PIXI.Sprite.fromImage("media/home/stars_1.png");
            } else {
                this.stars = new game.PIXI.Sprite.fromImage("media/home/stars_0.png");
            }

            this.stars.width = 180;
            this.stars.height = 180;
            this.stars.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.stars.width / 2);
            this.stars.position.y = this.appName.position.y + this.appName.height;
            this.stars.tint = this.colour4;

            this.scoreText = new game.Text(this.overallScore + "%", { fill: "white", align: "center", font: 'bold 64px sans-serif' } );
            this.scoreText.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.scoreText.width / 2);
            this.scoreText.position.y = this.stars.position.y + this.stars.height - (this.stars.height/5);
            this.scoreText.tint = this.colour4;
        
            if(this.overallScore > 50) {
                
                this.wreath = new game.PIXI.Sprite.fromImage("media/home/quote.png");
                this.wreath.anchor.set(0.5,0.5);
                this.wreath.width = 915;
                this.wreath.height = 168;
                this.wreath.position.x = ((game.system.width / App.deviceScale()) / 2);
                this.wreath.position.y = this.scoreText.position.y + this.scoreText.height + 128;
                this.wreath.tint = this.colour4;

                this.feedback = new game.Text("\"" + feedback[0] + "\"", { fill: "white", align: "center", font: 'bold 40px sans-serif', wordWrap: true, wordWrapWidth: ((game.system.width / App.deviceScale()) / 1.8) } );
                this.feedback.position.x = -(this.feedback.width / 2);
                this.feedback.position.y = -72;
                this.feedback.tint = this.colour4;

                this.author = new game.Text("- " + feedback[1], { fill: "white", align: "center", font: '32px sans-serif', wordWrap: true, wordWrapWidth: ((game.system.width / App.deviceScale()) / 2) } );
                this.author.position.x = -(this.author.width / 2);
                this.author.position.y = -64 + this.feedback.height + 16;
                this.author.tint = this.colour4;

                this.wreath.addChild(this.feedback);
                this.wreath.addChild(this.author);
                this.container.addChild(this.wreath);
            } else {
                this.feedback1 = new game.Text("Wow this app sucks!", { fill: "white", align: "center", font: 'bold 40px sans-serif' } );
                this.feedback1.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.feedback1.width / 2);
                this.feedback1.position.y = this.scoreText.position.y + this.scoreText.height + 48;
                this.feedback1.tint = this.colour4;

                this.feedback2 = new game.Text("You need at least 1 star to progress to the next level", { fill: "white", align: "center", font: '32px sans-serif' } );
                this.feedback2.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.feedback2.width / 2);
                this.feedback2.position.y = this.feedback1.position.y + this.feedback1.height + 16;
                this.feedback2.tint = this.colour4;

                this.container.addChild(this.feedback1);
                this.container.addChild(this.feedback2);
            }

            this.button = new game.Graphics();
            this.button.beginFill(this.colour2); 
            this.button.drawRect(0, 0, this.nextText.width + 48, this.nextText.height + 24);
            this.button.position.x = this.nextText.position.x - 24;
            this.button.position.y = this.nextText.position.y - 12;
            this.button.setInteractive(true);
            this.button.hitArea = new game.PIXI.Rectangle(0, 0, this.nextText.width + 24, this.nextText.height + 24);
            this.button.tap = this.button.click = function() {

                // Play level
                App.sendEvent('Level '+ (self.level + 1) +' Outro', 'click', 'Next');
                App.buttonClick(game.scene.wipe, "wipe", "setScene", App.Home.Levels);

            };
            this.button.alpha = 0;

            this.facebook = new game.PIXI.Sprite.fromImage("media/home/facebook.png");
            this.facebook.anchor.set(0.5,0.5);
            this.facebook.tint = this.colour3;
            this.facebook.width = 80;
            this.facebook.height = 80;
            this.facebook.position.x = 88;
            this.facebook.position.y = this.nextText.position.y + 40;
            this.facebook.setInteractive(true);
            this.facebook.hitArea = new game.PIXI.Rectangle(-40, -40, 80, 80);
            this.facebook.tap = this.facebook.click = this.share_facebook.bind(this);

            this.twitter = new game.PIXI.Sprite.fromImage("media/home/twitter.png");
            this.twitter.anchor.set(0.5,0.5);
            this.twitter.tint = this.colour3;
            this.twitter.width = 80;
            this.twitter.height = 80;
            this.twitter.position.x = this.facebook.position.x + this.twitter.width + 32;
            this.twitter.position.y = this.nextText.position.y + 40;
            this.twitter.setInteractive(true);
            this.twitter.hitArea = new game.PIXI.Rectangle(-40, -40, 80, 80);
            this.twitter.tap = this.twitter.click = this.share_twitter.bind(this);

            this.container.addChild(this.bottom);
            this.container.addChild(this.hero);
            this.container.addChild(this.appName);
            this.container.addChild(this.stars);
            this.container.addChild(this.scoreText);
            this.container.addChild(this.button);
            this.container.addChild(this.facebook);
            this.container.addChild(this.twitter);
            this.container.addChild(this.nextText);
           
            this.wipe = new game.Graphics();
            this.wipe.beginFill(0xce5064); 
            this.wipe.drawRect(0, 0, (game.system.width / App.deviceScale()), (game.system.height / App.deviceScale()) * 5);
            this.wipe.position.x = 0;
            this.wipe.position.y = 0;
            wipeTween = new game.Tween(this.wipe)
                .to({ alpha: 0 }, 500);

            this.stage.addChild(this.container);

            if(this.level === 2 && !game.storage.get("PopupClosed")) {

                // Container
                this.pop = new game.Container();
                this.pop.scale.set(App.deviceScale(), App.deviceScale());

                this.popupFade = new game.Graphics();
                this.popupFade.beginFill(this.colour1); 
                this.popupFade.drawRect(0, 0, (game.system.width / App.deviceScale()), (game.system.height / App.deviceScale()));
                this.popupFade.endFill();
                this.popupFade.alpha = 0.75;

                this.popup = new game.Graphics();
                this.popup.beginFill(this.colour3); 
                App.roundRect(this.popup, (game.system.width / App.deviceScale()) / 4, 48, (game.system.width / App.deviceScale()) / 2, (game.system.height / App.deviceScale()) - 96, 24, 24, 24, 24);
                this.popup.beginFill(this.colour4);
                App.roundRect(this.popup, (game.system.width / App.deviceScale()) / 4, 48, (game.system.width / App.deviceScale()) / 2, 144, 24, 24, 0, 0);
                this.popup.endFill();

                this.popupTitleText = new game.Text("Get Involved", { fill: "white", font: 'bold 48px sans-serif' } );
                this.popupTitleText.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.popupTitleText.width / 2);
                this.popupTitleText.position.y = 87.6;

                this.popupText = new game.Text("You’ll find the open source code for all these challenges at the Intel® Developer Zone.", { fill: "white", font: '32px sans-serif', wordWrap: true, wordWrapWidth: ((game.system.width / App.deviceScale()) / 2) - 128 } );
                this.popupText.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.popupText.width / 2);
                this.popupText.position.y = this.popupTitleText.position.y + this.popupTitleText.height + 96;
                this.popupText.tint = this.colour4;

                this.popupGo = new game.Text("Let’s go", { fill: "white", font: 'bold 32px sans-serif' } );
                this.popupGo.tint = this.colour4;
                this.popupGo.position.x = (game.system.width / App.deviceScale()) / 4 + 96;
                this.popupGo.position.y = (game.system.height / App.deviceScale()) - 128;

                this.popupClose = new game.Text("Maybe later", { fill: "white", font: '32px sans-serif' } );
                this.popupClose.tint = this.colour4;
                this.popupClose.position.x = ((game.system.width / App.deviceScale()) * 3/4) - this.popupClose.width - 96;
                this.popupClose.position.y = (game.system.height / App.deviceScale()) - 128;
    
                this.popupCloseButton = new game.Graphics();
                this.popupCloseButton.beginFill(this.colour2); 
                this.popupCloseButton.drawRect(0, 0, this.popupClose.width + 48, this.popupClose.height + 24);
                this.popupCloseButton.position.x = this.popupClose.position.x - 24;
                this.popupCloseButton.position.y = this.popupClose.position.y - 12;
                this.popupCloseButton.setInteractive(true);
                this.popupCloseButton.hitArea = new game.PIXI.Rectangle(0, 0, this.popupClose.width + 24, this.popupClose.height + 24);
                this.popupCloseButton.tap = this.popupCloseButton.click = this.closePopup.bind(this);
                this.popupCloseButton.alpha = 0;

                this.pop.addChild(this.popupFade);
                this.pop.addChild(this.popup);
                this.pop.addChild(this.popupTitleText);
                this.pop.addChild(this.popupText);
                this.pop.addChild(this.popupClose);
                this.pop.addChild(this.popupGo);
                this.pop.addChild(this.popupCloseButton);
                this.stage.addChild(this.pop);
            }

            this.container.addChild(this.wipe);
            wipeTween.start();
            
        },

        share_twitter: function(){

            var text = "I got {score}% with ‘{appname}’ on Dev Story/*HACK THE CODE*/! #IntelAndroid";

            text = text.replace("{score}", this.overallScore);
            text = text.replace("{appname}", game.storage.get("CurrentAppName"));

            // Analytics event
            App.sendEvent('Level '+ (this.level + 1) +' Intro', 'click', 'Share Twitter');

            var shareUrl = "https://twitter.com/share?";
                shareUrl += "url=http://intel.ly/1pRAKWA";
                shareUrl += "&text="+encodeURIComponent(text);

            window.open(shareUrl, '_system');

        },

        share_facebook: function(){
            
            var text = "I just scored {score}% with ‘{appname}’ on Dev Story/*HACK THE CODE*/! Head over to the Intel® Developer Zone to download the open-source app and go from bedroom developer to tech superstar. #IntelAndroid";

            text = text.replace("{score}", this.overallScore);
            text = text.replace("{appname}", game.storage.get("CurrentAppName"));
            
            // Analytics event
            App.sendEvent('Level '+ (this.level + 1) +' Intro', 'click', 'Share Facebook');

            // Level outro
            var shareUrl = "https://www.facebook.com/dialog/feed?";
                shareUrl += "app_id=692903567464031";
                //shareUrl += "app_id=755674014474493";
                shareUrl += "&display=popup";
                shareUrl += "&picture=http://int-android.mrmpweb.co.uk/share.png";
                shareUrl += "&actions={ name: 'Dev Story/*HACK THE CODE*/', link: 'http://www.google.com' }";
                shareUrl += "&link=https://software.intel.com/";
                shareUrl += "&description="+ encodeURIComponent(text);
                shareUrl += "&redirect_uri=https://software.intel.com/";

            // Open share
            window.open(shareUrl, '_system');

        },

        closePopup: function(){

            // Analytics event
            App.sendEvent('Level '+ (this.level + 1) +' Intro', 'click', 'Close Popup');

            // Save popup cookie
            game.storage.set("PopupClosed", true);

            // Remove popup
            this.stage.removeChild(this.pop);

        }

    });
});
