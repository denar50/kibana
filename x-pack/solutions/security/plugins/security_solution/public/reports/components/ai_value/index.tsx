/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useEffect, useMemo } from 'react';
import { EuiHorizontalRule, useEuiTheme } from '@elastic/eui';
import { css } from '@emotion/react';
import { ValueReportSettings } from './value_report_settings';
import {
  DEFAULT_VALUE_REPORT_MINUTES,
  DEFAULT_VALUE_REPORT_RATE,
} from '../../../../common/constants';
import { CostSavingsTrend } from './cost_savings_trend';
import { ExecutiveSummary } from './executive_summary';
import { AlertProcessing } from './alert_processing';
import { useValueMetrics } from '../../hooks/use_value_metrics';
import { useKibana } from '../../../common/lib/kibana';
import { ValueMetrics } from './metrics';
import { useAIValueExportContext } from '../../providers/ai_value/export_provider';

interface ReportData {
  kibanaSettings: {
    analystHourlyRate: number,
    minutesPerAlert: number,
  }
  attackAlertIds: string[],
  valueMetrics: ValueMetrics,
  valueMetricsCompare: ValueMetrics,
}

interface Props {
  setHasAttackDiscoveries: React.Dispatch<boolean>;
  from: string;
  to: string;
}

interface ViewProps {
  setHasAttackDiscoveries: React.Dispatch<boolean>;
  from: string;
  to: string;
  reportData: ReportData,
  isLoading: boolean
}

const AIValueMetricsView: React.FC<ViewProps> = ({ from, to, reportData, isLoading }) => {
  const {
    euiTheme: { colors },
  } = useEuiTheme();
  const { kibanaSettings: { analystHourlyRate, minutesPerAlert }, attackAlertIds, valueMetrics, valueMetricsCompare } = reportData
  const hasAttackDiscoveries = useMemo(
    () => valueMetrics.attackDiscoveryCount > 0,
    [valueMetrics.attackDiscoveryCount]
  );

  return (
    <div
      css={css`
        background: ${colors.backgroundBaseSubdued};
        width: 100%;
        min-height: 100%;
        border-radius: 8px;
      `}
    >
      <ExecutiveSummary
        attackAlertIds={attackAlertIds}
        analystHourlyRate={analystHourlyRate}
        hasAttackDiscoveries={hasAttackDiscoveries}
        minutesPerAlert={minutesPerAlert}
        isLoading={isLoading}
        from={from}
        to={to}
        valueMetrics={valueMetrics}
        valueMetricsCompare={valueMetricsCompare}
      />
      <div
        css={css`
          padding: 0 16px;
        `}
      >
        <EuiHorizontalRule />
      </div>
      {(isLoading || hasAttackDiscoveries) && (
        <>
          <AlertProcessing
            attackAlertIds={attackAlertIds}
            isLoading={isLoading}
            valueMetrics={valueMetrics}
            from={from}
            to={to}
          />
          <div
            css={css`
              padding: 0 16px;
            `}
          >
            <EuiHorizontalRule />
          </div>
        </>
      )}
      {(isLoading || hasAttackDiscoveries) && (
        <>
          <CostSavingsTrend
            analystHourlyRate={analystHourlyRate}
            minutesPerAlert={minutesPerAlert}
            from={from}
            to={to}
            isLoading={isLoading}
          />
          <div
            css={css`
              padding: 0 16px;
            `}
          >
            <EuiHorizontalRule />
          </div>
        </>
      )}
      <ValueReportSettings
        analystHourlyRate={analystHourlyRate}
        minutesPerAlert={minutesPerAlert}
      />
    </div>
  );
}

type LoaderProps = Omit<ViewProps, 'isLoading' | 'reportData'>

const AIValueMetricsLoader: React.FC<LoaderProps> = (props) => {
  const { setHasAttackDiscoveries, to, from } = props
  const { uiSettings } = useKibana().services;
  const exportContext = useAIValueExportContext()

  const { analystHourlyRate, minutesPerAlert } = useMemo(
    () => ({
      minutesPerAlert: uiSettings.get<number>(DEFAULT_VALUE_REPORT_MINUTES),
      analystHourlyRate: uiSettings.get<number>(DEFAULT_VALUE_REPORT_RATE),
    }),
    [uiSettings]
  );

  const { attackAlertIds, isLoading, valueMetrics, valueMetricsCompare } = useValueMetrics({
    from,
    to,
    minutesPerAlert,
    analystHourlyRate,
  });

  const hasAttackDiscoveries = useMemo(
    () => valueMetrics.attackDiscoveryCount > 0,
    [valueMetrics.attackDiscoveryCount]
  );

  useEffect(() => {
    if (isLoading || !exportContext?.setReportInput) {
      return
    }
    exportContext.setReportInput({
      attackAlertIds,
      valueMetrics,
      valueMetricsCompare
    })
  }, [attackAlertIds, isLoading, valueMetrics, valueMetricsCompare, exportContext?.setReportInput])

  useEffect(() => {
    if (!exportContext?.setReportKibanaSettings) {
      return
    }
    exportContext.setReportKibanaSettings({ analystHourlyRate, minutesPerAlert })
  }, [exportContext?.setReportKibanaSettings])

  useEffect(() => {
    setHasAttackDiscoveries(hasAttackDiscoveries);
  }, [hasAttackDiscoveries, setHasAttackDiscoveries]);

  const reportData = useMemo(() => ({
    kibanaSettings: {
      analystHourlyRate, minutesPerAlert
    },
    attackAlertIds,
    valueMetrics,
    valueMetricsCompare
  }), [analystHourlyRate, minutesPerAlert, attackAlertIds, valueMetrics, valueMetricsCompare])

  return <AIValueMetricsView to={to} from={from} isLoading={isLoading} setHasAttackDiscoveries={setHasAttackDiscoveries} reportData={reportData} />
};

export const AIValueMetrics: React.FC<Props> = ({ setHasAttackDiscoveries, ...restProps }) => {
  const exportContext = useAIValueExportContext()
  if (exportContext && exportContext.forwardedState) {
    const { reportData, timeRange: { to, from } } = exportContext.forwardedState
    return <AIValueMetricsView reportData={reportData} setHasAttackDiscoveries={setHasAttackDiscoveries} isLoading={false} to={to} from={from} />
  }

  return <AIValueMetricsLoader setHasAttackDiscoveries={setHasAttackDiscoveries} {...restProps} />
}