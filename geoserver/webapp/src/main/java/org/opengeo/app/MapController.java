package org.opengeo.app;

import com.google.common.base.Function;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.geoserver.catalog.Catalog;
import org.geoserver.catalog.FeatureTypeInfo;
import org.geoserver.catalog.LayerGroupInfo;
import org.geoserver.catalog.LayerInfo;
import org.geoserver.catalog.PublishedInfo;
import org.geoserver.catalog.ResourceInfo;
import org.geoserver.catalog.StyleInfo;
import org.geoserver.catalog.WorkspaceInfo;
import org.geoserver.catalog.util.CloseableIterator;
import org.geoserver.config.GeoServer;
import org.geotools.feature.NameImpl;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.geotools.util.logging.Logging;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.annotation.Nullable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import static org.geoserver.catalog.Predicates.equal;

@Controller
@RequestMapping("/backend/maps")
public class MapController extends AppController {

    static Logger LOG = Logging.getLogger(LayerController.class);

    @Autowired
    public MapController(GeoServer geoServer) {
        super(geoServer);
    }

    @RequestMapping(value="/{wsName}", method = RequestMethod.GET)
    public @ResponseBody
    JSONArr list(@PathVariable String wsName) {
        JSONArr arr = new JSONArr();

        Catalog cat = geoServer.getCatalog();

        if ("default".equals(wsName)) {
            WorkspaceInfo def = cat.getDefaultWorkspace();
            if (def != null) {
                wsName = def.getName();
            }
        }

        CloseableIterator<LayerGroupInfo> it = cat.list(LayerGroupInfo.class, equal("workspace.name", wsName));
        try {
            while (it.hasNext()) {
                map(arr.addObject(), it.next(), wsName, false);
            }
        }
        finally {
            it.close();
        }

        return arr;
    }

    @RequestMapping(value="/{wsName}/{name}", method = RequestMethod.GET)
    public @ResponseBody JSONObj get(@PathVariable String wsName, @PathVariable String name) {
        LayerGroupInfo m = findMap(wsName, name, geoServer.getCatalog());
        return map(new JSONObj(), m, wsName, true);
    }

    @RequestMapping(value="/{wsName}/{name}/layers", method = RequestMethod.GET)
    public @ResponseBody JSONArr layers(@PathVariable String wsName, @PathVariable String name) {
        LayerGroupInfo m = findMap(wsName, name, geoServer.getCatalog());

        JSONArr arr = new JSONArr();
        for (LayerInfo l : m.layers()) {
            IO.layer(arr.addObject(), l);
        }
        return arr;
    }

    @RequestMapping(value="/{wsName}/{name}/layers", method = RequestMethod.PUT)
    public @ResponseBody void layers(@RequestBody JSONArr layers, @PathVariable String wsName, @PathVariable String name) {
        LayerGroupInfo m = findMap(wsName, name, geoServer.getCatalog());

        List<MapLayer> mapLayers = new ArrayList();
        for (int i = 0; i < m.getLayers().size(); i++) {
            mapLayers.add(new MapLayer(m.getLayers().get(i), m.getStyles().get(i)));
        }

        Map<String,MapLayer> map = Maps.uniqueIndex(mapLayers, new Function<MapLayer, String>() {
            @Nullable
            @Override
            public String apply(@Nullable MapLayer input) {
                return input.layer.getName();
            }
        });

        Catalog cat = geoServer.getCatalog();
        List<PublishedInfo> reLayers = new ArrayList<PublishedInfo>();
        List<StyleInfo> reStyles = new ArrayList<StyleInfo>();

        for (JSONObj l : Lists.reverse(Lists.newArrayList(layers.objects()))) {
            String layerName = l.str("name");
            String layerWorkspace = l.str("worskpace");

            MapLayer mapLayer = map.get(layerName);
            if (mapLayer == null) {
                LayerInfo layer = layerWorkspace != null ? cat.getLayerByName(new NameImpl(layerWorkspace, layerName))
                    : cat.getLayerByName(layerName);
                if (layer != null) {
                    mapLayer = new MapLayer(layer, layer.getDefaultStyle());
                }
            }

            if (mapLayer == null) {
                throw new NotFoundException("No such layer: " + l.toString());
            }

            reLayers.add(mapLayer.layer);
            reStyles.add(mapLayer.style);
        }

        m.getLayers().clear();
        m.getLayers().addAll(reLayers);

        m.getStyles().clear();
        m.getStyles().addAll(reStyles);

        cat.save(m);
    }

    List<LayerInfo> layers(LayerGroupInfo map) {
        return Lists.reverse(map.layers());
    }

    JSONObj map(JSONObj obj, LayerGroupInfo map, String wsName, boolean details) {

        obj.put("name", map.getName())
           .put("workspace", wsName)
           .put("title", map.getTitle())
           .put("description", map.getAbstract());

        ReferencedEnvelope bounds = map.getBounds();
        IO.proj(obj.putObject("proj"), bounds.getCoordinateReferenceSystem(), null);
        IO.bounds(obj.putObject("bbox"), bounds);

        JSONArr layers = obj.putArray("layers");

        for (LayerInfo l : layers(map)) {
            layers.addObject().put("name", l.getName()).put("workspace", wsName);
        }

        return obj;
    }

    LayerGroupInfo findMap(String wsName, String name, Catalog cat) {
        LayerGroupInfo m = cat.getLayerGroupByName(wsName, name);
        if (m == null) {
            throw new NotFoundException(String.format("No such map %s:%s", wsName, name));
        }
        return m;
    }

    static class MapLayer {
        PublishedInfo layer;
        StyleInfo style;

        public MapLayer(PublishedInfo layer, StyleInfo style) {
            this.layer = layer;
            this.style = style;
        }
    }
}
