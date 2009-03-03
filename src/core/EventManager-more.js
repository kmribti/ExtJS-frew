Ext.apply(Ext.EventManager, function(){
	var resizeEvent, 
    	resizeTask, 
    	textEvent, 
    	textSize,
    	D = Ext.lib.Dom,
    	E = Ext.lib.Event,
    	propRe = /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate)$/;
    
    /// There is some jquery work around stuff here that isn't needed in Ext Core.
    function addListener(el, ename, fn, wrap, scope){	    
        var id = Ext.id(el),
        	es = Ext.EventManager.elHash[id] = Ext.EventManager.elHash[id] || {};        	
       
        (es[ename] = es[ename] || []).push([fn, wrap, scope]);
        E.on(el, ename, wrap);

        if(ename == "mousewheel" && el.addEventListener){ // workaround for jQuery
        	var args = ["DOMMouseScroll", wrap, false];
        	el.addEventListener.apply(el, args);
            E.on(window, 'unload', function(){
	            el.removeEventListener.apply(el, args);                
            });
        }
        if(ename == "mousedown" && el == document){ // fix stopped mousedowns on the document
            Ext.EventManager.stoppedMouseDownEvent.addListener(wrap);
        }
    }
    
    function createBuffered(h, o){
        var task = new Ext.util.DelayedTask(h);
        return function(e){
            // create new event object impl so new events don't wipe out properties            
            task.delay(o.buffer, h, null, [new Ext.EventObjectImpl(e)]);
        };
    };

    function createSingle(h, el, ename, fn, scope){
        return function(e){
            Ext.EventManager.removeListener(el, ename, fn, scope);
            h(e);
        };
    };

    function createDelayed(h, o){
        return function(e){
            // create new event object impl so new events don't wipe out properties   
            e = new Ext.EventObjectImpl(e);
            setTimeout(function(){
                h(e);
            }, o.delay || 10);
        };
    };
    
    /// this is here because the private addListerner needs to rebind (There is some jquery work around stuff there that isn't needed in Ext Core).	
	function listen(element, ename, opt, fn, scope){
        var o = !Ext.isObject(opt) ? {} : opt,
        	el = Ext.getDom(element);
        	
        fn = fn || o.fn; 
        scope = scope || o.scope;
        
        if(!el){
            throw "Error listening for \"" + ename + '\". Element "' + element + '" doesn\'t exist.';
        }
        function h(e){
            // prevent errors while unload occurring
            if(!Ext){// !window[xname]){  ==> can't we do this? 
                return;
            }
            e = Ext.EventObject.setEvent(e);
            var t;
            if (o.delegate) {
                if(!(t = e.getTarget(o.delegate, el))){
                    return;
                }
            } else {
                t = e.target;
            }            
            if (o.stopEvent) {
                e.stopEvent();
            }
            if (o.preventDefault) {
               e.preventDefault();
            }
            if (o.stopPropagation) {
                e.stopPropagation();
            }
            if (o.normalized) {
                e = e.browserEvent;
            }

            fn.call(scope || el, e, t, o);
        };
        if(o.target){
            h = createTargeted(h, o);
        }
        if(o.delay){
            h = createDelayed(h, o);
        }
        if(o.single){
            h = createSingle(h, el, ename, fn, scope);
        }
        if(o.buffer){
            h = createBuffered(h, o);
        }

        addListener(el, ename, fn, h, scope);
        return h;
    };  
      	
	return { 
		/// this is here because the private addListerner needs to rebind (There is some jquery work around stuff there that isn't needed in Ext Core).
		addListener : function(element, eventName, fn, scope, options){		     		     		     
            if(Ext.isObject(eventName)){                
	            var o = eventName, e, val;
                for(e in o){
	                val = o[e];
                    if(!propRe.test(e)){                            		         
	                    if(Ext.isFunction(val)){
	                        // shared options
	                        listen(element, e, o, val, o.scope);
	                    }else{
	                        // individual options
	                        listen(element, e, val);
	                    }
                    }
                }
            } else {
            	listen(element, eventName, options, fn, scope);
        	}
        },
        
        /**
         * Removes an event handler from an element.  The shorthand version {@link #un} is equivalent.  Typically
         * you will use {@link Ext.Element#removeListener} directly on an Element in favor of calling this version.
         * @param {String/HTMLElement} el The id or html element from which to remove the event
         * @param {String} eventName The type of event
         * @param {Function} fn The handler function to remove
         */
        removeListener : function(element, eventName, fn, scope){            
	        var id = Ext.id(el = Ext.getDom(element)),
	        	wrap;        
	        
	        Ext.each((Ext.EventManager.elHash[id] || {})[eventName], function (v,i,a) {
			    if (Ext.isArray(v) && v[0] == fn && (!scope || v[2] == scope)) {		        			        
			        E.un(el, eventName, wrap = v[1]);
			        a.splice(i,1);
			        return false;			        
		        }
	        });	
	        
	        if(eventName == "mousewheel" && el.addEventListener && wrap){
	            el.removeEventListener("DOMMouseScroll", wrap, false);
	        }
	        if(eventName == "mousedown" && el == document && wrap){ // fix stopped mousedowns on the document
	            Ext.EventManager.stoppedMouseDownEvent.removeListener(wrap);
	        }
        },
		   	
		// private
	    doResizeEvent: function(){
	        resizeEvent.fire(D.getViewWidth(), D.getViewHeight());
	    },
	    
	    /**
	     * Fires when the window is resized and provides resize event buffering (50 milliseconds), passes new viewport width and height to handlers.
	     * @param {Function} fn        The method the event invokes
	     * @param {Object}   scope    An object that becomes the scope of the handler
	     * @param {boolean}  options
	     */
	    onWindowResize : function(fn, scope, options){
	        if(!resizeEvent){
	            resizeEvent = new Ext.util.Event();
	            resizeTask = new Ext.util.DelayedTask(this.doResizeEvent);
	            E.on(window, "resize", this.fireWindowResize, this);
	        }
	        resizeEvent.addListener(fn, scope, options);
	    },
	
	    // exposed only to allow manual firing
	    fireWindowResize : function(){
	        if(resizeEvent){
	            if((Ext.isIE||Ext.isAir) && resizeTask){
	                resizeTask.delay(50);
	            }else{
	                resizeEvent.fire(D.getViewWidth(), D.getViewHeight());
	            }
	        }
	    },
	
	    /**
	     * Fires when the user changes the active text size. Handler gets called with 2 params, the old size and the new size.
	     * @param {Function} fn        The method the event invokes
	     * @param {Object}   scope    An object that becomes the scope of the handler
	     * @param {boolean}  options
	     */
	    onTextResize : function(fn, scope, options){
	        if(!textEvent){
	            textEvent = new Ext.util.Event();
	            var textEl = new Ext.Element(document.createElement('div'));
	            textEl.dom.className = 'x-text-resize';
	            textEl.dom.innerHTML = 'X';
	            textEl.appendTo(document.body);
	            textSize = textEl.dom.offsetHeight;
	            setInterval(function(){
	                if(textEl.dom.offsetHeight != textSize){
	                    textEvent.fire(textSize, textSize = textEl.dom.offsetHeight);
	                }
	            }, this.textResizeInterval);
	        }
	        textEvent.addListener(fn, scope, options);
	    },
	
	    /**
	     * Removes the passed window resize listener.
	     * @param {Function} fn        The method the event invokes
	     * @param {Object}   scope    The scope of handler
	     */
	    removeResizeListener : function(fn, scope){
	        if(resizeEvent){
	            resizeEvent.removeListener(fn, scope);
	        }
	    },
	
	    // private
	    fireResize : function(){
	        if(resizeEvent){
	            resizeEvent.fire(D.getViewWidth(), D.getViewHeight());
	        }
	    },
	    
	     /**
	     * The frequency, in milliseconds, to check for text resize events (defaults to 50)
	     */
	    textResizeInterval : 50,
	    
	    /**
         * Url used for onDocumentReady with using SSL (defaults to Ext.SSL_SECURE_URL)
         */
        ieDeferSrc : false   
    }
}());

Ext.EventManager.on = Ext.EventManager.addListener;

//Initialize doc classes
(function(){
    var initExtCss = function(){
        // find the body element
        var bd = document.body || document.getElementsByTagName('body')[0];
        if(!bd){ return false; }
        var cls = [' ',
                Ext.isIE ? "ext-ie " + (Ext.isIE6 ? 'ext-ie6' : (Ext.isIE7 ? 'ext-ie7' : 'ext-ie8'))
                : Ext.isGecko ? "ext-gecko " + (Ext.isGecko2 ? 'ext-gecko2' : 'ext-gecko3')
                : Ext.isOpera ? "ext-opera"
                : Ext.isSafari ? "ext-safari"
                : Ext.isChrome ? "ext-chrome" : ""];

        if(Ext.isMac){
            cls.push("ext-mac");
        }
        if(Ext.isLinux){
            cls.push("ext-linux");
        }
        if(Ext.isBorderBox){
            cls.push('ext-border-box');
        }
        if(Ext.isStrict){ // add to the parent to allow for selectors like ".ext-strict .ext-ie"
            var p = bd.parentNode;
            if(p){
                p.className += ' ext-strict';
            }
        }
        bd.className += cls.join(' ');
        return true;
    }

    if(!initExtCss()){
        Ext.onReady(initExtCss);
    }
})();


Ext.apply(Ext.EventObjectImpl.prototype, {
    /** Key constant @type Number */
    BACKSPACE: 8,
    /** Key constant @type Number */
    TAB: 9,
    /** Key constant @type Number */
    NUM_CENTER: 12,
    /** Key constant @type Number */
    ENTER: 13,
    /** Key constant @type Number */
    RETURN: 13,
    /** Key constant @type Number */
    SHIFT: 16,
    /** Key constant @type Number */
    CTRL: 17,
    CONTROL : 17, // legacy
    /** Key constant @type Number */
    ALT: 18,
    /** Key constant @type Number */
    PAUSE: 19,
    /** Key constant @type Number */
    CAPS_LOCK: 20,
    /** Key constant @type Number */
    ESC: 27,
    /** Key constant @type Number */
    SPACE: 32,
    /** Key constant @type Number */
    PAGE_UP: 33,
    PAGEUP : 33, // legacy
    /** Key constant @type Number */
    PAGE_DOWN: 34,
    PAGEDOWN : 34, // legacy
    /** Key constant @type Number */
    END: 35,
    /** Key constant @type Number */
    HOME: 36,
    /** Key constant @type Number */
    LEFT: 37,
    /** Key constant @type Number */
    UP: 38,
    /** Key constant @type Number */
    RIGHT: 39,
    /** Key constant @type Number */
    DOWN: 40,
    /** Key constant @type Number */
    PRINT_SCREEN: 44,
    /** Key constant @type Number */
    INSERT: 45,
    /** Key constant @type Number */
    DELETE: 46,
    /** Key constant @type Number */
    ZERO: 48,
    /** Key constant @type Number */
    ONE: 49,
    /** Key constant @type Number */
    TWO: 50,
    /** Key constant @type Number */
    THREE: 51,
    /** Key constant @type Number */
    FOUR: 52,
    /** Key constant @type Number */
    FIVE: 53,
    /** Key constant @type Number */
    SIX: 54,
    /** Key constant @type Number */
    SEVEN: 55,
    /** Key constant @type Number */
    EIGHT: 56,
    /** Key constant @type Number */
    NINE: 57,
    /** Key constant @type Number */
    A: 65,
    /** Key constant @type Number */
    B: 66,
    /** Key constant @type Number */
    C: 67,
    /** Key constant @type Number */
    D: 68,
    /** Key constant @type Number */
    E: 69,
    /** Key constant @type Number */
    F: 70,
    /** Key constant @type Number */
    G: 71,
    /** Key constant @type Number */
    H: 72,
    /** Key constant @type Number */
    I: 73,
    /** Key constant @type Number */
    J: 74,
    /** Key constant @type Number */
    K: 75,
    /** Key constant @type Number */
    L: 76,
    /** Key constant @type Number */
    M: 77,
    /** Key constant @type Number */
    N: 78,
    /** Key constant @type Number */
    O: 79,
    /** Key constant @type Number */
    P: 80,
    /** Key constant @type Number */
    Q: 81,
    /** Key constant @type Number */
    R: 82,
    /** Key constant @type Number */
    S: 83,
    /** Key constant @type Number */
    T: 84,
    /** Key constant @type Number */
    U: 85,
    /** Key constant @type Number */
    V: 86,
    /** Key constant @type Number */
    W: 87,
    /** Key constant @type Number */
    X: 88,
    /** Key constant @type Number */
    Y: 89,
    /** Key constant @type Number */
    Z: 90,
    /** Key constant @type Number */
    CONTEXT_MENU: 93,
    /** Key constant @type Number */
    NUM_ZERO: 96,
    /** Key constant @type Number */
    NUM_ONE: 97,
    /** Key constant @type Number */
    NUM_TWO: 98,
    /** Key constant @type Number */
    NUM_THREE: 99,
    /** Key constant @type Number */
    NUM_FOUR: 100,
    /** Key constant @type Number */
    NUM_FIVE: 101,
    /** Key constant @type Number */
    NUM_SIX: 102,
    /** Key constant @type Number */
    NUM_SEVEN: 103,
    /** Key constant @type Number */
    NUM_EIGHT: 104,
    /** Key constant @type Number */
    NUM_NINE: 105,
    /** Key constant @type Number */
    NUM_MULTIPLY: 106,
    /** Key constant @type Number */
    NUM_PLUS: 107,
    /** Key constant @type Number */
    NUM_MINUS: 109,
    /** Key constant @type Number */
    NUM_PERIOD: 110,
    /** Key constant @type Number */
    NUM_DIVISION: 111,
    /** Key constant @type Number */
    F1: 112,
    /** Key constant @type Number */
    F2: 113,
    /** Key constant @type Number */
    F3: 114,
    /** Key constant @type Number */
    F4: 115,
    /** Key constant @type Number */
    F5: 116,
    /** Key constant @type Number */
    F6: 117,
    /** Key constant @type Number */
    F7: 118,
    /** Key constant @type Number */
    F8: 119,
    /** Key constant @type Number */
    F9: 120,
    /** Key constant @type Number */
    F10: 121,
    /** Key constant @type Number */
    F11: 122,
    /** Key constant @type Number */
    F12: 123,	
    
    /** @private */
    isNavKeyPress : function(){
        var me = this,
        	k = me.keyCode;
        k = Ext.isSafari ? (safariKeys[k] || k) : k;
        return (k >= 33 && k <= 40) || k == me.RETURN || k == me.TAB || k == me.ESC;
    },

    isSpecialKey : function(){
        var k = this.keyCode;
        return (this.type == 'keypress' && 
        		this.ctrlKey) ||
        		k == 9 || 
        		k == 13  || 
        		k == 40 || 
        		k == 27 ||
	            (k == 16) || 
	            (k == 17) ||
	            (k >= 18 && k <= 20) ||
	            (k >= 33 && k <= 35) ||
	            (k >= 36 && k <= 39) ||
	            (k >= 44 && k <= 45);
    },
	
	getPoint : function(){
	    return new Ext.lib.Point(this.xy[0], this.xy[1]);
	},

	/**
	 * Returns true if the target of this event is a child of el.  Unless the allowEl parameter is set, it will return false if if the target is el.
	 * Example usage:<pre><code>
	// Handle click on any child of an element
	Ext.getBody().on('click', function(e){
	    if(e.within('some-el')){
	        alert('Clicked on a child of some-el!');
	    }
	});
	
	// Handle click directly on an element, ignoring clicks on child nodes
	Ext.getBody().on('click', function(e,t){
	    if((t.id == 'some-el') && !e.within(t, true)){
	        alert('Clicked directly on some-el!');
	    }
	});
	</code></pre>
	 * @param {Mixed} el The id, DOM element or Ext.Element to check
	 * @param {Boolean} related (optional) true to test if the related target is within el instead of the target
	 * @param {Boolean} allowEl {optional} true to also check if the passed element is the target or related target
	 * @return {Boolean}
	 */
	within : function(el, related, allowEl){
	    var t = this[related ? "getRelatedTarget" : "getTarget"]();
	    return t && ((allowEl ? (t == Ext.getDom(el)) : false) || Ext.fly(el).contains(t));
	},	

    /**
     * Returns true if the control, meta, shift or alt key was pressed during this event.
     * @return {Boolean}
     */
    hasModifier : function(){
        return ((this.ctrlKey || this.altKey) || this.shiftKey);
    }
});