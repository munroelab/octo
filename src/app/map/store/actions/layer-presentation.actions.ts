/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Action} from '@ngrx/store';
import {ClientPresentation} from '@app/shared/models';

export enum LayerPresentationActionTypes {
  SET_LAYER_UNIQUE_ID = '[Layer presentation] Set layer unique id',
  SET_CLIENT_PRESENTATIONS = '[Layer presentation] Set client presentations',
  SET_CURRENT_CLIENT_PRESENTATION = '[Layer presentation] Set current client presentation',
}


export class SetLayerUniqueId implements Action {
  readonly type = LayerPresentationActionTypes.SET_LAYER_UNIQUE_ID;

  constructor(public payload: string) {
  }
}

export class SetClientPresentations implements Action {
  readonly type = LayerPresentationActionTypes.SET_CLIENT_PRESENTATIONS;

  constructor(public payload: ClientPresentation[]) {
  }
}

export class SetCurrentClientPresentation implements Action {
  readonly type = LayerPresentationActionTypes.SET_CURRENT_CLIENT_PRESENTATION;

  constructor(public payload: ClientPresentation) {
  }
}

export type LayerPresentationActionsUnion =
  SetLayerUniqueId |
  SetClientPresentations |
  SetCurrentClientPresentation;

