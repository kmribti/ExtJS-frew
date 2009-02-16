Ext.applyIf(Ext.util.Observable.prototype, function(){
	// this is considered experimental (along with beforeMethod, afterMethod, removeMethodListener?)
    // allows for easier interceptor and sequences, including cancelling and overwriting the return value of the call
    // private
    function getMethodEvent(method) {
	    var e = (this.methodEvents = this.methodEvents || {})[method],
	    	returnValue, 
	    	v, 
	    	cancel,
            obj = this;        
       
        if(!e){            
            this.methodEvents[method] = e = {};
            e.originalFn = this[method];
            e.methodName = method;
            e.before = [];
            e.after = [];            

            function makeCall(fn, scope, args){
                if(!Ext.isEmpty(v = fn.apply(scope || obj, args))){
                    if (Ext.isObject(v)) {
	                    returnValue = !Ext.isEmpty(v.returnValue) ? v.returnValue : v;                        
	                    cancel = !!v.cancel;
                    } else if (v === false) {
                        cancel = true;
                    } else {
                        returnValue = v;
                    }
                }
            }

            this[method] = function(){
	            var args = Ext.toArray(arguments);
                returnValue = v = undefined; 
                cancel = false;
                
	            Ext.each(e.before, function(b) {
                    makeCall(b.fn, b.scope, args);
                    if(cancel){
                        return returnValue;
                    }
                });

                if(!Ext.isEmpty(v = e.originalFn.apply(obj, args))){
                    returnValue = v;
                }                
	            Ext.each(e.after, function(a) {
                    makeCall(a.fn, a.scope, args);
                    if(cancel){
                        return returnValue;
                    }
                });
                return returnValue;
            };
        }
        return e;
    } 
	
	
	return {
		// these are considered experimental
    	// allows for easier interceptor and sequences, including cancelling and overwriting the return value of the call
	    // adds an "interceptor" called before the original method
	    beforeMethod : function(method, fn, scope){        
	        getMethodEvent.call(this, method).before.push({fn: fn, scope: scope});
	    },
	
	    // adds a "sequence" called after the original method
	    afterMethod : function(method, fn, scope){        
	        getMethodEvent.call(this, method).after.push({fn: fn, scope: scope});
	    },
	
	    removeMethodListener : function(method, fn, scope){
	        var e = getMethodEvent.call(this, method),
	        	found = false;        
		    Ext.each(e.before, function(b) {
	            if(b.fn == fn && b.scope == scope){
	                b.splice(i, 1);
	                found = true;
	                return false;
	            }
	        });
	        if (!found) {
		        Ext.each(e.after, function(a) {
		            if(a.fn == fn && a.scope == scope){
		                a.splice(i, 1);
		                return false;
		            }
		        });
	        }
	    },
	    
	    /**
	     * Relays selected events from the specified Observable as if the events were fired by <tt><b>this</b></tt>.
	     * @param {Object} o The Observable whose events this object is to relay.
	     * @param {Array} events Array of event names to relay.
	     */
	    relayEvents : function(o, events){
		    var me = this;
	        function createHandler(ename){
	            return function(){
	                return me.fireEvent.apply(me, [ename].concat(Ext.toArray(arguments)));
	            };
	        };        
		    Ext.each(events, function(ename) {                            
	            me.events[ename] = !me.events[ename];
	            o.on(ename, createHandler(ename), me);
	        });
	    }
	}
}());


/**
 * Starts capture on the specified Observable. All events will be passed
 * to the supplied function with the event name + standard signature of the event
 * <b>before</b> the event is fired. If the supplied function returns false,
 * the event will not fire.
 * @param {Observable} o The Observable to capture
 * @param {Function} fn The function to call
 * @param {Object} scope (optional) The scope (this object) for the fn
 * @static
 */
Ext.util.Observable.capture = function(o, fn, scope){
    o.fireEvent = o.fireEvent.createInterceptor(fn, scope);
};