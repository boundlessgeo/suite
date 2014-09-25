package org.opengeo.app;
 
import org.geotools.styling.ColorMapEntry;
import org.geotools.styling.Mark;
import org.geotools.styling.Symbol;
import org.geotools.styling.TextSymbolizer2;
import org.opengis.metadata.citation.OnLineResource;
import org.opengis.style.AnchorPoint;
import org.opengis.style.ChannelSelection;
import org.opengis.style.ColorMap;
import org.opengis.style.ColorReplacement;
import org.opengis.style.ContrastEnhancement;
import org.opengis.style.Description;
import org.opengis.style.Displacement;
import org.opengis.style.ExtensionSymbolizer;
import org.opengis.style.ExternalGraphic;
import org.opengis.style.ExternalMark;
import org.opengis.style.FeatureTypeStyle;
import org.opengis.style.Fill;
import org.opengis.style.Font;
import org.opengis.style.Graphic;
import org.opengis.style.GraphicFill;
import org.opengis.style.GraphicLegend;
import org.opengis.style.GraphicStroke;
import org.opengis.style.GraphicalSymbol;
import org.opengis.style.Halo;
import org.opengis.style.LinePlacement;
import org.opengis.style.LineSymbolizer;
import org.opengis.style.PointPlacement;
import org.opengis.style.PointSymbolizer;
import org.opengis.style.PolygonSymbolizer;
import org.opengis.style.RasterSymbolizer;
import org.opengis.style.Rule;
import org.opengis.style.SelectedChannelType;
import org.opengis.style.ShadedRelief;
import org.opengis.style.Stroke;
import org.opengis.style.StyleVisitor;
import org.opengis.style.Symbolizer;
import org.opengis.style.TextSymbolizer;

/**
 * Traverse of Style.
 */
abstract class StyleAdaptor implements StyleVisitor {
    // TODO: Move to GeoTools
    
    public Object visit(org.opengis.style.Style style, Object data) {
        for (FeatureTypeStyle fts : style.featureTypeStyles()) {
            data = fts.accept(this, data);
        }
        return data;
    }

    public Object visit(FeatureTypeStyle fts, Object data) {
        for (Rule r : fts.rules()) {
            data = r.accept(this, data);
        }
        return data;
    }

    @Override
    public Object visit(Rule rule, Object data) {
        for (Symbolizer sym : rule.symbolizers()) {
            data = sym.accept(this,data);
        }
        return data;
    }

    @Override
    public Object visit(PointSymbolizer ps, Object data) {
        data = safeVisit( ps.getDescription(), data );
        if (ps.getGraphic() != null) {
            data = ps.getGraphic().accept(this,data);
        }
        return data;
    }
   /**
    * Null safe visit (which avoids DescriptionImpl return null).
    * 
    * @param description
    * @param data
    * @return
    */
    private Object safeVisit( Description description, Object data ){
        if( description == null ){
            return data;
        }
        Object update = description.accept( this, data );
        if( update == null ){
            // DescriptionImpl is not implemented correctly
            return this.visit( description, data );
        }
        else {
            return update;
        }
    }
    @Override
    public Object visit(LineSymbolizer line, Object data) {        
        data = safeVisit(line.getDescription(), data);
        if (line.getStroke() != null) {
            data = line.getStroke().accept(this,data);
        }
        return data;
    }

    @Override
    public Object visit(PolygonSymbolizer poly, Object data) {
        data = safeVisit( poly.getDescription(), data );
        if (poly.getDisplacement() != null) {
            data = poly.getDisplacement().accept(this,this);
        }
        if (poly.getFill() != null) {
            data = poly.getFill().accept(this,data);
        }
        if (poly.getStroke() != null) {
            data = poly.getStroke().accept(this,data);
        }
        return data;
    }

    @Override
    public Object visit(TextSymbolizer text, Object data) {
        data = safeVisit( text.getDescription(), data );
        if (text.getFill() != null) {
            data = text.getFill().accept(this,data);
        }
        if (text.getFont() != null) {
            data = text.getFont().accept(this, data);
        }
        if (text.getHalo() != null) {
            data = text.getHalo().accept(this,data);
        }
        if (text.getLabelPlacement() != null) {
            data = text.getLabelPlacement().accept(this,data);
        }
        if( text instanceof TextSymbolizer2 && ((TextSymbolizer2)text).getGraphic() != null ){
            data = ((TextSymbolizer2)text).getGraphic().accept(this,data);
        }
        return data;
    }

    @Override
    public Object visit(RasterSymbolizer raster, Object data) {
        data = safeVisit( raster.getDescription(), data );
        if (raster.getChannelSelection() != null) {
            data = raster.getChannelSelection().accept(this,data);
        }
        if (raster.getColorMap() != null) {
            data = raster.getColorMap().accept(this,data);
        }
        if (raster.getContrastEnhancement() != null) {
            data = raster.getContrastEnhancement().accept(this,data);
        }
        if (raster.getImageOutline() != null) {
            data = raster.getImageOutline().accept(this,data);
        }
        if (raster.getShadedRelief() != null) {
            data = raster.getShadedRelief().accept(this,data);
        }        
        return data;
    }

    @Override
    public Object visit(ExtensionSymbolizer extension, Object data) {
        data = safeVisit( extension.getDescription(), data );
        return data;
    }

    @Override
    public Object visit(Description description, Object data) {
        return data;
    }

    @Override
    public Object visit(Displacement displacement, Object data) {
        return data;
    }

    @Override
    public Object visit(Fill fill, Object data) {
        if (fill.getGraphicFill() != null) {
            data = fill.getGraphicFill().accept(this,data);
        }
        return data;
    }

    @Override
    public Object visit(Font font, Object data) {
        return data;
    }

    @Override
    public Object visit(Stroke stroke, Object data) {
        if (stroke.getGraphicFill() != null) {
            data = stroke.getGraphicFill().accept(this,data);
        }
        if (stroke.getGraphicStroke() != null) {
            data = stroke.getGraphicStroke().accept(this,data);
        }
        return data;
    }

    @Override
    public Object visit(Graphic gr, Object data) {
        if (gr.getAnchorPoint() != null) {
            data = gr.getAnchorPoint().accept(this,data);
        }
        if (gr.getDisplacement() != null) {
            data = gr.getDisplacement().accept(this,data);
        }
        for (GraphicalSymbol eg : gr.graphicalSymbols()) {
            if( eg instanceof ExternalGraphic){
               data = ((ExternalGraphic)eg).accept(this,data);
            }
            else if( eg instanceof Mark){
                data = ((Mark)eg).accept(this,data);
            }
        }
        return data;
    }

    @Override
    public Object visit(GraphicFill gf, Object data) {
        if (gf.getAnchorPoint() != null) {
            data = gf.getAnchorPoint().accept(this,data);
        }
        if (gf.getDisplacement() != null) {
            data = gf.getDisplacement().accept(this,data);
        }
        for (GraphicalSymbol eg : gf.graphicalSymbols()) {
            if( eg instanceof ExternalGraphic){
               data = ((ExternalGraphic)eg).accept(this,data);
            }
            else if( eg instanceof Mark){
                data = ((Mark)eg).accept(this,data);
            }
        }
        return data;
    }

    @Override
    public Object visit(GraphicStroke gs, Object data) {
        if (gs.getAnchorPoint() != null) {
            data = gs.getAnchorPoint().accept(this,data);
        }
        if (gs.getDisplacement() != null) {
            data = gs.getDisplacement().accept(this,data);
        }
        for (GraphicalSymbol eg : gs.graphicalSymbols()) {
            if( eg instanceof ExternalGraphic){
               data = ((ExternalGraphic)eg).accept(this,data);
            }
            else if( eg instanceof Mark){
                data = ((Mark)eg).accept(this,data);
            }
        }
        return data;
    }

    @Override
    public Object visit(org.opengis.style.Mark mark, Object data) {
        if (mark.getFill() != null) {
            data = mark.getFill().accept(this,data);
        }
        if (mark.getStroke() != null) {
            data = mark.getStroke().accept(this,data);
        }
        return data;
    }

    @Override
    public Object visit(ExternalMark mark, Object data) {
        if( mark.getOnlineResource() != null ){
            data = visit( mark.getOnlineResource(), data );
        }
        return data;
    }

    @Override
    public Object visit(ExternalGraphic graphic, Object data) {
        if( graphic.getOnlineResource() != null ){
            data = visit( graphic.getOnlineResource(), data );
        }
        return data;
    }
    
    public Object visit( OnLineResource resource, Object data ){
        return data;
    }
    
    @Override
    public Object visit(PointPlacement pp, Object data) {
        if (pp.getAnchorPoint() != null) {
            data = pp.getAnchorPoint().accept(this,data);
        }
        if (pp.getDisplacement() != null) {
            data = pp.getDisplacement().accept(this,data);
        }
        return data;
    }

    @Override
    public Object visit(AnchorPoint anchorPoint, Object data) {
        return data;
    }

    @Override
    public Object visit(LinePlacement linePlacement, Object data) {
        return data;
    }

    @Override
    public Object visit(GraphicLegend legend, Object data) {
        if (legend.getAnchorPoint() != null) {
            data = legend.getAnchorPoint().accept(this,data);
        }
        if (legend.getDisplacement() != null) {
            data = legend.getDisplacement().accept(this,data);
        }
        for (GraphicalSymbol eg : legend.graphicalSymbols()) {
            if( eg instanceof ExternalGraphic){
               data = ((ExternalGraphic)eg).accept(this,data);
            }
            else if( eg instanceof Mark){
                data = ((Mark)eg).accept(this,data);
            }
        }
        return data;
    }

    @Override
    public Object visit(Halo halo, Object data) {
        if (halo.getFill() != null) {
            data = halo.getFill().accept(this,data);
        }
        return data;
    }

    @Override
    public Object visit(ColorMap colorMap, Object data) {        
        return data;
    }

    @Override
    public Object visit(ColorReplacement colorReplacement, Object data) {
        return data;
    }

    @Override
    public Object visit(ContrastEnhancement contrastEnhancement, Object data) {
        return data;
    }

    @Override
    public Object visit(ChannelSelection channelSelection, Object data) {
        return data;
    }

    @Override
    public Object visit(SelectedChannelType selectChannelType, Object data) {
        return data;
    }

    @Override
    public Object visit(ShadedRelief shadedRelief, Object data) {
        return data;
    }
}