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
import { z } from '@kbn/zod'
import { AI_VALUE_REPORT_LOCATOR, AI_VALUE_PATH, APP_UI_ID } from '../../constants';

const valueMetricsSchema = z.object({
  attackDiscoveryCount: z.number(),
  filteredAlerts: z.number(),
  filteredAlertsPerc: z.number(),
  escalatedAlertsPerc: z.number(),
  hoursSaved: z.number(),
  totalAlerts: z.number(),
  costSavings: z.number(),
})

const AIValueReportParamsSchema = z.object({
  timeRange: z.object({
    to: z.string(),
    from: z.string()
  }),
  insight: z.string().nonempty(),
  reportData: z.object({
    kibanaSettings: z.object({
      analystHourlyRate: z.number(),
      minutesPerAlert: z.number(),
    }),
    attackAlertIds: z.array(z.string()),
    valueMetrics: valueMetricsSchema,
    valueMetricsCompare: valueMetricsSchema,
  })
})

export type AIValueReportParams = z.infer<typeof AIValueReportParamsSchema>

export type ForwardedAIValueReportState = AIValueReportParams

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
    console.log(">>> LOCATOR RETRNED", {
      app: APP_UI_ID,
      path,
      state: params,
    })
    return {
      app: APP_UI_ID,
      path,
      state: params,
    };
  };
}

export const parseLocationState = (state: unknown): (ForwardedAIValueReportState | undefined) => {
  const result = AIValueReportParamsSchema.passthrough().safeParse(state)
  if (result.error) {
    return undefined
  }

  return result.data
}