/* 
 * Beard Functionality
 * Matthew Evans, Autumn 2013
 * No License
 *
 * Dependent on Zepto, though jQuery should work in a pinch. 
 * They have similar APIs, and native JS is used where feasible.
 * Eventually I will test against both dependencies.
 */
;(function($){

	var Beard = {

		// Initialize the player
		init: function (elm) {

			// Cache the element as a Zepto object
			var $elm = $(elm);

			// Cache other DOM elements
			Beard.elements = {};
			Beard.elements.$player = $elm;
			Beard.elements.$text = $elm.find('.text');
			Beard.elements.$time = $elm.find('.time');

			// Instantiate a new Audio object
			Beard.audio = new Audio();

			// Set the source of the audio object if the data-source attribute exists
			if($elm.attr('data-source')) {
				Beard.setSource($elm.attr('data-source'));
			}

			// Bind Audio events
			$(Beard.audio).on('timeupdate', Beard.displayTime);
			$(Beard.audio).on('canplay', Beard.displayTime);

			// Bind DOM events
			$elm.on('click', '.play', this.play);

		},
		load: function (options) {

			// Must have a valid source
			if(!Beard.parseValidAudioFormat(options.url)) {
				Beard.error('Invalid audio url.');
				return;
			}

			// Stop audio
			Beard.pause();

			// Set the values
			Beard.displayText(options.text);
			Beard.setSource(options.url);

		},
		error: function (message) {

			// Cache current message
			var prevMessage = Beard.elements.$text.text();

			// Display the error message
			Beard.displayText('Error: ' + message);

			// After 3 seconds, return to the previous message
			setInterval(function(){
				Beard.displayText(prevMessage);
			}, 3000)
		
		},
		setSource: function (url) {

			// Set the audio source to the new URL
			Beard.audio.src = url;

		},
		displayText: function (text) {

			Beard.elements.$text.text(text);

		},
		displayTime: function () {

			// Parse the time properties fromt the audio object
			var currentTime = Beard.parseSecondsToReadableFormat(Beard.audio.currentTime);
			var duration = '';
			if(Beard.audio.duration) {
				duration = ' of ' + Beard.parseSecondsToReadableFormat(Beard.audio.duration);		
			} else {
				currentTime = 'loading...';
			}


			// Create a time string
			var timeString = currentTime + duration;

			// Update the view
			Beard.elements.$time.text(timeString);

		},
		parseSecondsToReadableFormat: function (seconds) {

			// Trim the decimals from the time
			var trimmedSeconds = Math.round(seconds);

			// If it's less than one minute
			if(trimmedSeconds < 60) { return '0:' + ( '0' + trimmedSeconds).slice(-2) };

			// If it is a multiple of one minute
			if(trimmedSeconds % 60 == 0) { return  ( trimmedSeconds / 60 ) + ':00'; }

			// If it is more than one minute
			return Math.round(seconds/60) + ':' + ('0' + Math.round(seconds % 60)).slice(-2);


		},
		parseValidAudioFormat: function (url) {

			// Allowable audio formats
			var whitelist = ['mp3', 'ogg', 'mp4'];

			// Valid is false by default
			var valid = false;

			// With the url...
			if(url) {
				// Check to make sure that the format exists in the whitelist
				var splitUrl = url.split('.');
				var ext = splitUrl[splitUrl.length - 1];
				if( $.inArray(ext, whitelist) >= 0 ) {
					// If it exists, it's valid
					valid = true;
				}
			}

			return valid;

		},
		play: function () {

			// We use the same buton for play and pause
			if(Beard.playing) {

				return Beard.pause();

			}

			// Start audio
			Beard.audio.play();

			// Set a playing property
			Beard.playing = true;

			// Set the DOM element to playing
			Beard.elements.$player.addClass('playing');

		},
		pause: function () {

			// Pause audio
			Beard.audio.pause();

			// Unset the playing property
			Beard.playing = false;

			// Unset the DOM playing class
			Beard.elements.$player.removeClass('playing');

		},
		seek: function () {}
	};

	// Expose the functions as collection methods.
	$.extend($.fn, {

		// This method initializes values from attributes and binds events.
		beard: function () {

			// We only support one player element (for now)
			Beard.init(this[0]);
			return this;

		},
		// Play Method
		play: function () {

			Beard.play();
			return this;

		},
		// Pause Method
		pause: function () {

			Beard.pause();
			return this;

		},
		// Load a new source URL
		load: function (options) {

			Beard.load(options);
			return this;
			
		}

	});

})(Zepto || jQuery);