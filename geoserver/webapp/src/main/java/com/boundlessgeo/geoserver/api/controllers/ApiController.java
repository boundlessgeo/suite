/* (c) 2014 Boundless, http://boundlessgeo.com
 * This code is licensed under the GPL 2.0 license.
 */
package com.boundlessgeo.geoserver.api.controllers;

import java.util.Iterator;

import javax.annotation.Nullable;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.geoserver.catalog.Catalog;
import org.geoserver.catalog.LayerInfo;
import org.geoserver.catalog.NamespaceInfo;
import org.geoserver.catalog.StoreInfo;
import org.geoserver.catalog.WorkspaceInfo;
import org.geoserver.config.GeoServer;
import org.geoserver.config.GeoServerDataDirectory;

import com.boundlessgeo.geoserver.api.exceptions.NotFoundException;
import com.google.common.base.Predicate;
import com.google.common.collect.Iterables;

/**
 * Base class for api controllers.
 */
public abstract class ApiController {
    public static final int RECENT_CACHE_SIZE = 10;
    public static final int DEFAULT_PAGESIZE = 25;

    protected GeoServer geoServer;

    public ApiController(GeoServer geoServer) {
        this.geoServer = geoServer;
    }

    public Catalog catalog() {
        return geoServer.getCatalog();
    }

    protected GeoServerDataDirectory dataDir() {
        return new GeoServerDataDirectory(geoServer.getCatalog().getResourceLoader());
    }

    protected Integer page(HttpServletRequest req) {
        String page = req.getParameter("page");
        return page != null ? Integer.parseInt(page) : null;
    }

    protected Integer pageSize(HttpServletRequest req, Integer def) {
        String size = req.getParameter("pagesize");
        return size != null ? Integer.parseInt(size) : def;
    }

    protected Integer offset(HttpServletRequest req) {
        Integer page = page(req);
        return page != null ? page * count(req) : null;
    }

    protected Integer count(HttpServletRequest req) {
        return pageSize(req, 25);
    }

    protected WorkspaceInfo findWorkspace(String wsName, Catalog cat) {
        WorkspaceInfo ws = cat.getWorkspaceByName(wsName);
        if (ws == null) {
            throw new NotFoundException(String.format("No such workspace %s", wsName));
        }
        return ws;
    }

    protected LayerInfo findLayer(String wsName, String name, Catalog cat) {
        LayerInfo l = cat.getLayerByName(wsName+":"+name);
        if( l == null ){
            throw new NotFoundException(String.format("No such layer %s:%s", wsName, name));
        }
        return l;
    }

    protected StoreInfo findStore(String wsName, String name, Catalog cat) {
        StoreInfo s = cat.getStoreByName(wsName, name, StoreInfo.class);
        if (s == null) {
            throw new NotFoundException(String.format("No such store %s:%s", wsName, name));
        }
        return s;
    }

    /**
     * Returns the namespace associated with the specified workspace.
     */
    protected NamespaceInfo namespaceFor(WorkspaceInfo ws) {
        return geoServer.getCatalog().getNamespaceByPrefix(ws.getName());
    }

    protected ServletFileUpload newFileUpload() {
        DiskFileItemFactory diskFactory = new DiskFileItemFactory();
        diskFactory.setSizeThreshold(1024*1024*256); // TODO: make this configurable

        return new ServletFileUpload(diskFactory);
    }

    @SuppressWarnings("unchecked")
    protected Iterator<FileItem> doFileUpload(HttpServletRequest request) throws FileUploadException {
        ServletFileUpload upload = newFileUpload();

        // filter out only file fields
        return Iterables.filter(upload.parseRequest(request), new Predicate<FileItem>() {
            @Override
            public boolean apply(@Nullable FileItem input) {
            return !input.isFormField() && input.getName() != null;
            }
        }).iterator();
    }
}
