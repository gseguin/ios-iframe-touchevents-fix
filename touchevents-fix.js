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
		handlers = {};

	function toggleTouchEventsBindings( bind ) {
		$.each( handlers, function( key, val ) {
			$.each( val, function( i, fn ) {
				$( document )[ bind ? "on" : "off" ]( key, fn );
			});
		});
	}

	var iosTouchEventsFixer = {

		install: function() {
			$.fn.on = function( types, selector, data, fn ) {
				var func = fn || data || selector,
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
						if( $.inArray( boundFunction, handlers[ type ] ) === -1 ) {
							handlers[ type ].push( boundFunction );
						}
					}
				}
				return on.call( this, types, selector, data, fn );
			};
			$( window ).on( "focus", function( e ){
				toggleTouchEventsBindings( true );
			}).on( "blur", function( e ){
				toggleTouchEventsBindings( false );
			});
		},

		uninstall: function() {
			$.fn.on = on;
			toggleTouchEventsBindings( true );
		}
	};

	iosTouchEventsFixer.install();
	return iosTouchEventsFixer;
}));
