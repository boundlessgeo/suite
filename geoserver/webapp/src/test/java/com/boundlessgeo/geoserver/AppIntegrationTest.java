/* (c) 2014-2014 Boundless, http://boundlessgeo.com
 * This code is licensed under the GPL 2.0 license.
 */
package com.boundlessgeo.geoserver;

import com.boundlessgeo.geoserver.api.controllers.IO;
import com.boundlessgeo.geoserver.api.controllers.IconController;
import com.boundlessgeo.geoserver.api.controllers.ImportController;
import com.boundlessgeo.geoserver.api.controllers.WorkspaceController;
import com.boundlessgeo.geoserver.json.JSONArr;
import com.boundlessgeo.geoserver.json.JSONObj;
import com.boundlessgeo.geoserver.util.RecentObjectCache;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.io.IOUtils;
import org.geoserver.catalog.Catalog;
import org.geoserver.catalog.CatalogBuilder;
import org.geoserver.catalog.FeatureTypeInfo;
import org.geoserver.catalog.LayerGroupInfo;
import org.geoserver.catalog.LayerInfo;
import org.geoserver.catalog.StoreInfo;
import org.geoserver.catalog.StyleInfo;
import org.geoserver.data.test.SystemTestData;
import org.geoserver.importer.Importer;
import org.geoserver.platform.GeoServerExtensions;
import org.geoserver.platform.resource.Resource;
import org.geoserver.test.GeoServerSystemTestSupport;
import org.geotools.referencing.CRS;
import org.junit.Before;
import org.junit.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import javax.mail.internet.InternetHeaders;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMultipart;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;

public class AppIntegrationTest extends GeoServerSystemTestSupport {

    @Override
    protected void setUpTestData(SystemTestData testData) throws Exception {
        super.setUpTestData(testData);
        testData.setUpWcs10RasterLayers();
    }

    @Before
    public void removeLayers() {
        removeLayer("gs", "foo");
        removeLayer("sf", "foo");
        removeLayer("cdf", "foo");
        
        removeLayer("gs", "point");
    }

    @Before
    public void removeMaps() {
        removeLayerGroup("sf", "map1");
        removeLayerGroup("sf", "map2");
    }

    @Test
    public void testPageLayers() throws Exception {
        JSONObject obj = (JSONObject) getAsJSON(("/app/api/layers/sf"));
        JSONArray arr = obj.getJSONArray("layers");
        assertEquals(3, arr.size());

        obj = (JSONObject) getAsJSON(("/app/api/layers/sf?page=1&count=1"));
        arr = obj.getJSONArray("layers");
        assertEquals(1, arr.size());
    }

    @Test
    public void testPageMaps() throws Exception {
        Catalog cat = getCatalog();
        CatalogBuilder catBuilder = new CatalogBuilder(cat);

        LayerInfo pgf = cat.getLayerByName("sf:PrimitiveGeoFeature");

        LayerGroupInfo map = cat.getFactory().createLayerGroup();
        map.setWorkspace(cat.getWorkspaceByName("sf"));
        map.setName("map1");
        map.getLayers().add(pgf);
        map.getStyles().add(null);
        catBuilder.calculateLayerGroupBounds(map);
        cat.add(map);

        map = cat.getFactory().createLayerGroup();
        map.setWorkspace(cat.getWorkspaceByName("sf"));
        map.setName("map2");
        map.getLayers().add(pgf);
        map.getStyles().add(null);
        catBuilder.calculateLayerGroupBounds(map);
        cat.add(map);

        JSONObject obj = (JSONObject) getAsJSON(("/app/api/maps/sf"));
        assertEquals(2, obj.getInt("total"));
        assertEquals(0, obj.getInt("page"));
        assertEquals(2, obj.getInt("count"));

        JSONArray arr = obj.getJSONArray("maps");
        assertEquals(2, arr.size());

        obj = (JSONObject) getAsJSON(("/app/api/maps/sf?page=1&count=1"));
        assertEquals(2, obj.getInt("total"));
        assertEquals(1, obj.getInt("page"));
        assertEquals(1, obj.getInt("count"));
        arr = obj.getJSONArray("maps");
        assertEquals(1, arr.size());
    }

    @Test
    public void testImportShapefileAsZip() throws Exception {
        Catalog catalog = getCatalog();
        assertNull(catalog.getLayerByName("gs:point"));

        Importer importer =
            GeoServerExtensions.bean(Importer.class, applicationContext);
        ImportController ctrl = new ImportController(getGeoServer(), importer);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setContextPath("/geoserver");
        request.setRequestURI("/geoserver/hello");
        request.setMethod("post");

        createMultiPartFormContent(request, "form-data; name=\"upload\"; filename=\"point.zip\"", "application/zip",
                IOUtils.toByteArray(getClass().getResourceAsStream("point.shp.zip")));

        JSONObj result = ctrl.importFile("gs", request);

        assertEquals(1, result.array("imported").size());
        JSONObj obj = result.array("imported").object(0);

        assertEquals("gs", obj.object("layer").str("workspace"));
        assertEquals("point", obj.object("layer").str("name"));

        LayerInfo l = catalog.getLayerByName("gs:point");
        assertNotNull(l);

        // ensure style in workspace
        StyleInfo s = l.getDefaultStyle();
        assertNotNull(s.getWorkspace());
        
        //Try to reimport the same store - should succeed
        createMultiPartFormContent(request, "form-data; name=\"upload\"; filename=\"point.zip\"", "application/zip",
                IOUtils.toByteArray(getClass().getResourceAsStream("point.shp.zip")));
        obj = ctrl.importFile("gs", request);
        
        assertNotNull(obj.get("id"));

    }
    
    @Test
    public void testImportShapefiles() throws Exception {
        Catalog catalog = getCatalog();
        assertNull(catalog.getLayerByName("gs:point"));

        Importer importer =
            GeoServerExtensions.bean(Importer.class, applicationContext);
        ImportController ctrl = new ImportController(getGeoServer(), importer);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setContextPath("/geoserver");
        request.setRequestURI("/geoserver/hello");
        request.setMethod("post");
        
        //Import as separate files
        MimeMultipart body = initMultiPartFormContent(request);

        appendMultiPartFormContent(body, "form-data; name=\"upload\"; filename=\"point.dbf\"", "application/octet-stream",
                IOUtils.toByteArray(getClass().getResourceAsStream("point.dbf")));
        appendMultiPartFormContent(body, "form-data; name=\"upload\"; filename=\"point.prj\"", "application/octet-stream",
                IOUtils.toByteArray(getClass().getResourceAsStream("point.prj")));
        appendMultiPartFormContent(body, "form-data; name=\"upload\"; filename=\"point.shp\"", "application/octet-stream",
                IOUtils.toByteArray(getClass().getResourceAsStream("point.shp")));
        appendMultiPartFormContent(body, "form-data; name=\"upload\"; filename=\"point.shx\"", "application/octet-stream",
                IOUtils.toByteArray(getClass().getResourceAsStream("point.shx")));
        
        createMultiPartFormContent(body, request);


        JSONObj result = ctrl.importFile("gs", request);

        assertEquals(1, result.array("imported").size());
        JSONObj obj = result.array("imported").object(0);

        assertEquals("gs", obj.object("layer").str("workspace"));
        assertEquals("point", obj.object("layer").str("name"));

        LayerInfo l = catalog.getLayerByName("gs:point");
        assertNotNull(l);

        // ensure style in workspace
        StyleInfo s = l.getDefaultStyle();
        assertNotNull(s.getWorkspace());
    }
    
    @Test
    public void testImportDb() throws Exception {
        Catalog catalog = getCatalog();
        assertNull(catalog.getLayerByName("gs:point"));
        
        Importer importer =
            GeoServerExtensions.bean(Importer.class, applicationContext);
        ImportController ctrl = new ImportController(getGeoServer(), importer);
        
        try (H2TestData data = new H2TestData()) {
            
            MockHttpServletRequest request = new MockHttpServletRequest();
            request.setContextPath("/geoserver");
            request.setRequestURI("/geoserver/hello");
            request.setMethod("post");
            
            JSONObj obj = data.createConnectionParameters();
            obj = ctrl.importDb("gs", obj, request);
            
            Long id = Long.parseLong(obj.get("id").toString());
            assertNotNull(id);
            JSONArr preimport = obj.array("preimport");
            assertTrue(3 <= preimport.size());
            assertEquals(0, obj.array("imported").size());
            assertEquals(0, obj.array("pending").size());
            assertEquals(0, obj.array("failed").size());
            assertEquals(0, obj.array("ignored").size());
            
            //Choose tables to import
            List<String> names = Arrays.asList(new String[]{"ft1","ft2","ft3"});
            JSONArr tasks = new JSONArr();
            for (JSONObj o : preimport.objects()) {
                if (names.contains(o.get("name"))) {
                    tasks.add(new JSONObj().put("task", o.get("task").toString()));
                    assertEquals("table", o.get("type"));
                }
            }
            assertEquals(3, tasks.size());
            JSONObj response = new JSONObj();
            response.put("tasks", tasks);
            
            obj = ctrl.update("gs", id, response, request);
            
            assertEquals(0, obj.array("preimport").size());
            assertEquals(1, obj.array("imported").size());
            assertEquals(2, obj.array("pending").size());
            assertEquals(0, obj.array("failed").size());
            assertEquals(preimport.size()-3, obj.array("ignored").size());
            
            obj = ctrl.get("gs",  id, request);
            
            //Set CRS
            tasks = new JSONArr();
            for (JSONObj o : obj.array("pending").objects()) {
                String srs = "EPSG:4326";
                tasks.add(new JSONObj().put("task", o.get("task").toString())
                                       .put("proj", IO.proj(new JSONObj(), CRS.decode(srs), srs)));
            }
            response = new JSONObj();
            response.put("tasks", tasks);
            
            obj = ctrl.update("gs", id, response, request);
            
            assertEquals(0, obj.array("preimport").size());
            assertEquals(3, obj.array("imported").size());
            assertEquals(0, obj.array("pending").size());
            assertEquals(0, obj.array("failed").size());
            assertEquals(preimport.size()-3, obj.array("ignored").size());
            
            //Try to reimport the same store - should fail and return existing store
            obj = data.createConnectionParameters();
            obj = ctrl.importDb("gs", obj, request);
            
            assertNotNull(obj.get("store"));
            assertNull(obj.get("id"));
        }
    }
    
    @Test
    public void testImportGeoJSONintoDb() throws IOException, Exception {
        Catalog catalog = getCatalog();
        StoreInfo targetStore = catalog.getStoreByName("sf", "sf", StoreInfo.class);
        assertNotNull(targetStore);
        
        Importer importer =
                GeoServerExtensions.bean(Importer.class, applicationContext);
        ImportController ctrl = new ImportController(getGeoServer(), importer);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setContextPath("/geoserver");
        request.setRequestURI("/geoserver/hello");
        request.setMethod("post");
        
        createMultiPartFormContent(request, "form-data; name=\"upload\"; filename=\"point.json\"", "application/json",
                IOUtils.toByteArray(getClass().getResourceAsStream("point.json")));

        JSONObj result = ctrl.importFile("sf", "sf", request);

        assertEquals(1, result.array("imported").size());
        JSONObj obj = result.array("imported").object(0);

        assertEquals("sf", obj.object("layer").str("workspace"));
        assertEquals("point", obj.object("layer").str("name"));

        LayerInfo l = catalog.getLayerByName("sf:point");
        assertNotNull(l);
        FeatureTypeInfo f = (FeatureTypeInfo)l.getResource();
        assertEquals(targetStore, f.getStore());

        // ensure style in workspace
        StyleInfo s = l.getDefaultStyle();
        assertNotNull(s.getWorkspace());
    }
    

    @Test
    public void testIconsUploadDelete() throws Exception {
        Catalog catalog = getCatalog();
        IconController ctrl = new IconController(getGeoServer());
        
        // test upload
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setContextPath("/geoserver");
        request.setRequestURI("/geoserver/api/icons");
        request.setMethod("post");

        createMultiPartFormContent(request, "form-data; name=\"icon\"; filename=\"STYLE.PROPERTIES\"",
            "text/x-java-properties", "square=LINESTRING((0 0,0 1,1 1,1 0,0 0))".getBytes() );

        JSONArr arr = ctrl.create("cite", request);
        assertEquals( 1, arr.size() );
        
        Resource r = catalog.getResourceLoader().get("workspaces/cite/styles/STYLE.PROPERTIES");
        assertEquals("created", Resource.Type.RESOURCE, r.getType() );
        
        // test delete
        MockHttpServletRequestBuilder delete = delete("/api/icons/foo/icon.png");
        boolean removed = ctrl.delete("cite","STYLE.PROPERTIES");
        assertEquals( true, removed );
    }

    @Test
    public void testWorkspaceExport() throws Exception {
        MockHttpServletResponse response = doWorkspaceExport("sf");

        assertEquals("application/zip", response.getContentType());
        assertEquals("attachment; filename=\"sf.zip\"", response.getHeader("Content-Disposition"));

        Path tmp = Files.createTempDirectory(Paths.get("target"), "export");
        org.geoserver.data.util.IOUtils.decompress(
            new ByteArrayInputStream(response.getContentAsByteArray()), tmp.toFile());

        assertTrue(tmp.resolve("bundle.json").toFile().exists());
    }

    @Test
    public void testWorkspaceImport() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        createMultiPartFormContent(request, "form-data; name=\"file\"; filename=\"sf.zip\"", "application/zip",
            doWorkspaceExport("sf").getContentAsByteArray());

        Catalog cat = getCatalog();
        assertNull(cat.getLayerByName("gs:PrimitiveGeoFeature"));

        MockHttpServletResponse response = new MockHttpServletResponse();
        WorkspaceController ctrl = new WorkspaceController(getGeoServer(), new RecentObjectCache());
        ctrl.inport("gs", request, response);

        assertNotNull(cat.getLayerByName("gs:PrimitiveGeoFeature"));
    }

    MockHttpServletResponse doWorkspaceExport(String wsName) throws Exception {
        WorkspaceController ctrl = new WorkspaceController(getGeoServer(), new RecentObjectCache());

        MockHttpServletResponse response = new MockHttpServletResponse();
        ctrl.export(wsName, response);

        return response;
    }

    void createMultiPartFormContent(MockHttpServletRequest request, String contentDisposition, String contentType,
        byte[] content) throws Exception {
        MimeMultipart body = new MimeMultipart();
        request.setContentType(body.getContentType());
        InternetHeaders headers = new InternetHeaders();
        headers.setHeader("Content-Disposition", contentDisposition);
        headers.setHeader("Content-Type", contentType);
        body.addBodyPart(new MimeBodyPart(headers, content ));

        ByteArrayOutputStream bout = new ByteArrayOutputStream();
        body.writeTo(bout);
        request.setContent(bout.toByteArray());
    }
    
    void createMultiPartFormContent(MimeMultipart body, MockHttpServletRequest request) throws Exception {
        ByteArrayOutputStream bout = new ByteArrayOutputStream();
        body.writeTo(bout);
        request.setContent(bout.toByteArray());
    }
    
    MimeMultipart initMultiPartFormContent(MockHttpServletRequest request) throws Exception {
        MimeMultipart body = new MimeMultipart();
        request.setContentType(body.getContentType());
        
        return body;
    }
    
    MimeMultipart appendMultiPartFormContent(MimeMultipart body, String contentDisposition, String contentType,
            byte[] content) throws Exception {
        InternetHeaders headers = new InternetHeaders();
        headers.setHeader("Content-Disposition", contentDisposition);
        headers.setHeader("Content-Type", contentType);
        body.addBodyPart(new MimeBodyPart(headers, content ));

        return body;
    }

    @Test
    public void testCreateLayerFromCopy() throws Exception {
        Catalog catalog = getCatalog();
        assertNull(catalog.getLayerByName("sf:foo"));

        JSONObj obj = new JSONObj();
        obj.put("name", "foo");
        obj.putObject("layer")
            .put("name", "PrimitiveGeoFeature")
            .put("workspace", "sf");

        com.mockrunner.mock.web.MockHttpServletResponse resp =
            postAsServletResponse("/app/api/layers/sf", obj.toString(), MediaType.APPLICATION_JSON_VALUE);
        assertEquals(201,resp.getStatusCode());

        assertNotNull(catalog.getLayerByName("sf:foo"));
    }

    @Test
    public void testCreateLayerFromResource() throws Exception {
        Catalog catalog = getCatalog();
        assertNull(catalog.getLayerByName("sf:foo"));

        JSONObj obj = new JSONObj();
        obj.put("name", "foo");
        obj.putObject("resource")
            .put("name", "PrimitiveGeoFeature")
            .put("store", "sf")
            .put("workspace", "sf");

        com.mockrunner.mock.web.MockHttpServletResponse resp =
                postAsServletResponse("/app/api/layers/sf", obj.toString(), MediaType.APPLICATION_JSON_VALUE);
        assertEquals(resp.getStatusCode(), 201);

        assertNotNull(catalog.getLayerByName("sf:foo"));
    }

    @Test
    public void testCreateLayerFromRasterResource() throws Exception {
        Catalog catalog = getCatalog();
        assertNull(catalog.getLayerByName("cdf:foo"));
        assertNotNull(catalog.getLayerByName("cdf:usa"));

        JSONObj obj = new JSONObj();
        obj.put("name", "foo");
        obj.putObject("resource")
                .put("name", "usa")
                .put("store", "usa")
                .put("workspace", "cdf");

        com.mockrunner.mock.web.MockHttpServletResponse resp =
            postAsServletResponse("/app/api/layers/cdf", obj.toString(), MediaType.APPLICATION_JSON_VALUE);
        assertEquals(resp.getStatusCode(), 201);

        assertNotNull(catalog.getLayerByName("cdf:foo"));

    }
}
