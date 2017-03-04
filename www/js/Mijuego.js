//El juego trata de que los cangrejos lleguen hasta las rocas desde la parte derecha de la pantalla a la izquierda.
//Se juega con la pantalla en horizontal.
//Cuando un cangrejo llega a las rocas aumenta la puntuacion y comienza otro cangrejo.
//Hay que evitar colisionar con el/los pulpos, quita puntos.
//A mayor puntuación mayor velocidad.
//A partir de un cierto nivel aparece un segundo pulpo.
//POSIBLES MEJORAS:
// - añadir contador tiempo
// - poner texto puntuación en horizontal
// - hacer scripts dinámicos (que el cangrejo mueva los ojos por ejemplo)
// - cuando el pulpo coincide con cangrejo mostrar captura



var app={
  inicio: function(){
    pixelsIconos = 64;
    dificultad = 1;
    velocidadX = 0;
    velocidadY = 0;
    velocidadPulpoY = 0.5;
    velocidadPulpoX = 0.5;

    puntuacion = 0;
    puntuacionText= null;

    pulpo2Existe=false;
        
    capturaCangrejo= false;
    fondoInicial= '#00ffff';
    
    dificultadText= null;

    alto  = document.documentElement.clientHeight;
    ancho = document.documentElement.clientWidth;

    meow1 = null;
    
    app.vigilaSensores();
    app.iniciaJuego();
  },

  iniciaJuego: function(){

    function preload() {
      game.physics.startSystem(Phaser.Physics.ARCADE);

      game.load.image('fondomar', 'assets/fondomar.png');
      game.load.image('rocas', 'assets/rocas.png');

      //iconos--> http://icon-icons.com
      game.load.image('cangrejo', 'assets/cangrejo.png');
      game.load.image('pulpo', 'assets/pulpo.png');
      game.load.image('pulpo2', 'assets/pulpo2.png');
 
      game.load.audio('meow1', 'assets/audio/SoundEffects/meow1.mp3');
      
    }

    function create() {
 
      fondomar = game.add.image(0, 0, 'fondomar');
 
      puntuacionText = game.add.text(15, 15, puntuacion, { fontSize: '20px', fill: '#FFFF33'});
      dificultadText= game.add.text (15, 45, dificultad, {fontSize: '20px', fill: '#FFFF33'});

      puntuacionText.text= 'Score: ' + puntuacion; 
      dificultadText.text= 'Level: ' + dificultad; 

      rocas = game.add.sprite(0, alto-45, 'rocas');
      cangrejo = game.add.sprite(app.inicioX(), 0, 'cangrejo');     //el cangrejo empieza desde la derecha
      pulpo = game.add.sprite(0, app.inicioY(), 'pulpo');           //el pulpo empieza desde arriba

      game.physics.arcade.enable(rocas);
      game.physics.arcade.enable(cangrejo);
      game.physics.arcade.enable(pulpo);

      cangrejo.body.collideWorldBounds = true;
      cangrejo.body.onWorldBounds = new Phaser.Signal();
      cangrejo.body.onWorldBounds.add(app.alertaBorde, this);

      pulpo.body.collideWorldBounds = true;
      pulpo.body.onWorldBounds = new Phaser.Signal();
      pulpo.body.onWorldBounds.add(app.alertaBordePulpo, this);

    }

    function update(){
      var factorDificultad = (200 + (dificultad * 25));
      cangrejo.body.velocity.y = (velocidadY * factorDificultad);
      cangrejo.body.velocity.x = (velocidadX * (-1 * factorDificultad));

      pulpo.body.velocity.y = (velocidadPulpoY * factorDificultad);
      pulpo.body.velocity.x = (velocidadPulpoX * (-1 * factorDificultad));

      game.physics.arcade.overlap(cangrejo, pulpo, app.capturaCangrejo, null, this);
      game.physics.arcade.overlap(cangrejo, rocas, app.incrementaPuntuacion, null, this);

      if ((dificultad >= 2) && (pulpo2Existe == false)){
        pulpo2 = game.add.sprite(0, app.inicioY(), 'pulpo2');           //el pulpo empieza desde arriba
        game.physics.arcade.enable(pulpo2);
        pulpo2.body.collideWorldBounds = true;
        pulpo2.body.onWorldBounds = new Phaser.Signal();
        pulpo2.body.onWorldBounds.add(app.alertaBordePulpo, this);          
        pulpo2Existe = true;
      }

      if (pulpo2Existe == true){
        // truco: asigno la velovidad "x" e "y" al pulpo 2 cambiadas respecto al primer pulpo para que no se muevan sincronizados
        pulpo2.body.velocity.x = (velocidadPulpoY * factorDificultad);
        pulpo2.body.velocity.y = (velocidadPulpoX * (-1 * factorDificultad));
        game.physics.arcade.overlap(cangrejo, pulpo2, app.capturaCangrejo, null, this);          
      }

      if (capturaCangrejo==true){
        capturaCangrejo=false;

        meow1 = game.add.audio('meow1');
        meow1.play();

        app.espera(0.2);
      }
      else{
        if (puntuacion <= 0){
          dificultad= 0;
        }
        else
        {
          //Aumentar nivel dificultad cada 10 puntos
          dificultad= Math.floor(puntuacion/10);
        }
      }

      puntuacionText.text = 'Score: ' + puntuacion;
      dificultadText.text= 'Level: ' + dificultad;

    }

    var estados = { preload: preload, create: create, update: update };
    var game = new Phaser.Game(ancho, alto, Phaser.CANVAS, 'phaser',estados);
  },


  alertaBorde: function(){
  },

  alertaBordePulpo: function(){
    if (Math.random()<0.5){
      velocidadPulpoY = -1 * velocidadPulpoY;
    }
    if (Math.random()<0.5){
      velocidadPulpoX = -1 * velocidadPulpoX;
    }
  },

  capturaCangrejo: function(){
    capturaCangrejo = true;
    puntuacion = puntuacion-1;
    cangrejo.body.x = app.inicioX();
    cangrejo.body.y = 0;   //el cangrejo empieza en el lateral derecho
  },

  incrementaPuntuacion: function(){
    puntuacion = puntuacion+3;
    cangrejo.body.x = app.inicioX();
    cangrejo.body.y = 0;   //el cangrejo empieza en el lateral derecho
  },

  espera: function(nsegundos){
    objetivo = (new Date()).getTime() + 1000 * Math.abs(nsegundos);
    while ( (new Date()).getTime() < objetivo );
  },

  inicioX: function(){
    return app.numeroAleatorioHasta(ancho - pixelsIconos );
  },

  inicioY: function(){
    return app.numeroAleatorioHasta(alto - pixelsIconos );
  },

  numeroAleatorioHasta: function(limite){
    return Math.floor(Math.random() * limite);
  },

  vigilaSensores: function(){
    
    function onError() {
        console.log('onError!');
    }

    function onSuccess(datosAceleracion){
      app.detectaAgitacion(datosAceleracion);
      app.registraDireccion(datosAceleracion);
    }

    navigator.accelerometer.watchAcceleration(onSuccess, onError,{ frequency: 10 });
  },

  detectaAgitacion: function(datosAceleracion){
    var agitacionX = datosAceleracion.x > 10;
    var agitacionY = datosAceleracion.y > 10;

    if (agitacionX || agitacionY){
      setTimeout(app.recomienza, 1000);
    }
  },

  recomienza: function(){
    document.location.reload(true);
  },

  registraDireccion: function(datosAceleracion){
    velocidadX = datosAceleracion.x ;
    velocidadY = datosAceleracion.y ;
  }
};

if ('addEventListener' in document) {
    document.addEventListener('deviceready', function() {
        app.inicio();
    }, false);
}