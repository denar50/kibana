import { ForwardedAIValueReportState, parseLocationState } from "../../../../common/locators/ai_value_report/locator";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router";

type ReportKibanaSettings = ForwardedAIValueReportState['reportData']['kibanaSettings']
type ReportInput = Omit<ForwardedAIValueReportState['reportData'], 'kibanaSettings'>

interface AIValueExportContext {
    forwardedState?: ForwardedAIValueReportState
    setReportInput: (inputData: ReportInput) => void
    setInsight: (insight: string) => void
    setReportKibanaSettings: (settings: ReportKibanaSettings) => void
    buildForwardedState: (params: Pick<ForwardedAIValueReportState, 'timeRange'>) => ForwardedAIValueReportState | undefined
}

const AIValueExportContext = createContext<AIValueExportContext | null>(null);

export const useAIValueExportContext = () => useContext(AIValueExportContext);

interface AIValueExportProviderProps {
    children: React.ReactNode;
}

export function AIValueExportProvider({ children }: AIValueExportProviderProps) {
    const history = useHistory();

    const [forwardedState, setForwardedState] = useState<ForwardedAIValueReportState | undefined>()
    const [insight, setInsight] = useState<string | undefined>()
    
    const [reportKibanaSettings, setReportKibanaSettings] = useState<ReportKibanaSettings | undefined>()
    const [reportInput, setReportInput] = useState<ReportInput | undefined>()

    const buildForwardedState = useCallback(({timeRange}: Pick<ForwardedAIValueReportState, 'timeRange'>): ForwardedAIValueReportState | undefined => {
        if(!insight || !reportKibanaSettings || !reportInput) {
            return undefined
        }

        return {
            timeRange,
            insight,
            reportData: {
                kibanaSettings: reportKibanaSettings,
                ...reportInput
            }
        }
        
    }, [reportKibanaSettings, insight, reportInput])
    
    useEffect(() => {
        if (history.location.state) {
            setForwardedState(parseLocationState(history.location.state))
        }
    }, [history.location.state])

    const value = useMemo(() => ({
        forwardedState,
        buildForwardedState,
        setReportKibanaSettings,
        setInsight,
        setReportInput
    }), [forwardedState, buildForwardedState])

    return (
        <AIValueExportContext.Provider value={value}>
            {children}
        </AIValueExportContext.Provider>
    );
}