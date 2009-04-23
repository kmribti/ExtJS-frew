/**
 * @class Ext.data.DataReader
 * Abstract base class for reading structured data from a data source and converting
 * it into an object containing {@link Ext.data.Record} objects and metadata for use
 * by an {@link Ext.data.Store}.  This class is intended to be extended and should not
 * be created directly. For existing implementations, see {@link Ext.data.ArrayReader},
 * {@link Ext.data.JsonReader} and {@link Ext.data.XmlReader}.
 * @constructor Create a new DataReader
 * @param {Object} meta Metadata configuration options (implementation-specific)
 * @param {Object} recordType Either an Array of field definition objects as specified
 * in {@link Ext.data.Record#create}, or an {@link Ext.data.Record} object created
 * using {@link Ext.data.Record#create}.
 */
Ext.data.DataReader = function(meta, recordType){
    /**
     * This DataReader's configured metadata as passed to the constructor.
     * @type Mixed
     * @property meta
     */
    this.meta = meta;
    this.recordType = Ext.isArray(recordType) ?
        Ext.data.Record.create(recordType) : recordType;
};

Ext.data.DataReader.prototype = {

	/**
	 * Used for un-phantoming a record after a successful database insert.  Sets the records pk along with new data from server.
	 * You <strong>must</strong> return a complete new record from the server.  If you don't, your local record's missing fields
	 * will be populated with the default values specified in your Ext.data.Record.create specification.  Without a defaultValue,
	 * local fields will be populated with empty string "".  So return your entire record's data after remote create and update.
	 * Will perform a commit as well, un-marking dirty-fields.  Store's "update" event will be suppressed.
	 * @param {Record} record The phantom record to be realized.
	 * @param {String} data The new record data to apply.  Must include the primary-key as reported by database.
	 */
	realize: function(rs, data){
		if (Ext.isArray(rs)) {
			for (var i = rs.length - 1; i >= 0; i--) {
				// recurse
				if (Ext.isArray(data)) {
					this.realize(rs.splice(i,1).shift(), data[i]);
				}
				else {
					// weird...rs is an array but data isn't??  recurse but just send in the whole data object.
					// the else clause below will detect !this.isData and throw exception.
					this.realize(rs.splice(i,1).shift(), data);
				}
			}
		}
		else {
			if (!this.isData(data)) {
				rs.commit();
				throw new Error("DataReader#realize was called with invalid remote-data.  Please see the docs for DataReader#realize and review your DataReader configuration.");
			}
			var values = this.extractValues(data, rs.fields.items, rs.fields.items.length)
			rs.editing = true; // <-- prevent unwanted afterEdit calls by record.
			rs.phantom = false; // <-- The purpose of this method is to "un-phantom" a record
			rs.id = values[this.meta.idProperty];
			rs.data = values;
			rs.commit();
			rs.editing = false;
		}
	},

	/**
	 * Used for updating a non-phantom or "real" record's data with fresh data from server after remote-save.
	 * You <strong>must</strong> return a complete new record from the server.  If you don't, your local record's missing fields
	 * will be populated with the default values specified in your Ext.data.Record.create specification.  Without a defaultValue,
	 * local fields will be populated with empty string "".  So return your entire record's data after both remote create and update.
	 * Will perform a commit as well, un-marking dirty-fields.  Store's "update" event will be suppressed as the record receives
	 * a fresh new data-hash.
	 * @param {Record/Record[]} rs
	 * @param {Object} data
	 */
	update : function(rs, data) {
		if (Ext.isArray(rs)) {
			for (var i=rs.length-1; i >= 0; i--) {
				if (Ext.isArray(data)) {
					this.update(rs.splice(i,1).shift(), data.splice(i,1).shift());
				}
				else {
					// weird...rs is an array but data isn't??  recurse but just send in the whole data object.
					// the else clause below will detect !this.isData and throw exception.
					this.update(rs.splice(i,1).shift(), data);
				}
			}
		}
		else {
			if (!this.isData(data)) {
				rs.commit();
				throw new Error("DataReader#update received invalid data from server.  Please see docs for DataReader#update");
			}
			rs.editing = true; // <-- prevent unwanted afterEdit calls by record.
			rs.data = this.extractValues(data, rs.fields.items, rs.fields.items.length);
			rs.commit();
			rs.editing = false;
		}
	},

	/**
	 * Returns true if the supplied data-hash <strong>looks</strong> like data.  Checks to see if it has a key
	 * corresponding to idProperty defined in your DataReader config containing non-empty pk.
	 * @return {Boolean}
	 * @param {Object} data
	 */
	isData : function(data) {
		return (data && typeof(data) == 'object' && !Ext.isEmpty(data[this.meta.idProperty])) ? true : false
	}
};