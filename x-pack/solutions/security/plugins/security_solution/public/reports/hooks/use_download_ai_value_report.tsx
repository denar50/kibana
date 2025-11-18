import { i18n } from '@kbn/i18n';
import { useKibana } from '../../common/lib/kibana';
import { AI_VALUE_REPORT_LOCATOR } from '@kbn/deeplinks-analytics';
import { useMemo } from 'react';
import type { AIValueReportParams } from '../../../common/locators/ai_value_report/locator';
import { useAIValueExportContext } from '../providers/ai_value/export_provider';

type UseDownloadAIValueReportParams = {
  anchorElement: HTMLElement | null,
  isServerless: boolean,
  timeRange: AIValueReportParams['timeRange']
}

export const useDownloadAIValueReport = ({
  anchorElement,
  isServerless,
  timeRange
}: UseDownloadAIValueReportParams) => {
  const { share: shareService } = useKibana().services
  const aiValueExportContext = useAIValueExportContext()

  const forwardedState = useMemo(() => {
    if(!aiValueExportContext?.buildForwardedState) {
      return undefined
    }
    return aiValueExportContext.buildForwardedState({timeRange})
  }, [timeRange, aiValueExportContext?.buildForwardedState])

  const isExportEnabled = forwardedState !== undefined

  const toggleContextMenu = useMemo(() => {
    if (!isExportEnabled || anchorElement === null || isServerless || !shareService) {
      return () => {}
    }

    return () => {
      shareService.toggleShareContextMenu({
        isDirty: false,
        anchorElement,
        allowShortUrl: false,
        asExport: true,
        objectType: 'ai_value_report',
        objectTypeMeta: {
          title: i18n.translate('ai.value.report.share.shareModal.title', {
            defaultMessage: 'Download this report',
          }),
          config: {
            integration: {
              export: {
                pdfReports: {
                  
                },
              },
            },
          },
        },
        sharingData: {
          title: i18n.translate('xpack.securitySolution.reports.aiValue.pdfReportJobTitle', {
            // TODO confirm what wording we want hre
            defaultMessage: 'AI Value Report'
          }),
          locatorParams: {
            id: AI_VALUE_REPORT_LOCATOR,
            params: forwardedState,
          },
        },
      })
    }
  }, [anchorElement, isServerless, shareService, forwardedState, isExportEnabled]);

  return {
    toggleContextMenu,
    isExportEnabled
  }
}