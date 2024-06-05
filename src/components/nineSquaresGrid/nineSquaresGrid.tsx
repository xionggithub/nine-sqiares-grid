import { useEffect, useMemo, useRef } from 'react';
import { useDatasourceConfigStore, useTextConfigStore } from '../../store';
import {
    base,
    IAttachmentField,
    dashboard,
    DashboardState,
} from '@lark-base-open/js-sdk';
import {
    Tabs,
    TabPane,
    Form,
    Select,
    Slider,
    InputNumber,
    RadioGroup,
    Radio,
    Button,
} from '@douyinfe/semi-ui';

import "./index.css"

interface NineSquaresGridProps {

}

export  function NineSquaresGrid({}: NineSquaresGridProps) {

    const { datasourceConfig } = useDatasourceConfigStore((state) => state);
    const { textConfig } = useTextConfigStore((state) => state);

    /**
     * HLeftValue: string,
     HMiddleValue: string,
     HRightValue: string,
     VupValue: string,
     VMiddleValue: string,
     VDownValue: string,
     leftDownValue: string,
     middleDownValue: string,
     rightDownValue: string,
     leftMiddleValue: string,
     middleMiddleValue: string,
     rightMiddleValue: string,
     leftUpValue: string,
     middleUpValue: string,
     rightUpValue: string,
     * */
    return (
        <div
            className="relative flex-1 h-screen grid-container grid"
            style={{
                borderTop:
                    dashboard.state === DashboardState.View ? 'none' : '0.5px solid ',
                borderColor:
                    datasourceConfig.theme === 'light'
                        ? 'rgba(207,207,207, 0.15)'
                        : 'rgba(31, 35, 41, 0.15)',
            }}
        >
            <div className="grid left-side-bar">
                <div className="left-side-bar-column">
                    <div className="label-container"
                         style={{
                             backgroundColor: datasourceConfig.theme === 'light' ? '#EFF4FF' : '#383C43'
                         }}
                    >
                        <div className="side-bar-label rotate-label">绩效</div>
                    </div>
                </div>
                <div className="left-side-bar-column three-row-grid">
                    <div className="label-container"
                         style={{
                             backgroundColor: datasourceConfig.theme === 'light' ? '#EFF4FF' : '#383C43'
                         }}
                    >
                        <div className="side-bar-label rotate-label">{textConfig.VupValue}</div>
                    </div>
                    <div className="label-container"
                         style={{
                             backgroundColor: datasourceConfig.theme === 'light' ? '#EFF4FF' : '#383C43'
                         }}
                    >
                        <div className="side-bar-label rotate-label">{textConfig.VMiddleValue}</div>
                    </div>
                    <div className="label-container"
                         style={{
                             backgroundColor: datasourceConfig.theme === 'light' ? '#EFF4FF' : '#383C43'
                         }}
                    >
                        <div className="side-bar-label rotate-label">{textConfig.VDownValue }</div>
                    </div>
                </div>
            </div>
            <div className="grid grid-content">

            </div>
            <div className="grid bottom-side-bar">
                <div className="bottom-side-bar-row three-column-grid">
                    <div className="label-container"
                         style={{
                             backgroundColor: datasourceConfig.theme === 'light' ? '#EFF4FF' : '#383C43'
                         }}
                    >
                        <div className="side-bar-label">{textConfig.HLeftValue}</div>
                    </div>

                    <div className="label-container"
                         style={{
                             backgroundColor: datasourceConfig.theme === 'light' ? '#EFF4FF' : '#383C43'
                         }}
                    >
                        <div className="side-bar-label">{textConfig.HMiddleValue}</div>
                    </div>
                    <div className="label-container"
                         style={{
                             backgroundColor: datasourceConfig.theme === 'light' ? '#EFF4FF' : '#383C43'
                         }}
                    >
                        <div className="side-bar-label">{textConfig.HRightValue}</div>
                    </div>
                </div>
                <div className="bottom-side-bar-row"
                >
                    <div className="label-container"
                         style={{
                        backgroundColor: datasourceConfig.theme === 'light' ? '#EFF4FF' : '#383C43'
                    }}>
                        <div className="side-bar-label">能力</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
