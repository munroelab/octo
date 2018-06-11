import {uniqueId} from 'lodash';

import * as layerActions from '../store/actions/layer.actions';

export default class ActivateLayer {
  static activateLayer(layerId: number, store) {
    const genUniqueId: string = uniqueId();
    store.dispatch(new layerActions.FetchLayer({
      layerId: layerId,
      uniqueId: genUniqueId
    }));
    return genUniqueId;
  }
}