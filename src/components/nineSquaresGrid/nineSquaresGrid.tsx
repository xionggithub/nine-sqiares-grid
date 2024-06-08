import { useEffect, useMemo, useRef } from 'react';
import { useDatasourceConfigStore, useTextConfigStore, useDatasourceStore } from '../../store';
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
import {data} from "autoprefixer";

interface NineSquaresGridProps {

}

export  function NineSquaresGrid({}: NineSquaresGridProps) {

    const { datasourceConfig } = useDatasourceConfigStore((state) => state);
    const { textConfig } = useTextConfigStore((state) => state);
    const { datasource } = useDatasourceStore((state) => state);

    const gridContentConfig = [
        { lightBgColor: '#F7EEC6', darkBgColor: '#CE9D31', valueKey: 'leftUpValue' },
        { lightBgColor: '#D7F4D1', darkBgColor: '#55A450', valueKey: 'middleUpValue' },
        { lightBgColor: '#A6E3A0', darkBgColor: '#316E33', valueKey: 'rightUpValue' },
        { lightBgColor: '#FAE4E3', darkBgColor: '#E25A4B', valueKey: 'leftMiddleValue' },
        { lightBgColor: '#F7EEC6', darkBgColor: '#CE9D31', valueKey: 'middleMiddleValue' },
        { lightBgColor: '#D7F4D1', darkBgColor: '#55A450', valueKey: 'rightMiddleValue' },
        { lightBgColor: '#F4C9C5', darkBgColor: '#BC3624', valueKey: 'leftDownValue' },
        { lightBgColor: '#FAE4E3', darkBgColor: '#E25A4B', valueKey: 'middleDownValue' },
        { lightBgColor: '#F7EEC6', darkBgColor: '#CE9D31', valueKey: 'rightDownValue' },
    ]
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

    const horizontalAxisTitle = (type: 'left' | 'middle' | 'right') => {
        let field = (datasource.fields[datasourceConfig.tableId] ?? []).find(item => item.id === datasourceConfig.horizontalField);
        if (!field) return  ''
        if (!field.property?.options) return ''
        let optionIds = datasourceConfig.horizontalCategories[type]
        let options = field.property.options.filter(item => !!optionIds.some(id => id === item.id));
        if (options.length === 0) return  ''
        return options.map(item => item.name).join('/');
    }
    const verticalAxisTitle = (type: 'up' | 'middle' | 'down') => {
        let field = (datasource.fields[datasourceConfig.tableId] ?? []).find(item => item.id === datasourceConfig.verticalField);
        if (!field) return  ''
        if (!field.property?.options) return ''
        let optionIds = datasourceConfig.verticalCategories[type]
        let options = field.property.options.filter(item => !!optionIds.some(id => id === item.id));
        if (options.length === 0) return  ''
        return options.map(item => item.name).join('/');
    }


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
                        <div className="side-bar-label rotate-label">{datasource.fields[datasource.tableId].find(item => item.id === datasourceConfig.verticalField)?.name ?? ""}</div>
                    </div>
                </div>
                <div className="left-side-bar-column three-row-grid">
                    <div className="label-container"
                         style={{
                             backgroundColor: datasourceConfig.theme === 'light' ? '#EFF4FF' : '#383C43'
                         }}
                    >
                        <div className="side-bar-label rotate-label">{verticalAxisTitle('up')}</div>
                    </div>
                    <div className="label-container"
                         style={{
                             backgroundColor: datasourceConfig.theme === 'light' ? '#EFF4FF' : '#383C43'
                         }}
                    >
                        <div className="side-bar-label rotate-label">{verticalAxisTitle('middle')}</div>
                    </div>
                    <div className="label-container"
                         style={{
                             backgroundColor: datasourceConfig.theme === 'light' ? '#EFF4FF' : '#383C43'
                         }}
                    >
                        <div className="side-bar-label rotate-label">{verticalAxisTitle('down') }</div>
                    </div>
                </div>
            </div>


            <div className="grid grid-content">
                { gridContentConfig.map(item => {
                    return <div className="cell"
                        style={{
                            backgroundColor: datasourceConfig.theme === 'light' ? item.lightBgColor : item.darkBgColor
                        }}
                    >
                        <div className="cell-header"
                             style={{
                                 borderBottom:  datasourceConfig.theme === 'light' ?  '1px solid #1F23291A' : '1px solid #FFFFFF'
                             }}
                        >

                        </div>

                        <div className="cell-content">
                            { (datasource[item.valueKey]??[]).map(group => {
                                return <div>
                                    <div>
                                        {group.title}
                                    </div>
                                    <div className="cell-content-group">
                                        {group.list.map(person => {
                                            return <div></div>
                                        })}
                                    </div>
                                </div>
                            }) }
                        </div>
                    </div>
                }) }
            </div>


            <div className="grid bottom-side-bar">
                <div className="bottom-side-bar-row three-column-grid">
                    <div className="label-container"
                         style={{
                             backgroundColor: datasourceConfig.theme === 'light' ? '#EFF4FF' : '#383C43'
                         }}
                    >
                        <div className="side-bar-label">{horizontalAxisTitle('left')}</div>
                    </div>

                    <div className="label-container"
                         style={{
                             backgroundColor: datasourceConfig.theme === 'light' ? '#EFF4FF' : '#383C43'
                         }}
                    >
                        <div className="side-bar-label">{horizontalAxisTitle('middle')}</div>
                    </div>
                    <div className="label-container"
                         style={{
                             backgroundColor: datasourceConfig.theme === 'light' ? '#EFF4FF' : '#383C43'
                         }}
                    >
                        <div className="side-bar-label">{horizontalAxisTitle('right')}</div>
                    </div>
                </div>
                <div className="bottom-side-bar-row"
                >
                    <div className="label-container"
                         style={{
                        backgroundColor: datasourceConfig.theme === 'light' ? '#EFF4FF' : '#383C43'
                    }}>
                        <div className="side-bar-label">{datasource.fields[datasource.tableId].find(item => item.id === datasourceConfig.horizontalField)?.name ?? ""}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
