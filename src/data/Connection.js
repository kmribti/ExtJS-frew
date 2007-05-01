/**
 * @class Ext.data.Connection
 * The class encapsulates a connection to the page's originating domain, allowing requests to be made
 * either to a configured URL, or to a URL specified at request time.<br>
 * <p>
 * Requests made by this class are asynchronous, and will return immediately. No data from
 * the server will be available to the statement immediately following the {@link #request} call.
 * To process returned data, use a callback in the request options object.
 * @constructor
 * @param config {Object} a configuration object.
 */
Ext.data.Connection = function(config){
    Ext.apply(this, config);
    this.addEvents({
        /**
         * @event beforerequest
         * Fires before a network request is made to retrieve a data object.
         * @param {Connection} conn This Connection object.
         * @param {Object} options The options config object passed to the {@link #request} method.
         */
        "beforerequest" : true,
        /**
         * @event requestcomplete
         * Fires before a network request is made to retrieve a data object.
         * @param {Connection} conn This Connection object.
         * @param {Object} response The XHR object containing the response data.
         * See http://www.w3.org/TR/XMLHttpRequest/ for details.
         * @param {Object} options The options config object passed to the {@link #request} method.
         */
        "requestcomplete" : true,
        /**
         * @event requestexception
         * Fires if an error HTTP status was returned from the server.
         * See http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html for details of HTTP status codes.
         * @param {Connection} conn This Connection object.
         * @param {Object} response The XHR object containing the response data.
         * See http://www.w3.org/TR/XMLHttpRequest/ for details.
         * @param {Object} options The options config object passed to the {@link #request} method.
         */
        "requestexception" : true
    });
    Ext.data.Connection.superclass.constructor.call(this);
};

Ext.extend(Ext.data.Connection, Ext.util.Observable, {
    /**
     * @cfg {String} url (Optional) The default URL to be used for requests to the server.
     */
    /**
     * @cfg {Object} extraParams (Optional) An object containing properties which are used as
     * extra parameters to each request made by this object.
     */
    /**
     * @cfg {String} method (Optional) The default HTTP method to be used for requests.
     */
    /**
     * @cfg  {Number} timeout (Optional) The timeout in milliseconds to be used for requests. Defaults
     * to 30000.
     */
    timeout : 30000,
    
    /**
     * Sends an HTTP request to a remote server.
     * @param {Object} options An object which may contain the following properties:<ul>
     * <li>url {String} (Optional) The URL to which to send the request. Defaults to configured URL</li>
     * <li>params {Object} (Optional) An object containing properties which are used as extra parameters to the request</li>
     * <li>method {String} (Optional) The HTTP method to use for the request. Defaults to the configured method, or
     * if no method was configured, "GET" if no parameters are being sent, and "POST" if parameters are being sent.</li>
     * <li>callback {Function} (Optional) The function to be called upon receipt of the HTTP response.
     * The callback is passed the following parameters:<ul>
     * <li>options {Object} The parameter to the request call.</li>
     * <li>success {Boolean} True if the request succeeded.</li>
     * <li>response {Object} The XMLHttpRequest object containing the response data.</li>
     * </ul></li>
     * <li>scope {Object} (Optional) The scope in which to execute the callback: The "this" object
     * for the callback function. Defaults to the browser window.</li>
     * </ul>
     */
    request : function(options){
        if(this.fireEvent("beforerequest", this, options) !== false){
            var p = options.params;
            if(typeof p == "object"){
                p = Ext.urlEncode(Ext.apply(options.params, this.extraParams));
            }
            var cb = {
                success: this.handleResponse,
                failure: this.handleFailure,
                scope: this,
        		argument: {options: options},
        		timeout : this.timeout
            };
            var method = options.method||this.method||(p ? "POST" : "GET");
            var url = options.url || this.url;
            if(this.autoAbort !== false){
                this.abort();
            }
            if(method == 'GET' && p){
                url += (url.indexOf('?') != -1 ? '&' : '?') + p;
                p = '';
            }
            this.transId = Ext.lib.Ajax.request(method, url, cb, p);
        }else{
            if(typeof options.callback == "function"){
                options.callback.call(options.scope||window, options, null, null);
            }
        }
    },

    /**
     * Determine whether this object has a request outstanding.
     * @return {Boolean} True if there is an outstanding request.
     */
    isLoading : function(){
        return this.transId ? true : false;  
    },

    /**
     * Aborts any outstanding request.
     */
    abort : function(){
        if(this.isLoading()){
            Ext.lib.Ajax.abort(this.transId);
        }
    },

    // private
    handleResponse : function(response){
        this.transId = false;
        var options = response.argument.options;
        this.fireEvent("requestcomplete", this, response, options);
        if(typeof options.callback == "function"){
            options.callback.call(options.scope||window, options, true, response);
        }
    },

    // private
    handleFailure : function(response, e){
        this.transId = false;
        var options = response.argument.options;
        this.fireEvent("requestexception", this, response, options, e);
        if(typeof options.callback == "function"){
            options.callback.call(options.scope||window, options, false, response);
        }
    }
});