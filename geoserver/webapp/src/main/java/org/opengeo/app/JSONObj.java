package org.opengeo.app;

import org.json.simple.JSONObject;

/**
 * Wrapper object for {@link org.json.simple.JSONObject}.
 */
public class JSONObj extends JSONWrapper<JSONObject> {

    public JSONObj() {
        this(new JSONObject());
    }

    public JSONObj(JSONObject obj) {
        super(obj);
    }

    /**
     * Keys for the object.
     */
    public Iterable<String> keys() {
        return raw.keySet();
    }

    /**
     * Determines if the object has the specified property.
     */
    public boolean has(String key) {
        return raw.containsKey(key);
    }

    /**
     * Gets the raw property mapped to <tt>key</tt>, or <tt>null</tt> if no such property exists.
     */
    public Object get(String key) {
        return raw.get(key);
    }

    /**
     * Gets the property mapped to <tt>key</tt> as a string.
     */
    public String str(String key) {
        return to(get(key), String.class);
    }

    /**
     * Gets the property mapped to <tt>key</tt> as a boolean.
     */
    public Boolean bool(String key) {
        return to(get(key), Boolean.class);
    }

    /**
     * Gets the property mapped to <tt>key</tt> as a double.
     */
    public Double doub(String key) {
        return to(get(key), Double.class);
    }

    /**
     * Gets the property mapped to <tt>key</tt> as an integer.
     */
    public Integer integer(String key) {
        return to(get(key), Integer.class);
    }

    /**
     * Gets the property mapped to <tt>key</tt> as an object wrapper.
     */
    public JSONObj object(String key) {
        return JSONWrapper.wrap(get(key)).toObject();
    }

    /**
     * Gets the property mapped to <tt>key</tt> as an array wrapper.
     */
    public JSONArr array(String key) {
        return JSONWrapper.wrap(get(key)).toArray();
    }

    /**
     * Sets the raw property key value pair.
     *
     * @return This object.
     */
    public JSONObj put(String key, Object val) {
        raw.put(key, val);
        return this;
    }

    /**
     * Creates a new object mapped to <tt>key</tt> and returns the new object.
     *
     * @return The new object wrapper.
     */
    public JSONObj putObject(String key) {
        JSONObj obj = new JSONObj();
        raw.put(key, obj.raw);
        return obj;
    }

    /**
     * Creates a new array mapped to <tt>key</tt> and returns the new array.
     *
     * @return The new array wrapper.
     */
    public JSONArr putArray(String key) {
        JSONArr arr = new JSONArr();
        raw.put(key, arr.raw);
        return arr;
    }

    @Override
    public int size() {
        return raw.size();
    }
}
