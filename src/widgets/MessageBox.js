/**
 * @class Ext.MessageBox
 * Utility class for generating different styles of message boxes.  The alias Ext.Msg can also be used.
 * @singleton
 */
Ext.MessageBox = function(){
    var dlg, opt, mask, waitTimer;
    var bodyEl, msgEl, textboxEl, textareaEl, progressEl, pp;
    var buttons, activeTextEl, bwidth;

    // private
    var handleButton = function(button){
        dlg.hide();
        Ext.callback(opt.fn, opt.scope||window, [button, activeTextEl.dom.value], 1);
    };

    // private
    var handleHide = function(){
        if(opt && opt.cls){
            dlg.el.removeClass(opt.cls);
        }
        if(waitTimer){
            Ext.TaskMgr.stop(waitTimer);
            waitTimer = null;
        }
    };

    // private
    var updateButtons = function(b){
        var width = 0;
        if(!b){
            buttons["ok"].hide();
            buttons["cancel"].hide();
            buttons["yes"].hide();
            buttons["no"].hide();
            dlg.footer.dom.style.display = 'none';
            return width;
        }
        dlg.footer.dom.style.display = '';
        for(var k in buttons){
            if(typeof buttons[k] != "function"){
                if(b[k]){
                    buttons[k].show();
                    buttons[k].setText(typeof b[k] == "string" ? b[k] : Ext.MessageBox.buttonText[k]);
                    width += buttons[k].el.getWidth()+15;
                }else{
                    buttons[k].hide();
                }
            }
        }
        return width;
    };

    // private
    var handleEsc = function(d, k, e){
        if(opt && opt.closable !== false){
            dlg.hide();
        }
        if(e){
            e.stopEvent();
        }
    };

    return {
        /**
         * Returns a reference to the underlying {@link Ext.BasicDialog} element
         * @return {Ext.BasicDialog} dialog The BasicDialog element
         */
        getDialog : function(){
           if(!dlg){
                dlg = new Ext.BasicDialog("x-msg-box", {
                    autoCreate : true,
                    shadow: true,
                    draggable: true,
                    resizable:false,
                    constraintoviewport:false,
                    fixedcenter:true,
                    collapsible : false,
                    shim:true,
                    modal: true,
                    width:400, height:100,
                    buttonAlign:"center",
                    closeClick : function(){
                        if(opt && opt.buttons && opt.buttons.no && !opt.buttons.cancel){
                            handleButton("no");
                        }else{
                            handleButton("cancel");
                        }
                    }
                });
                dlg.on("hide", handleHide);
                mask = dlg.mask;
                dlg.addKeyListener(27, handleEsc);
                buttons = {};
                var bt = this.buttonText;
                buttons["ok"] = dlg.addButton(bt["ok"], handleButton.createCallback("ok"));
                buttons["yes"] = dlg.addButton(bt["yes"], handleButton.createCallback("yes"));
                buttons["no"] = dlg.addButton(bt["no"], handleButton.createCallback("no"));
                buttons["cancel"] = dlg.addButton(bt["cancel"], handleButton.createCallback("cancel"));
                bodyEl = dlg.body.createChild({
                    tag:"div",
                    html:'<span class="ext-mb-text"></span><br /><input type="text" class="ext-mb-input"><textarea class="ext-mb-textarea"></textarea><div class="ext-mb-progress-wrap"><div class="ext-mb-progress"><div class="ext-mb-progress-bar">&#160;</div></div></div>'
                });
                msgEl = bodyEl.dom.firstChild;
                textboxEl = Ext.get(bodyEl.dom.childNodes[2]);
                textboxEl.enableDisplayMode();
                textboxEl.addKeyListener([10,13], function(){
                    if(dlg.isVisible() && opt && opt.buttons){
                        if(opt.buttons.ok){
                            handleButton("ok");
                        }else if(opt.buttons.yes){
                            handleButton("yes");
                        }
                    }
                });
                textareaEl = Ext.get(bodyEl.dom.childNodes[3]);
                textareaEl.enableDisplayMode();
                progressEl = Ext.get(bodyEl.dom.childNodes[4]);
                progressEl.enableDisplayMode();
                var pf = progressEl.dom.firstChild;
                pp = Ext.get(pf.firstChild);
                pp.setHeight(pf.offsetHeight);
            }
            return dlg;
        },

        /**
         * Updates the message box body text
         * @param {String} text Replaces the message box element's innerHTML with the specified string (defaults to
         * the XHTML-compliant non-breaking space character &#160;)
         * @return {Ext.MessageBox} messageBox This message box
         */
        updateText : function(text){
            if(!dlg.isVisible() && !opt.width){
                dlg.resizeTo(this.maxWidth, 100); // resize first so content is never clipped from previous shows
            }
            msgEl.innerHTML = text || '&#160;';
            var w = Math.max(Math.min(opt.width || msgEl.offsetWidth, this.maxWidth), 
                        Math.max(opt.minWidth || this.minWidth, bwidth));
            if(opt.prompt){
                activeTextEl.setWidth(w);
            }
            if(dlg.isVisible()){
                dlg.fixedcenter = false;
            }
            dlg.setContentSize(w, bodyEl.getHeight());
            if(dlg.isVisible()){
                dlg.fixedcenter = true;
            }
            return this;
        },

        /**
         * Updates a progress-style message box's text and progress bar.  Only relevant on message boxes
         * initiated via {@link Ext.MessageBox#progress}.
         * @param {Number} value Any number between 0 and 1 (e.g., .5)
         * @param {String} text If defined, the message box's body text is replaced with the specified string (defaults to undefined)
         * @return {Ext.MessageBox} messageBox This message box
         */
        updateProgress : function(value, text){
            if(text){
                this.updateText(text);
            }
            pp.setWidth(Math.floor(value*progressEl.dom.firstChild.offsetWidth));
            return this;
        },        

        /**
         * Returns true if the message box is currently displayed
         * @return {Boolean} isVisible True if the message box is visible, else false
         */
        isVisible : function(){
            return dlg && dlg.isVisible();  
        },

        /**
         * Hides the message box if it is displayed
         */
        hide : function(){
            if(this.isVisible()){
                dlg.hide();
            }  
        },

        /**
         * Displays a new message box, or reinitializes an existing message box, based on the config options
         * passed in.  The following config object properties are supported:
         * <ul style="padding:5px;padding-left:16px;">
	     * <li>title - The title text</li>
	     * <li>closable - True to display the top-right close box, else false</li>
	     * <li>prompt - True to prompt the user to enter single-line text, else false</li>
	     * <li>multiline - True to prompt the user to enter multi-line text, else false</li>
	     * <li>progress - True to display a progress bar, else false</li>
	     * <li>value - The string value to set into the active textbox element</li>
	     * <li>buttons - A button config object (e.g., Ext.MessageBox.OKCANCEL)</li>
	     * <li>msg - A string that will replace the existing message box body text</li>
	     * <li>cls - A custom CSS class to apply to the message box element</li>
	     * <li>proxyDrag - True to display a lightweight proxy element while dragging, else false</li>
	     * <li>modal - True to disable user interaction with the page while the message box is visible, else false</li>
	     * </ul>
         * @param {Object} config Configuration options
         * @return {Ext.MessageBox} messageBox This message box
         */
        show : function(options){
            if(this.isVisible()){
                this.hide();
            }
            var d = this.getDialog();
            opt = options;
            d.setTitle(opt.title || "&#160;");
            d.close.setDisplayed(opt.closable !== false);
            activeTextEl = textboxEl;
            opt.prompt = opt.prompt || (opt.multiline ? true : false);
            if(opt.prompt){
                if(opt.multiline){
                    textboxEl.hide();
                    textareaEl.show();
                    textareaEl.setHeight(typeof opt.multiline == "number" ?
                        opt.multiline : this.defaultTextHeight);
                    activeTextEl = textareaEl;
                }else{
                    textboxEl.show();
                    textareaEl.hide();
                }
            }else{
                textboxEl.hide();
                textareaEl.hide();
            }
            progressEl.setDisplayed(opt.progress === true);
            this.updateProgress(0);
            activeTextEl.dom.value = opt.value || "";
            if(opt.prompt){
                dlg.setDefaultButton(activeTextEl);
            }else{
                var bs = opt.buttons;
                var db = null;
                if(bs && bs.ok){
                    db = buttons["ok"];
                }else if(bs && bs.yes){
                    db = buttons["yes"];
                }
                dlg.setDefaultButton(db);
            }
            bwidth = updateButtons(opt.buttons);
            this.updateText(opt.msg);
            if(opt.cls){
                d.el.addClass(opt.cls);
            }
            d.proxyDrag = opt.proxyDrag === true;
            d.modal = opt.modal !== false;
            d.mask = opt.modal !== false ? mask : false;
            if(!d.isVisible()){
                // force it to the end of the z-index stack so it gets a cursor in FF
                document.body.appendChild(dlg.el.dom);
                d.animateTarget = null;
                d.show(options.animEl);
            }
            return this;
        },

        /**
         * Displays a message box with a progress bar.  This message box has no buttons and is not closeable by
         * the user.  You are responsible for updating the progress bar as needed via {@link Ext.MessageBox#updateProgress}
         * and closing the message box when the process is complete.
         * @param {String} title The title bar text
         * @param {String} msg The message box body text
         * @return {Ext.MessageBox} messageBox This message box
         */
        progress : function(title, msg){
            this.show({
                title : title,
                msg : msg,
                buttons: false,
                progress:true,
                closable:false,
                minWidth: this.minProgressWidth
            });
            return this;
        },

        /**
         * Displays a standard read-only message box (comparable to the basic JavaScript alert prompt) with an OK
         * button. If a callback function is passed it will be called after the user clicks the button, and a
         * reference to the {@link Ext.Button} that was clicked will be passed as the only parameter to the callback
         * (could also be the top-right close button).
         * @param {String} title The title bar text
         * @param {String} msg The message box body text
         * @param {Function} fn (optional) The callback function invoked after the message box is closed
         * @param {Object} scope (optional) The scope of the callback function
         * @return {Ext.MessageBox} messageBox This message box
         */
        alert : function(title, msg, fn, scope){
            this.show({
                title : title,
                msg : msg,
                buttons: this.OK,
                fn: fn,
                scope : scope
            });
            return this;
        },

        /**
         * Displays a message box with an infinitely auto-updating progress bar.  This can be used to block user
         * interaction while waiting for a long-running process to complete that does not have defined intervals.
         * You are responsible for closing the message box when the process is complete.
         * @param {String} msg The message box body text
         * @param {String} title (optional) The title bar text
         * @return {Ext.MessageBox} messageBox This message box
         */
        wait : function(msg, title){
            this.show({
                title : title,
                msg : msg,
                buttons: false,
                closable:false,
                progress:true,
                modal:true,
                width:300,
                wait:true
            });
            waitTimer = Ext.TaskMgr.start({
                run: function(i){
                    Ext.MessageBox.updateProgress(((((i+20)%20)+1)*5)*.01);
                },
                interval: 1000
            });
            return this;
        },

        /**
         * Displays a confirmation message box with Yes and No buttons.  If a callback function is passed it will
         * be called after the user clicks either button, and a reference to the {@link Ext.Button} that was clicked
         * will be passed as the only parameter to the callback (could also be the top-right close button).
         * @param {String} title The title bar text
         * @param {String} msg The message box body text
         * @param {Function} fn (optional) The callback function invoked after the message box is closed
         * @param {Object} scope (optional) The scope of the callback function
         * @return {Ext.MessageBox} messageBox This message box
         */
        confirm : function(title, msg, fn, scope){
            this.show({
                title : title,
                msg : msg,
                buttons: this.YESNO,
                fn: fn,
                scope : scope
            });
            return this;
        },

        /**
         * Displays a message box with OK and Cancel buttons prompting the user to enter some text.  The prompt can
         * be a single-line or multi-line textbox.  If a callback function is passed it will be called after the user
         * clicks either button, and a reference to the {@link Ext.Button} that was clicked (could also be the top-right
         * close button) and the text that was entered will be passed as the two parameters to the callback.
         * @param {String} title The title bar text
         * @param {String} msg The message box body text
         * @param {Function} fn (optional) The callback function invoked after the message box is closed
         * @param {Object} scope (optional) The scope of the callback function
         * @param {Boolean/Number} multiline (optional) True to create a multiline textbox using the defaultTextHeight
         * property, or the height in pixels to create the textbox (defaults to false / single-line)
         * @return {Ext.MessageBox} messageBox This message box
         */
        prompt : function(title, msg, fn, scope, multiline){
            this.show({
                title : title,
                msg : msg,
                buttons: this.OKCANCEL,
                fn: fn,
                minWidth:250,
                scope : scope,
                prompt:true,
                multiline: multiline
            });
            return this;
        },

        /**
         * Button config that displays a single OK button
         */
        OK : {ok:true},
        /**
         * Button config that displays Yes and No buttons
         */
        YESNO : {yes:true, no:true},
        /**
         * Button config that displays OK and Cancel buttons
         */
        OKCANCEL : {ok:true, cancel:true},
        /**
         * Button config that displays Yes, No and Cancel buttons
         */
        YESNOCANCEL : {yes:true, no:true, cancel:true},

        /**
         * The default height in pixels of the message box's multiline textarea if displayed (defaults to 75)
         */
        defaultTextHeight : 75,
        /**
         * The maximum width in pixels of the message box (defaults to 600)
         */
        maxWidth : 600,
        /**
         * The minimum width in pixels of the message box (defaults to 100)
         */
        minWidth : 100,
        /**
         * The minimum width in pixels of the message box progress bar if displayed (defaults to 250)
         */
        minProgressWidth : 250,
        /**
         * An object containing the default button text strings that can be overriden for localized language support.
         * Supported properties are: ok, cancel, yes and no.
         * Customize the default text like so: Ext.MessageBox.buttonText.yes = "S�";
         */
        buttonText : {
            ok : "OK",
            cancel : "Cancel",
            yes : "Yes",
            no : "No"
        }
    };
}();

// Alias for convenience
Ext.Msg = Ext.MessageBox;