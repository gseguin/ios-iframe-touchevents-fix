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

	function returnFalse() {
		return false;
	}

	function unbindTouchEvents() {
		if (!unbound) {
			unbound = true;
			$.each( handlers, function( key, val ) {
				$.each( val, function( i, fn ) {
					$document.off( key, fn );
				});
			});
		}
	}

	function rebindTouchEvents() {
		if (unbound) {
			unbound = false;
			$.each( handlers, function( key, val ) {
				$.each( val, function( i, fn ) {
					$document.on( key, fn );
				});
			});
		}
	}

	var iosTouchEventsFixer = {
		protectedData: "protected",

		protectIframes: function() {
			$( "iframe" ).each( function() {
				var iframe = this,
					$iframe = $( iframe ),
					$contentWindow = $( iframe.contentWindow ),
					protectedData = iosTouchEventsFixer.protectedData;
				try {
					if ( !$iframe.data( protectedData ) ) {
						$iframe.data( protectedData, true );
						$contentWindow.bind( "focus", function() {
							unbindTouchEvents();
							$contentWindow.one( "blur", function() {
								rebindTouchEvents();
								$iframe.data( protectedData, false );
							} );
						} );
					}
				} catch ( e ) {
					// noop for iframes that are not of the same domain as the document
					$.noop();
				}
			} );
		},

		install: function() {
			$.fn.on = function( types, selector, data, fn ) {
				if ( data == null && fn == null ) {
					// ( types, fn )
					fn = selector;
					data = selector = undefined;
				} else if ( fn == null ) {
					if ( typeof selector === "string" ) {
						// ( types, selector, fn )
						fn = data;
						data = undefined;
					} else {
						// ( types, data, fn )
						fn = data;
						data = selector;
						selector = undefined;
					}
				}
				if ( fn === false ) {
					fn = returnFalse;
				} else if ( !fn ) {
					return this;
				}

				if ( typeof types === "string" ) {
					if ( /^touch/.test( types ) && ( this.get(0) === document ) ) {
						if ( !handlers[ types ] ) {
							handlers[ types ] = [];
						}
						handlers[ types ].push( fn );
						iosTouchEventsFixer.protectIframes();
					}
				}
				return on.call( this, types, selector, data, fn );
			}
		},

		uninstall: function() {
			$.fn.on = on;
			rebindTouchEvents();
		}
	};

	iosTouchEventsFixer.install();

	return iosTouchEventsFixer;
}));