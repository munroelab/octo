/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, Input, OnInit} from '@angular/core';
import {DateField} from '../../../../../utils/click-formatter/field/date-field.util';
import {PropertyLocatorFactory} from '../../../../../../shared/utils/property-locator-factory.util';
import * as moment from 'moment';

@Component({
  selector: 'app-date-field',
  templateUrl: './date-field.component.html',
  styleUrls: ['./date-field.component.css']
})
export class DateFieldComponent implements OnInit {
  value: string;
  @Input() result;

  constructor() {
  }

  private _field: DateField;

  get field(): DateField {
    return this._field;
  }

  @Input()
  set field(field: DateField) {
    this._field = field;
    const propertyLocator = PropertyLocatorFactory.getPropertyLocator(this._field.contentType);
    let value = propertyLocator.getValue(this.result, this._field.fieldDef.propertyPath);
    if (value == null) {
      value = '';
    } else {
      value = moment(value).format(this._field.fieldDef.formatString);
    }
    this.value = value;
  }

  ngOnInit() {
  }
}
