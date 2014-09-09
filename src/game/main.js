var App = {};
// Sections
App.Home = {}; 
App.Pause = {}; 

/** 
    XDK_CHALLENGE 
    This section sepcifies namespaces and id's for the mini challenges.
    Further down the file you will find specific level related configurations.
    To create a new game you must specify a namespace and unique ID and add it to a level inside App.getLevelList.
    Create the module folder and module files that correspond with the mini challenge name.
    The new files must be required below with the others.
*/

// Mini Games 
App.Concept = { id: 1 };
App.Coding = { id: 2 }; 
App.Release = { id: 3 };
//App.YourGame = { id: 4 }; 

game.module(
    'game.main'
)
.require(
    'engine.core',
    'engine.loader',
    'engine.scene',
    'engine.renderer',
    'engine.particle',
    'engine.timer',
    'engine.tween',
    'modules.pause.objects',
    'modules.home.objects', 'modules.home.scenes',
    'modules.concept.objects', 'modules.concept.scenes',
    'modules.coding.objects', 'modules.coding.scenes',
    'modules.release.objects', 'modules.release.scenes'
)
.body(function(){

    App.init = function(){

        // Enable/disable sound
        App.sound_disabled = false;
        App.developer = false;

        // Set orientation
        game.System.resizeToFill = true;

        // Set initial scene
        App.startScene = App.Home.Main;

        /******************************************************************
        ** Debug **/
        /*****************************************************************/
        if(App.developer) {
            $("#home").bind("touchstart click", App.goHome.bind(this));
            $("#outro").bind("touchstart click", App.goToOutro.bind(this));
            $("#next").bind("touchstart click", App.nextLevel.bind(this));
            $("#prev").bind("touchstart click", App.prevLevel.bind(this));
            $("#prev").bind("touchstart click", App.prevLevel.bind(this));
            $("#restart").bind("touchstart click", App.restartLevel.bind(this));
            $("#pause").bind("touchstart click", App.pauseLevel.bind(this));
            $("#clear").bind("touchstart click", App.clearStorage.bind(this));
            //$("#log").show();
            $("#actions").show();

            App.stats = new Stats();
            App.stats.domElement.style.position = 'absolute';
            App.stats.domElement.style.left = '10%';
            App.stats.domElement.style.top = '0px';
            App.stats.domElement.style.display = 'none';

            document.body.appendChild( App.stats.domElement );
        }
        /******************************************************************
        ** Debug **/
        /*****************************************************************/

        // Remove splash screen
        $("#splash").remove();

        // Start game
        game.start(
            App.Home.Main, 
            window.innerWidth * game.device.pixelRatio, 
            window.innerHeight * game.device.pixelRatio
        );

        // Set progress
        game.storage.set("CurrentMiniGame", 0);
        game.storage.set("CurrentLevel", 1);

        // Set mute
        App.mute = game.storage.get("gameMuted") || false;

        // Set vibrations
        App.novibrations = game.storage.get("gameVibrations") || false;

    };

    App.goHome = function(){

        // Pause music
        game.audio.stopMusic();

        // Unpause
        if(game.system.paused) {
            game.system.resume();
        } 
        // Save state
        game.storage.set("CurrentMiniGame", 0);
        game.storage.set("CurrentLevel", 1);

        // Change scene
        game.system.setScene(App.Home.Main);

    };

    App.clearStorage = function(){

        // Reset storage
        game.storage.reset();

    };

    App.nextLevel = function(){

        var progress, games;

        // Pause music
        game.audio.stopMusic();

        // Unpause
        if(game.system.paused) {
            game.system.resume();
        } 

        // Get state
        progress = game.storage.get("CurrentMiniGame");
        games = game.storage.get("CurrentGames");

        // Play next level
        if(progress + 1 < games.length) {

            // Set state
            game.storage.set("CurrentMiniGame", progress + 1);

            // Change scene
            this.playGame(games[progress + 1]);

        } else {

            // Change scene
            game.system.setScene(App.Home.LevelOutro);
            
        }
    };

    App.goToOutro = function(){

        var progress, games;

        // Pause music
        game.audio.stopMusic();

        // Unpause
        if(game.system.paused) {
            game.system.resume();
        }

        // Get state
        progress = game.storage.get("CurrentMiniGame");
        games = game.storage.get("CurrentGames");
        
        // Loop through each App item
        $.each(App, function(key, data){

            // Match ID
            if(data.id === games[progress]) {

                // Change scene
                game.system.setScene(data.Outro);
            }

        });
        
    };

    App.prevLevel = function(){

        var progress, games;

        // Pause music
        game.audio.stopMusic();

        // Unpause
        if(game.system.paused) {
            game.system.resume();
        }

        // Get local storage
        progress = game.storage.get("CurrentMiniGame");
        games = game.storage.get("CurrentGames");

        // Play next level
        if(progress - 1 >= 0) {

            // Set state
            game.storage.set("CurrentMiniGame", progress - 1);

            // Change scene
            this.playGame(games[progress - 1]);

        } else {

            // Set state
            game.storage.set("CurrentMiniGame", 0);

            // Change scene
            game.system.setScene(App.Home.Levels);

        }
    };

    App.getLevelList = function(){

        // Return the app level list
        return [{ 
            name: "Level 1", 
            title: "Moonlighting", 
            description: "It’s time to take the tech world by storm. All you need is an app...", 
            games: [1, 2, 3], 
            rating: game.storage.get("level_1_rating") || 0, 
            palette: [0x394551, 0x525e6a, 0x69b5ae, 0xFFFFFF],
            feedback: [[
                ["Well I love it. What does it do again?", "Mom"],
                ["The problem with this app is that it exists.", "Grumpy cat"],
                ["What’s an app?", "Guy living under a rock"]
            ],[
                ["It’s fantastic! How much?", "Social media guy"],
                ["App looks great. I feel like I deserve some credit though.", "Your barista"],
                ["Teach me how to get past the distractions!", "Bill the Procrastinator"]
            ],[
                ["When you release 2.0... I’ll be back.", "The Governator"],
                ["I always knew you’d amount to something.", "Your first computer teacher"],
                ["Much nice! So appy! Much talent. Wow!", "The Doge"]
            ]],
            unlocked: true
        }, { 
            name: "Level 2", 
            title: "First job", 
            description: "You scored your first job! Try not to mess it up...", 
            games: [1, 2, 3], 
            rating: game.storage.get("level_2_rating") || 0, 
            palette: [0xe3cda4, 0xe6b493, 0x695c7a, 0x2f343b],
            feedback: [[
                ["Nice app dude.", "Average Joe"],
                ["Proud of you, babe.", "Your significant other"],
                ["I like turtles...", "Zombie kid"]
            ],[
                ["I’m really glad this is what you were working on when you called in sick.", "Your boss"],
                ["Mad skills bro!", "Your bro"],
                ["We should take over the company, together we could do great things.", "Your IT guy"]
            ],[
                ["Actually, I kind of like it too...", "Forum troll"],
                ["I’m pretty sure I make the best apps. But this is really good too.", "Canye East"],
                ["I love it! Let’s take a selfie! #nofilter", "Random teenager"]
            ]],
            unlocked: game.storage.get("level_1_complete") || false
        }, { 
            name: "Level 3", 
            title: "Start up", 
            description: "There’s some hype around you now. You just need a hit...", 
            games: [1, 2, 3], 
            rating: game.storage.get("level_3_rating") || 0, 
            palette: [0xff7e66, 0x455d7a, 0xFFFFFF, 0x455d7a],
            feedback: [[
                ["It’ll be cool for 5 minutes. I posted that on my vlog by the way.", "Tech hipster"],
                ["Is it on? I don’t think this thing is working. But I’m proud of you anyway.", "You dad"],
                ["This app tastes terrible.", "Your pet"]
            ],[
                ["Fantastic work. I’d like to offer you a new job.", "Gill Bates"],
                ["Winter is coming, but this app will keep us warm.", "The Northern King"],
                ["With your tech skills and my sports skills, we could rule the world. You in?", "Your favourite athlete"]
            ],[
                ["Nyan nyan ny nyan!", "Nyan cat"],
                ["If I could give it four stars I would!", "Movie critic"],
                ["This app will be the top searched app of the year, hands down.", "Founder of Moogle"],
                ["My forecast for this app is sunny!", "The weather guy"],
                ["This thing is ready to launch!", "NASA astronaut"],
                ["I bow to you.", "Your tech nemesis"]
            ]],
            unlocked: game.storage.get("level_2_complete") || false
        }, { 
            /** 
                XDK_CHALLENGE 
                This array specifies the configuration of a level
                The games array holds the ids to the mini-games
                The mini-game id's are specified at the top of this file.
                Transform this section into your own level.;;
            */
            name: "Level 4", 
            title: "Over to you", 
            description: "", 
            games: [], 
            rating: game.storage.get("level_4_rating") || 0, 
            palette: [0xff7e66, 0x455d7a, 0xFFFFFF, 0x455d7a],
            feedback: [],
            unlocked: true
        }];

    };

    App.restartLevel = function(){

        var progress, games;

        // Pause music
        game.audio.stopMusic();

        // Unpause
        if(game.system.paused) {
            game.system.resume();
        }

        // Get local storage
        progress = game.storage.get("CurrentMiniGame");
        games = game.storage.get("CurrentGames");

        // Play next level
        this.playGame(games[progress]);

    };

    App.pauseLevel = function(){

        // Check game is paused
        if(game.system.paused) {

            // resume game
            game.system.resume();

        } else {

            // Pause game
            game.system.pause();

        }

    };

    App.playGame = function(id){

        // Pause music
        game.audio.stopMusic();

        // Loop through each Namespace
        $.each(App, function(key, data){

            // Match ID
            if(data.id === id) {

                // Change scene
                game.system.setScene(data.Intro);

            }
        });

    };

    App.transition = function(ctx, action, target){

        var bg, boxes = [], i, tween1, tween3, rand, container;

        // Create bg
        bg = new game.Tween(ctx);
        ctx.alpha = 0;
        ctx.position.x = 0;
        ctx.position.y = 0;
        bg.to({ alpha: 1 }, 500).easing(game.Tween.Easing.Quartic.Out);

        // Start tween
        bg.start();

        // Container
        container = new game.Container();
        container.scale.set(App.deviceScale(), App.deviceScale());

        // Random number
        rand = 250 + (Math.random() * 1000);

        // Create 40 lines of code
        for(i = 0; i < 40; i += 1) {

            // Graphics object
            boxes[i] = new game.Graphics();

            // Draw rectangle
            boxes[i].beginFill(0xFFFFFF);
            boxes[i].drawRect(0, 0, ((game.system.width / App.deviceScale()) / 7) * (Math.random() * 5), 30);
            boxes[i].endFill();
            boxes[i].position.x = 48 + ((game.system.width / App.deviceScale()) / 15) * (Math.random());
            boxes[i].position.y = (game.system.height / App.deviceScale()) + (55 * i);
            boxes[i].alpha = 0.25;

            // Create tweens
            tween1 = new game.Tween(boxes[i]);
            tween1.to({ y: boxes[i].position.y - 500 }, rand)
                .easing(game.Tween.Easing.Quartic.Out);

            tween3 = new game.Tween(boxes[i]);
            tween3.to({ y: boxes[i].position.y - 1500 }, 500);

            // Add to stage and animate
            container.addChild(boxes[i]);
            tween1.chain(tween3).start();

        }

        game.scene.stage.addChild(container);

        // Tween complete callback
        tween3.onComplete(function(){

            // Check action
            if(action === "setScene") {
                game.system.setScene(target);
            }
            
            // Check action
            if(action === "playGame") {
                App.playGame(target);
            }
            
            // Check action
            if(action === "nextLevel") {
                App.nextLevel();
            }

            // Check action
            if(action === "goHome") {
                App.goHome();
            }

            // Check action
            if(action === "goTo") {
                window.open(target, "_blank");
            }

        });

    };

    App.buttonClick = function(ctx, animation, action, target){

        var tween;

        // Check animation type
        if(animation === "flash") {

            // Create tween
            tween = new game.Tween(ctx);
            ctx.alpha = 1;
            tween.to({ alpha: 0 }, 500);

        }

        // Check animation type
        if(animation === "wipe") {

            // Create tween
            tween = new game.Tween(ctx);
            ctx.alpha = 0;
            ctx.position.x = 0;
            ctx.position.y = 0;
            tween.to({ alpha: 1 }, 500).easing(game.Tween.Easing.Quartic.Out);

        }
        
        // Tween complete callback
        tween.onComplete(function(){

            // Check action
            if(action === "setScene") {
                game.system.setScene(target);
            }
            
            // Check action
            if(action === "playGame") {
                App.playGame(target);
            }
            
            // Check action
            if(action === "nextLevel") {
                App.nextLevel();
            }

            // Check action
            if(action === "goHome") {
                App.goHome();
            }

            // Check action
            if(action === "goTo") {
                window.open(target, "_blank");
            }
        });

        // Start tween
        tween.start();

    };


    App.log = function(log){

        // Update debug log
        document.getElementById("log").innerHTML = log;

    };

    App.generateName = function(){

        // Name list
        var name1 = [
            "John Lennon:", "Abe Lincoln's", "Warhol's", "Davey Jones:", "Salty Jack's",
            "Archimedes'", "Pythagoras'", "Spartacus!", "Voltaire's", "Oli Cromwell:", 
            "Tiger Strike:", "Secret Mission:", "Dr. Frog:", "Cleopatra's", "Atlantis:",
            "Banksy's", "Rasputin's", "Gandhi's", "Picard's", "Da Vinci's", "Super", "Hyper",
            "Nietzsche's", "Moon Base 7:", "Genghis Khan's", "Caeser's", "Galileo:", "Napoleon:",
            "The First Lady's", "Dancey Dancey:", "Zena:", "Plato's", "Hannibal:", "Mega",
            "Orion Galaxy:", "Bill Shakespeare:", "JFK:", "Blackbeard's", "Rameses V:",
            "Mr President's", "Tutankhamun:", "ThunderDogs:", "Trotsky:", "Xerxes'", "Freud's",
            "Moon Walker:", "Mufasa's", "Titan Moon:", "Apollo 8:", "Dante's", "Orwell's", "Spaceman's"
        ],
        name2 = [
            "Ice Hockey", "Snooker", "Golf", "Bin Lid Band", "Football", "Spooky", "Knitting",
            "Weird", "Seagull", "Fantasy", "Curling", "Apache", "Sneaky", "Careless", "Airship",
            "Furious", "Hairdo", "Cowboy", "Pirate", "Friendzone", "Tennis", "Volleyball",
            "Balloon", "Mars", "Blackjack", "Cooking", "Hamster", "Death Metal", "Go-Kart",
            "Backstage", "Tattoo", "X-Ray", "Doomsday", "Furry", "Undersea", "Salty", "Casino",
            "Hurricane", "Galactic", "Spelunking", "Dinosaur", "Comet", "Kitten", "Mysterious",
            "Marshmallow", "Chocolatey", "Swirly", "UFO", "Mighty", "Cyberpunk",
            "Psychedelic", "Cyber", "Geekspeak", "Digital", "Fruity", "Space"
        ],
        name3 = [
            "Hijack", "Party 6", "Odyssey", "Manager 2014", "Diary", "Dash", "Hoedown!",
            "Tactics", "Puzzle", "Mission", "Workout", "Strike 3", "Disaster", "Quiz",
            "Adventure", "Nightmare", "Romance", "Terror", "Theif", "Surprise", "Zone II",
            "Pro Tour 4", "Stories III", "Strategies", "Challenge Vol:3", "Quest", 
            "Faux Pas", "Comeback", "Mania", "Mystery", "Attack!", "Revenge!", "Jackpot!",
            "Trek", "Bobsled", "Island", "Melody", "Starship", "Breakdown", "Shootout",
            "Day Out", "Night In", "Afternoon", "Investigation", "Weaponry", "Project"
        ];

        // Concat random name and return
        return name1[Math.floor(Math.random() * name1.length)] + " " + 
               name2[Math.floor(Math.random() * name2.length)] + " " + 
               name3[Math.floor(Math.random() * name3.length)];

    };

    App.roundRect = function(ctx, x, y, width, height, radius1, radius2, radius3, radius4) {

        // Create rounded rectangle
        ctx.moveTo(x + radius2, y);
        ctx.lineTo(x + width - radius2, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius2);
        ctx.lineTo(x + width, y + height - radius3);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius3, y + height);
        ctx.lineTo(x + radius4, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius4);
        ctx.lineTo(x, y + radius1);
        ctx.quadraticCurveTo(x, y, x + radius1, y);

    };

    App.shuffleArray = function(o){

        var j, x, i;

        // Shuffle the row config
        for(j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;

    };

    App.getHexNumber = function(r,g,b){

        var colour = [r,g,b], hex;

        // Map colour
        hex = colour.map(function(x){      
            x = parseInt(x, 10).toString(16);     
            return (x.length === 1) ? "0"+x : x; 
        });
        return "0x" + hex.join("");
    };
    
    App.deviceScale = function(){

        // Check mobile
        if (game.device.mobile){

            // Check device width
            if(game.system.width / game.device.pixelRatio < 560) {

                // Stupid small screens
                return 0.6; 

            } 

            // Return pixel ratio
            return game.device.pixelRatio / 2;  
        }

        // Return pixel ratio
        return game.device.pixelRatio;

    };
    
    App.mapToRange = function(x, inputStart, inputEnd, outputStart, outputEnd){
        // Map position of a value proportionally from one number range to another
        return (x-inputStart) * ((outputEnd-outputStart)/(inputEnd-inputStart)) + outputStart;
    };
    
    App.constrain = function(number, min, max){
        // Constrain value within a number range
        return Math.min(Math.max(parseInt(number, 10), min), max);  
    };
    
    App.randomBetween = function(low, high) {
        // Generate a random number between upper and lower bounds
        return low + (Math.random() * (high - low));
    };
    
    App.randomUnitVector = function(){
        // Generate a new vector of unit length pointing in a random direction
        var theta = Math.random() * Math.PI * 2;
        return new game.Vector(Math.cos(theta), Math.sin(theta));
    };
    
    App.heading = function(vector) {
        // Return the angle of a vector
        return Math.atan2(vector.y, vector.x);
    };
    
    App.lengthSqu = function(vector) {
        // Return the square of the hypotenuse of a vector, used to avoid a Math.sqrt operation for optimisation
        return vector.x * vector.x + vector.y * vector.y;
    };
    
    App.emptyVector = new game.Vector(0,0);
    
    App.getScreenCenter = function(){
        return new game.Vector((window.innerWidth * game.device.pixelRatio)/2, (window.innerHeight * game.device.pixelRatio)/2);
    };
    
    App.getDelta = function(){
        // Used in game 1 to apply time warping effects eg. fast forward or reverse
        return game.system.delta * game.scene.deltaMultiplier;
    };
    
    App.getFrameRate = function(){
        return 1000/game.system.delta;
    };
    
    App.NoiseFilter = function(){
        // Fragment shader implementation running on GPU to create a static noise effect
        game.PIXI.AbstractFilter.call( this );

        this.passes = [this];
        this.uniforms = {
            noiseLevel: {type: '1f', value: 1}, // The proportion of the display to convert to noise
            seed: {type: '1f', value: 0} // An incremented value that animates the display
        };

        this.fragmentSrc = [
            'precision mediump float;',
            'varying vec2 vTextureCoord;',
            'varying vec4 vColor;',
            'uniform sampler2D uSampler;',
            'uniform float noiseLevel;',
            'uniform float seed;',

            'void main(void) {',
            '   float rand = fract(sin(dot(vec2(seed * vTextureCoord.x, seed * vTextureCoord.y), vec2(12.9898,78.233))) * 43758.5453);', //pseudo random number generator
            '   gl_FragColor = texture2D(uSampler, vTextureCoord);',
            '   gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(rand,rand,rand), noiseLevel);', //mix original colour value of texel with computed random greyscale value at that location
            '}'
        ];
    };

    App.NoiseFilter.prototype = Object.create( game.PIXI.AbstractFilter.prototype );
    App.NoiseFilter.prototype.constructor = App.NoiseFilter;

    Object.defineProperty(App.NoiseFilter.prototype, 'noiseLevel', {
        // Accessor and Mutator functions for shader uniforms
        get: function() {
            return this.uniforms.noiseLevel.value;
        },
        set: function(value) {
            this.uniforms.noiseLevel.value = value;
        }
    });
    
    Object.defineProperty(App.NoiseFilter.prototype, 'seed', {
        // Accessor and Mutator functions for shader uniforms
        get: function() {
            return this.uniforms.seed.value;
        },
        set: function(value) {
            this.uniforms.seed.value = value;
        }
    });


    App.playSound = function(sound, loop, volume){

        // Check sound is not disabled or mute
        if(!App.sound_disabled && !App.mute) {

            // Play audio
            game.audio.playSound(sound, loop, volume);

        }

    };

    App.playMusic = function(sound, volume){

        // Check sound is not disabled
        if(!App.sound_disabled) {

            // play music
            game.audio.playMusic(sound, volume);

            // If mute
            if(App.mute) {

                // Pause music again
                game.audio.pauseMusic();

            }
        }

    };

    App.vibrate = function(time){

        // Check if vibrations allowed
        if(!App.novibrations) {

            // Vibrate
            game.system.vibrate(time);

        }
    };

    App.sendPageView = function(page){

        // Send page view to GA
        if(typeof analytics !== "undefined") {
            analytics.trackView(page);
        }

    };

    App.sendEvent = function(category, action, value){

        // Send event to GA
        if(typeof analytics !== "undefined") {
            analytics.trackEvent(category, action, value);
        }

    };

    App.requireAsset = function(asset){

        // Check item does not already exist
        if(!game.paths.hasOwnProperty(asset)) { 

            // Add asset
            game.addAsset(asset);

            // Return positive
            return 1;

        } 

        // Nothing to add
        return 0;

    };

    App.requireSound = function(asset, id){

        // Check sound is not disabled
        if(!App.sound_disabled) {

            // Check item does not already exist
            if(!game.paths.hasOwnProperty(id)) { 

                // Add audio
                game.addAudio(asset, id);

                // Return positive
                return 1;

            } 
        }

        // Nothing to add
        return 0;

    };
        
    // Bind splash screen to touch and click
    $("#splash").bind("touchstart click", App.init.bind(App));

});

