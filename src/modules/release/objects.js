game.module(
    'modules.release.objects'
)
.require(
    'engine.core'
)
.body(function() {

    App.Release.Hype = game.Class.extend({

        id: 0,
        score:0,
        isPlayer: false,
        direction: "up",
        prevDirection: "up",
        difficulty: 1,
        index: 0,
        probability1: [0, 0, 0, 0, 1, 1, 2],
        probability2: [2, 2, 2, 2, 1, 1, 0],
        totalItems: 0,
        activeCount: 0,
        items: [],

        init: function(){

            // Store this
            var launch, radius = 36, angle = (Math.PI * 2), i, j, k, item, position;

            // Container
            this.container = new game.Container();
            this.container.scale.set(App.deviceScale(), App.deviceScale());

            // Draw Guide
            this.guide = new game.Graphics();
            this.guide.beginFill(0x000000);
            this.guide.drawCircle(game.scene.positions[this.id], (game.system.height / App.deviceScale()) / 1.7, 192);
            this.guide.alpha = 0.3;

            // Player
            if(this.isPlayer) {

                // Get app name
                if(!game.storage.get("CurrentAppName")) {
                    game.storage.set("CurrentAppName", App.generateName(true));
                }

                // Names
                this.name = new game.Text( game.storage.get("CurrentAppName"), { fill: "white", font: 'bold 32px sans-serif', align: "center", wordWrap: true, wordWrapWidth: ((game.system.width / App.deviceScale()) / 3) });
                this.name.position.x = game.scene.positions[this.id] - this.name.width / 2;
                this.name.position.y = 160 - (this.name.height / 2);
                //this.name.tint = App.getHexNumber(241,88,54);
                this.container.addChild(this.name);

                // Draw circles
                this.guide.beginFill(App.currentPalette[1]);
                this.guide.drawCircle(game.scene.positions[this.id], (game.system.height / App.deviceScale()) / 1.7, 72);
                this.guide.endFill();

                // Draw button
                this.launch = new game.Graphics();
                this.launch.beginFill(App.currentPalette[2]);
                this.launch.drawCircle(game.scene.positions[this.id], (game.system.height / App.deviceScale()) / 1.7, 60);
                this.launch.endFill();
                this.launch.setInteractive(true);
                this.launch.hitArea = new game.PIXI.Circle(game.scene.positions[this.id], (game.system.height / App.deviceScale()) / 1.7, 72);
                this.launch.click = this.launch.tap = function(){
                    App.vibrate(1000);
                    game.scene.stop = true;
                    game.scene.endGame();
                };
                this.container.addChild(this.guide);
                this.container.addChild(this.launch);

                // Draw text
                launch = new game.Text("Launch Your App", { fill: "white", font: 'bold 20px sans-serif', align: "center", wordWrap: true, wordWrapWidth: 60 });
                launch.position.x = game.scene.positions[this.id] - (launch.width / 2);
                launch.position.y = ((game.system.height / App.deviceScale()) / 1.7) - (launch.height / 2);
                this.container.addChild(launch);

            } else {

                // Other players
                this.name = new game.Text( App.generateName(true), { fill: "white", font: '32px sans-serif', align: "center", wordWrap: true, wordWrapWidth: ((game.system.width / App.deviceScale()) / 4) });
                this.name.position.x = game.scene.positions[this.id] - this.name.width / 2;
                this.name.position.y = 160 - (this.name.height / 2);
                //this.name.tint = App.getHexNumber(241,88,54);
                this.container.addChild(this.name);

                // Draw circles
                this.guide.beginFill(0x000000);
                this.guide.drawCircle(game.scene.positions[this.id], (game.system.height / App.deviceScale()) / 1.7, 72);
                this.guide.endFill();

                // Draw button
                this.launch = new game.Graphics();
                this.launch.beginFill(App.currentPalette[3]);
                this.launch.drawCircle(game.scene.positions[this.id], (game.system.height / App.deviceScale()) / 1.7, 60);
                this.launch.endFill();
                this.launch.alpha = 0.25;
                this.container.addChild(this.guide);
                this.container.addChild(this.launch);

                // Draw text
                launch = new game.Text("Rival", { fill: "white", font: 'bold 20px sans-serif', align: "center" });
                launch.position.x = game.scene.positions[this.id] - (launch.width / 2);
                launch.position.y = ((game.system.height / App.deviceScale()) / 1.7) - (launch.height / 2);
                this.container.addChild(launch);

            }

            // Loop through 4 rings
            for(i = 1; i < 4; i += 1) {

                // Calculate number of items per ring
                k = i * 15;
                if(i === 2) { k -= 8; }
                if(i === 3) { k -= 16; }

                // Add empty array item
                this.items.push([]);

                // Loop through each ring item
                for(j = 0; j < k; j += 1) {

                    // Get the icon position
                    position = this.getItemPosition(angle, k, j, radius, i);

                    // Draw the item
                    item = new game.PIXI.Sprite.fromImage('media/release/'+ Math.ceil(Math.random() * 25) +'.png');
                    item.width = 58;
                    item.height = 58;
                    item.alpha = 0;
                    item.changed = false;
                    item.pivot = { x: item.width / 2, y: item.height / 2 };
                    item.rotation = Math.PI*1.5 + ((angle / k) * j);
                    item.position.x = position[0];
                    item.position.y = position[1];

                    // Add the item
                    this.container.addChild(item);
                    this.items[i-1].push([item, false]);
                    this.totalItems += 1;

                }
            }

            // Set initial speed
            this.speed = 5 * this.difficulty;

            // Add everything
            game.scene.stage.addChild(this.container);
            game.scene.addObject(this);

        },

        update: function(){

            // Stop the animation
            if(game.scene.stop || App.paused) {
                return;
            }

            /** 
                XDK_PARAMS
                This section deals with the game difficulty
                As the sine wave oscillates between -1 and 1, icons are added or removed from the rings.
                What changes could you make to improve the gameplay here?
            */

            // Calculate wave size
            this.wave = Math.sin(this.index);

            // Add to index
            this.index += game.system.delta * this.speed;

            // If the wave is positive
            if(this.wave > 0) {

                // Set direction
                this.direction = "up";

                // Add items
                this.activateItem();

            } else {

                // Set direction
                this.direction = "down";

                // Add items
                this.deactivateItem();

            }

            // Set direction
            if(this.direction !== this.prevDirection) {

                // Direction has changed
                this.prevDirection = this.direction;

                // Set new speed
                this.speed = 1 + Math.random();

            }

            // Set score
            this.score = (this.activeCount / this.totalItems) * 100;

        },

        getItemPosition: function(angle, k, j, radius, i){

            // k = num items
            // j = item index
            // radius = 3%
            // i = ring index
            // angle = (Math.PI * 2);

            var x, y;
            x = game.scene.positions[this.id] - (Math.cos((angle / k) * j) * ((1.6 * radius) + (radius * i)));
            y = ((game.system.height / App.deviceScale()) / 1.7) - (Math.sin((angle / k) * j) * ((1.6 * radius) + (radius * i)));
            return [x,y];

        },

        activateItem: function(){

            var rand1 = 0, rand2, ring, ok = false, tween; 

            // While we still need to find an item 
            while(!ok) {

                // Check there are items to turn on
                if(this.activeCount === this.totalItems) {

                    // No items to turn on, flag as ok
                    ok = true;

                } else {

                    // Choose random ring
                    ring = this.probability1[rand1];

                    // Check ring is not full
                    if(this.checkRing(ring) === "full" && rand1 < this.probability1.length - 1) {

                        // Choose new ring
                        rand1 += 1;
                        ring = this.probability1[rand1];

                    } else {

                        // Choose item
                        rand2 = Math.floor(Math.random() * this.items[ring].length);

                        // Check the item is off
                        if(this.items[ring][rand2][1] === false) {

                            // Turn on item
                            this.items[ring][rand2][1] = true;

                            // Add to count
                            this.activeCount += 1;

                            // Animate
                            tween = new game.Tween(this.items[ring][rand2][0]).to({ alpha: 1 }, 250);
                            tween.start();

                            // Flag
                            ok = true;

                        }
                    }
                }
            }
        },

        deactivateItem: function(){

            // Vars
            var rand1 = 0, rand2, ring, ok = false, tween;

            // While we still need to find an item 
            while(!ok) {

                // Check there are items to turn off
                if(this.activeCount === 0) {

                    // Flag ok
                    ok = true;

                } else {

                    // Choose random ring
                    ring = this.probability2[rand1];

                    // Check ring is not empty
                    if(this.checkRing(ring) === "empty" && rand1 < this.probability2.length - 1) {

                        // Choose new ring
                        rand1 += 1;
                        ring = this.probability2[rand1];

                    } else {

                        // Choose item
                        rand2 = Math.floor(Math.random() * this.items[ring].length);

                        // Check the item is off
                        if(this.items[ring][rand2][1] === true) {

                            // Turn on item
                            this.items[ring][rand2][1] = false;
                            
                            // Add to count
                            this.activeCount -= 1;

                            // Animate
                            tween = new game.Tween(this.items[ring][rand2][0]).to({ alpha: 0 }, 250);
                            tween.start();

                            // Flag
                            ok = true;

                        }
                    }
                }
            }

        },

        checkRing: function(ring){

            // Vars
            var i, items = 0;

            // Loop through ring items
            for(i = 0; i < this.items[ring].length; i += 1) {

                // Check item is turned on
                if(this.items[ring][i][1] === true) {

                    // Add to count
                    items += 1;

                }
            }

            // If the ring is full
            if(items === this.items[ring].length) {
                return "full";
            }

            // If the ring is empty
            if(items === 0) {
                return "empty";
            }

            // Or its neither
            return "ok";

        }
        
    });

    App.Release.Countdown = game.Class.extend({

        init: function(){

            // Countdown text
            this.text = new game.BitmapText( "Test", { font: 'Roboto-export' });

            // Countdown position
            this.location = new game.Vector(0, 32);

            // Tint
            this.colour = 0xFFFFFF;
            
            // Timeleft
            this.time = 30;

            // Display time
            this.displayTime = this.time;
            
            // Add to scene
            game.scene.container.addChild(this.text);
            game.scene.addObject(this);

        },
        
        update: function(){

            var textHeight, textWidth;

            // Update timeleft
            this.time -= App.getDelta();
            this.time = Math.max(this.time, 0);

            // Update display time
            this.displayTime = Math.ceil(this.time).toString();
            
            // Update display
            this.text.setText(this.displayTime);
            
            // Check time
            if(this.time === 0 && !game.scene.ended){

                // Vibrate
                App.vibrate(1000);

                // Stop the game
                game.scene.stop = true;
                
                // End game
                game.scene.endGame();

            } else if(this.displayTime < 6){ 

                // Move to center and make bigger
                this.textScale = 2 + 0.4 * Math.sin(this.displayTime % 1 * Math.PI);
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
});
