// Initialize Phaser, and creates a 400x490px game
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'game_div');

var menu_state = {
    preload : function(){
        //this.game.stage.backgroundColor = '#71c5cf';
        this.game.load.image('bg', '../images/bg.png');
    },

    create : function(){
        this.game.add.sprite(0,0, 'bg');
        var menuText = null;
        this.menuText = this.game.add.text(
            this.game.world.width/2,
            this.game.world.height/2,
            "FlappyMarc\nclick or tap to flap",
            {
                font: '32px "Lucida Console"',
                fill: '#fff',
                stroke: '#430',
                strokeThickness: 4,
                align: 'center'
            }
        );
        this.menuText.anchor.setTo(0.5,0.5);
        this.game.input.onTap.add(this.transition, this);
    },

    transition : function(){
        this.game.state.start('main');
    }
};

// Creates a new 'main' state that wil contain the game
var main_state = {

    preload: function() { 
        // Function called first to load all the assets

        //background color
        //this.game.stage.backgroundColor = '#71c5cf';
        this.game.load.image('bg', '../images/bg.png');

        //bird sprite
        this.game.load.image('bird', '../images/bird.png');

        //load pipe
        this.game.load.image('pipe', '../images/pipe.png');

    },

    create: function() { 
        localStorage.score = 0;
        // Fuction called after 'preload' to setup the game    

        this.game.add.sprite(0,0,'bg');
        //display bird
        this.bird = this.game.add.sprite(100, 245, 'bird');

        //add gravity to bird
        this.bird.body.gravity.y = 1000;

        //call 'jump' when hit space
        // var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        // space_key.onDown.add(this.jump, this);

        //call 'jump' when tap screen
        this.game.input.onDown.add(this.jump, this);



        //add pipes group
        this.pipes = game.add.group();
        this.pipes.createMultiple(20, 'pipe');

        //timer
        this.timer = this.game.time.events.loop(1500, this.add_row_of_pipes, this);

        //score
        this.score = 0;
        var style = {font : '30px Arial', fill: '#ffffff'};
        this.label_score = this.game.add.text(30, 30, '0', style);

        //change anchor for bird's animation
        this.bird.anchor.setTo(-0.2, 0.5);

    },
    
    update: function() {
        // Function called 60 times per second

        if(this.bird.inWorld == false) this.restart_game();

        //collision
        this.game.physics.overlap(this.bird, this.pipes, this.hit_pipe, null, this);

        //fly animation
        if(this.bird.angle <20)
            this.bird.angle += 1;
    },

    jump: function() {
        if (this.bird.alive == false)
            return;

        //add velocity to bird when jump
        this.bird.body.velocity.y = -350;

        //make bird upward when jump
        var animation = this.game.add.tween(this.bird);

        animation.to({angle: -20}, 100);

        animation.start();
    },

    restart_game: function() {
        this.game.time.events.remove(this.timer);


        //start the 'main' state, which is restart
        //this.game.state.start('main');
        this.game.state.start('gameover');
    },

    add_one_pipe : function(x, y){
        var pipe = this.pipes.getFirstDead();

        //pipe position
        pipe.reset(x, y);

        //make pipe move left
        pipe.body.velocity.x = -200;

        //kill pipe when it is not visible
        pipe.outOfBoundsKill = true;
    },

    add_row_of_pipes: function() {
        var hole = Math.floor(Math.random()*5)+1;

        for (var i=0; i< 8; i++)
            if (i != hole && i != hole+1)
                this.add_one_pipe(400, i*60+10);

        this.score += 1;
        this.label_score.content = (this.score-1);


    },

    hit_pipe: function(){
        if (this.bird.alive == false)
            return;

        //kill bird
        this.bird.alive = false;

        //prevent new pipe
        this.game.time.events.remove(this.timer);

        //stop pipes movement
        this.pipes.forEachAlive(function(p){
            p.body.velocity.x = 0;
        }, this);

        if(this.game.device.localStorage) {
            localStorage.score = (this.score-1);
            if (localStorage.highScore) {
                if (localStorage.score > localStorage.highScore) {
                    localStorage.highScore = localStorage.score;
                }
            }
            else {
                localStorage.highScore = localStorage.score;
            }
        }
    },
};

var gameover_state = {

    preload : function() {
        //this.game.stage.backgroundColor = '#71c5cf';
        this.game.load.image('bg', '../images/bg.png');
        game.load.spritesheet('button', '../images/chatter.png', 50, 50);
    },
    create : function() {
        this.game.add.sprite(0,0,'bg');

        var menuText = null;
        var button = game.add.button(game.world.centerX-30, game.world.height/2+100, 'button', this.actionOnClick, this, 2, 1, 0);
        //get score if browser supports it
        var text;
        if(this.game.device.localStorage) {
            if (localStorage.score < 10) text = "You are fired!\n";
            else if (localStorage >= 10 && localStorage < 20) text = "Aloha!\n";
            else if (localStorage >= 20) text = "I need you!\n";
            text += "score: "+ localStorage.score +"\n" + "high score: " + localStorage.highScore + "\nclick or tap to restart";
        }
        else {
            text = "game over!\nclick or tap to restart";
        }
        this.menuText = this.game.add.text(
            this.game.world.width/2,
            this.game.world.height/2,
            text,
            {
                font: '32px "Lucida Console"',
                fill: '#fff',
                stroke: '#430',
                strokeThickness: 4,
                align: 'center'
            }
        );
        this.menuText.anchor.setTo(0.5,0.5);
        this.game.input.onTap.add(this.transition, this);
    },
    transition : function() {
        this.game.state.start('main');
    },
    actionOnClick : function(){

    }
};

// Add and start the 'main' state to start the game
game.state.add('menu', menu_state);
game.state.add('main', main_state);  
game.state.add('gameover', gameover_state);
game.state.start('menu'); 