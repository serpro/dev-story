game.module(
    'modules.home.objects'
)
.require(
    'engine.core'
)
.body(function() {
    App.Home.HomeButton = game.Class.extend({

        id: 0,
        name: "",

        init: function(){

            // Container
            this.container = new game.Container();
            this.container.scale.set(App.deviceScale(), App.deviceScale());

            // Set bigger play button
            if(this.id === 0) {
                this.text = new game.Text( this.name.toUpperCase(), { fill: "white", font: 'bold 64px sans-serif' } );
                this.text.tint = 0x51b6b0;
                this.text.position.x = 235;
                this.text.position.y = ((game.system.height / App.deviceScale()) /2);
            } else {
                this.text = new game.Text( this.name.toUpperCase(), { fill: "white", font: 'bold 32px sans-serif' } );
                this.text.position.x = 235;
                this.text.position.y = ((game.system.height / App.deviceScale()) /2) + 45 + (this.id * 60);
            }

            // Create graphic
            this.button = new game.Graphics();
            this.button.beginFill(0x000000);
            this.button.drawRect(
                this.text.position.x - 25, // X
                this.text.position.y - 5, // Y
                480, // W
                this.text.height + 10 // H
            );

            // Create hitbox
            this.button.setInteractive(true);
            this.button.hitArea = new game.PIXI.Rectangle(
                this.text.position.x - 25, // X
                this.text.position.y - 5, // Y
                480, // W
                this.text.height + 10 // H
            );

            // Create buttons
            switch(this.name) {
                case "Play":
                    this.button.tap = this.button.click = function(){
                        // Analytics event
                        App.sendEvent('MainMenu', 'click', 'PLAY');
                        App.transition(game.scene.wipe, "setScene", App.Home.Levels);
                    };
                    break;
                case "Get involved":
                    this.button.tap = this.button.click = function(){
                        // Analytics event
                        App.sendEvent('MainMenu', 'click', 'GET INVOLVED');
                        App.buttonClick(game.scene.wipe, "wipe", "setScene", App.Home.GetInvolved);
                    };
                    break;
                case "About":
                    this.button.tap = this.button.click = function(){
                        // Analytics event
                        App.sendEvent('MainMenu', 'click', 'ABOUT');
                        App.buttonClick(game.scene.wipe, "wipe", "setScene", App.Home.About);
                    };
                    break;
                case "Credits":
                    this.button.tap = this.button.click = function(){
                        // Analytics event
                        App.sendEvent('MainMenu', 'click', 'CREDITS');
                        App.buttonClick(game.scene.wipe, "wipe", "setScene", App.Home.Credits);
                    };
                    break;
            }

            // Hide hit area
            this.button.alpha = 0;

            // Add to stage
            this.container.addChild(this.button);
            this.container.addChild(this.text);
            game.scene.stage.addChild(this.container);
            game.scene.addObject(this);

        }

    });

    App.Home.Stages = game.Class.extend({

        moving: false,
        position:0,

        init: function(){

            // Create container
            this.stages = new game.Container();
            game.scene.stage.addChild(this.stages);
            game.scene.addObject(this);

        },

        update: function(){

            // Check the direction of movement
            if(game.scene.direction === "right") {

                // If there is no other movement and there is a position to move to
                if(!game.scene.movement && this.position > 0) {

                    // Set the new position
                    this.position -= 1;

                    // Flag for movement
                    game.scene.movement = true;

                    // Set new target position
                    this.targetPosition = -this.position * (game.system.width / 2.5);

                } 

                // If there is movement
                if(game.scene.movement) {

                    // If the stage still has distance to travel
                    if(this.stages.position.x <= this.targetPosition) {

                        // move the stage
                        this.stages.position.x += (game.system.width / App.deviceScale()) * game.system.delta;

                        // If the stage overan
                        if(this.stages.position.x >= this.targetPosition) {

                            // Reset the stage
                            this.stages.position.x = this.targetPosition;

                            // Stop movement
                            game.scene.movement = false;

                            // Reset the direction flag
                            game.scene.direction = null;

                        }
                    } 
                }
            }
            
            // Check the direction of movement
            if(game.scene.direction === "left") {
                
                // If there is no other movement and there is a position to move to
                if(!game.scene.movement && this.position < (App.LevelList.length / 3) + 1) {
                    
                    // Set the new position
                    this.position += 1;
                    
                    // Flag for movement
                    game.scene.movement = true;
                    
                    // Set new target position
                    this.targetPosition = -this.position * (game.system.width / 2.5);

                } 
                
                // If there is movement
                if(game.scene.movement) {
                    
                    // If the stage still has distance to travel
                    if(this.stages.position.x >= this.targetPosition) {
                        
                        // move the stage
                        this.stages.position.x -= (game.system.width / App.deviceScale()) * game.system.delta;
                        
                        // If the stage overan
                        if(this.stages.position.x <= this.targetPosition) {
                            
                            // Reset the stage
                            this.stages.position.x = this.targetPosition;
                            
                            // Stop movement
                            game.scene.movement = false;
                            
                            // Reset the direction flag
                            game.scene.direction = null;

                        }
                    } 
                }
            }
         }
    });

    App.Home.StageButton = game.Class.extend({

        id: 0,
        idx: 1,
        name: "",
        title: "",
        games: [],
        rating: 0,
        unlocked: false,

        init: function(){

            var self = this, stageTween;

            // Container
            this.container = new game.Container();
            this.container.scale.set(App.deviceScale(), App.deviceScale());

            // Objects
            this.interact = new game.Graphics();
            this.interact.drawRect(
                48 + (this.idx * (game.system.width / App.deviceScale() / 2.5)), // X
                (game.system.height / App.deviceScale() / 2) - 240, // Y
                (game.system.width / App.deviceScale() / 2.5) - 96, // W
                380// H
            );

            // Create hitbox
            this.interact.setInteractive(true);
            this.interact.hitArea = new game.PIXI.Rectangle(
                48 + (this.idx * (game.system.width / App.deviceScale() / 2.5)), // X
                (game.system.height / App.deviceScale() / 2) - 240, // Y
                (game.system.width / App.deviceScale() / 2.5) - 96, // W
                380// H
            );

            // Set locked state
            this.interact.tap = this.interact.click = function(){
                if(!game.scene.movement) {
                    if(self.unlocked) {

                        // Set storage
                        game.storage.set("CurrentLevel", self.id);
                        game.storage.set("CurrentMiniGame", 0);
                        game.storage.set("CurrentGames", self.games);

                        // Check the item is the level 4 stage
                        if(self.id === 3) {
                            // Analytics event
                            App.sendEvent('Levels', 'click', 'Level 4');
                            App.buttonClick(game.scene.wipe, "wipe", "setScene", App.Home.GetInvolved);
                        } else {
                            // Analytics event
                            App.sendEvent('Levels', 'click', 'Level ' + (self.id+1));
                            App.buttonClick(game.scene.wipe, "wipe", "setScene", App.Home.LevelIntro);
                        }
                    } 
                }
            };

            this.image = new game.PIXI.Sprite.fromImage("media/home/levels_level_"+(this.idx+1)+".png");
            this.image.anchor.set(0.5,0.5);
            this.image.position.x = (((game.system.width / App.deviceScale())/2.5)/2) + (this.idx * ((game.system.width / App.deviceScale())/2.5));
            this.image.position.y = ((game.system.height / App.deviceScale()) / 2) - 24;
            this.image.alpha = (this.unlocked) ? 1 : 0.25;
            this.image.scale = { x: 0, y: 0 };

            this.text1 = new game.Text( this.name, { fill: "white", font: 'bold 32px sans-serif' } );
            this.text1.position.x = 0;
            this.text1.position.y = -280;
            this.text1.anchor.set(0.5,0.5);

            this.text2 = new game.Text( "\"" + this.title + "\"", { fill: "white", font: '40px sans-serif' } );
            this.text2.position.x = 0;
            this.text2.position.y = -220;
            this.text2.anchor.set(0.5,0.5);

            this.text4 = new game.Text( "High Score: " + this.rating + "%", { fill: "white", font: '32px sans-serif' } );
            this.text4.position.x = 0;
            this.text4.position.y = 320;
            this.text4.anchor.set(0.5,0.5);

            if(this.rating > 75) {
                this.wreath = new game.PIXI.Sprite.fromImage("media/home/star_3.png");
            } else if(this.rating > 60) {
                this.wreath = new game.PIXI.Sprite.fromImage("media/home/star_2.png");
            } else if(this.rating === 0) {
                this.wreath = new game.PIXI.Sprite.fromImage("media/home/star_0.png");
            } else {
                this.wreath = new game.PIXI.Sprite.fromImage("media/home/star_1.png");
            }

            this.wreath.width = 96;
            this.wreath.height = 96;
            this.wreath.anchor.set(0.5,0.5);
            this.wreath.position.x = 0;
            this.wreath.position.y = 240;

            if(this.id === 3) {
                this.text3 = new game.Text( "Create".toUpperCase(), { fill: "white", font: 'bold 32px sans-serif' } );
            } else {
                this.text3 = new game.Text( "Play".toUpperCase(), { fill: "white", font: 'bold 32px sans-serif' } );
            }

            this.text3.tint = 0x143559;
            this.text3.position.x = 0;
            this.text3.position.y = 136;
            this.text3.anchor.set(0.5,0.5);

            // Add to stage
            this.image.addChild(this.text1);
            this.image.addChild(this.text2);
            this.image.addChild(this.text3);
            this.container.addChild(this.image);

            if(this.id !== 3) {
                this.image.addChild(this.wreath);
                this.image.addChild(this.text4);
            }
            this.container.addChild(this.interact);

            game.scene.stages.stages.addChild(this.container);
            stageTween = new game.Tween(this.image.scale)
                .to({ x: 1, y: 1 }, 500)
                .delay(125 * this.id)
                .easing(game.Tween.Easing.Back.Out);
            stageTween.start();

        }
    });
});

App.GameIntro = game.Class.extend({

    icon: "",
    title: "",
    text1: "",
    text2: "",
    img1: "",
    img2: "",
    link: "",

    init: function(){

        // Container
        this.container = new game.Container();
        this.container.scale.set(App.deviceScale(), App.deviceScale());

        // Get level
        this.level = game.storage.get("CurrentLevel");

        // Colours
        this.colour1 = App.currentPalette[0]; // Dark
        this.colour2 = App.currentPalette[1]; // Med
        this.colour3 = App.currentPalette[2]; // Primary
        this.colour4 = App.currentPalette[3]; // Text

        // Objects
        this.fade = new game.Graphics();
        this.fade.beginFill(this.colour4); 
        this.fade.drawRect(0, 0, (game.system.width / App.deviceScale()), (game.system.height / App.deviceScale()));
        this.fade.endFill();
        this.fade.alpha = 0.75;

        this.bg = new game.Graphics();
        this.bg.beginFill(0xFFFFFF); 
        App.roundRect(this.bg, 96, 64, (game.system.width / App.deviceScale()) - 192, (game.system.height / App.deviceScale()) - 128, 24, 24, 24, 24);
        this.bg.beginFill(this.colour2);
        App.roundRect(this.bg, 96, 64, (game.system.width / App.deviceScale()) - 192, 144, 24, 24, 0, 0);
        this.bg.endFill();

        this.titleText = new game.Text(this.title, { fill: "white", font: 'bold 48px sans-serif' } );
        this.titleText.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.titleText.width / 2);
        this.titleText.position.y = 128;
        this.titleText.tint = 0xFFFFFF;

        this.iconBg = new game.Graphics();
        this.iconBg.beginFill(0xFFFFFF); 
        this.iconBg.drawCircle(0,0,48);
        this.iconBg.endFill();
        this.iconBg.position.x = ((game.system.width / App.deviceScale()) / 2);
        this.iconBg.position.y = 64;

        this.titleIcon = new game.Sprite(this.icon);
        this.titleIcon.position.x = ((game.system.width / App.deviceScale()) / 2) - 48;
        this.titleIcon.position.y = 16;
        this.titleIcon.tint = this.colour2;

        this.text1 = new game.Text(this.text1, { align: "center", fill: "white", font: '28px sans-serif', wordWrap: true, wordWrapWidth: ((game.system.width / App.deviceScale()) / 1.2) } );
        this.text1.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.text1.width / 2);
        this.text1.position.y = this.titleText.position.y + this.titleText.height + 64;
        this.text1.tint = 0x000000;

        this.image1 = new game.Sprite(this.img1[0]);
        this.image1.width = this.img1[1];
        this.image1.height = this.img1[2];
        this.image1.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.image1.width / 2);
        this.image1.position.y = this.text1.position.y + this.text1.height + 24;

        if(this.text2 !== "") {
            this.text2 = new game.Text(this.text2, { align: "center", fill: "white", font: '28px sans-serif', wordWrap: true, wordWrapWidth: ((game.system.width / App.deviceScale()) / 1.2) } );
            this.text2.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.text2.width / 2);
            this.text2.position.y = this.image1.position.y + this.image1.height + 24;
            this.text2.tint = 0x000000;
        }

        this.playText = new game.Text( "Play".toUpperCase(), { fill: "white", font: 'bold 38px sans-serif' } );
        this.playText.tint = this.colour2;
        this.playText.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.playText.width / 2);

        if(this.img2[0] !== "") {
            this.image2 = new game.Sprite(this.img2[0]);
            this.image2.width = this.img2[1];
            this.image2.height = this.img2[2];
            this.image2.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.image2.width / 2);
            this.image2.position.y = this.text2.position.y + this.text2.height + 24;
        } 

        this.playText.position.y = this.bg.position.y + this.bg.height - 48;

        this.button = new game.Graphics();
        this.button.beginFill(this.colour4); 
        App.roundRect(this.button, 0, 0, this.playText.width + 64, this.playText.height + 24, 24, 24, 24, 24);
        this.button.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.playText.width / 2) - 32;
        this.button.position.y = this.playText.position.y - 12;
        this.button.setInteractive(true);
        this.button.hitArea = new game.PIXI.Rectangle(0, 0, this.playText.width + 24, this.playText.height + 24);
        this.button.tap = this.button.click = this.go.bind(this);
        this.button.alpha = 0;

        this.wipe = new game.Graphics();
        this.wipe.beginFill(this.colour2); 
        this.wipe.drawRect(0, 0, (game.system.width / App.deviceScale()), (game.system.height / App.deviceScale()));
        this.wipe.position.x = 0;
        this.wipe.position.y = 0;
        var wipeTween = new game.Tween(this.wipe).to({ alpha: 0 }, 500);

        this.container.addChild(this.fade);
        this.container.addChild(this.bg);
        this.container.addChild(this.iconBg);
        this.container.addChild(this.titleIcon);
        this.container.addChild(this.button);
        this.container.addChild(this.playText);
        this.container.addChild(this.text1);
        this.container.addChild(this.image1);

        if(this.text2) {
            this.container.addChild(this.text2);
        }

        if(this.image2) {
            this.container.addChild(this.image2);
        }

        this.container.addChild(this.titleText);
        this.container.addChild(this.wipe);
        game.scene.stage.addChild(this.container);

        wipeTween.start();

    },

    go: function(){
        this.level = game.storage.get("CurrentLevel");

        // Analytics event
        App.sendEvent('Challenge ' + (this.level+1) + ' Intro', 'click', 'PLAY');

        // Button Click
        App.buttonClick(this.button, "flash", "setScene", this.link);

    }

});

App.GameOutro = game.Class.extend({

    icon: "",
    title: "",
    shape: "",
    score: "",
    
    init: function(){

        // Container
        this.container = new game.Container();
        this.container.scale.set(App.deviceScale(), App.deviceScale());
        
        // Colours
        this.colour1 = App.currentPalette[0]; // Dark
        this.colour2 = App.currentPalette[1]; // Med
        this.colour3 = App.currentPalette[2]; // Primary
        this.colour4 = App.currentPalette[3]; // Text

        // Objects
        this.fade = new game.Graphics();
        this.fade.beginFill(this.colour4); 
        this.fade.drawRect(0, 0, (game.system.width / App.deviceScale()), (game.system.height / App.deviceScale()));
        this.fade.endFill();
        this.fade.alpha = 0.75;

        this.bg = new game.Graphics();
        this.bg.beginFill(0xFFFFFF); 
        App.roundRect(this.bg, 96, 64, (game.system.width / App.deviceScale()) - 192, (game.system.height / App.deviceScale()) - 128, 24, 24, 24, 24);
        this.bg.beginFill(this.colour2);
        App.roundRect(this.bg, 96, 64, (game.system.width / App.deviceScale()) - 192, 180, 24, 24, 0, 0);
        this.bg.endFill();

        this.titleText1 = new game.Text(this.title, { align: "center", fill: "white", font: '44px sans-serif' } );
        this.titleText1.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.titleText1.width / 2);
        this.titleText1.position.y = 112;

        this.iconBg = new game.Graphics();
        this.iconBg.beginFill(0xFFFFFF); 
        this.iconBg.drawCircle(0,0,48);
        this.iconBg.endFill();
        this.iconBg.position.x = ((game.system.width / App.deviceScale()) / 2);
        this.iconBg.position.y = 64;

        this.titleIcon = new game.Sprite(this.icon);
        this.titleIcon.position.x = ((game.system.width / App.deviceScale()) / 2) - 48;
        this.titleIcon.position.y = 16;
        this.titleIcon.tint = this.colour2;

        this.titleText2 = new game.Text( "\""+ game.storage.get("CurrentAppName") +"\"", { align: "center", fill: "white", font: 'bold 44px sans-serif' } );
        this.titleText2.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.titleText2.width / 2);
        this.titleText2.position.y = 164;

        this.text1 = new game.Text("Score", { align: "center", fill: "white", font: '32px sans-serif' } );
        this.text1.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.text1.width / 2);
        this.text1.position.y = this.titleText2.position.y + this.titleText2.height + 56;
        this.text1.tint = 0x000000;

        this.shape = new game.Sprite(this.shape);
        this.shape.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.shape.width / 2);
        this.shape.position.y = ((game.system.height / App.deviceScale()) / 2) - (this.shape.height / 2) + 72;

        this.scoreText = new game.Text(this.score, { fill: "white", font: 'bold 64px sans-serif' } );
        this.scoreText.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.scoreText.width / 2);
        this.scoreText.position.y = this.shape.position.y + (this.shape.height / 2) - (this.scoreText.height / 2);
        
        this.nextText = new game.Text( "Next".toUpperCase(), { fill: "white", font: 'bold 48px sans-serif' } );
        this.nextText.tint = this.colour2;
        this.nextText.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.nextText.width / 2);
        this.nextText.position.y = (game.system.height / App.deviceScale()) - 168;

        this.button = new game.Graphics();
        this.button.beginFill(this.colour4); 
        App.roundRect(this.button, 0, 0, this.nextText.width + 64, this.nextText.height + 24, 24, 24, 24, 24);
        this.button.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.nextText.width / 2) - 32;
        this.button.position.y = (game.system.height / App.deviceScale()) - 180;
        this.button.setInteractive(true);
        this.button.hitArea = new game.PIXI.Rectangle(0, 0, this.nextText.width + 24, this.nextText.height + 24);
        this.button.tap = this.button.click = this.go.bind(this);
        this.button.alpha = 0;

        this.container.addChild(this.fade);
        this.container.addChild(this.bg);
        this.container.addChild(this.shape);
        this.container.addChild(this.iconBg);
        this.container.addChild(this.titleIcon);
        this.container.addChild(this.scoreText);
        this.container.addChild(this.text1);
        this.container.addChild(this.button);
        this.container.addChild(this.nextText);
        this.container.addChild(this.titleText1);
        this.container.addChild(this.titleText2);
        game.scene.stage.addChild(this.container);

    },
    
    go: function(){

        this.level = game.storage.get("CurrentLevel");

        // Analytics event
        App.sendEvent('Challenge ' + (this.level+1) + ' Outro', 'click', 'Next');
        
        // Button click
        App.buttonClick(this.button, "flash", "nextLevel");

    }
});
        
