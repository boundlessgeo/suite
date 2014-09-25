package org.opengeo.app;

import com.google.common.base.Predicate;
import com.google.common.collect.Iterables;
import org.geoserver.catalog.LayerGroupInfo;
import org.geoserver.catalog.LayerInfo;
import org.geoserver.catalog.PublishedInfo;
import org.geoserver.catalog.StyleInfo;
import org.geoserver.config.GeoServer;
import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentMatcher;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import javax.annotation.Nullable;

import java.util.Collection;
import java.util.List;

import static junit.framework.TestCase.assertNotNull;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyObject;
import static org.mockito.Matchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

    @Test
    public void testList() throws Exception {
        MockGeoServer.get().catalog()
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

        MvcResult result = mvc.perform(get("/backend/maps/foo"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        JSONArr arr = JSONWrapper.read(result.getResponse().getContentAsString()).toArray();
        assertEquals(arr.size(), 2);

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
        GeoServer gs = MockGeoServer.get().catalog()
          .workspace("foo", "http://scratch.org", true)
            .map("map")
              .defaults()
              .info("The map", "This map is cool!")
              .layer("one").featureType().defaults().map()
              .layer("two").featureType().defaults()
         .geoServer().build(geoServer);

        MvcResult result = mvc.perform(get("/backend/maps/foo/map"))
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
    }

    @Test
    public void testGetLayers() throws Exception {
        GeoServer gs = MockGeoServer.get().catalog()
            .workspace("foo", "http://scratch.org", true)
                .map("map")
                    .defaults()
                    .layer("one").featureType().defaults().map()
                    .layer("two").featureType().defaults()
            .geoServer().build(geoServer);

        MvcResult result = mvc.perform(get("/backend/maps/foo/map/layers"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andReturn();

        JSONArr arr = JSONWrapper.read(result.getResponse().getContentAsString()).toArray();
        assertEquals(2, arr.size());

        JSONObj obj = arr.object(0);
        assertEquals("one", obj.str("name"));
        assertEquals("vector", obj.str("type"));

        obj = arr.object(1);
        assertEquals("two", obj.str("name"));
        assertEquals("vector", obj.str("type"));
    }

    @Test
    public void testPutLayers() throws Exception {
        GeoServer gs = MockGeoServer.get().catalog()
            .workspace("foo", "http://scratch.org", true)
                .map("map")
                    .defaults()
                    .layer("one")
                        .style().ysld("one.ysld").layer().map()
                    .layer("two")
                        .style().ysld("two.ysld").layer()
            .geoServer().build(geoServer);

        JSONArr arr = new JSONArr();
        arr.addObject().put("name", "two");
        arr.addObject().put("name", "one");

        MockHttpServletRequestBuilder req = put("/backend/maps/foo/map/layers")
            .contentType(MediaType.APPLICATION_JSON)
            .content(arr.toString());

        MvcResult result = mvc.perform(req)
            .andExpect(status().isOk())
            .andReturn();

        LayerGroupInfo m = geoServer.getCatalog().getLayerGroupByName("map");
        assertNotNull(m);

        verify(m.getLayers()).clear();
        verify(m.getLayers()).addAll(argThat(new ArgumentMatcher<Collection>() {
            @Override
            public boolean matches(Object argument) {
                List l = (List) argument;
                return "one".equals(((LayerInfo)l.get(0)).getName()) &&
                       "two".equals(((LayerInfo)l.get(1)).getName());
            }
        }));

        verify(m.getStyles()).clear();
        verify(m.getStyles()).addAll(argThat(new ArgumentMatcher<Collection>() {
            @Override
            public boolean matches(Object argument) {
                List l = (List) argument;
                return "one.ysld".equals(((StyleInfo)l.get(0)).getFilename()) &&
                        "two.ysld".equals(((StyleInfo)l.get(1)).getFilename());
            }
        }));


        //assertEquals(2, map.getLayers().size());
    }

}
