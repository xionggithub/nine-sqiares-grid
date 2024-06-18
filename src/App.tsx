import React, { useCallback, useEffect, useState } from 'react';
import { NineSquaresGrid } from "./components/nineSquaresGrid";
import { ConfigPanel } from "./components/configPanel";
import {base, dashboard, DashboardState, bitable, SourceType} from "@lark-base-open/js-sdk";
import { useDatasourceConfigStore, useDatasourceStore, useTextConfigStore } from './store';
import { TableDataGroupHelper, IDatasourceConfigCacheType } from "./utils/tableDataGroupHelper";
import Icon, {IconDeleteStroked, IconPlus} from '@douyinfe/semi-icons';
import IconLoading from './assets/icon_loading.svg?react';
import IconTable from "*.svg?react";

function App() {

    const { datasource, updateDatasource } = useDatasourceStore((state) => state);

    // 类型与数据
    const { datasourceConfig, updateDatasourceConfig } = useDatasourceConfigStore((state) => state);

    // 样式配置数据
    const { textConfig, updateTextConfig } = useTextConfigStore((state) => state);

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

    const [isLoading, setIsLoading] = useState(true)

    // 获取表格列表
    const getTableList = useCallback((tableIdList: any) => {
        return tableIdList.map(async (table: any) => {
            const name = await table.getName();
            return {
                tableName: name,
                tableId: table.id,
            };
        });
    }, []);

    const dataHelper = new TableDataGroupHelper()

    async function initConfigData(id: string | null) {
        console.log('-----------------------------------------------更新表格数据', id, dashboard.state);
        //LIGHT = "LIGHT", DARK = "DARK"
        const theme = await bitable.bridge.getTheme()
        if (theme === 'LIGHT') {
            datasource.theme = 'light'
        } else {
            datasource.theme = 'dark'
        }
        console.log(theme, '++++++++++++++++++')
        updateTheme(theme.toLocaleLowerCase())
        const tableIdList = await base.getTableList();
        // console.log('获取表 id 列表: ',tableIdList)
        const tableList = await Promise.all(getTableList(tableIdList));
        console.log('获取所有表: ',tableList);
        datasource.tables = [...tableList];
        const tableId = id ? id : tableList[0].tableId;
        datasource.tableId = tableId;
        datasourceConfig.tableId = tableId
        datasourceConfigCache.tableId = tableId
        const table = await base.getTable(tableId);
        console.log('获取当前选中的表',table)
        const fields = await table.getFieldMetaList()
        datasource.fields[tableId] = [...fields];
        // console.log('获取选中表的所有字段信息: ',datasource.fields);
        datasource.dataRanges[tableId] = (await dashboard.getTableDataRange(tableId)).map(item => ({
            type: item.type,
            viewId: item['viewId'],
            viewName:item['viewName']
        }))
        datasourceConfig.dataRange = 'All';
        console.log('获取表数据范围: ',datasource.dataRanges);
        // 如果不是创建面板，则根据 自定义配置组装数据
        if (dashboard.state !== DashboardState.Create) {
            await dataHelper.prepareData(tableId, datasource, datasourceConfigCache)
            updateDatasource({...(datasource as any)})
        }
        console.log('------------------------------------------------------数据已经准备好: ',datasource, new Date().toISOString())
        // 强制刷新
        setIsLoading(false)
    }

    function updateTheme(theme: string) {
        document.body.setAttribute('theme-mode', theme);
    }

    useEffect(() => {
        bitable.bridge.onThemeChange((event) => {
            console.log('theme change', event.data.theme);
            if (event.data.theme === 'LIGHT') {
                datasource.theme = 'light'
            } else {
                datasource.theme = 'dark'
            }
            updateTheme(event.data.theme.toLocaleLowerCase())
            updateDatasource({ ...(datasource as any) })
        });
        async function getConfig() {
            // 先获取保存的配置数据
            if (dashboard.state !== DashboardState.Create) {
                console.log('load config')
                dashboard.getConfig().then((config) => {
                    const customConfig: any = config.customConfig
                    console.log('获取到 config start========：', config, textConfig, datasourceConfig, {...datasourceConfig, ...customConfig.datasourceConfig});
                    updateDatasourceConfig({...datasourceConfig, ...customConfig.datasourceConfig})
                    updateTextConfig({...textConfig, ...customConfig.textConfig})
                    datasourceConfigCache = {...JSON.parse(JSON.stringify(customConfig.datasourceConfig))}
                    console.log('获取到 config end=====：', config, datasourceConfigCache);
                    initConfigData(customConfig.datasourceConfig.tableId).then();
                })
            } else {
                initConfigData(null).then();
            }
        }
        getConfig().then();
        dashboard.onConfigChange(getConfig);
        // 监控数据变化
        dashboard.onDataChange(getConfig);
    }, []);

    return isLoading ?
        (<div style={{ width: '100%', height: '100%', display: 'grid', alignItems: 'center', justifyItems: 'center' }}>
            <div style={{ width: 'max-content', height: 'max-content', display: 'flex', flexDirection: 'column', alignItems: 'center', rowGap: '10px', justifyItems: 'center' }}>
                <Icon svg={<IconLoading />} />
                <div style={{textAlign: 'center', fontSize: '16px'}}>加载中...</div>
            </div>
        </div>) :
        (<div>
            <div className="flex h-full">
                <NineSquaresGrid/>
                {dashboard.state === DashboardState.Create || dashboard.state === DashboardState.Config ? (
                    <ConfigPanel
                        tables={datasource.tables}
                        dataRanges={datasource.dataRanges[datasource.tableId]}
                    />
                ) : null}
            </div>
        </div>)
}

export default App
