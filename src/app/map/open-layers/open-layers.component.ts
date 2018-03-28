import {AfterViewInit, Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {forkJoin} from 'rxjs/observable/forkJoin';
import View from 'ol/view';
import Map from 'ol/map';
import Proj from 'ol/proj';
import OLLayer from 'ol/layer/layer';
import LayerBase from 'ol/layer/base';
import TileWMS from 'ol/source/tilewms';
import * as fromApp from '../../store/app.reducers';
import * as fromBaseLayer from '../store/base-layer.reducers';
import {OLLayerFactory} from './ol-layer-factory.util';
import * as fromLayer from '../store/layer.reducers';
import {clone, isEqual} from 'lodash';
import {Layer} from '../../shared/layer.model';
import 'rxjs/add/operator/filter';
import {Observable} from 'rxjs/Observable';
import {WmsStrategy} from '../../shared/wms-strategy.model';
import {HttpClient} from '@angular/common/http';
import {MAP_CLICK_POPUP_ID} from '../map.component';
import * as popupActions from '../store/popup.actions';
import * as mapClickActions from '../../map-click/store/map-click.actions';

@Component({
  selector: 'app-open-layers',
  templateUrl: './open-layers.component.html',
  styleUrls: ['./open-layers.component.css']
})
export class OpenLayersComponent implements AfterViewInit {
  map: Map;
  baseOLLayer: OLLayer = null;
  private layers: Layer[];

  constructor(private httpClient: HttpClient, private store: Store<fromApp.AppState>) {
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.initBaseLayerSubscription();
    this.initLayerSubscription();
    this.initMapClick();
  }

  private initMap() {
    const mapview = new View({
      center: Proj.transform([-66.0, 51.0], 'EPSG:4326', 'EPSG:3857'),
      zoom: 5,
    });
    this.map = new Map({
      target: 'map',
      view: mapview,
    });
  }

  private initBaseLayerSubscription() {
    (<Observable<fromBaseLayer.State>>this.store.select('baseLayer'))
      .filter(baseLayerState => baseLayerState.currentBaseLayer != null)
      .subscribe((baseLayerState: fromBaseLayer.State) => {
        if (this.getOLLayerFromId(baseLayerState.currentBaseLayer.id) == null) {
          if (this.baseOLLayer != null) {
            this.map.removeLayer(this.baseOLLayer);
          }
          const newLayer = OLLayerFactory.generateLayer(baseLayerState.currentBaseLayer);
          this.map.addLayer(newLayer);
          this.baseOLLayer = newLayer;
        }
      });
  }

  private getOLLayerFromId(id): LayerBase {
    return this.map.getLayers().getArray().find((layer: LayerBase) => {
      return layer.get('id') === id;
    });
  }

  private initLayerSubscription() {
    this.store.select('layer')
      .subscribe((layerState: fromLayer.State) => {
        const currentOLLayers: Array<ol.layer.Base> = clone(this.map.getLayers().getArray());
        currentOLLayers.forEach((layer: OLLayer) => {
          // If the new layer is already there
          if (layerState.layers.some((l) => (l.uniqueId === layer.get('uniqueId')))) {
            const updatedOgslLayer = layerState.layers.find((l) => {
              return l.uniqueId === layer.get('uniqueId');
            });
            const oldOgslLayer = this.layers.find((l) => {
              return l.uniqueId === layer.get('uniqueId');
            });
            if (!isEqual(updatedOgslLayer, oldOgslLayer)) {
              // Only update the old layer if the new one is different
              const newOlLayer = OLLayerFactory.generateLayer(updatedOgslLayer);
              this.map.removeLayer(layer);
              this.map.addLayer(newOlLayer);
            }
          } else if (layer.get('uniqueId') != null) {
            // If old layer is not part of the new layers and isn't a background layer, remove it
            this.map.removeLayer(layer);
          }
        });
        // Add remaining layers
        layerState.layers.forEach((newLayer: Layer) => {
          if (!currentOLLayers.some((cL) => (cL.get('uniqueId') === newLayer.uniqueId))) {
            this.map.addLayer(OLLayerFactory.generateLayer(newLayer));
          }
        });
        this.layers = layerState.layers;
      });
  }

  // TODO: To refactor into proper setup with appropriate classes and not hardcoded
  private initMapClick() {
    this.map.on('singleclick', (evt: ol.MapBrowserEvent) => {
      const view: View = this.map.getView();
      const wmsCalls = [];
      this.layers.forEach((l) => {
        if (l.clickStrategy != null) {
          if (l.clickStrategy.type === 'wms') {
            const olLayer: OLLayer = <ol.layer.Layer> this.map.getLayers().getArray().find((olL) => {
              return olL.get('uniqueId') === l.uniqueId;
            });
            const source: TileWMS = <TileWMS> olLayer.getSource();
            const getFeatureUrl = source.getGetFeatureInfoUrl(evt.coordinate, view.getResolution(), view.getProjection(), {
              INFO_FORMAT: (<WmsStrategy>l.clickStrategy).format,
              FEATURE_COUNT: (<WmsStrategy>l.clickStrategy).featureCount
            });
            wmsCalls.push(this.httpClient.get(getFeatureUrl,
              {responseType: 'text'}));
          }
        }
      });
      forkJoin(wmsCalls).subscribe((result) => {
        for (let i = result.length - 1; i >= 0; i--) {
          // TODO: Use proper setup to detect if payload is considered empty
          if (!this.isClickPayloadEmpty(result[i])) {
            this.store.dispatch(new mapClickActions.SetMapClickInfo(result[i]));
            this.store.dispatch(new mapClickActions.SetMapClickLayer(this.layers[i]));
            this.store.dispatch(new popupActions.SetIsOpen({popupId: MAP_CLICK_POPUP_ID, isOpen: true}));
            break;
          }
        }
      });
    });
  }

  isClickPayloadEmpty(htmlContent) {
    const insideBodyTags = htmlContent.substring(htmlContent.indexOf('<body>') + 6, htmlContent.indexOf('</body>'));
    const trimmed = insideBodyTags.replace(/ /g, '').replace(/\r?\n|\r/g, '');
    return (trimmed.length <= 0);
  }
}
