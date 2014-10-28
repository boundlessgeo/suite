/* (c) 2014 Boundless, http://boundlessgeo.com
 * This code is licensed under the GPL 2.0 license.
 */
package com.boundlessgeo.geoserver.api.controllers;

import static junit.framework.TestCase.assertNotNull;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.Matchers.isA;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Collections;

import javax.annotation.Nullable;

import org.geoserver.catalog.Catalog;
import org.geoserver.catalog.LayerGroupInfo;
import org.geoserver.config.GeoServer;
import org.geoserver.security.impl.GeoServerRole;
import org.geoserver.security.impl.GeoServerUser;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.boundlessgeo.geoserver.api.converters.JSONMessageConverter;
import com.boundlessgeo.geoserver.api.exceptions.BadRequestException;
import com.boundlessgeo.geoserver.json.JSONArr;
import com.boundlessgeo.geoserver.json.JSONObj;
import com.boundlessgeo.geoserver.json.JSONWrapper;
import com.google.common.base.Predicate;
import com.google.common.collect.Iterables;
import com.mockrunner.mock.web.MockServletContext;

public class MapControllerTest {

    @Mock
    GeoServer geoServer;

    @InjectMocks
    MapController ctrl;

    MockMvc mvc;

    @Before
    public void setUpMVC() {
        MockitoAnnotations.initMocks(this);

        mvc = MockMvcBuilders.standaloneSetup(ctrl).setMessageConverters(new JSONMessageConverter()).build();
    }

    @Before
    public void setUpAuth() {
 
        GeoServerUser bob = GeoServerUser.createDefaultAdmin();
        //GroupAdminProperty.set(bob.getProperties(), new String[]{"users"});
        Authentication auth = new UsernamePasswordAuthenticationToken(
            bob, bob.getPassword(), Collections.singletonList(GeoServerRole.GROUP_ADMIN_ROLE));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
    
    @After
    public void clearAuth() {
        SecurityContextHolder.getContext().setAuthentication(null);
    }
    
    @Test
    public void testCreate() throws Exception {
        MockGeoServer.get().catalog()
            .workspace("foo", "http://scratch.org", true)
                .layer("one").featureType().defaults()
            .geoServer().build(geoServer);

        JSONObj obj = new JSONObj();
        obj.put("name", "foo");
        obj.put("title", "Foo");
        obj.putObject("proj").put("srs", "EPSG:4326");
        obj.putArray("layers").addObject().put("name", "one");

        MockHttpServletRequestBuilder req = post("/api/maps/foo")
            .contentType(MediaType.APPLICATION_JSON)
            .content(obj.toString());

        mvc.perform(req)
            .andExpect(status().isCreated())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        Catalog cat = geoServer.getCatalog();
        verify(cat, times(1)).add(isA(LayerGroupInfo.class));
    }

    @Test
    public void testCreateAlreadyExists() throws Exception {
        MockGeoServer.get().catalog()
            .workspace("foo", "http://scratch.org", true)
                .map("map1")
            .geoServer().build(geoServer);

        JSONObj obj = new JSONObj();
        obj.put("name", "map1");
        obj.put("title", "Map1");
        obj.putObject("proj").put("srs", "EPSG:4326");
        obj.putArray("layers").addObject().put("name", "one");

        MockHttpServletRequestBuilder reqBuilder = post("/api/maps/foo")
            .contentType(MediaType.APPLICATION_JSON)
            .content(obj.toString());

        @SuppressWarnings("unused")
        MockHttpServletRequest req = reqBuilder.buildRequest(new MockServletContext());
        try {
            new MapController(geoServer).create("foo", new JSONObj().put("name", "map1"));
            fail();
        }
        catch(BadRequestException e) {
            assertTrue(e.getMessage().contains("already exists"));
        }
    }

    @Test
    public void testList() throws Exception {
        MockGeoServer.get().catalog()
          .resources()
            .resource("workspaces/foo/layergroups/map1.xml", "layergroup placeholder")
            .resource("workspaces/foo/layergroups/map2.xml", "layergroup placeholder")
          .geoServer()
            .catalog()
          .workspace("foo", "http://scratch.org", true)
            .map("map1")
              .defaults()
              .layer("one").featureType().defaults().map()
              .layer("two").featureType().defaults().map().workspace()
            .map("map2")
              .defaults()
              .layer("three").featureType().defaults().map()
              .layer("four").featureType().defaults()
          .geoServer().build(geoServer);

        MvcResult result = mvc.perform(get("/api/maps/foo"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        JSONArr arr = JSONWrapper.read(result.getResponse().getContentAsString()).toArray();
        assertEquals(2,arr.size());

        Iterables.find(arr, new Predicate<Object>() {
            @Override
            public boolean apply(@Nullable Object o) {
                return "map1".equals(JSONWrapper.wrap(o).toObject().str("name"));
            }
        });
        Iterables.find(arr, new Predicate<Object>() {
            @Override
            public boolean apply(@Nullable Object o) {
                return "map2".equals(JSONWrapper.wrap(o).toObject().str("name"));
            }
        });
    }

    @Test
    public void testGet() throws Exception {
        @SuppressWarnings("unused")
        GeoServer gs = MockGeoServer.get().catalog()
          .resources()
            .resource("workspaces/foo/layergroups/map.xml", "layergroup placeholder")
          .geoServer()
            .catalog()
              .workspace("foo", "http://scratch.org", true)
                .map("map")
                  .defaults()
                  .info("The map", "This map is cool!")
                  .layer("one").featureType().defaults().map()
                  .layer("two").featureType().defaults()
          .geoServer().build(geoServer);
        
        MvcResult result = mvc.perform(get("/api/maps/foo/map"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andReturn();

        JSONObj obj = JSONWrapper.read(result.getResponse().getContentAsString()).toObject();
        assertEquals("map", obj.str("name"));
        assertEquals("foo", obj.str("workspace"));
        assertEquals("The map", obj.str("title"));
        assertEquals("This map is cool!", obj.str("description"));
        
        assertEquals(-180d, obj.object("bbox").doub("west"), 0.1);
        assertEquals(-90d, obj.object("bbox").doub("south"), 0.1);
        assertEquals(180d, obj.object("bbox").doub("east"), 0.1);
        assertEquals(90d, obj.object("bbox").doub("north"), 0.1);
        assertEquals(0d, obj.object("bbox").array("center").doub(0), 0.1);
        assertEquals(0d, obj.object("bbox").array("center").doub(1), 0.1);

        assertEquals(2, obj.array("layers").size());

        Iterables.find(obj.array("layers"), new Predicate<Object>() {
            @Override
            public boolean apply(@Nullable Object o) {
                return "one".equals(JSONWrapper.wrap(o).toObject().str("name"));
            }
        });
        Iterables.find(obj.array("layers"), new Predicate<Object>() {
            @Override
            public boolean apply(@Nullable Object o) {
                return "two".equals(JSONWrapper.wrap(o).toObject().str("name"));
            }
        });

        assertNotNull(obj.get("modified"));
    }

    @Test
    public void testGetLayers() throws Exception {
        @SuppressWarnings("unused")
        GeoServer gs = MockGeoServer.get().catalog()
            .workspace("foo", "http://scratch.org", true)
                .map("map")
                    .defaults()
                    .layer("one").featureType().defaults().map()
                    .layer("two").featureType().defaults()
            .geoServer().build(geoServer);

        MvcResult result = mvc.perform(get("/api/maps/foo/map/layers"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        JSONArr arr = JSONWrapper.read(result.getResponse().getContentAsString()).toArray();
        assertEquals(2, arr.size());

        JSONObj obj = arr.object(0);
        assertEquals("two", obj.str("name"));
        assertEquals("vector", obj.str("type"));

        obj = arr.object(1);
        assertEquals("one", obj.str("name"));
        assertEquals("vector", obj.str("type"));
    }

    @Test
    public void testPutLayers() throws Exception {
        @SuppressWarnings("unused")
        GeoServer gs = MockGeoServer.get().catalog()
            .workspace("foo", "http://scratch.org", true)
                .map("map")
                    .defaults()
                    .layer("one")
                        .style().ysld("one.ysld").layer()
                        .featureType().defaults().map()
                    .layer("two")
                        .style().ysld("two.ysld").layer()
                        .featureType().defaults()
            .geoServer().build(geoServer);

        JSONArr arr = new JSONArr();
        arr.addObject().put("name", "two");
        arr.addObject().put("name", "one");

        MockHttpServletRequestBuilder req = put("/api/maps/foo/map/layers")
            .contentType(MediaType.APPLICATION_JSON)
            .content(arr.toString());

        @SuppressWarnings("unused")
        MvcResult result = mvc.perform(req)
            .andExpect(status().isOk())
            .andReturn();

        LayerGroupInfo m = geoServer.getCatalog().getLayerGroupByName("map");
        assertNotNull(m);
        
        assertEquals( "one", m.getLayers().get(0).getName() );
        assertEquals( "two", m.getLayers().get(1).getName() );

        assertEquals( "one.ysld", m.getStyles().get(0).getFilename() );
        assertEquals( "two.ysld", m.getStyles().get(1).getFilename() );
    }
    
    @Test
    public void testRecentMaps() throws Exception {
        @SuppressWarnings("unused")
        GeoServer gs = MockGeoServer.get().catalog()
            .workspace("foo", "http://scratch.org", true)
            .map("map1")
              .defaults()
              .layer("one").featureType().defaults().map().workspace()
            .map("map2")
              .defaults()
              .layer("one").featureType().defaults().map().workspace()
            .map("map3")
              .defaults()
              .layer("one").featureType().defaults()
            .geoServer().build(geoServer);
        
        JSONObj obj;
        MockHttpServletRequestBuilder req;

        obj = new JSONObj().put("title", "new title");
        req = put("/api/maps/foo/map3")
            .contentType(MediaType.APPLICATION_JSON)
            .content(obj.toString());
        mvc.perform(req).andExpect(status().isOk()).andReturn();
        
        obj = new JSONObj().put("title", "new title");
        req = put("/api/maps/foo/map2")
            .contentType(MediaType.APPLICATION_JSON)
            .content(obj.toString());
        mvc.perform(req).andExpect(status().isOk()).andReturn();
        
        obj = new JSONObj().put("title", "new title");
        req = put("/api/maps/foo/map1")
            .contentType(MediaType.APPLICATION_JSON)
            .content(obj.toString());
        mvc.perform(req).andExpect(status().isOk()).andReturn();
        
        
        MvcResult result = mvc.perform(get("/api/maps/recent"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andReturn();
        JSONArr arr = JSONWrapper.read(result.getResponse().getContentAsString()).toArray();
        assertTrue(arr.size() == Math.min(ApiController.RECENT_CACHE_SIZE, 3));
        
        for(int i = 0; i < Math.min(ApiController.RECENT_CACHE_SIZE, 3); i++) {
            obj = arr.object(i);
            assertEquals("map"+(i+1), obj.str("name"));
        }
    }

}
