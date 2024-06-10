import {
    dashboard,
    bridge,
    ThemeModeType,
    SourceType,
    IDataRange,
    FieldType,
    DashboardState, base,
} from '@lark-base-open/js-sdk';
import {useEffect, useRef, FC, useState} from 'react';
import {
    Tabs,
    TabPane,
    Form,
    Select,
    Input,
    Slider,
    InputNumber,
    RadioGroup,
    Radio,
    Button,
    Divider
} from '@douyinfe/semi-ui';

import { useDatasourceConfigStore, useTextConfigStore, useDatasourceStore } from '../../store';

import deleteIcon from '../../assets/icon_delete-trash_outlined.svg';
import addIcon from '../../assets/icon_add_outlined.svg';
import personIcon from '../../assets/icon_person.svg';
import tableIcon from '../../assets/icon_table.svg';
import selectOptionIcon from '../../assets/icon_choose.svg';


import { useTranslation } from 'react-i18next';

import './index.css';

interface IConfigPanelPropsType {
    dataRange: IDataRange[];
    categories: any[];
    getTableConfig: (id: string | null) => any;
}

export const ConfigPanel: FC<IConfigPanelPropsType> = (props) => {

    const { t, i18n } = useTranslation();

    // 类型与数据
    const { datasourceConfig, updateDatasourceConfig } = useDatasourceConfigStore((state) => state);
    const { datasource, updateDatasource } = useDatasourceStore((state) => state);


    // 保存 选择的表
    const [tableId, setTableId] = useState('')
    // 保存选择表的字段数据
    const [fields, setFields] = useState([])
    // 保存竖轴选择完字段后子分类的选项数据
    const [verticalCategoryOptions, setVerticalCategoryOptions] = useState([])
    const [verticalCategories, setVerticalCategories] = useState({
        up: [''],
        middle: [''],
        down: ['']
    })
    // 保存横轴选择完字段后子分类的选项数据
    const [horizontalCategoryOptions, setHorizontalCategoryOptions] = useState([])
    const [horizontalCategories, setHorizontalCategories] = useState({
        left: [''],
        middle: [''],
        right: ['']
    })

    const chooseTable = async (tableId: string) => {
        console.log('on data source selected ', tableId, datasourceConfig)
        let fields = [];
        if (datasource.fields[tableId] && datasource.fields[tableId].length > 0) {
            fields = datasource.fields[tableId];
        } else {
            const table = await base.getTable(tableId);
            console.log('-----',table)
            fields = await table.getFieldMetaList()
        }
        if (datasourceConfig.tableId !== tableId) {
            datasourceConfig.horizontalField = ''
            datasourceConfig.verticalField = ''
            datasourceConfig.personnelField = ''
            datasourceConfig.tableId = tableId
        }
        datasource.fields[tableId] = [...fields.map(item => ({ ...item, disabled: false}))];
        datasource.tableId = tableId
        updateDatasource(datasource)
        updateDatasourceConfig({...datasourceConfig})
        setTableId(tableId)
        setFields([...fields])
        console.log(datasource.tableId, datasource.fields)
    }

    const choosePersonField = (personnel: string) => {
        datasourceConfig.personnelField = personnel;
        let selectedIds = Object.values(datasourceConfig).filter(id => typeof id === 'string' && id.length > 0)
        console.log(selectedIds)
        fields.forEach(item => {
            item.disabled = selectedIds.findIndex(id => id === item.id) !== -1;
            console.log(item.disabled, item.id)
        })
        updateDatasourceConfig({...datasourceConfig})
        setFields([...fields])
        console.log('on personnel choose', personnel, datasourceConfig)
    }

    const chooseHorizontalAxisField = (horizontalField: string) => {
        console.log('on horizontalAxis selected ', horizontalField, datasourceConfig)
        datasourceConfig.horizontalField = horizontalField;
        horizontalCategories.left = ['']
        horizontalCategories.middle = [''];
        horizontalCategories.right = [''];
        setHorizontalCategories({...horizontalCategories})
        let selectedIds = Object.values(datasourceConfig).filter(id => typeof id === 'string' && id.length > 0)
        fields.forEach(item => {
            item.disabled = selectedIds.findIndex(id => id === item.id) !== -1;
            console.log(item.disabled, item.id)
        })
        console.log('horizontalField-----',datasource.fields[datasource.tableId])
        updateDatasourceConfig({...datasourceConfig})
        setFields(fields)
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
            setHorizontalCategoryOptions([...options])
            setHorizontalCategories({...horizontalCategories})
        }
    }

    const chooseVerticalAxisField = (verticalField: string) => {
        console.log('on verticalAxis selected ', verticalField, datasourceConfig)
        datasourceConfig.verticalField = verticalField;
        verticalCategories.up = ['']
        verticalCategories.middle = [''];
        verticalCategories.down = [''];
        setVerticalCategories({...verticalCategories})
        let selectedIds = Object.values(datasourceConfig).filter(id => typeof id === 'string' && id.length > 0)
        fields.forEach(item => {
            item.disabled = selectedIds.findIndex(id => id === item.id) !== -1;
            console.log(item.disabled, item.id)
        })
        updateDatasourceConfig({...datasourceConfig})
        setFields(fields)
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
            setVerticalCategoryOptions([...options])
            setVerticalCategories({...verticalCategories})
        }
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

    const renderPersonSelectedItem = optionNode => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={personIcon} alt="" className="selection-icon" style={{ opacity: optionNode.label ? 1 : 0 }} />
            <span style={{ marginLeft: 8 }}>{optionNode.label}</span>
        </div>
    );

    const renderTableSelectedItem = optionNode => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={tableIcon} alt="" className="selection-icon" style={{ opacity: optionNode.label ? 1 : 0 }} />
            <span style={{ marginLeft: 8 }}>{optionNode.label}</span>
        </div>
    );

    const renderSelectOptionSelectedItem = optionNode => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={selectOptionIcon} alt="" className="selection-icon" style={{ opacity: optionNode.label ? 1 : 0 }} />
            <span style={{ marginLeft: 8 }}>{optionNode.label}</span>
        </div>
    );

    const formApi = useRef<any>();

    // 样式配置数据
    const { textConfig, updateTextConfig } = useTextConfigStore(
        (state) => state,
    );

    const { Option } = Form.Select;

    const switchTheme = (theme: string) => {
        const body = document.body;
        body.removeAttribute('theme-mode');

        body.setAttribute(
            'theme-mode',
            theme === ThemeModeType.LIGHT ? 'light' : 'dark',
        );
    };

    useEffect(() => {
        // console.log('config panel useeffect', datasourceConfig, textConfig, datasource)
        setTableId(datasourceConfig.tableId)
        let selectedFieldIds = [datasourceConfig.horizontalField ?? '', datasourceConfig.verticalField ?? '', datasourceConfig.personnelField ?? '', datasourceConfig.groupField ?? '']
        setFields(datasource.fields[datasourceConfig.tableId].map(item => ({ ...item, disabled: selectedFieldIds.some(id => id === item.id)})))
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
        console.log('handleDataSourceConfigFormValueChange',values)
        // const newConfig = { ...datasourceConfig, ...values };
        // updateDatasourceConfig({ ...newConfig });
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
        updateDatasourceConfig({ ...datasourceConfig });
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

    return (
        <div
            className="border-[rgba(31, 35, 41, 0.15)] dark:border-[rgba(207,207,207, 0.15)] relative flex h-screen w-[350px] flex-col border-l-[0.5px]  bg-[--semi-color-bg-0]"
            style={{
                borderTop:
                    dashboard.state === DashboardState.View ? 'none' : '0.5px solid ',
                borderColor:
                    datasourceConfig.theme === 'light'
                        ? 'rgba(207,207,207, 0.15)'
                        : 'rgba(31, 35, 41, 0.15)',
            }}
        >
            <div className="relative flex-1">
                {
                    <Tabs type="line">
                        <TabPane tab={t('tab_name1')} itemKey="1">
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
                                        <Form.Select
                                            field="tableId"
                                            label={{ text: t('data_source') }}
                                            style={{ width: 300 }}
                                            initValue={datasourceConfig.tableId}
                                            renderSelectedItem={renderTableSelectedItem}
                                            onChange={ async (selectValue) => chooseTable(selectValue as string)}
                                            optionList={datasource.tables.map((source) => ({
                                                value: source.tableId,
                                                label: source.tableName,
                                            }))}
                                        />

                                        <Form.Select
                                            field="dataRange"
                                            label={{ text: t('data_range') }}
                                            style={{ width: 300 }}
                                            remote={true}
                                            initValue={datasourceConfig.dataRange}
                                            defaultValue={datasourceConfig.dataRange}
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
                                        />

                                        <Divider dashed={false} />

                                        <Form.Select
                                            field="personnel"
                                            label={{ text: t('personnel') }}
                                            style={{ width: 300 }}
                                            remote={true}
                                            initValue={datasourceConfig.personnelField}
                                            defaultValue={datasourceConfig.personnelField}
                                            onChange={async (selectValue) => choosePersonField(selectValue as string)}
                                            renderSelectedItem={renderPersonSelectedItem}
                                            optionList={fields.map((item) => {
                                                const { id, name, disabled } = item as any;
                                                return {
                                                    value: id,
                                                    label: name,
                                                    disabled: disabled
                                                };
                                            })}
                                        />

                                        <div className="selection-title">{t('horizontalAxis')}</div>

                                        <div className="selection-card">
                                            <div className="selection-card-title">{t('chooseField')}</div>
                                            <Form.Select
                                                field="horizontalField"
                                                noLabel={true}
                                                style={{ width: '100%' }}
                                                remote={true}
                                                initValue={datasourceConfig.horizontalField}
                                                defaultValue={datasourceConfig.horizontalField}
                                                renderSelectedItem={renderSelectOptionSelectedItem}
                                                onChange={async (selectValue) => chooseHorizontalAxisField(selectValue as string)}
                                                optionList={fields.map((item) => {
                                                    const { id, name, disabled } = item as any;
                                                    return {
                                                        value: id,
                                                        label: name,
                                                        disabled: disabled
                                                    };
                                                })}
                                            />
                                        </div>

                                        <div className="selection-list">
                                            <div className="selection-card">
                                                <div className="selection-card-title">{t('left')}</div>
                                                {horizontalCategories.left.map((id, index) => {
                                                    // console.log('horizontalCategories left', id, index)
                                                    return (<div className="delete-able-select-container">
                                                        <Form.Select
                                                            field={'horizontalLeft'+index}
                                                            noLabel={true}
                                                            key={id}
                                                            style={{ width: '100%' }}
                                                            remote={true}
                                                            defaultValue={id}
                                                            onChange={(selectValue) => {
                                                                horizontalCategories.left[index] = selectValue as string
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
                                                                    label: name,
                                                                    disabled: disabled
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
                                            <div className="selection-card">
                                                <div className="selection-card-title">{t('middle')}</div>
                                                {horizontalCategories.middle.map((id, index) => {
                                                    // console.log('horizontalCategories middle', id, index)
                                                    return (<div className="delete-able-select-container">
                                                        <Form.Select
                                                            field={'horizontalMiddle'+index}
                                                            noLabel={true}
                                                            style={{ width: '100%' }}
                                                            remote={true}
                                                            key={id}
                                                            defaultValue={id}
                                                            onChange={(selectValue) => {
                                                                horizontalCategories.middle[index] = selectValue as string
                                                                let selectedIds = Object.values(horizontalCategories).flat().filter(id => id.length > 0)
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
                                                                    label: name,
                                                                    disabled: disabled
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
                                            <div className="selection-card">
                                                <div className="selection-card-title">{t('right')}</div>
                                                {horizontalCategories.right.map((id, index) => {
                                                    // console.log('horizontalCategories right', id, index)
                                                    return (<div className="delete-able-select-container">
                                                        <Form.Select
                                                            field={'horizontalRight'+index}
                                                            noLabel={true}
                                                            key={id}
                                                            style={{ width: '100%' }}
                                                            remote={true}
                                                            defaultValue={id}
                                                            onChange={(selectValue) => {
                                                                horizontalCategories.right[index] = selectValue as string
                                                                let selectedIds = Object.values(horizontalCategories).flat().filter(id => id.length > 0)
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
                                                                    label: name,
                                                                    disabled: disabled
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


                                        <div className="selection-title">{t('verticalAxis')}</div>

                                        <div className="selection-card">
                                            <div className="selection-card-title">{t('chooseField')}</div>
                                            <Form.Select
                                                field="verticalField"
                                                noLabel={true}
                                                style={{ width: '100%' }}
                                                remote={true}
                                                initValue={datasourceConfig.verticalField}
                                                renderSelectedItem={renderSelectOptionSelectedItem}
                                                onChange={async (selectValue) => chooseVerticalAxisField(selectValue as string)}
                                                optionList={fields.map((item) => {
                                                    const { id, name, disabled } = item as any;
                                                    return {
                                                        value: id,
                                                        label: name,
                                                        disabled: disabled
                                                    };
                                                })}
                                            />
                                        </div>

                                        <div className="selection-list margin-top-tw margin-bottom-tw">
                                            <div className="selection-card">
                                                <div className="selection-card-title">{t('up')}</div>
                                                {verticalCategories.up.map((id, index) => {
                                                    return (<div className="delete-able-select-container">
                                                        <Form.Select
                                                            field={'verticalUp'+index}
                                                            noLabel={true}
                                                            key={index}
                                                            style={{ width: '100%' }}
                                                            remote={true}
                                                            initValue={id}
                                                            defaultValue={id}
                                                            onChange={(selectValue) => {
                                                                verticalCategories.up[index] = selectValue as string
                                                                let selectedIds = Object.values(verticalCategories).flat().filter(id => id.length > 0)
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
                                                                    label: name,
                                                                    disabled: disabled
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
                                            <div className="selection-card">
                                                <div className="selection-card-title">{t('middle')}</div>
                                                {verticalCategories.middle.map((id, index) => {
                                                    return (<div className="delete-able-select-container">
                                                        <Form.Select
                                                            field={'verticalMiddle'+index}
                                                            noLabel={true}
                                                            style={{ width: '100%' }}
                                                            remote={true}
                                                            initValue={id}
                                                            defaultValue={id}
                                                            onChange={(selectValue) => {
                                                                verticalCategories.middle[index] = selectValue as string
                                                                let selectedIds = Object.values(verticalCategories).flat().filter(id => id.length > 0)
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
                                                                    label: name,
                                                                    disabled: disabled
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
                                            <div className="selection-card">
                                                <div className="selection-card-title">{t('down')}</div>
                                                {verticalCategories.down.map((id, index) => {
                                                    return (<div className="delete-able-select-container">
                                                        <Form.Select
                                                            field={'verticalDown'+index}
                                                            noLabel={true}
                                                            style={{ width: '100%' }}
                                                            remote={true}
                                                            initValue={id}
                                                            defaultValue={id}
                                                            onChange={(selectValue) => {
                                                                verticalCategories.down[index] = selectValue as string
                                                                let selectedIds = Object.values(verticalCategories).flat().filter(id => id.length > 0)
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
                                                                    label: name,
                                                                    disabled: disabled
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

                                        <Form.Select
                                            field="group"
                                            label={{ text: t('group') }}
                                            style={{ width: 300 }}
                                            remote={true}
                                            initValue={datasourceConfig.groupField}
                                            onChange={async (selectValue) => {
                                                datasourceConfig.groupField = selectValue as string;
                                                console.log(selectValue, 'gropu')
                                                let selectedIds = Object.values(datasourceConfig).filter(id => typeof id === 'string' && id.length > 0)
                                                fields.forEach(item => {
                                                    item.disabled = selectedIds.findIndex(id => id === item.id) !== -1;
                                                    console.log(item.disabled, item.id)
                                                })
                                                updateDatasourceConfig({...datasourceConfig})
                                                setFields([...fields])
                                            }}
                                            optionList={fields.map((item) => {
                                                const { id, name, disabled } = item as any;
                                                return {
                                                    value: id,
                                                    label: name,
                                                    disabled: disabled
                                                };
                                            })}
                                        />
                                    </div>
                                </Form>
                            </div>
                        </TabPane>



                        <TabPane tab={t('tab_name2')} itemKey="2">
                            <div
                                className="flex flex-col gap-[16px] overflow-y-scroll px-[20px] pb-[48px] pt-[20px]"
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

                                    <div className="selection-title">{t('horizontalAxisCategory')}</div>

                                    <div className="selection-card">
                                        <Form.Input field='HLeftValue' label={ t('left')} style={{ width: '100%' }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='HMiddleValue' label={ t('middle')} style={{ width: '100%' }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='HRightValue' label={ t('right')} style={{ width: '100%' }} placeholder={t('pleaseEnterText')}></Form.Input>
                                    </div>

                                    <div className="selection-title">{t('verticalAxisCategory')}</div>

                                    <div className="selection-card">
                                        <Form.Input field='VUpValue' label={ t('up')} style={{ width: '100%' }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='VMiddleValue' label={ t('middle')} style={{ width: '100%' }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='VDownValue' label={ t('down')} style={{ width: '100%' }} placeholder={t('pleaseEnterText')}></Form.Input>
                                    </div>

                                    <div className="selection-title">{t('cellTitle')}</div>
                                    <div className="selection-card">
                                        <Form.Input field='leftDownValue' label={ t('leftDown')} style={{ width: '100%' }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='middleDownValue' label={ t('middleDown')} style={{ width: '100%' }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='rightDownValue' label={ t('rightDown')} style={{ width: '100%' }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='leftMiddleValue' label={ t('leftMiddle')} style={{ width: '100%' }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='middleMiddleValue' label={ t('middleMiddle')} style={{ width: '100%' }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='rightMiddleValue' label={ t('rightMiddle')} style={{ width: '100%' }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='leftUpValue' label={ t('leftUp')} style={{ width: '100%' }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='middleUpValue' label={ t('middleUp')} style={{ width: '100%' }} placeholder={t('pleaseEnterText')}></Form.Input>
                                        <Form.Input field='rightUpValue' label={ t('rightUp')} style={{ width: '100%' }} placeholder={t('pleaseEnterText')}></Form.Input>
                                    </div>
                                </Form>
                            </div>
                        </TabPane>
                    </Tabs>
                }
            </div>
            <div className="relative h-[72px] w-[340px] bg-[--semi-color-bg-0]">
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
