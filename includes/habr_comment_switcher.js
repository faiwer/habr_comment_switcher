// ==UserScript==
// @include http://habrahabr.ru/*
// ==/UserScript==

+function( w )
{
	var d = w.document,
		test_mode = false,
		// test_mode = true,
		$, engine;

	var Engine = function(){ this._init(); }
	Engine.prototype =
	{
		_init: function()
		{
			$ = w.jQuery;
			this._initConst();

			var $slider = $( this.s.slider );
			if( !$slider.get( 0 ) )
			{
				return false;
			}
			this.$counter = $slider.find( this.s.counter );

			var $refresh = $slider.find( this.s.refresh );
			$refresh.click( this._refreshClick.bind( this ) );

			// prepare button
			$button = $();
			var list = { _1up: -1, _2down: +1 };

			for( var name in list )
			{
				var $item = $( '<div>',
					{
						'class': this.c.button_class,
						unselectable: 'on',
						'data-direction': list[ name ],
					} )
					.text( list[ name ] > 0 ? '▼' : '▲' )
					.appendTo( $slider );

				$button = $button.add( $item );
			}

			$button.click( this._slideClick.bind( this ) );

			// prepare button CSS
			$( '<style>' )
				.text( this.css.join( '\n' ) )
				.appendTo( d.head );
		},

		_initConst: function()
		{
			$.extend( this,
			{
				s: { // selectors
					slider: '#xpanel',
					counter: '.new',
					refresh: '.refresh',
					info_panel: test_mode
						? '.comment_item > .info'
						: '.comment_item > .info.is_new, .comment_item > .info.__hcsc_visited',
				},
				c: { // classes
					def_new: 'is_new',
					active: '__hcsc_active',
					visited: '__hcsc_visited',
					button_class: '__hcsc_button',
				},
				css: [
					'.__hcsc_button { border-top: 1px solid white; line-height: 22px; height: 22px; ' +
					'cursor: pointer; }',
					'.__hcsc_button:hover { color: white; }',
					'.comments_list .comment_item .info.__hcsc_visited { background-color: #A48282 !important; }',
					'.comments_list .comment_item .info.__hcsc_active { background-color: #774141 !important; }',
					'.info.__hcsc_active *, .info.__hcsc_visited * { color: white !important; }',
				],
			} );
		},

		// find all visited && new comment's
		_checkItems: function()
		{
			var $items = $( this.s.info_panel );

			if( !this.$items || !this.$items.size() || !$items.size()
				|| ( this.$items.get( 0 ) !== $items.get( 0 ) ) )
			{
				this.position = -1;
				this.$items = $items;
			}

			// show undread new comments count
			this.$counter.text( Math.max( 0, $items.filter( '.' + this.c.def_new ).size() - 1 ) );

			return !!this.$items.size();
		},


		// slide button click event
		_slideClick: function( e )
		{
			var $button = $( e.currentTarget ),
				diff = $button.data('direction');

			if( this.$current )
			{
				this.$current.removeClass( this.c.active );
			}

			if( !this._checkItems() )
			{
				return;
			}

			// check new position
			this.position += diff;
			if( this.position < 0 )
			{
				this.position = this.$items.size() - 1;
			}
			else if( this.position >= this.$items.size() )
			{
				this.position = 0;
			}

			this.$current = this.$items.eq( this.position )
				.addClass( this.c.active )
				.removeClass( this.c.def_new )
				.addClass( this.c.visited );
			$.scrollTo( this.$current, '100' );
		},

		// click on "refresh" icon
		// extension need clear all cache and remove "trash"
		_refreshClick: function()
		{
			if( this.$items )
			{
				this.$items.removeClass( this.c.active + ' ' + this.c.visited );
			}
		}
	}

	if( w.location.href.indexOf( 'habrahabr.ru' ) > 0 )
	{
		d.addEventListener( 'DOMContentLoaded', function()
		{
			setTimeout( function(){ engine = new Engine(); }, 1500 );
		}, false );
	}
}( window );