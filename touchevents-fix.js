(function (factory) {
	if ( typeof define === "function" && define.amd ) {
		// AMD. Register as an anonymous module.
		define( [ "jquery" ], factory);
	} else {
		// Browser globals
		factory( jQuery );
	}
}(function ( $ ) {
	var ios = /iPhone|iPad|iPod/.test( window.navigator.platform ),
		attached = 0,
		eventHandles = {
			"touchstart": null,
			"touchend": null,
			"touchmove": null,
			"touchcancel": null
		},

		// Attach a single capturing handler on the window while someone wants touch events
		toggleWindowBindings = function ( unbind ) {
			$( window )[ unbind ? "off" : "on" ]( "focus blur", function( event ) {
				$.each( eventHandles, function( name, callback ) {
					( this.ownerDocument || this )[ ( event.type === "focus" ) ?
						"addEventListener" : "removeEventListener" ]( name, callback, true );
				});
			});
		};

	// This fix could really break things if something goes wrong so lets target ios only
	if ( ios ) {
		jQuery.each( eventHandles, function( name, callback ) {
			jQuery.event.special[ name ] = {
				setup: function( elem, _data, _ns, eventHandle ) {
					if( attached++ === 0 ){
						eventHandles[ name ] = eventHandle;
						( this.ownerDocument || this ).addEventListener( name, eventHandle, true );
						toggleWindowBindings();
					}
				},
				teardown: function() {
					if ( --attached === 0 ) {
						eventHandles[ name ] = null;
						( this.ownerDocument || this )
							.removeEventListener( name, eventHandles[ name ], true );
						toggleWindowBindings( true );
					}
				}
			};
		});
	}
}));
