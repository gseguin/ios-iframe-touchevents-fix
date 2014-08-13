(function (factory) {
	if ( typeof define === "function" && define.amd ) {
		// AMD. Register as an anonymous module.
		define( [ "jquery" ], factory);
	} else {
		// Browser globals
		factory( jQuery );
	}
}(function ( $ ) {
	var on = $.fn.on,
		$document = $( document ),
		handlers = {},
		unbound = false;

	function toggleTouchEventsBindings( bind ) {
		if ( unbound === bind ) {
			unbound = !bind;
			$.each( handlers, function( key, val ) {
				$.each( val, function( i, fn ) {
					$document[ bind ? "on" : "off" ]( key, fn );
				});
			});
		}
	}
	function handleFocus( e ){
		console.log( "focus" )
		toggleTouchEventsBindings( false );
		$( this ).off( "blur" );
		console.log( e.data === this )
		$( this ).on( "blur", function() {
			console.log( "blur" );
			toggleTouchEventsBindings( true );
		});
	}

	var iosTouchEventsFixer = {

		protectIframes: function() {
			$( "iframe" ).each( function() {
				var $contentWindow = $( this.contentWindow );
				try {
					$contentWindow.off( "focus", null, handleFocus );
					$contentWindow.on( "focus", null, this.contentWindow, handleFocus );
				} catch ( e ) {}
			} );
		},

		install: function() {
			$.fn.on = function( types, selector, data, fn ) {
				var touch,
					func = fn || data || selector,
					eventObject = types;
				if ( this.get( 0 ) === document ) {
					if ( typeof types === "string" ) {
						eventObject = {};
						$.each( types.split( " " ), function( i, value ){
							eventObject[ value ] = func;
						});
					}
					$.each( eventObject, processBinding );
				}
				function processBinding( type, boundFunction ){
					if ( /^touch/.test( type ) ) {
						if ( !handlers[ type ] ) {
							handlers[ type ] = [];
						}
						if( !$.inArray( boundFunction, handlers[ type ] ) ) {
							handlers[ types ].push( boundFunction );
						}
						touch = true;
					}
				}
				if ( touch ) {
					iosTouchEventsFixer.protectIframes();
				}
				return on.call( this, types, selector, data, fn );
			};
		},

		uninstall: function() {
			$.fn.on = on;
			rebindTouchEvents();
		}
	};

	iosTouchEventsFixer.install();

	return iosTouchEventsFixer;
}));
