package org.opengeo.app;

import static org.geoserver.catalog.Predicates.equal;

import java.io.IOException;
import java.io.OutputStream;
import java.net.URI;
import java.net.URL;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.apache.wicket.util.file.Files;
import org.geoserver.catalog.CascadeDeleteVisitor;
import org.geoserver.catalog.Catalog;
import org.geoserver.catalog.LayerInfo;
import org.geoserver.catalog.ResourceInfo;
import org.geoserver.catalog.StyleHandler;
import org.geoserver.catalog.StyleInfo;
import org.geoserver.catalog.Styles;
import org.geoserver.catalog.WorkspaceInfo;
import org.geoserver.catalog.util.CloseableIterator;
import org.geoserver.config.GeoServer;
import org.geoserver.importer.Importer;
import org.geoserver.platform.GeoServerResourceLoader;
import org.geoserver.platform.resource.Paths;
import org.geoserver.platform.resource.Resource;
import org.geoserver.platform.resource.Resource.Type;
import org.geoserver.ysld.YsldHandler;

import org.geotools.geometry.jts.ReferencedEnvelope;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.geotools.styling.ResourceLocator;
import org.geotools.styling.Style;
import org.geotools.styling.StyledLayerDescriptor;
import org.geotools.util.KVP;
import org.geotools.util.Version;
import org.geotools.util.logging.Logging;
import org.geotools.ysld.Ysld;
import org.opengis.metadata.citation.OnLineResource;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.yaml.snakeyaml.error.Mark;
import org.yaml.snakeyaml.error.MarkedYAMLException;

import com.google.common.io.ByteSource;

@Controller
@RequestMapping("/backend/layers")
public class LayerController extends AppController {

    static Logger LOG = Logging.getLogger(LayerController.class);

    Importer importer;

    @Autowired
    public LayerController(GeoServer geoServer, Importer importer) {
        super(geoServer);
        this.importer = importer;
    }

    @RequestMapping(value="/{wsName}", method = RequestMethod.GET)
    public @ResponseBody JSONArr list(@PathVariable String wsName, HttpServletRequest req) {
        JSONArr arr = new JSONArr();

        Catalog cat = geoServer.getCatalog();

        if ("default".equals(wsName)) {
            WorkspaceInfo def = cat.getDefaultWorkspace();
            if (def != null) {
                wsName = def.getName();
            }
        }

        CloseableIterator<LayerInfo> it = cat.list(LayerInfo.class, equal("resource.namespace.prefix", wsName),
            offset(req), count(req), null);
        try {
            while (it.hasNext()) {
                IO.layer(arr.addObject(), it.next());
            }
        }
        finally {
            it.close();
        }

        return arr;
    }

    @RequestMapping(value="/{wsName}/{name}", method = RequestMethod.GET)
    public @ResponseBody JSONObj get(@PathVariable String wsName, @PathVariable String name) {
        LayerInfo l = findLayer(wsName, name, geoServer.getCatalog());
        return IO.layer(new JSONObj(), l);
    }

    @RequestMapping(value="/{wsName}/{name}", method = RequestMethod.DELETE)
    public @ResponseBody void delete(@PathVariable String wsName, @PathVariable String name) throws IOException {
        Catalog cat = geoServer.getCatalog();
        LayerInfo layer = findLayer(wsName, name, cat);
        new CascadeDeleteVisitor(cat).visit(layer);
    }

    @RequestMapping(value="/{wsName}/{name}", method = RequestMethod.PATCH)
    public @ResponseBody JSONObj patch(@PathVariable String wsName, @PathVariable String name, @RequestBody JSONObj obj) throws IOException {
        return  put(wsName, name, obj);
    }

    @RequestMapping(value="/{wsName}/{name}", method = RequestMethod.PUT, consumes = MediaType.APPLICATION_JSON_VALUE)
    public @ResponseBody JSONObj put(@PathVariable String wsName, @PathVariable String name, @RequestBody JSONObj obj) throws IOException {
        Catalog cat = geoServer.getCatalog();

        LayerInfo layer = findLayer(wsName, name, cat);
        ResourceInfo resource = layer.getResource();

        for (String prop : obj.keys()) {
            if ("title".equals(prop)) {
                layer.setTitle(obj.str("title"));
            }
            else if ("description".equals(prop)) {
                layer.setAbstract(obj.str("description"));
            }
            else if ("bbox".equals(prop)) {
                JSONObj bbox = obj.object("bbox");
                if (bbox.has("native")) {
                    resource.setNativeBoundingBox(
                        new ReferencedEnvelope(IO.bounds(bbox.object("native")), resource.getCRS()));
                }
                if (bbox.has("lonlat")) {
                    resource.setNativeBoundingBox(
                        new ReferencedEnvelope(IO.bounds(bbox.object("lonlat")), DefaultGeographicCRS.WGS84));
                }
            }
            else if ("proj".equals(prop)) {
                JSONObj proj = obj.object("proj");
                if (!proj.has("srs")) {
                    throw new BadRequestException("proj property must contain a 'srs' property");
                }

                String srs = proj.str("srs");
                try {
                    CRS.decode(srs);
                } catch (Exception e) {
                    throw new BadRequestException("Unknown spatial reference identifier: " + srs);
                }

                resource.setSRS(srs);
            }
        }

        cat.save(resource);
        cat.save(layer);

        return get(wsName, name);
    }

    @RequestMapping(value="/{wsName}/{name}/style", method = RequestMethod.GET, produces = YsldHandler.MIMETYPE)
    public @ResponseBody Object style(@PathVariable String wsName, @PathVariable String name)
        throws IOException {
        Catalog cat = geoServer.getCatalog();
        LayerInfo l = findLayer(wsName, name, cat);
        StyleInfo s = l.getDefaultStyle();
        if (s == null) {
            throw new NotFoundException(String.format("Layer %s:%s has no default style", wsName, name));
        }

        // if the style is already stored in ySLD format just pull it directly, otherwise encode the style
        if (YsldHandler.FORMAT.equalsIgnoreCase(s.getFormat())) {
            return dataDir().style(s);
        }
        else {            
            GeoServerResourceLoader rl = cat.getResourceLoader();
            String path;
            if( s.getWorkspace() == null ){
                path = Paths.path("styles",s.getFilename());
            }
            else {
                path = Paths.path("workspaces",s.getWorkspace().getName(),"styles",s.getFilename());
            }
            final Resource r = rl.get(path);
            
            // Similar to s.getStyle() and GeoServerDataDirectory.parsedStyle(s)
            // But avoid resolving external graphics to absolute file references 
            if ( r == null || r.getType() == Type.UNDEFINED ){
                throw new IOException( "No such resource: " + s.getFilename());
            }
            // Force use of unmodified URI, avoiding absolute file references
            ResourceLocator locator = new ResourceLocator(){
                public URL locateResource(String spec) {
                    return null;
                }
            };            
            StyleHandler handler = Styles.handler(s.getFormat());
            StyledLayerDescriptor sld = handler.parse(r, s.getFormatVersion(), locator, null);
            
            final Style style = Styles.style(sld); // extract 1st style
            return Styles.sld(style);              // encode in generated SLD
        }
    }

    public static KVP ICON_FORMATS = new KVP(
            "png","image/png",
            "jpeg","image/jpeg",
            "jpg","image/jpeg",
            "gif","image/gif",
            "svg","image/svg+xml",
            "ttf","application/font-sfnt",
            "properties","text/x-java-properties");
    
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/{wsName}/{name}/style/icons", method = RequestMethod.GET)
    public @ResponseBody JSONArr icons(@PathVariable String wsName, @PathVariable String name)
            throws IOException {
        JSONArr arr = new JSONArr();

        Catalog cat = geoServer.getCatalog();
        LayerInfo l = findLayer(wsName, name, cat);
        StyleInfo s = l.getDefaultStyle();
        WorkspaceInfo ws;
        if ("default".equals(wsName)) {
            ws = cat.getDefaultWorkspace();
            wsName = ws.getName();
        } else {
            ws = cat.getWorkspaceByName(wsName);
        }
        if (ws == null) {
            throw new RuntimeException("Unable to find workspace " + wsName);
        }
        if (s == null) {
            throw new NotFoundException(String.format("Layer %s:%s has no default style", wsName, name));
        }
        // check what icons/fonts are referenced style
        //
        Set<String> referenced;
        Style style = s.getStyle();
        
        if( style != null ){
            referenced = (Set<String>) style.accept(new StyleAdaptor() {
                public Object visit(OnLineResource resource, Object data) {
                    URI uri = resource.getLinkage();
                    if (uri != null) {
                        String filename = Files.filename(uri.getPath());
                        if( data == null ){
                            data = new HashSet<String>();
                        }
                        if (filename != null) {
                            ((Set<String>) data).add(filename);
                        }
                    }
                    return data;
                }
            }, new HashSet<String>());
        }
        else {
            referenced = Collections.emptySet();
        }
        GeoServerResourceLoader rl = cat.getResourceLoader();
        
        // Scan workspace styles directory for supported formats
        String path = Paths.path("workspaces",ws.getName(), "styles");
        Resource styles = rl.get(path);
        for( Resource r : styles.list() ){
            String n = r.name();
            if (n == null || n.lastIndexOf('.') == -1) {
                continue;
            }
            String ext = n.substring(n.lastIndexOf('.') + 1);
            if( !ICON_FORMATS.containsKey(ext.toLowerCase())){
                continue;
            }
            Object format = ICON_FORMATS.get(ext.toLowerCase());
            JSONObj item = arr.addObject().put("name",n).
               put("format",ext).
               put("mime",format);
            if( referenced.contains(n)){
               item.put("used", true );
            }
        }
        return arr;
    }
 
    @RequestMapping(value="/{wsName}/{name}/style", method = RequestMethod.PUT, consumes = YsldHandler.MIMETYPE)
    public @ResponseBody void style(@RequestBody byte[] rawStyle, @PathVariable String wsName, @PathVariable String name)
        throws IOException {
        // first thing is sanity check on the style content
        List<MarkedYAMLException> errors = Ysld.validate(ByteSource.wrap(rawStyle).openStream());
        if (!errors.isEmpty()) {
            throw new InvalidYsldException(errors);
        }

        Catalog cat = geoServer.getCatalog();
        WorkspaceInfo ws = findWorkspace(wsName, cat);
        LayerInfo l = findLayer(wsName, name, cat);

        StyleInfo s = l.getDefaultStyle();

        if (s == null) {
            // create one
            s = cat.getFactory().createStyle();
            s.setName(findUniqueStyleName(wsName, name, cat));
            s.setFilename(s.getName()+".yaml");
            s.setWorkspace(ws);
        }
        else {
            // we are converting from normal SLD?
            if (!YsldHandler.FORMAT.equalsIgnoreCase(s.getFormat())) {
                // reuse base file name
                String base = FilenameUtils.getBaseName(s.getFilename());
                s.setFilename(base + ".yaml");
            }
         }

        s.setFormat(YsldHandler.FORMAT);
        s.setFormatVersion(new Version("1.0.0"));

        // write out the resource
        OutputStream output = dataDir().style(s).out();
        try {
            try {
                IOUtils.copy(ByteSource.wrap(rawStyle).openStream(), output);
                output.flush();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        finally {
            IOUtils.closeQuietly(output);
        }

        if (s.getId() == null) {
            cat.add(s);
        }
        else {
            cat.save(s);
        }
    }

    @ExceptionHandler(InvalidYsldException.class)
    public @ResponseBody JSONObj error(InvalidYsldException e, HttpServletResponse response) {
        response.setStatus(HttpStatus.BAD_REQUEST.value());

        JSONObj obj = new JSONObj()
            .put("message", e.getMessage())
            .put("trace", AppExceptionHandler.trace(e));

        JSONArr errors = obj.putArray("errors");
        for (MarkedYAMLException error : e.errors()) {
            JSONObj err = errors.addObject()
                .put("problem", error.getProblem());
            Mark mark = error.getProblemMark();
            if (mark != null) {
                err.put("line", mark.getLine()).put("column", mark.getColumn());
            }
        }
        return obj;
    }

    String findUniqueStyleName(String wsName, String name, Catalog cat) {
        String tryName = name;
        int i = 0;
        while (i++ < 100) {
            if (cat.getStyleByName(wsName, tryName) == null) {
                return tryName;
            }
            tryName = name + String.valueOf(i);
        }
        throw new RuntimeException("Unable to find unique name for style");
    }
}
