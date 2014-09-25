package org.opengeo.app;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Envelope;
import com.vividsolutions.jts.geom.Geometry;
import org.geoserver.catalog.CoverageInfo;
import org.geoserver.catalog.FeatureTypeInfo;
import org.geoserver.catalog.LayerInfo;
import org.geoserver.catalog.ResourceInfo;
import org.geotools.geometry.jts.Geometries;
import org.geotools.referencing.CRS;
import org.geotools.util.logging.Logging;
import org.opengis.feature.type.FeatureType;
import org.opengis.feature.type.GeometryDescriptor;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.crs.GeographicCRS;
import org.opengis.referencing.crs.ProjectedCRS;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Helper for encoding/decoding objects to/from JSON.
 */
public class IO {

    static Logger LOG = Logging.getLogger(IO.class);

    /**
     * Encodes a projection within the specified object.
     *
     * @return The object passed in.
     */
    public static JSONObj proj(JSONObj obj, CoordinateReferenceSystem crs, String srs) {
        if (srs == null && crs != null) {
            try {
                srs = CRS.lookupIdentifier(crs, false);
            } catch (Exception e) {
                LOG.log(Level.WARNING, "Unable to determine srs from crs: " + crs, e);
            }
        }

        if (srs != null) {
            obj.put("srs", srs);
        }

        if (crs == null && srs != null) {
            try {
                crs = CRS.decode(srs);
            } catch (Exception e) {
                LOG.log(Level.WARNING, "Unable to determine crs from srs: " + srs, e);
            }
        }

        if (crs != null) {
            // type
            obj.put("type",
                    crs instanceof ProjectedCRS ? "projected" : crs instanceof GeographicCRS ? "geographic" : "other");

            // units
            String units = null;
            try {
                // try to determine from actual crs
                String unit = crs.getCoordinateSystem().getAxis(0).getUnit().toString();
                if ("ft".equals(unit) || "feets".equals(unit))
                    units = "ft";
            } catch (Exception e) {
                LOG.log(Level.WARNING, "Unable to determine units from crs", e);
            }
            if (units == null) {
                // fallback: meters for projected, otherwise degrees
                units = crs instanceof ProjectedCRS ? "m" : "degrees";
            }
            obj.put("unit", units);
        }

        return obj;
    }

    /**
     * Encodes a bounding box within the specified object.
     *
     * @return The object passed in.
     */
    public static JSONObj bounds(JSONObj obj, Envelope bbox) {
        Coordinate center = bbox.centre();
        obj.put("west", bbox.getMinX())
                .put("south", bbox.getMinY())
                .put("east", bbox.getMaxX())
                .put("north", bbox.getMaxY())
                .putArray("center").add(center.x).add(center.y);
        return obj;
    }

    /**
     * Decodes a bounding box within the specified object.
     *
     * @return The object passed in.
     */
    public static Envelope bounds(JSONObj obj) {
        return new Envelope(obj.doub("west"), obj.doub("east"), obj.doub("south"), obj.doub("north"));
    }

    /**
     * Encodes a layer within the specified object.
     *
     * @return The object passed in.
     */
    public static JSONObj layer(JSONObj obj, LayerInfo layer) {
        String wsName = layer.getResource().getNamespace().getPrefix();

        ResourceInfo r = layer.getResource();
        obj.put("name", layer.getName())
                .put("workspace", wsName)
                .put("title", layer.getTitle() != null ? layer.getTitle() : r.getTitle())
                .put("description", layer.getAbstract() != null ? layer.getAbstract() : r.getAbstract())
                .put("type", type(r));

        if (r instanceof FeatureTypeInfo) {
            FeatureTypeInfo ft = (FeatureTypeInfo) r;
            obj.put("geometry", geometry(ft));
        }

        proj(obj.putObject("proj"), r.getCRS(), r.getSRS());

        JSONObj bbox = obj.putObject("bbox");

        if (r.getNativeBoundingBox() != null) {
            bounds(bbox.putObject("native"), r.getNativeBoundingBox());
        }
        else {
            // check if the crs is geographic, if so use lat lon
            if (r.getCRS() instanceof GeographicCRS) {
                bounds(bbox.putObject("native"), r.getLatLonBoundingBox());
            }
        }

        bounds(bbox.putObject("lonlat"), r.getLatLonBoundingBox());

        return obj;
    }

    static String type(ResourceInfo r)  {
        if (r instanceof CoverageInfo) {
            return "raster";
        }
        else {
            return "vector";
        }
    }

    static String geometry(FeatureTypeInfo ft) {
        try {
            FeatureType schema = ft.getFeatureType();
            GeometryDescriptor gd = schema.getGeometryDescriptor();
            if (gd == null) {
                return "Vector";
            }

            Geometries geomType = Geometries.getForBinding((Class<? extends Geometry>) gd.getType().getBinding());
            return geomType.getName();
        } catch (IOException e) {
            LOG.log(Level.WARNING, "Error looking up schema", e);
            return "Unknown";
        }
    }
}
