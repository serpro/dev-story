game.module(
    'modules.pause.objects'
)
.require(
    'engine.core'
)
.body(function() {
    
    App.Pause.PauseButton = game.Class.extend({

        init: function(){ 

            // Container
            this.container = new game.Container();
            this.container.scale.set(App.deviceScale(), App.deviceScale());

            // Objects
            this.colour1 = App.currentPalette[0]; // Dark
            this.colour2 = App.currentPalette[1]; // Med
            this.colour3 = App.currentPalette[2]; // Primary
            this.colour4 = App.currentPalette[3]; // Text

            this.pauseButton = new game.Graphics();
            this.pauseButton.beginFill(this.colour2); 
            this.pauseButton.drawCircle(0, 0, 40);
            this.pauseButton.position.x = 60;
            this.pauseButton.position.y = 60;

            this.pauseIcon = new game.PIXI.Sprite.fromImage('media/pause.png');
            this.pauseIcon.height = 80;
            this.pauseIcon.width = 80;
            this.pauseIcon.position.x = 20;
            this.pauseIcon.position.y = 20;

            this.pauseButton.setInteractive(true);
            this.pauseButton.hitArea = new game.PIXI.Circle(0, 0, 40);
            this.pauseButton.tap = this.pauseButton.click = this.togglePause.bind(this);

            // Add objects to scene
            this.container.addChild(this.pauseButton);
            this.container.addChild(this.pauseIcon);
            game.scene.stage.addChild(this.container);
        }, 

        togglePause: function(){

            // Check game is paused
            if(App.paused) {

                // If there is a pause screen
                if(this.pauseScreen) {

                    // Resume game
                    this.pauseScreen.resume();

                }

            } else {

                // Pause game
                App.paused = true;

                // Create pause screen
                this.pauseScreen = new App.Pause.PauseScreen();

            }
        }

    });

    App.Pause.PauseScreen = game.Class.extend({

        init: function(){

            // Container
            this.container = new game.Container();
            this.container.scale.set(App.deviceScale(), App.deviceScale());

            // Objects
            this.colour1 = App.currentPalette[0]; // Dark
            this.colour2 = App.currentPalette[1]; // Med
            this.colour3 = App.currentPalette[2]; // Primary
            this.colour4 = App.currentPalette[3]; // Text

            this.fade = new game.Graphics();
            this.fade.beginFill(this.colour4); 
            this.fade.drawRect(0, 0, (game.system.width / App.deviceScale()), (game.system.height / App.deviceScale()));
            this.fade.endFill();
            this.fade.alpha = 0.75;

            this.bg = new game.Graphics();
            this.bg.beginFill(0xFFFFFF); 
            App.roundRect(this.bg, 240, 48, (game.system.width / App.deviceScale()) - 480, (game.system.height / App.deviceScale()) - 96, 24, 24, 24, 24);
            this.bg.beginFill(this.colour2);
            App.roundRect(this.bg, 240, 48, (game.system.width / App.deviceScale()) - 480, 144, 24, 24, 0, 0);
            this.bg.endFill();

            this.titleText = new game.Text( "Paused", { fill: "white", font: 'bold 72px sans-serif' } );
            this.titleText.position.x = ((game.system.width / App.deviceScale()) / 2) - (this.titleText.width / 2);
            this.titleText.position.y = 82;

            this.soundsText = new game.Text( "Sounds", { fill: "white", font: '64px sans-serif' } );
            this.soundsText.position.y = 144 + (((game.system.height / App.deviceScale()) - 320) / 4);
            this.soundsText.tint = 0x666666;

            this.soundsIcon = new game.PIXI.Sprite.fromImage('media/pause_sound.png');
            this.soundsIcon.height = 60;
            this.soundsIcon.width = 60;
            this.soundsIcon.position.x = 300;
            this.soundsIcon.position.y = 144 + (((game.system.height / App.deviceScale()) - 320) / 4);
            this.soundsIcon.tint = 0x666666;

            this.vibrateText = new game.Text( "Vibrate", { fill: "white", font: '64px sans-serif' } );
            this.vibrateText.position.y = 144 + (((game.system.height / App.deviceScale()) - 320) / 4) * 2;
            this.vibrateText.tint = 0x666666;

            this.vibrateIcon = new game.PIXI.Sprite.fromImage('media/pause_vibrate.png');
            this.vibrateIcon.height = 60;
            this.vibrateIcon.width = 60;
            this.vibrateIcon.position.x = 300;
            this.vibrateIcon.position.y = 144 + (((game.system.height / App.deviceScale()) - 320) / 4) * 2;
            this.vibrateIcon.tint = 0x666666;

            this.quitText = new game.Text( "Quit", { fill: "white", font: '64px sans-serif' } );
            this.quitText.position.y = 144 + (((game.system.height / App.deviceScale()) - 320) / 4) * 3;
            this.quitText.tint = 0x666666;

            this.quitIcon = new game.PIXI.Sprite.fromImage('media/pause_quit.png');
            this.quitIcon.height = 60;
            this.quitIcon.width = 60;
            this.quitIcon.position.x = 300;
            this.quitIcon.position.y = 144 + (((game.system.height / App.deviceScale()) - 320) / 4) * 3;
            this.quitIcon.tint = 0x666666;

            this.resumeText = new game.Text( "Resume".toUpperCase(), { fill: "white", font: 'bold 64px sans-serif' } );
            this.resumeText.position.y = 144 + (((game.system.height / App.deviceScale()) - 320) / 4) * 4;
            this.resumeText.tint = this.colour2;

            this.resumeIcon = new game.PIXI.Sprite.fromImage('media/pause_resume.png');
            this.resumeIcon.height = 60;
            this.resumeIcon.width = 60;
            this.resumeIcon.position.x = 300;
            this.resumeIcon.position.y = 144 + (((game.system.height / App.deviceScale()) - 320) / 4) * 4;
            this.resumeIcon.tint = this.colour2;

            this.soundsText.position.x = this.vibrateText.position.x = this.quitText.position.x = this.resumeText.position.x = 380;

            this.quitButton = new game.Graphics();
            this.quitButton.beginFill(this.colour4); 
            App.roundRect(this.quitButton, 0, 0, (game.system.width / App.deviceScale()) - 560, this.quitText.height + 18, 24, 24, 24, 24);
            this.quitButton.position.x = this.quitText.position.x - 100;
            this.quitButton.position.y = this.quitText.position.y - 12;
            this.quitButton.setInteractive(true);
            this.quitButton.hitArea = new game.PIXI.Rectangle(0, 0, 602, this.quitText.height + 18);
            this.quitButton.tap = this.quitButton.click = function(){

                // Analytics event
                App.sendEvent('Pause', 'click', 'Quit');

                // Quit
                App.paused = false;
                App.buttonClick(this, "flash", "goHome");

            };
            this.quitButton.alpha = 0;

            this.resumeButton = new game.Graphics();
            //this.resumeButton.beginFill(this.colour2); 
            this.resumeButton.drawRect(0, 0, 602, this.resumeText.height + 18);
            this.resumeButton.position.x = this.resumeText.position.x -72;
            this.resumeButton.position.y = this.resumeText.position.y - 6;
            this.resumeButton.setInteractive(true);
            this.resumeButton.hitArea = new game.PIXI.Rectangle(0, 0, 602, this.resumeText.height + 18);
            this.resumeButton.tap = this.resumeButton.click = this.resume.bind(this);
            this.resumeButton.alpha = 0;

            this.muteSlider = new game.Graphics();
            this.muteSlider.beginFill(this.colour2); 
            this.muteSlider.drawRect(0, 0, 108, 6);
            this.muteSlider.position.x = ((game.system.width / App.deviceScale()) / 2) + (this.bg.width / 2) - 180;
            this.muteSlider.position.y = this.soundsText.position.y + 36;
            this.muteSlider.alpha = 0.25;

            this.muteKnob = new game.Graphics();
            this.muteKnob.beginFill(this.colour2); 
            this.muteKnob.drawCircle(0, 0, 24);
            if(App.mute) {
                this.muteKnob.position.x = ((game.system.width / App.deviceScale()) / 2) + (this.bg.width / 2) - 156;
            } else {
                this.muteKnob.position.x = ((game.system.width / App.deviceScale()) / 2) + (this.bg.width / 2) - 96;
            }
            this.muteKnob.position.y = this.soundsText.position.y + 36;

            this.muteButton = new game.Graphics();
            //this.muteButton.beginFill(0xFF0000); 
            this.muteButton.drawRect(0, 0, 144, 72);
            this.muteButton.position.x = ((game.system.width / App.deviceScale()) / 2) + (this.bg.width / 2) - 180;
            this.muteButton.position.y = this.soundsText.position.y;
            this.muteButton.setInteractive(true);
            this.muteButton.hitArea = new game.PIXI.Rectangle(0, 0, 144, 72);
            this.muteButton.tap = this.muteButton.click = this.toggleMute.bind(this);
            this.muteButton.alpha = 0.1;

            this.vibrateSlider = new game.Graphics();
            this.vibrateSlider.beginFill(this.colour2); 
            this.vibrateSlider.drawRect(0, 0, 108, 6);
            this.vibrateSlider.position.x = ((game.system.width / App.deviceScale()) / 2) + (this.bg.width / 2) - 180;
            this.vibrateSlider.position.y = this.vibrateText.position.y + 36;
            this.vibrateSlider.alpha = 0.25;

            this.vibrateKnob = new game.Graphics();
            this.vibrateKnob.beginFill(this.colour2); 
            this.vibrateKnob.drawCircle(0, 0, 24);
            if(App.novibrations) {
                this.vibrateKnob.position.x = ((game.system.width / App.deviceScale()) / 2) + (this.bg.width / 2) - 156;
            } else {
                this.vibrateKnob.position.x = ((game.system.width / App.deviceScale()) / 2) + (this.bg.width / 2) - 96;
            }
            this.vibrateKnob.position.y = this.vibrateText.position.y + 36;

            this.vibrateButton = new game.Graphics();
            //this.vibrateButton.beginFill(0xFF0000); 
            this.vibrateButton.drawRect(0, 0, 144, 72);
            this.vibrateButton.position.x = ((game.system.width / App.deviceScale()) / 2) + (this.bg.width / 2) - 180;
            this.vibrateButton.position.y = this.vibrateText.position.y;
            this.vibrateButton.setInteractive(true);
            this.vibrateButton.hitArea = new game.PIXI.Rectangle(0, 0, 144, 72);
            this.vibrateButton.tap = this.vibrateButton.click = this.toggleVibrate.bind(this);
            this.vibrateButton.alpha = 0.1;

            this.container.addChild(this.fade);
            this.container.addChild(this.bg);
            this.container.addChild(this.titleText);
            this.container.addChild(this.soundsText);
            this.container.addChild(this.soundsIcon);
            this.container.addChild(this.vibrateText);
            this.container.addChild(this.vibrateIcon);
            this.container.addChild(this.quitText);
            this.container.addChild(this.quitIcon);
            this.container.addChild(this.resumeText);
            this.container.addChild(this.resumeIcon);
            this.container.addChild(this.quitButton);
            this.container.addChild(this.resumeButton);
            this.container.addChild(this.vibrateSlider);
            this.container.addChild(this.vibrateKnob);
            this.container.addChild(this.vibrateButton);
            this.container.addChild(this.muteSlider);
            this.container.addChild(this.muteKnob);
            this.container.addChild(this.muteButton);
            game.scene.stage.addChild(this.container);

        },

        toggleMute: function(){

            // If app is mute
            if(App.mute) {
                
                // Unmute
                App.mute = false;

                // Analytics event
                App.sendEvent('Pause', 'click', 'Unmute');

                // Save mute state
                game.storage.set("gameMuted", false);

                // resume music
                game.audio.resumeMusic();

                // Set graphical display
                this.muteKnob.position.x = ((game.system.width / App.deviceScale()) / 2) + (this.bg.width / 2) - 96;

            } else {

                // Mute
                App.mute = true;

                // Analytics event
                App.sendEvent('Pause', 'click', 'Mute');

                // Save mute state
                game.storage.set("gameMuted", true);

                // Stop music
                game.audio.pauseMusic();

                // Set graphical display
                this.muteKnob.position.x = ((game.system.width / App.deviceScale()) / 2) + (this.bg.width / 2) - 156;

            }
        },

        toggleVibrate: function(){

            // Check app has no vibrations
            if(App.novibrations) {

                // Unvibrations
                App.novibrations = false;

                // Analytics event
                App.sendEvent('Pause', 'click', 'VibrationsOn');

                // Save state
                game.storage.set("gameVibrations", false);

                // Set knob
                this.vibrateKnob.position.x = ((game.system.width / App.deviceScale()) / 2) + (this.bg.width / 2) - 96;

            } else {

                // Vibrations
                App.novibrations = true;

                // Analytics event
                App.sendEvent('Pause', 'click', 'VibrationsOff');

                // Set state
                game.storage.set("gameVibrations", true);

                // Set knob
                this.vibrateKnob.position.x = ((game.system.width / App.deviceScale()) / 2) + (this.bg.width / 2) - 156;
                
            }

        },

        resume: function(){

            // Analytics event
            App.sendEvent('Pause', 'click', 'Resume');

            // Unpause
            App.paused = false;

            // Remove pause screen
            game.scene.stage.removeChild(this.container);
            game.scene.removeObject(this);

        }

    });
});