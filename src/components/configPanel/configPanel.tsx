import {
    dashboard,
    ThemeModeType,
    SourceType,
    IDataRange,
    DashboardState,
    base,
} from '@lark-base-open/js-sdk';
import React from "react"
import { useEffect, useRef, FC, useState } from 'react';
import {
    Tabs,
    TabPane,
    Form,
    Input,
    Button,
    Divider,
    Select
} from '@douyinfe/semi-ui';
import { IconTick } from '@douyinfe/semi-icons';

import { useDatasourceConfigStore, useTextConfigStore, useDatasourceStore } from '../../store';

import deleteIcon from '../../assets/icon_delete-trash_outlined.svg';
import addIcon from '../../assets/icon_add_outlined.svg';


import { useTranslation } from 'react-i18next';

import './index.css';
import { IDatasourceConfigCacheType, TableDataGroupHelper } from "../../utils/tableDataGroupHelper";

interface IConfigPanelPropsType {}


export const ConfigPanel: FC<IConfigPanelPropsType> = (props) => {

    const { t, i18n } = useTranslation();
    const [personSearchValue, setPersonSearchValue] = useState('');
    const [horizontalAxisSearchValue, setHorizontalAxisSearchValue] = useState('');
    const [verticalAxisSearchValue, setVerticalAxisSearchValue] = useState('');

    // 类型与数据
    const { datasourceConfig, updateDatasourceConfig } = useDatasourceConfigStore((state) => state);
    const { datasource, updateDatasource } = useDatasourceStore((state) => state);

    // 保存选择表的字段数据
    const [fields, setFields] = useState<{ [key: string]: any }[]>([])
    // 保存竖轴选择完字段后子分类的选项数据
    const [verticalCategoryOptions, setVerticalCategoryOptions] = useState<{ [key: string]: any }[]>([])
    const [verticalCategories, setVerticalCategories] = useState<{ up: string[], middle: string[], down: string[] }>({
        up: [''],
        middle: [''],
        down: ['']
    })
    // 保存横轴选择完字段后子分类的选项数据
    const [horizontalCategoryOptions, setHorizontalCategoryOptions] = useState<{ [key: string]: any }[]>([])
    const [horizontalCategories, setHorizontalCategories] = useState<{ left: string[], middle: string[], right: string[] }>({
        left: [''],
        middle: [''],
        right: ['']
    })

    let datasourceConfigCache: IDatasourceConfigCacheType = {
        tableId: '',
        dataRange: '',
        personnelField: '',
        horizontalField: '',
        horizontalCategories: {
            left: [''],
            middle: [''],
            right: ['']
        },

        verticalField: '',
        verticalCategories: {
            up: [''],
            middle: [''],
            down: ['']
        },
        groupField: ''
    };

    const addNoneForList = (list: any[]) => {
        if (list.find(item => item.id==="" && item.name === 'none')) {
            return list
        }
        return [...list, ...[{ id: '', name: 'none' }]]
    }

    const dataHelper = new TableDataGroupHelper()

    const chooseTable = async (tableId: string) => {
        console.log('on data source selected ', tableId, datasourceConfig)
        let fields: any[] = [];
        if (datasource.fields[tableId] && datasource.fields[tableId].length > 0) {
            fields = datasource.fields[tableId];
        } else {
            const table = await base.getTable(tableId);
            console.log('-----',table)
            fields = await table.getFieldMetaList()
        }
        let allRecords: any[] = []
        if (datasource.allRecords[tableId] && datasource.allRecords[tableId].length > 0) {
            allRecords = datasource.allRecords[tableId];
        } else {
            const table = await base.getTable(tableId);
            allRecords = await dataHelper.loadAllRecordsForTable(table)
        }
        if (datasourceConfig.tableId !== tableId) {
            datasourceConfig.horizontalField = ''
            datasourceConfig.verticalField = ''
            datasourceConfig.personnelField = ''
            datasourceConfig.horizontalCategories = {
                left: [''],
                middle: [''],
                right: ['']
            }
            datasourceConfig.verticalCategories = {
                up: [''],
                middle: [''],
                down: ['']
            }
            datasourceConfig.tableId = tableId
            datasource.leftDownValue =  { total: 0, percent: 0, list: [] }
            datasource.middleDownValue = { total: 0, percent: 0, list: [] }
            datasource.rightDownValue = { total: 0, percent: 0, list: [] }
            datasource.leftMiddleValue = { total: 0, percent: 0, list: [] }
            datasource.middleMiddleValue = { total: 0, percent: 0, list: [] }
            datasource.rightMiddleValue = { total: 0, percent: 0, list: [] }
            datasource.leftUpValue = { total: 0, percent: 0, list: [] }
            datasource.middleUpValue = { total: 0, percent: 0, list: [] }
            datasource.rightUpValue = { total: 0, percent: 0, list: [] }
        }
        datasource.fields[tableId] = [...fields.map(item => ({ ...item, disabled: false}))];
        datasource.tableId = tableId
        datasource.allRecords[tableId] = allRecords
        console.log(datasource, datasourceConfig, fields)
        updateDatasource((datasource as any))
        updateDatasourceConfig({...(datasourceConfig as any)})
        setFields(addNoneForList(fields))
    }

    const choosePersonField = (personnel: string) => {
        datasourceConfig.personnelField = personnel;
        const config: any = datasourceConfig;
        let selectedIds = Object.values(config).filter(id => typeof id === 'string' && id.length > 0)
        console.log(selectedIds)
        fields.forEach(item => {
            item.disabled = selectedIds.findIndex(id => id === item.id) !== -1;
            console.log(item.disabled, item.id)
        })
        updateDatasourceConfig({...config})
        setFields(addNoneForList(fields))
        console.log('on personnel choose', personnel, datasourceConfig)
    }

    const chooseHorizontalAxisField = (horizontalField: string) => {
        console.log('on horizontalAxis selected ', horizontalField, datasourceConfig)
        datasourceConfig.horizontalField = horizontalField;
        horizontalCategories.left = ['']
        horizontalCategories.middle = [''];
        horizontalCategories.right = [''];
        setHorizontalCategories({...horizontalCategories})
        let selectedIds = Object.values((datasourceConfig as any)).filter(id => typeof id === 'string' && id.length > 0)
        fields.forEach(item => {
            item.disabled = selectedIds.findIndex(id => id === item.id) !== -1;
            console.log(item.disabled, item.id)
        })
        console.log('horizontalField-----',datasource.fields[datasource.tableId])
        setFields(addNoneForList(fields))
        let field = fields.find(item => item.id === datasourceConfig.horizontalField)
        if (field && field.property?.options) {
            console.log('----field::', field)
            let options = field.property.options.map(item => ({ ...item, disabled: false}))

            if (options.length === 1) {
                options[0].disabled = true
                horizontalCategories.left = [options[0].id]
                return;
            } else if (options.length === 2) {
                options[0].disabled = true
                horizontalCategories.left = [options[0].id]
                options[1].disabled = true
                horizontalCategories.middle = [options[1].id]
                return;
            } else if (options.length >= 3) {
                options[0].disabled = true
                horizontalCategories.left = [options[0].id]
                options[Math.floor(options.length / 2)].disabled = true
                horizontalCategories.middle = [options[Math.floor(options.length / 2)].id];
                options[options.length-1].disabled = true
                horizontalCategories.right = [options[options.length -1].id];
            }
            datasourceConfig.horizontalCategories = { ...horizontalCategories }
            setHorizontalCategoryOptions(addNoneForList(options))
            setHorizontalCategories({...horizontalCategories})
        }
        console.log('chooseHorizontalAxisField++++++++++++++++++++++++==+++++++++++++++datasourceConfig', datasourceConfig)
        datasourceConfigCache = {...datasourceConfig}
        updateDatasourceConfig({...(datasourceConfig as any)})
        dataHelper.prepareData(datasource.tableId, datasource, datasourceConfigCache).then(() => {
            updateDatasource({...(datasource as any)})
        })
    }

    const chooseVerticalAxisField = (verticalField: string) => {
        console.log('on verticalAxis selected ', verticalField, datasourceConfig)
        datasourceConfig.verticalField = verticalField;
        verticalCategories.up = ['']
        verticalCategories.middle = [''];
        verticalCategories.down = [''];
        setVerticalCategories({...verticalCategories})
        let selectedIds = Object.values((datasourceConfig as any)).filter(id => typeof id === 'string' && id.length > 0)
        fields.forEach(item => {
            item.disabled = selectedIds.findIndex(id => id === item.id) !== -1;
            console.log(item.disabled, item.id)
        })
        setFields(addNoneForList(fields))
        let field = fields.find(item => item.id === datasourceConfig.verticalField)
        if (field) {
            console.log('----field::', field)
            let options = field.property.options.map(item => ({ ...item, disabled: false}))
            if (options.length === 1) {
                options[0].disabled = true
                verticalCategories.up = [options[0].id]
                return;
            } else if (options.length === 2) {
                options[0].disabled = true
                verticalCategories.up = [options[0].id]
                options[1].disabled = true
                verticalCategories.middle = [options[1].id]
                return;
            } else if (options.length >= 3) {
                options[0].disabled = true
                verticalCategories.up = [options[0].id]
                options[Math.floor(options.length / 2)].disabled = true
                verticalCategories.middle = [options[Math.floor(options.length / 2)].id];
                options[options.length-1].disabled = true
                verticalCategories.down = [options[options.length -1].id];
            }
            setVerticalCategoryOptions(addNoneForList(options))
            setVerticalCategories({...verticalCategories})
        }
        datasourceConfig.verticalCategories = { ...verticalCategories }
        console.log('chooseVerticalAxisField----------------------------------------datasourceConfig', datasourceConfig)
        datasourceConfigCache = {...datasourceConfig}
        updateDatasourceConfig({...(datasourceConfig as any)})
        dataHelper.prepareData(datasource.tableId, datasource, datasourceConfigCache).then(() => {
            updateDatasource({...(datasource as any)})
        })
    }

    const onGroupChange = (selectValue) => {
        datasourceConfig.groupField = selectValue as string;
        console.log(selectValue, 'gropu')
        let selectedIds = Object.values((datasourceConfig as any)).filter(id => typeof id === 'string' && id.length > 0)
        fields.forEach(item => {
            item.disabled = selectedIds.findIndex(id => id === item.id) !== -1;
            console.log(item.disabled, item.id)
        })
        datasourceConfigCache = {...datasourceConfig}
        updateDatasourceConfig({...(datasourceConfig as any)})
        setFields(addNoneForList(fields))
        dataHelper.prepareData(datasource.tableId, datasource, datasourceConfigCache).then(() => {
            updateDatasource({...(datasource as any)})
        })
    }


    const addVerticalCategory = (type: 'up' | 'middle' | 'down') => {
        console.log('vertical category ',type,'   ' , verticalCategories[type])
        verticalCategories[type].push('')
        setVerticalCategories({...verticalCategories})
        datasourceConfig.verticalCategories = {...verticalCategories}
    }

    const removeVerticalCategory = (type: 'up' | 'middle' | 'down', index: number) => {
        if (verticalCategories[type].length <= 1) {
            return
        }
        verticalCategories[type].splice(index, 1)
        setVerticalCategories({...verticalCategories})
        datasourceConfig.verticalCategories = {...verticalCategories}
    }

    const addHorizontalCategory = (type: 'left' | 'middle' | 'right') => {
        console.log('add category::', type, "   ", horizontalCategories[type])
        horizontalCategories[type].push('')
        setHorizontalCategories({...horizontalCategories})
        datasourceConfig.horizontalCategories = {...horizontalCategories}
    }

    const removeHorizontalCategory = (type: 'left' | 'middle' | 'right', index: number) => {
        if (horizontalCategories[type].length <= 1) {
            return
        }
        horizontalCategories[type].splice(index, 1)
        setHorizontalCategories({...horizontalCategories})
        datasourceConfig.horizontalCategories = {...horizontalCategories}
    }

    // custom options style
    const PersonIcon = () => {
        return (
            <svg className="selection-icon" width="16" height="16" viewBox="0 0 16 16" fill="none"
                 xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M6 8.66634H10C11.8409 8.66634 14 9.95205 14 12.2663V13.333C14 14.0663 13.4 14.6663 12.6667 14.6663H3.33333C2.6 14.6663 2 14.0663 2 13.333V12.2663C2 9.95399 4.15905 8.66634 6 8.66634ZM12.6667 13.333V12.2219C12.6667 10.8209 11.2473 9.99967 10 9.99967H6C4.77998 9.99967 3.33333 10.7808 3.33333 12.2219V13.333H12.6667ZM8 7.99967C6.15905 7.99967 4.66667 6.50729 4.66667 4.66634C4.66667 2.82539 6.15905 1.33301 8 1.33301C9.84095 1.33301 11.3333 2.82539 11.3333 4.66634C11.3333 6.50729 9.84095 7.99967 8 7.99967ZM8 6.66634C9.10457 6.66634 10 5.77091 10 4.66634C10 3.56177 9.10457 2.66634 8 2.66634C6.89543 2.66634 6 3.56177 6 4.66634C6 5.77091 6.89543 6.66634 8 6.66634Z"
                    fill={ datasource.theme === 'light' ? '#646A73' : '#ffffff' }/>
            </svg>
        )
    }

    const TableIcon = () => {
        return (
            <svg className="selection-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.33203 2.66634C1.33203 1.92996 1.92898 1.33301 2.66536 1.33301H13.332C14.0684 1.33301 14.6654 1.92996 14.6654 2.66634V13.333C14.6654 14.0694 14.0684 14.6663 13.332 14.6663H2.66536C1.92899 14.6663 1.33203 14.0694 1.33203 13.333V2.66634ZM2.66536 2.66634V13.333H13.332V2.66634H2.66536Z" fill={ datasource.theme === 'light' ? '#646A73' : '#ffffff' }/>
                <path d="M8.33203 4.66634C7.96384 4.66634 7.66536 4.96482 7.66536 5.33301C7.66536 5.7012 7.96384 5.99967 8.33203 5.99967H11.332C11.7002 5.99967 11.9987 5.7012 11.9987 5.33301C11.9987 4.96482 11.7002 4.66634 11.332 4.66634H8.33203Z" fill={ datasource.theme === 'light' ? '#646A73' : '#ffffff' }/>
                <path d="M3.9987 5.33301C3.9987 4.96482 4.29718 4.66634 4.66536 4.66634H5.9987C6.36689 4.66634 6.66536 4.96482 6.66536 5.33301C6.66536 5.7012 6.36689 5.99967 5.9987 5.99967H4.66536C4.29717 5.99967 3.9987 5.7012 3.9987 5.33301Z" fill={ datasource.theme === 'light' ? '#646A73' : '#ffffff' }/>
                <path d="M8.33203 7.33301C7.96384 7.33301 7.66536 7.63148 7.66536 7.99967C7.66536 8.36786 7.96384 8.66634 8.33203 8.66634H11.332C11.7002 8.66634 11.9987 8.36786 11.9987 7.99967C11.9987 7.63148 11.7002 7.33301 11.332 7.33301H8.33203Z" fill={ datasource.theme === 'light' ? '#646A73' : '#ffffff' }/>
                <path d="M3.9987 7.99967C3.9987 7.63148 4.29718 7.33301 4.66536 7.33301H5.9987C6.36689 7.33301 6.66536 7.63148 6.66536 7.99967C6.66536 8.36786 6.36689 8.66634 5.9987 8.66634H4.66536C4.29717 8.66634 3.9987 8.36786 3.9987 7.99967Z" fill={ datasource.theme === 'light' ? '#646A73' : '#ffffff' }/>
                <path d="M8.33203 9.99967C7.96384 9.99967 7.66536 10.2982 7.66536 10.6663C7.66536 11.0345 7.96384 11.333 8.33203 11.333H11.332C11.7002 11.333 11.9987 11.0345 11.9987 10.6663C11.9987 10.2982 11.7002 9.99967 11.332 9.99967H8.33203Z" fill={ datasource.theme === 'light' ? '#646A73' : '#ffffff' }/>
                <path d="M3.9987 10.6663C3.9987 10.2982 4.29718 9.99967 4.66536 9.99967H5.9987C6.36689 9.99967 6.66536 10.2982 6.66536 10.6663C6.66536 11.0345 6.36689 11.333 5.9987 11.333H4.66536C4.29717 11.333 3.9987 11.0345 3.9987 10.6663Z" fill={ datasource.theme === 'light' ? '#646A73' : '#ffffff' }/>
            </svg>

        )
    }

    const OptionIcon = () => {
        return (
            <svg className="selection-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.17151 7.7721C4.91219 7.51105 4.91239 7.08883 5.17257 6.82864C5.43276 6.56845 5.85499 6.56825 6.11518 6.82844L8.00112 8.71437L9.88683 6.82866C10.1471 6.56838 10.5691 6.56859 10.8294 6.82887C11.0897 7.08915 11.0899 7.51118 10.8305 7.77232C10.043 8.56499 9.25976 9.36275 8.46225 10.1452C8.20596 10.3966 7.79627 10.3966 7.53998 10.1452C6.74239 9.36267 5.95904 8.56484 5.17151 7.7721Z" fill={ datasource.theme === 'light' ? '#646A73' : '#ffffff' }/>
                <path d="M8.0013 15.3337C3.95121 15.3337 0.667969 12.0504 0.667969 8.00033C0.667969 3.95024 3.95121 0.666992 8.0013 0.666992C12.0514 0.666992 15.3346 3.95024 15.3346 8.00033C15.3346 12.0504 12.0514 15.3337 8.0013 15.3337ZM8.0013 14.0003C11.315 14.0003 14.0013 11.314 14.0013 8.00033C14.0013 4.68662 11.315 2.00033 8.0013 2.00033C4.68759 2.00033 2.0013 4.68662 2.0013 8.00033C2.0013 11.314 4.68759 14.0003 8.0013 14.0003Z" fill={ datasource.theme === 'light' ? '#646A73' : '#ffffff' }/>
            </svg>
        )
    }

    const renderPersonSelectedItem = optionNode => (
        <div style={{ display: 'flex', alignItems: 'center',...textColorStyle() }}>
            <PersonIcon/>
            <span style={{ marginLeft: 8 }}>{optionNode.label}</span>
        </div>
    );

    const renderTableSelectedItem = optionNode => (
        <div style={{ display: 'flex', alignItems: 'center', ...textColorStyle() }}>
            <TableIcon/>
            <span style={{ marginLeft: 8 }}>{optionNode.label}</span>
        </div>
    );

    const classNames: (options: { [key: string]: boolean }) => string = (options: { [key: string]: boolean }) => {
        let cls: string[] = [];
        Object.keys(options).forEach(key => {
           if (options[key]) {
               cls.push(key)
           }
        });
        return cls.join(' ');
    }
    const renderTableOptionItem = renderProps => {
        const {
            disabled,
            selected,
            label,
            value,
            focused,
            className,
            style,
            onMouseEnter,
            onClick,
            empty,
            emptyContent,
            ...rest
        } = renderProps;

        const optionCls = classNames({
            ['custom-option-render']: true,
            ['custom-option-render-focused']: focused,
            ['custom-option-render-disabled']: disabled,
            ['custom-option-render-selected']: selected,
        });
        // const searchWords = [inputValue];
        return (
            <div style={{ ...style, ...{ display: 'flex', flexDirection: 'row', padding: '8px 12px', cursor:'pointer', alignItems: 'center',...textColorStyle() } }}
                 className={optionCls}
                 onClick={() => onClick()}
                 onMouseEnter={e => onMouseEnter()}>
                <TableIcon/>
                <span style={{ marginLeft: 8 }}>{label}</span>
                { selected ? (<IconTick style={{ marginLeft: 'auto', marginRight: '0' }}>
                </IconTick>) : '' }
            </div>
        );
    };

    const renderSelectOptionSelectedItem = optionNode => (
        <div style={{ display: 'flex', alignItems: 'center', ...textColorStyle() }}>
            <OptionIcon />
            <span style={{ marginLeft: 8 }}>{optionNode.label}</span>
        </div>
    );

    const formApi = useRef<any>();

    // 样式配置数据
    const { textConfig, updateTextConfig } = useTextConfigStore(
        (state) => state,
    );


    // const switchTheme = (theme: string) => {
    //     const body = document.body;
    //     body.removeAttribute('theme-mode');
    //
    //     body.setAttribute(
    //         'theme-mode',
    //         theme === ThemeModeType.LIGHT ? 'light' : 'dark',
    //     );
    // };

    useEffect(() => {
        // console.log('config panel useeffect', datasourceConfig, textConfig, datasource)
        let selectedFieldIds = [datasourceConfig.horizontalField ?? '', datasourceConfig.verticalField ?? '', datasourceConfig.personnelField ?? '', datasourceConfig.groupField ?? '']
        setFields(addNoneForList(datasource.fields[datasourceConfig.tableId].map(item => ({ ...item, disabled: selectedFieldIds.some(id => id === item.id)}))))
        let horizontalConfig = { left: [...datasourceConfig.horizontalCategories.left], middle: [...datasourceConfig.horizontalCategories.middle], right: [...datasourceConfig.horizontalCategories.right] }
        setHorizontalCategories(horizontalConfig)

        let verticalConfig = { up: [...datasourceConfig.verticalCategories.up], middle: [...datasourceConfig.verticalCategories.middle], down: [...datasourceConfig.verticalCategories.down] }
        setVerticalCategories(verticalConfig)

        let field = datasource.fields[datasourceConfig.tableId].find(item => item.id === datasourceConfig.verticalField)
        // console.log(field, '11')
        if (field) {
            let options = field.property.options.map(item => ({ ...item, disabled: (Object.values(datasourceConfig.verticalCategories)).flat().some(id => id === item.id)}))
            console.log(options)
            setVerticalCategoryOptions([...options])
        }
        let field1 = datasource.fields[datasourceConfig.tableId].find(item => item.id === datasourceConfig.horizontalField)
        // console.log(field1, '22')
        if (field1) {
            let options = field1.property.options.map(item => ({ ...item, disabled: (Object.values(datasourceConfig.horizontalCategories)).flat().some(id => id === item.id)}))
            console.log(options)
            setHorizontalCategoryOptions([...options])
        }
    }, []);

    useEffect(() => {

    }, []);

    // 类型与数据表单更改
    const handleDataSourceConfigFormValueChange = (values: any) => {
        console.log('handleDataSourceConfigFormValueChange',values, datasourceConfig)
    };

    const handleTextConfigFormValueChange = (values: any) => {
        console.log('handleTextConfigFormValueChange',textConfig)
        const newConfig = { ...textConfig, ...values };
        updateTextConfig({ ...newConfig });
    };

    // 保存配置
    const saveConfig = () => {
        datasourceConfig.horizontalCategories = {...horizontalCategories}
        datasourceConfig.verticalCategories = {...verticalCategories}
        updateDatasourceConfig({ ...(datasourceConfig as any) });
        console.log('save config:::', datasource, datasourceConfig, textConfig)
        dashboard.saveConfig({
            dataConditions: [
                {
                    tableId: datasourceConfig.tableId,
                },
            ],
            customConfig: {
                datasourceConfig,
                textConfig,
            },
        }).then();
    };

    const panelBgColorStyle: () => { [key: string]: string } = () => {
        return {
            backgroundColor: datasource.theme === 'light' ? '#FFFFFF' : '#292929'
        }
    }

    const bgColorStyle: () => { [key: string]: string } = () => {
        return {
            backgroundColor: datasource.theme === 'light' ? '#EFF4FF' : '#292929'
        }
    }

    const textColorStyle: () => { [key: string]: string } = () => {
        return {
            color: datasource.theme === 'light' ?  "#1F2329" :  "#FFFFFF"
        }
    }

    const cardColorStyle :() => { [key: string]: string } = () => {
        return {
            backgroundColor: datasource.theme === 'light' ? '#F5F6F7' : '#1F2329',
            borderColor: datasource.theme === 'light' ? '#DEE0E3' : '#1F2329'
        }
    }

    function searchLabel(sugInput, option) {
        let label = option.label.toUpperCase();
        let sug = sugInput.toUpperCase();
        return label.includes(sug);
    }

    return (
        <div
            className="border-[rgba(31, 35, 41, 0.15)] dark:border-[rgba(207,207,207, 0.15)] relative flex h-screen w-[350px] flex-col border-l-[0.5px]  bg-[--semi-color-bg-0]"
            style={{
                borderTop:
                    dashboard.state === DashboardState.View ? 'none' : '0.5px solid ',
                borderColor:
                    datasource.theme === 'light'
                        ? 'rgba(207,207,207, 0.15)'
                        : 'rgba(31, 35, 41, 0.15)',
                ...panelBgColorStyle(),
                ...textColorStyle()
            }}
        >
            <div className="relative flex-1">
                {
                    <Tabs type="line" contentStyle={ {...textColorStyle()}}>
                        <TabPane tab={t('tab_name1')} itemKey="1"
                                 style={{...textColorStyle()}}
                        >
                            <div
                                className="overflow-y-scroll px-[20px] pb-[48px] pt-[20px]"
                                style={{
                                    height: `calc(100vh - 125px)`,
                                }}
                            >

                                <Form
                                    onValueChange={(values) => handleDataSourceConfigFormValueChange(values)}
                                    getFormApi={(api) => (formApi.current = api)}
                                    autoComplete="off"
                                >
                                    <div className="flex-column form-list">
                                        <div className="selection-field">
                                            <div className="selection-title" style={{ marginBottom: '8px' }}>{t('data_source')}</div>
                                            <Form.Select
                                                field="tableId"
                                                noLabel={true}
                                                style={{ width: 300, ...textColorStyle() }}
                                                initValue={datasourceConfig.tableId}
                                                renderSelectedItem={renderTableSelectedItem}
                                                onChange={ async (selectValue) => chooseTable(selectValue as string)}
                                                optionList={datasource.tables.map((source) => ({
                                                    value: source.tableId,
                                                    label: source.tableName,
                                                }))}
                                                renderOptionItem={renderTableOptionItem}
                                            />
                                        </div>

                                        <div className="selection-field">
                                            <div className="selection-title" style={{ marginBottom: '8px' }}>{t('data_range')}</div>
                                            <Form.Select
                                                field="dataRange"
                                                noLabel={true}
                                                style={{ width: 300, ...textColorStyle() }}
                                                key={datasourceConfig.dataRange}
                                                remote={true}
                                                initValue={datasourceConfig.dataRange}
                                                onChange={(selectedValue) => {
                                                    datasourceConfig.dataRange = selectedValue as string
                                                    console.log('on data range selected ', selectedValue, datasourceConfig)
                                                }}
                                                renderSelectedItem={renderTableSelectedItem}
                                                optionList={datasource.dataRanges.map((range) => {
                                                    const { type, viewName, viewId } = range as any;
                                                    if (type === SourceType.ALL) {
                                                        return {
                                                            value: 'All',
                                                            label: t('view_all'),
                                                        };
                                                    } else {
                                                        return {
                                                            value: viewId,
                                                            label: viewName,
                                                        };
                                                    }
                                                })}
                                                renderOptionItem={renderTableOptionItem}
                                            />
                                        </div>

                                        <Divider dashed={false} style={cardColorStyle()} />

                                        <div className="selection-field">
                                            <div className="selection-title" style={{ marginBottom: '8px' }}>{t('personnel')}</div>
                                            <Form.Select
                                                field="personnel"
                                                filter={searchLabel}
                                                noLabel={true}
                                                style={{ width: 300,...textColorStyle() }}
                                                remote={true}
                                                initValue={datasourceConfig.personnelField}
                                                onChange={async (selectValue) => choosePersonField(selectValue as string)}
                                                renderSelectedItem={renderPersonSelectedItem}
                                                optionList={fields.map((item) => {
                                                    const { id, name, disabled } = item as any;
                                                    return {
                                                        value: id,
                                                        label: id === '' ? t(name) : name,
                                                        disabled: disabled
                                                    };
                                                })}
                                            />
                                        </div>

                                        <div className="selection-field">
                                            <div className="selection-title" style={{ marginBottom: '8px' }}>{t('horizontalAxis')}</div>
                                            <div className="selection-card" style={{ ...textColorStyle(), ...cardColorStyle()}}>
                                                <div className="selection-card-title">{t('chooseField')}</div>
                                                <Form.Select
                                                    field="horizontalField"
                                                    noLabel={true}
                                                    style={{ width: '100%' }}
                                                    filter={searchLabel}
                                                    remote={true}
                                                    initValue={datasourceConfig.horizontalField}
                                                    renderSelectedItem={renderSelectOptionSelectedItem}
                                                    onChange={async (selectValue) => chooseHorizontalAxisField(selectValue as string)}
                                                    optionList={fields.map((item) => {
                                                        const { id, name, disabled } = item as any;
                                                        return {
                                                            value: id,
                                                            label: id === '' ? t(name) : name,
                                                            disabled: disabled
                                                        };
                                                    })}
                                                />
                                            </div>
                                        </div>
                                        <div className="selection-list">
                                            <div className="selection-card" style={{ ...textColorStyle(), ...cardColorStyle()}}>
                                                <div className="selection-card-title" style={textColorStyle()}>{t('left')}</div>
                                                {horizontalCategories.left.map((id, index) => {
                                                    return (<div className="delete-able-select-container" key={id + ' '+ index}>
                                                        <Form.Select
                                                            field={'horizontalLeftValues'+index}
                                                            noLabel={true}
                                                            key={id}
                                                            style={{ width: '100%',...textColorStyle() }}
                                                            remote={true}
                                                            initValue={id}
                                                            onSelect={ (selectValue) => {
                                                                const value = selectValue as string;
                                                                if (value === horizontalCategories.left[index]) {
                                                                    horizontalCategories.left[index] = ''
                                                                } else {
                                                                    horizontalCategories.left[index] = value
                                                                }
                                                                let selectedIds = Object.values(horizontalCategories).flat().filter(id => id.length > 0)
                                                                console.log(selectedIds, Object.values(horizontalCategories))
                                                                horizontalCategoryOptions.forEach(item => {
                                                                    item.disabled = selectedIds.findIndex(id => id === item.id) !== -1;
                                                                    console.log(item.disabled, item.id)
                                                                })
                                                                setHorizontalCategoryOptions([...horizontalCategoryOptions])
                                                            }}
                                                            optionList={horizontalCategoryOptions.map((item) => {
                                                                const { id, name, disabled } = item as any;
                                                                return {
                                                                    value: id,
                                                                    label: id === '' ? t(name) : name,
                                                                    disabled: id === horizontalCategories.left[index] ? false : disabled
                                                                };
                                                            })}
                                                        />
                                                        <img src={deleteIcon} alt="" className="delete-icon action-container"
                                                             style={{ pointerEvents: horizontalCategories.left.length <= 1 && index === 0 ? 'none' : 'auto', opacity: horizontalCategories.left.length <= 1 && index === 0 ? 0.3 : 1  }}
                                                             onClick={ () => removeHorizontalCategory('left', index)}
                                                        />
                                                    </div>)
                                                })}
                                                <div className="flex-row action-container"
                                                     onClick={ () => addHorizontalCategory('left')}
                                                >
                                                    <img src={addIcon} alt="" className="add-icon"/>
                                                    <div className="selection-card-bottom-text">{t('addCategory')}</div>
                                                </div>
                                            </div>
                                            <div className="selection-card" style={{ ...textColorStyle(), ...cardColorStyle()}}>
                                                <div className="selection-card-title" style={textColorStyle()}>{t('middle')}</div>
                                                {horizontalCategories.middle.map((id, index) => {
                                                    // console.log('horizontalCategories middle', id, index)
                                                    return (<div className="delete-able-select-container" key={id + ' ' + index}>
                                                        <Form.Select
                                                            field={'horizontalMiddleValue'+index}
                                                            noLabel={true}
                                                            style={{ width: '100%',...textColorStyle() }}
                                                            remote={true}
                                                            key={id}
                                                            initValue={id}
                                                            onSelect={ (selectValue) => {
                                                                const value = selectValue as string;
                                                                if (value === horizontalCategories.middle[index]) {
                                                                    horizontalCategories.middle[index] = ''
                                                                } else {
                                                                    horizontalCategories.middle[index] = value
                                                                }
                                                                let selectedIds = Object.values(horizontalCategories).flat().filter(id => id.length > 0)
                                                                console.log(selectedIds, Object.values(horizontalCategories))
                                                                horizontalCategoryOptions.forEach(item => {
                                                                    item.disabled = selectedIds.findIndex(id => id === item.id) !== -1;
                                                                    console.log(item.disabled, item.id)
                                                                })
                                                                setHorizontalCategoryOptions([...horizontalCategoryOptions])
                                                            }}
                                                            optionList={horizontalCategoryOptions.map((item) => {
                                                                const { id, name, disabled } = item as any;
                                                                return {
                                                                    value: id,
                                                                    label: id === '' ? t(name) : name,
                                                                    disabled: id === horizontalCategories.middle[index]? false : disabled
                                                                };
                                                            })}
                                                        />
                                                        <img src={deleteIcon} alt="" className="delete-icon action-container"
                                                             style={{ pointerEvents: horizontalCategories.middle.length <= 1 && index === 0 ? 'none' : 'auto', opacity: horizontalCategories.middle.length <= 1 && index === 0 ? 0.3 : 1  }}
                                                             onClick={ () => removeHorizontalCategory('middle', index)}
                                                        />
                                                    </div>)
                                                })}
                                                <div className="flex-row action-container"
                                                     onClick={() => addHorizontalCategory('middle')}>
                                                    <img src={addIcon} alt="" className="add-icon"/>
                                                    <div className="selection-card-bottom-text">{t('addCategory')}</div>
                                                </div>
                                            </div>
                                            <div className="selection-card" style={{ ...textColorStyle(), ...cardColorStyle()}}>
                                                <div className="selection-card-title" style={textColorStyle()}>{t('right')}</div>
                                                {horizontalCategories.right.map((id, index) => {
                                                    return (<div className="delete-able-select-container" key={id +' ' + index}>
                                                        <Form.Select
                                                            field={'horizontalRightValue'+index}
                                                            noLabel={true}
                                                            key={id}
                                                            style={{ width: '100%',...textColorStyle() }}
                                                            remote={true}
                                                            initValue={id}
                                                            onSelect={ (selectValue) => {
                                                                const value = selectValue as string;
                                                                if (value === horizontalCategories.right[index]) {
                                                                    horizontalCategories.right[index] = ''
                                                                } else {
                                                                    horizontalCategories.right[index] = value
                                                                }
                                                                let selectedIds = Object.values(horizontalCategories).flat().filter(id => id.length > 0)
                                                                console.log(selectedIds, Object.values(horizontalCategories))
                                                                horizontalCategoryOptions.forEach(item => {
                                                                    item.disabled = selectedIds.findIndex(id => id === item.id) !== -1;
                                                                    console.log(item.disabled, item.id)
                                                                })
                                                                setHorizontalCategoryOptions([...horizontalCategoryOptions])
                                                            }}
                                                            optionList={horizontalCategoryOptions.map((item) => {
                                                                const { id, name, disabled } = item as any;
                                                                return {
                                                                    value: id,
                                                                    label: id === '' ? t(name) : name,
                                                                    disabled: id === horizontalCategories.right[index]? false : disabled
                                                                };
                                                            })}
                                                        />
                                                        <img src={deleteIcon} alt="" className="delete-icon action-container"
                                                             style={{ pointerEvents: horizontalCategories.right.length <= 1 && index === 0 ? 'none' : 'auto', opacity: horizontalCategories.right.length <= 1 && index === 0 ? 0.3 : 1  }}
                                                             onClick={ () => removeHorizontalCategory('right', index)}
                                                        />
                                                    </div>)
                                                })}
                                                <div className="flex-row action-container"
                                                     onClick={ () => addHorizontalCategory('right')}
                                                >
                                                    <img src={addIcon} alt="" className="add-icon"/>
                                                    <div className="selection-card-bottom-text">{t('addCategory')}</div>
                                                </div>
                                            </div>
                                        </div>


                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div className="selection-title" style={{ marginBottom: '8px',...textColorStyle() }}>{t('verticalAxis')}</div>

                                            <div className="selection-card" style={{ ...textColorStyle(), ...cardColorStyle()}}>
                                                <div className="selection-card-title" style={textColorStyle()}>{t('chooseField')}</div>
                                                <Form.Select
                                                    field="verticalField"
                                                    noLabel={true}
                                                    filter={searchLabel}
                                                    style={{ width: '100%',...textColorStyle() }}
                                                    remote={true}
                                                    initValue={datasourceConfig.verticalField}
                                                    renderSelectedItem={renderSelectOptionSelectedItem}
                                                    onChange={async (selectValue) => chooseVerticalAxisField(selectValue as string)}
                                                    optionList={fields.map((item) => {
                                                        const { id, name, disabled } = item as any;
                                                        return {
                                                            value: id,
                                                            label: id === '' ? t(name) : name,
                                                            disabled: disabled
                                                        };
                                                    })}
                                                />
                                            </div>
                                        </div>

                                        <div className="selection-list margin-top-tw margin-bottom-tw">
                                            <div className="selection-card" style={{ ...textColorStyle(), ...cardColorStyle()}}>
                                                <div className="selection-card-title" style={textColorStyle()}>{t('up')}</div>
                                                {verticalCategories.up.map((id, index) => {
                                                    return (<div className="delete-able-select-container" key={id + ' '+ index}>
                                                        <Form.Select
                                                            field={'verticalUpValue'+index}
                                                            noLabel={true}
                                                            key={id}
                                                            style={{ width: '100%',...textColorStyle() }}
                                                            remote={true}
                                                            initValue={id}
                                                            onSelect={ (selectValue) => {
                                                                const value = selectValue as string;
                                                                if (value === verticalCategories.up[index]) {
                                                                    verticalCategories.up[index] = ''
                                                                } else {
                                                                    verticalCategories.up[index] = value
                                                                }
                                                                let selectedIds = Object.values(verticalCategories).flat().filter(id => id.length > 0)
                                                                console.log(selectedIds, Object.values(verticalCategories))
                                                                verticalCategoryOptions.forEach(item => {
                                                                    item.disabled = selectedIds.findIndex(id => id === item.id) !== -1;
                                                                    console.log(item.disabled, item.id)
                                                                })
                                                                setVerticalCategoryOptions([...verticalCategoryOptions])
                                                            }}
                                                            optionList={verticalCategoryOptions.map((item) => {
                                                                const { id, name, disabled } = item as any;
                                                                return {
                                                                    value: id,
                                                                    label: id === '' ? t(name) : name,
                                                                    disabled: id === verticalCategories.up[index] ? false : disabled
                                                                };
                                                            })}
                                                        />
                                                        <img src={deleteIcon} alt="" className="delete-icon action-container"
                                                             style={{ pointerEvents: verticalCategories.up.length <= 1 && index === 0 ? 'none' : 'auto', opacity: verticalCategories.up.length <= 1 && index === 0 ? 0.3 : 1  }}
                                                             onClick={ () => removeVerticalCategory('up', index)}
                                                        />
                                                    </div>)
                                                })}
                                                <div className="flex-row action-container"
                                                     onClick={ () => {
                                                         addVerticalCategory('up')
                                                     }}
                                                >
                                                    <img src={addIcon} alt="" className="add-icon"/>
                                                    <div className="selection-card-bottom-text">{t('addCategory')}</div>
                                                </div>
                                            </div>
                                            <div className="selection-card" style={{ ...textColorStyle(), ...cardColorStyle()}}>
                                                <div className="selection-card-title" style={textColorStyle()}>{t('middle')}</div>
                                                {verticalCategories.middle.map((id, index) => {
                                                    return (<div className="delete-able-select-container" key={id + ' '+ index}>
                                                        <Form.Select
                                                            field={'verticalMiddleValue'+index}
                                                            noLabel={true}
                                                            key={id}
                                                            style={{ width: '100%',...textColorStyle() }}
                                                            remote={true}
                                                            initValue={id}
                                                            onSelect={ (selectValue) => {
                                                                const value = selectValue as string;
                                                                if (value === verticalCategories.middle[index]) {
                                                                    verticalCategories.middle[index] = ''
                                                                } else {
                                                                    verticalCategories.middle[index] = value
                                                                }
                                                                let selectedIds = Object.values(verticalCategories).flat().filter(id => id.length > 0)
                                                                console.log(selectedIds, Object.values(verticalCategories))
                                                                verticalCategoryOptions.forEach(item => {
                                                                    item.disabled = selectedIds.findIndex(id => id === item.id) !== -1;
                                                                    console.log(item.disabled, item.id)
                                                                })
                                                                setVerticalCategoryOptions([...verticalCategoryOptions])
                                                            }}
                                                            optionList={verticalCategoryOptions.map((item) => {
                                                                const { id, name, disabled } = item as any;
                                                                return {
                                                                    value: id,
                                                                    label: id === '' ? t(name) : name,
                                                                    disabled: id === verticalCategories.middle[index] ? false : disabled
                                                                };
                                                            })}
                                                        />
                                                        <img src={deleteIcon} alt="" className="delete-icon action-container"
                                                             style={{ pointerEvents: verticalCategories.middle.length <= 1 && index === 0 ? 'none' : 'auto', opacity: verticalCategories.middle.length <= 1 && index === 0 ? 0.3 : 1  }}
                                                             onClick={ () => removeVerticalCategory('middle', index)}
                                                        />
                                                    </div>)
                                                })}
                                                <div className="flex-row action-container"
                                                     onClick={ () => addVerticalCategory('middle')}
                                                >
                                                    <img src={addIcon} alt="" className="add-icon"/>
                                                    <div className="selection-card-bottom-text">{t('addCategory')}</div>
                                                </div>
                                            </div>
                                            <div className="selection-card" style={{ ...textColorStyle(), ...cardColorStyle()}}>
                                                <div className="selection-card-title" style={textColorStyle()}>{t('down')}</div>
                                                {verticalCategories.down.map((id, index) => {
                                                    return (<div className="delete-able-select-container" key={id + ' '+ index}>
                                                        <Form.Select
                                                            field={'verticalDownValue'+index}
                                                            noLabel={true}
                                                            style={{ width: '100%',...textColorStyle() }}
                                                            key={id}
                                                            id={id}
                                                            initValue={id}
                                                            onSelect={ (selectValue) => {
                                                                const value = selectValue as string;
                                                                if (value === verticalCategories.down[index]) {
                                                                    verticalCategories.down[index] = ''
                                                                } else {
                                                                    verticalCategories.down[index] = value
                                                                }
                                                                let selectedIds = Object.values(verticalCategories).flat().filter(id => id.length > 0)
                                                                console.log(selectedIds, Object.values(verticalCategories))
                                                                verticalCategoryOptions.forEach(item => {
                                                                    item.disabled = selectedIds.findIndex(id => id === item.id) !== -1;
                                                                    console.log(item.disabled, item.id)
                                                                })
                                                                setVerticalCategoryOptions([...verticalCategoryOptions])
                                                            }}
                                                            optionList={verticalCategoryOptions.map((item) => {
                                                                const { id, name, disabled } = item as any;
                                                                return {
                                                                    value: id,
                                                                    label: id === '' ? t(name) : name,
                                                                    disabled: id === verticalCategories.down[index] ? false : disabled
                                                                };
                                                            })}
                                                        />
                                                        <img src={deleteIcon} alt="" className="delete-icon action-container"
                                                             style={{ pointerEvents: verticalCategories.down.length <= 1 && index === 0 ? 'none' : 'auto', opacity: verticalCategories.down.length <= 1 && index === 0 ? 0.3 : 1  }}
                                                             onClick={ () => removeVerticalCategory('down', index)}
                                                        />
                                                    </div>)
                                                })}
                                                <div className="flex-row action-container"
                                                     onClick={ () => addVerticalCategory('down')}
                                                >
                                                    <img src={addIcon} alt="" className="add-icon"/>
                                                    <div className="selection-card-bottom-text">{t('addCategory')}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="selection-field">
                                            <div className="selection-title" style={{ marginBottom: '8px' }}>{t('group')}</div>
                                            <Form.Select
                                                field="group"
                                                noLabel={true}
                                                filter={searchLabel}
                                                style={{ width: 300,...textColorStyle() }}
                                                remote={true}
                                                initValue={datasourceConfig.groupField}
                                                onChange={async (selectValue) => onGroupChange(selectValue)}
                                                renderSelectedItem={renderSelectOptionSelectedItem}
                                                optionList={fields.map((item) => {
                                                    const { id, name, disabled } = item as any;
                                                    return {
                                                        value: id,
                                                        label: id === '' ? t((name === 'none') ? 'noneGroup' : name) : name,
                                                        disabled: disabled
                                                    };
                                                })}
                                            />
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </TabPane>



                        <TabPane tab={t('tab_name2')} itemKey="2">
                            <div
                                className="flex flex-col gap-[16px] overflow-y-scroll pb-[48px] pt-[20px]"
                                style={{
                                    height: `calc(100vh - 125px)`,
                                }}
                            >

                                <Form
                                    initValues={textConfig}
                                    onValueChange={(values) => handleTextConfigFormValueChange(values)}
                                    getFormApi={(api) => (formApi.current = api)}
                                    autoComplete="off"
                                >

                                    <div className="selection-title margin-top-tw" style={textColorStyle()}>{t('horizontalAxisCategory')}</div>
                                    <div className="selection-card" style={{ ...textColorStyle(), ...cardColorStyle()}}>
                                        <Form.Input field='HLeftValue' label={ t('left')} style={{ width: '100%',...textColorStyle() }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='HMiddleValue' label={ t('middle')} style={{ width: '100%',...textColorStyle() }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='HRightValue' label={ t('right')} style={{ width: '100%',...textColorStyle() }} placeholder={t('pleaseEnterText')}></Form.Input>
                                    </div>

                                    <div className="selection-title margin-top-tw" style={textColorStyle()}>{t('verticalAxisCategory')}</div>
                                    <div className="selection-card" style={{ ...textColorStyle(), ...cardColorStyle()}}>
                                        <Form.Input field='VUpValue' label={ t('up')} style={{ width: '100%',...textColorStyle() }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='VMiddleValue' label={ t('middle')} style={{ width: '100%',...textColorStyle() }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='VDownValue' label={ t('down')} style={{ width: '100%',...textColorStyle() }} placeholder={t('pleaseEnterText')}></Form.Input>
                                    </div>

                                    <div className="selection-title margin-top-tw" style={textColorStyle()}>{t('cellTitle')}</div>
                                    <div className="selection-card" style={{ ...textColorStyle(), ...cardColorStyle()}}>
                                        <Form.Input field='leftDownValue' label={ t('leftDown')} style={{ width: '100%',...textColorStyle() }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='middleDownValue' label={ t('middleDown')} style={{ width: '100%',...textColorStyle() }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='rightDownValue' label={ t('rightDown')} style={{ width: '100%',...textColorStyle() }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='leftMiddleValue' label={ t('leftMiddle')} style={{ width: '100%',...textColorStyle() }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='middleMiddleValue' label={ t('middleMiddle')} style={{ width: '100%',...textColorStyle() }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='rightMiddleValue' label={ t('rightMiddle')} style={{ width: '100%',...textColorStyle() }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='leftUpValue' label={ t('leftUp')} style={{ width: '100%',...textColorStyle() }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='middleUpValue' label={ t('middleUp')} style={{ width: '100%',...textColorStyle() }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='rightUpValue' label={ t('rightUp')} style={{ width: '100%',...textColorStyle() }} placeholder={t('pleaseEnterText')}></Form.Input>
                                    </div>
                                </Form>
                            </div>
                        </TabPane>
                    </Tabs>
                }
            </div>
            <div className="relative h-[72px] w-[340px]"
                 style={{
                     ...textColorStyle()
                 }}
            >
                <Button
                    className="fixed bottom-[10px] right-[10px] w-[80px] bg-[var(--semi-color-primary)]"
                    theme="solid"
                    type="primary"
                    onClick={() => saveConfig()}
                >
                    确认
                </Button>
            </div>
        </div>
    );
};
