package org.opengeo.app;

import com.google.common.base.Function;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.vividsolutions.jts.geom.Envelope;







//import org.apache.wicket.util.file.Files;
import org.geoserver.catalog.Catalog;
import org.geoserver.catalog.CatalogBuilder;
import org.geoserver.catalog.FeatureTypeInfo;
import org.geoserver.catalog.LayerGroupInfo;
import org.geoserver.catalog.LayerInfo;
import org.geoserver.catalog.NamespaceInfo;
import org.geoserver.catalog.Predicates;
import org.geoserver.catalog.PublishedInfo;
import org.geoserver.catalog.ResourceInfo;
import org.geoserver.catalog.StoreInfo;
import org.geoserver.catalog.StyleInfo;
import org.geoserver.catalog.WorkspaceInfo;
import org.geoserver.catalog.util.CloseableIteratorAdapter;
import org.geoserver.config.GeoServer;
import org.geoserver.platform.GeoServerResourceLoader;
import org.geoserver.platform.resource.Files;
import org.geoserver.platform.resource.Paths;
import org.geoserver.platform.resource.Resource;
import org.geoserver.platform.resource.Resource.Type;
import org.geoserver.platform.resource.ResourceStore;
import org.geoserver.ysld.YsldHandler;
import org.geotools.data.DataUtilities;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.feature.NameImpl;
import org.geotools.feature.SchemaException;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.geotools.styling.FeatureTypeStyle;
import org.geotools.styling.Rule;
import org.geotools.styling.SLDTransformer;
import org.geotools.styling.Style;
import org.geotools.styling.StyleFactory;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.opengis.referencing.crs.CoordinateReferenceSystem;

import javax.annotation.Nullable;
import javax.xml.transform.TransformerException;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.geoserver.catalog.Predicates.equal;
import static org.mockito.Mockito.*;
import static org.opengeo.app.AppController.DEFAULT_PAGESIZE;

/**
 * Helper to mock up GeoServer configuration.
 */
public class MockGeoServer {

    public static interface Mocker<T> {
        void mock(T mock);
    };

    CatalogBuilder catalog;

    public static MockGeoServer get() {
        return new MockGeoServer();
    }

    public MockGeoServer() {
        catalog = new CatalogBuilder(this);
    }

    public GeoServer build(GeoServer geoServer) {
        catalog.apply(geoServer);
        return geoServer;
    }

    CatalogBuilder catalog() {
        return catalog;
    }

    public abstract class Builder {

        public abstract MockGeoServer geoServer();

    }

    public class ResourcesBuilder extends  Builder {
       
        List<String> paths;
        ResourceStore resourceStore;
        CatalogBuilder catalogBuilder;

        public ResourcesBuilder(CatalogBuilder catalogBuilder) {
            this.catalogBuilder = catalogBuilder;

            Resource base = mock(Resource.class);
            when(base.dir()).thenReturn(null);

            this.resourceStore = mock(ResourceStore.class);
            when(resourceStore.get(Paths.BASE)).thenReturn(base);

            when(catalogBuilder.catalog.getResourceLoader())
                .thenAnswer(new Answer<GeoServerResourceLoader>() {
                    @Override
                    public GeoServerResourceLoader answer(InvocationOnMock invocation) throws Throwable {
                        return new GeoServerResourceLoader(resourceStore);
                    }
                });

            this.paths = new ArrayList<String>();
        }

        public ResourcesBuilder resource(String path, String content) {
            return resource(path, new ByteArrayInputStream(content.getBytes()));
        }

        public ResourcesBuilder resource(String path, InputStream content) {
            Resource r = mock(Resource.class);
            when(r.path()).thenReturn(path);
            when(r.name()).thenReturn(path.substring(path.lastIndexOf('/')+1));
            when(r.getType()).thenReturn(Type.RESOURCE);
            when(r.in()).thenReturn(content);
            when(r.out()).thenReturn(new ByteArrayOutputStream());
            
            when(resourceStore.get(path)).thenReturn(r);
            paths.add( path );
            return this;
        }

        public ResourcesBuilder directory(final String path) {
            Resource r = mock(Resource.class);
            when(r.path()).thenReturn(path);
            when(r.name()).thenReturn(path.substring(path.lastIndexOf('/')+1));
            when(r.getType()).thenReturn(Type.DIRECTORY);
            when(resourceStore.get(path)).thenReturn(r);
            paths.add( path );
            
            when(r.list()).then( new Answer<List<Resource>>() {
                @Override
                public List<Resource> answer(InvocationOnMock invocation) throws Throwable {
                    final List<String> c = new ArrayList<String>();
                    for(String p : paths ){
                        if( p.startsWith(path+'/')){
                            String n = p.substring(path.length()+1);
                            if( n.indexOf('/')!=-1){
                                n = n.substring(0,n.indexOf('/'));
                            }
                            if( !c.contains(n)){
                                c.add(n);
                            }                            
                        }
                    }
                    List<Resource> answer = new ArrayList<Resource>();
                    for( int i=0;i<c.size();i++){
                        answer.add( resourceStore.get(Paths.path(path,c.get(i))) );
                    }
                    return answer;
                }
            });
            return this;
        }
        
        @Override
        public MockGeoServer geoServer() {
            return catalogBuilder.geoServer();
        }
    }

    public class CatalogBuilder extends Builder {

        Catalog catalog;

        MockGeoServer geoServer;
        List<WorkspaceBuilder> workspaces = new ArrayList();

        public CatalogBuilder(MockGeoServer geoServer) {
            this.geoServer = geoServer;
            this.catalog = mock(Catalog.class);
        }

        public WorkspaceBuilder workspace(String name, String uri, boolean isDefault) {
            WorkspaceBuilder wsBuilder = new WorkspaceBuilder(name, uri, isDefault, this);
            workspaces.add(wsBuilder);
            return wsBuilder;
        }

        public ResourcesBuilder resources() {
            return new ResourcesBuilder(this);
        }

        public MockGeoServer geoServer() {
            return geoServer;
        }

        private void apply(GeoServer geoServer) {
            List<WorkspaceInfo> allWorkspaces = Lists.transform(workspaces,
                    new Function<WorkspaceBuilder, WorkspaceInfo>() {
                        @Nullable
                        @Override
                        public WorkspaceInfo apply(@Nullable WorkspaceBuilder builder) {
                            return builder.workspace;
                        }
                    });
            List<NamespaceInfo> allNamespaces = Lists.transform(workspaces,
                    new Function<WorkspaceBuilder, NamespaceInfo>() {
                        @Nullable
                        @Override
                        public NamespaceInfo apply(@Nullable WorkspaceBuilder builder) {
                            return builder.namespace;
                        }
                    });

            when(catalog.getWorkspaces()).thenReturn(allWorkspaces);
            when(catalog.list(WorkspaceInfo.class, Predicates.acceptAll()))
                .thenReturn(new CloseableIteratorAdapter<WorkspaceInfo>(allWorkspaces.iterator()));
            when(catalog.getNamespaces()).thenReturn(allNamespaces);
            when(catalog.list(NamespaceInfo.class, Predicates.acceptAll()))
                .thenReturn(new CloseableIteratorAdapter<NamespaceInfo>(allNamespaces.iterator()));

            List<LayerInfo> allLayers = new ArrayList<LayerInfo>();
            List<LayerGroupInfo> allMaps = new ArrayList<LayerGroupInfo>();

            for (WorkspaceBuilder wsBuilder : workspaces) {
                final List<LayerInfo> layers = Lists.transform(wsBuilder.layers, new Function<LayerBuilder, LayerInfo>() {
                    @Nullable
                    @Override
                    public LayerInfo apply(@Nullable LayerBuilder layerBuilder) {
                        return layerBuilder.layer;
                    }
                });
                allLayers.addAll(layers);

                Answer<CloseableIteratorAdapter<LayerInfo>> a = new Answer<CloseableIteratorAdapter<LayerInfo>>() {
                    @Override
                    public CloseableIteratorAdapter<LayerInfo> answer(InvocationOnMock invocation) throws Throwable {
                        return new CloseableIteratorAdapter<LayerInfo>(layers.iterator());
                    }
                };
                when(catalog.list(LayerInfo.class, Predicates.equal("resource.namespace.prefix",
                    wsBuilder.workspace.getName()))).thenAnswer(a);
                when(catalog.list(LayerInfo.class, Predicates.equal("resource.namespace.prefix",
                    wsBuilder.workspace.getName()), null, DEFAULT_PAGESIZE, null)).thenAnswer(a);

                final List<LayerGroupInfo> maps = Lists.transform(wsBuilder.maps, new Function<MapBuilder, LayerGroupInfo>() {
                    @Nullable
                    @Override
                    public LayerGroupInfo apply(@Nullable MapBuilder mapBuilder) {
                        return mapBuilder.map;
                    }
                });
                allMaps.addAll(maps);

                Answer<CloseableIteratorAdapter<LayerGroupInfo>> b = new Answer<CloseableIteratorAdapter<LayerGroupInfo>>() {
                    @Override
                    public CloseableIteratorAdapter<LayerGroupInfo> answer(InvocationOnMock invocation) throws Throwable {
                        return new CloseableIteratorAdapter<LayerGroupInfo>(maps.iterator());
                    }
                };
                when(catalog.list(LayerGroupInfo.class, Predicates.equal("workspace.name",
                    wsBuilder.workspace.getName()))).thenAnswer(b);
                when(catalog.list(LayerGroupInfo.class, Predicates.equal("workspace.name",
                    wsBuilder.workspace.getName()))).thenAnswer(b);
            }

            when(catalog.getLayers()).thenReturn(allLayers);
            when(catalog.list(LayerInfo.class, Predicates.acceptAll())).thenReturn(
                new CloseableIteratorAdapter<LayerInfo>(allLayers.iterator()));
            when(catalog.list(LayerInfo.class, Predicates.acceptAll())).thenReturn(
                    new CloseableIteratorAdapter<LayerInfo>(allLayers.iterator()));
            when(catalog.getLayerGroups()).thenReturn(allMaps);
            when(catalog.list(LayerGroupInfo.class, Predicates.acceptAll())).thenReturn(
                    new CloseableIteratorAdapter<LayerGroupInfo>(allMaps.iterator()));

            when(geoServer.getCatalog()).thenReturn(catalog);
        }
    }

    public class WorkspaceBuilder extends Builder {

        CatalogBuilder catalogBuilder;
        WorkspaceInfo workspace;
        NamespaceInfo namespace;

        List<StoreBuilder> stores = new ArrayList<StoreBuilder>();
        List<LayerBuilder> layers = new ArrayList<LayerBuilder>();
        List<MapBuilder> maps = new ArrayList<MapBuilder>();

        public WorkspaceBuilder(String name, String uri, boolean isDefault, CatalogBuilder catalogBuilder) {
            this.catalogBuilder = catalogBuilder;
            Catalog cat = catalogBuilder.catalog;

            workspace = mock(WorkspaceInfo.class);
            when(workspace.getName()).thenReturn(name);

            namespace = mock(NamespaceInfo.class);
            when(namespace.getName()).thenReturn(name);
            when(namespace.getPrefix()).thenReturn(name);
            when(namespace.getURI()).thenReturn(uri);

            when(cat.getWorkspaceByName(name)).thenReturn(workspace);
            when(cat.getNamespaceByPrefix(name)).thenReturn(namespace);
            when(cat.getNamespaceByURI(uri)).thenReturn(namespace);

            if (isDefault) {
                when(cat.getDefaultWorkspace()).thenReturn(workspace);
                when(cat.getDefaultNamespace()).thenReturn(namespace);
            }
        }

        public LayerBuilder layer(String name) {
            LayerBuilder lBuilder = new LayerBuilder(name, this);
            layers.add(lBuilder);
            return lBuilder;
        }

        public MapBuilder map(String name) {
            MapBuilder mapBuilder = new MapBuilder(name, this);
            maps.add(mapBuilder);
            return mapBuilder;
        }

        public CatalogBuilder catalog() {
            return catalogBuilder;
        }

        public MockGeoServer geoServer() {
            return catalogBuilder.geoServer();
        }

    }

    public class StoreBuilder {

    }

    public class MapBuilder extends Builder {

        String name;
        LayerGroupInfo map;
        WorkspaceBuilder workspaceBuilder;
        List<LayerBuilder> layers = new ArrayList<LayerBuilder>();

        public MapBuilder(String name, WorkspaceBuilder workspaceBuilder) {
            this.name = name;
            this.workspaceBuilder = workspaceBuilder;

            String wsName = workspaceBuilder.workspace.getName();
            map = mock(LayerGroupInfo.class);
            when(map.getName()).thenReturn(name);
            when(map.prefixedName()).thenReturn(wsName + ":" + name);
            when(map.layers()).thenAnswer(new Answer<List<LayerInfo>>() {
                @Override
                public List<LayerInfo> answer(InvocationOnMock invocation) throws Throwable {
                    return Lists.transform(layers, new Function<LayerBuilder, LayerInfo>() {
                        @Nullable
                        @Override
                        public LayerInfo apply(@Nullable LayerBuilder input) {
                            return input.layer;
                        }
                    });
                }
            });

            List<PublishedInfo> layerList = mock(List.class);
            when(layerList.iterator()).thenAnswer(new Answer<Object>() {
                @Override
                public Object answer(InvocationOnMock invocation) throws Throwable {
                    return Iterables.transform(layers, new Function<LayerBuilder, Object>() {
                        @Nullable @Override
                        public Object apply(@Nullable LayerBuilder input) {
                            return input.layer;
                        }
                    });
                }
            });
            when(map.getLayers()).thenReturn(layerList);

            List<StyleInfo> styleList = mock(List.class);
            when(styleList.iterator()).thenAnswer(new Answer<Object>() {
                @Override
                public Object answer(InvocationOnMock invocation) throws Throwable {
                    return Iterables.transform(layers, new Function<LayerBuilder, Object>() {
                        @Nullable @Override
                        public Object apply(@Nullable LayerBuilder input) {
                            return input.layer.getDefaultStyle();
                        }
                    });
                }
            });
            when(map.getStyles()).thenReturn(styleList);

            Catalog catalog = workspaceBuilder.catalogBuilder.catalog;
            when(catalog.getLayerGroupByName(name)).thenReturn(map);
            when(catalog.getLayerGroupByName(wsName, name)).thenReturn(map);
        }

        public MapBuilder info(String title, String description) {
            when(map.getTitle()).thenReturn(title);
            when(map.getAbstract()).thenReturn(description);
            return this;
        }

        public MapBuilder bbox(double x1, double y1, double x2, double y2, CoordinateReferenceSystem crs) {
            when(map.getBounds()).thenReturn(new ReferencedEnvelope(x1,x2,y1,y2,crs));
            return this;
        }

        public MapBuilder defaults() {
            return bbox(-180,-90,180,90,DefaultGeographicCRS.WGS84);
        }

        public MapBuilder with(Mocker<LayerGroupInfo> m) {
            m.mock(map);
            return this;
        }

        public LayerBuilder layer(String name) {
            LayerBuilder layerBuilder = new LayerBuilder(name, this);
            layers.add(layerBuilder);
            return layerBuilder;
        }

        @Override
        public MockGeoServer geoServer() {
            return workspaceBuilder.geoServer();
        }

        public WorkspaceBuilder workspace() {
            return workspaceBuilder;
        }
    }

    public class LayerBuilder extends Builder {

        String name;
        LayerInfo layer;

        WorkspaceBuilder workspaceBuilder;
        MapBuilder mapBuilder;
        ResourceBuilder resourceBuilder;

        public LayerBuilder(String name, WorkspaceBuilder workspaceBuilder) {
            this.name = name;
            this.workspaceBuilder = workspaceBuilder;

            String wsName = workspaceBuilder.workspace.getName();
            layer = mock(LayerInfo.class);
            when(layer.getName()).thenReturn(name);
            when(layer.prefixedName()).thenReturn(wsName+":"+name);

            Catalog catalog = workspaceBuilder.catalogBuilder.catalog;
            when(catalog.getLayerByName(name)).thenReturn(layer);
            when(catalog.getLayerByName(wsName+":"+name)).thenReturn(layer);
            when(catalog.getLayerByName(new NameImpl(wsName, name))).thenReturn(layer);
        }

        public LayerBuilder(String name, MapBuilder mapBuilder) {
            this(name, mapBuilder.workspaceBuilder);
            this.mapBuilder = mapBuilder;
        }

        public LayerBuilder info(String title, String description) {
            when(layer.getTitle()).thenReturn(title);
            when(layer.getAbstract()).thenReturn(description);
            return this;
        }

        public MapBuilder map() {
            return mapBuilder;
        }

        public StyleBuilder style() {
            return new StyleBuilder(this);
        }

        public FeatureTypeBuilder featureType() {
            return new FeatureTypeBuilder(this);
        }

        public MockGeoServer geoServer() {
            return workspaceBuilder.geoServer();
        }
    }

    public class ResourceBuilder<T extends ResourceInfo> extends Builder {

        protected T resource;
        protected LayerBuilder layerBuilder;

        protected ResourceBuilder(T resource, LayerBuilder layerBuilder) {
            this.resource = resource;
            this.layerBuilder = layerBuilder;

            LayerInfo layer = layerBuilder.layer;
            when(resource.getName()).thenReturn(layerBuilder.name);
            when(resource.getNativeName()).thenReturn(layerBuilder.name);

            when(resource.getNamespace()).thenAnswer(new Answer<NamespaceInfo>() {
                @Override
                public NamespaceInfo answer(InvocationOnMock invocation) throws Throwable {
                    return ResourceBuilder.this.layerBuilder.workspaceBuilder.namespace;
                }
            });
            when(layer.getResource()).thenReturn(resource);
        }

        public ResourceBuilder<T> proj(String srs, CoordinateReferenceSystem crs) {
            when(resource.getSRS()).thenReturn(srs);
            when(resource.getCRS()).thenReturn(crs);
            return this;
        }

        public ResourceBuilder<T> bbox(double x1, double y1, double x2, double y2, CoordinateReferenceSystem crs) {
            when(resource.getNativeBoundingBox()).thenReturn(new ReferencedEnvelope(x1,x2,y1,y2,crs));
            when(resource.getNativeCRS()).thenReturn(crs);
            return this;
        }

        public ResourceBuilder<T> latLonBbox(double x1, double y1, double x2, double y2) {
            when(resource.getLatLonBoundingBox()).thenReturn(new ReferencedEnvelope(x1,x2,y1,y2, DefaultGeographicCRS.WGS84));
            return this;
        }

        public WorkspaceBuilder workspace() {
            return layerBuilder.workspaceBuilder;
        }

        public MapBuilder map() {
            return layerBuilder.mapBuilder;
        }

        public MockGeoServer geoServer() {
            return workspace().catalog().geoServer();
        }
    }

    public class FeatureTypeBuilder extends ResourceBuilder<FeatureTypeInfo> {

        public FeatureTypeBuilder(LayerBuilder layerBuilder) {
            super(mock(FeatureTypeInfo.class), layerBuilder);
        }

        public FeatureTypeBuilder schema(String spec) {
            try {
                when(resource.getFeatureType()).thenReturn(DataUtilities.createType(layerBuilder.name, spec));
                return this;
            }
            catch(Exception e) {
                throw new RuntimeException(e);
            }
        }

        public FeatureTypeBuilder defaults() {
            proj("EPSG:4326", DefaultGeographicCRS.WGS84)
              .bbox(-180, -90, 180, 90, DefaultGeographicCRS.WGS84)
              .latLonBbox(-180, -90, 180, 90);

            return schema("geom:Point,name:String");
        }
    }

    public class StyleBuilder extends Builder {

        StyleInfo style;
        LayerBuilder layerBuilder;
        StyleFactory styleFactory;

        public StyleBuilder(LayerBuilder layerBuilder) {
            this.layerBuilder = layerBuilder;
            this.styleFactory = CommonFactoryFinder.getStyleFactory();

            style = mock(StyleInfo.class);
            when(style.getWorkspace()).thenReturn(layerBuilder.workspaceBuilder.workspace);
            when(layerBuilder.layer.getDefaultStyle()).thenReturn(style);
        }

        public StyleBuilder ysld(String filename) {
            when(style.getFormat()).thenReturn(YsldHandler.FORMAT);
            when(style.getFilename()).thenReturn(filename);
            return this;
        }

        public StyleBuilder point() {
            Rule rule = styleFactory.createRule();
            rule.symbolizers().add(styleFactory.createPointSymbolizer());

            FeatureTypeStyle featureTypeStyle = styleFactory.createFeatureTypeStyle();
            featureTypeStyle.rules().add(rule);

            Style style = styleFactory.createStyle();
            style.featureTypeStyles().add(featureTypeStyle);

            try {
                when(this.style.getStyle()).thenReturn(style);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            ResourcesBuilder resources = geoServer().catalog().resources();
            String wsName = layerBuilder.workspaceBuilder.namespace.getName();
            String fileName = "point.sld";
            when(this.style.getFilename() ).thenReturn(fileName );
            when(this.style.getWorkspace() ).thenReturn( layerBuilder.workspaceBuilder.workspace );
            when(this.style.getFormat()).thenReturn("sld");
            ByteArrayOutputStream content = new ByteArrayOutputStream();
            SLDTransformer tx = new SLDTransformer();
            tx.setIndentation(2);
            try {
                tx.transform( style, content );
                resources.resource(Paths.path("workspaces",wsName,"styles",fileName), content.toString() );
            } catch (TransformerException e) {
                throw new RuntimeException(e);
            }
            return this;
        }

        public LayerBuilder layer() {
            return layerBuilder;
        }

        public MockGeoServer geoServer() {
            return layerBuilder.geoServer();
        }
    }
}
