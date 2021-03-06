/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SetMapClickInfo } from '@app/map/store';
import * as fromMapClick from '@app/map/store/reducers/map-click.reducers';
import { mapClickReducer } from '@app/map/store/reducers/map-click.reducers';
import { MapClickInfo } from '@app/shared/models';

describe('MapClickReducer', () => {

  it('should return default state when no state and no action passed', () => {
    expect(mapClickReducer(undefined, <any>{})).toEqual(fromMapClick.adapter.getInitialState());
  });

  it('should have immutable payload', () => {
    const mapClickInfo: MapClickInfo = {
      'html': '<html></html>',
      'fields': [],
      'result': 5,
      'layerId': 0
    };
    const action = new SetMapClickInfo(mapClickInfo);
    const finalState = mapClickReducer(fromMapClick.adapter.getInitialState(), action);
    mapClickInfo.result = 6;
    expect(finalState.entities[0]).not.toEqual(mapClickInfo);
  });

  it('should set state.mapClickInfo', () => {
    const mapClickInfo: MapClickInfo = {
      'html': '<html></html>',
      'fields': [],
      'result': 5,
      'layerId': 0
    };
    const action = new SetMapClickInfo(mapClickInfo);
    const finalState = mapClickReducer(fromMapClick.adapter.getInitialState(), action);
    expect(finalState.entities[0]).toEqual(mapClickInfo);
  });

});
