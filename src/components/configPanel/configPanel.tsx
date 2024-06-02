import {
    dashboard,
    bridge,
    ThemeModeType,
    SourceType,
    IDataRange,
    FieldType,
    DashboardState,
} from '@lark-base-open/js-sdk';
import { useEffect, useRef } from 'react';
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
import {
    IconAlignLeft,
    IconAlignRight,
    IconAlignCenter,
    IconFont,
    IconChevronDown,
} from '@douyinfe/semi-icons';
import { useTypeConfigStore, useStyleConfigStore } from '../../store';
// import { ITableSource } from '../../App';
// import HorizontalLine from '@/assets/svg/horizontal-line.svg?react';
// import BoldIcon from '@/assets/svg/bold.svg?react';
// import ItalicIcon from '@/assets/svg/italic.svg?react';
// import UnderlineIcon from '@/assets/svg/underline.svg?react';
// import { useTranslation } from 'react-i18next';

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

export const ConfigPanel: React.FC<IConfigPanelPropsType> = (props) => {
    const { tableSource, dataRange, categories, getTableConfig } = props;


    // 类型与数据
    const { typeConfig, updateTypeConfig } = useTypeConfigStore((state) => state);

    const formApi = useRef<any>();

    // 样式配置数据
    const { styleConfig, updateStyleConfig } = useStyleConfigStore(
        (state) => state,
    );

    // 保存配置
    const saveConfig = () => {
        dashboard.saveConfig({
            dataConditions: [
                {
                    tableId: typeConfig.tableId,
                },
            ],
            customConfig: {
                typeConfig,
                styleConfig,
            },
        });
    };

    return (
        <div
            className="border-[rgba(31, 35, 41, 0.15)] dark:border-[rgba(207,207,207, 0.15)] relative flex h-screen w-[350px] flex-col border-l-[0.5px]  bg-[--semi-color-bg-0]"
            style={{
                borderTop:
                    dashboard.state === DashboardState.View ? 'none' : '0.5px solid ',
                borderColor:
                    typeConfig.theme === 'light'
                        ? 'rgba(207,207,207, 0.15)'
                        : 'rgba(31, 35, 41, 0.15)',
            }}
        >
            <div className="relative flex-1">
                {
                    <Tabs type="line">
                        <TabPane tab="数据设置" itemKey="1">
                            <div
                                className="overflow-y-scroll px-[20px] pb-[48px] pt-[20px]"
                                style={{
                                    height: `calc(100vh - 125px)`,
                                }}
                            >

                            </div>
                        </TabPane>
                        <TabPane tab="文本设置" itemKey="2">
                            <div
                                className="flex flex-col gap-[16px] overflow-y-scroll px-[20px] pb-[48px] pt-[20px]"
                                style={{
                                    height: `calc(100vh - 125px)`,
                                }}
                            >
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
