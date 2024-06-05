import {
    dashboard,
    bridge,
    ThemeModeType,
    SourceType,
    IDataRange,
    FieldType,
    DashboardState,
} from '@lark-base-open/js-sdk';
import { useEffect, useRef, FC } from 'react';
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
    IconChevronDown,
    IconDelete,
    IconPlus
} from '@douyinfe/semi-icons';
import { useDatasourceConfigStore, useTextConfigStore } from '../../store';
// import { ITableSource } from '../../App';
// import HorizontalLine from '@/assets/svg/horizontal-line.svg?react';
// import BoldIcon from '@/assets/svg/bold.svg?react';
// import ItalicIcon from '@/assets/svg/italic.svg?react';
// import UnderlineIcon from '@/assets/svg/underline.svg?react';
import { useTranslation } from 'react-i18next';

import './index.css';

const textAlignIcons = {
    left: <IconAlignLeft />,
    center: <IconAlignCenter />,
    right: <IconAlignRight />,
};

interface IConfigPanelPropsType {
    dataRange: IDataRange[];
    categories: any[];
    getTableConfig: (id: string | null) => any;
}

export const ConfigPanel: FC<IConfigPanelPropsType> = (props) => {

    const { tableSource, dataRange, categories, getTableConfig } = props;

    const { t, i18n } = useTranslation();

    // 类型与数据
    const { datasourceConfig, updateDatasourceConfig } = useDatasourceConfigStore((state) => state);

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
        async function getConfig() {
            const config = await dashboard.getConfig();
            const { typeConfig: systemTypeConfig, textConfig } =
                config.customConfig as any;
            updateTextConfig(textConfig);
            getTableConfig(datasourceConfig.tableId);

            // 主题
            const theme = await bridge.getTheme();
            switchTheme(theme);
            const themeValue = theme === ThemeModeType.LIGHT ? 'dark' : 'light';
            const newConfigValue = { ...systemTypeConfig, theme: themeValue };
            updateDatasourceConfig(newConfigValue);
            // 语言
            const locale = await bridge.getLocale();
            i18n.changeLanguage(locale);
            console.log('i18n：：：：',i18n)
            if (!formApi.current) return;
            // 更新
            formApi.current.setValues(newConfigValue);
        }

        getConfig().then();
    }, []);

    useEffect(() => {
        // 初始化的时候
        if (datasourceConfig.tableId === '') {
            const initValues = {
                tableId: tableSource[0]?.tableId || '',
                rowRange: 'All',
                title: 'hidden',
                secTitle: 'hidden',
                backGround: 'hidden',
                rowLength: 3,
                theme: 'dark',
                personalOptions: [
                    { key: 'employees', type : 1 }
                ],
            };
            if (!formApi.current) return;
            // 更新
            formApi.current.setValues({ ...initValues });
        }
    }, [tableSource, datasourceConfig.tableId]);

    // 类型与数据表单更改
    const handleFormValueChange = (values: any) => {
        const newConfig = { ...datasourceConfig, ...values };
        updateDatasourceConfig({ ...newConfig });
    };

    // 样式数据更改
    const handleChangeStyleConfigData = (filedName: string, value: any) => {
        const newStyleConfigData = {
            ...textConfig,
            [filedName]: value,
        };
        updateTextConfig({ ...newStyleConfigData });
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
    const tTableSource = [{tableName: "数据表", tableId: '34243'}];
    const tDataRange = [{
        type: 0, viewName: '全部数据', viewId: '123'
    }];
    const personnelList = [
        { name: '员工', type: 1 }
    ];
    const horizontalAxisList = [
        { name: '能力', type: 1 }
    ]
    const verticalAxisList = [
        { name: '绩效', type: 1 }
    ]
    const groupDataList = [
        { name: '部门', type: 1 }
    ]

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
                                    initValues={{}}
                                    onValueChange={(values) => handleFormValueChange(values)}
                                    getFormApi={(api) => (formApi.current = api)}
                                    autoComplete="off"
                                >
                                    <Form.Select
                                        field="tableId"
                                        label={{ text: t('data_source') }}
                                        style={{ width: 300 }}
                                        onChange={async (selectValue) => {
                                            const { categories } = await getTableConfig(
                                                selectValue as string,
                                            );
                                            const textField = categories.filter(
                                                (item: any) => item.type === FieldType.Text,
                                            );

                                            const imageFile = categories.filter(
                                                (item: any) => item.type === FieldType.Attachment,
                                            );

                                            const { tableId, ...otherProperties } = datasourceConfig;
                                            console.log(tableId);

                                            // 更改表格的时候重置其他的默认数据
                                            const newConfig = {
                                                ...otherProperties,
                                                tableId: selectValue,
                                                rowRange: 'All',
                                                title: textField[0] ? textField[0].id : 'hidden',
                                                secTitle: textField[0] ? textField[0].id : 'hidden',
                                                backGround: imageFile[0] ? imageFile[0].id : 'hidden',
                                            };

                                            // updateTypeConfig({ ...typeConfig, ...newConfig });
                                            formApi.current.setValues({ ...newConfig });
                                            // return selectValue;
                                        }}
                                        optionList={tTableSource.map((source) => ({
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
                                        optionList={personnelList.map((item) => {
                                            console.log(item, datasourceConfig.allFields)
                                            const { type, name } = item as any;
                                            return {
                                                value: type,
                                                label: name,
                                            };
                                        })}
                                    />

                                    <div className="selection-title">{t('horizontalAxis')}</div>

                                    <div className="selection-card">
                                        <div className="selection-card-title">{t('chooseField')}</div>
                                        <Select
                                            style={{ width: '100%' }}
                                            remote={true}
                                            optionList={horizontalAxisList.map((item) => {
                                                console.log(item, datasourceConfig.horizontalLeftCategories)
                                                const { type, name } = item as any;
                                                return {
                                                    value: type,
                                                    label: name,
                                                };
                                            })}
                                        />
                                    </div>

                                    <div className="selection-list margin-top-tw margin-bottom-tw">
                                        <div className="selection-card">
                                            <div className="selection-card-title">{t('left')}</div>
                                            <div className="delete-able-select-container">
                                                <Select
                                                    style={{ width: '100%' }}
                                                    remote={true}
                                                    optionList={horizontalAxisList.map((item) => {
                                                        console.log(item, datasourceConfig.horizontalMiddleCategories)
                                                        const { type, name } = item as any;
                                                        return {
                                                            value: type,
                                                            label: name,
                                                        };
                                                    })}
                                                />
                                                <IconDelete />
                                            </div>
                                            <div className="flex-column">
                                                <IconPlus/>
                                                <div className="selection-card-bottom-text">{t('addCategory')}</div>
                                            </div>
                                        </div>
                                        <div className="selection-card">
                                            <div className="selection-card-title">{t('middle')}</div>
                                            <div className="delete-able-select-container">
                                                <Select
                                                    style={{ width: '100%' }}
                                                    remote={true}
                                                    optionList={horizontalAxisList.map((item) => {
                                                        console.log(item, datasourceConfig.horizontalMiddleCategories)
                                                        const { type, name } = item as any;
                                                        return {
                                                            value: type,
                                                            label: name,
                                                        };
                                                    })}
                                                />
                                                <IconDelete />
                                            </div>
                                            <div className="flex-column">
                                                <IconPlus/>
                                                <div className="selection-card-bottom-text">{t('addCategory')}</div>
                                            </div>
                                        </div>
                                        <div className="selection-card">
                                            <div className="selection-card-title">{t('right')}</div>
                                            <div className="delete-able-select-container">
                                                <Select
                                                    style={{ width: '100%' }}
                                                    remote={true}
                                                    optionList={horizontalAxisList.map((item) => {
                                                        console.log(item, datasourceConfig.horizontalMiddleCategories)
                                                        const { type, name } = item as any;
                                                        return {
                                                            value: type,
                                                            label: name,
                                                        };
                                                    })}
                                                />
                                                <IconDelete />
                                            </div>
                                            <div className="flex-column">
                                                <IconPlus/>
                                                <div className="selection-card-bottom-text">{t('addCategory')}</div>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="selection-title">{t('verticalAxis')}</div>

                                    <div className="selection-card">
                                        <div className="selection-card-title">{t('chooseField')}</div>
                                        <Select
                                            style={{ width: '100%' }}
                                            remote={true}
                                            optionList={verticalAxisList.map((item) => {
                                                console.log(item, datasourceConfig.horizontalMiddleCategories)
                                                const { type, name } = item as any;
                                                return {
                                                    value: type,
                                                    label: name,
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
                                                    optionList={horizontalAxisList.map((item) => {
                                                        console.log(item, datasourceConfig.horizontalMiddleCategories)
                                                        const { type, name } = item as any;
                                                        return {
                                                            value: type,
                                                            label: name,
                                                        };
                                                    })}
                                                />
                                                <IconDelete />
                                            </div>
                                            <div className="flex-column">
                                                <IconPlus/>
                                                <div className="selection-card-bottom-text">{t('addCategory')}</div>
                                            </div>
                                        </div>
                                        <div className="selection-card">
                                            <div className="selection-card-title">{t('middle')}</div>
                                            <div className="delete-able-select-container">
                                                <Select
                                                    style={{ width: '100%' }}
                                                    remote={true}
                                                    optionList={horizontalAxisList.map((item) => {
                                                        console.log(item, datasourceConfig.horizontalMiddleCategories)
                                                        const { type, name } = item as any;
                                                        return {
                                                            value: type,
                                                            label: name,
                                                        };
                                                    })}
                                                />
                                                <IconDelete />
                                            </div>
                                            <div className="flex-column">
                                                <IconPlus/>
                                                <div className="selection-card-bottom-text">{t('addCategory')}</div>
                                            </div>
                                        </div>
                                        <div className="selection-card">
                                            <div className="selection-card-title">{t('down')}</div>
                                            <div className="delete-able-select-container">
                                                <Select
                                                    style={{ width: '100%' }}
                                                    remote={true}
                                                    optionList={horizontalAxisList.map((item) => {
                                                        console.log(item, datasourceConfig.horizontalMiddleCategories)
                                                        const { type, name } = item as any;
                                                        return {
                                                            value: type,
                                                            label: name,
                                                        };
                                                    })}
                                                />
                                                <IconDelete />
                                            </div>
                                            <div className="flex-column">
                                                <IconPlus/>
                                                <div className="selection-card-bottom-text">{t('addCategory')}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <Form.Select
                                        field="group"
                                        label={{ text: t('group') }}
                                        style={{ width: 300 }}
                                        remote={true}
                                        optionList={groupDataList.map((item) => {
                                            console.log(item, datasourceConfig.allFields)
                                            const { type, name } = item as any;
                                            return {
                                                value: type,
                                                label: name,
                                            };
                                        })}
                                    />
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
                                    onValueChange={(values) => handleFormValueChange(values)}
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
