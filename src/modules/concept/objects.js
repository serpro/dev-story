game.module(
    'modules.concept.objects'
)
.require(
    'engine.camera',
    'engine.core',
    'engine.loader',
    'engine.scene',
    'engine.renderer',
    'engine.particle',
    'engine.system',
    'engine.timer',
    'engine.tween'
)
.body(function() {
    
    // SPRITE CONTAINERS

    App.Concept.GameLayer = game.Class.extend({
        init: function(){
            this.gameWidth = window.innerWidth * game.device.pixelRatio * 2;
            this.gameHeight = window.innerHeight * game.device.pixelRatio * 2;

            var tScreenCenter = App.getScreenCenter();
            
            this.gameLeftEdge = tScreenCenter.x-(this.gameWidth/2);
            this.gameRightEdge = tScreenCenter.x+(this.gameWidth/2);
            this.gameTopEdge = tScreenCenter.y-(this.gameHeight/2);
            this.gameBottomEdge = tScreenCenter.y+(this.gameHeight/2);
            
            this.container = new game.Container();
            
            game.scene.stage.addChild(this.container);
        },
        
        getRandomPositionInGameWorld: function(){
            return new game.Vector(App.randomBetween(this.gameLeftEdge, this.gameRightEdge), App.randomBetween(this.gameTopEdge, this.gameBottomEdge));
        }   
    });
    
    App.Concept.PlayerLayer = game.Class.extend({
        init: function(){
            this.container = new game.Container();
            game.scene.stage.addChild(this.container);
        }
    });
    
    App.Concept.ReverseTimeLayer = game.Class.extend({
        init: function(){
            this.container = new game.Container();
            game.scene.stage.addChild(this.container);
        }
    });
    
    // PALETTE AND BACKGROUND
    
    App.Concept.Palette = game.Class.extend({
        init: function(whichScene_){
            this.bright = 0xffffff;
            this.hue1 =  App.currentPalette[0];//spark
            this.hue2 =  App.currentPalette[1];//cog
            this.hue3 =  App.currentPalette[2];//nucleus
            this.dark =  App.currentPalette[3];
        }
    });
    
    App.Concept.Background = game.Class.extend({
        init: function(){
            var asset = 'concept/level_' + (game.scene.level+1) + '_background_tile_01.png';
            this.sprite = new game.TilingSprite(asset, game.scene.gameLayer.gameWidth, game.scene.gameLayer.gameHeight);
            this.sprite.position.set(game.scene.gameLayer.gameLeftEdge, game.scene.gameLayer.gameTopEdge);   
            game.scene.gameLayer.container.addChild(this.sprite);
        }
    });
    
    // MOVER CLASS
    
    App.Concept.Mover = game.Class.extend({
        /*
        Base steering behaviour class from which all common sprite behaviours are inherited.
        Based on Craig Reynolds paper 'Steering Behaviours for Autonomous Characters' http://www.red3d.com/cwr/steer/
        This version also informed by Daniel Shiffman's implementation in http://natureofcode.com/
        Optimisations implemented to minimise creation of unnecessary vector objects and minimise use of Math.sqrt
        */
        
        init: function() {
            this.radius = 16 * App.deviceScale();
            this.location = game.scene.gameLayer.getRandomPositionInGameWorld();
            this.velocity = new game.Vector();
            this.acceleration = new game.Vector();
            this.maxSpeed = 1 * App.deviceScale();
            this.maxForce = 1 * App.deviceScale();
            this.arrivalRadius = 100 * App.deviceScale();
            this.wanderRadius = 10 * App.deviceScale();
            
            this.sprite = new game.Sprite('mover.png');
            this.sprite.anchor.set(0.5, 0.5);
            game.scene.gameLayer.container.addChild(this.sprite);
            game.scene.addObject(this);
        },
        
        applyForce: function(force_){
            // Accumulate forces
            this.acceleration.add(force_);
        },
        
        wander: function(){
            // Follow the general direction the sprite is currently heading in with an offset determined by wanderRadius value
            var cloneVelocity = this.velocity.clone();
            cloneVelocity.normalize();
            cloneVelocity.multiply(this.wanderSpeed);
            var wanderOffset = App.randomUnitVector();
            wanderOffset.multiply(this.wanderRadius);
            cloneVelocity.add(wanderOffset);
            cloneVelocity.normalize();
            cloneVelocity.multiply(this.wanderSpeed);
            cloneVelocity.subtract(this.velocity);
            if(App.lengthSqu(cloneVelocity) > this.maxForce){
                cloneVelocity.normalize();
                cloneVelocity.multiply(this.maxForce);
            }
            return cloneVelocity;
        },
        
        seek: function(target_){
            // Move towards a target vector
            var cloneTarget = target_.clone();
            var desired = cloneTarget.subtract(this.location);
            var d = desired.length();
            desired.normalize();
            if (d < this.arrivalRadius) {
                var m = App.mapToRange(d, 0, this.arrivalRadius, 0, this.maxSpeed);
                desired.multiply(m);
            } else {
                desired.multiply(this.maxSpeed);
            }
            desired.subtract(this.velocity);
            if(App.lengthSqu(desired) > this.maxForce){
                desired.normalize();
                desired.multiply(this.maxForce);
            }       
            return desired;
        },
        
        proximitySeek: function(target_){
            // Seek a target Vector if it falls within a certain radius
            var cloneTarget = target_.clone();
            cloneTarget.subtract(this.location);
            var d = cloneTarget.length();
            if (d < this.seekRadius){
                return this.seek(target_);
            }else{
                return App.emptyVector;
            }
        },
        
        arrived: function(target_){
            // Check to see if a sprite has arrived at a given location
            var cloneTarget = target_.clone();
            var desired = cloneTarget.subtract(this.location);
            var d = desired.length();
            if (d<1 * App.deviceScale()){
                return true;   
            }else{
                return false;
            }
        },
        
        evade: function(pursuer_){
            // Attempt to move away from a sprite location if it encroaches within a certain radius
            var cloneLocation = this.location.clone();
            var desired = cloneLocation.subtract(pursuer_);
            var d = desired.length();
            if (d < this.fearRadius) {
                var m = App.mapToRange(d, 0, this.fearRadius, this.maxSpeed, 0);
                desired.normalize();
                desired.multiply(m);
                desired.subtract(this.velocity);
                if(App.lengthSqu(desired) > this.maxForce){
                    desired.normalize();
                    desired.multiply(this.maxForce);
                }
            }else{
                desired.multiply(0);
            }
            
            return desired;
        },
        
        separate: function(avoidArray_){
            // Try to move away from one or more sprites if they encroach on a desired separation range
            var sum = new game.Vector();
            var count = 0;
            for(var i=0; i<avoidArray_.length; i++) {
                var other = avoidArray_[i];
                var d = this.location.distance(other.location);
                if ((d > 0) && (d < this.desiredSeparation + other.desiredSeparation)) {
                    var locationClone = this.location.clone();
                    var diff = locationClone.subtract(other.location);
                    diff.normalize();
                    diff.divide(d); 
                    sum.add(diff);
                    count++;
                }
            }
            
            if (count > 0) {
                // Found at least one sprite that is encroaching on separation range
                sum.divide(count);
                sum.normalize();
                sum.multiply(this.maxSpeed);
                sum.subtract(this.velocity);
                if(sum.length() > this.maxForce){
                    sum.normalize();
                    sum.multiply(this.maxForce);
                }
                return sum;
            }else{
                return App.emptyVector;
            }
        },
        
        cluster: function(clusterArray_) {
            // Attempt to group together with one or more sprites that fall within a radius of interest
            var sum = new game.Vector();
            var count = 0;
            for(var i=0; i<clusterArray_.length; i++) {
                var other = clusterArray_[i];
                var d = this.location.distance(other.location);
                if ((d > 0) && (d < this.clusterRadius)) {
                    sum.add(other.location);
                    count++;
                }
            }
            if (count > 0) {
                sum.divide(count);
                return this.seek(sum); 
            }else{
                return App.emptyVector;
            }
        },
        
        avoidWalls: function(){
            // Attempt to move from edges of the play area in the event the sprite gets too close
            
            var wallCollision = false;
            if(this.location.x < game.scene.gameLayer.gameLeftEdge+this.wallOffset){
                wallCollision = true;
                var desired = new game.Vector(this.maxSpeed, this.velocity.y);
            }else if(this.location.x > (game.scene.gameLayer.gameRightEdge-this.wallOffset)){
                wallCollision = true;
                var desired = new game.Vector(-this.maxSpeed, this.velocity.y);
            }
            if(this.location.y < game.scene.gameLayer.gameTopEdge+this.wallOffset){
                wallCollision = true;
                var desired = new game.Vector(this.velocity.x, this.maxSpeed);
            }else if(this.location.y > (game.scene.gameLayer.gameBottomEdge-this.wallOffset)){
                wallCollision = true;
                var desired = new game.Vector(this.velocity.x, -this.maxSpeed);
            }
            
            if(wallCollision){
                desired.subtract(this.velocity);
                if(App.lengthSqu(desired) > this.maxForce){
                    desired.normalize();
                    desired.multiply(this.maxForce);
                }
                return desired;
            }else{
                return App.emptyVector;
            }
        },
        
        collideWalls: function(){
            // Crude collision handling that reverses axis velocity component in the event it moves beyond the edge. Less computationally expensive than avoidWalls but less aesthetically pleasing behaviour
            
            if(this.location.x-this.radius < game.scene.gameLayer.gameLeftEdge){
                this.velocity.x = -this.velocity.x;
            }else if(this.location.x+this.radius > (game.scene.gameLayer.gameRightEdge)){
                this.velocity.x = -this.velocity.x;
            }
            
            if(this.location.y-this.radius < game.scene.gameLayer.gameTopEdge){
                this.velocity.y = -this.velocity.y;
            }else if(this.location.y+this.radius > (game.scene.gameLayer.gameBottomEdge)){
                this.velocity.y = -this.velocity.y;
            }
        },
        
        applyFriction: function(coefficientOfFriction_){
            // Apply friction to sprite motion
            
            var friction = this.velocity.clone();
            friction.multiply(-1);
            friction.normalize();
            friction.multiply(coefficientOfFriction_);
            return friction; 
        },
        
        update: function(){
            /* 
            Integrate forces with time step.
            
            XDK_APEX 
            Note this is a partial implementation of the symplectic Euler integration method but does not integrate the acceleration component as this breaks Reynolds classical steering behaviour implementation.
            This approach nevertheless provides reasonable normalisation of sprite behaviour across devices and framerates
            Scope for improvement in accuracy based on a full symplectic Euler, Verlett or Runge Kutta implementation
            */
            
            this.velocity.add(this.acceleration);
            this.velocity.limit(this.maxSpeed);
            var changeInLocation = this.velocity.clone();            
            changeInLocation.multiply(App.getDelta());
            this.location.add(changeInLocation);
            this.acceleration.multiply(0);
            this.display();
        },
        
        display: function(){
            this.sprite.position.set(this.location.x, this.location.y);
        },
        
        fade: function(){
            if(!this.fading){
                // Initialise sprite vanshing animation tween
                this.fading = true;
                this.spriteTween = new game.Tween(this.sprite.scale);
                this.spriteTween.to({x:0, y:0}, 200);
                this.spriteTween.easing(game.Tween.Easing.Back.In);
                this.spriteTween.onComplete(this.kill.bind(this));
                this.spriteTween.start();
            }
        },
        
        kill: function(){
            // Remove the sprite from its container and the object from the scene
            game.scene.player.resetGulp();
            this.sprite.remove();
            game.scene.removeObject(this);
        }
    });
    
    // DISTRACTION CLASSES

    //cat video
    App.Concept.Distraction1 = App.Concept.Mover.extend({
        init: function(){
            /* XDK_PARAMS
            The properties below control the behaviour of this distraction. Increasing the maxSpeed and maxForce as well as increasing the seek radius will make the distraction more of a threat.
            */
            this.radius = 32 * App.deviceScale();
            this.location = game.scene.gameLayer.getRandomPositionInGameWorld();
            this.velocity = new game.Vector();
            this.acceleration = new game.Vector();
            this.maxSpeed = 120 * App.deviceScale(); 
            this.wanderSpeed = 50 * App.deviceScale();
            this.maxForce = 16 * App.deviceScale();
            this.wanderRadius = 20 * App.deviceScale();
            this.seekRadius = 200 * App.deviceScale();
            this.desiredSeparation = (this.radius * 3) * App.deviceScale();
            this.wallOffset = 50 * App.deviceScale();
            this.fading = false;
            
            var asset = 'concept/level_' + (game.scene.level+1) + '_distraction_cat_01.png';
            this.sprite = new game.Sprite(asset);
            this.sprite.scale.set(0.7 * App.deviceScale(), 0.7 * App.deviceScale());
            this.sprite.anchor.set(0.5, 0.5);
            
            game.scene.gameLayer.container.addChild(this.sprite);
            game.scene.addObject(this);
        },
        
        causeEffect: function(){
            // Trigger a visual effect to distract the player
            game.scene.player.video();
        },
        
        applyBehaviours: function(influenceGroup_){
            // Combine behaviour force inputs
            var wanderInput = this.wander();
            var proximitySeekInput = this.proximitySeek(game.scene.player.location);
            var avoidWallsInput = this.avoidWalls();
            
            //Forces can optionally be weighted to modify their contribution to overall behaviour
            var wanderInfluence = wanderInput.multiply(1);
            var proximitySeekInfluence = proximitySeekInput.multiply(1);
            var avoidWallsInfluence = avoidWallsInput.multiply(1);
            
            this.applyForce(wanderInfluence);
            this.applyForce(proximitySeekInfluence);
            this.applyForce(avoidWallsInfluence);
        },
        
        display: function(){
            if(game.scene.player.unicorning || game.scene.player.reversingTime || game.scene.player.caffeinated || game.scene.player.playingVideo || game.scene.player.sleeping || game.scene.player.eating){
                // Reduce the opacity of the sprite to indicate it can't be picked up when another penalty or power-up is in effect
                this.sprite.alpha = 0.5; 
            }else{
                this.sprite.alpha = 1; 
            }
            this._super();
        },
        
        fade: function(){
            if(!this.fading){
                this.causeEffect();
                this._super();
            }
        } 
    });
    
    // Cat sprite that appears during video penalty
    App.Concept.Cat = game.Class.extend({
        init: function(){
            this.sprite = new game.Sprite('concept/cat.png');
            this.sprite.anchor.set(0, 0);
            this.maxScale = App.randomBetween(0.3,0.6);
            this.location = new game.Vector(App.randomBetween(0,game.system.width-(this.sprite.width*this.maxScale)), App.randomBetween(0,game.system.height-(this.sprite.height*this.maxScale)));
            
            this.leftEyeLocation = new game.Vector(this.location.x + (this.sprite.width * 0.282 * this.maxScale), this.location.y + this.sprite.height * 0.416 * this.maxScale);
            this.leftEyeOffset = this.leftEyeLocation.clone().subtract(App.getScreenCenter());
            this.leftEyeOffset.normalize();
            this.leftEyeOffset.multiply(5000);
            
            this.rightEyeLocation = new game.Vector(this.location.x + (this.sprite.width * 0.678 * this.maxScale), this.location.y + this.sprite.height * 0.416 * this.maxScale);
            this.rightEyeOffset = this.rightEyeLocation.clone().subtract(App.getScreenCenter());
            this.rightEyeOffset.normalize();
            this.rightEyeOffset.multiply(5000);
            
            this.lazerSprite = new game.Container();
            this.leftLazerGraphic = new game.PIXI.Graphics();
            this.rightLazerGraphic = new game.PIXI.Graphics();
            this.lazerSprite.addChild(this.leftLazerGraphic);
            this.lazerSprite.addChild(this.rightLazerGraphic);
            
            this.firing = false;
           
            game.scene.addObject(this);
        },
        
        show: function(){
            game.scene.hud.container.addChild(this.sprite);
            
            this.sprite.scale.set(0,0);
            
            this.spriteTween = new game.Tween(this.sprite.scale);
            this.spriteTween.to({x:this.maxScale, y:this.maxScale}, 200);
            this.spriteTween.easing(game.Tween.Easing.Back.Out);
            this.spriteTween.delay(App.randomBetween(0,1000));
            
            game.scene.player.catTweenGroup.add(this.spriteTween);
            
            this.display();
        },
        
        fireLazers: function(){
            this.firing = true;
            this.lazerCycle = 0;
            game.scene.hud.container.addChild(this.lazerSprite);
        },
        
        hide: function(){
            this.firing = false;
            this.sprite.remove();
            this.lazerSprite.remove();
        },
        
        update: function(){
            if(this.firing){
                //Pew pew pew
                this.lazerCycle += 0.5;
                var lazerWidth = Math.sin(this.lazerCycle) * 15;
                
                switch(game.scene.level){
                    case 0:
                        var lazerTint = game.scene.palette.hue2;
                        break;
                    case 1:
                        var lazerTint = game.scene.palette.hue3;
                        break;
                    case 2:
                        var lazerTint = game.scene.palette.hue2;
                        break;
                }

                this.leftLazerGraphic.clear();
                this.leftLazerGraphic.blendMode = game.blendModes.ADD;
                this.leftLazerGraphic.lineStyle(lazerWidth * App.deviceScale(), lazerTint, 1.0);
                this.leftLazerGraphic.moveTo(this.leftEyeLocation.x, this.leftEyeLocation.y);
                this.leftLazerGraphic.lineTo(this.leftEyeLocation.x + this.leftEyeOffset.x, this.leftEyeLocation.y + this.leftEyeOffset.y);

                this.rightLazerGraphic.clear();
                this.rightLazerGraphic.blendMode = game.blendModes.ADD;
                this.rightLazerGraphic.lineStyle(lazerWidth * App.deviceScale(), lazerTint, 1.0);
                this.rightLazerGraphic.moveTo(this.rightEyeLocation.x, this.rightEyeLocation.y);
                this.rightLazerGraphic.lineTo(this.rightEyeLocation.x + this.rightEyeOffset.x, this.rightEyeLocation.y + this.rightEyeOffset.y);

                this.display();   
            }
        },
        
        display: function(){
            this.sprite.position.set(this.location.x, this.location.y);
        }
    });
    
    //pillow
    App.Concept.Distraction2 = App.Concept.Mover.extend({
        init: function(){
            /* XDK_PARAMS
            The properties below control the behaviour of this distraction. Increasing the maxSpeed and maxForce as well as increasing the seek radius will make the distraction more of a threat.
            */
            this.radius = 32 * App.deviceScale();
            this.location = game.scene.gameLayer.getRandomPositionInGameWorld();
            this.velocity = new game.Vector();
            this.acceleration = new game.Vector();
            this.maxSpeed = 120 * App.deviceScale();
            this.wanderSpeed = 50 * App.deviceScale();
            this.maxForce = 16 * App.deviceScale();
            this.wanderRadius = 20 * App.deviceScale();
            this.seekRadius = 200 * App.deviceScale();
            this.desiredSeparation = (this.radius * 3) * App.deviceScale();
            this.wallOffset = 50 * App.deviceScale();
            this.fading = false;
            
            var asset = 'concept/level_' + (game.scene.level+1) + '_distraction_pillow_01.png';
            this.sprite = new game.Sprite(asset);
            this.sprite.scale.set(0.7 * App.deviceScale(), 0.7 * App.deviceScale());
            this.sprite.anchor.set(0.5, 0.5);
            
            game.scene.gameLayer.container.addChild(this.sprite);            
            game.scene.addObject(this);
        },
        
        causeEffect: function(){
            // Trigger a visual effect to distract the player
            game.scene.player.sleep();
        },
        
        applyBehaviours: function(influenceGroup_){
            var wanderInput = this.wander();
            var proximitySeekInput = this.proximitySeek(game.scene.player.location);
            var avoidWallsInput = this.avoidWalls();
            
            var wanderInfluence = wanderInput.multiply(1);
            var proximitySeekInfluence = proximitySeekInput.multiply(1);
            var avoidWallsInfluence = avoidWallsInput.multiply(1);
            
            this.applyForce(wanderInfluence);
            this.applyForce(proximitySeekInfluence);
            this.applyForce(avoidWallsInfluence);
        },
        
        display: function(){
            if(game.scene.player.unicorning || game.scene.player.reversingTime || game.scene.player.caffeinated || game.scene.player.playingVideo || game.scene.player.sleeping || game.scene.player.eating){
                this.sprite.alpha = 0.5; 
            }else{
                this.sprite.alpha = 1; 
            }
            this._super();
        },
        
        fade: function(){
            if(!this.fading){
                this.causeEffect();
                this._super();
            }
        }                                                                              
    }); 
    
    //noodles
    App.Concept.Distraction3 = App.Concept.Mover.extend({
        init: function(){
            /* XDK_PARAMS
            The properties below control the behaviour of this distraction. Increasing the maxSpeed and maxForce as well as increasing the seek radius will make the distraction more of a threat.
            */
            this.radius = 32 * App.deviceScale();
            this.location = game.scene.gameLayer.getRandomPositionInGameWorld();
            this.velocity = new game.Vector();
            this.acceleration = new game.Vector();
            this.maxSpeed = 120 * App.deviceScale();
            this.wanderSpeed = 50 * App.deviceScale();
            this.maxForce = 16 * App.deviceScale();
            this.wanderRadius = 20 * App.deviceScale();
            this.seekRadius = 200 * App.deviceScale();
            this.desiredSeparation = (this.radius * 3) * App.deviceScale();
            this.wallOffset = 50 * App.deviceScale();
            this.fading = false;
            
            var asset = 'concept/level_' + (game.scene.level+1) + '_distraction_noodles_01.png';
            this.sprite = new game.Sprite(asset);
            this.sprite.scale.set(0.7 * App.deviceScale(), 0.7 * App.deviceScale());
            this.sprite.anchor.set(0.5, 0.5);

            game.scene.gameLayer.container.addChild(this.sprite);            
            game.scene.addObject(this);
        },
        
        causeEffect: function(){
            // This distraction doesn't create a visual effect but applies a gravitational force to the player which makes it harder to navigate
            game.scene.player.eat();
        },
        
        applyBehaviours: function(influenceGroup_){
            var wanderInput = this.wander();
            var proximitySeekInput = this.proximitySeek(game.scene.player.location);
            var avoidWallsInput = this.avoidWalls();
            
            var wanderInfluence = wanderInput.multiply(1);
            var proximitySeekInfluence = proximitySeekInput.multiply(1);
            var avoidWallsInfluence = avoidWallsInput.multiply(1);
            
            this.applyForce(wanderInfluence);
            this.applyForce(proximitySeekInfluence);
            this.applyForce(avoidWallsInfluence);
        },
        
        display: function(){
            if(game.scene.player.unicorning || game.scene.player.reversingTime || game.scene.player.caffeinated || game.scene.player.playingVideo || game.scene.player.sleeping || game.scene.player.eating){
                this.sprite.alpha = 0.5; 
            }else{
                this.sprite.alpha = 1; 
            }
            this._super();
        },
        
        fade: function(){
            if(!this.fading){
                this.causeEffect();
                this._super();
            }
        }  
    }); 
    
    App.Concept.Distraction4 = App.Concept.Mover.extend({
        /* XDK_AMBUSH 
        Try creating an additional distraction based on the behaviours above.
        */
    }); 
    
    // IDEA CLASSES
        
    App.Concept.Spark = App.Concept.Mover.extend({
        init: function(){
            /* XDK_PARAMS
            The properties below control the behaviour of this idea. Increasing the maxSpeed and maxForce as well as increasing the zipRange will make the idea harder to catch.
            */
            this.radius = 32 * App.deviceScale();
            this.location = game.scene.gameLayer.getRandomPositionInGameWorld();
            this.velocity = new game.Vector();
            this.acceleration = new game.Vector();
            this.maxSpeed = 300 * App.deviceScale();
            this.maxForce = 20 * App.deviceScale();
            this.arrivalRadius = 80 * App.deviceScale();
            this.wallOffset = 50 * App.deviceScale();
            this.zipRange = 200 * App.deviceScale();
            this.zipTarget = this.getSafeTarget();
            this.energy = 100/game.scene.evader1Count;
            this.fading = false;
            
            this.sprite = new game.Container();
            this.sprite.scale.set(0.75*App.deviceScale(), 0.75*App.deviceScale());
            
            var asset = 'concept/level_' + (game.scene.level+1) + '_collectable_star_tail_01.png';
            this.tailSprite = new game.Sprite(asset);
            this.tailSprite.anchor.set(0, 0.5);
            this.tailSprite.alpha = 0.6;
            this.tailSprite.scale.set(App.deviceScale(), App.deviceScale());
            this.sprite.addChild(this.tailSprite);
            
            var asset = 'concept/level_' + (game.scene.level+1) + '_collectable_star_01.png';
            this.sparkSprite = new game.Sprite(asset);
            this.sparkSprite.anchor.set(0.5, 0.5);
            this.sparkSprite.alpha = 1;
            this.sprite.addChild(this.sparkSprite);
            
            game.scene.gameLayer.container.addChild(this.sprite);
            game.scene.addObject(this);
        },
        
        zip: function(){
            // Bespoke movement class for this sprite
            if (this.arrived(this.zipTarget) ){
                // If the sprite has arrived at its target select a new target location within the game bounds
                this.zipTarget = this.getSafeTarget();
            }
            return this.seek(this.zipTarget);
        },
        
        getSafeTarget: function(){
            // Tries to locate a target within the sprite's movement range
            var xTarget = App.randomBetween(this.location.x-this.zipRange, this.location.x+this.zipRange);
            var yTarget = App.randomBetween(this.location.y-this.zipRange, this.location.y+this.zipRange);
                
            // Constraing the target to the game bounds to avoid problems with the sprite trying to move outside the game area
            xTarget = App.constrain(xTarget, game.scene.gameLayer.gameLeftEdge+this.radius, game.scene.gameLayer.gameRightEdge-this.radius);
            yTarget = App.constrain(yTarget, game.scene.gameLayer.gameTopEdge+this.radius, game.scene.gameLayer.gameBottomEdge-this.radius);
                
            return new game.Vector(xTarget, yTarget);
        },
        
        applyBehaviours: function(influenceGroup_){
            if(!this.fading){
                if(game.scene.player.unicorning){
                    // If the unicorn bonus is picked up then all ideas will move toward the player location
                    var seekInput = this.seek(game.scene.player.location);
                    var seekInfluence = seekInput.multiply(1);
                    this.applyForce(seekInfluence);
                }else if(game.scene.player.reversingTime){
                    // If the reverseTime bonus is picked up then the sprite will move in reverse
                    var zipInput = this.zip();
                    var avoidWallsInput = this.avoidWalls();
                    
                    var zipInfluence = zipInput.multiply(1);
                    // Note negative multiple for wall avoidance to reverse force direction to counteract time running backwards - serves to keep the sprite on screen
                    var avoidWallsInfluence = avoidWallsInput.multiply(-2);
                    
                    this.applyForce(zipInfluence);
                    this.applyForce(avoidWallsInfluence);
                }else{
                    // Normally no need to avoid walls as target will always be in bounds
                    var zipInput = this.zip();
                    var zipInfluence = zipInput.multiply(1);
                    this.applyForce(zipInfluence);
                }
            }
        },
        
        update: function(){
            this._super();
            if(!this.fading){
                //Stretch the tail sprite to indicate direction and magnitude of movement
                this.tailLength = this.velocity.length();
                this.angle = App.heading(this.velocity)+Math.PI;
            }
        },
        
        display: function(){
            if(!this.fading){
                this.tailSprite.width = this.tailLength;
                this.sprite.rotation = this.angle;
            }
            this._super();
        },
        
        fade: function(){
            if(!this.fading){
                this.fading = true;
                game.scene.energyBar1.addEnergy(this.energy);
                
                this.tailSprite.width = 0;
                
                this.tweenGroup = new game.TweenGroup();
                this.tweenGroup.onComplete = this.kill.bind(this);

                this.sparkSpriteTween = new game.Tween(this.sparkSprite.scale);
                this.sparkSpriteTween.to({x:0, y:0}, 300);
                this.sparkSpriteTween.easing(game.Tween.Easing.Back.In);
                this.tweenGroup.add(this.sparkSpriteTween);

                App.playSound("spark", false, 1);
                
                this.tweenGroup.start();
            }
        },
        
        kill: function(){
            game.scene.player.resetGulp();
            this.sprite.remove();
            var i = game.scene.evaders1.length;
            while (i--){
                if(game.scene.evaders1[i] == this){
                    game.scene.evaders1.splice(i,1);
                }
            }
            game.scene.removeObject(this);
        }
    });
        
    App.Concept.Nucleus = App.Concept.Mover.extend({
        init: function(){
            /* XDK_PARAMS
            The properties below control the behaviour of this idea. Increasing the maxSpeed, the maxForce, the wanderSpeed or the fearRadius will make the idea harder to catch.
            */
            this.radius = 32 * App.deviceScale();
            this.location = game.scene.gameLayer.getRandomPositionInGameWorld();
            this.velocity = new game.Vector();
            this.acceleration = new game.Vector();
            this.maxSpeed = 300 * App.deviceScale();
            this.wanderSpeed = 130 * App.deviceScale();
            this.maxForce = 100 * App.deviceScale();
            this.wanderRadius = 2 * App.deviceScale();
            this.fearRadius = 160 * App.deviceScale();
            this.desiredSeparation = this.radius * 1.1 * App.deviceScale();
            this.wallOffset = 50 * App.deviceScale();
            this.energy = 100/game.scene.evader2Count;
            this.fading = false;
            
            var asset = 'concept/level_' + (game.scene.level+1) + '_collectable_atom_01.png';
            this.sprite = new game.Sprite(asset);
            this.sprite.scale.set(App.deviceScale(), App.deviceScale());
            this.sprite.anchor.set(0.5, 0.5);
            
            game.scene.gameLayer.container.addChild(this.sprite);
            game.scene.addObject(this);
        },
        
        chain: function(influenceGroup_){
            if(influenceGroup_[0] == this){
                return this.wander();
            }else{
                for(var i=1; i<influenceGroup_.length; i++){
                    if(influenceGroup_[i] == this){
                        var target = influenceGroup_[i-1].location;
                        return this.seek(target);       
                    }
                }
            }
        },
        
        applyBehaviours: function(influenceGroup_){
            if(!this.fading){
                if(game.scene.player.unicorning){
                    var seekInput = this.seek(game.scene.player.location);
                    var seekInfluence = seekInput.multiply(1);
                    this.applyForce(seekInfluence);   
                }else if(game.scene.player.reversingTime){
                    var chainInput = this.chain(influenceGroup_);
                    var separationInput = this.separate(influenceGroup_);
                    var avoidWallsInput = this.avoidWalls();
                    
                    var chainInfluence = chainInput.multiply(1);
                    var separationInfluence = separationInput.multiply(1);
                    var avoidWallsInfluence = avoidWallsInput.multiply(-2);
                    
                    this.applyForce(chainInfluence);
                    this.applyForce(separationInfluence);   
                    this.applyForce(avoidWallsInfluence);
                }else{
                    var chainInput = this.chain(influenceGroup_);
                    var separationInput = this.separate(influenceGroup_);

                    var chainInfluence = chainInput.multiply(1);
                    var separationInfluence = separationInput.multiply(1);

                    this.applyForce(chainInfluence);
                    this.applyForce(separationInfluence);

                    if(influenceGroup_[0] == this){
                        var avoidWallsInput = this.avoidWalls();
                        var avoidWallsInfluence = avoidWallsInput.multiply(1);
                        this.applyForce(avoidWallsInfluence);
                    }
                    
                    var evasionInput = this.evade(game.scene.player.location);
                    var evasionInfluence = evasionInput.multiply(1);
                    this.applyForce(evasionInfluence);
                }
            }
        },
        
        fade: function(){
            if(!this.fading){
                this.fading = true;
                game.scene.energyBar2.addEnergy(this.energy);
            
                this.tweenGroup = new game.TweenGroup();
                this.tweenGroup.onComplete = this.kill.bind(this);
                
                this.nucleusTween = new game.Tween(this.sprite.scale);
                this.nucleusTween.to({x:0, y:0}, 300);
                this.nucleusTween.easing(game.Tween.Easing.Back.In);
                this.tweenGroup.add(this.nucleusTween);

                App.playSound("nucleus", false, 0.7);
            
                this.tweenGroup.start();
            }
        },
        
        kill: function(){
            game.scene.player.resetGulp();
            this.sprite.remove();
            var i = game.scene.evaders2.length;
            while (i--){
                if(game.scene.evaders2[i] == this){
                    game.scene.evaders2.splice(i,1);
                }
            }
            game.scene.removeObject(this);
        }
    });
        
    App.Concept.Cog = App.Concept.Mover.extend({
        init: function(){
            /* XDK_PARAMS
            The properties below control the behaviour of this idea. Increasing the maxSpeed and maxForce as well as increasing the fearRadius will make the idea harder to catch.
            */
            this.radius = 64 * App.deviceScale();
            this.location = game.scene.gameLayer.getRandomPositionInGameWorld();
            this.velocity = new game.Vector();
            this.acceleration = new game.Vector();
            this.maxSpeed = 170 * App.deviceScale();
            this.wanderSpeed = 50 * App.deviceScale();
            this.maxForce = 64 * App.deviceScale();
            this.wanderRadius = 20 * App.deviceScale();
            this.fearRadius = this.radius * 4 * App.deviceScale();
            this.clusterRadius = this.radius * 4 * App.deviceScale();
            this.desiredSeparation = this.radius * App.deviceScale();
            this.wallOffset = 50 * App.deviceScale();
            this.angle = 0;
            this.energy = 100/game.scene.evader3Count;
            this.fading = false;
                    
            var asset = 'concept/level_' + (game.scene.level+1) + '_collectable_cog_01.png';
            this.sprite = new game.Sprite(asset);
            this.sprite.scale.set(1.5*App.deviceScale(), 1.5*App.deviceScale());
            this.sprite.anchor.set(0.5, 0.5);
            
            game.scene.gameLayer.container.addChild(this.sprite);
            game.scene.addObject(this);
        },
        
        applyBehaviours: function(influenceGroup_){
            if(!this.fading){
                if(game.scene.player.unicorning){
                    var seekInput = this.seek(game.scene.player.location);
                    var seekInfluence = seekInput.multiply(1);
                    this.applyForce(seekInfluence);
                }else{
                    var separationInput = this.separate(influenceGroup_);
                    var clusterInput = this.cluster(influenceGroup_);
                    var avoidWallsInput = this.avoidWalls();
                    var wanderInput = this.wander();
                    var evasionInput = this.evade(game.scene.player.location);
                    
                    var separationInfluence = separationInput.multiply(1);
                    var clusterInfluence = clusterInput.multiply(0.3);
                    var wanderInfluence = wanderInput.multiply(0.1);
                    var evasionInfluence = evasionInput.multiply(1);
                    
                    if(game.scene.player.reversingTime){
                        var avoidWallsInfluence = avoidWallsInput.multiply(-2);
                    }else{
                        var avoidWallsInfluence = avoidWallsInput.multiply(2);
                    }
                    
                    this.applyForce(separationInfluence);
                    this.applyForce(clusterInfluence);
                    this.applyForce(avoidWallsInfluence);
                    this.applyForce(wanderInfluence);
                    this.applyForce(evasionInfluence);
                }
            }
        },
        
        update: function(){
            this.angle += 0.01;
            this._super();
        },
        
        display: function(){
            this.sprite.rotation = this.angle;
            this._super();
        },
        
        fade: function(){
            if(!this.fading){
                this.fading = true;
                game.scene.energyBar3.addEnergy(this.energy);
                
                this.tweenGroup = new game.TweenGroup();
                this.tweenGroup.onComplete = this.kill.bind(this);
                
                this.cogTween = new game.Tween(this.sprite.scale);
                this.cogTween.to({x:0, y:0}, 300);
                this.cogTween.easing(game.Tween.Easing.Back.In);
                this.tweenGroup.add(this.cogTween);

                App.playSound("cog", false, 1);
            
                this.tweenGroup.start();
            }
        },
        
        kill: function(){
            game.scene.player.resetGulp();
            this.sprite.remove();
            var i = game.scene.evaders3.length;
            while (i--){
                if(game.scene.evaders3[i] == this){
                    game.scene.evaders3.splice(i,1);
                }
            }
            game.scene.removeObject(this);
        }
    });
    
    // POWERUP CLASSES
    
    App.Concept.PowerUp1 = App.Concept.Mover.extend({//unicorn
        init: function(){
            this.radius = 32 * App.deviceScale();
            this.location = game.scene.gameLayer.getRandomPositionInGameWorld();
            this.velocity = new game.Vector();
            this.acceleration = new game.Vector();
            this.maxSpeed = 120 * App.deviceScale();
            this.wanderSpeed = 100 * App.deviceScale();
            this.maxForce = 16 * App.deviceScale();
            this.wanderRadius = 20 * App.deviceScale();
            this.seekRadius = 200 * App.deviceScale();
            this.desiredSeparation = (this.radius * 3) * App.deviceScale();
            this.wallOffset = 50 * App.deviceScale();
            this.fading = false;
            
            var asset = 'concept/level_' + (game.scene.level+1) + '_powerup_unicorn_01.png';
            this.sprite = new game.Sprite(asset);
            this.sprite.scale.set(0.6 * App.deviceScale(), 0.6 * App.deviceScale());
            this.sprite.anchor.set(0.5, 0.5);

            game.scene.gameLayer.container.addChild(this.sprite);
            game.scene.addObject(this);
        },
        
        causeEffect: function(){
            game.scene.player.unicorn();
        },
        
        applyBehaviours: function(influenceGroup_){        
            var wanderInput = this.wander();
            var avoidWallsInput = this.avoidWalls();
            
            var wanderInfluence = wanderInput.multiply(1);
            var avoidWallsInfluence = avoidWallsInput.multiply(1);
            
            this.applyForce(wanderInfluence);
            this.applyForce(avoidWallsInfluence);
        },
        
        display: function(){
            if(game.scene.player.unicorning || game.scene.player.reversingTime || game.scene.player.caffeinated || game.scene.player.playingVideo || game.scene.player.sleeping || game.scene.player.eating){
                this.sprite.alpha = 0.5; 
            }else{
                this.sprite.alpha = 1; 
            }
            this._super();
        },
        
        fade: function(){
            if(!this.fading){
                this.causeEffect();
                this._super();
            }
        }
    });
    
    App.Concept.PowerUp2 = App.Concept.Mover.extend({//clock
        init: function(){
            this.radius = 32 * App.deviceScale();
            this.location = game.scene.gameLayer.getRandomPositionInGameWorld();
            this.velocity = new game.Vector();
            this.acceleration = new game.Vector();
            this.maxSpeed = 120 * App.deviceScale();
            this.wanderSpeed = 100 * App.deviceScale();
            this.maxForce = 16 * App.deviceScale();
            this.wanderRadius = 20 * App.deviceScale();
            this.seekRadius = 200 * App.deviceScale();
            this.desiredSeparation = (this.radius * 3) * App.deviceScale();
            this.wallOffset = 50 * App.deviceScale();
            this.fading = false;
            
            var asset = 'concept/level_' + (game.scene.level+1) + '_powerup_clock_01.png';
            this.sprite = new game.Sprite(asset);
            this.sprite.scale.set(0.6 * App.deviceScale(), 0.6 * App.deviceScale());
            this.sprite.anchor.set(0.5, 0.5);
            
            game.scene.gameLayer.container.addChild(this.sprite);
            game.scene.addObject(this);
        },
        
        causeEffect: function(){
            game.scene.player.reverseTime();
        },
        
        applyBehaviours: function(influenceGroup_){        
            var wanderInput = this.wander();
            var avoidWallsInput = this.avoidWalls();
            
            var wanderInfluence = wanderInput.multiply(1);
            var avoidWallsInfluence = avoidWallsInput.multiply(1);
            
            this.applyForce(wanderInfluence);
            this.applyForce(avoidWallsInfluence);
        },
        
        display: function(){
            if(game.scene.player.unicorning || game.scene.player.reversingTime || game.scene.player.caffeinated || game.scene.player.playingVideo || game.scene.player.sleeping || game.scene.player.eating){
                this.sprite.alpha = 0.5; 
            }else{
                this.sprite.alpha = 1; 
            }
            this._super();
        },
        
        fade: function(){
            if(!this.fading){
                this.causeEffect();
                this._super();
            }
        }
    });
    
    App.Concept.PowerUp3 = App.Concept.Mover.extend({//coffee
        init: function(){
            this.radius = 32 * App.deviceScale();
            this.location = game.scene.gameLayer.getRandomPositionInGameWorld();
            this.velocity = new game.Vector();
            this.acceleration = new game.Vector();
            this.maxSpeed = 120 * App.deviceScale();
            this.wanderSpeed = 100 * App.deviceScale();
            this.maxForce = 16 * App.deviceScale();
            this.wanderRadius = 20 * App.deviceScale();
            this.seekRadius = 200 * App.deviceScale();
            this.desiredSeparation = (this.radius * 3) * App.deviceScale();
            this.wallOffset = 50 * App.deviceScale();
            this.fading = false;
            
            var asset = 'concept/level_' + (game.scene.level+1) + '_powerup_coffee_01.png';
            this.sprite = new game.Sprite(asset);
            this.sprite.scale.set(0.6 * App.deviceScale(), 0.6 * App.deviceScale());
            this.sprite.anchor.set(0.5, 0.5);
            
            game.scene.gameLayer.container.addChild(this.sprite);
            game.scene.addObject(this);
        },
        
        causeEffect: function(){
            game.scene.player.caffeine();
        },
        
        applyBehaviours: function(influenceGroup_){        
            var wanderInput = this.wander();
            var avoidWallsInput = this.avoidWalls();
            
            var wanderInfluence = wanderInput.multiply(1);
            var avoidWallsInfluence = avoidWallsInput.multiply(1);
            
            this.applyForce(wanderInfluence);
            this.applyForce(avoidWallsInfluence);
        },
        
        display: function(){
            if(game.scene.player.unicorning || game.scene.player.reversingTime || game.scene.player.caffeinated || game.scene.player.playingVideo || game.scene.player.sleeping || game.scene.player.eating){
                this.sprite.alpha = 0.5; 
            }else{
                this.sprite.alpha = 1; 
            }
            this._super();
        },
        
        fade: function(){
            if(!this.fading){
                this.causeEffect();
                this._super();
            }
        }
    });
    
    // PLAYER CLASS
        
    App.Concept.Player = App.Concept.Mover.extend({
        init: function(){
            // Properties below control player character behaviour. He can be made more or less responsive by adjusting the maxSpeed and maxForce properties. 
            
            this.radius = 32 * App.deviceScale();
            this.location = new game.Vector(game.system.width/2, game.system.height/2);
            this.velocity = new game.Vector();
            this.acceleration = new game.Vector();
            this.maxSpeed = 500 * App.deviceScale();
            this.maxForce = 35 * App.deviceScale();
            this.wallOffset = 50 * App.deviceScale();
            this.gulpState = 0;
            this.invulnerableTimer = new game.Timer();
            
            this.velocityAngleArray = [];
            
            switch(game.scene.level){
                case 0:
                    var glowTint = game.scene.palette.hue2;
                    break;
                case 1:
                    var glowTint = game.scene.palette.hue2;
                    break;
                case 2:
                    var glowTint = game.scene.palette.hue2;
                    break;
            }
            
            this.emitter = new game.Emitter({
                count: 3,
                endScale: 0,
                life: 1,
                rate: 0.1,
                speed: 50 * App.deviceScale(),
                startAlpha: 0.6,
                startScale: 0.6  * App.deviceScale(),
                spriteSettings: {
                    tint: glowTint
                }
            });
            
            this.emitter.textures.push('concept/particle.png');
            this.emitter.container = game.scene.gameLayer.container;
            game.scene.emitters.push(this.emitter);
            
            this.sprite = new game.Container();    
            this.sprite.scale.set(App.deviceScale(), App.deviceScale());
            
            this.outerGlow = new game.Sprite('concept/glow_01.png');
            this.outerGlow.anchor.set(0.5, 0.5);
            this.outerGlow.alpha = 0.4;
            this.outerGlow.tint = glowTint;
            this.sprite.addChild(this.outerGlow);
            
            this.innerGlow = new game.Sprite('concept/glow_01.png');
            this.innerGlow.anchor.set(0.5, 0.5);
            this.innerGlow.scale.set(0.87, 0.87);
            this.innerGlow.alpha = 0.4;
            this.innerGlow.tint = glowTint;
            this.sprite.addChild(this.innerGlow);
            
            this.arms = new game.Sprite('concept/character_arms.png');
            this.arms.anchor.set(0.5, 0.5);
            this.sprite.addChild(this.arms);
            
            this.legs = new game.Sprite('concept/character_legs.png');
            this.legs.anchor.set(0.5, 0.5);
            this.sprite.addChild(this.legs);
            
            this.body = new game.Sprite('concept/character_body.png');
            this.body.anchor.set(0.5, 0.5);
            this.sprite.addChild(this.body);
            
            this.face = new game.Animation([
                game.Texture.fromImage('concept/character_face_01_default.png'),
                game.Texture.fromImage('concept/character_face_02_smile.png'),
                game.Texture.fromImage('concept/character_face_03_wired.png'),
                game.Texture.fromImage('concept/character_face_04_content.png'),
                game.Texture.fromImage('concept/character_face_05_hypnotised.png'),
                game.Texture.fromImage('concept/character_face_06_squint.png'),
                game.Texture.fromImage('concept/character_face_07_asleep.png')
            ]);
            this.face.anchor.set(0.5, 0.5);
            this.face.tint = game.scene.palette.dark;
            this.face.animationSpeed = 0;
            this.sprite.addChild(this.face);
            
            game.scene.playerLayer.container.addChild(this.sprite);
            game.scene.addObject(this);
        },
        
        setLegAngle: function(){
            // Store an array of recent velocities and refer to the first entry for the leg angle - creates a more interesting lag to the leg movement
            if (this.velocity.length() > 0.3 * App.deviceScale() ){
                // Slightly hacky way to avoid the legs erroneously flipping to the other side as speed approaches 0 
                var headingAngle = App.heading(this.velocity)+(Math.PI*0.5);
                this.velocityAngleArray.push(headingAngle);
            }else{
                var lastAngle = this.velocityAngleArray[this.velocityAngleArray.length-1];
                this.velocityAngleArray.push(lastAngle);
            }
            
            if(this.velocityAngleArray.length > 5){
                this.velocityAngleArray.shift();
            }
        },
        
        steer: function(steeringVector_){
            var desired = steeringVector_.clone();
            desired.subtract(this.velocity);
            if(desired.length() > this.maxForce){
                desired.normalize();
                desired.multiply(this.maxForce);
            }
            return desired;
        },
        
        gravity: function(){
            // Only implemented when the noodles penalty is in effect
            return new game.Vector(0, 30);
        },
        
        gulp: function(){
            // Small animation to player character when ever he 'swallows' an item
            if(this.gulpState===0){
                this.gulpState = 1;
                this.gulpTween = new game.Tween(this.body.scale);

                this.gulpTween.to({x:1.2, y:1.2}, 100);
                this.gulpTween.easing(game.Tween.Easing.Quadratic.Out);
                this.gulpTween.onComplete(this.gulpComplete.bind(this));
                this.gulpTween.repeat(1).yoyo().start();
            }
        },
        
        gulpComplete: function(){
            this.gulpState = 2;
        },
        
        resetGulp: function(){
            if(this.gulpState == 2){
                this.gulpState = 0;
            }
        },
        
        acquire: function(){
            // Check for collisions with idea sprites and cause them to disappear if they occur
            var i = game.scene.evaders1.length;
            while (i--){
                var evader = game.scene.evaders1[i];
                var d = this.location.distance(evader.location);
                if (d < this.radius + evader.radius){
                    this.gulp();
                    evader.fade();
                }
            }
                
            var i = game.scene.evaders2.length;
            while (i--){
                var evader = game.scene.evaders2[i];
                var d = this.location.distance(evader.location);
                if (d < this.radius + evader.radius){
                    this.gulp();
                    evader.fade();
                }
            }
                
            var i = game.scene.evaders3.length;
            while (i--){
                var evader = game.scene.evaders3[i];
                var d = this.location.distance(evader.location);
                if (d < this.radius + evader.radius){
                    this.gulp();
                    evader.fade();
                }
            }   
        },
        
        distract: function(){
            // Check to see whether powerups or distractions are in effect
            // For performance reasons we disabled stacking of distractions and powerups but you can create interesting combos by disabling this
            if(!this.unicorning && !this.reversingTime && !this.caffeinated && !this.playingVideo && !this.sleeping && !this.eating){
                
                // Check for collisions with distractions
                var i = game.scene.seekers1.length;
                while (i--){
                    var seeker = game.scene.seekers1[i];
                    var d = this.location.distance(seeker.location);
                    if (d < this.radius + seeker.radius){
                        this.gulp();
                        seeker.fade();
                    }
                }

                var i = game.scene.seekers2.length;
                while (i--){
                    var seeker = game.scene.seekers2[i];
                    var d = this.location.distance(seeker.location);
                    if (d < this.radius + seeker.radius){
                        this.gulp();
                        seeker.fade();
                    }
                }

                var i = game.scene.seekers3.length;
                while (i--){
                    var seeker = game.scene.seekers3[i];
                    var d = this.location.distance(seeker.location);
                    if (d < this.radius + seeker.radius){
                        this.gulp();
                        seeker.fade();
                    }
                }
            }
        },
        
        powerUp: function(){
            // Check to see whether powerups or distractions are in effect
            // For performance reasons we disabled stacking of distractions and powerups but you can create interesting combos by disabling this
            if(!this.unicorning && !this.reversingTime && !this.caffeinated && !this.playingVideo && !this.sleeping && !this.eating){
                
                // Check for collisions with powerups
                var i = game.scene.powerUps1.length;
                while (i--){
                    var powerUp = game.scene.powerUps1[i];
                    var d = this.location.distance(powerUp.location);
                    if (d < this.radius + powerUp.radius){
                        this.gulp();
                        powerUp.fade();
                    }
                }

                var i = game.scene.powerUps2.length;
                while (i--){
                    var powerUp = game.scene.powerUps2[i];
                    var d = this.location.distance(powerUp.location);
                    if (d < this.radius + powerUp.radius){
                        this.gulp();
                        powerUp.fade();
                    }
                }

                var i = game.scene.powerUps3.length;
                while (i--){
                    var powerUp = game.scene.powerUps3[i];
                    var d = this.location.distance(powerUp.location);
                    if (d < this.radius + powerUp.radius){
                        this.gulp();
                        powerUp.fade();
                    }
                }
            }
        },
        
        unicorn: function(){
            // Initiation of Unicorn effect, see colour cycle class at bottom for screen effect
            this.face.gotoAndStop(1);
            
            game.scene.colorCycle.show();

            App.playSound("unicorn", false, 0.8);
            
            this.unicornTimer = new game.Timer();
            this.unicorning = true;
        },
        
        endUnicorn: function(){
            game.scene.colorCycle.hide();
            this.unicornTimer = null;
            this.unicorning = false;
            this.face.gotoAndStop(0);
            game.scene.gameLayer.filters = undefined;
        },
        
        reverseTime: function(){
            // Initiation of reverse time effect, negative deltaMultiplier effectively runs the simulation in reverse
            this.face.gotoAndStop(3);
            
            game.scene.deltaMultiplier = -2;
            game.scene.timeReverse.show();
            
            var level = game.storage.get("CurrentLevel");
            var levelString = (1 + level);
            App.playMusic("reverse"+levelString, 1);
            
            this.reverseTimer = new game.Timer();
            this.reversingTime = true;
        },
        
        endReverseTime: function(){
            game.scene.timeReverse.hide();
            game.scene.deltaMultiplier = 1;
            
            var level = game.storage.get("CurrentLevel");
            var levelString = (1 + level);
            App.playMusic("music"+levelString, 1);
            
            this.reverseTimer = null;
            this.reversingTime = false;
            this.face.gotoAndStop(0);
        },
        
        caffeine: function(){
            // Initiation of caffeine effect, simply speeds player up and makes him more responsive
            this.face.gotoAndStop(2);
            this.maxSpeed = 700 * App.deviceScale();
            this.maxForce = 50 * App.deviceScale();
            
            this.emitter.count = 5;
            this.emitter.life = 2;
            this.emitter.rate = 0.05;
            this.emitter.speed = 80 * App.deviceScale();
            
            this.caffeineCycle = 0;

            App.playSound("coffee", false, 0.8);
            
            this.caffeinated = true;
            this.caffeineTimer = new game.Timer();
        },
        
        endCaffeine: function(){
            this.caffeineTimer = null;
            this.caffeinated = false;
            
            this.face.gotoAndStop(0);
            
            this.outerGlow.scale.set(1, 1);
            this.innerGlow.scale.set(0.87, 0.87);  
            
            this.emitter.count = 3;
            this.emitter.life = 1;
            this.emitter.rate = 0.1;
            this.emitter.speed = 50 * App.deviceScale();
            
            this.maxSpeed = 500 * App.deviceScale();
            this.maxForce = 35 * App.deviceScale();
        },
        
        video: function(){
            // Initiation of cat firing lazers 'video', noise shader implementation is in the main.js file near the bottom, cat and lazer sprites above in this file near their associated distraction class
            this.face.gotoAndStop(4);
            
            game.scene.gameLayer.container.filters = [game.scene.noiseFilter];
            
            game.scene.noiseFilter.noiseLevel = 0;
            game.scene.noiseFilter.seed = 0;
            
            this.videoGroup = new game.TweenGroup();
            this.videoGroup.onComplete = this.showCat.bind(this);
            
            this.noiseTween = new game.Tween(game.scene.noiseFilter);
            this.noiseTween.to({noiseLevel:1}, 1000);
            this.videoGroup.add(this.noiseTween);
            
            this.videoGroup.start();
            
            App.playSound("cat", false, 1);
            
            this.playingVideo = true;
        },
        
        showCat: function(){
            this.showingCat = true;
            this.catTimer = new game.Timer();
            
            this.catTweenGroup = new game.TweenGroup();
            this.catTweenGroup.onComplete = this.fireLazers.bind(this);
            
            for(var i=0; i<game.scene.cats.length; i++){
                game.scene.cats[i].show();
            }
            
            this.catTweenGroup.start();
        },
        
        fireLazers: function(){
            if(this.showingCat){
                for(var i=0; i<game.scene.cats.length; i++){
                    game.scene.cats[i].fireLazers();
                }
            }
        },
        
        endVideo: function(){
            this.catTimer = null;
            this.showingCat = false;
            this.playingVideo = false;
            
            for(var i=0; i<game.scene.cats.length; i++){
                game.scene.cats[i].hide();
            }
            
            this.face.gotoAndStop(0);
            game.scene.gameLayer.container.filters = undefined;
        },
        
        sleep: function(){
            // Initiation of sleep effect. Combines two shaders (blur and greyscale) to create the effect but note frame rate check to only run both on high-spec devices
            
            this.face.gotoAndStop(6);
            
            game.scene.grayFilter.gray = 0;
            game.scene.blurFilter.blur = 0;
            
            this.sleepGroup = new game.TweenGroup();
            this.sleepGroup.onComplete = this.endSleep.bind(this);
            
            if (App.getFrameRate() > 45){
                game.scene.gameLayer.container.filters = [game.scene.grayFilter, game.scene.blurFilter];
                game.scene.playerLayer.container.filters = [game.scene.grayFilter, game.scene.blurFilter];
                
                this.blurTween = new game.Tween(game.scene.blurFilter);
                this.blurTween.to({blur:32}, 3000);
                this.blurTween.easing(game.Tween.Easing.Bounce.In);
                this.blurTween.repeat(1).yoyo();
                this.sleepGroup.add(this.blurTween);
            }else{
                game.scene.gameLayer.container.filters = [game.scene.grayFilter];
                game.scene.playerLayer.container.filters = [game.scene.grayFilter];
            }
            
            this.grayTween = new game.Tween(game.scene.grayFilter);
            this.grayTween.to({gray:1}, 3000);
            this.grayTween.easing(game.Tween.Easing.Bounce.In);
            this.grayTween.repeat(1).yoyo();
            this.sleepGroup.add(this.grayTween);
            
            this.sleepGroup.start();

            App.playSound("sleep", false, 0.5);
            
            this.sleeping = true;
        },
        
        endSleep: function(){
            this.face.gotoAndStop(0);
            game.scene.gameLayer.container.filters = undefined;
            game.scene.playerLayer.container.filters = undefined;
            game.scene.hud.container.filters = undefined;
            this.sleeping = false;
        },
        
        eat: function(){
            // Initiation of noodles effect, simply adds a gravitational force to the player which causes him to sink toward the bottom of the screen
            this.face.gotoAndStop(5);
            
            App.playSound("noodle", false, 0.8);
            
            this.eatTimer = new game.Timer();
            this.eating = true;
        },
        
        endEat: function(){
            this.eatTimer = null;
            this.eating = false;
            this.face.gotoAndStop(0);
        },
        
        applyBehaviours: function(){
            var steeringInput = this.steer(game.scene.inputControl.velocityVector);  
            var avoidWallsInput = this.avoidWalls();
            
            var steeringInfluence = steeringInput.multiply(1);
            var avoidWallsInfluence = avoidWallsInput.multiply(2);
            
            this.applyForce(steeringInfluence);
            this.applyForce(avoidWallsInfluence);
            
            if (this.eating){
                var gravityInput = this.gravity();
                var gravityInfluence = gravityInput.multiply(1);
                this.applyForce(gravityInfluence);
            }
            
            if (this.invulnerableTimer.time() > 3000){
                // Player is briefly invulnerable at the start of the game. Allows player to manouevre away from any distractions randomly placed underneath him at the start. Also allows frame rate to stabilise following object initiation
                this.acquire();
                this.distract();
                this.powerUp();
            }
        },
            
        update: function(){
            // Same partial Euler integration as main mover class above. See notes there for improvement ideas
            
            this.velocity.add(this.acceleration);
            this.velocity.limit(this.maxSpeed);
            var changeInLocation = this.velocity.clone();
            changeInLocation.multiply(game.system.delta);//ignore scene.deltaMultiplier
            this.location.add(changeInLocation);
            this.acceleration.multiply(0);
            
            this.setLegAngle();
            
            if (this.unicorning){
                if(this.unicornTimer.time() > 4000){
                    this.endUnicorn();
                }
            }
            
            if (this.reversingTime){
                if(this.reverseTimer.time() > 3000){
                    this.endReverseTime();
                }
            }
            
            if (this.caffeinated){
                if(this.caffeineTimer.time() > 5000){
                    this.endCaffeine();
                }else{
                    // Make the outer glows vibrate slightly
                    this.caffeineCycle += 1;
                    var outerVibration = 0.04 * Math.sin(this.caffeineCycle); 
                    var innerVibration = 0.04 * Math.cos(this.caffeineCycle); 
                    this.outerGlow.scale.set(1+outerVibration, 1+outerVibration);
                    this.innerGlow.scale.set(0.87+innerVibration, 0.87+innerVibration);   
                }
            }
            
            if (this.showingCat){
                if(this.catTimer.time() > 2000){
                    this.endVideo();
                }
            }
            
            if (this.eating){
                if(this.eatTimer.time() > 5000){
                    this.endEat();
                }
            }
            
            this.display();
        },
        
        display: function(){
            if (this.invulnerableTimer.time() < 3000){ 
                //Make the player opacity flicker during invulnerability
                this.sprite.alpha = 0.3 + 0.4 * Math.abs(Math.sin(this.invulnerableTimer.time()/40));
            }else{
                this.sprite.alpha = 1;
            }
            
            this.arms.rotation = game.scene.inputControl.getAngle();
            this.legs.rotation = this.velocityAngleArray[0];

            this.sprite.position.set(this.location.x, this.location.y);
            this.emitter.position.set(this.location.x, this.location.y);
        }
    });
    
    // CAMERA CLASSES
    
    App.Concept.Camera = game.Class.extend({
        init: function(){
            this.camera = new game.Camera();
            this.camera.target = game.scene.player.sprite;
            var tScreenCenter = App.getScreenCenter();
            this.camera.minX = game.scene.gameLayer.gameWidth * -0.25;
            this.camera.maxX = game.scene.gameLayer.gameWidth * 0.25;
            this.camera.minY = game.scene.gameLayer.gameHeight * -0.25;
            this.camera.maxY = game.scene.gameLayer.gameHeight * 0.25;
        }
    });
    
    App.Concept.GameCamera = App.Concept.Camera.extend({
        init: function(){
            // Main camera moving the gameLayer container
            this._super();
            this.camera.container = game.scene.gameLayer.container;
            game.scene.addObject(this);
        }
    });
    
    App.Concept.PlayerCamera = App.Concept.Camera.extend({
        init: function(){
            // Player camera tracking the player's movements
            this._super();
            this.camera.container = game.scene.playerLayer.container;
            game.scene.addObject(this);
        }
    });
    
    // HUD CLASSES
    
    App.Concept.HUD = game.Class.extend({
        init: function(){
            // Container housing all HUD elements
            this.container = new game.Container();
            game.scene.stage.addChild(this.container);
            game.scene.addObject(this);
        }
    });
    
    App.Concept.InputControl = game.Class.extend({
        init: function(){
            /* XDK_SHAKE 
            The inputControl class takes touch or mouse based input and converts them to a velocity vector for the player. Can the accelerometer be used to provide a velocity vector instead?
            */
            
            this.steering = false;
            this.origin = new game.Vector();
            this.steeringVector = new game.Vector();
            this.steeringMagnitude = 0;
            this.maxSteeringMagnitude = 128 * App.deviceScale();
            this.velocityVector = new game.Vector();
            this.angle = 0;
            this.guide = new game.PIXI.Graphics();
            game.scene.hud.container.addChild(this.guide);
            game.scene.addObject(this);
        },
        
        getAngle: function(){
            return App.heading(this.steeringVector)+(Math.PI*0.5);
        },
            
        update: function(){
            if(this.steering){
                var mousePosClone = game.scene.mousePos.clone();
                this.steeringVector = mousePosClone.subtract(this.origin);
                this.steeringMagnitude = Math.min(this.steeringVector.length(), this.maxSteeringMagnitude);
                this.steeringVector.normalize();
                this.steeringVector.multiply(this.steeringMagnitude);
                var velocityMagnitude = App.mapToRange(this.steeringMagnitude, 0, this.maxSteeringMagnitude, 0, game.scene.player.maxSpeed);
                this.velocityVector = this.steeringVector.clone();
                this.velocityVector.normalize();
                this.velocityVector.multiply(velocityMagnitude);
                this.angle = App.heading(this.velocityVector);
                
                this.display();
            }else{
                this.velocityVector.multiply(0);
                this.hide();
            }
        },
        
        display: function(){
            this.guide.clear();
            
            this.guide.lineStyle(4 * App.deviceScale(), game.scene.palette.bright, 1.0);
            this.guide.beginFill(game.scene.palette.bright, 0.1);
            this.guide.drawCircle(0, 0, this.steeringMagnitude);
            this.guide.endFill();
            
            this.guide.lineStyle(0, game.scene.palette.bright, 1.0);
            this.guide.beginFill(game.scene.palette.bright, 1.0);
            this.guide.drawCircle(0, 0, 16 * (this.steeringMagnitude/this.maxSteeringMagnitude));
            this.guide.endFill();
            
            this.guide.lineStyle(8 * App.deviceScale(), game.scene.palette.bright, 1.0);
            this.guide.moveTo(0, 0);
            this.guide.lineTo(this.steeringMagnitude, 0);
            
            this.guide.lineStyle(0, game.scene.palette.bright, 1.0);
            this.guide.beginFill(game.scene.palette.bright, 1.0);
            this.guide.moveTo(this.steeringMagnitude*1.13, 0);
            this.guide.lineTo(this.steeringMagnitude, -this.steeringMagnitude*0.13);
            this.guide.lineTo(this.steeringMagnitude, this.steeringMagnitude*0.13);
            this.guide.lineTo(this.steeringMagnitude*1.13, 0);
            this.guide.endFill();
            
            this.guide.rotation = (this.angle);
            this.guide.position.set(this.origin.x, this.origin.y);
        },
        
        hide: function(){
            this.guide.clear();
        }
    });
    
    App.Concept.EnergyBar = game.Class.extend({
        // Energy bars accumulate points every time an idea sprite is acquired by the player. They fade slowly over time rewarding players who take a risk and leave acquiring ideas til later in the game (at the risk of missing some)
        
        init: function(){
            this.energy = 0;
            this.maxEnergy = 100;
            this.width = (window.innerWidth * game.device.pixelRatio) - (176 * App.deviceScale());
            this.height = 16 * App.deviceScale();
            this.depletionRate = 1;// XDK_PARAMS Try changing this to make the game easier or harder
            this.energyGraphic = new game.PIXI.Graphics();
            
            game.scene.hud.container.addChild(this.energyGraphic);
            game.scene.addObject(this);
        },
        
        addEnergy: function(energy_){
            this.energy += energy_;
            this.energy = Math.min(this.energy, this.maxEnergy);
        },
        
        getScore: function(){
            return (this.energy/this.maxEnergy) * 100;
        },
        
        update: function(){
            if(!game.scene.player.reversingTime){
                this.energy -= this.depletionRate * App.getDelta();
            }
            this.energy = Math.max(this.energy,0);
            this.display();
        },
        
        display: function(){
            this.energyGraphic.clear();
            this.energyGraphic.beginFill (game.scene.palette.bright, 0.3);
            this.energyGraphic.drawRect(this.location.x, this.location.y, this.width, this.height);
            this.energyGraphic.beginFill (this.colour, 1);
            this.energyGraphic.drawRect(this.location.x, this.location.y, (this.energy/this.maxEnergy) * this.width, this.height);
        }
    });
    
    App.Concept.EnergyBar1 = App.Concept.EnergyBar.extend({
        init: function(){
            this.location = new game.Vector(144 * App.deviceScale(), 32 * App.deviceScale());
            this.colour = game.scene.palette.hue1;
            this._super();
        }
    });
    
    App.Concept.EnergyBar2 = App.Concept.EnergyBar.extend({
        init: function(){
            this.location = new game.Vector(144 * App.deviceScale(), 48 * App.deviceScale());
            this.colour = game.scene.palette.hue3;
            this._super();
        }
    });
    
    App.Concept.EnergyBar3 = App.Concept.EnergyBar.extend({
        init: function(){
            this.location = new game.Vector(144 * App.deviceScale(), 64 * App.deviceScale());
            this.colour = game.scene.palette.hue2;
            this._super();
        }
    });
    
    
    App.Concept.Countdown = game.Class.extend({
        init: function(){
            this.text = new game.BitmapText( "Test", { font: 'Roboto-export' });
            this.location = new game.Vector(0 * App.deviceScale(), 80 * App.deviceScale());
            this.colour = game.scene.palette.bright;
            this.time = 30 + 3; //additional 3 seconds to cover player invulnerable stage at start
            this.displayTime = this.time;
            
            game.scene.hud.container.addChild(this.text);
            game.scene.addObject(this);
        },
        
        ended: function(){
            if (this.time > 0){
                return false;
            }else{
                return true;
            }
        },
        
        update: function(){
            this.time -= App.getDelta();
            this.time = Math.max(this.time, 0);
            this.displayTime = Math.min(this.time, 30);
            this.displayTime = Math.ceil(this.displayTime).toString();
            
            this.text.setText(this.displayTime);
            
            if(this.displayTime < 6){ 
                // Animate countdown within players field of view to draw attention to time running out
                this.textScale = 2 + 0.4 * Math.sin(this.time % 1 * Math.PI);
                var textWidth = this.text.getBounds().width;
                var textHeight = this.text.getBounds().height;
                this.location.set( 
                    (window.innerWidth * game.device.pixelRatio)/2 - (textWidth * App.deviceScale())/2, 
                    (window.innerHeight * game.device.pixelRatio)/4 - (textHeight * App.deviceScale())/2
                );
            }else{
                this.textScale = 1;
                var textWidth = this.text.getBounds().width;
                this.location.x = (window.innerWidth * game.device.pixelRatio)-((32 * App.deviceScale())+textWidth);
            }
            
            this.display();
        },
        
        display: function(){
            this.text.position.set(this.location.x, this.location.y);
            this.text.scale.set(this.textScale,this.textScale);
        }
    });
    
    // POST-PROCESSING CLASSES
    
    App.Concept.ColorCycle = game.Class.extend({
        init: function(){
            // Class that implements a Pixi color cycling shader during the unicorn effect
            this.location = new game.Vector(game.system.width/2, game.system.height/2);
            this.visible = false;
            
            this.colorCycle = 0;
            this.colorMatrix = 
                [1,0,0,0,
				 0,1,0,0,
				 0,0,1,0,
				 0,0,0,1];
            
            this.unicornSprite = new game.Sprite('concept/unicorn.png');
            this.unicornSprite.anchor.set(0.5,0.5);
            this.unicornSprite.alpha = 1;
            this.unicornSprite.blendMode = game.blendModes.ADD;
            
            game.scene.addObject(this);
        },
        
        show: function(){
            this.visible = true;
            this.unicornSprite.scale.set(0,0);
            game.scene.stage.addChild(this.unicornSprite);
            game.scene.gameLayer.container.filters = [game.scene.colorFilter];
            
            this.cycleTweenGroup = new game.TweenGroup();
            
            this.unicornTween = new game.Tween(this.unicornSprite.scale);
            this.unicornTween.to({x:1,y:1}, 2000);
            this.unicornTween.easing(game.Tween.Easing.Quadratic.Out);
            this.cycleTweenGroup.add(this.unicornTween);
            
            this.alphaTween = new game.Tween(this.unicornSprite);
            this.alphaTween.to({alpha:0}, 2000);
            this.alphaTween.easing(game.Tween.Easing.Quadratic.Out);
            this.cycleTweenGroup.add(this.alphaTween);
            
            this.cycleTweenGroup.start();
        },
        
        hide: function(){
            this.colorMatrix = 
                [1,0,0,0,
				 0,1,0,0,
				 0,0,1,0,
				 0,0,0,1];
            game.scene.colorFilter.matrix = this.colorMatrix; 
            this.visible = false;
            game.scene.gameLayer.container.filters = null;
        },
        
        update: function(){
            if(this.visible){
                this.colorCycle += 4 * App.getDelta();
                this.colorMatrix[1] = Math.sin(this.colorCycle) * 3;
                this.colorMatrix[2] = Math.cos(this.colorCycle);
                this.colorMatrix[3] = Math.cos(this.colorCycle) * 1.5;
                this.colorMatrix[4] = Math.sin(this.colorCycle/3) * 2;
                this.colorMatrix[5] = Math.sin(this.colorCycle/2);
                this.colorMatrix[6] = Math.sin(this.colorCycle/4);
                game.scene.colorFilter.matrix = this.colorMatrix; 
                
                this.display();    
            }
        },
        
        display: function(){
            this.unicornSprite.position.set(this.location.x, this.location.y);
        }
    });
    
    App.Concept.TimeReverse = game.Class.extend({
        init: function(){
            // Class that captures two copies of the stage image and ping pongs between them with reduced alpha to create a motion blur effect
            this.location = new game.Vector(game.system.width/2, game.system.height/2);
            this.visible = false;
            
            this.renderTexture1 = new game.PIXI.RenderTexture(game.system.width, game.system.height);
            this.renderTexture2 = new game.PIXI.RenderTexture(game.system.width, game.system.height);
            this.outputSprite = new game.Sprite(this.renderTexture1);
            this.outputSprite.alpha = 0.7;
            
            game.scene.addObject(this);
        },
        
        show: function(){
            this.visible = true;
            game.scene.reverseTimeLayer.container.addChild(this.outputSprite);
        },
        
        hide: function(){
            this.visible = false;
            game.scene.reverseTimeLayer.container.remove();
        },
        
        update: function(){
            if(this.visible){
                var temp = this.renderTexture1;
                this.renderTexture1 = this.renderTexture2;
                this.renderTexture2 = temp;
                this.renderTexture1.render(game.scene.stage);
                this.display();    
                this.renderTexture2.render(game.scene.stage);
            }
        },
        
        display: function(){
            this.outputSprite.setTexture(this.renderTexture1);
            this.outputSprite.position.set(0,0);
        }
    });
});