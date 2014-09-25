package org.opengeo.app;

import net.sf.json.JSONArray;
import org.apache.commons.io.IOUtils;
import org.geoserver.catalog.Catalog;
import org.geoserver.importer.Importer;
import org.geoserver.platform.GeoServerExtensions;
import org.geoserver.test.GeoServerSystemTestSupport;
import org.junit.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import javax.mail.internet.InternetHeaders;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMultipart;

import java.io.ByteArrayOutputStream;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

public class AppIntegrationTest extends GeoServerSystemTestSupport {

    @Test
    public void testPageLayers() throws Exception {
        JSONArray arr = (JSONArray) getAsJSON(("/app/backend/layers/sf"));
        assertEquals(3, arr.size());

        arr = (JSONArray) getAsJSON(("/app/backend/layers/sf?page=1&pagesize=1"));
        assertEquals(1, arr.size());
    }

    @Test
    public void testImportFile() throws Exception {
        Catalog catalog = getCatalog();
        assertNull(catalog.getLayerByName("gs:point"));

        Importer importer =
            GeoServerExtensions.bean(Importer.class, applicationContext);
        ImportController ctrl = new ImportController(getGeoServer(), importer);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setContextPath("/geoserver");
        request.setRequestURI("/geoserver/hello");
        request.setMethod("post");

        MimeMultipart body = new MimeMultipart();
        request.setContentType(body.getContentType());

        InternetHeaders headers = new InternetHeaders();
        headers.setHeader("Content-Disposition", "form-data; name=\"upload\"; filename=\"point.zip\"");
        headers.setHeader("Content-Type", "application/zip");
        body.addBodyPart(new MimeBodyPart(headers,
            IOUtils.toByteArray(getClass().getResourceAsStream("point.shp.zip"))));

        ByteArrayOutputStream bout = new ByteArrayOutputStream();
        body.writeTo(bout);

        request.setContent(bout.toByteArray());
        JSONObj result = ctrl.create("gs", request);

        assertEquals(1, result.array("imported").size());
        JSONObj obj = result.array("imported").object(0);

        assertEquals("gs", obj.object("layer").str("workspace"));
        assertEquals("point", obj.object("layer").str("name"));

        assertNotNull(catalog.getLayerByName("gs:point"));
    }
}
