/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { parse } from 'query-string';
import type { FunctionComponent } from 'react';
import React, { useEffect, useState } from 'react';

import type { UseEuiTheme } from '@elastic/eui';
import { EuiCallOut, EuiCodeBlock } from '@elastic/eui';
import { css } from '@emotion/react';
import { i18n } from '@kbn/i18n';

import type { ScopedHistory } from '@kbn/core/public';
import {
  REPORTING_REDIRECT_LOCATOR_STORE_KEY,
  REPORTING_REDIRECT_ALLOWED_LOCATOR_TYPES,
} from '@kbn/reporting-common';
import type { LocatorParams, BaseParamsV2 } from '@kbn/reporting-common/types';
import type { ReportingAPIClient } from '@kbn/reporting-public';
import type { ScreenshotModePluginSetup } from '@kbn/screenshot-mode-plugin/public';

import type { SharePluginSetup } from '../shared_imports';

interface Props {
  apiClient: ReportingAPIClient;
  history: ScopedHistory;
  screenshotMode: ScreenshotModePluginSetup;
  share: SharePluginSetup;
}

const i18nTexts = {
  errorTitle: i18n.translate('xpack.reporting.redirectApp.errorTitle', {
    defaultMessage: 'Redirect error',
  }),
  consoleMessagePrefix: i18n.translate(
    'xpack.reporting.redirectApp.redirectConsoleErrorPrefixLabel',
    {
      defaultMessage: 'Redirect page error:',
    }
  ),
};

export const RedirectApp: FunctionComponent<Props> = ({ apiClient, screenshotMode, share }) => {
  const [error, setError] = useState<undefined | Error>();

  useEffect(() => {
    (async () => {
      try {
        let locatorParams: undefined | LocatorParams;

        const { jobId, scheduledReportId, page, perPage } = parse(window.location.search);

        if (scheduledReportId) {
          const scheduledReport = await apiClient.getScheduledReportInfo(
            scheduledReportId as string,
            parseInt(page as string, 10),
            parseInt(perPage as string, 10)
          );

          locatorParams = (scheduledReport?.payload as BaseParamsV2)?.locatorParams?.[0];
        } else if (jobId) {
          const result = await apiClient.getInfo(jobId as string);
          locatorParams = result?.locatorParams?.[0];
        } else {
          locatorParams = screenshotMode.getScreenshotContext<LocatorParams>(
            REPORTING_REDIRECT_LOCATOR_STORE_KEY
          );
          // locatorParams = {
          //   id: "DASHBOARD_APP_LOCATOR",
          //   params: {
          //     dashboardId: "endpoint-475a47e9-2cd7-4f5f-a2bf-efced65e9a85",
          //     preserveSavedFilters: true,
          //     timeRange: {
          //       from: "2025-11-09T23:00:00.000Z",
          //       to: "2025-11-10T22:59:59.999Z",
          //     },
          //     useHash: false,
          //     viewMode: "view",
          //   },
          //   // version: "9.3"
          // }

          // locatorParams = {
          //   id: "AI_VALUE_REPORT_LOCATOR",
          //   params: {
          //     timeRange: {
          //       to: "2025-11-13T12:38:40.557Z",
          //       from: "2025-11-05T00:38:40.557Z"
          //     }
          //   },
          //   // version: "9.3"
          // }

          // locatorParams = {
          //   id: "AI_VALUE_REPORT_LOCATOR",
          //   params: {
          //     "timeRange": {
          //       "to": "2025-11-13T13:30:45.051Z",
          //       "from": "2025-10-13T12:30:45.051Z",
          //       "reportData": {
          //         "attackAlertIds": [
          //           "0dcf78ce-0348-44df-a5b5-780be27e5097",
          //           "4dc293e7-8810-4354-8da3-db7890f11126",
          //           "8563144e-6c2f-4d0e-a1b6-5f6e2028a74a",
          //           "a94f13a1-d8cb-4907-944e-b6c965da9dc9"
          //         ],
          //         "isLoading": false,
          //         "valueMetrics": {
          //           "attackDiscoveryCount": 2,
          //           "filteredAlerts": 0,
          //           "filteredAlertsPerc": 0,
          //           "escalatedAlertsPerc": 100,
          //           "hoursSaved": 686.2666666666667,
          //           "totalAlerts": 5147,
          //           "costSavings": 51470
          //         },
          //         "valueMetricsCompare": {
          //           "attackDiscoveryCount": 0,
          //           "filteredAlerts": 4853,
          //           "filteredAlertsPerc": 100,
          //           "escalatedAlertsPerc": 0,
          //           "hoursSaved": 647.0666666666667,
          //           "totalAlerts": 4853,
          //           "costSavings": 48530.00000000001
          //         },
          //         "analystHourlyRate": 75,
          //         "minutesPerAlert": 8
          //       }
          //     }
          //   }
          // }
    //       locatorParams = {
    //   "id": "AI_VALUE_REPORT_LOCATOR",
    //   "params": {
    //     "timeRange": {
    //       "to": "2025-11-17T13:02:09.144Z",
    //       "from": "2025-11-03T13:02:09.144Z"
    //     },
    //     "insight": "- Between November 3 and November 17, 12-hour cost savings **averaged around $1,650**.\n- The lowest point, **$1,300**, occurred on November 10.\n- **Peaks near $1,970** were reached on November 14.\n- Savings fluctuated moderately, with a slight dip mid-period, then rebounded toward the end.\n- At this rate, projected annual savings **exceed $1.2M**, indicating consistent and substantial ROI.",
    //     "reportData": {
    //       "kibanaSettings": {
    //         "analystHourlyRate": 75,
    //         "minutesPerAlert": 8
    //       },
    //       "attackAlertIds": [
    //         "0393b856-1d7d-4a54-975a-fcceeb08f701",
    //         "1be5e2eb-a898-486c-8eda-5449568556fc",
    //         "1ea027ec-4e81-4148-9abc-04a2c9afd419",
    //         "32048cc4-c758-49c7-8c67-f2a31b26a90d",
    //         "5291092a-0f76-47a3-8e43-adbc6015e7ae",
    //         "616cdda5-e67a-43b6-9def-c47d328e490b",
    //         "70dea23c-1568-4870-a93d-0234ac40ff28",
    //         "8e2eb3ad-a12d-4d78-bb11-35d0c7ae9423",
    //         "a3eef119-df2b-4b67-bade-7846037a76a9",
    //         "b2da32e6-c8b7-4e74-bf64-39451b4f83fc",
    //         "b9455664-86e1-4b1c-88cb-78a3b6cb31c6",
    //         "ce5ab3d9-e5dc-4f6c-9937-0ce0382126db",
    //         "e7748232-8766-4d47-987a-058f481f5ad4",
    //         "ead3be69-cc14-4c78-94e3-cd68de987bde",
    //         "f966c418-e409-4212-8f71-e24d5a71cfd8",
    //         "fe90927b-8071-4ddd-89b4-55764bf034c5"
    //       ],
    //       "valueMetrics": {
    //         "attackDiscoveryCount": 7,
    //         "filteredAlerts": 4647,
    //         "filteredAlertsPerc": 99.74243399871216,
    //         "escalatedAlertsPerc": 0.25756600128783,
    //         "hoursSaved": 621.2,
    //         "totalAlerts": 4659,
    //         "costSavings": 46590
    //       },
    //       "valueMetricsCompare": {
    //         "attackDiscoveryCount": 0,
    //         "filteredAlerts": 4673,
    //         "filteredAlertsPerc": 100,
    //         "escalatedAlertsPerc": 0,
    //         "hoursSaved": 623.0666666666667,
    //         "totalAlerts": 4673,
    //         "costSavings": 46730.00000000001
    //       }
    //     }
    //   }
    // }
        }


        console.log(">>> locatorParmas", locatorParams)

        if (!locatorParams) {
          throw new Error('Could not find locator params for report');
        }

        if (!REPORTING_REDIRECT_ALLOWED_LOCATOR_TYPES.includes(locatorParams.id)) {
          // eslint-disable-next-line no-console
          console.error(`Report job execution cannot redirect using ${locatorParams.id}`);
          throw new Error(
            'Report job execution can only redirect using a locator for an expected analytical app'
          );
        }

        share.navigate(locatorParams);
      } catch (e) {
        setError(e);
        // eslint-disable-next-line no-console
        console.error(i18nTexts.consoleMessagePrefix, e.message);
      }
    })();
  }, [apiClient, screenshotMode, share]);

  return (
    <div
      css={({ euiTheme }: UseEuiTheme) =>
        css({
          // Create some padding above and below the page so that the errors (if any) display nicely.
          margin: `${euiTheme.size.xxl} auto`,
        })
      }
    >
      {error ? (
        <EuiCallOut announceOnMount title={i18nTexts.errorTitle} color="danger">
          <p>{error.message}</p>
          {error.stack && <EuiCodeBlock>{error.stack}</EuiCodeBlock>}
        </EuiCallOut>
      ) : (
        // We don't show anything on this page, the share service will handle showing any issues with
        // using the locator
        <div />
      )}
    </div>
  );
};
