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
import {
    IconAlignLeft,
    IconAlignRight,
    IconAlignCenter,
    IconFont,
    IconChevronDown
} from '@douyinfe/semi-icons';
import { useDatasourceConfigStore, useTextConfigStore, useDatasourceStore } from '../../store';
import { flushSync } from "react-dom"

import deleteIcon from '../../assets/icon_delete-trash_outlined.svg';
import addIcon from '../../assets/icon_add_outlined.svg';
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


    const [tableId, setTableId] = useState('')
    const [fields, setFields] = useState([])
    const [verticalCategories, setVerticalCategories] = useState([])
    const [horizontalCategoryOptions, setHorizontalCategoryOptions] = useState([])

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
        flushSync(() => {
            setTableId(datasource.tableId)
        })
    }, []);

    useEffect(() => {

    }, []);

    // 类型与数据表单更改
    const handleDataSourceConfigFormValueChange = (values: any) => {
        console.log(values)
        const newConfig = { ...datasourceConfig, ...values };
        updateDatasourceConfig({ ...newConfig });
    };

    const handleTextConfigFormValueChange = (values: any) => {
        console.log(textConfig)
        const newConfig = { ...textConfig, ...values };
        updateTextConfig({ ...newConfig });
    };

    // 保存配置
    const saveConfig = () => {
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

    // test data
    const tDataRange = [{
        type: 0, viewName: '全部数据', viewId: '123'
    }];

    console.log(datasource.tableId, '--------------config panel----')

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
                                            defaultValue={tableId}
                                            onChange={async (selectValue) => {
                                                console.log(selectValue, 'selectvalue======')
                                                const tableId = selectValue as string;
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
                                                    datasourceConfig.personnel = ''
                                                    datasourceConfig.tableId = tableId
                                                }
                                                flushSync(() => {
                                                    datasource.fields[tableId] = [...fields.map(item => ({ ...item, disabled: false}))];
                                                    datasource.tableId = tableId
                                                    updateDatasource(datasource)
                                                    updateDatasourceConfig(datasourceConfig)
                                                    setTableId(tableId)
                                                    setFields(fields)
                                                })
                                                console.log(datasource.tableId, datasource.fields)
                                            }}
                                            optionList={datasource.tables.map((source) => ({
                                                value: source.tableId,
                                                label: source.tableName,
                                            }))}
                                        />

                                        <Form.Select
                                            field="rowRange"
                                            label={{ text: t('data_range') }}
                                            style={{ width: 300 }}
                                            remote={true}
                                            optionList={tDataRange.map((range) => {
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
                                            onChange={async (selectValue) => {
                                                datasourceConfig.personnel = selectValue as string;
                                                let selectedIds = Object.values(datasourceConfig).filter(id => typeof id === 'string' && id.length > 0)
                                                console.log(selectedIds)
                                                fields.forEach(item => {
                                                    item.disabled = selectedIds.findIndex(id => id === item.id) !== -1;
                                                    console.log(item.disabled, item.id)
                                                })
                                                flushSync(() => {
                                                    updateDatasourceConfig(datasourceConfig)
                                                    setFields(fields)
                                                })
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

                                        <div className="selection-title">{t('horizontalAxis')}</div>

                                        <div className="selection-card">
                                            <div className="selection-card-title">{t('chooseField')}</div>
                                            <Form.Select
                                                field="horizontalField"
                                                noLabel={true}
                                                style={{ width: '100%' }}
                                                remote={true}
                                                onChange={async (selectValue) => {
                                                    datasourceConfig.horizontalField = selectValue as string;
                                                    let selectedIds = Object.values(datasourceConfig).filter(id => typeof id === 'string' && id.length > 0)
                                                    fields.forEach(item => {
                                                        item.disabled = selectedIds.findIndex(id => id === item.id) !== -1;
                                                        console.log(item.disabled, item.id)
                                                    })
                                                    flushSync(() => {
                                                        console.log('horizontalField-----',datasource.fields[datasource.tableId])
                                                        updateDatasourceConfig(datasourceConfig)
                                                        setFields(fields)
                                                        let field = fields.find(item => item.id === datasourceConfig.horizontalField)
                                                        if (field) {
                                                            console.log('----field::', field)
                                                            let options = field.property.options.map(item => ({ ...item, disabled: false}))
                                                            setHorizontalCategoryOptions(options)
                                                        }
                                                    })
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

                                        <div className="selection-list">
                                            <div className="selection-card">
                                                <div className="selection-card-title">{t('left')}</div>
                                                <div className="delete-able-select-container">
                                                    <Select
                                                        style={{ width: '100%' }}
                                                        remote={true}
                                                        optionList={horizontalCategoryOptions.map((item) => {
                                                            const { id, name, disabled } = item as any;
                                                            return {
                                                                value: id,
                                                                label: name,
                                                                disabled: disabled
                                                            };
                                                        })}
                                                    />
                                                    <img src={deleteIcon} alt="" className="delete-icon"/>
                                                </div>
                                                <div className="flex-row">
                                                    <img src={addIcon} alt="" className="add-icon"/>
                                                    <div className="selection-card-bottom-text">{t('addCategory')}</div>
                                                </div>
                                            </div>
                                            <div className="selection-card">
                                                <div className="selection-card-title">{t('middle')}</div>
                                                <div className="delete-able-select-container">
                                                    <Select
                                                        style={{ width: '100%' }}
                                                        remote={true}
                                                        optionList={horizontalCategoryOptions.map((item) => {
                                                            const { id, name, disabled } = item as any;
                                                            return {
                                                                value: id,
                                                                label: name,
                                                                disabled: disabled
                                                            };
                                                        })}
                                                    />
                                                    <img src={deleteIcon} alt="" className="delete-icon"/>
                                                </div>
                                                <div className="flex-row">
                                                    <img src={addIcon} alt="" className="add-icon"/>
                                                    <div className="selection-card-bottom-text">{t('addCategory')}</div>
                                                </div>
                                            </div>
                                            <div className="selection-card">
                                                <div className="selection-card-title">{t('right')}</div>
                                                <div className="delete-able-select-container">
                                                    <Select
                                                        style={{ width: '100%' }}
                                                        remote={true}
                                                        optionList={horizontalCategoryOptions.map((item) => {
                                                            const { id, name, disabled } = item as any;
                                                            return {
                                                                value: id,
                                                                label: name,
                                                                disabled: disabled
                                                            };
                                                        })}
                                                    />
                                                    <img src={deleteIcon} alt="" className="delete-icon"/>
                                                </div>
                                                <div className="flex-row">
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
                                                onChange={async (selectValue) => {
                                                    datasourceConfig.verticalField = selectValue as string;
                                                    let selectedIds = Object.values(datasourceConfig).filter(id => typeof id === 'string' && id.length > 0)
                                                    fields.forEach(item => {
                                                        item.disabled = selectedIds.findIndex(id => id === item.id) !== -1;
                                                        console.log(item.disabled, item.id)
                                                    })
                                                    flushSync(() => {
                                                        updateDatasourceConfig(datasourceConfig)
                                                        setFields(fields)
                                                        let field = fields.find(item => item.id === datasourceConfig.verticalField)
                                                        if (field) {
                                                            console.log('----field::', field)
                                                            let options = field.property.options.map(item => ({ ...item, disabled: false}))
                                                            setVerticalCategories(options)
                                                        }
                                                    })
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

                                        <div className="selection-list margin-top-tw margin-bottom-tw">
                                            <div className="selection-card">
                                                <div className="selection-card-title">{t('up')}</div>
                                                <div className="delete-able-select-container">
                                                    <Select
                                                        style={{ width: '100%' }}
                                                        remote={true}
                                                        optionList={verticalCategories.map((item) => {
                                                            const { id, name, disabled } = item as any;
                                                            return {
                                                                value: id,
                                                                label: name,
                                                                disabled: disabled
                                                            };
                                                        })}
                                                    />
                                                    <img src={deleteIcon} alt="" className="delete-icon"/>
                                                </div>
                                                <div className="flex-row">
                                                    <img src={addIcon} alt="" className="add-icon"/>
                                                    <div className="selection-card-bottom-text">{t('addCategory')}</div>
                                                </div>
                                            </div>
                                            <div className="selection-card">
                                                <div className="selection-card-title">{t('middle')}</div>
                                                <div className="delete-able-select-container">
                                                    <Select
                                                        style={{ width: '100%' }}
                                                        remote={true}
                                                        optionList={verticalCategories.map((item) => {
                                                            const { id, name, disabled } = item as any;
                                                            return {
                                                                value: id,
                                                                label: name,
                                                                disabled: disabled
                                                            };
                                                        })}
                                                    />
                                                    <img src={deleteIcon} alt="" className="delete-icon"/>
                                                </div>
                                                <div className="flex-row">
                                                    <img src={addIcon} alt="" className="add-icon"/>
                                                    <div className="selection-card-bottom-text">{t('addCategory')}</div>
                                                </div>
                                            </div>
                                            <div className="selection-card">
                                                <div className="selection-card-title">{t('down')}</div>
                                                <div className="delete-able-select-container">
                                                    <Select
                                                        style={{ width: '100%' }}
                                                        remote={true}
                                                        optionList={verticalCategories.map((item) => {
                                                            const { id, name, disabled } = item as any;
                                                            return {
                                                                value: id,
                                                                label: name,
                                                                disabled: disabled
                                                            };
                                                        })}
                                                    />
                                                    <img src={deleteIcon} alt="" className="delete-icon"/>
                                                </div>
                                                <div className="flex-row">
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
                                            onChange={async (selectValue) => {
                                                datasourceConfig.group = selectValue as string;
                                                let selectedIds = Object.values(datasourceConfig).filter(id => typeof id === 'string' && id.length > 0)
                                                fields.forEach(item => {
                                                    item.disabled = selectedIds.findIndex(id => id === item.id) !== -1;
                                                    console.log(item.disabled, item.id)
                                                })
                                                flushSync(() => {
                                                    updateDatasourceConfig(datasourceConfig)
                                                    setFields(fields)
                                                })
                                            }}
                                            optionList={fields.map((item) => {
                                                // console.log(item, datasourceConfig.allFields)
                                                const { type, name, disabled } = item as any;
                                                return {
                                                    value: type,
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
                                    initValues={{}}
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
