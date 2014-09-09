game.module(
    'modules.coding.objects'
)
.require(
    'engine.core'
)
.body(function() {
    
    App.Coding.Row = game.Class.extend({

        types: ["++", "</>", "==", "{;}", "!=", "[i]", "&&", "//", "<?>"],
        toFix: true,

        init: function(){

            // Set row config
            var rowSettings = [1,0,0], i, shuffledRow = App.shuffleArray(rowSettings);

            // Loop through row items
            for(i = 0; i < shuffledRow.length; i += 1) {

                // Find row item
                if(shuffledRow[i] === 1) {

                    // Bug squish graphic
                    this.squish = new game.PIXI.Sprite.fromImage("media/coding/squish.png");
                    this.squish.scale = { x: 0, y: 0 };
                    this.squish.anchor.set(0.5,0.5);
                    this.squish.position.x = 0;
                    this.squish.position.y = game.scene.positions[i];
                    this.squish.scaleIn = new game.Tween(this.squish.scale).to({ x: 1, y: 1 }, 250).easing(game.Tween.Easing.Back.Out);
                    this.squish.scaleOut = new game.Tween(this.squish.scale).to({ x: 0, y: 0 }, 250);
                    this.squish.scaleOut.delay(500);

                    // Bug graphic
                    this.bug = new game.PIXI.Sprite.fromImage("media/coding/bug.png");
                    this.bug.scale = { x: 0, y: 0 };
                    this.bug.anchor.set(0.52,0.52);
                    this.bug.position.x = 0;
                    this.bug.position.y = 0;
                    this.bug.scaleIn = new game.Tween(this.bug.scale).to({ x: 1, y: 1 }, 500);
                    this.bug.scaleOut = new game.Tween(this.bug.scale).to({ x: 0, y: 0 }, 500);

                    // Hex
                    this.hex = new game.PIXI.Sprite.fromImage("media/coding/code.png");
                    this.hex.row = i;
                    this.hex.failed = false;
                    this.hex.scored = false;
                    this.hex.isBug = false;
                    this.hex.scale = { x: 1, y: 1 };
                    this.hex.anchor.set(0.5,0.5);
                    this.hex.position.x = 0;
                    this.hex.position.y = game.scene.positions[i];
                    this.hex.hitArea = new game.PIXI.Rectangle(-65, -65, 132, 132);
                    this.hex.click = this.hex.tap = this.removeBug.bind(this);

                    // Hex icon
                    this.icon = new game.Text(this.types[Math.floor(Math.random() * this.types.length)], { fill: "white", font: 'bold 48px sans-serif' } );
                    this.icon.anchor.set(0.5,0.5);
                    this.icon.position.x = 0;
                    this.icon.position.y = 0;
                    if(this.hex.row === 0){ this.icon.tint = App.currentPalette[1]; }
                    if(this.hex.row === 1){ this.icon.tint = App.currentPalette[2]; }
                    if(this.hex.row === 2){ this.icon.tint = App.currentPalette[0]; }
                    this.icon.scaleIn = new game.Tween(this.icon.scale).to({ x: 1, y: 1 }, 500);
                    this.icon.scaleOut = new game.Tween(this.icon.scale).to({ x: 0, y: 0 }, 500);

                    // Hex flash 1
                    this.flash1 = new game.PIXI.Sprite.fromImage("media/coding/code.png");
                    this.flash1.anchor.set(0.5,0.5);
                    this.flash1.position.x = 0;
                    this.flash1.position.y = game.scene.positions[i];

                    // Hex flash 2
                    this.flash2 = new game.PIXI.Sprite.fromImage("media/coding/code.png");
                    this.flash2.anchor.set(0.5,0.5);
                    this.flash2.position.x = 0;
                    this.flash2.position.y = game.scene.positions[i];

                    // Add items to hex
                    this.hex.addChild(this.icon);
                    this.hex.addChild(this.bug);

                    // Add items to stage
                    game.scene.codeLayer.addChild(this.squish);
                    game.scene.codeLayer.addChild(this.flash1);
                    game.scene.codeLayer.addChild(this.flash2);
                    game.scene.codeLayer.addChild(this.hex);

                }
            }

            return this;

        },

        removeBug: function(){

            var i, toFix;

            // Check not already fixed
            if(!this.hex.fixed) {

                // Set flashing, fixed, remove from bug list
                this.hex.flashed = true;
                this.hex.fixed = true;
                this.hex.isBug = false;

                // Increment counter
                game.scene.counter += 1;

                // Tween bug graphic
                this.squish.scaleIn.start();
                this.squish.scaleOut.start();

                // Set tofix flag
                toFix = false;

                // Check how many bugs there are left to fix
                for(i = 0; i < game.scene.codeLayer.children.length; i += 1) {
                    if(game.scene.codeLayer.children[i].hasOwnProperty("row")) {
                        if(game.scene.codeLayer.children[i].isBug) {
                            toFix = true;
                        }
                    }
                }

                // Set global flag
                if(!toFix) {
                    this.toFix = false;
                } else {
                    this.toFix = true;
                }
            }
            
        },

        update: function(){

            var flashTween, flash1Fade, flash2Fade, flash1Scale, flash2Scale,
                hexFade;

            // Move the objects to the right
            if(!game.scene.ended && !game.scene.pauseObjects && !this.hex.failed && !this.hex.scored && !App.paused) {
                this.hex.position.x += game.scene.speed * game.system.delta;
                this.squish.position.x = this.flash1.position.x = this.flash2.position.x = this.hex.position.x;
            }

            // Check we are in debug mode
            if(game.scene.pauseObjects && this.hex.isBug && !this.hex.fixed) {

                // Allow the click
                this.hex.setInteractive(true);

                // Change the colour
                this.hex.tint = 0xFF0000;

                // Play tween once
                if(this.bug.scale.x === 0) {
                    this.hex.flashing = true;
                    this.icon.scaleOut.start();
                    this.bug.scaleIn.start();
                }
            }

            // Check item is supposed to flash
            if(this.hex.flashing && !this.hex.flashStart && !this.hex.fixed && !App.paused) {

                // Start the flash
                this.hex.flashStart = true;

                // Set the initial scale
                this.flash1.scale = { x: 1, y: 1 };
                this.flash2.scale = { x: 1, y: 1 };

                // Set the initial alpha
                this.flash1.alpha = 0.5;
                this.flash2.alpha = 0.5;

                // Create the tweens
                flashTween = new game.TweenGroup();
                flash1Fade = new game.Tween(this.flash1).to({ alpha: 0 }, 650).easing(game.Tween.Easing.Quartic.Out);
                flash1Fade.repeat(99);
                flash2Fade = new game.Tween(this.flash2).to({ alpha: 0 }, 650).easing(game.Tween.Easing.Quartic.Out);
                flash2Fade.repeat(99);
                flash1Scale = new game.Tween(this.flash1.scale).to({ x: 1.5, y: 1.5 }, 650).easing(game.Tween.Easing.Quartic.Out);
                flash1Scale.repeat(99);
                flash2Scale = new game.Tween(this.flash2.scale).to({ x: 2, y: 2 }, 650).easing(game.Tween.Easing.Quartic.Out);
                flash2Scale.repeat(99);

                // Tween group
                flashTween.add(flash1Fade);
                flashTween.add(flash2Fade);
                flashTween.add(flash1Scale);
                flashTween.add(flash2Scale);

                // Start the tweens
                flashTween.start();

            }

            // If item failed
            if(this.hex.failed) {

                // Change colours
                this.hex.tint = 0xFF0000;
                this.icon.tint = 0xFFFFFF;

            }

            // If item scored
            if(this.hex.scored) {
                
                // Change colours
                this.hex.tint = 0x00FF00;
                this.icon.tint = 0xFFFFFF;

            }

            // Check if item has passed the end zone
            if(this.hex.position.x > game.scene.mouseZoneStart + 156) {

                // Make uncapturable and fail
                if(!this.hex.failed && !this.hex.scored) {

                    // Object passed area
                    game.scene.enterBugsMode();
                    this.hex.failed = true;

                }

            }

            // Check item has scored or has been fixed
            if(this.hex.scored || this.hex.fixed || game.scene.ended) {

                // Set to flashing
                this.hex.flashing = true;
               
                // Fade out
                hexFade = new game.Tween(this.hex).to({ alpha: 0 }, 500);
                hexFade.start();

                // After the item has faded out
                if(this.hex.alpha === 0 || game.scene.ended) {

                    // Remove the item
                    game.scene.codeLayer.removeChild(this.hex);
                    game.scene.codeLayer.removeChild(this.squish);
                    game.scene.codeLayer.removeChild(this.flash1);
                    game.scene.codeLayer.removeChild(this.flash2);
                    game.scene.removeObject(this);

                    // Leave bug mode
                    if(!this.toFix && game.scene.pauseObjects && !game.scene.ended) {
                        game.scene.leaveBugsMode();
                    }

                }
            }
        }

    });

    App.Coding.Countdown = game.Class.extend({

        init: function(){

            // Countdown text
            this.text = new game.BitmapText( "Test", { font: 'Roboto-export' });

            // Countdown position
            this.location = new game.Vector(0, 32);

            // Tint
            this.colour = 0xFFFFFF;

            // Display time
            this.displayTime = game.scene.timeleft;
            
            // Add to scene
            game.scene.container.addChild(this.text);
            game.scene.addObject(this);

        },
        
        update: function(){

            var textWidth, textHeight;

            // Update timeleft
            game.scene.timeleft -= App.getDelta();
            game.scene.timeleft = Math.max(game.scene.timeleft, 0);

            // Update display time
            this.displayTime = Math.ceil(game.scene.timeleft).toString();
            
            // Update display
            this.text.setText(this.displayTime);
            
            // Check time
            if(game.scene.timeleft === 0 && !game.scene.ended){

                // End game
                game.scene.endGame();

            } else if(this.displayTime < 6){ 

                // Move to center and make bigger
                this.textScale = 2 + 0.4 * Math.sin(game.scene.timeleft % 1 * Math.PI);
                textWidth = this.text.getBounds().width;
                textHeight = this.text.getBounds().height;
                this.location.set( 
                    ((game.system.width / App.deviceScale()) / 2) - (textWidth / 2), 
                    ((game.system.width / App.deviceScale()) / 4) - (textHeight / 2)
                );

            } else {

                // Move to top right
                this.textScale = 1;
                textWidth = this.text.getBounds().width;
                this.location.x = (game.system.width / App.deviceScale()) - (32 + textWidth);

            }
            
            // Show
            this.display();

        },
        
        display: function(){

            // Set position
            this.text.position.set(this.location.x, this.location.y);

            // Set scale
            this.text.scale.set(this.textScale,this.textScale);

        }

    });

    App.Coding.Controls = game.Class.extend({

        init: function(){

            // Create container
            this.controls = new game.Container();
            this.controls.scale.set(App.deviceScale(), App.deviceScale());

            // Set controls size
            var control_size = ((game.system.height / App.deviceScale()) / 5), self = this;

            // Create control graphics            
            this.control_top = new game.Graphics();
            this.control_top.setInteractive(true);
            this.control_top.hitArea = new game.PIXI.Rectangle(game.scene.mouseZoneStart, game.scene.positions[0] - (control_size / 2), 180, control_size);
            this.control_top.tap = this.control_top.click = function(){
                if(!game.scene.ended && !App.paused) {
                    self.playerInput(0);
                }
            };

            this.control_middle = new game.Graphics();
            this.control_middle.setInteractive(true);
            this.control_middle.hitArea = new game.PIXI.Rectangle(game.scene.mouseZoneStart, game.scene.positions[1] - (control_size / 2), 180, control_size);
            this.control_middle.tap = this.control_middle.click = function(){
                if(!game.scene.ended && !App.paused) {
                    self.playerInput(1);
                }
            };

            this.control_bottom = new game.Graphics();
            this.control_bottom.setInteractive(true);
            this.control_bottom.hitArea = new game.PIXI.Rectangle(game.scene.mouseZoneStart, game.scene.positions[2] - (control_size / 2), 180, control_size);
            this.control_bottom.tap = this.control_bottom.click = function(){
                if(!game.scene.ended && !App.paused) {
                    self.playerInput(2);
                }
            };

            // Add to stage
            this.controls.addChild(this.control_top);
            this.controls.addChild(this.control_middle);
            this.controls.addChild(this.control_bottom);
            game.scene.stage.addChild(this.controls);
            game.scene.addObject(this);

        },

        playerInput: function(position) {

            // Play sound
            App.playSound("coding_click");

            // Get the current hex
            this.hex = game.scene.rows[game.scene.counter].hex;

            // Check the hex is passed the first zone
            if(this.hex.position.x > game.scene.mouseZoneStart) { 

                // If the hex is in the right row
                if(this.hex.row === position) {

                    // Add to counter
                    game.scene.counter += 1;

                    // Score good
                    this.hex.scored = true;

                    // Check item has passed the second zone
                    if(this.hex.position.x > game.scene.mouseZoneStart + 48) { 

                        // Add perfect score
                        game.scene.addPerfectScore();

                    } else {

                        // Add good score
                        game.scene.addGoodScore();

                    }
                } else {

                    // Item is in the wrong lane
                    game.scene.enterBugsMode();

                    // Item has failed
                    this.hex.failed = true;

                }
            } else {

                // No items in the zone
                game.scene.resetCombo();

            }

        },

        update: function(){

            // If the game is paused
            if(game.scene.pauseObjects) {

                // Move the controls out of the scene
                this.controls.position.x = -9999;

            } else {

                // Reset controls position
                this.controls.position.x = 0;

            }
        }

    });
});