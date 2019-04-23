/* (c) 2014 Boundless, http://boundlessgeo.com
 * This code is licensed under the GPL 2.0 license.
 */
package com.boundlessgeo.geoserver.api.controllers;

import org.geoserver.catalog.Catalog;
import org.geoserver.catalog.LayerInfo;
import org.geoserver.catalog.Predicates;
import org.geoserver.config.GeoServer;

import org.geotools.geojson.feature.FeatureJSON;
import org.geotools.geometry.jts.JTS;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.feature.DefaultFeatureCollection;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.collection.DelegateSimpleFeatureIterator;
import org.geotools.feature.simple.SimpleFeatureTypeBuilder;
import org.geotools.feature.simple.SimpleFeatureBuilder;

import com.vividsolutions.jts.geom.Envelope;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.boundlessgeo.geoserver.api.exceptions.BadRequestException;

import static com.google.common.collect.Iterators.transform;

import com.google.common.base.Function;

import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.geometry.Geometry;

import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Iterator;

@Controller
@RequestMapping("/api/footprints")
public class FootprintsController extends ApiController {
    
    @Autowired
    public FootprintsController(GeoServer geoServer) {
        super(geoServer);
    }
    
    // Issue GET request in /footprints/<workspace>?bbox=minx,miny,maxx,maxy
    @RequestMapping(value="/{wsName}", method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.OK)
    public @ResponseBody
    void get(@PathVariable String wsName, @RequestParam("bbox") String bbox,
            HttpServletResponse response) throws IOException{
        Catalog cat = geoServer.getCatalog();
        
        final Envelope bboxEnv = getBboxFromString(bbox);
        final Iterator<LayerInfo> layers = findAllLayersInWorkspace(wsName, cat);
        final SimpleFeatureBuilder featureBuilder = makeBuilder(wsName);
        
        final Iterator<SimpleFeature> featuresFromLayers = 
                transform(layers, new Function<LayerInfo, SimpleFeature>() {
                @Override
                public SimpleFeature apply(LayerInfo layer) {
                    featureBuilder.add(JTS.toGeometry(bboxEnv.intersection(layer.getResource().getLatLonBoundingBox())));
                    featureBuilder.add(layer.getName());
                    featureBuilder.add(layer.getTitle());
                    return featureBuilder.buildFeature(null);
                }
        });
        
        FeatureCollection featureCollection = 
                new DefaultFeatureCollection(null, featureBuilder.getFeatureType()) {
                @Override
                public SimpleFeatureIterator features() {
                    return new DelegateSimpleFeatureIterator(featuresFromLayers);
            }
        };
        
        FeatureJSON json = new FeatureJSON();
        json.writeFeatureCollection(featureCollection, response.getWriter());
    }
    
    private Envelope getBboxFromString(String bbox) {
        double[] env = new double[4];
        String[] integers = bbox.split(",");
        
        if (integers.length == 4) {
            for (int i = 0; i < integers.length; i++) {
                try {
                    env[i] = Double.parseDouble(integers[i]);
                } catch (NumberFormatException e) {
                    throw new BadRequestException("Unable to parse bbox: " + integers[i] + " is not a number");
                }
            }
        } else {
            throw new BadRequestException("Unable to parse bbox: request must contain 4 comma separated values");
        }
        
        return new Envelope(env[0],env[1],env[2],env[3]);
    }
    
    private Iterator<LayerInfo> findAllLayersInWorkspace(String wsName, Catalog cat) {
        return cat.list(LayerInfo.class, Predicates.equal("resource.namespace.prefix", wsName));
    }
    
    private SimpleFeatureBuilder makeBuilder(String wsName) {
        SimpleFeatureTypeBuilder typebuilder = new SimpleFeatureTypeBuilder();
        
        typebuilder.setName(wsName);
        typebuilder.setNamespaceURI( "http://" + wsName );
        typebuilder.setSRS( "EPSG:4326" );
        typebuilder.add( "geometry", Geometry.class );
        typebuilder.add( "name", String.class );
        typebuilder.add( "title", String.class );
        
        SimpleFeatureType type = typebuilder.buildFeatureType();
        return new SimpleFeatureBuilder(type);
    }
}

