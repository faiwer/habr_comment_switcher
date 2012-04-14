// ==UserScript==
// @include http://habrahabr.ru/*
// ==/UserScript==

+function( w )
{
	var d = w.document,
		$ = d.querySelector.bind( d ),
		$$ = d.querySelectorAll.bind( d ),
		test_mode = false;

	var Engine = function(){ this._init(); }
	Engine.prototype =
	{
		_init: function()
		{
			this._initConst();
			if( this._prepareSlider() )
			{
				this._cssInject();
				this._observe();
			}
		},

		_initConst: function()
		{
			this._extend( this,
			{
				s: { // selectors
					slider: '#xpanel',
					info_panel: test_mode ? '.comment_item > .info' : '.comment_item > .info.is_new',
				},
				c: { // classes
					active: '__hcsc_active'
				},
				css: [
					'.__hcsc_button { border-top: 1px solid white; line-height: 22px; height: 22px; ' +
					'cursor: pointer; }',
					'.__hcsc_button:hover { color: white; }',
					'.info.__hcsc_active { outline: 2px solid #222; }',
				],
				elem:
				{
					button: {
						tagName: 'div',
						attr: { 'class': '__hcsc_button', 'unselectable': 'on' },
					},
					style_inject: {
						tagName: 'style',
						attr: { id: '__habr_comment_switcher_css' }
					}
				}
			} );
		},

		_extend: function( object, extend )
		{
			for( var name in extend ) if( extend.hasOwnProperty( name ) )
			{
				object[ name ] = extend[ name ];
			}
		},

		_cssInject: function()
		{
			var style = this._createElem( this.elem.style_inject ),
				text = '';
			for( var i = 0, n = this.css.length; i < n; ++ i )
			{
				text += this.css[ i ];
			}
			style.innerHTML = text;
			d.head.appendChild( style );
		},

		_createElem: function( data )
		{
			var item = d.createElement( data.tagName );

			if( data.attr )
			{
				for( var rule in data.attr )
				{
					item.setAttribute( rule, data.attr[ rule ] );
				}
			}

			return item;
		},

		_prepareSlider: function()
		{
			var slider = $( this.s.slider );
			if( !slider )
			{
				return false;
			}

			this.up_button = this._createElem( this.elem.button );
			this.up_button.innerHTML = '▲';
			slider.appendChild( this.up_button );

			this.down_button = this._createElem( this.elem.button );
			this.down_button.innerHTML = '▼';
			slider.appendChild( this.down_button );

			return true;
		},

		_observe: function()
		{
			this.up_button.addEventListener( 'click', this._slideClick.bind( this, -1 ), false );
			this.down_button.addEventListener( 'click', this._slideClick.bind( this, +1 ), false );
		},

		_checkItems: function()
		{
			var items = $$( this.s.info_panel );

			if( !this.items || !this.items.length || !items.length || ( this.items[ 0 ] !== items[ 0 ] ) )
			{
				this.position = -1;
				this.items = items;
			}

			return this.items;
		},

		_slideClick: function( diff )
		{
			if( this.current )
			{
				this.current.classList.remove( this.c.active );
			}

			if( !this._checkItems().length )
			{
				return;
			}

			this.position += diff;
			if( this.position < 0 )
			{
				this.position = this.items.length - 1;
			}
			else if( this.position >= this.items.length )
			{
				this.position = 0;
			}

			this.current = this.items[ this.position ];
			this.current.scrollIntoView( true );
			this.current.classList.add( this.c.active );
		}
	}

	if( w.location.href.indexOf( 'habrahabr.ru' ) > 0 )
	{
		var engine = false;
		d.addEventListener( 'DOMContentLoaded', function()
		{
			setTimeout( function(){ engine = new Engine(); }, 1500 );
		}, false );
	}
}( window );