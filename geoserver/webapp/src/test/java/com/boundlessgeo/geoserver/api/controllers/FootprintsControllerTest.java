
 package com.boundlessgeo.geoserver.api.controllers;  import static org.junit.Assert.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;

import org.geoserver.config.GeoServer;
import org.geowebcache.grid.BoundingBox;

import org.json.simple.JSONArray;

import org.junit.Before;
import org.junit.Test;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.boundlessgeo.geoserver.api.converters.JSONMessageConverter;
import com.boundlessgeo.geoserver.json.JSONArr;
import com.boundlessgeo.geoserver.json.JSONObj;
import com.boundlessgeo.geoserver.json.JSONWrapper;
import com.boundlessgeo.geoserver.api.exceptions.BadRequestException;

public class FootprintsControllerTest {

    @Mock
    GeoServer geoServer;
    
    @InjectMocks
    FootprintsController ctrl;
    
    MockMvc mvc;
    
    @Before
    public void setUp() {
        MockitoAnnotations.initMocks(this);

        mvc = MockMvcBuilders.standaloneSetup(ctrl).setMessageConverters(new JSONMessageConverter()).build();
    }
    
    @Test
    public void testGet() throws Exception {
        // Setup workspaces to test
        String fooLayer1 = "foo_one", fooLayer2 = "foo_two", fooLayer3 = "foo_three",
                barLayer1 = "bar_one", barLayer2 = "bar_two";
        MockGeoServer.get().catalog()
            .workspace("foo", "http://scratch.org", true)
                .layer(fooLayer1).featureType().defaults().workspace()
                .layer(fooLayer2).featureType().defaults().workspace()
                .layer(fooLayer3).featureType().defaults().geoServer().catalog()
            .workspace("bar", "http://bar.org", false)
                .layer(barLayer1).featureType().defaults().workspace()
                .layer(barLayer2).featureType().defaults()
            .geoServer().build(geoServer);
        
        // Test workspace foo using the bounding box to filter
        BoundingBox bbox = new BoundingBox(1.5,2.1,3.9,4);
        String wsName = "foo";
        MvcResult result = mvc.perform(get("/api/footprints/" + wsName + "?bbox=" + bbox))
                .andExpect(status().isOk())
                .andReturn();
        
        JSONObj obj = JSONWrapper.read(result.getResponse().getContentAsString()).toObject();
        
        ArrayList<String> names = new ArrayList<String>();
        names.add(fooLayer1);
        names.add(fooLayer2);
        names.add(fooLayer3);
        testJSON(obj, names, bbox);
        names.clear();
        
        // Test workspace bar using the bounding box to filter
        wsName = "bar";
        result = mvc.perform(get("/api/footprints/" + wsName + "?bbox=" + bbox))
                .andExpect(status().isOk())
                .andReturn();
        
        obj = JSONWrapper.read(result.getResponse().getContentAsString()).toObject();
        
        names.add(barLayer1);
        names.add(barLayer2);
        testJSON(obj, names, bbox);
        names.clear();
        
        // Test error throwing for no bbox
        result = mvc.perform(get("/api/footprints/" + wsName + "?bbox="))
                .andExpect(status().isBadRequest())
                .andReturn();
        Exception e = result.getResolvedException();
        assertTrue(e instanceof BadRequestException);
        assertEquals("Unable to parse bbox: request must contain 4 comma separated values",
                e.getMessage());
        
        // Test error throwing for malformed bbox
        result = mvc.perform(get("/api/footprints/" + wsName + "?bbox=hel,lo,wor,ld"))
                .andExpect(status().isBadRequest())
                .andReturn();
        e = result.getResolvedException();
        assertTrue(e instanceof BadRequestException);
        assertEquals("Unable to parse bbox: hel is not a number", e.getMessage());
    }
    
    /**
     * Runs JUnit assertions to check that the JSON was generated correctly for
     * the mocked up layers in the workspace specified by the GET request.
     * @param obj - The JSONObj generated based on the response to the GET request
     * @param names - The names of the mocked up layers
     * @param bbox - The bounding box to filter the features
     */
    void testJSON(JSONObj obj, ArrayList<String> names, BoundingBox bbox) {
        JSONArr features = obj.array("features");
        assertEquals(names.size(), features.size());
        for(int i = 0; i < names.size(); i++) {
            JSONObj feature = features.object(i);
            assertEquals("Feature", feature.get("type"));
            assertNotNull(feature.get("id"));
            JSONObj properties = feature.object("properties");
            assertEquals(names.get(i), properties.get("name"));
            JSONObj geometry = properties.object("geometry");
            assertEquals("Polygon", geometry.get("type"));
            JSONArray coordinates = (JSONArray)geometry.get("coordinates");
            JSONArray subcoordinates = (JSONArray)coordinates.get(0);
            assertEquals(5, subcoordinates.size());
            assertNotNull(bbox);
            testBbox(subcoordinates, bbox);
        }
    }
    
    /**
     * The JSON output drops the decimal on the double if it's not necessary,
     * so the String to compare to the JSON needs to reflect this
     * Use an int format if it's equal in value to the double
     * @param coordinate1
     * @param coordinate2
     * @return String to compare these coordinates to the JSON output
     */
    String getCompareString(double coordinate1, double coordinate2) {
        return ("[" + ((int)coordinate1 == coordinate1 ? ("" + (int)coordinate1) : coordinate1) + ","
        + ((int)coordinate2 == coordinate2 ? ("" + (int)coordinate2) : coordinate2) + "]");
    }
    
    void testBbox(JSONArray subcoordinates, BoundingBox bbox) {
        String toCompare = getCompareString(bbox.getMinX(), bbox.getMaxX());
        assertEquals(toCompare, subcoordinates.get(0).toString());
        toCompare = getCompareString(bbox.getMinY(), bbox.getMaxX());
        assertEquals(toCompare, subcoordinates.get(1).toString());
        toCompare = getCompareString(bbox.getMinY(), bbox.getMaxY());
        assertEquals(toCompare, subcoordinates.get(2).toString());
        toCompare = getCompareString(bbox.getMinX(), bbox.getMaxY());
        assertEquals(toCompare, subcoordinates.get(3).toString());
        toCompare = getCompareString(bbox.getMinX(), bbox.getMaxX());
        assertEquals(toCompare, subcoordinates.get(4).toString());
    }
}

