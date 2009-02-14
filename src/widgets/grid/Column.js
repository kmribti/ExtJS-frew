/**
 * @class Ext.grid.Column
 * <p>This class encapsulates column configuration data stored in a {@link Ext.grid.ColumnModel ColumnModel}'s
 * {@link Ext.grid.ColumnModel#config config} property.</p>
 * <p>This class renders a passed data field unchanged and is usually used for textual columns. Subclasses
 * are provided which render data in different ways.</p>
 */
Ext.grid.Column = function(config){
    Ext.apply(this, config);

    if(typeof this.renderer == "string"){
        this.renderer = Ext.util.Format[this.renderer];
    }
    if(typeof this.id == "undefined"){
        this.id = ++Ext.grid.Column.AUTO_ID;
    }
    if(this.editor){
        if(this.editor.xtype && !this.editor.events){
            this.editor = Ext.create(this.editor, 'textfield');
        }
    }
}

Ext.grid.Column.AUTO_ID = 0;

Ext.grid.Column.prototype = {
    // private. Used by ColumnModel to avoid reprocessing
    isColumn : true,
    /**
     * @property renderer
     * @type Function
     * A function which returns displayable data when passed the following parameters:<div class="mdetail-params"><ul>
     * <li><b>value</b> : Object<p class="sub-desc">The data value for the cell.</p></li>
     * <li><b>metadata</b> : Object<p class="sub-desc">An object in which you may set the following attributes:<ul>
     * <li><b>css</b> : String<p class="sub-desc">A CSS class name to add to the cell's TD element.</p></li>
     * <li><b>attr</b> : String<p class="sub-desc">An HTML attribute definition string to apply to the data container element <i>within</i> the table cell
     * (e.g. 'style="color:red;"').</p></li></ul></p></li>
     * <li><b>record</b> : Ext.data.record<p class="sub-desc">The {@link Ext.data.Record} from which the data was extracted.</p></li>
     * <li><b>rowIndex</b> : Number<p class="sub-desc">Row index</p></li>
     * <li><b>colIndex</b> : Number<p class="sub-desc">Column index</p></li>
     * <li><b>store</b> : Ext.data.Store<p class="sub-desc">The {@link Ext.data.Store} object from which the Record was extracted.</p></li>
     * </ul></div>
     */
    renderer : function(value){
        if(typeof value == "string" && value.length < 1){
            return "&#160;";
        }
        return value;
    },

    // private
    getEditor: function(rowIndex){
        return this.editable !== false ? this.editor : null;
    },

    /**
     * Returns the editor defined for this column.
     * @param {Number} rowIndex The row index
     * @return {Ext.Editor} The {@link Ext.Editor Editor} that was created to wrap 
     * the {@link Ext.form.Field Field} used to edit the cell.
     */
    getCellEditor: function(rowIndex){
        var editor = this.getEditor(rowIndex);
        if(editor){
            if(!editor.startEdit){
                if(!editor.gridEditor){
                    editor.gridEditor = new Ext.grid.GridEditor(editor);
                }
                return editor.gridEditor;
            }else if(editor.startEdit){
                return editor;
            }
        }
        return null;
    }
};

/**
 * @class Ext.grid.BooleanColumn
 * @extends Ext.grid.Column
 * <p>A Column definition class which renders boolean data fields.</p>
 */
Ext.grid.BooleanColumn = Ext.extend(Ext.grid.Column, {
    /**
     * @cfg {String} trueText
     * The string returned by the renderer when the column value is not falsey.
     */
    trueText: 'true',
    /**
     * @cfg {String} falseText
     * The string returned by the renderer when the column value is falsey (but not undefined).
     */
    falseText: 'false',
    /**
     * @cfg {String} undefinedText
     * The string returned by the renderer when the column value is undefined.
     */
    undefinedText: '&#160;',

    constructor: function(cfg){
        this.supr().constructor.apply(this, arguments);
        var t = this.trueText, f = this.falseText, u = this.undefinedText;
        this.renderer = function(v){
            if(v === undefined){
                return u;
            }
            if(!v || v === 'false'){
                return f;
            }
            return t;
        };
    }
});

/**
 * @class Ext.grid.NumberColumn
 * @extends Ext.grid.Column
 * <p>This class encapsulates column configuration data stored in an {@link Ext.grid.ColumnModel ColumnModel}.</p>
 * <p>This class renders a numeric data field according to a {@link #format} string.</p>
 */
Ext.grid.NumberColumn = Ext.extend(Ext.grid.Column, {
    /**
     * @cfg {String} format
     * A formatting string as used by (@link Ext.util.Format#number} to format a numeric value for this Column.
     */
    format : '0,000.00',
    constructor: function(cfg){
        this.supr().constructor.apply(this, arguments);
        this.renderer = Ext.util.Format.numberRenderer(this.format);
    }
});

/**
 * @class Ext.grid.DateColumn
 * @extends Ext.grid.Column
 * <p>This class encapsulates column configuration data stored in an {@link Ext.grid.ColumnModel ColumnModel}.</p>
 * <p>This class renders a passed date according to the default locale, or a configured {@link #format}.</p>
 */
Ext.grid.DateColumn = Ext.extend(Ext.grid.Column, {
    /**
     * @cfg {String} format
     * A formatting string as used by (@link Date.format} to format a Date for this Column.
     */
    format : 'm/d/Y',
    constructor: function(cfg){
        this.supr().constructor.apply(this, arguments);
        this.renderer = Ext.util.Format.dateRenderer(this.format);
    }
});

/**
 * @class Ext.grid.TemplateColumn
 * @extends Ext.grid.Column
 * <p>This class encapsulates column configuration data stored in an {@link Ext.grid.ColumnModel ColumnModel}.</p>
 * <p>This class renders a value by processing a {@link Ext.data.Record Record}'s {@link Ext.data.Record#data data}
 * using a {@link #tpl configured} {@link Ext.XTemplate XTemplate}.</p>
 */
Ext.grid.TemplateColumn = Ext.extend(Ext.grid.Column, {
    /**
     * @cfg {String/XTemplate} tpl
     * A {@link Ext.XTemplate XTemplate}, or an XTemplate definition string to use to process a {@link Ext.data.Record Record}'s
     * {@link Ext.data.Record#data data} to produce a colunm's rendered value.
     */
    constructor: function(cfg){
        this.supr().constructor.apply(this, arguments);
        var tpl = typeof this.tpl == 'object' ? this.tpl : new Ext.XTemplate(this.tpl);
        this.renderer = function(value, p, r){
            return tpl.apply(r.data);
        }
        this.tpl = tpl;
    }
});

/*
 * @property types
 * @type Object
 * @member Ext.grid.Column
 * @static
 * <p>An object containing predefined Column classes keyed by a mnemonic code which may be referenced
 * by the {@link Ext.grid.ColumnModel#xtype xtype} config option of ColumnModel.</p>
 * <p>This contains the following properties</p><div class="mdesc-details"><ul>
 * <li>gridcolumn : <b>{@link Ext.grid.Column Column constructor}</b></li>
 * <li>booleancolumn : <b>{@link Ext.grid.BooleanColumn BooleanColumn constructor}</b></li>
 * <li>numbercolumn : <b>{@link Ext.grid.NumberColumn NumberColumn constructor}</b></li>
 * <li>datecolumn : <b>{@link Ext.grid.DateColumn DateColumn constructor}</b></li>
 * <li>templatecolumn : <b>{@link Ext.grid.TemplateColumn TemplateColumn constructor}</b></li>
 * </ul></div>
 */
Ext.grid.Column.types = {
    gridcolumn : Ext.grid.Column,
    booleancolumn: Ext.grid.BooleanColumn,
    numbercolumn: Ext.grid.NumberColumn,
    datecolumn: Ext.grid.DateColumn,
    templatecolumn: Ext.grid.TemplateColumn
};