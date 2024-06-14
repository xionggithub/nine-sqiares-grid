// @ts-nocheck
import {useEffect} from 'react';
import {useDatasourceConfigStore, useDatasourceStore, useTextConfigStore} from '../../store';
import {dashboard, DashboardState,} from '@lark-base-open/js-sdk';

import "./index.css"
import personIcon from '../../assets/icon_person.svg';

interface NineSquaresGridProps {

}

export  function NineSquaresGrid({}: NineSquaresGridProps) {

    const { datasourceConfig } = useDatasourceConfigStore((state) => state);
    const { textConfig } = useTextConfigStore((state) => state);
    const { datasource } = useDatasourceStore((state) => state);

    const isMobile = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    const cellTitleKeyList = [
        "leftUpValue",
        "middleUpValue",
        "rightUpValue",

        "leftMiddleValue",
        "middleMiddleValue",
        "rightMiddleValue",

        "leftDownValue",
        "middleDownValue",
        "rightDownValue"
    ];

    useEffect(() => {

    }, []);

    const gridContentConfig = [
        {
            theme: {
                light: {
                    textColor: '#1F2329',
                    bgColor: '#F7EEC6',
                    titleColor: '#CE9D31',
                    leftBorderColor: '#CE9D31',
                },
                dark: {
                    textColor: '#FFFFFF',
                    bgColor: '#CE9D31',
                    titleColor: '#F7EEC6',
                    leftBorderColor: '#F7EEC6'
                }
            },
            valueKey: 'leftUpValue'
        },
        {
            theme: {
                light: {
                    textColor: '#1F2329',
                    bgColor: '#D7F4D1',
                    titleColor: '#55A450',
                    leftBorderColor: '#55A450'
                },
                dark: {
                    textColor: '#FFFFFF',
                    bgColor: '#55A450',
                    titleColor: '#D7F4D1',
                    leftBorderColor: '#D7F4D1'
                }
            },
             valueKey: 'middleUpValue'
        },
        {
            theme: {
                light: {
                    textColor: '#1F2329',
                    bgColor: '#A6E3A0',
                    titleColor: '#316E63',
                    leftBorderColor: '#316E63'
                },
                dark: {
                    textColor: '#FFFFFF',
                    bgColor: '#316E33',
                    titleColor: '#A6E3A0',
                    leftBorderColor: '#A6E3A0'
                }
            },
            valueKey: 'rightUpValue'
        },
        {
            theme: {
                light: {
                    textColor: '#1F2329',
                    bgColor: '#FAE4E3',
                    titleColor: '#E25A4B',
                    leftBorderColor: '#E25A4B'
                },
                dark: {
                    textColor: '#FFFFFF',
                    bgColor: '#E25A4B',
                    titleColor: '#FAE4E3',
                    leftBorderColor: '#FAE4E3'
                }
            },
             valueKey: 'leftMiddleValue'
        },
        {
            theme: {
                light: {
                    textColor: '#1F2329',
                    bgColor: '#F7EEC6',
                    titleColor: '#CE9D31',
                    leftBorderColor: '#CE9D31'
                },
                dark: {
                    textColor: '#FFFFFF',
                    bgColor: '#CE9D31',
                    titleColor: '#F7EEC6',
                    leftBorderColor: '#F7EEC6'
                }
            },
            valueKey: 'middleMiddleValue'
        },
        {
            theme: {
                light: {
                    textColor: '#1F2329',
                    bgColor: '#D7F4D1',
                    titleColor: '#55A450',
                    leftBorderColor: '#55A450'
                },
                dark: {
                    textColor: '#FFFFFF',
                    bgColor: '#55A450',
                    titleColor: '#D7F4D1',
                    leftBorderColor: '#D7F4D1'
                }
            },
            valueKey: 'rightMiddleValue'
        },
        {
            theme: {
                light: {
                    textColor: '#1F2329',
                    bgColor: '#F4C9C5',
                    titleColor: '#BC3624',
                    leftBorderColor: '#BC3624'
                },
                dark: {
                    textColor: '#FFFFFF',
                    bgColor: '#BC3624',
                    titleColor: '#F4C9C5',
                    leftBorderColor: '#F4C9C5'
                }
            },
            valueKey: 'leftDownValue'
        },
        {
            theme: {
                light: {
                    textColor: '#1F2329',
                    bgColor: '#FAE4E3',
                    titleColor: '#E25A4B',
                    leftBorderColor: '#E25A4B'
                },
                dark: {
                    textColor: '#FFFFFF',
                    bgColor: '#E25A4B',
                    titleColor: '#FAE4E3',
                    leftBorderColor: '#FAE4E3'
                }
            },
            valueKey: 'middleDownValue'
        },
        {
            theme: {
                light: {
                    textColor: '#1F2329',
                    bgColor: '#F7EEC6',
                    titleColor: '#CE9D31',
                    leftBorderColor: '#CE9D31'
                },
                dark: {
                    textColor: '#FFFFFF',
                    bgColor: '#CE9D31',
                    titleColor: '#F7EEC6',
                    leftBorderColor: '#F7EEC6'
                }
            },
            valueKey: 'rightDownValue'
        },
    ]

    const horizontalAxisTitle = () => {
        return datasource.fields[datasource.tableId].find(item => item.id === datasourceConfig.horizontalField)?.name ?? ""
    }

    const horizontalAxisCategoryMainTitle = (type: 'left' | 'middle' | 'right') => {
        let field = (datasource.fields[datasourceConfig.tableId] ?? []).find(item => item.id === datasourceConfig.horizontalField);
        if (!field) return  ''
        if (!field.property?.options) return ''
        let optionIds = datasourceConfig.horizontalCategories[type]
        let options = field.property.options.filter(item => !!optionIds.some(id => id === item.id));
        if (options.length === 0) return  ''
        return options.map(item => item.name).join('/');
    }

    const horizontalAxisCategoryTitle = (type: 'left' | 'middle' | 'right') => {
        let text = horizontalAxisCategoryMainTitle(type);
        if (type === 'left') {
            text += textConfig.HLeftValue.length > 0 ? (' ' +  textConfig.HLeftValue) : ''
        } else if (type === 'middle') {
            text += textConfig.HMiddleValue.length > 0 ? (' ' +  textConfig.HMiddleValue) : ''
        } else if (type === 'right') {
            text += textConfig.HRightValue.length > 0 ? (' ' +  textConfig.HRightValue) : ''
        }
        return  text;
    }

    const verticalAxisTitle = () => {
        return  datasource.fields[datasource.tableId].find(item => item.id === datasourceConfig.verticalField)?.name ?? ""
    }

    const verticalAxisCategoryMainTitle = (type: 'up' | 'middle' | 'down') => {
        let field = (datasource.fields[datasourceConfig.tableId] ?? []).find(item => item.id === datasourceConfig.verticalField);
        if (!field) return  ''
        if (!field.property?.options) return ''
        let optionIds = datasourceConfig.verticalCategories[type]
        let options = field.property.options.filter(item => !!optionIds.some(id => id === item.id));
        if (options.length === 0) return  ''
        return options.map(item => item.name).join('/');
    }

    const verticalAxisCategoryTitle = (type: 'up' | 'middle' | 'down') => {
        let text = verticalAxisCategoryMainTitle(type);
        if (type === 'up') {
            text += textConfig.VUpValue.length > 0 ? (' ' + textConfig.VUpValue) : ''
        } else if (type === 'middle') {
            text += textConfig.VMiddleValue.length > 0 ? (' ' +  textConfig.VMiddleValue) : ''
        } else if (type === 'down') {
            text += textConfig.VDownValue.length > 0 ? (' ' +  textConfig.VDownValue) : ''
        }
        return  text;
    }

    const cellTitle = (index: number) => {
        return (textConfig[cellTitleKeyList[index]] ?? '') as string
    }

    return (
        <div
            className={ isMobile() ? 'relative flex-1 h-screen grid-container-phone grid' : 'relative flex-1 h-screen grid-container grid' }
            style={{
                borderTop:
                    dashboard.state === DashboardState.View ? 'none' : '0.5px solid ',
                borderColor:
                    datasource.theme === 'light'
                        ? 'rgba(207,207,207, 0.15)'
                        : 'rgba(31, 35, 41, 0.15)',
            }}
        >
            { isMobile() ? '' : (<div className="grid left-side-bar">
                <div className="left-side-bar-column">
                    <div className="label-container"
                         style={{
                             backgroundColor: datasource.theme === 'light' ? '#EFF4FF' : '#383C43',
                             color: datasource.theme === 'light' ?  "#1F2329" :  "#FFFFFF"
                         }}
                    >
                        <div className="side-bar-label side-bar-label-vertical rotate-label text-ellipsis">{verticalAxisTitle()}</div>
                    </div>
                </div>
                <div className="left-side-bar-column three-row-grid">
                    <div className="label-container"
                         style={{
                             backgroundColor: datasource.theme === 'light' ? '#EFF4FF' : '#383C43',
                             color: datasource.theme === 'light' ?  "#1F2329" :  "#FFFFFF"
                         }}
                    >
                        <div className="side-bar-label side-bar-label-vertical rotate-label text-ellipsis">{verticalAxisCategoryTitle('up')}</div>
                    </div>
                    <div className="label-container"
                         style={{
                             backgroundColor: datasource.theme === 'light' ? '#EFF4FF' : '#383C43',
                             color: datasource.theme === 'light' ?  "#1F2329" :  "#FFFFFF"
                         }}
                    >
                        <div className="side-bar-label side-bar-label-vertical rotate-label text-ellipsis">{verticalAxisCategoryTitle('middle')}</div>
                    </div>
                    <div className="label-container"
                         style={{
                             backgroundColor: datasource.theme === 'light' ? '#EFF4FF' : '#383C43',
                             color: datasource.theme === 'light' ?  "#1F2329" :  "#FFFFFF"

                         }}
                    >
                        <div className="side-bar-label rotate-label text-ellipsis">{verticalAxisCategoryTitle('down') }</div>
                    </div>
                </div>
            </div>) }


            <div className="grid grid-content">
                { gridContentConfig.map((item, index) => {
                    return <div className="cell"
                                key={index}
                        style={{
                            backgroundColor: datasource.theme === 'light' ? item.theme.light.bgColor : item.theme.dark.bgColor
                        }}
                    >
                        <div className="cell-header"
                             style={{
                                 borderBottom:  datasource.theme === 'light' ?  '1px solid #1F23291A' : '1px solid #FFFFFF',
                                 color: datasource.theme === 'light' ?  item.theme.light.textColor :  item.theme.dark.textColor
                             }}
                        >
                            <div className='cell-header-left-text text-ellipsis'>
                                { cellTitle(index) }
                            </div>
                            <div className='cell-header-right-text text-ellipsis'>
                                {(datasource[item.valueKey] ?? { total: 0, percent: 0, list: [] }).total}, {(datasource[item.valueKey] ?? { total: 0, percent: 0, list: [] }).percent}%
                            </div>
                        </div>

                        <div className="cell-content-scroll">
                            <div className="cell-content">
                                { (datasource[item.valueKey] ?? { total: 0, percent: 0, list: [] }).list.map((group, index) => {
                                    return <div className="flex-column" style={{ rowGap: '6px' }} key={group.category + 'key' + index}>
                                        { group.category.length > 0 ? (<div className="cell-content-category" style={{ color: datasource.theme === 'light' ?  item.theme.light.titleColor :  item.theme.dark.titleColor }}>
                                            {group.category}
                                        </div>) : '' }
                                        <div className="cell-content-group" style={{ color: datasource.theme === 'light' ?  item.theme.light.textColor :  item.theme.dark.textColor, borderColor: group.category.length > 0 ? (datasource.theme === 'light' ?  item.theme.light.leftBorderColor :  item.theme.dark.leftBorderColor) : '', }}>
                                            {group.persons.map((person, subIndex) => {
                                                return <div className='person-container' key={person + 'key' + subIndex}>
                                                    <img src={personIcon} alt="" className="selection-icon" />
                                                    <div className='person-label text-ellipsis'>{person}</div>
                                                </div>
                                            })}
                                        </div>
                                    </div>
                                }) }
                            </div>
                        </div>
                    </div>
                }) }
            </div>


            { isMobile() ? '' : (<div className="grid bottom-side-bar">
                <div className="bottom-side-bar-row three-column-grid">
                    <div className="label-container"
                         style={{
                             backgroundColor: datasource.theme === 'light' ? '#EFF4FF' : '#383C43',
                             color: datasource.theme === 'light' ?  "#1F2329" :  "#FFFFFF"
                         }}
                    >
                        <div className="side-bar-label text-ellipsis">{horizontalAxisCategoryTitle('left')}</div>
                    </div>

                    <div className="label-container"
                         style={{
                             backgroundColor: datasource.theme === 'light' ? '#EFF4FF' : '#383C43',
                             color: datasource.theme === 'light' ?  "#1F2329" :  "#FFFFFF"
                         }}
                    >
                        <div className="side-bar-label text-ellipsis">{horizontalAxisCategoryTitle('middle')}</div>
                    </div>
                    <div className="label-container"
                         style={{
                             backgroundColor: datasource.theme === 'light' ? '#EFF4FF' : '#383C43',
                             color: datasource.theme === 'light' ?  "#1F2329" :  "#FFFFFF"
                         }}
                    >
                        <div className="side-bar-label text-ellipsis">{horizontalAxisCategoryTitle('right')}</div>
                    </div>
                </div>
                <div className="bottom-side-bar-row"
                >
                    <div className="label-container"
                         style={{
                             backgroundColor: datasource.theme === 'light' ? '#EFF4FF' : '#383C43',
                             color: datasource.theme === 'light' ?  "#1F2329" :  "#FFFFFF"
                         }}>
                        <div className="side-bar-label text-ellipsis">{horizontalAxisTitle()}</div>
                    </div>
                </div>
            </div>)}
        </div>
    )
}
