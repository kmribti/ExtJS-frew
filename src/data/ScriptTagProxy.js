/**
 * An implementation of Ext.data.DataProxy that reads 
 * <p>
 * <em>Note that this class cannot be used to retrieve data from a domain other than the domain
 * from which the running page was served.
 * <p>
 * For cross-domain access to remote data, use an Ext.data.ScriptTagProxy.
 * </em>
 * @cfg {String} url The url from which to request the data object.
 * @cfg {Number} timeout (Optional) The number of milliseconds to wait for a response. Defaults to 30 seconds.
 * @cfg {String} callbackParam (Optional) The name of the parameter to pass to the server which tells
 * the server the name of the callback function set up by the load call to process the returned data object.
 * Defaults to "callback".<p>The server-side processing must read this parameter value, and generate
 * javascript output which calls this named function passing the data object as its only parameter.
 * @cfg nocache {Boolean} (Optional) Defaults to true. Disable cacheing by adding a uniqque parameter name
 * to the request.
 * @constructor
 * @param {Object} conn An Ext.data.Connection object referencing the URL from which the data object
 * is to be read, or a configuration object for an {@link Ext.data.Connection}.
 */
Ext.data.ScriptTagProxy = function(config){
    Ext.data.ScriptTagProxy.superclass.constructor.call(this);
    Ext.apply(this, config);
    this.head = document.getElementsByTagName("head")[0];
};

Ext.data.ScriptTagProxy.TRANS_ID = 1000;

Ext.extend(Ext.data.ScriptTagProxy, Ext.data.DataProxy, {
    timeout : 30000,
    callbackParam : "callback",
    nocache : true,
    
    /**
     * Load data from the configured URL, read the data object into
     * a block of Ext.data.Records using the passed Ext.data.DataReader implementation, and
     * process that block using the passed callback.
     * @param {Object} params This parameter is not used by the MemoryProxy class.
     * @param {Ext.data.DataReader} reader The Reader object which converts the data
     * object into a block of Ext.data.Records.
     * @param {Function} callback The function into which to pass the block of Ext.data.records.
     * The function must be passed <ul>
     * <li>The Record block object</li>
     * <li>The "arg" argument from the load function</li>
     * <li>A boolean success indicator</li>
     * </ul>
     * @param {Object} scope The scope in which to call the callback
     * @param {Object} arg An optional argument which is passed to the callback as its second parameter.
     */
    load : function(params, reader, callback, scope, arg){
        if(this.fireEvent("beforeload", this, params) !== false){
            
            var p = Ext.urlEncode(Ext.apply(params, this.extraParams));
            
            var url = this.url;
            url += (url.indexOf("?") != -1 ? "&" : "?") + p;
            if(this.nocache){
                url += "&_dc=" + (new Date().getTime());
            }
            var transId = ++Ext.data.ScriptTagProxy.TRANS_ID;
            var trans = {
                id : transId,
                cb : "stcCallback"+transId,
                scriptId : "stcScript"+transId,
                params : params,
                arg : arg,
                url : url,
                callback : callback,
                scope : scope,
                reader : reader
            };
            var conn = this;
            
            window[trans.cb] = function(o){
                conn.handleResponse(o, trans);
            };
            
            url += String.format("&{0}={1}", this.callbackParam, trans.cb);
            
            if(this.autoAbort !== false){
                this.abort();
            }
            
            trans.timeoutId = this.handleFailure.defer(this.timeout, this, [trans]);
            
            var script = document.createElement("script");
            script.setAttribute("src", url);
            script.setAttribute("type", "text/javascript");
            script.setAttribute("id", trans.scriptId);
            this.head.appendChild(script);
            
            this.trans = trans;
        }else{
            callback.call(scope||this, null, arg, false);
        }
    },

    // private
    isLoading : function(){
        return this.trans ? true : false;  
    },

    /**
     * Abort the current server request.
     */
    abort : function(){
        if(this.isLoading()){
            this.destroyTrans(this.trans);
        }
    },
    
    // private
    destroyTrans : function(trans, isLoaded){
        this.head.removeChild(document.getElementById(trans.scriptId));
        clearTimeout(trans.timeoutId);
        if(isLoaded){
            window[trans.cb] = undefined;
            try{
                delete window[trans.cb];
            }catch(e){}
        }else{
            // if hasn't been loaded, wait for load to remove it to prevent script error
            window[trans.cb] = function(){
                window[trans.cb] = undefined;
                try{
                    delete window[trans.cb];
                }catch(e){}
            }; 
        }
    },
    
    // private
    handleResponse : function(o, trans){
        this.trans = false;
        this.destroyTrans(trans, true);
        var result;
        try {
            result = trans.reader.readRecords(o);
        }catch(e){
            this.fireEvent("loadexception", this, o, trans.arg, e);
            trans.callback.call(trans.scope||window, null, trans.arg, false);
            return;
        }
        this.fireEvent("load", this, o, trans.arg);
        trans.callback.call(trans.scope||window, result, trans.arg, true);
    },
    
    // private
    handleFailure : function(trans){
        this.trans = false;
        this.destroyTrans(trans, false);
        this.fireEvent("loadexception", this, null, trans.arg);
        trans.callback.call(trans.scope||window, null, trans.arg, false);
    }
});