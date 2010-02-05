var suite = new Y.Test.Suite('Ext');

suite.add(new Y.Test.Case({

    name: 'Ext Core Utils',

    planned: 288,

    // addBehaviors

    // 7
    test_apply: function() {
        var o1 = Ext.apply({}, {
            foo: 1,
            bar: 2
        });
        Y.ObjectAssert.hasKeys( o1, {
            foo: 1,
            bar: 2
        }, 'Test simple apply, with a return value');
        
        var o2 = {};
        Ext.apply( o2, {
            opt1: 'x',
            opt2: 'y'
        });
        Y.ObjectAssert.hasKeys( o2, {
            opt1: 'x',
            opt2: 'y'
        }, 'Test that the reference is changed' );
        
        var o3 = Ext.apply({}, {
            prop1: 1
        });
        Y.Assert.areEqual( o3.prop2, undefined, 'Test to ensure no extra properties are copied' );
        
        var o4 = Ext.apply({
            foo: 1,
            baz: 4
        }, {
            foo: 2,
            bar: 3
        });
        Y.ObjectAssert.hasKeys( o4, {
            foo: 2,
            bar: 3,
            baz: 4
        }, 'Ensure that properties get overwritten by defaults' );
        
        var o5 = {};
        Ext.apply( o5, {
            foo: 'new',
            exist: true
        }, {
            foo: 'old',
            def: true
        });
        Y.ObjectAssert.hasKeys( o5, {
            foo: 'new',
            def: true,
            exist: true
        }, 'Test using defaults');
        
        var o6 = Ext.apply({}, {
            foo: 'foo',
            bar: 'bar'
        },{
            foo: 'oldFoo',
            bar: 'oldBar'
        });
        Y.ObjectAssert.hasKeys( o6, {
            foo: 'foo',
            bar: 'bar'
        }, 'Test to ensure all defaults get overridden' );
        
        Y.Assert.isNull( Ext.apply( null, {} ), 'Test null first argument' );
    },

    // 5
    test_applyIf: function() {
        var o1 = Ext.applyIf({}, {
            foo: 'foo',
            bar: 'bar'
        });
        Y.ObjectAssert.hasKeys( o1, {
            foo: 'foo',
            bar: 'bar'
        }, 'Test with an empty destination object' );
        
        var o2 = Ext.applyIf({
            foo: 'foo'
        },{
            foo: 'oldFoo'
        });
        Y.ObjectAssert.hasKeys( o2, {
            foo: 'foo'
        }, 'Ensure existing properties don\'t get overridden' );
        
        var o3 = Ext.applyIf({
            foo: 1,
            bar: 2
        },{
            bar: 3,
            baz: 4
        });
        Y.ObjectAssert.hasKeys(o3, {
            foo: 1,
            bar: 2,
            baz: 4
        }, 'Test mixing properties to be overridden' );
        
        var o4 = {};
        Ext.applyIf( o4, {
            foo: 2
        },{
            foo: 1
        });
        Y.ObjectAssert.hasKeys(o4, {
            foo: 2
        }, 'Test that the reference of the object is changed' );
        
        Y.Assert.isNull( Ext.applyIf( null, {} ), 'Test null first argument' );
    },

    // 6
    test_clean: function() {
         Y.ArrayAssert.itemsAreEqual( Ext.clean( [ true, true, true ] ), [ true, true, true ], 'Test with all non-falsey' );
         Y.Assert.areEqual( Ext.clean( [] ).length, 0, 'Test with empty' );
         Y.Assert.areEqual( Ext.clean( [ false, false, false ] ).length, 0, 'Test with all falsey' );
         Y.Assert.areEqual( Ext.clean( null ).length, 0, 'Test with non array parameter' ); 
         Y.ArrayAssert.itemsAreEqual( Ext.clean( [ 1, 0, 1 ] ), [ 1, 1 ], 'Test with non booleans' );
         Y.ArrayAssert.itemsAreEqual( Ext.clean( [ 1, 2, false, 0, 3, 1 ] ), [ 1, 2, 3, 1 ], 'Ensure order is maintained properly' );
    },

    // 7
    test_copyTo: function() {
        var from = {
            x: 50,
            y: 100,
            width: 'auto',
            height: 200
        };
            
        var o1 = Ext.copyTo( {}, from, 'x,y' );
        Y.ObjectAssert.hasKeys( o1, {
            x: 50,
            y: 100
        }, 'Test simple copy with string' );
        
        var o2 = Ext.copyTo( {}, from, '' );
        Y.Assert.isUndefined( o2.x, 'Test with empty string as properties' );
        Y.Assert.isUndefined( o2.y, 'Test with empty string as properties' );
        Y.Assert.isUndefined( o2.width, 'Test with empty string as properties' );
        Y.Assert.isUndefined( o2.height, 'Test with empty string as properties' );
        
        var o3 = {};
        Ext.copyTo( o3, from, 'width' );
        Y.ObjectAssert.hasKeys( o3, {
            width: 'auto'
        }, 'Test copy ensuring that the original reference is changed' );
        
        var o4 = Ext.copyTo({
            x: 1
        }, from, [ 'x', 'y' ] );
        Y.ObjectAssert.hasKeys( o4, {
            x: 50,
            y: 100
        }, 'Test with array as properties, also with an existing value in the destination object' );
    },
    
    // create
    // decode

    // 14
    test_destroy: function() {
        var C1 = Ext.extend(Object, {
            constructor: function() {
                this.c1destroy = false;
            },
            destroy: function() {
                this.c1destroy = true;
            }
        });
        var C2 = Ext.extend(Object, {
            constructor: function() {
                this.c2destroy = false;
            },
            destroy: function() {
                this.c2destroy = true;
            }
        });
        var C3 = Ext.extend(Object, {
            constructor: function() {
                this.c3destroy = false;
            },
            dest: function() {
                this.c3destroy = true;
            }
        });
        
        var o1 = new C1();
        Ext.destroy( o1 );
        Y.Assert.isTrue( o1.c1destroy, 'Simple destroy test with a single object' );
        
        var arr1 = [ new C1(), new C2(), new C2() ];
        Ext.destroy( arr1 );
        Y.Assert.isTrue( arr1[0].c1destroy, 'Test with an array of items' );
        Y.Assert.isTrue( arr1[1].c2destroy, 'Test with an array of items' );
        Y.Assert.isTrue( arr1[2].c2destroy, 'Test with an array of items' );
        
        var o2 = new C1(),
            o3 = new C2(),
            o4 = new C1();
            
        Ext.destroy( o2, o3, o4 );
        Y.Assert.isTrue( o2.c1destroy, 'Test with param array' );
        Y.Assert.isTrue( o3.c2destroy, 'Test with param array' );
        Y.Assert.isTrue( o4.c1destroy, 'Test with param array' );
        
        var o5 = new C3();
        Ext.destroy( o5 );
        Y.Assert.isFalse( o5.c3destroy, 'Test item without a destroy method' );
        
        var arr2 = [ new C1(), new C3(), new C2() ];
        Ext.destroy( arr2 );
        Y.Assert.isTrue( arr2[0].c1destroy, 'Test with an array of items, mix of items with and without destroy' );
        Y.Assert.isFalse( arr2[1].c3destroy, 'Test with an array of items, mix of items with and without destroy' );
        Y.Assert.isTrue( arr2[2].c2destroy, 'Test with an array of items, mix of items with and without destroy' );
        
        var id1 = Ext.id(),
            el1 = Ext.getBody().createChild({
            id: id1
        });
        Ext.destroy( el1 );
        Y.Assert.isNull( document.getElementById( id1 ), 'Test with an Ext.Element' );
        
        var id2 = Ext.id(),
            el2 = Ext.getBody().createChild({
                id: id2
            }),
            o6 = new C1();
        Ext.destroy( el2, o6 );
        Y.Assert.isNull( document.getElementById( id2 ), 'Test with a mix of elements and objects' );
        Y.Assert.isTrue( o6.c1destroy, 'Test with a mix of elements and objects' );        
    },

    // 14
    test_destroyMembers: function() {
        var C1 = Ext.extend(Object, {
            constructor: function() {
                this.p1 = 1;
                this.p2 = 2;
                this.p3 = 3;
                this.p4 = 4;
                this.d = false;
            },
            
            destroy: function() {
                this.d = true;
            }
        });
        var C2 = Ext.extend(Object, {
            constructor : function() {
                this.p1 = new C1();
                this.p2 = new C1();
                this.p3 = 1;
            }
        });
        
        var o1 = new C1();
        Ext.destroyMembers( o1, 'p1', 'p3' );
        Y.Assert.isUndefined( o1.p1, 'Simple test with a mix of properties' );
        Y.Assert.areEqual( o1.p2, 2, 'Simple test with a mix of properties' );
        Y.Assert.isUndefined( o1.p3, 'Simple test with a mix of properties' );
        Y.Assert.areEqual( o1.p4, 4, 'Simple test with a mix of properties' );
        
        var o2 = new C2();
        Ext.destroyMembers( o2 );
        Y.Assert.isNotUndefined( o2.p1, 'Test with empty parameter list, ensure nothing is removed or destroyed' );
        Y.Assert.isNotUndefined( o2.p2, 'Test with empty parameter list, ensure nothing is removed or destroyed' );
        Y.Assert.areEqual( 1, o2.p3, 'Test with empty parameter list, ensure nothing is removed or destroyed' );
        Y.Assert.isFalse( o2.p1.d, 'Test with empty parameter list, ensure nothing is removed or destroyed' );
        Y.Assert.isFalse( o2.p2.d, 'Test with empty parameter list, ensure nothing is removed or destroyed' );
        
        var o3 = new C2(),
            o4 = o3.p1,
            o5 = o3.p2;
        Ext.destroyMembers(o3, 'p1', 'p2' );
        Y.Assert.isUndefined( o3.p1, 'Destroy objects, ensure they are destroyed and removed' );
        Y.Assert.isUndefined( o3.p2, 'Destroy objects, ensure they are destroyed and removed' );
        Y.Assert.areEqual( o3.p3, 1, 'Destroy objects, ensure they are destroyed and removed' );
        Y.Assert.isTrue( o4.d, 'Destroy objects, ensure they are destroyed and removed' );
        Y.Assert.isTrue( o5.d, 'Destroy objects, ensure they are destroyed and removed' );
    },

    // 4
    test_each: function() {
        var n = 0;
        Ext.each( [ 11, 13, 18 ], function( x ) {
            Y.Assert.isNumber( n );
            n += x;
        });
        Y.Assert.areEqual( 42, n, 'Test if each has called the function the correct number of times' );
    },

    // encode

    // 5
    test_escapeRe: function() {
        Y.Assert.areEqual( Ext.escapeRe( '-' ), '\\-', 'Test with single char' );
        Y.Assert.areEqual( Ext.escapeRe( '*.' ), '\\*\\.', 'Test with multiple characters next to each other' );
        Y.Assert.areEqual( Ext.escapeRe( 'foo' ), 'foo', 'Test with no escapeable chars' );
        Y.Assert.areEqual( Ext.escapeRe( '{baz}' ), '\\{baz\\}', 'Test with mixed set' );
        Y.Assert.areEqual( Ext.escapeRe( '-.*+?^${}()|[]/\\'), '\\-\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\/\\\\', 'Test with every character' );
    },

    // 4
    test_extend: function() {
        var Dude = Ext.extend( Object, {
            constructor: function( config ) {
                Ext.apply( this, config );
                this.isBadass = false;
            }
        });
        var Aweysome = Ext.extend( Dude, {
            constructor: function() {
                Aweysome.superclass.constructor.apply( this, arguments );
                this.isBadass = true;
            }
        });

        var david = new Aweysome({ davis: 'isAwesome' });
        Y.Assert.areEqual( david.davis, 'isAwesome', 'Test if David is awesome' );
        Y.Assert.isTrue( david.isBadass, 'Test if David is badass' );
        Y.Assert.isFunction( david.override, 'Test if extend added the override method' );
        Y.ObjectAssert.areEqual( { isBadass: true, davis: 'isAwesome' }, david, 'Test if David is badass and awesome' );
    },

    // 9
    test_flatten: function() {
        Y.Assert.areEqual( Ext.flatten( [] ).length, 0, 'Test with empty array' );
        Y.Assert.areEqual( Ext.flatten( [ [], [], [] ] ).length, 0, 'Test with an array of empty arrays' );
        Y.Assert.areEqual( Ext.flatten( null ).length, 0, 'Test with null' );
        Y.Assert.areEqual( Ext.flatten( undefined ).length, 0, 'Test with undefined' );
        Y.ArrayAssert.itemsAreEqual( Ext.flatten( [ 1, 7, 3, 4 ] ), [ 1, 7, 3, 4 ], 'Test with a simple flat array' );
        Y.ArrayAssert.itemsAreEqual( Ext.flatten( [ [ 1 ], [ 2 ], [ 3 ] ] ), [ 1, 2, 3 ], 'Test with an array of arrays with a single item' );
        Y.ArrayAssert.itemsAreEqual( Ext.flatten( [ [ 1, 2 ], [ 3, 4 ], [ 5, 6 ] ] ), [ 1, 2, 3, 4, 5, 6 ], 'Test sub arrays with multiple items' );
        Y.ArrayAssert.itemsAreEqual( Ext.flatten( [ 1, 2, [ 3, 4 ], 5, [ 6, 7 ] ] ), [ 1, 2, 3, 4, 5, 6, 7 ], 'Test a mix of sub arrays and non arrays' );
        Y.ArrayAssert.itemsAreEqual( Ext.flatten( [ [ [ 1, [ 2, 3 ], [ 4, 5 ] ], [ 6, 7, [ 8, [ 9, 10 ] ] ] ] ] ), [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ], 'Test with multiple levels of nesting' );
    },

    // 1
    test_fly: function() {
        var id = Ext.id();
        var div = document.createElement( 'div' );
        div.id = id;
        ( document.body || document.documentElement ).appendChild( div );

        var div2 = Ext.fly( id );
        Y.Assert.areSame( div, div2.dom, 'Test if fly got the correct item' );
    },

    // 1
    test_get: function() {
        var id = Ext.id();
        var div = document.createElement( 'div' );
        div.id = id;
        ( document.body || document.documentElement ).appendChild( div );

        var div2 = Ext.get( id );
        Y.Assert.areSame( div, div2.dom, 'Test if "get" got the correct item' );
    },
    
    // 1
    test_getBody: function() {
        var body = Ext.getBody();
        Y.Assert.isTrue( body.dom === document.body || body.dom === document.documentElement, 'Test if getBody returns the body' );
    },

    // getCmp

    // 1
    test_getDoc: function() {
        var doc = Ext.getDoc();
        Y.Assert.areSame( doc.dom, document, 'Test if getDoc returns document' );
    },

    // 1
    test_getDom: function() {
        var id = Ext.id();
        var div = document.createElement( 'div' );
        div.id = id;
        ( document.body || document.documentElement ).appendChild( div );

        var div2 = Ext.getDom( id );
        Y.Assert.areSame( div, div2, 'Test if getDom returns correct element' );
    },

    // 1
    test_getScrollBarWidth: function() {
        Y.Assert.isNumber( Ext.getScrollBarWidth(), 'Test if getScrollBarWith returns a number' );
    },

    // 1
    test_id: function() {
        var id = Ext.id( document );
        var id2 = Ext.id( document );
        Y.Assert.areEqual( id, id2, 'Test if id returns same id for the same element' );
    },

    // 8
    test_invoke: function() {
        var n = 0;
        var fn = function( a, b ) {
            Y.Assert.areEqual( 'a', a, 'Testing invoke param' );
            Y.Assert.areEqual( 'b', b, 'Testing invoke param' );
            return ++n;
        };

        var arr = [ { get: fn }, { get: fn }, { get: fn } ];
        var results = Ext.invoke( arr, 'get', 'a', 'b' );

        Y.ArrayAssert.itemsAreEqual( [ 1, 2, 3 ], results, 'Test invoke results' );
        Y.Assert.areEqual( n, results.length, 'Number of invocations' );
    },

    // 12
    test_isArray: function( ) {
        var C = Ext.extend( Object, {
            length: 1
        } );
        Y.Assert.isTrue( Ext.isArray( [] ), 'Test with empty array' );
        Y.Assert.isTrue( Ext.isArray( [ 1, 2, 3, 4 ] ), 'Test with filled array' );
        Y.Assert.isFalse( Ext.isArray( false ), 'Test with boolean #1' );
        Y.Assert.isFalse( Ext.isArray( true ), 'Test with boolean #2' );
        Y.Assert.isFalse( Ext.isArray( 'foo' ), 'Test with string' );
        Y.Assert.isFalse( Ext.isArray( 1 ), 'Test with number' );
        Y.Assert.isFalse( Ext.isArray( null ), 'Test with null' );
        Y.Assert.isFalse( Ext.isArray( new Date() ), 'Test with a date' );
        Y.Assert.isFalse( Ext.isArray( {} ), 'Test with empty object' );
        Y.Assert.isFalse( Ext.isArray( document.getElementsByTagName( 'body' ) ), 'Test with node list' );
        Y.Assert.isFalse( Ext.isArray( document.body ), 'Test with element' );
        Y.Assert.isFalse( Ext.isArray( new C() ), 'Test with custom class that has a length property' );
    },

    // 11
    test_isBoolean: function() {
        Y.Assert.isTrue( Ext.isBoolean( true ), 'Test with true' );
        Y.Assert.isTrue( Ext.isBoolean( false ), 'Test with false' );
        Y.Assert.isFalse( Ext.isBoolean( [] ), 'Test with empty array' );
        Y.Assert.isFalse( Ext.isBoolean( [ 1, 2, 3 ] ), 'Test with filled array' );
        Y.Assert.isFalse( Ext.isBoolean( 1 ), 'Test with number' );
        Y.Assert.isFalse( Ext.isBoolean( '' ), 'Test with empty string' );
        Y.Assert.isFalse( Ext.isBoolean( 'foo' ), 'Test with non empty string' );
        Y.Assert.isFalse( Ext.isBoolean( document.body ), 'Test with element' );
        Y.Assert.isFalse( Ext.isBoolean( null ), 'Test with null' );
        Y.Assert.isFalse( Ext.isBoolean( {} ), 'Test with object' );
        Y.Assert.isFalse( Ext.isBoolean( new Date() ), 'Test with date' );
    },

    // 9
    test_isDate: function() {
        Y.Assert.isTrue( Ext.isDate( new Date() ), 'Test with simple date' );
        Y.Assert.isTrue( Ext.isDate( Date.parseDate( '2000', 'Y' ) ), 'Test with simple date' );
        Y.Assert.isFalse( Ext.isDate( true ), 'Test with boolean' );
        Y.Assert.isFalse( Ext.isDate( 1 ), 'Test with number' );
        Y.Assert.isFalse( Ext.isDate( 'foo' ), 'Test with string' );
        Y.Assert.isFalse( Ext.isDate( null ), 'Test with null' );
        Y.Assert.isFalse( Ext.isDate( [] ), 'Test with array' );
        Y.Assert.isFalse( Ext.isDate( {} ), 'Test with object' );
        Y.Assert.isFalse( Ext.isDate( document.body ), 'Test with element' );
    },

    // 10
    test_isDefined: function() {
        Y.Assert.isFalse( Ext.isDefined( undefined ), 'Test with undefined' );
        Y.Assert.isTrue( Ext.isDefined( null ), 'Test with null' );
        Y.Assert.isTrue( Ext.isDefined( {} ), 'Test with object' );
        Y.Assert.isTrue( Ext.isDefined( [] ), 'Test with array' );
        Y.Assert.isTrue( Ext.isDefined( new Date() ), 'Test with date' );
        Y.Assert.isTrue( Ext.isDefined( 1 ), 'Test with number' );
        Y.Assert.isTrue( Ext.isDefined( false ), 'Test with boolean' );
        Y.Assert.isTrue( Ext.isDefined( '' ), 'Test with empty string' );
        Y.Assert.isTrue( Ext.isDefined( 'foo' ), 'Test with non-empty string' );
        Y.Assert.isTrue( Ext.isDefined( document.body ), 'Test with element' );
    },

    // 5
    test_isElement: function() {
        Y.Assert.isTrue( Ext.isElement( document.body ), 'Test with element' );
        Y.Assert.isFalse( Ext.isElement( Ext.getBody() ), 'Test with Ext.Element' );
        Y.Assert.isFalse( Ext.isElement( null ), 'Test with null' );
        Y.Assert.isFalse( Ext.isElement( 1 ), 'Test with number' );
        Y.Assert.isFalse( Ext.isElement( 'foo' ), 'Test with string' );
    },

    // 10
    test_isEmpty: function() {
        Y.Assert.isTrue( Ext.isEmpty( '' ), 'Test with empty string' );
        Y.Assert.isTrue( Ext.isEmpty( null ), 'Test with null' );
        Y.Assert.isTrue( Ext.isEmpty( undefined ), 'Test with undefined' );
        Y.Assert.isTrue( Ext.isEmpty( [] ), 'Test with empty array' );
        Y.Assert.isFalse( Ext.isEmpty( 'Foo' ), 'Test with simple string' );
        Y.Assert.isFalse( Ext.isEmpty( false ), 'Test with boolean false' );
        Y.Assert.isFalse( Ext.isEmpty( 1 ), 'Test with numeric value' ); 
        Y.Assert.isFalse( Ext.isEmpty( {} ), 'Test with object with no properties' );
        Y.Assert.isFalse( Ext.isEmpty( [ 1, 2, 3 ] ), 'Test with filled array' );
        Y.Assert.isFalse( Ext.isEmpty( '', true ), 'Test empty string with allowBlank' );
    },

    // 12
    test_isFunction: function() {
        var c = new Ext.util.Observable(),
            o = {
                fn: function(){}
            };
        Y.Assert.isTrue( Ext.isFunction( function(){} ), 'Test with anonymous function' );
        Y.Assert.isTrue( Ext.isFunction( new Function( 'return "";' ) ), 'Test with new Function syntax' );
        Y.Assert.isTrue( Ext.isFunction( Ext.emptyFn ), 'Test with static function' );
        Y.Assert.isTrue( Ext.isFunction( c.fireEvent ), 'Test with instance function' );
        Y.Assert.isTrue( Ext.isFunction( o.fn ), 'Test with function on object' );
        Y.Assert.isFalse( Ext.isFunction( Ext.version ), 'Test with class property' );
        Y.Assert.isFalse( Ext.isFunction( null ), 'Test with null' );
        Y.Assert.isFalse( Ext.isFunction( 1 ), 'Test with number' );
        Y.Assert.isFalse( Ext.isFunction( '' ), 'Test with string' );
        Y.Assert.isFalse( Ext.isFunction( new Date() ), 'Test with date' );
        Y.Assert.isFalse( Ext.isFunction( [] ), 'Test with array' );
        Y.Assert.isFalse( Ext.isFunction( {} ), 'Test with object' );
    },

    // 19
    test_isNumber: function() {
        Y.Assert.isTrue( Ext.isNumber( 0 ), 'Test with 0' );
        Y.Assert.isTrue( Ext.isNumber( 4 ), 'Test with non-zero integer' );
        Y.Assert.isTrue( Ext.isNumber( -3 ), 'Test with negative integer' );
        Y.Assert.isTrue( Ext.isNumber( 7.9 ), 'Test with positive float' );
        Y.Assert.isTrue( Ext.isNumber( -4.3 ), 'Test with negative float' );
        Y.Assert.isTrue( Ext.isNumber( Number.MAX_VALUE ), 'Test with MAX_VALUE' );
        Y.Assert.isTrue( Ext.isNumber( Number.MIN_VALUE ), 'Test with MIN_VALUE' );
        Y.Assert.isTrue( Ext.isNumber( Math.PI ), 'Test with Math.PI' );
        Y.Assert.isTrue( Ext.isNumber( Number( '3.1' ) ), 'Test with Number() constructor' );
        Y.Assert.isFalse( Ext.isNumber( Number.NaN ), 'Test with NaN' );
        Y.Assert.isFalse( Ext.isNumber( Number.POSITIVE_INFINITY ), 'Test with POSITIVE_INFINITY' );
        Y.Assert.isFalse( Ext.isNumber( Number.NEGATIVE_INFINITY ), 'Test with NEGATIVE_INFINITY' );
        Y.Assert.isFalse( Ext.isNumber( true ), 'Test with true' );
        Y.Assert.isFalse( Ext.isNumber( '' ), 'Test with empty string' );
        Y.Assert.isFalse( Ext.isNumber( '1.0' ), 'Test with string containing a number' );
        Y.Assert.isFalse( Ext.isNumber( null ), 'Test with null' );
        Y.Assert.isFalse( Ext.isNumber( undefined ), 'Test with undefined' );
        Y.Assert.isFalse( Ext.isNumber( [] ), 'Test with array' );
        Y.Assert.isFalse( Ext.isNumber( {} ), 'Test with object' );
    },

    // 14
    test_isObject: function() {
        Y.Assert.isTrue( Ext.isObject( {} ), 'Test with empty object' );
        Y.Assert.isTrue( Ext.isObject( { foo: 1 } ), 'Test with object with properties' );
        Y.Assert.isTrue( Ext.isObject( new Ext.util.Observable() ), 'Test with object instance' );
        Y.Assert.isTrue( Ext.isObject( new Object() ), 'Test with new Object(  ) syntax' );
        Y.Assert.isFalse( Ext.isObject( new Date() ), 'Test with a date object' );
        Y.Assert.isFalse( Ext.isObject( [] ), 'Test with array' );
        Y.Assert.isFalse( Ext.isObject( new Array() ), 'Test with new Array(  ) syntax' );
        Y.Assert.isFalse( Ext.isObject( 1 ), 'Test with number' );
        Y.Assert.isFalse( Ext.isObject( 'foo' ), 'Test with string' );
        Y.Assert.isFalse( Ext.isObject( false ), 'Test with boolean' );
        Y.Assert.isFalse( Ext.isObject( new Number( 3 ) ), 'Test with new Number() syntax' );
        Y.Assert.isFalse( Ext.isObject( new String( 'foo' ) ), 'Test with new String() syntax' );
        Y.Assert.isFalse( Ext.isObject( null ), 'Test with null' );
        Y.Assert.isFalse( Ext.isObject( undefined ), 'Test with array' );
    },

    // 14
    test_isPrimitive: function() {
        Y.Assert.isTrue( Ext.isPrimitive( 1 ), 'Test with integer' );
        Y.Assert.isTrue( Ext.isPrimitive( -3 ), 'Test with negative integer' );
        Y.Assert.isTrue( Ext.isPrimitive( 1.4 ), 'Test with floating number' );
        Y.Assert.isTrue( Ext.isPrimitive( Number.MAX_VALUE ), 'Test with Number.MAX_VALUE' );
        Y.Assert.isTrue( Ext.isPrimitive( Math.PI ), 'Test with Math.PI' );
        Y.Assert.isTrue( Ext.isPrimitive( '' ), 'Test with empty string' );
        Y.Assert.isTrue( Ext.isPrimitive( 'foo' ), 'Test with non empty string' );
        Y.Assert.isTrue( Ext.isPrimitive( true ), 'Test with boolean true' );
        Y.Assert.isTrue( Ext.isPrimitive( false ), 'Test with boolean false' );
        Y.Assert.isFalse( Ext.isPrimitive( null ), 'Test with null' );
        Y.Assert.isFalse( Ext.isPrimitive( undefined ), 'Test with undefined' );
        Y.Assert.isFalse( Ext.isPrimitive( {} ), 'Test with object' );
        Y.Assert.isFalse( Ext.isPrimitive( [] ), 'Test with array' );
        Y.Assert.isFalse( Ext.isPrimitive( new Ext.util.Observable() ), 'Test with object instance' );
    },

    // 10
    test_isString: function() {
        var s = new String( 'foo' );
        Y.Assert.isTrue( Ext.isString( '' ), 'Test with empty string' );
        Y.Assert.isTrue( Ext.isString( 'foo' ), 'Test with non empty string' );
        Y.Assert.isTrue( Ext.isString( String( '' ) ), 'Test with String() syntax' );
        Y.Assert.isFalse( Ext.isString( new String( '' ) ), 'Test with new String() syntax' );  //should return an object that wraps the primitive
        Y.Assert.isFalse( Ext.isString( 1 ), 'Test with number' );
        Y.Assert.isFalse( Ext.isString( true ), 'Test with boolean' );
        Y.Assert.isFalse( Ext.isString( null ), 'Test with null' );
        Y.Assert.isFalse( Ext.isString( undefined ), 'Test with undefined' );
        Y.Assert.isFalse( Ext.isString( [] ), 'Test with array' );
        Y.Assert.isFalse( Ext.isString( {} ), 'Test with number' );
    },

    // 8
    test_iterate: function() {
        var n = 0;
        Ext.iterate( { n1: 11, n2: 13, n3: 18 }, function( k, v, o ) {
            Y.Assert.isNumber( v );
            n += v;
        });
        Y.Assert.areEqual( 42, n, 'Test if iterate has called the function the correct number of times (object)' );
        n = 0;
        Ext.iterate( [ 11, 13, 18 ], function( x ) {
            Y.Assert.isNumber( x );
            n += x;
        });
        Y.Assert.areEqual( 42, n, 'Test if iterate has called the function the correct number of times (array)' );
    },

    // 7
    test_max: function() {
        Y.Assert.areEqual( Ext.max( [ 14 ] ), 14, 'Test single item' );
        Y.Assert.areEqual( Ext.max( [ 1, 4, 16, 3, 8 ] ), 16, 'Test with max in the middle' );
        Y.Assert.areEqual( Ext.max( [ 9, 1, 5, 8 ] ), 9, 'Test with max at start' );
        Y.Assert.areEqual( Ext.max( [ 1, 9, 0, 4, 12 ] ), 12, 'Test with max at end' );
        Y.Assert.isUndefined( Ext.max( [] ), 'Test with empty array' );
        Y.Assert.areEqual( Ext.max( [ 'a', 'f', 'j', 'c', 'b' ] ), 'j', 'Test with strings' );
        Y.Assert.areEqual( Ext.max( [ 6, 7, 8 ], function( a, b ) {
            return ( a % 8 > b % 8 ) ? 1 : -1;
        } ), 7, 'Test with custom comparator' );
    },

    // 4
    test_mean: function() {
        Y.Assert.isUndefined( Ext.mean( [] ), 'Test with an empty list' );
        Y.Assert.areEqual( Ext.mean( [ 4 ] ), 4, 'Test with a single item' );
        Y.Assert.areEqual( Ext.mean( [ 1, 2, 3, 4, 5 ] ), 3, 'Test with multiple items' );
        Y.Assert.areEqual( Ext.mean( [ 1.1, 1.2, 1.3, 1.4, 1.5 ] ), 1.3, 'Test with floats' );
    },

    // 7
    test_min: function() {
        Y.Assert.areEqual( Ext.min( [ 5 ] ), 5, 'Test single item' );
        Y.Assert.areEqual( Ext.min( [ 3, 7, 2, 4, 8 ] ), 2, 'Test with min in the middle' );
        Y.Assert.areEqual( Ext.min( [ 4, 12, 28, 100, 5 ] ), 4, 'Test with min at the start' );
        Y.Assert.areEqual( Ext.min( [ 13, 4, 17, 83, 3 ] ), 3, 'Test with min at the end' );
        Y.Assert.isUndefined( Ext.min( [] ), 'Test with empty array' );
        Y.Assert.areEqual( Ext.min( [ 'c', 'm', 'b', 'q', 's' ] ), 'b', 'Test with strings' );
        Y.Assert.areEqual( Ext.min( [ 6, 7, 8 ], function( a, b ) {
            return ( a % 8 > b % 8 ) ? 1 : -1;
        } ), 8, 'Test with custom comparator' );
    },

    // 14
    test_namespace: function() {
        var w = window;
        
        Ext.namespace( 'FooTest1' );
        Y.Assert.isNotUndefined( w.FooTest1, 'Test creation with a single top-level namespace' );
        
        Ext.namespace( 'FooTest2', 'FooTest3', 'FooTest4' );
        Y.Assert.isNotUndefined( w.FooTest2, 'Test creation with multiple top level namespaces' );
        Y.Assert.isNotUndefined( w.FooTest3, 'Test creation with multiple top level namespaces' );
        Y.Assert.isNotUndefined( w.FooTest4, 'Test creation with multiple top level namespaces' );
        
        Ext.namespace( 'FooTest5', 'FooTest5.ns1', 'FooTest5.ns1.ns2', 'FooTest5.ns1.ns2.ns3' );
        Y.Assert.isNotUndefined( w.FooTest5, 'Test a chain of namespaces, starting from a top-level' );
        Y.Assert.isNotUndefined( w.FooTest5.ns1, 'Test a chain of namespaces, starting from a top-level' );
        Y.Assert.isNotUndefined( w.FooTest5.ns1.ns2, 'Test a chain of namespaces, starting from a top-level' );
        Y.Assert.isNotUndefined( w.FooTest5.ns1.ns2.ns3, 'Test a chain of namespaces, starting from a top-level' );
        
        Ext.namespace( 'FooTest6.ns1', 'FooTest7.ns1' );
        Y.Assert.isNotUndefined( w.FooTest6.ns1, 'Test creating lower level namespaces without first defining the top level' );
        Y.Assert.isNotUndefined( w.FooTest7.ns1, 'Test creating lower level namespaces without first defining the top level' );
        
        Ext.namespace( 'FooTest8', 'FooTest8.ns1.ns2' );
        Y.Assert.isNotUndefined( w.FooTest8, 'Test creating a lower level namespace without defining the middle level' );
        Y.Assert.isNotUndefined( w.FooTest8.ns1, 'Test creating a lower level namespace without defining the middle level' );
        Y.Assert.isNotUndefined( w.FooTest8.ns1.ns2, 'Test creating a lower level namespace without defining the middle level' );
        
        FooTest8.prop1 = 'foo';
        Ext.namespace( 'FooTest8' );
        Y.Assert.areEqual( FooTest8.prop1, 'foo', 'Ensure existing namespaces are not overwritten' );
    },

    // 14
    test_ns: function() {
        var w = window;
        
        Ext.ns( 'FooTest1' );
        Y.Assert.isNotUndefined( w.FooTest1, 'Test creation with a single top-level namespace (ns)' );
        
        Ext.ns( 'FooTest2', 'FooTest3', 'FooTest4' );
        Y.Assert.isNotUndefined( w.FooTest2, 'Test creation with multiple top level namespaces (ns)' );
        Y.Assert.isNotUndefined( w.FooTest3, 'Test creation with multiple top level namespaces (ns)' );
        Y.Assert.isNotUndefined( w.FooTest4, 'Test creation with multiple top level namespaces (ns)' );
        
        Ext.ns( 'FooTest5', 'FooTest5.ns1', 'FooTest5.ns1.ns2', 'FooTest5.ns1.ns2.ns3 (ns)' );
        Y.Assert.isNotUndefined( w.FooTest5, 'Test a chain of namespaces, starting from a top-level (ns)' );
        Y.Assert.isNotUndefined( w.FooTest5.ns1, 'Test a chain of namespaces, starting from a top-level (ns)' );
        Y.Assert.isNotUndefined( w.FooTest5.ns1.ns2, 'Test a chain of namespaces, starting from a top-level (ns)' );
        Y.Assert.isNotUndefined( w.FooTest5.ns1.ns2.ns3, 'Test a chain of namespaces, starting from a top-level (ns)' );
        
        Ext.ns( 'FooTest6.ns1', 'FooTest7.ns1' );
        Y.Assert.isNotUndefined( w.FooTest6.ns1, 'Test creating lower level namespaces without first defining the top level (ns)' );
        Y.Assert.isNotUndefined( w.FooTest7.ns1, 'Test creating lower level namespaces without first defining the top level (ns)' );
        
        Ext.ns( 'FooTest8', 'FooTest8.ns1.ns2' );
        Y.Assert.isNotUndefined( w.FooTest8, 'Test creating a lower level namespace without defining the middle level (ns)' );
        Y.Assert.isNotUndefined( w.FooTest8.ns1, 'Test creating a lower level namespace without defining the middle level (ns)' );
        Y.Assert.isNotUndefined( w.FooTest8.ns1.ns2, 'Test creating a lower level namespace without defining the middle level (ns)' );
        
        FooTest8.prop1 = 'foo';
        Ext.ns( 'FooTest8' );
        Y.Assert.areEqual( FooTest8.prop1, 'foo', 'Ensure existing namespaces are not overwritten (ns)' );
    },

    // 18
    test_num: function() {
        Y.Assert.areEqual( Ext.num( 3 ), 3, 'Test with an integer' );
        Y.Assert.areEqual( Ext.num( -7 ), -7, 'Test with a negative integer' );
        Y.Assert.areEqual( Ext.num( 5.43 ), 5.43, 'Test with a float' );
        Y.Assert.areEqual( Ext.num( -9.8 ), -9.8, 'Test with a negative float' );
        Y.Assert.areEqual( Ext.num( Math.PI ), Math.PI, 'Test with Math.PI' );
        Y.Assert.isUndefined( Ext.num( null ), 'Test with null, no default' );
        Y.Assert.areEqual( Ext.num( null, 3 ), 3, 'Test with null, with default' );
        Y.Assert.isUndefined( Ext.num( undefined ), 'Test with undefined, no default' );
        Y.Assert.areEqual( Ext.num( undefined, 17 ), 17, 'Test with undefined, with default' );
        Y.Assert.isUndefined( Ext.num( true ), 'Test with boolean, no default' );
        Y.Assert.areEqual( Ext.num( true, 8 ), 8, 'Test with boolean, with default' );
        Y.Assert.isUndefined( Ext.num( '' ), 'Test with empty string' );
        Y.Assert.areEqual( Ext.num( '453' ), 453, 'Test with a string argument in the form of a number' );
        Y.Assert.isUndefined( Ext.num( '    ' ), 'Test with a string containing only spaces' );
        Y.Assert.isUndefined( Ext.num( 'foo' ), 'Test with non empty string' );
        Y.Assert.isUndefined( Ext.num( [] ), 'Test with empty array' );
        Y.Assert.isUndefined( Ext.num( [ 1, 2, 3 ] ), 'Test with non empty array' );
        Y.Assert.isUndefined( Ext.num( [ 1 ] ), 'Test with array with a single item' );
    },

    // onReady

    test_override: function() {

    },

    test_partition: function() {

    },

    test_pluck: function() {

    },

    test_preg: function() {

    },

    test_query: function() {

    },

    test_reg: function() {

    },

    test_removeNode: function() {

    },

    test_select: function() {

    },

    test_sum: function() {

    },

    test_toArray: function() {

    },

    test_type: function() {

    },

    test_unique: function() {

    },

    test_urlAppend: function() {

    },

    test_urlDecode: function() {

    },

    test_urlEncode: function() {

    },

    test_value: function() {

    },

    test_zip: function() {

    }

}));

Ext.tests.push(suite);
