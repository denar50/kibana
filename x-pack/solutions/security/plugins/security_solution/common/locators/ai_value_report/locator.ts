/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { setStateToKbnUrl } from '@kbn/kibana-utils-plugin/common';
import type { LocatorDefinition, LocatorPublic } from '@kbn/share-plugin/public';
import type { GlobalQueryStateFromUrl } from '@kbn/data-plugin/public';

import { AI_VALUE_REPORT_LOCATOR, AI_VALUE_PATH, APP_UI_ID } from '../../constants';

type AIValueReportParams = {
  timeRange: {
    to: string,
    from: string
  }
}

export type AIValueReportLocator = LocatorPublic<AIValueReportParams>;

export class AIValueReportLocatorDefinition implements LocatorDefinition<AIValueReportParams> {
  public readonly id = AI_VALUE_REPORT_LOCATOR;

  public readonly getLocation = async (params: AIValueReportParams) => {

    // const path = setStateToKbnUrl<GlobalQueryStateFromUrl>(
    //   '_g',
    //   {
    //     time: params.timeRange,
    //   },
    //   { useHash: false },
    //   AI_VALUE_PATH
    // );

    const path = AI_VALUE_PATH

    return {
      app: APP_UI_ID,
      path,
      state: {},
    };
  };
}
